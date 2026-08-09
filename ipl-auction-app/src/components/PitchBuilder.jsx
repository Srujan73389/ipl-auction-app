import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const POSITIONS = [
  { id: 'op1', title: 'Opener 1 🏏', roleReq: 'Batsman' },
  { id: 'op2', title: 'Opener 2 🏏', roleReq: 'Batsman' },
  { id: 'mo1', title: 'No. 3 Batter 🏏', roleReq: 'Batsman' },
  { id: 'wk',  title: 'Wicketkeeper 🧤', roleReq: 'Wicketkeeper' },
  { id: 'mo2', title: 'Finisher 💥', roleReq: 'Batsman' },
  { id: 'ar1', title: 'All-Rounder 1 ⚡', roleReq: 'All-Rounder' },
  { id: 'ar2', title: 'All-Rounder 2 ⚡', roleReq: 'All-Rounder' },
  { id: 'sp1', title: 'Spinner 🎯', roleReq: 'Bowler' },
  { id: 'p1',  title: 'Pace Bowler 1 ⚾', roleReq: 'Bowler' },
  { id: 'p2',  title: 'Pace Bowler 2 ⚾', roleReq: 'Bowler' },
  { id: 'p3',  title: 'Death Bowler ⚾', roleReq: 'Bowler' },
];

export default function PitchBuilder({ isOpen, onClose, teamSquad, teamName, teamEmoji }) {
  if (!isOpen) return null;

  const squad = teamSquad || [];
  const [playingXI, setPlayingXI] = useState({});

  const handleSelectSlot = (posId, playerId) => {
    if (!playerId) {
      const next = { ...playingXI };
      delete next[posId];
      setPlayingXI(next);
      return;
    }
    const selectedPlayer = squad.find(p => p.id === parseInt(playerId));
    if (selectedPlayer) {
      setPlayingXI({ ...playingXI, [posId]: selectedPlayer });
    }
  };

  // Calculate Team Power Score
  const selectedList = Object.values(playingXI);
  const selectedCount = selectedList.length;

  let totalScore = 0;
  let overseasCountInXI = 0;

  selectedList.forEach(p => {
    if (p.grade === 'LEGEND') totalScore += 98;
    else if (p.grade === 'A+') totalScore += 92;
    else if (p.grade === 'A') totalScore += 85;
    else if (p.grade === 'B+') totalScore += 78;
    else totalScore += 72;

    if (p.country && !p.country.includes('India')) {
      overseasCountInXI++;
    }
  });

  let powerScore = selectedCount > 0 ? Math.round(totalScore / selectedCount) : 0;
  if (selectedCount === 11) {
    powerScore += 5; // Complete XI bonus
  }
  if (overseasCountInXI > 4) {
    powerScore -= 10; // Overseas limit penalty
  }
  powerScore = Math.min(100, Math.max(0, powerScore));

  const getPowerGrade = (score) => {
    if (score >= 90) return { label: 'CHAMPIONS LEVEL', color: 'text-amber-400' };
    if (score >= 80) return { label: 'PLAYOFF CONTENDER', color: 'text-emerald-400' };
    if (score >= 70) return { label: 'BALANCED SQUAD', color: 'text-cyan-400' };
    return { label: 'BUILDING SQUAD', color: 'text-white/60' };
  };

  const powerInfo = getPowerGrade(powerScore);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          className="relative max-w-4xl w-full glass-card p-6 border-2 border-ipl-gold/40 shadow-2xl rounded-3xl max-h-[92vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{teamEmoji || '🏏'}</span>
              <div>
                <h3 className="font-bebas text-3xl tracking-wider text-white">PLAYING XI PITCH BUILDER</h3>
                <p className="text-white/40 text-xs font-rajdhani">{teamName || 'FRANCHISE'} BEST FORMATION & POWER RATING</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Power Score Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 p-4 rounded-2xl border border-emerald-500/30">
            <div className="text-center md:text-left">
              <div className="text-white/40 text-xs font-rajdhani">TEAM POWER SCORE</div>
              <div className="font-bebas text-4xl text-ipl-gold font-bold">{powerScore} / 100</div>
            </div>
            <div className="text-center flex flex-col justify-center">
              <div className="text-white/40 text-xs font-rajdhani">STATUS</div>
              <div className={`font-bebas text-2xl font-bold ${powerInfo.color}`}>{powerInfo.label}</div>
            </div>
            <div className="text-center md:text-right">
              <div className="text-white/40 text-xs font-rajdhani">OVERSEAS IN XI</div>
              <div className={`font-bebas text-3xl ${overseasCountInXI > 4 ? 'text-red-400 font-bold' : 'text-emerald-400'}`}>
                ✈️ {overseasCountInXI} / 4 (Max 4)
              </div>
            </div>
          </div>

          {/* Pitch Field Layout */}
          <div className="relative rounded-3xl p-6 mb-6 overflow-hidden border-4 border-emerald-600/50 shadow-2xl"
               style={{ background: 'radial-gradient(ellipse at center, #15803d 0%, #064e3b 70%, #022c22 100%)' }}>
            
            {/* Pitch Strip Graphic */}
            <div className="absolute inset-x-1/3 top-4 bottom-4 bg-amber-200/20 border-x-2 border-amber-300/30 rounded-lg pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {POSITIONS.map((pos) => {
                const assignedPlayer = playingXI[pos.id];
                return (
                  <div key={pos.id} className="bg-black/50 backdrop-blur-md p-3 rounded-xl border border-white/10 flex flex-col gap-1.5">
                    <div className="text-ipl-gold text-xs font-bold font-rajdhani">{pos.title}</div>
                    <select
                      value={assignedPlayer ? assignedPlayer.id : ''}
                      onChange={(e) => handleSelectSlot(pos.id, e.target.value)}
                      className="bg-white/10 text-white font-rajdhani text-xs rounded-lg p-2 border border-white/20 focus:outline-none focus:border-ipl-gold"
                    >
                      <option value="" className="bg-slate-900 text-white">-- Select Player --</option>
                      {squad.map((p) => {
                        const isSelectedElsewhere = Object.entries(playingXI).some(([k, v]) => k !== pos.id && v.id === p.id);
                        return (
                          <option
                            key={p.id}
                            value={p.id}
                            disabled={isSelectedElsewhere}
                            className="bg-slate-900 text-white"
                          >
                            {p.name} ({p.role} • {p.grade}) {p.country && !p.country.includes('India') ? '✈️' : ''}
                          </option>
                        );
                      })}
                    </select>

                    {assignedPlayer && (
                      <div className="flex items-center justify-between text-[11px] text-white/80 mt-0.5">
                        <span className="font-bold text-emerald-300">{assignedPlayer.grade} Grade</span>
                        <span className="text-ipl-gold font-bebas text-sm">₹{assignedPlayer.price || assignedPlayer.basePrice} Cr</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center border-t border-white/10 pt-4">
            <div className="text-white/50 text-xs font-rajdhani">
              {selectedCount} of 11 positions selected in Playing XI
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setPlayingXI({})}
                className="bg-white/10 hover:bg-white/20 text-white font-bebas px-4 py-2 rounded-xl text-base cursor-pointer"
              >
                RESET XI
              </button>
              <button
                onClick={onClose}
                className="bg-gradient-to-r from-ipl-gold to-ipl-orange text-black font-bebas px-6 py-2 rounded-xl text-lg font-bold shadow-lg cursor-pointer"
              >
                SAVE PLAYING XI
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
