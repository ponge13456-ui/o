
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { dataService } from '../services/dataService';
import { ChatMessage, TargetPage } from '../types';

interface CommentSectionProps {
  videoId: string; // Used for identifying room page
}

const CommentSection: React.FC<CommentSectionProps> = ({ videoId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Derive page from room ID (backward compatibility mapping)
  let page: TargetPage = "home";
  if (videoId === 'customer-general') page = "customer";
  if (videoId === 'influencer-hub') page = "influencer";
  if (videoId === 'seller-hub') page = "seller";

  const loadMessages = useCallback(async () => {
    const data = await dataService.getChatForPage(page);
    setMessages(data);
  }, [page]);

  useEffect(() => {
    loadMessages();
    window.addEventListener('eagle_chat_updated', loadMessages);
    return () => window.removeEventListener('eagle_chat_updated', loadMessages);
  }, [loadMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const storedPhone = localStorage.getItem('eagle_user_phone');
    if (!storedPhone || !text.trim()) {
      if (!storedPhone) alert("Please link your identity (Spin the wheel first) to join the chat.");
      return;
    }

    setLoading(true);
    try {
      const profile = await dataService.getProfile(storedPhone);
      if (profile.user) {
        await dataService.sendUserMessage(page, { 
          username: profile.user.username, 
          phone: storedPhone, 
          text: text.trim() 
        });
        setText('');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-20 eagle-card p-0 shadow-2xl max-w-4xl mx-auto flex flex-col h-[600px]">
      <div className="p-6 border-b border-white/5 bg-[#0a0e1a] flex justify-between items-center">
        <div>
          <h3 className="text-xl font-black text-white uppercase tracking-tighter">Eagle Live Box</h3>
          <p className="text-[var(--text-muted)] text-[9px] font-black uppercase tracking-[0.2em] mt-1">Global Node Feed / Nagpur Hub</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse"></div>
          <span className="text-[9px] font-bold uppercase text-[var(--text-muted)] tracking-widest">Connected</span>
        </div>
      </div>
      
      {/* Chat History */}
      <div 
        ref={scrollRef}
        className="flex-grow overflow-y-auto p-6 space-y-4 scroll-smooth"
      >
        {messages.map((m) => {
          const isAdmin = m.userType === 'admin';
          return (
            <div 
              key={m.id} 
              className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-1`}
            >
              <div className={`flex items-center gap-2 mb-1 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                <span className={`text-[9px] font-black uppercase tracking-widest ${isAdmin ? 'gold-text' : 'text-[var(--text-muted)]'}`}>
                  {isAdmin ? 'Eagle Admin' : m.username}
                </span>
                <span className="text-[8px] text-white/20 font-bold">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className={`max-w-[80%] px-5 py-3 rounded-2xl text-sm leading-relaxed ${
                isAdmin 
                ? 'bg-[var(--primary-gold)] text-[var(--bg-main)] font-bold rounded-tr-none shadow-lg' 
                : 'bg-[#12172b] text-white border border-white/5 rounded-tl-none'
              }`}>
                {m.text}
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-30">
            <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Initialize conversation node...</p>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/5 bg-[#0a0e1a]">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Broadcast insight to hub..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-grow text-sm py-3 px-5"
          />
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="btn-primary px-8 flex items-center gap-2"
          >
            {loading ? 'SENDING...' : 'SEND'}
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/></svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentSection;
