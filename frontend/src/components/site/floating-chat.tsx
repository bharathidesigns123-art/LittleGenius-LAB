'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat, type UseChatHelpers } from '@ai-sdk/react';
import { Bot, Send, X, Sparkles, MessageCircle } from 'lucide-react';

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { 
    messages, 
    append,
    status,
    error 
  } = useChat({
    api: '/api/chat',
    initialMessages: [],
    maxSteps: 5,
  }) as UseChatHelpers & { append: (message: { role: string; content: string }) => Promise<void>; status: string };

  const isLoading = status === 'streaming' || status === 'submitted';
  const safeInput = input || '';

  // Debugging logs to help identify state
  useEffect(() => {
    console.log('GeniusBot State:', { 
      input, 
      isLoading, 
      hasError: !!error 
    });
  }, [input, isLoading, error]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Extract text content from message parts
  const getMessageContent = (message: any) => {
    if (message.content) return message.content;
    if (message.parts) {
      return message.parts
        .filter((part: any) => part.type === 'text')
        .map((part: any) => part.text)
        .join('');
    }
    return '';
  };

  return (
    <div className="fixed bottom-10 right-6 z-[60] md:bottom-24">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-blue)] text-white shadow-lg transition hover:scale-105 active:scale-95"
        aria-label="Toggle chat assistant"
      >
        {isOpen ? <X size={28} /> : <Bot size={28} />}
        <span className="absolute -right-1 -top-1 flex h-5 w-5 animate-bounce items-center justify-center rounded-full bg-[var(--color-orange)] text-[10px] font-bold">
          <Sparkles size={12} />
        </span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-18 right-0 flex h-[500px] w-96 flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between bg-[var(--color-blue)] px-5 py-4 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                <Bot size={18} />
              </div>
              <div>
                <p className="text-sm font-bold">GeniusBot</p>
                <p className="text-[10px] opacity-70">LittleGenius LAB Assistant</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="opacity-70 hover:opacity-100">
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto bg-[var(--color-surface-1)] p-5 space-y-4 scroll-smooth"
          >
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-4 rounded-full bg-[var(--color-surface-2)] p-4 text-[var(--color-blue)]">
                  <MessageCircle size={32} />
                </div>
                <p className="text-sm font-bold text-[var(--color-blue)]">Welcome to LittleGenius LAB!</p>
                <p className="mt-2 text-xs text-[var(--color-ink-soft)] px-6 leading-relaxed">
                  I'm GeniusBot. How can I help you with our 3D printed toys today?
                </p>
              </div>
            )}
            
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-[1.2rem] px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    m.role === 'user'
                      ? 'bg-[var(--color-blue)] text-white rounded-tr-none'
                      : 'bg-white border border-[var(--color-border)] text-[var(--color-ink)] rounded-tl-none'
                  }`}
                >
                  {getMessageContent(m)}
                </div>
              </div>
            ))}
            
            {error && (
              <div className="flex justify-center">
                <div className="rounded-lg bg-red-50 px-4 py-2 text-xs text-red-600 border border-red-100">
                  {error.message || 'An error occurred with the AI service. Please try again.'}
                </div>
              </div>
            )}
            
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex justify-start">
                <div className="flex gap-1 rounded-full bg-gray-100 px-4 py-3">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"></span>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:0.2s]"></span>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <form 
            onSubmit={async (e) => {
              e.preventDefault();
              if (safeInput.trim() && !isLoading) {
                await append({
                  role: 'user',
                  content: safeInput,
                });
                setInput('');
              }
            }}
            className="border-t border-[var(--color-border)] bg-white p-4"
          >
            <div className="relative flex items-center">
              <input
                value={safeInput}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isLoading ? "Bot is thinking..." : "Ask about your orders or toys..."}
                disabled={isLoading}
                className="w-full rounded-full border border-[var(--color-border)] bg-[var(--color-surface-1)] py-2.5 pl-4 pr-12 text-sm focus:border-[var(--color-blue)] focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !safeInput.trim()}
                className="absolute right-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-blue)] text-white transition hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="mt-2 text-center text-[9px] text-[var(--color-ink-soft)] font-medium">
              Powered by Google Gemini 1.5 Flash
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
