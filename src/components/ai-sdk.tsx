'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState } from 'react';

export default function AiChat() {
  const [open, setOpen] = useState(false);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/ai/chat', // Your route
    }),
  });

  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && status === 'ready') {
      sendMessage({ text: input });
      setInput('');
    }
  };

  const clearMessages = () => {
    // Note: In v3, you need to use the transport or reset manually
    // For simplicity, we'll just close the chat
    setOpen(false);
  };

  return (
    <>
      {/* Floating AI Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-indigo-600 text-white w-14 h-14 rounded-full shadow-lg hover:bg-indigo-700 flex items-center justify-center text-2xl font-bold z-50 transition-all duration-200"
        aria-label="Toggle AI Chat"
      >
        AI
      </button>

      {/* Chat Overlay Drawer */}
      {open && (
        <div className="fixed bottom-20 right-6 w-96 h-96 bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200 animate-in slide-in-from-bottom-2 duration-300">
          
          {/* Header */}
          <div className="p-3 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
            <h3 className="font-semibold text-sm text-gray-800">AI Assistant</h3>
            <div className="flex gap-2">
              <button
                onClick={clearMessages}
                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-700 px-2 py-1 rounded transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 text-sm mt-8">
                <div className="mb-2">👋</div>
                <p>Say hello to get started!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg text-sm whitespace-pre-wrap ${
                      message.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-sm'
                        : 'bg-white text-gray-900 rounded-bl-sm shadow-sm border'
                    }`}
                  >
                    {message.parts.map((part, index) =>
                      part.type === 'text' ? (
                        <span key={index}>{part.text}</span>
                      ) : null,
                    )}
                  </div>
                </div>
              ))
            )}

            {/* Loading Indicator */}
            {status === 'streaming' && (
              <div className="flex justify-start">
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm border animate-pulse">
                  <span className="text-gray-500 text-sm">AI is typing</span>
                  <span className="animate-pulse ml-1">…</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSubmit}
            className="p-3 border-t bg-white rounded-b-lg flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={status !== 'ready'}
              placeholder="Ask me anything..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={status !== 'ready' || !input.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {status === 'streaming' ? (
                <>
                  <span className="animate-pulse">…</span>
                  <span>Stop</span>
                </>
              ) : (
                'Send'
              )}
            </button>
          </form>
        </div>
      )}
    </>
  );
}