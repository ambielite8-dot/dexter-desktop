const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('dexter', {
  navigate: (url) => ipcRenderer.send('navigate', url),
  toggleSidebar: () => ipcRenderer.send('toggle-sidebar'),
  setPermission: (data) => ipcRenderer.send('set-permission', data),
  onLoadUrl: (cb) => ipcRenderer.on('load-url', (e, url) => cb(url)),
  onToggleSidebar: (cb) => ipcRenderer.on('toggle-sidebar', () => cb()),
  onPermissionChanged: (cb) => ipcRenderer.on('permission-changed', (e, data) => cb(data)),
  onNewSession: (cb) => ipcRenderer.on('new-session', () => cb()),
  onClearData: (cb) => ipcRenderer.on('clear-data', () => cb())
});
