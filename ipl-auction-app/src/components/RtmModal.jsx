import { motion, AnimatePresence } from 'framer-motion';

export default function RtmModal({ rtmState, currentTeamId, onExercise, onDecline, teams }) {
  if (!rtmState || !rtmState.pending) return null;

  const isRtmTeam = currentTeamId === rtmState.rtmTeam;
  const rtmTeamObj = teams?.find(t => t.id === rtmState.rtmTeam);
  const leadingTeamObj = teams?.find(t => t.id === rtmState.leadingTeam);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative max-w-lg w-full glass-card p-6 border-2 border-ipl-gold/60 shadow-2xl text-center rounded-2xl"
        >
          {/* Animated Header */}
          <div className="inline-block bg-gradient-to-r from-ipl-gold via-amber-400 to-ipl-orange text-black font-bebas px-4 py-1 rounded-full text-sm font-bold tracking-widest mb-3 animate-pulse">
            🚨 RIGHT TO MATCH (RTM) TRIGGERED
          </div>

          <h2 className="font-bebas text-3xl md:text-4xl tracking-wider text-white mb-2">
            Match Bid for {rtmState.player?.name}?
          </h2>

          <div className="bg-white/5 rounded-xl p-4 my-4 border border-white/10 flex flex-col gap-2">
            <div className="flex justify-between items-center text-sm font-rajdhani text-white/70">
              <span>Top Bidder:</span>
              <span className="font-bold text-white text-base">
                {leadingTeamObj ? `${leadingTeamObj.emoji} ${leadingTeamObj.name}` : rtmState.leadingTeam}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm font-rajdhani text-white/70">
              <span>Winning Bid:</span>
              <span className="font-bebas text-2xl text-ipl-gold">
                ₹{rtmState.bidAmount} Cr
              </span>
            </div>
            <div className="flex justify-between items-center text-sm font-rajdhani text-white/70">
              <span>RTM Eligible Team:</span>
              <span className="font-bold text-ipl-gold text-base">
                {rtmTeamObj ? `${rtmTeamObj.emoji} ${rtmTeamObj.name}` : rtmState.rtmTeam}
              </span>
            </div>
          </div>

          {/* Countdown timer */}
          <div className="my-4">
            <div className="text-white/40 text-xs font-rajdhani mb-1">DECISION TIMER</div>
            <div className="font-bebas text-4xl text-amber-400">
              {rtmState.timer}s
            </div>
          </div>

          {/* Decision Buttons */}
          {isRtmTeam ? (
            <div className="grid grid-cols-2 gap-4 mt-6">
              <button
                onClick={onDecline}
                className="w-full py-3 px-4 rounded-xl font-bebas text-lg bg-red-600/30 hover:bg-red-600/50 border border-red-500/50 text-red-200 transition-all cursor-pointer"
              >
                ✖ DECLINE RTM
              </button>
              <button
                onClick={onExercise}
                className="w-full py-3 px-4 rounded-xl font-bebas text-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold shadow-lg shadow-green-900/40 transition-all cursor-pointer animate-bounce"
              >
                ⚡ EXERCISE RTM (₹{rtmState.bidAmount} Cr)
              </button>
            </div>
          ) : (
            <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-300 font-rajdhani text-sm">
              Waiting for <strong className="text-white">{rtmTeamObj?.name || rtmState.rtmTeam}</strong> to decide whether to exercise their RTM card...
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
