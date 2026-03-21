const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('dexter', {
  navigate: (url) => ipcRenderer.send('navigate', url),
  goBack: () => ipcRenderer.send('go-back'),
  goForward: () => ipcRenderer.send('go-forward'),
  reload: () => ipcRenderer.send('reload'),
  
  getSettings: () => ipcRenderer.invoke('get-settings'),
  updateSettings: (settings) => ipcRenderer.send('update-settings', settings),
  sendContext: (data) => ipcRenderer.send('send-context', data),
  sendChat: (data) => ipcRenderer.send('send-chat', data),
  sendVoice: (transcript, mode, callback) => ipcRenderer.send('send-voice', transcript, mode, callback),
  
  onBrowserLoading: (callback) => {
    ipcRenderer.on('browser-loading', (event, isLoading) => callback(isLoading));
  },
  onBrowserUrlChanged: (callback) => {
    ipcRenderer.on('browser-url-changed', (event, url) => callback(url));
  },
  onBrowserTitleChanged: (callback) => {
    ipcRenderer.on('browser-title-changed', (event, title) => callback(title));
  },
  onRecommendations: (callback) => {
    ipcRenderer.on('recommendations', (event, cards) => callback(cards));
  },
  onChatResponse: (callback) => {
    ipcRenderer.on('chat-response', (event, response) => callback(response));
  },
  onVoiceResponse: (callback) => {
    ipcRenderer.on('voice-response', (event, response) => callback(response));
  }
});
