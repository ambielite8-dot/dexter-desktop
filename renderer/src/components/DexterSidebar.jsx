import React, { useState, useEffect } from 'react';

export default function DexterSidebar({ 
  mode, 
  setMode, 
  cards, 
  setCards, 
  sessionInput, 
  setSessionInput, 
  onSendMessage,
  settings,
  onSettingsChange,
  permissionLevel,
  setPermissionLevel
}) {
  const [showSettings, setShowSettings] = useState(false);
  const [settingsInput, setSettingsInput] = useState(settings.backendUrl);
  const [isListening, setIsListening] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [showChat, setShowChat] = useState(false);

  const handleSend = () => {
    if (sessionInput.trim()) {
      onSendMessage(sessionInput, setChatHistory);
      setSessionInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSessionInput(transcript);
      setIsListening(false);
      
      if (window.dexter && window.dexter.sendVoice) {
        window.dexter.sendVoice(transcript, mode, (response) => {
          if (response && response.response) {
            setChatHistory(prev => [...prev, { role: 'assistant', content: response.response }]);
            speakText(response.response);
          }
        });
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleApprove = (id) => {
    setCards(cards.filter(card => card.id !== id));
  };

  const handleDismiss = (id) => {
    setCards(cards.filter(card => card.id !== id));
  };

  const handleSettingsSave = () => {
    onSettingsChange({ backendUrl: settingsInput });
    setShowSettings(false);
  };

  const modes = [
    { id: 'vybe', label: 'Vybe Mode' },
    { id: 'partner', label: 'Partner Mode' },
    { id: 'professor', label: 'Professor Mode' }
  ];

  const permissionOptions = [
    { id: 'full', label: 'Full Auto' },
    { id: 'log', label: 'Auto with Log' },
    { id: 'verify', label: 'Verify First' }
  ];

  const getModeLabel = () => {
    const m = modes.find(m => m.id === mode);
    return m ? m.label : 'Vybe Mode';
  };

  return (
    <div className="flex flex-col h-full bg-black text-white font-inter">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="font-bebas text-3xl tracking-wider">
          <span className="text-white">D</span>
          <span className="text-dexter-purple">E</span>
          <span className="text-white">XTER</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowChat(!showChat)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            title="Chat History"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            title="Settings"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="p-4 border-b border-gray-800 bg-gray-900">
          <label className="block text-sm text-gray-400 mb-2">Backend URL</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={settingsInput}
              onChange={(e) => setSettingsInput(e.target.value)}
              placeholder="http://localhost:3001/context"
              className="flex-1 px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-dexter-purple focus:outline-none text-sm"
            />
            <button
              onClick={handleSettingsSave}
              className="px-4 py-2 bg-dexter-purple text-white rounded hover:bg-dexter-purple-light transition-colors text-sm font-medium"
            >
              Save
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-dexter-purple animate-pulse-purple'}`} />
          <span className="text-sm text-gray-400">{isListening ? 'Listening...' : 'Active'}</span>
        </div>
        <span className="text-xs text-dexter-purple">{getModeLabel()}</span>
      </div>

      <div className="p-4 border-b border-gray-800">
        <div className="flex gap-2">
          <textarea
            value={sessionInput}
            onChange={(e) => setSessionInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What are we doing today?"
            rows={3}
            className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-dexter-purple focus:outline-none resize-none"
          />
          <div className="flex flex-col gap-2">
            <button
              onClick={handleSend}
              className="p-3 bg-dexter-purple text-white rounded-lg hover:bg-dexter-purple-light transition-colors font-medium"
              title="Send Message"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
            <button
              onClick={startVoice}
              className={`p-3 rounded-lg transition-colors font-medium ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              title="Voice Input"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-gray-800">
        <div className="flex gap-2">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                mode === m.id 
                  ? 'bg-dexter-purple text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {showChat && chatHistory.length > 0 && (
        <div className="p-4 border-b border-gray-800 bg-gray-900 max-h-48 overflow-y-auto">
          <div className="font-bebas text-sm text-gray-400 mb-2">CHAT HISTORY</div>
          {chatHistory.map((msg, i) => (
            <div key={i} className={`text-sm mb-2 ${msg.role === 'user' ? 'text-dexter-purple' : 'text-gray-300'}`}>
              <span className="font-medium">{msg.role === 'user' ? 'You: ' : 'Dexter: '}</span>
              {msg.content}
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
        <div className="font-bebas text-xl text-white mb-4">RECOMMENDATIONS</div>
        
        {cards.length === 0 ? (
          <div className="text-gray-500 text-sm text-center py-8">
            No recommendations yet. The AI will provide suggestions based on your browsing activity.
          </div>
        ) : (
          <div className="space-y-3">
            {cards.map((card) => (
              <div key={card.id} className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="text-xs text-dexter-purple mb-1 uppercase">{card.type}</div>
                    <div className="text-sm text-white">{card.message}</div>
                    {card.action && (
                      <div className="mt-2 text-xs text-gray-400">{card.action}</div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleApprove(card.id)}
                    className="flex-1 py-1.5 bg-dexter-purple text-white rounded text-sm font-medium hover:bg-dexter-purple-light transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleDismiss(card.id)}
                    className="flex-1 py-1.5 bg-gray-700 text-gray-300 rounded text-sm font-medium hover:bg-gray-600 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-800">
        <div className="text-xs text-gray-500 mb-2">PERMISSION LEVEL</div>
        <div className="flex gap-2">
          {permissionOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setPermissionLevel(opt.id)}
              className={`flex-1 py-2 rounded text-xs font-medium transition-colors ${
                permissionLevel === opt.id
                  ? 'bg-dexter-purple text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
