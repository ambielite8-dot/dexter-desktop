const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    title: 'Dexter',
    backgroundColor: '#0a0e17',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true
    },
    show: false
  });

  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.on('closed', () => { mainWindow = null; });

  createMenu();
}

function createMenu() {
  const template = [
    { label: 'File', submenu: [
      { label: 'New Session', accelerator: 'CmdOrCtrl+N', click: () => mainWindow.webContents.send('new-session') },
      { type: 'separator' },
      { label: 'Clear Browsing Data', click: () => mainWindow.webContents.send('clear-data') },
      { type: 'separator' },
      { role: 'quit' }
    ]},
    { label: 'Edit', submenu: [
      { role: 'undo' }, { role: 'redo' }, { type: 'separator' },
      { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' }
    ]},
    { label: 'View', submenu: [
      { label: 'Toggle Sidebar', accelerator: 'CmdOrCtrl+B', click: () => mainWindow.webContents.send('toggle-sidebar') },
      { type: 'separator' },
      { role: 'reload' }, { role: 'forceReload' }, { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' },
      { type: 'separator' }, { role: 'togglefullscreen' }
    ]},
    { label: 'Window', submenu: [{ role: 'minimize' }, { role: 'zoom' }, { role: 'close' }]},
    { label: 'Help', submenu: [
      { label: 'About Dexter', click: () => dialog.showMessageBox(mainWindow, {
        type: 'info', title: 'About Dexter', message: 'Dexter v1.0.0',
        detail: 'One Platform. Every Professional. Every Student. Every Goal.'
      })},
      { label: 'Documentation', click: () => require('electron').shell.openExternal('https://dexter.ai/docs') }
    ]}
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

ipcMain.on('navigate', (e, url) => mainWindow.webContents.send('load-url', url));
ipcMain.on('toggle-sidebar', () => mainWindow.webContents.send('toggle-sidebar'));
ipcMain.on('set-permission', (e, data) => mainWindow.webContents.send('permission-changed', data));

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
