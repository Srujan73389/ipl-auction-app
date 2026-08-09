import { motion, AnimatePresence } from 'framer-motion';

export default function BiddingWarClash({ currentPrice, leadingTeamObj, bids, teams }) {
  if (!currentPrice || currentPrice < 10 || !leadingTeamObj || !bids || bids.length < 2) return null;

  // Find the top 2 competing teams in the bid history
  const topBidders = Array.from(new Set(bids.map(b => b.team))).slice(0, 2);
  if (topBidders.length < 2) return null;

  const team1 = teams?.find(t => t.id === topBidders[0]);
  const team2 = teams?.find(t => t.id === topBidders[1]);

  if (!team1 || !team2) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full my-3 p-4 rounded-2xl bg-gradient-to-r from-red-950 via-slate-900 to-purple-950 border-2 border-amber-400 shadow-2xl relative overflow-hidden text-center"
      >
        {/* Animated Lightning Background Line */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent -translate-x-full animate-shimmer" />

        <div className="inline-block bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-black font-bebas px-4 py-0.5 rounded-full text-xs font-bold tracking-widest mb-2 animate-pulse">
          ⚡ HIGH-STAKES BIDDING WAR (&gt; ₹10.00 CR) ⚡
        </div>

        <div className="flex items-center justify-center gap-4 sm:gap-8 my-1">
          {/* Team 1 */}
          <div className="flex flex-col items-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-lg border-2 border-amber-400 animate-bounce"
              style={{ background: `linear-gradient(135deg, ${team1.color}, ${team1.light})` }}
            >
              {team1.emoji}
            </div>
            <div className="font-bebas text-lg mt-1" style={{ color: team1.light }}>
              {team1.id}
            </div>
          </div>

          {/* VS Clash Icon */}
          <div className="font-bebas text-3xl md:text-4xl text-amber-400 font-extrabold tracking-widest animate-pulse" style={{ textShadow: '0 0 20px #FFD700' }}>
            ⚔️ VS ⚔️
          </div>

          {/* Team 2 */}
          <div className="flex flex-col items-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-lg border-2 border-amber-400 animate-bounce"
              style={{ animationDelay: '0.2s', background: `linear-gradient(135deg, ${team2.color}, ${team2.light})` }}
            >
              {team2.emoji}
            </div>
            <div className="font-bebas text-lg mt-1" style={{ color: team2.light }}>
              {team2.id}
            </div>
          </div>
        </div>

        <div className="font-bebas text-2xl text-ipl-gold tracking-widest mt-1">
          BID CROSSES ₹{currentPrice.toFixed(2)} CR!
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
