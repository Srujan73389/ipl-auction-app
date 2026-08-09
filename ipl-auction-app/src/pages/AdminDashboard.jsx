import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuction } from '../context/AuctionContext.jsx'
import { TEAMS, getTeam, PLAYERS } from '../data/index.js'
import ChatDrawer from '../components/ChatDrawer.jsx'
import QrLoginModal from '../components/QrLoginModal.jsx'
import PitchBuilder from '../components/PitchBuilder.jsx'
import BiddingWarClash from '../components/BiddingWarClash.jsx'
import { soundService } from '../services/sound.js'

/* ── helper: format price ── */
const fmt = (cr) => {
  if (cr >= 1) return `₹${cr.toFixed(2)} Cr`
  return `₹${(cr * 100).toFixed(0)} L`
}

/* ── PlayerCard shown in center ── */
function CurrentPlayerCard({ player, status }) {
  if (!player) return null
  const isBowler = player.role === 'Bowler'
  return (
    <motion.div
      key={player.id}
      initial={{ opacity: 0, scale: 0.7, rotateY: -30 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      exit={{ opacity: 0, scale: 1.1, y: -40 }}
      transition={{ type: 'spring', stiffness: 150, damping: 20 }}
      className={`relative rounded-2xl overflow-hidden w-full max-w-xs mx-auto bg-gradient-to-br ${player.bg}`}
      style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.6)', minHeight: 320 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm rounded-lg px-2 py-0.5 font-bebas text-lg tracking-widest text-ipl-gold border border-ipl-gold/30">
        {player.grade}
      </div>
      <div className="p-6 flex flex-col gap-3">
        <div className="flex justify-center mt-2">
          {player.photo ? (
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-ipl-gold blur-xl opacity-50 animate-pulse"></div>
              <img src={player.photo} alt={player.name} className="relative w-24 h-24 rounded-full object-cover border-4 border-ipl-gold shadow-2xl" />
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-ipl-gold to-ipl-orange text-black text-xs font-bold px-3 py-0.5 rounded-full shadow-lg">
                {player.grade}
              </div>
            </div>
          ) : (
            <div className="text-6xl animate-float">🏏</div>
          )}
        </div>
        <div className="text-center">
          <h2 className="font-bebas text-3xl tracking-wider text-white">{player.name}</h2>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="bg-white/15 backdrop-blur-sm rounded-full px-3 py-0.5 text-xs font-rajdhani font-bold text-white/80 uppercase tracking-widest">
              {player.role}
            </span>
            <span className="text-sm">{player.country}</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-2">
          <div className="bg-black/25 rounded-xl p-2 text-center">
            <div className="text-white/40 text-xs">CAPS</div>
            <div className="text-white font-bold text-lg">{player.caps}</div>
          </div>
          {isBowler ? (
            <>
              <div className="bg-black/25 rounded-xl p-2 text-center">
                <div className="text-white/40 text-xs">WICKETS</div>
                <div className="text-white font-bold text-lg">{player.wickets}</div>
              </div>
              <div className="bg-black/25 rounded-xl p-2 text-center">
                <div className="text-white/40 text-xs">ECONOMY</div>
                <div className="text-white font-bold text-lg">{player.economy}</div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-black/25 rounded-xl p-2 text-center">
                <div className="text-white/40 text-xs">AVERAGE</div>
                <div className="text-white font-bold text-lg">{player.avg}</div>
              </div>
              <div className="bg-black/25 rounded-xl p-2 text-center">
                <div className="text-white/40 text-xs">STRIKE R</div>
                <div className="text-white font-bold text-lg">{player.sr}</div>
              </div>
            </>
          )}
        </div>
        <div className="mt-2 text-center">
          <span className="text-white/50 text-xs tracking-widest">BASE PRICE</span>
          <div className="font-bebas text-2xl text-ipl-gold tracking-wider">{fmt(player.basePrice)}</div>
        </div>
      </div>
      <AnimatePresence>
        {status === 'sold' && (
          <motion.div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="font-bebas text-7xl text-green-400 border-4 border-green-400 px-6 py-2 rounded-xl rotate-[-8deg]">SOLD!</div>
          </motion.div>
        )}
        {status === 'unsold' && (
          <motion.div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="font-bebas text-6xl text-red-500 border-4 border-red-500 px-6 py-2 rounded-xl rotate-[-8deg]">UNSOLD</div>
          </motion.div>
        )}
        {status === 'rtm' && (
          <motion.div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="font-bebas text-5xl text-amber-400 border-4 border-amber-400 px-6 py-2 rounded-xl rotate-[-4deg] animate-pulse">RTM PENDING</div>
          </motion.div>
        )}
        {status === 'hammer' && (
          <motion.div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="font-bebas text-7xl text-yellow-400 animate-bounce">🔨</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function PriceDisplay({ price, leadingTeam }) {
  const team = getTeam(leadingTeam)
  return (
    <div className="glass-card-lg p-4 text-center my-2">
      <div className="text-white/40 text-xs tracking-widest mb-1">CURRENT HIGH BID</div>
      <motion.div key={price} initial={{ scale: 1.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="font-bebas text-5xl text-ipl-gold" style={{ textShadow: '0 0 25px rgba(255,215,0,0.6)' }}>
        {fmt(price)}
      </motion.div>
      {leadingTeam ? (
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="text-lg">{team?.emoji}</span>
          <span className="font-bebas text-xl" style={{ color: team?.color === '#FFB800' ? '#FFD055' : team?.light }}>{team?.name} ({team?.id})</span>
        </div>
      ) : (
        <div className="text-white/30 text-xs mt-1">Awaiting opening bid...</div>
      )}
    </div>
  )
}

function TimerRing({ timer, max = 15, status }) {
  const r = 36, circ = 2 * Math.PI * r, dash = circ * (timer / max)
  const color = timer > 8 ? '#4ade80' : timer > 4 ? '#FFD700' : '#FF4444'
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
          <circle cx="44" cy="44" r={r} fill="none" stroke={color} strokeWidth="6" strokeDasharray={circ} strokeDashoffset={circ - dash} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-bebas text-3xl" style={{ color, textShadow: `0 0 15px ${color}` }}>{status === 'hammer' ? '🔨' : timer}</span>
        </div>
      </div>
      <span className="text-white/30 text-xs mt-1">SECONDS</span>
    </div>
  )
}

function CenterSoldToast({ player, team, price, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 3000)
    return () => clearTimeout(timer)
  }, [onClose])
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: -100 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.5, y: -100 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ pointerEvents: 'none' }}
    >
      <div className="bg-gradient-to-br from-black/95 to-gray-900/95 backdrop-blur-xl rounded-2xl p-6 text-center shadow-2xl border-2 border-green-500 min-w-[340px] max-w-[400px] mx-4">
        <div className="absolute -top-3 left-0 right-0 text-2xl animate-pulse">✨ 🎉 ✨</div>
        <div className="font-bebas text-5xl text-green-400 mb-3 mt-3" style={{ textShadow: '0 0 30px #4ade80' }}>🏆 SOLD! 🏆</div>
        {player?.photo && (
          <div className="flex justify-center mb-3">
            <img src={player.photo} alt={player.name} className="w-24 h-24 rounded-full object-cover border-4 border-ipl-gold shadow-xl" />
          </div>
        )}
        <div className="text-white font-bebas text-2xl my-2">{player?.name}</div>
        <div className="text-ipl-gold font-bebas text-3xl my-2">{fmt(price)}</div>
        <div className="text-white/50 text-xs uppercase tracking-wider mb-2">SOLD TO</div>
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg" style={{ background: `linear-gradient(135deg, ${team?.color}, ${team?.light})` }}>{team?.emoji}</div>
          <div className="text-left">
            <div className="font-bebas text-2xl tracking-wider" style={{ color: team?.color === '#FFB800' ? '#FFD055' : team?.light }}>{team?.id}</div>
            <div className="text-white/50 text-sm">{team?.name}</div>
          </div>
        </div>
        <div className="text-green-400 text-sm mt-4 animate-pulse">✨ Player added to squad ✨</div>
      </div>
    </motion.div>
  )
}

function CenterUnsoldToast({ player, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 3000)
    return () => clearTimeout(timer)
  }, [onClose])
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: -100 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.5, y: -100 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ pointerEvents: 'none' }}
    >
      <div className="bg-gradient-to-br from-black/95 to-gray-900/95 backdrop-blur-xl rounded-2xl p-6 text-center shadow-2xl border-2 border-red-500 min-w-[340px] max-w-[400px] mx-4">
        <div className="absolute -top-3 left-0 right-0 text-2xl animate-pulse">💔 😔 💔</div>
        <div className="font-bebas text-5xl text-red-400 mb-3 mt-3" style={{ textShadow: '0 0 30px #f87171' }}>❌ UNSOLD! ❌</div>
        {player?.photo && (
          <div className="flex justify-center mb-3">
            <img src={player.photo} alt={player.name} className="w-24 h-24 rounded-full object-cover border-4 border-red-500 shadow-xl" />
          </div>
        )}
        <div className="text-white font-bebas text-2xl my-2">{player?.name}</div>
        <div className="text-red-400 font-bebas text-2xl my-2">Base: {fmt(player?.basePrice)}</div>
        <div className="text-white/60 text-sm mt-2">No bids received for this player</div>
        <div className="text-yellow-400 text-sm mt-4 animate-pulse">📋 Added to Unsold Players list</div>
        <div className="text-white/40 text-xs mt-2">You can re-auction anytime using the Re-Auction button</div>
      </div>
    </motion.div>
  )
}

