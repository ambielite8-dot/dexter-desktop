import React, { useState } from 'react';

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

  const handleSend = () => {
    if (sessionInput.trim()) {
      onSendMessage();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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

  return (
    <div className="flex flex-col h-full bg-black text-white font-inter">
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="font-bebas text-3xl tracking-wider">
          <span className="text-white">D</span>
          <span className="text-dexter-purple">E</span>
          <span className="text-white">XTER</span>
        </div>
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

      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800">
        <div className="w-2 h-2 rounded-full bg-dexter-purple animate-pulse-purple" />
        <span className="text-sm text-gray-400">Active</span>
      </div>

      <div className="p-4 border-b border-gray-800">
        <textarea
          value={sessionInput}
          onChange={(e) => setSessionInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What are we doing today?"
          rows={3}
          className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg border border-gray-700 focus:border-dexter-purple focus:outline-none resize-none"
        />
        <button
          onClick={handleSend}
          className="mt-2 w-full py-2 bg-dexter-purple text-white rounded-lg hover:bg-dexter-purple-light transition-colors font-medium"
        >
          Send
        </button>
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