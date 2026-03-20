import React, { useState } from 'react';

export default function BrowserPanel({ url, title, isLoading, onNavigate, onGoBack, onGoForward, onReload }) {
  const [addressBar, setAddressBar] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (addressBar.trim()) {
      onNavigate(addressBar);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="flex items-center gap-2 p-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-1">
          <button 
            onClick={onGoBack}
            className="p-2 hover:bg-gray-700 rounded transition-colors"
            title="Back"
          >
            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={onGoForward}
            className="p-2 hover:bg-gray-700 rounded transition-colors"
            title="Forward"
          >
            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button 
            onClick={onReload}
            className="p-2 hover:bg-gray-700 rounded transition-colors"
            title="Refresh"
          >
            <svg className={`w-4 h-4 text-gray-300 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1">
          <div className="relative">
            {isLoading && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-dexter-purple border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <input
              type="text"
              value={addressBar || url || ''}
              onChange={(e) => setAddressBar(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter URL..."
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-dexter-purple focus:outline-none"
            />
          </div>
        </form>
      </div>
      
      <div className="flex-1 bg-white relative">
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="text-gray-400 text-sm">Browser Panel</div>
            <div className="text-gray-500 text-xs mt-1">WebContentsView renders here</div>
          </div>
        </div>
      </div>
    </div>
  );
}