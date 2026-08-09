import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatDrawer({ isOpen, onClose, messages, onSendMessage, currentUser, teams }) {
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text.trim());
    setText('');
  };

  const getTeamColor = (teamId) => {
    const t = teams?.find(team => team.id === teamId);
    return t ? t.color : '#FF6B00';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-slate-950 border-l border-white/10 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
              <div className="flex items-center gap-2">
                <span className="text-xl">💬</span>
                <h3 className="font-bebas text-2xl tracking-wider text-white">AUCTION CHAT ROOM</h3>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages && messages.length > 0 ? (
                messages.map((msg, i) => {
                  const isSelf = msg.teamId === currentUser?.teamId || (msg.role === 'admin' && currentUser?.role === 'admin');
                  const teamObj = teams?.find(t => t.id === msg.teamId);
                  return (
                    <div
                      key={i}
                      className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-2 text-xs text-white/50 mb-1 font-rajdhani">
                        <span
                          className="font-bold px-2 py-0.5 rounded text-white text-[10px]"
                          style={{ backgroundColor: msg.role === 'admin' ? '#FFD700' : getTeamColor(msg.teamId), color: msg.role === 'admin' ? '#000' : '#fff' }}
                        >
                          {msg.role === 'admin' ? 'AUCTIONEER' : msg.teamId || 'TEAM'}
                        </span>
                        <span>{msg.senderName}</span>
                        <span>•</span>
                        <span>{new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div
                        className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm font-rajdhani ${
                          isSelf
                            ? 'bg-ipl-gold/20 text-white border border-ipl-gold/30 rounded-tr-none'
                            : 'bg-white/10 text-white/90 border border-white/5 rounded-tl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-white/30 font-rajdhani">
                  <span className="text-4xl mb-2">💬</span>
                  <p>No chat messages yet. Start the conversation!</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-black/40 flex gap-2">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-white font-rajdhani placeholder-white/30 focus:outline-none focus:border-ipl-gold"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-ipl-gold to-ipl-orange text-black font-bebas px-5 py-2.5 rounded-xl text-lg hover:opacity-90 transition-all cursor-pointer"
              >
                SEND
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
