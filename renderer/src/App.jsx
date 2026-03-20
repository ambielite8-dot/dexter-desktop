import React, { useState, useEffect } from 'react';
import BrowserPanel from './components/BrowserPanel';
import DexterSidebar from './components/DexterSidebar';

export default function App() {
  const [browserUrl, setBrowserUrl] = useState('');
  const [browserTitle, setBrowserTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('vybe');
  const [cards, setCards] = useState([]);
  const [sessionInput, setSessionInput] = useState('');
  const [settings, setSettings] = useState({ backendUrl: 'http://localhost:3001/context' });
  const [permissionLevel, setPermissionLevel] = useState('verify');

  useEffect(() => {
    if (window.dexter) {
      window.dexter.getSettings().then(setSettings);
      
      window.dexter.onBrowserLoading((loading) => {
        setIsLoading(loading);
      });
      
      window.dexter.onBrowserUrlChanged((url) => {
        setBrowserUrl(url);
      });
      
      window.dexter.onBrowserTitleChanged((title) => {
        setBrowserTitle(title);
      });
      
      window.dexter.onRecommendations((newCards) => {
        setCards(newCards);
      });
    }
  }, []);

  const handleSendContext = () => {
    if (!window.dexter || !sessionInput.trim()) return;
    
    const data = {
      url: browserUrl || 'about:blank',
      title: browserTitle || 'New Tab',
      mode,
      sessionId: 'dexter-session-' + Date.now(),
      timestamp: new Date().toISOString(),
      message: sessionInput
    };
    
    window.dexter.sendContext(data);
    setSessionInput('');
  };

  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings);
    if (window.dexter) {
      window.dexter.updateSettings(newSettings);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black">
      <div className="w-[70%] h-full border-r border-dexter-purple">
        <BrowserPanel 
          url={browserUrl}
          title={browserTitle}
          isLoading={isLoading}
          onNavigate={(url) => window.dexter?.navigate(url)}
          onGoBack={() => window.dexter?.goBack()}
          onGoForward={() => window.dexter?.goForward()}
          onReload={() => window.dexter?.reload()}
        />
      </div>
      <div className="w-[30%] h-full">
        <DexterSidebar 
          mode={mode}
          setMode={setMode}
          cards={cards}
          setCards={setCards}
          sessionInput={sessionInput}
          setSessionInput={setSessionInput}
          onSendMessage={handleSendContext}
          settings={settings}
          onSettingsChange={handleSettingsChange}
          permissionLevel={permissionLevel}
          setPermissionLevel={setPermissionLevel}
        />
      </div>
    </div>
  );
}