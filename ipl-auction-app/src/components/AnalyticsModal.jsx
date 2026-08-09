import { motion, AnimatePresence } from 'framer-motion';

export default function AnalyticsModal({ isOpen, onClose, state, teams }) {
  if (!isOpen) return null;

  const currentTeamId = state.teamInfo?.id || 'MI';
  const squad = state.teamSquads[currentTeamId] || [];
  const budget = state.teamBudgets[currentTeamId] ?? 100;
  const initialBudget = 100;
  const spent = +(initialBudget - budget).toFixed(2);
  const rtmLeft = state.teamRtmCounts ? (state.teamRtmCounts[currentTeamId] ?? 3) : 3;

  // Calculate role breakdowns
  const roleCounts = {
    Batsman: squad.filter(p => p.role === 'Batsman').length,
    Bowler: squad.filter(p => p.role === 'Bowler').length,
    'All-Rounder': squad.filter(p => p.role === 'All-Rounder').length,
    Wicketkeeper: squad.filter(p => p.role === 'Wicketkeeper').length,
  };

  const overseasCount = squad.filter(p => p.country && !p.country.includes('India')).length;
  const indianCount = squad.length - overseasCount;

  // Export to CSV function
  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "IPL 2026 AUCTION - SQUAD REPORT\n";
    csvContent += `Team,${state.teamInfo?.name || currentTeamId}\n`;
    csvContent += `Remaining Purse,₹${budget} Cr\n`;
    csvContent += `Total Spent,₹${spent} Cr\n`;
    csvContent += `RTM Cards Left,${rtmLeft}\n\n`;
    csvContent += "ID,Name,Role,Country,Grade,Sold Price (Cr)\n";

    squad.forEach(p => {
      csvContent += `${p.id},"${p.name}",${p.role},"${p.country}",${p.grade || 'A'},${p.price || p.basePrice}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${currentTeamId}_IPL_2026_Squad.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="relative max-w-2xl w-full glass-card p-6 border border-white/15 shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📊</span>
              <div>
                <h3 className="font-bebas text-3xl tracking-wider text-white">SQUAD ANALYTICS</h3>
                <p className="text-white/40 text-xs font-rajdhani">REAL-TIME SQUAD COMPOSITION & BUDGET UTILIZATION</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <div className="text-white/40 text-xs font-rajdhani">PURSE REMAINING</div>
              <div className="font-bebas text-2xl text-ipl-gold">₹{budget.toFixed(2)} Cr</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <div className="text-white/40 text-xs font-rajdhani">TOTAL SPENT</div>
              <div className="font-bebas text-2xl text-amber-400">₹{spent.toFixed(2)} Cr</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <div className="text-white/40 text-xs font-rajdhani">SQUAD SIZE</div>
              <div className="font-bebas text-2xl text-white">{squad.length} / 25</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <div className="text-white/40 text-xs font-rajdhani">OVERSEAS SLOTS</div>
              <div className={`font-bebas text-2xl ${overseasCount >= 8 ? 'text-red-400' : 'text-emerald-400'}`}>
                {overseasCount} / 8
              </div>
            </div>
          </div>

          {/* Budget Usage Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs font-rajdhani text-white/60 mb-1">
              <span>Budget Usage</span>
              <span>{((spent / initialBudget) * 100).toFixed(1)}% Spent</span>
            </div>
            <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-ipl-gold via-ipl-orange to-red-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (spent / initialBudget) * 100)}%` }}
              />
            </div>
          </div>

          {/* Role Composition Bars */}
          <div className="mb-6 bg-black/30 p-4 rounded-xl border border-white/5">
            <h4 className="font-bebas text-xl text-white mb-3 tracking-wider">ROLE DISTRIBUTION</h4>
            <div className="space-y-3">
              {Object.entries(roleCounts).map(([role, count]) => (
                <div key={role}>
                  <div className="flex justify-between text-xs font-rajdhani text-white/80 mb-1">
                    <span>{role}</span>
                    <span className="font-bold text-white">{count} players</span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-ipl-gold rounded-full transition-all duration-500"
                      style={{ width: `${squad.length > 0 ? (count / squad.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Player Roster Preview */}
          <div className="mb-6">
            <h4 className="font-bebas text-xl text-white mb-2 tracking-wider">PURCHASED PLAYERS ({squad.length})</h4>
            {squad.length > 0 ? (
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {squad.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white/5 px-3 py-2 rounded-lg text-xs font-rajdhani text-white">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-ipl-gold">#{idx + 1}</span>
                      <span className="font-semibold">{p.name}</span>
                      <span className="text-white/50">({p.role})</span>
                    </div>
                    <span className="font-bebas text-sm text-ipl-gold">₹{p.price} Cr</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/40 text-xs font-rajdhani italic">No players bought yet.</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
            <button
              onClick={exportToCSV}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bebas px-5 py-2.5 rounded-xl text-lg flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-950"
            >
              📥 EXPORT SQUAD TO CSV
            </button>
            <button
              onClick={onClose}
              className="bg-white/10 hover:bg-white/20 text-white font-bebas px-5 py-2.5 rounded-xl text-lg transition-all cursor-pointer"
            >
              CLOSE
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
