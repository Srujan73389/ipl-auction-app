import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function QrLoginModal({ isOpen, onClose, teams }) {
  if (!isOpen) return null;

  const [selectedTeam, setSelectedTeam] = useState('MI');
  const [copied, setCopied] = useState(false);

  const team = teams?.find(t => t.id === selectedTeam) || teams?.[0];
  const loginUrl = `${window.location.origin}/?team=${selectedTeam}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(loginUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          className="relative max-w-md w-full glass-card p-6 border-2 border-ipl-gold/40 shadow-2xl rounded-3xl text-center"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📱</span>
              <h3 className="font-bebas text-2xl tracking-wider text-white">MOBILE INSTANT QR LOGIN</h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Team selector */}
          <div className="mb-4">
            <label className="block text-white/50 text-xs font-rajdhani mb-1">SELECT FRANCHISE</label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full bg-white/10 text-white font-bebas text-lg rounded-xl p-2.5 border border-white/20 focus:outline-none focus:border-ipl-gold"
            >
              {teams?.map(t => (
                <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                  {t.emoji} {t.name} ({t.id})
                </option>
              ))}
            </select>
          </div>

          {/* SVG QR Code Graphic */}
          <div className="bg-white p-4 rounded-2xl inline-block my-2 border-4 border-ipl-gold shadow-xl">
            <svg width="180" height="180" viewBox="0 0 100 100" className="mx-auto">
              <path d="M0,0 h100 v100 h-100 z" fill="#ffffff" />
              {/* Corner Position Boxes */}
              <rect x="5" y="5" width="25" height="25" fill="#000000" />
              <rect x="8" y="8" width="19" height="19" fill="#ffffff" />
              <rect x="12" y="12" width="11" height="11" fill="#000000" />

              <rect x="70" y="5" width="25" height="25" fill="#000000" />
              <rect x="73" y="8" width="19" height="19" fill="#ffffff" />
              <rect x="77" y="12" width="11" height="11" fill="#000000" />

              <rect x="5" y="70" width="25" height="25" fill="#000000" />
              <rect x="8" y="73" width="19" height="19" fill="#ffffff" />
              <rect x="12" y="77" width="11" height="11" fill="#000000" />

              {/* Matrix Data Pattern */}
              <rect x="35" y="10" width="8" height="8" fill="#000" />
              <rect x="50" y="10" width="8" height="8" fill="#000" />
              <rect x="10" y="38" width="8" height="8" fill="#000" />
              <rect x="25" y="38" width="8" height="8" fill="#000" />
              <rect x="40" y="38" width="16" height="8" fill="#000" />
              <rect x="65" y="38" width="8" height="8" fill="#000" />
              <rect x="80" y="38" width="12" height="8" fill="#000" />
              <rect x="38" y="52" width="8" height="8" fill="#000" />
              <rect x="52" y="52" width="12" height="8" fill="#000" />
              <rect x="70" y="52" width="8" height="8" fill="#000" />
              <rect x="38" y="70" width="8" height="16" fill="#000" />
              <rect x="52" y="70" width="16" height="8" fill="#000" />
              <rect x="75" y="75" width="15" height="15" fill="#000" />
            </svg>
          </div>

          <div className="text-white/70 text-xs font-rajdhani my-2">
            Scan with phone camera to join as <strong className="text-ipl-gold">{team?.name}</strong>
          </div>

          <div className="flex justify-center gap-2 mt-4">
            <button
              onClick={handleCopy}
              className="bg-white/10 hover:bg-white/20 text-white font-bebas px-4 py-2 rounded-xl text-base transition-all cursor-pointer"
            >
              {copied ? '✓ COPIED!' : '📋 COPY LOGIN LINK'}
            </button>
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-ipl-gold to-ipl-orange text-black font-bebas px-5 py-2 rounded-xl text-base font-bold cursor-pointer"
            >
              DONE
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
