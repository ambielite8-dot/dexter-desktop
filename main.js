const { app, BrowserWindow, ipcMain, WebContentsView, session } = require('electron');
const path = require('path');

let mainWindow;
let browserView;
let settings = {
  backendUrl: 'http://localhost:3001/context'
};

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1400,
    minHeight: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    frame: true,
    backgroundColor: '#000000'
  });

  mainWindow.setMenuBarVisibility(false);

  const sidebarWidth = 420;
  const windowWidth = mainWindow.getBounds().width;
  const windowHeight = mainWindow.getBounds().height;

  browserView = new WebContentsView();
  browserView.setAutoResize({ width: true, height: true });
  
  const browserWebContents = browserView.webContents;
  
  const sessionPart = session.fromPartition('persist:dexter-browser');
  browserWebContents.session = sessionPart;

  browserWebContents.on('did-start-loading', () => {
    mainWindow.webContents.send('browser-loading', true);
  });
  
  browserWebContents.on('did-stop-loading', () => {
    mainWindow.webContents.send('browser-loading', false);
  });

  browserWebContents.on('did-navigate', (event, url) => {
    mainWindow.webContents.send('browser-url-changed', url);
  });

  browserWebContents.on('page-title-updated', (event, title) => {
    mainWindow.webContents.send('browser-title-changed', title);
  });

  mainWindow.contentView.addChildView(browserView);
  mainWindow.contentView.addChildView(mainWindow.webContents);

  browserView.setBounds({ x: 0, y: 0, width: windowWidth - sidebarWidth, height: windowHeight });
  mainWindow.webContents.setBounds({ x: windowWidth - sidebarWidth, y: 0, width: sidebarWidth, height: windowHeight });

  browserWebContents.loadURL('https://www.google.com');

  mainWindow.on('resized', () => {
    const bounds = mainWindow.getBounds();
    browserView.setBounds({ x: 0, y: 0, width: bounds.width - sidebarWidth, height: bounds.height });
    mainWindow.webContents.setBounds({ x: bounds.width - sidebarWidth, y: 0, width: sidebarWidth, height: bounds.height });
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'dist', 'index.html'));

  setInterval(() => {
    sendContextToBackend();
  }, 10000);
}

function sendContextToBackend() {
  if (!browserView || !browserView.webContents) return;

  const url = browserView.webContents.getURL();
  const title = browserView.webContents.getTitle();

  if (!url || url === 'about:blank') return;

  const payload = {
    url,
    title,
    mode: 'vybe',
    sessionId: 'dexter-session-' + Date.now(),
    timestamp: new Date().toISOString()
  };

  const http = require('http');
  const urlObj = new URL(settings.backendUrl);
  
  const req = http.request({
    hostname: urlObj.hostname,
    port: urlObj.port,
    path: urlObj.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        if (response.cards && mainWindow) {
          mainWindow.webContents.send('recommendations', response.cards);
        }
      } catch (e) {}
    });
  });

  req.on('error', () => {});
  req.write(JSON.stringify(payload));
  req.end();
}

ipcMain.on('navigate', (event, url) => {
  if (browserView && browserView.webContents) {
    const parsedUrl = url.startsWith('http') ? url : 'https://' + url;
    browserView.webContents.loadURL(parsedUrl);
  }
});

ipcMain.on('go-back', () => {
  if (browserView && browserView.webContents && browserView.webContents.canGoBack()) {
    browserView.webContents.goBack();
  }
});

ipcMain.on('go-forward', () => {
  if (browserView && browserView.webContents && browserView.webContents.canGoForward()) {
    browserView.webContents.goForward();
  }
});

ipcMain.on('reload', () => {
  if (browserView && browserView.webContents) {
    browserView.webContents.reload();
  }
});

ipcMain.handle('get-settings', () => {
  return settings;
});

ipcMain.on('update-settings', (event, newSettings) => {
  settings = { ...settings, ...newSettings };
});

ipcMain.on('send-context', (event, data) => {
  const http = require('http');
  const urlObj = new URL(settings.backendUrl);
  
  const req = http.request({
    hostname: urlObj.hostname,
    port: urlObj.port,
    path: urlObj.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }, (res) => {
    let responseData = '';
    res.on('data', chunk => responseData += chunk);
    res.on('end', () => {
      try {
        const response = JSON.parse(responseData);
        mainWindow.webContents.send('recommendations', response.cards || []);
      } catch (e) {
        mainWindow.webContents.send('recommendations', []);
      }
    });
  });

  req.on('error', () => {
    mainWindow.webContents.send('recommendations', []);
  });
  
  req.write(JSON.stringify(data));
  req.end();
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});