// ============ CSV IMPORT MODAL ============
function CSVImportModal({ onClose, onImport }) {
  const [csvText, setCsvText] = useState('')

  const handleImport = (e) => {
    e.preventDefault()
    if (!csvText.trim()) return

    const lines = csvText.trim().split('\n')
    const playersList = []

    lines.forEach((line) => {
      const parts = line.split(',').map(s => s.trim().replace(/^["']|["']$/g, ''))
      if (parts.length >= 2 && parts[0] !== 'Name' && parts[0] !== 'ID') {
        playersList.push({
          name: parts[0],
          role: parts[1] || 'Batsman',
          country: parts[2] || '🇮🇳 India',
          basePrice: parseFloat(parts[3]) || 1.0,
          grade: parts[4] || 'A',
          formerTeam: parts[5] || null
        })
      }
    })

    if (playersList.length > 0) {
      onImport(playersList)
      onClose()
    } else {
      alert('Could not parse any players from CSV input.')
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-md p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="relative w-full max-w-lg bg-gray-900 border border-white/20 rounded-2xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="font-bebas text-2xl text-ipl-gold mb-2">📥 IMPORT PLAYERS FROM CSV</h3>
        <p className="text-white/40 text-xs font-rajdhani mb-4">Paste comma-separated lines in format: <br/><code className="text-ipl-gold">Name, Role, Country, BasePrice, Grade, FormerTeam</code></p>
        <form onSubmit={handleImport} className="space-y-4">
          <textarea
            rows="8"
            placeholder="e.g.&#10;Steve Smith, Batsman, Australia, 2.0, A, DC&#10;Sanju Samson, Wicketkeeper, India, 2.0, A, RR"
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-white font-rajdhani text-sm focus:outline-none focus:border-ipl-gold"
          />
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-white/10 text-white font-bebas text-lg cursor-pointer">CANCEL</button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bebas text-lg cursor-pointer">IMPORT CSV</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ============ ADD PLAYER FORM MODAL ============
function AddPlayerForm({ onClose, onAddPlayer }) {
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    role: 'Batsman',
    country: 'India',
    basePrice: 2,
    caps: 0,
    avg: 0,
    sr: 0,
    runs: 0,
    wickets: 0,
    economy: 0,
    grade: 'B',
  })
  const [submitting, setSubmitting] = useState(false)

  const roles = [
    { value: 'Batsman', label: '🏏 Batsman', color: 'from-red-500 to-orange-500' },
    { value: 'Bowler', label: '⚾ Bowler', color: 'from-blue-500 to-cyan-500' },
    { value: 'All-Rounder', label: '⚡ All-Rounder', color: 'from-purple-500 to-pink-500' },
    { value: 'Wicketkeeper', label: '🧤 Wicketkeeper', color: 'from-yellow-500 to-amber-500' },
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!newPlayer.name.trim()) {
      alert('Please enter player name')
      return
    }
    setSubmitting(true)
    
    let grade = newPlayer.grade
    if (grade === 'B') {
      if (newPlayer.role === 'Batsman') {
        if (newPlayer.avg > 45) grade = 'A+'
        else if (newPlayer.avg > 35) grade = 'A'
        else if (newPlayer.avg > 30) grade = 'B+'
      } else if (newPlayer.role === 'Bowler') {
        if (newPlayer.wickets > 80) grade = 'A+'
        else if (newPlayer.wickets > 50) grade = 'A'
        else if (newPlayer.wickets > 30) grade = 'B+'
      }
    }
    
    const finalPlayer = { ...newPlayer, grade, bg: 'from-gray-800 to-gray-700', photo: null }
    onAddPlayer(finalPlayer)
    setSubmitting(false)
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        className="relative w-full max-w-lg bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden border border-white/20 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h3 className="font-bebas text-2xl text-ipl-gold mb-4 flex items-center gap-2">
            <span className="text-3xl">➕</span> ADD NEW PLAYER
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/60 text-sm mb-1">👤 PLAYER NAME</label>
              <input type="text" placeholder="e.g., Virat Kohli" value={newPlayer.name} onChange={(e) => setNewPlayer({...newPlayer, name: e.target.value})} className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-ipl-gold" required />
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-1">🎯 PLAYER ROLE</label>
              <div className="grid grid-cols-2 gap-2">
                {roles.map(role => (
                  <button key={role.value} type="button" onClick={() => setNewPlayer({...newPlayer, role: role.value})} className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${newPlayer.role === role.value ? `bg-gradient-to-r ${role.color} text-black shadow-lg` : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-1">🌍 COUNTRY</label>
              <input type="text" placeholder="e.g., India, Australia" value={newPlayer.country} onChange={(e) => setNewPlayer({...newPlayer, country: e.target.value})} className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white" />
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-1">💰 BASE PRICE (Crores)</label>
              <input type="number" step="0.5" placeholder="e.g., 1, 1.5, 2" value={newPlayer.basePrice} onChange={(e) => setNewPlayer({...newPlayer, basePrice: parseFloat(e.target.value)})} className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white" />
            </div>

            <div className="flex gap-3 pt-4">
              <button type="submit" disabled={submitting} className="flex-1 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bebas text-xl rounded-xl transition-all shadow-lg cursor-pointer">✅ {submitting ? 'ADDING...' : 'ADD PLAYER'}</button>
              <button type="button" onClick={onClose} className="flex-1 py-3 bg-red-500/30 hover:bg-red-500/50 text-red-400 font-bebas text-xl rounded-xl transition-all cursor-pointer">✖ CANCEL</button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ============ PLAYERS LIST MODAL ============
function PlayersListModal({ onClose, onAddPlayer, allPlayers }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)

  const categories = [
    { id: 'all', name: 'ALL', icon: '📋', count: allPlayers.length, color: 'from-ipl-gold to-yellow-500' },
    { id: 'Batsman', name: 'BATTERS', icon: '🏏', count: allPlayers.filter(p => p.role === 'Batsman').length, color: 'from-red-500 to-orange-500' },
    { id: 'Bowler', name: 'BOWLERS', icon: '⚾', count: allPlayers.filter(p => p.role === 'Bowler').length, color: 'from-blue-500 to-cyan-500' },
    { id: 'Wicketkeeper', name: 'WK', icon: '🧤', count: allPlayers.filter(p => p.role === 'Wicketkeeper').length, color: 'from-yellow-500 to-amber-500' },
    { id: 'All-Rounder', name: 'ALL-ROUNDERS', icon: '⚡', count: allPlayers.filter(p => p.role === 'All-Rounder').length, color: 'from-purple-500 to-pink-500' },
  ]

  const filteredPlayers = allPlayers.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || player.role === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        className="relative w-full max-w-5xl max-h-[90vh] bg-gradient-to-br from-gray-900/95 to-black/95 rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-black/50 backdrop-blur-md p-4 border-b border-white/10 flex justify-between items-center z-10">
          <div><h2 className="font-bebas text-3xl text-ipl-gold">📋 PLAYERS CATALOG</h2><p className="text-white/40 text-sm">Total {allPlayers.length} players available</p></div>
          <button onClick={onClose} className="text-white/60 hover:text-white text-3xl">&times;</button>
        </div>

        <div className="p-4">
          <input type="text" placeholder="🔍 Search players by name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-ipl-gold" />
        </div>

        <div className="px-4 pb-4 flex flex-wrap gap-3">
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`px-5 py-2 rounded-xl font-bebas text-lg transition-all duration-200 ${selectedCategory === cat.id ? `bg-gradient-to-r ${cat.color} text-black shadow-lg scale-105` : 'bg-white/10 text-white/70 hover:bg-white/20 hover:scale-105'}`}>
              <span className="mr-1">{cat.icon}</span> {cat.name} <span className={`ml-2 text-xs ${selectedCategory === cat.id ? 'text-black/70' : 'text-white/40'}`}>({cat.count})</span>
            </button>
          ))}
        </div>

        <div className="p-4 overflow-y-auto flex-1 custom-scroll">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredPlayers.map(player => (
              <motion.div key={player.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-3 flex items-center gap-3 hover:border-ipl-gold/50 transition-all">
                {player.photo ? <img src={player.photo} alt={player.name} className="w-12 h-12 rounded-full object-cover" /> : <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-2xl">🏏</div>}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white truncate">{player.name}</div>
                  <div className="flex items-center gap-1"><span className="text-white/40 text-xs">{player.role}</span><span className="text-white/20 text-xs">•</span><span className="text-white/40 text-xs">{player.country}</span></div>
                  <div className="text-ipl-gold font-bebas text-sm">{fmt(player.basePrice)}</div>
                </div>
                <button onClick={() => { onAddPlayer(player); alert(`✅ ${player.name} added to auction queue!`) }} className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/40 text-green-400 rounded-lg text-xs font-semibold transition-all hover:scale-105 cursor-pointer">+ Add</button>
              </motion.div>
            ))}
          </div>
          {filteredPlayers.length === 0 && <div className="text-center text-white/40 py-10">No players found</div>}
        </div>

        <div className="sticky bottom-0 bg-black/50 backdrop-blur-md p-4 border-t border-white/10 flex justify-center">
          <button onClick={() => setShowAddForm(true)} className="px-6 py-3 bg-gradient-to-r from-ipl-gold to-ipl-orange text-black font-bebas text-xl rounded-xl hover:scale-105 transition-all shadow-lg cursor-pointer">+ ADD NEW PLAYER</button>
        </div>

        <AnimatePresence>{showAddForm && <AddPlayerForm onClose={() => setShowAddForm(false)} onAddPlayer={onAddPlayer} />}</AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

/* ══════════════ MAIN ADMIN DASHBOARD ══════════════ */
export default function AdminDashboard() {
  const { state, startPlayer, markSold, markUnsold, resetIdle, reAddUnsoldPlayer, resetAuction, addPlayerToQueue, sendChatMessage, importPlayersCSV, exerciseRTM, declineRTM, toggleAiAutoBid } = useAuction()
  const { currentPlayer, currentPrice, leadingTeam, auctionStatus, timer, bids,
          soldPlayers, unsoldPlayers, playerQueue, teamBudgets, teamSquads, connectedTeams, chatMessages, aiAutoBidEnabled } = state
  const navigate = useNavigate()
  
  const [soldToast, setSoldToast] = useState(null)
  const [unsoldToast, setUnsoldToast] = useState(null)
  const [showPlayersList, setShowPlayersList] = useState(false)
  const [showCSVImport, setShowCSVImport] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [showPitch, setShowPitch] = useState(false)
  const [muted, setMuted] = useState(soundService.isMuted())

  const toggleSound = () => {
    const nextMuted = !muted
    setMuted(nextMuted)
    soundService.setMuted(nextMuted)
  }

  useEffect(() => {
    if (auctionStatus === 'sold' && soldPlayers.length > 0) {
      const lastSold = soldPlayers[soldPlayers.length - 1]
      const team = getTeam(lastSold.soldTo)
      setSoldToast({ player: lastSold, team, price: lastSold.soldPrice })
      const timer = setTimeout(() => resetIdle(), 3000)
      return () => clearTimeout(timer)
    }
  }, [auctionStatus, soldPlayers, resetIdle])

  useEffect(() => {
    if (auctionStatus === 'unsold' && currentPlayer) {
      setUnsoldToast({ player: currentPlayer })
      const timer = setTimeout(() => { resetIdle(); setUnsoldToast(null) }, 3000)
      return () => clearTimeout(timer)
    }
  }, [auctionStatus, currentPlayer, resetIdle])

  const totalSpent = TEAMS.reduce((s, t) => s + (t.budget - teamBudgets[t.id]), 0)
  const allPlayers = [...playerQueue, ...soldPlayers, ...unsoldPlayers]

  const handleAddPlayer = (player) => {
    addPlayerToQueue(player)
  }

  return (
    <div className="pitch-bg min-h-screen text-white font-rajdhani relative">
      <AnimatePresence>{soldToast && <CenterSoldToast player={soldToast.player} team={soldToast.team} price={soldToast.price} onClose={() => setSoldToast(null)} />}</AnimatePresence>
      <AnimatePresence>{unsoldToast && <CenterUnsoldToast player={unsoldToast.player} onClose={() => setUnsoldToast(null)} />}</AnimatePresence>

      <ChatDrawer
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        messages={chatMessages}
        onSendMessage={sendChatMessage}
        currentUser={{ role: 'admin', teamId: null, name: 'Auctioneer' }}
        teams={TEAMS}
      />

      <QrLoginModal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        teams={TEAMS}
      />

      <PitchBuilder
        isOpen={showPitch}
        onClose={() => setShowPitch(false)}
        teamSquad={soldPlayers}
        teamName="ALL AUCTIONED"
        teamEmoji="🏆"
      />

      <AnimatePresence>
        {showCSVImport && (
          <CSVImportModal
            onClose={() => setShowCSVImport(false)}
            onImport={(list) => importPlayersCSV(list)}
          />
        )}
      </AnimatePresence>

      {/* Admin Header */}
      <div className="flex flex-wrap items-center justify-between px-6 py-3 border-b border-white/5 bg-black/40 backdrop-blur-sm sticky top-0 z-20 gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💥</span>
          <span className="font-bebas text-2xl tracking-widest text-ipl-gold">CRICBID PRO '26 AUCTIONEER</span>
          <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-0.5 rounded-full border border-green-500/30 animate-pulse">● LIVE</span>
        </div>
        <div className="flex items-center gap-3 text-sm flex-wrap">
          <span className="text-white/40">Sold: <b className="text-green-400">{soldPlayers.length}</b></span>
          <span className="text-white/40">Unsold: <b className="text-red-400">{unsoldPlayers.length}</b></span>
          <span className="text-white/40">Remaining: <b className="text-white">{playerQueue.length}</b></span>
          <span className="text-white/40">Spent: <b className="text-ipl-gold">{fmt(totalSpent)}</b></span>

          {/* AI Auto-Bidder Toggle Button */}
          <button
            onClick={() => toggleAiAutoBid(!aiAutoBidEnabled)}
            className={`text-xs font-bold px-3 py-1 rounded-full border transition-all cursor-pointer flex items-center gap-1 ${
              aiAutoBidEnabled
                ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300 animate-pulse'
                : 'bg-white/10 border-white/20 text-white/60 hover:bg-white/20'
            }`}
          >
            🤖 AI BOT: {aiAutoBidEnabled ? 'ON' : 'OFF'}
          </button>

          <button onClick={() => setShowQR(true)} className="bg-amber-500/30 hover:bg-amber-500/50 text-amber-300 text-xs border border-amber-500/40 px-3 py-1 rounded-full transition-all flex items-center gap-1 cursor-pointer">
            📱 Mobile QR
          </button>
          <button onClick={() => setShowPitch(true)} className="bg-green-500/30 hover:bg-green-500/50 text-green-300 text-xs border border-green-500/40 px-3 py-1 rounded-full transition-all flex items-center gap-1 cursor-pointer">
            🏏 3D Pitch
          </button>
          <button onClick={() => setShowCSVImport(true)} className="bg-emerald-500/30 hover:bg-emerald-500/50 text-emerald-300 text-xs border border-emerald-500/40 px-3 py-1 rounded-full transition-all flex items-center gap-1 cursor-pointer">
            📥 Import CSV
          </button>
          <button onClick={() => setShowPlayersList(true)} className="bg-blue-500/30 hover:bg-blue-500/50 text-blue-300 text-xs border border-blue-500/40 px-3 py-1 rounded-full transition-all flex items-center gap-1 cursor-pointer">
            📋 Catalog
          </button>
          <button onClick={() => setShowChat(true)} className="bg-purple-500/30 hover:bg-purple-500/50 text-purple-300 text-xs border border-purple-500/40 px-3 py-1 rounded-full transition-all flex items-center gap-1 cursor-pointer">
            💬 Chat
          </button>
          <button onClick={toggleSound} className="bg-white/10 hover:bg-white/20 text-white text-xs border border-white/20 px-3 py-1 rounded-full transition-all cursor-pointer">
            {muted ? '🔇 Sound' : '🔊 Sound'}
          </button>
          <button onClick={() => { if (window.confirm('⚠️ Reset entire auction? All progress will be lost!')) resetAuction() }} className="bg-yellow-500/30 hover:bg-yellow-500/50 text-yellow-300 text-xs border border-yellow-500/40 px-3 py-1 rounded-full transition-all flex items-center gap-1 cursor-pointer">
            🔄 Reset
          </button>
          <button onClick={() => { navigate('/'); window.location.reload() }} className="text-red-400/60 hover:text-red-400 text-xs border border-red-400/20 px-3 py-1 rounded-full transition-all cursor-pointer">
            Exit
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-60px)] gap-0">
        {/* LEFT COLUMN: PLAYER QUEUE */}
        <div className="w-64 shrink-0 border-r border-white/5 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5"><span className="font-bebas text-lg tracking-widest text-white/60">PLAYER QUEUE</span><span className="ml-2 text-ipl-orange text-sm font-bold">({playerQueue.length})</span></div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {playerQueue.map((p, i) => (
              <button key={p.id} onClick={() => auctionStatus === 'idle' && !soldToast && !unsoldToast && startPlayer(p)} disabled={auctionStatus !== 'idle' || soldToast || unsoldToast} className={`w-full text-left glass-card px-3 py-2.5 flex items-center gap-3 transition-all duration-200 ${auctionStatus === 'idle' && !soldToast && !unsoldToast ? 'hover:border-ipl-orange/40 hover:bg-ipl-orange/5 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}>
                {p.photo ? <img src={p.photo} alt={p.name} className="w-8 h-8 rounded-full object-cover shrink-0 border border-ipl-gold/50" /> : <span className="text-xl shrink-0">🏏</span>}
                <div className="min-w-0"><div className="font-semibold text-sm truncate">{p.name}</div><div className="text-white/40 text-xs">{p.role} • {fmt(p.basePrice)}</div></div>
                {auctionStatus === 'idle' && !soldToast && !unsoldToast && <span className="ml-auto text-ipl-orange/60 text-xs shrink-0">▶</span>}
              </button>
            ))}
            {playerQueue.length === 0 && unsoldPlayers.length === 0 && <div className="text-center text-white/30 text-sm py-8">All players auctioned!</div>}
            {playerQueue.length === 0 && unsoldPlayers.length > 0 && <div className="text-center text-yellow-400/50 text-sm py-4">No players left. Use Re-Auction on unsold players!</div>}
          </div>
        </div>

        {/* CENTER COLUMN: LIVE ROUND CONTROL */}
        <div className="flex-1 flex flex-col items-center justify-center py-6 px-4 overflow-hidden relative min-h-[500px]">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(255,107,0,0.04) 0%, transparent 65%)' }} />
          <AnimatePresence mode="wait">
            {!soldToast && !unsoldToast && auctionStatus === 'idle' && !currentPlayer && (
              <div className="flex flex-col items-center justify-center gap-6"><div className="text-8xl animate-pulse">🔨</div><div className="font-bebas text-4xl tracking-widest text-white/20 text-center">SELECT A PLAYER TO START</div><div className="text-white/30 text-center max-w-xs">Click any player from the queue on the left to begin the auction</div></div>
            )}
            {!soldToast && !unsoldToast && currentPlayer && auctionStatus !== 'unsold' && (
              <div className="flex flex-col items-center justify-center w-full max-w-sm"><CurrentPlayerCard player={currentPlayer} status={auctionStatus} /></div>
            )}
          </AnimatePresence>

          {/* RTM ACTIVE OVERRIDE BANNER */}
          {state.rtmState && state.rtmState.pending && (
            <div className="w-full max-w-sm my-4 bg-amber-500/20 border-2 border-amber-500 rounded-2xl p-4 text-center">
              <div className="font-bebas text-2xl text-amber-300">🚨 RTM IN PROGRESS FOR {state.rtmState.rtmTeam}</div>
              <div className="text-xs text-white/70 font-rajdhani my-1">Waiting for former team to exercise or pass. (Timer: {state.rtmState.timer}s)</div>
              <div className="flex justify-center gap-2 mt-3">
                <button onClick={exerciseRTM} className="bg-green-600 text-white font-bebas px-4 py-1.5 rounded-lg text-sm cursor-pointer">FORCE EXERCISE RTM</button>
                <button onClick={declineRTM} className="bg-red-600 text-white font-bebas px-4 py-1.5 rounded-lg text-sm cursor-pointer">FORCE PASS RTM</button>
              </div>
            </div>
          )}

          {!soldToast && !unsoldToast && currentPlayer && (auctionStatus === 'live' || auctionStatus === 'hammer') && (
            <div className="w-full max-w-sm mt-4">
              <PriceDisplay price={currentPrice} leadingTeam={leadingTeam} />
              <div className="flex items-center justify-center gap-6 mt-2">
                <TimerRing timer={timer} status={auctionStatus} />
                <div className="flex flex-col gap-2">
                  <button onClick={markSold} disabled={!leadingTeam || auctionStatus !== 'live'} className="px-8 py-3 font-bebas text-2xl bg-green-500/20 border border-green-500/40 text-green-400 rounded-xl disabled:opacity-30 hover:bg-green-500/30 cursor-pointer">✅ SOLD</button>
                  <button onClick={markUnsold} disabled={auctionStatus !== 'live'} className="px-8 py-3 font-bebas text-2xl bg-red-500/20 border border-red-500/40 text-red-400 rounded-xl disabled:opacity-30 hover:bg-red-500/30 cursor-pointer">❌ UNSOLD</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: LIVE BIDS, BUDGETS & SOLD/UNSOLD HISTORY */}
        <div className="w-80 shrink-0 border-l border-white/5 flex flex-col overflow-y-auto">
          <div className="flex-shrink-0"><div className="px-4 py-3 border-b border-white/5"><span className="font-bebas text-lg tracking-widest text-white/60">LIVE BID FEED</span></div><div className="p-2 space-y-1.5 max-h-40 overflow-y-auto">
            {bids.length === 0 ? <div className="text-center text-white/20 text-sm py-6">No bids yet</div> : bids.map((bid) => { const t = getTeam(bid.team); return (<div key={bid.ts} className="glass-card px-3 py-2 flex items-center gap-2"><span className="text-lg">{t?.emoji}</span><div className="flex-1"><div className="font-bold text-xs">{t?.id}</div></div><span className="font-bebas text-lg text-ipl-gold">{fmt(bid.amount)}</span></div>) })}
          </div></div>
          <div className="flex-shrink-0 border-t border-white/5"><div className="px-4 py-3 border-b border-white/5"><span className="font-bebas text-lg tracking-widest text-white/60">TEAM BUDGETS</span></div><div className="p-2 space-y-1 max-h-40 overflow-y-auto">
            {TEAMS.map(team => { const remaining = teamBudgets[team.id], pct = (remaining / team.budget) * 100, isConnected = connectedTeams.includes(team.id); return (<div key={team.id} className="flex items-center gap-2 px-1 py-1"><span className="text-base w-5">{team.emoji}</span><div className="flex-1"><div className="flex justify-between text-xs"><span className="font-bold">{team.id}{isConnected && <span className="ml-1 text-green-400/70">●</span>}</span><span className="text-white/50">₹{remaining}Cr</span></div><div className="h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${team.color}, ${team.light})` }} /></div></div></div>) })}
          </div></div>
          <div className="flex-shrink-0 border-t border-white/5"><div className="px-4 py-3 border-b border-white/5 bg-green-500/5"><span className="font-bebas text-lg tracking-widest text-green-400">✅ SOLD PLAYERS</span><span className="ml-2 text-green-400 text-sm">({soldPlayers.length})</span></div><div className="p-2 space-y-2 max-h-40 overflow-y-auto">
            {soldPlayers.length === 0 ? <div className="text-center text-white/20 text-sm py-4">No players sold yet</div> : soldPlayers.map((player, idx) => { const team = getTeam(player.soldTo); return (<div key={idx} className="glass-card px-3 py-2 border-l-4 border-green-500"><div className="flex items-center justify-between"><div className="flex items-center gap-2 flex-1 min-w-0">{player.photo ? <img src={player.photo} alt={player.name} className="w-8 h-8 rounded-full object-cover" /> : <span className="text-lg">🏏</span>}<div><div className="font-bold text-sm truncate">{player.name}</div><div className="text-white/40 text-xs">{player.role}</div></div></div><div className="text-right shrink-0 ml-2"><div className="text-ipl-gold font-bebas text-sm">{fmt(player.soldPrice)}</div><div className="flex items-center gap-1 justify-end"><div className="w-5 h-5 rounded-full flex items-center justify-center text-xs" style={{ background: `linear-gradient(135deg, ${team?.color}, ${team?.light})` }}>{team?.emoji}</div><span className="text-white/60 text-xs">{player.soldTo}</span></div></div></div></div>) })}
          </div></div>
          <div className="flex-shrink-0 border-t border-white/5"><div className="px-4 py-3 border-b border-white/5 bg-red-500/5"><span className="font-bebas text-lg tracking-widest text-red-400">❌ UNSOLD PLAYERS</span><span className="ml-2 text-red-400 text-sm">({unsoldPlayers.length})</span></div><div className="p-2 space-y-2 max-h-40 overflow-y-auto">
            {unsoldPlayers.length === 0 ? <div className="text-center text-white/20 text-sm py-4">No unsold players</div> : unsoldPlayers.map((player, idx) => (<div key={idx} className="glass-card px-3 py-2 border-l-4 border-red-500"><div className="flex items-center justify-between"><div className="flex items-center gap-2 flex-1 min-w-0">{player.photo ? <img src={player.photo} alt={player.name} className="w-8 h-8 rounded-full object-cover" /> : <span className="text-lg">🏏</span>}<div><div className="font-bold text-sm truncate">{player.name}</div><div className="text-white/40 text-xs">{player.role}</div><div className="text-red-400 text-xs">Base: {fmt(player.basePrice)}</div></div></div><button onClick={() => reAddUnsoldPlayer(player)} className="bg-blue-500/30 hover:bg-blue-500/50 text-blue-300 text-xs px-3 py-1 rounded-full flex items-center gap-1 cursor-pointer">🔄 Re-Auction</button></div></div>))}
          </div></div>
        </div>
      </div>

      <AnimatePresence>
        {showPlayersList && <PlayersListModal onClose={() => setShowPlayersList(false)} onAddPlayer={handleAddPlayer} allPlayers={allPlayers} />}
      </AnimatePresence>
    </div>
  )
}