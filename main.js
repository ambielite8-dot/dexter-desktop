const { app, BrowserWindow, ipcMain, WebContentsView, session } = require('electron');
const path = require('path');
const https = require('https');
const http = require('http');

let mainWindow;
let browserView;
let settings = {
  backendUrl: 'http://localhost:3001'
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

function httpRequest(options, payload) {
  return new Promise((resolve, reject) => {
    const protocol = options.hostname.includes('localhost') ? http : https;
    const req = protocol.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    if (payload) {
      req.write(JSON.stringify(payload));
    }
    req.end();
  });
}

async function sendContextToBackend() {
  if (!browserView || !browserView.webContents) return;

  const url = browserView.webContents.getURL();
  const title = browserView.webContents.getTitle();

  if (!url || url === 'about:blank') return;

  const payload = {
    url,
    title,
    mode: 'Vybe Mode',
    sessionId: 'dexter-session-' + Date.now(),
    timestamp: new Date().toISOString(),
    urlChanged: true
  };

  try {
    const urlObj = new URL(settings.backendUrl + '/context');
    const response = await httpRequest({
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: '/context',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, payload);

    if (response.cards && mainWindow) {
      mainWindow.webContents.send('recommendations', response.cards);
    }
  } catch (e) {
    console.error('Context request failed:', e.message);
  }
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
  const modeMap = { vybe: 'Vybe Mode', partner: 'Partner Mode', professor: 'Professor Mode' };
  const payload = {
    ...data,
    mode: modeMap[data.mode] || data.mode,
    sessionId: 'dexter-session-' + Date.now(),
    urlChanged: true
  };

  httpRequest({
    hostname: 'localhost',
    port: '3001',
    path: '/context',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, payload).then(response => {
    if (mainWindow) {
      mainWindow.webContents.send('recommendations', response.cards || []);
    }
  }).catch(e => {
    console.error('Send context failed:', e.message);
    if (mainWindow) {
      mainWindow.webContents.send('recommendations', []);
    }
  });
});

ipcMain.on('send-chat', (event, data) => {
  const payload = {
    message: data.message,
    mode: data.mode || 'Vybe Mode',
    sessionId: data.sessionId || 'dexter-session-' + Date.now()
  };

  httpRequest({
    hostname: 'localhost',
    port: '3001',
    path: '/chat',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, payload).then(response => {
    if (mainWindow) {
      mainWindow.webContents.send('chat-response', response);
    }
  }).catch(e => {
    console.error('Send chat failed:', e.message);
    if (mainWindow) {
      mainWindow.webContents.send('chat-response', { response: 'Sorry, I could not process that.' });
    }
  });
});

ipcMain.on('send-voice', (event, transcript, mode, callback) => {
  const payload = {
    transcript,
    mode: mode || 'Vybe Mode',
    sessionId: 'dexter-session-' + Date.now()
  };

  httpRequest({
    hostname: 'localhost',
    port: '3001',
    path: '/voice',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, payload).then(response => {
    if (mainWindow) {
      mainWindow.webContents.send('voice-response', response);
    }
    if (callback) callback(response);
  }).catch(e => {
    console.error('Send voice failed:', e.message);
    if (callback) callback({ response: 'Sorry, I could not process your voice input.' });
  });
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
