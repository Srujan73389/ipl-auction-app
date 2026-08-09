import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuction } from '../context/AuctionContext.jsx';
import { TEAMS, getTeam } from '../data/index.js';
import { soundService } from '../services/sound.js';
import ReactConfetti from 'react-confetti';
import BiddingWarClash from '../components/BiddingWarClash.jsx';

import { socket } from '../services/socket';

const fmt = (cr) => {
  if (!cr && cr !== 0) return '—';
  if (cr >= 1) return `₹${cr.toFixed(2)} Cr`;
  return `₹${(cr * 100).toFixed(0)} L`;
};

export default function SpectatorView() {
  const { state } = useAuction();
  const [muted, setMuted] = useState(soundService.isMuted());

  useEffect(() => {
    if (!socket.connected) {
      console.log('📡 Connecting Spectator Mode socket...');
      socket.connect();
    }
  }, []);

  const toggleSound = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    soundService.setMuted(nextMuted);
  };

  const currentPlayer = state.currentPlayer;
  const status = state.auctionStatus;
  const timer = state.timer;
  const currentPrice = state.currentPrice;
  const leadingTeam = state.leadingTeam;
  const leadingTeamObj = getTeam(leadingTeam);

  return (
    <div className="pitch-bg min-h-screen text-white font-rajdhani flex flex-col justify-between overflow-hidden relative select-none">
      {status === 'sold' && <ReactConfetti numberOfPieces={250} recycle={false} />}

      {/* TOP TV BROADCAST TICKER */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 border-b border-ipl-gold/40 py-2.5 px-4 flex items-center justify-between shadow-xl z-20">
        <div className="flex items-center gap-3">
          <span className="bg-red-600 text-white font-bebas px-3 py-0.5 rounded text-sm font-bold tracking-widest animate-pulse">
            LIVE BROADCAST
          </span>
          <h1 className="font-bebas text-2xl tracking-widest text-ipl-gold">
            CRICBID PRO '26 💥 LIVE BROADCAST
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleSound}
            className="bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1 rounded-lg text-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span>{muted ? '🔇 Muted' : '🔊 Sound On'}</span>
          </button>
          <div className="text-white/60 text-xs hidden sm:block">
            SPECTATOR MODE • REAL-TIME SYNC
          </div>
        </div>
      </div>

      {/* High-Stakes Bidding War Clash Banner */}
      <div className="max-w-7xl mx-auto w-full px-4 z-20">
        <BiddingWarClash
          currentPrice={currentPrice}
          leadingTeamObj={leadingTeamObj}
          bids={state.bids}
          teams={TEAMS}
        />
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-6 max-w-7xl mx-auto w-full z-10 items-center">
        
        {/* LEFT COLUMN: LIVE BID FEED (3 cols) */}
        <div className="lg:col-span-3 glass-card p-4 rounded-2xl border border-white/10 flex flex-col h-[480px]">
          <h3 className="font-bebas text-xl text-ipl-gold tracking-wider mb-3 flex items-center gap-2">
            <span>🔥</span> LIVE BID FEED
          </h3>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {state.bids && state.bids.length > 0 ? (
              state.bids.map((b, idx) => {
                const team = getTeam(b.team);
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{team?.emoji || '🏏'}</span>
                      <div>
                        <div className="font-bold text-sm" style={{ color: team?.light || '#fff' }}>
                          {team?.name || b.team}
                        </div>
                        <div className="text-[10px] text-white/40">
                          {new Date(b.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    <div className="font-bebas text-lg text-ipl-gold">
                      {fmt(b.amount)}
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="h-full flex items-center justify-center text-white/30 text-center text-sm">
                Awaiting first bid...
              </div>
            )}
          </div>
        </div>

        {/* CENTER COLUMN: PLAYER SPOTLIGHT & TIMER (6 cols) */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center">
          {currentPlayer ? (
            <motion.div
              key={currentPlayer.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`w-full glass-card p-6 rounded-3xl border-2 border-ipl-gold/40 text-center relative overflow-hidden bg-gradient-to-b ${currentPlayer.bg || 'from-slate-900 to-black'}`}
            >
              {/* Status Badge */}
              <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-ipl-gold/40 font-bebas text-lg text-ipl-gold">
                {currentPlayer.grade || 'A+'}
              </div>

              {/* Photo / Icon */}
              <div className="my-4 flex justify-center">
                {currentPlayer.photo ? (
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-ipl-gold blur-2xl opacity-40 animate-pulse" />
                    <img
                      src={currentPlayer.photo}
                      alt={currentPlayer.name}
                      className="relative w-36 h-36 rounded-full object-cover border-4 border-ipl-gold shadow-2xl"
                    />
                  </div>
                ) : (
                  <div className="text-8xl animate-float">🏏</div>
                )}
              </div>

              {/* Name & Role */}
              <h2 className="font-bebas text-4xl md:text-5xl tracking-widest text-white">{currentPlayer.name}</h2>
              <div className="flex items-center justify-center gap-3 mt-1 mb-4">
                <span className="bg-black/40 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-white/80 border border-white/10">
                  {currentPlayer.role}
                </span>
                <span className="text-sm font-semibold">{currentPlayer.country}</span>
              </div>

              {/* Base Price vs Current Price */}
              <div className="grid grid-cols-2 gap-4 bg-black/40 p-4 rounded-2xl border border-white/10 my-4">
                <div>
                  <div className="text-white/40 text-xs">BASE PRICE</div>
                  <div className="font-bebas text-2xl text-white">{fmt(currentPlayer.basePrice)}</div>
                </div>
                <div>
                  <div className="text-white/40 text-xs">CURRENT BID</div>
                  <div className="font-bebas text-3xl text-ipl-gold font-bold">{fmt(currentPrice)}</div>
                </div>
              </div>

              {/* Leading Team */}
              {leadingTeamObj ? (
                <div className="p-3 bg-white/10 rounded-xl border border-white/10 flex items-center justify-center gap-3">
                  <span className="text-2xl">{leadingTeamObj.emoji}</span>
                  <div className="text-left">
                    <div className="text-[10px] text-white/50 tracking-wider">CURRENT LEADING BIDDER</div>
                    <div className="font-bebas text-xl text-white tracking-wide" style={{ color: leadingTeamObj.light }}>
                      {leadingTeamObj.name} ({leadingTeamObj.id})
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-white/5 rounded-xl text-white/40 text-sm">
                  Waiting for opening bid...
                </div>
              )}

              {/* Countdown ring */}
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="text-white/40 text-xs font-rajdhani">TIMER:</span>
                <span className={`font-bebas text-3xl ${timer <= 5 ? 'text-red-400 animate-ping' : 'text-amber-400'}`}>
                  {timer}s
                </span>
              </div>

              {/* SOLD / UNSOLD overlay */}
              <AnimatePresence>
                {status === 'sold' && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-30">
                    <div className="font-bebas text-7xl text-green-400 border-8 border-green-400 px-8 py-4 rounded-3xl rotate-[-6deg] shadow-2xl">
                      SOLD!
                    </div>
                  </motion.div>
                )}
                {status === 'unsold' && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-30">
                    <div className="font-bebas text-7xl text-red-500 border-8 border-red-500 px-8 py-4 rounded-3xl rotate-[-6deg] shadow-2xl">
                      UNSOLD
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="glass-card-lg p-6 rounded-3xl text-center border-2 border-ipl-gold/30 w-full max-w-lg shadow-2xl">
              <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 font-bebas px-4 py-1 rounded-full text-xs font-bold tracking-widest mb-3 border border-amber-400/40 animate-pulse">
                <span>🔴 STAGE STANDBY</span>
              </div>
              <h3 className="font-bebas text-3xl text-white tracking-wider">AUCTION STANDBY • NEXT PLAYER COMING UP</h3>
              <p className="text-white/50 text-xs font-rajdhani mt-1 mb-4">
                The auctioneer is initiating the next player bidding round.
              </p>

              {state.playerQueue && state.playerQueue.length > 0 && (
                <div className="bg-black/40 p-3 rounded-2xl border border-white/10 text-left">
                  <div className="text-ipl-gold font-bebas text-sm tracking-wider mb-2">🔥 UPCOMING PLAYERS IN QUEUE:</div>
                  <div className="grid grid-cols-3 gap-2">
                    {state.playerQueue.slice(0, 3).map((p) => (
                      <div key={p.id} className="bg-white/5 p-2 rounded-xl text-center flex flex-col items-center">
                        {p.photo ? (
                          <img src={p.photo} alt={p.name} className="w-10 h-10 rounded-full object-cover border border-ipl-gold/40 mb-1" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl mb-1">🏏</div>
                        )}
                        <div className="font-bebas text-xs text-white truncate w-full">{p.name}</div>
                        <div className="text-[10px] text-amber-300 font-bold">{p.role}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: FRANCHISE LEADERBOARD (3 cols) */}
        <div className="lg:col-span-3 glass-card p-4 rounded-2xl border border-white/10 flex flex-col h-[480px]">
          <h3 className="font-bebas text-xl text-ipl-gold tracking-wider mb-3 flex items-center gap-2">
            <span>🏆</span> FRANCHISE STANDINGS
          </h3>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {TEAMS.map((t) => {
              const budget = state.teamBudgets[t.id] ?? 100;
              const squadCount = (state.teamSquads[t.id] || []).length;
              return (
                <div key={t.id} className="p-2.5 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{t.emoji}</span>
                    <div>
                      <div className="font-bold text-xs" style={{ color: t.light }}>{t.name}</div>
                      <div className="text-[10px] text-white/40">{squadCount} Players Bought</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bebas text-base text-ipl-gold">₹{budget.toFixed(1)} Cr</div>
                    <div className="text-[10px] text-white/30">Purse Left</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* BOTTOM TICKER BANNER */}
      <div className="bg-black/80 border-t border-white/10 py-2 px-4 text-xs font-rajdhani text-white/70 overflow-hidden whitespace-nowrap shadow-2xl z-20">
        <div className="inline-block animate-marquee">
          🏆 RECENT SOLD PLAYERS: {state.soldPlayers && state.soldPlayers.length > 0 ? (
            state.soldPlayers.slice(-5).map(p => `${p.name} -> ${p.soldTo} (₹${p.soldPrice} Cr)`).join('  •  ')
          ) : (
            'Auction underway... Stay tuned for top player signings!'
          )}
        </div>
      </div>
    </div>
  );
}
