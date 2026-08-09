import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuction } from '../context/AuctionContext.jsx'
import { TEAMS, getTeam } from '../data/index.js'
import ReactConfetti from 'react-confetti'
import RtmModal from '../components/RtmModal.jsx'
import ChatDrawer from '../components/ChatDrawer.jsx'
import AnalyticsModal from '../components/AnalyticsModal.jsx'
import PitchBuilder from '../components/PitchBuilder.jsx'
import BiddingWarClash from '../components/BiddingWarClash.jsx'
import { soundService } from '../services/sound.js'

const fmt = (cr) => {
  if (!cr && cr !== 0) return '—'
  if (cr >= 1) return `₹${cr.toFixed(2)} Cr`
  return `₹${(cr * 100).toFixed(0)} L`
}

/* ── Increment logic ── */
const nextBid = (cur) => {
  if (cur < 1)   return +(cur + 0.25).toFixed(2)
  if (cur < 5)   return +(cur + 0.50).toFixed(2)
  if (cur < 10)  return +(cur + 1.00).toFixed(2)
  return +(cur + 2.00).toFixed(2)
}

/* ── Circular countdown ring ── */
function TimerRing({ timer, max = 15, status }) {
  const r = 52
  const circ = 2 * Math.PI * r
  const dash  = circ * (Math.max(0, timer) / max)
  const color = timer > 8 ? '#4ade80' : timer > 4 ? '#FFD700' : '#FF4444'
  return (
    <div className="relative" style={{ width: 130, height: 130 }}>
      <svg width="130" height="130" className="-rotate-90" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle cx="65" cy="65" r={r} fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circ}
          strokeDashoffset={circ - dash}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s',
            filter: `drop-shadow(0 0 8px ${color})`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {status === 'hammer'
          ? <span className="text-4xl">🔨</span>
          : <span className="font-bebas text-5xl" style={{ color, textShadow: `0 0 20px ${color}` }}>
              {timer}
            </span>
        }
        <span className="text-white/30 font-rajdhani text-xs tracking-widest">SECS</span>
      </div>
    </div>
  )
}

/* ── Player spotlight card ── */
function PlayerSpotlight({ player }) {
  if (!player) return null
  const isBowler = player.role === 'Bowler'
  const isOverseas = player.country && !player.country.includes('India')

  return (
    <motion.div
      key={player.id}
      initial={{ opacity: 0, scale: 0.8, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0  }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      transition={{ type: 'spring', stiffness: 200, damping: 22 }}
      className={`relative rounded-3xl overflow-hidden w-full bg-gradient-to-br ${player.bg} border-2 border-ipl-gold/50 stadium-glow-gold`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 via-transparent to-black/40 pointer-events-none" />
      <div className="p-5 flex items-center gap-4 relative z-10">
        {/* PLAYER PHOTO */}
        <div className="shrink-0">
          {player.photo ? (
            <img 
              src={player.photo} 
              alt={player.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-ipl-gold shadow-2xl"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-black/40 border-2 border-ipl-gold flex items-center justify-center text-5xl shadow-2xl">
              🏏
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bebas text-3xl tracking-wider truncate text-white">{player.name}</h2>
          <div className="flex gap-2 flex-wrap mt-1">
            <span className="bg-black/40 rounded-full px-2.5 py-0.5 text-xs font-rajdhani text-amber-300 font-bold border border-amber-400/30 uppercase tracking-widest">
              {player.role}
            </span>
            <span className="text-sm">{player.country}</span>
            {isOverseas && (
              <span className="bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-full px-2 py-0.5 text-[10px] font-bold">
                ✈️ OVERSEAS
              </span>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-bebas text-xl text-ipl-gold tracking-wider border-2 border-ipl-gold/50 bg-black/50
                          rounded-xl px-3 py-1 shadow-lg">
            {player.grade}
          </div>
          {player.t20Rating && (
            <div className="text-amber-300 font-bebas text-sm mt-1">
              ⭐ T20 RATING: {player.t20Rating}/100
            </div>
          )}
          <div className="text-white/50 text-[10px] tracking-widest mt-1">BASE PRICE</div>
          <div className="font-bebas text-lg text-ipl-gold">{fmt(player.basePrice)}</div>
          {player.fairVal && (
            <div className="text-emerald-400 text-[10px] font-bold">
              FAIR VAL: ₹{player.fairVal} Cr
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2.5 px-5 pb-5 relative z-10">
        <MiniStat label="CAPS" value={player.caps} />
        {isBowler
          ? <><MiniStat label="WICKETS" value={player.wickets} /><MiniStat label="ECO" value={player.economy} /></>
          : <><MiniStat label="AVG" value={player.avg} /><MiniStat label="SR" value={player.sr} /></>
        }
      </div>
    </motion.div>
  )
}

function MiniStat({ label, value }) {
  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-xl p-2 text-center border border-white/10 shadow-inner">
      <div className="text-white/50 text-[10px] font-rajdhani tracking-widest">{label}</div>
      <div className="font-bebas text-lg text-ipl-gold">{value ?? '—'}</div>
    </div>
  )
}

/* ══════════════ MAIN TEAM BIDDING PAGE ══════════════ */
export default function TeamBidding() {
  const { state, placeBid, exerciseRTM, declineRTM, sendChatMessage } = useAuction()
  const {
    role, teamInfo: info,
    currentPlayer, currentPrice, leadingTeam,
    auctionStatus, timer,
    bids, teamBudgets, teamSquads, soldPlayers, chatMessages,
  } = state

  const navigate = useNavigate()
  const myTeam  = getTeam(role)
  const myColor = myTeam?.color ?? '#FF6B00'
  const myLight = myTeam?.light ?? '#FF9933'
  const myBudget  = teamBudgets[role] ?? 100
  const mySquad   = teamSquads[role]  ?? []
  const isLeading = leadingTeam === role
  const next      = nextBid(currentPrice)

  // Overseas player rule check
  const isOverseas = currentPlayer?.country && !currentPlayer.country.includes('India')
  const myOverseasCount = mySquad.filter(p => p.country && !p.country.includes('India')).length
  const overseasLimitHit = isOverseas && myOverseasCount >= 8

  const canBid    = auctionStatus === 'live' && !isLeading && myBudget >= next && !overseasLimitHit

  const [bidAnim, setBidAnim] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showPitch, setShowPitch] = useState(false)
  const [muted, setMuted] = useState(soundService.isMuted())
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight })
  const prevStatus = useRef(auctionStatus)

  /* toggle sound */
  const toggleSound = () => {
    const nextMuted = !muted
    setMuted(nextMuted)
    soundService.setMuted(nextMuted)
  }

  /* detect just-sold + we won */
  useEffect(() => {
    if (prevStatus.current !== 'sold' && auctionStatus === 'sold') {
      const last = soldPlayers[soldPlayers.length - 1]
      if (last?.soldTo === role) {
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 4000)
      }
    }
    prevStatus.current = auctionStatus
  }, [auctionStatus, soldPlayers, role])

  useEffect(() => {
    const onResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const handleBid = () => {
    if (!canBid) return
    setBidAnim(true)
    setTimeout(() => setBidAnim(false), 400)
    placeBid(role, next)
  }

  return (
    <div className="pitch-bg min-h-screen flex flex-col text-white font-rajdhani overflow-hidden relative">

      {showConfetti && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={400}
          colors={[myColor, myLight, '#FFD700', '#ffffff']}
        />
      )}

      {/* RTM Overlay Pop-up */}
      <RtmModal
        rtmState={state.rtmState}
        currentTeamId={role}
        onExercise={exerciseRTM}
        onDecline={declineRTM}
        teams={TEAMS}
      />

      {/* Chat Drawer */}
      <ChatDrawer
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        messages={chatMessages}
        onSendMessage={sendChatMessage}
        currentUser={{ role: 'team', teamId: role, name: myTeam?.name }}
        teams={TEAMS}
      />

      {/* Analytics Modal */}
      <AnalyticsModal
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        state={{ ...state, teamInfo: myTeam }}
        teams={TEAMS}
      />

      {/* Pitch Builder Modal */}
      <PitchBuilder
        isOpen={showPitch}
        onClose={() => setShowPitch(false)}
        teamSquad={mySquad}
        teamName={myTeam?.name}
        teamEmoji={myTeam?.emoji}
      />

      {/* ── Team Header ── */}
      <div className="relative px-4 py-3 flex items-center justify-between border-b border-white/5"
           style={{ background: `linear-gradient(135deg, ${myColor}25, transparent)`,
                    borderBottom: `1px solid ${myColor}30` }}>
        <div className="absolute inset-0 opacity-20"
             style={{ background: `radial-gradient(ellipse at left, ${myColor}40, transparent 70%)` }} />
        <div className="relative flex items-center gap-3">
          <span className="text-3xl">{myTeam?.emoji}</span>
          <div>
            <div className="font-bebas text-2xl tracking-widest"
                 style={{ color: myColor === '#FFB800' ? '#FFD055' : myLight }}>
              {myTeam?.id}
            </div>
            <div className="text-white/40 text-xs tracking-wider">{myTeam?.name}</div>
          </div>
        </div>

        {/* Action Controls & Stats */}
        <div className="relative flex items-center gap-2 sm:gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-white/40 text-[10px]">OVERSEAS</div>
            <div className={`font-bebas text-lg ${myOverseasCount >= 8 ? 'text-red-400' : 'text-emerald-400'}`}>
              ✈️ {myOverseasCount}/8
            </div>
          </div>

          <div className="text-right">
            <div className="text-white/40 text-xs">PURSE</div>
            <div className="font-bebas text-xl text-ipl-gold">₹{myBudget} Cr</div>
          </div>

          <div className="text-right">
            <div className="text-white/40 text-xs">SQUAD</div>
            <div className="font-bebas text-xl text-cyan-400">{mySquad.length}</div>
          </div>

          {/* Chat Toggle Button */}
          <button
            onClick={() => setShowChat(true)}
            className="bg-white/10 hover:bg-white/20 p-2 rounded-xl border border-white/10 text-lg relative cursor-pointer"
            title="Chat Room"
          >
            💬
            {chatMessages && chatMessages.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-ipl-gold rounded-full animate-ping" />
            )}
          </button>

          {/* Pitch Builder Button */}
          <button
            onClick={() => setShowPitch(true)}
            className="bg-emerald-500/20 hover:bg-emerald-500/40 p-2 rounded-xl border border-emerald-500/30 text-lg cursor-pointer"
            title="3D Playing XI Pitch Builder"
          >
            🏏
          </button>

          {/* Analytics Toggle Button */}
          <button
            onClick={() => setShowAnalytics(true)}
            className="bg-white/10 hover:bg-white/20 p-2 rounded-xl border border-white/10 text-lg cursor-pointer"
            title="Squad Analytics"
          >
            📊
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="bg-white/10 hover:bg-white/20 p-2 rounded-xl border border-white/10 text-lg cursor-pointer"
            title={muted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {muted ? '🔇' : '🔊'}
          </button>

          <button
            onClick={() => navigate('/')}
            className="text-white/30 hover:text-red-400 text-xs border border-white/10 px-2 py-1 rounded-lg transition-all cursor-pointer"
          >
            Exit
          </button>
        </div>
      </div>

      {/* High-Stakes Bidding War Clash Banner */}
      <BiddingWarClash
        currentPrice={currentPrice}
        leadingTeamObj={getTeam(leadingTeam)}
        bids={bids}
        teams={TEAMS}
      />

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col items-center justify-between px-4 py-4 max-w-lg mx-auto w-full">

        {/* IDLE state: Broadcast Pre-Show Arena Lounge */}
        <AnimatePresence mode="wait">
          {auctionStatus === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full flex flex-col items-center gap-5 my-auto py-4"
            >
              {/* Standby Banner */}
              <div className="w-full glass-card-lg p-5 text-center relative overflow-hidden border-2 border-ipl-gold/30 stadium-glow-gold">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-950/40 via-amber-500/10 to-orange-950/40 pointer-events-none" />
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 font-bebas px-4 py-1 rounded-full text-xs font-bold tracking-widest mb-2 border border-amber-400/40 animate-pulse">
                    <span>🔴 AUCTION STAGE STANDBY</span>
                  </div>
                  <h2 className="font-bebas text-3xl md:text-4xl text-white tracking-widest">
                    WAITING FOR AUCTIONEER TO CALL NEXT PLAYER
                  </h2>
                  <p className="text-white/60 font-rajdhani text-xs mt-1">
                    The auctioneer is preparing the next player card. Get your bidding strategy ready!
                  </p>
                </div>
              </div>

              {/* Franchise Quick Stats Bar */}
              <div className="w-full grid grid-cols-3 gap-3">
                <div className="bg-slate-900/80 border border-white/10 p-3 rounded-2xl text-center">
                  <div className="text-white/40 text-[10px] tracking-widest font-rajdhani">PURSE REMAINING</div>
                  <div className="font-bebas text-2xl text-ipl-gold">₹{myBudget} CR</div>
                </div>
                <div className="bg-slate-900/80 border border-white/10 p-3 rounded-2xl text-center">
                  <div className="text-white/40 text-[10px] tracking-widest font-rajdhani">RTM CARDS</div>
                  <div className="font-bebas text-2xl text-amber-400">🎟️ {state.teamRtmCounts?.[role] ?? 3} LEFT</div>
                </div>
                <div className="bg-slate-900/80 border border-white/10 p-3 rounded-2xl text-center">
                  <div className="text-white/40 text-[10px] tracking-widest font-rajdhani">SQUAD SIZE</div>
                  <div className="font-bebas text-2xl text-cyan-400">{mySquad.length} / 25</div>
                </div>
              </div>

              {/* Upcoming Players Queue Preview */}
              {state.playerQueue && state.playerQueue.length > 0 && (
                <div className="w-full glass-card p-4 rounded-2xl border border-white/10 text-left">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bebas text-lg text-ipl-gold tracking-wider flex items-center gap-2">
                      <span>🔥</span> UPCOMING PLAYERS IN QUEUE
                    </span>
                    <span className="text-white/40 text-xs font-rajdhani">{state.playerQueue.length} Players Left</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {state.playerQueue.slice(0, 3).map((p) => (
                      <div key={p.id} className="bg-black/40 border border-white/10 p-2.5 rounded-xl text-center flex flex-col items-center">
                        {p.photo ? (
                          <img src={p.photo} alt={p.name} className="w-10 h-10 rounded-full object-cover border border-ipl-gold/40 mb-1" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl mb-1">🏏</div>
                        )}
                        <div className="font-bebas text-sm text-white truncate w-full">{p.name}</div>
                        <div className="text-[10px] text-amber-300 font-bold">{p.role}</div>
                        <div className="text-[10px] text-white/50">Base: ₹{p.basePrice} Cr</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Lounge Action Buttons */}
              <div className="w-full flex gap-3">
                <button
                  onClick={() => setShowPitch(true)}
                  className="flex-1 bg-gradient-to-r from-emerald-600/30 to-teal-600/30 hover:from-emerald-600/50 hover:to-teal-600/50 border border-emerald-500/40 text-emerald-200 font-bebas p-3 rounded-2xl text-lg flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
                >
                  <span>🏏</span> BUILD PLAYING XI
                </button>
                <button
                  onClick={() => setShowAnalytics(true)}
                  className="flex-1 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bebas p-3 rounded-2xl text-lg flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
                >
                  <span>📊</span> SQUAD ANALYTICS
                </button>
                <button
                  onClick={() => setShowChat(true)}
                  className="bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 font-bebas p-3 rounded-2xl text-lg flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
                  title="Team Chat"
                >
                  <span>💬</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* LIVE / HAMMER state */}
          {(auctionStatus === 'live' || auctionStatus === 'hammer') && currentPlayer && (
            <motion.div
              key="live"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full flex flex-col gap-4"
            >
              {/* Player card */}
              <AnimatePresence mode="wait">
                <PlayerSpotlight player={currentPlayer} key={currentPlayer.id} />
              </AnimatePresence>

              {/* Price display */}
              <div className="glass-card-lg p-4 flex items-center justify-between">
                <div>
                  <div className="text-white/40 text-xs tracking-widest mb-1">CURRENT BID</div>
                  <motion.div
                    key={currentPrice}
                    initial={{ scale: 1.4, opacity: 0.6 }}
                    animate={{ scale: 1,   opacity: 1   }}
                    transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                    className="font-bebas text-4xl"
                    style={{ color: '#FFD700', textShadow: '0 0 20px rgba(255,215,0,0.6)' }}
                  >
                    {fmt(currentPrice)}
                  </motion.div>

                  <AnimatePresence>
                    {leadingTeam && (
                      <motion.div
                        key={leadingTeam}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-1 mt-1"
                      >
                        {isLeading
                          ? <span className="text-green-400 font-bold text-sm animate-pulse">🏆 YOU ARE LEADING!</span>
                          : <>
                              <span className="text-sm">{getTeam(leadingTeam)?.emoji}</span>
                              <span className="text-sm font-bold"
                                    style={{ color: getTeam(leadingTeam)?.light }}>
                                {leadingTeam}
                              </span>
                              <span className="text-white/40 text-xs">is leading</span>
                            </>
                        }
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Timer */}
                <TimerRing timer={timer} status={auctionStatus} />
              </div>

              {/* BID BUTTON */}
              <div className="flex flex-col items-center gap-3">
                <motion.button
                  onClick={handleBid}
                  disabled={!canBid}
                  animate={bidAnim ? { scale: [1, 0.93, 1.07, 1] } : {}}
                  whileTap={canBid ? { scale: 0.94 } : {}}
                  className={`w-full py-5 rounded-2xl font-bebas text-4xl tracking-widest transition-all duration-200 relative overflow-hidden
                    ${canBid
                      ? 'cursor-pointer'
                      : 'opacity-40 cursor-not-allowed'}`}
                  style={canBid ? {
                    background: `linear-gradient(135deg, ${myColor}, ${myLight})`,
                    boxShadow: `0 8px 40px ${myColor}70, 0 0 80px ${myColor}30`,
                    animation: 'pulseGlow 2s ease-in-out infinite',
                  } : {
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.4)',
                  }}
                >
                  {canBid && (
                    <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity" />
                  )}
                  <span className="relative">
                    {isLeading
                      ? '🏆 YOUR BID — LEADING'
                      : overseasLimitHit
                        ? '✈️ OVERSEAS LIMIT REACHED (8)'
                        : canBid
                          ? `💰 BID  ${fmt(next)}`
                          : auctionStatus === 'hammer'
                            ? '🔨 HAMMER FALLING...'
                            : myBudget < next
                              ? '❌ INSUFFICIENT FUNDS'
                              : 'WAITING...'}
                  </span>
                </motion.button>

                {canBid && (
                  <p className="text-white/30 text-sm">
                    Your budget after bid: <span className="text-white/60 font-bold">₹{(myBudget - next).toFixed(2)} Cr</span>
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* ⭐⭐⭐ ATTRACTIVE SOLD CARD ⭐⭐⭐ */}
          {auctionStatus === 'sold' && (
            <motion.div
              key="sold"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
              className="flex-1 flex flex-col items-center justify-center gap-4 w-full"
            >
              {(() => {
                const last = soldPlayers[soldPlayers.length - 1]
                const winner = getTeam(last?.soldTo)
                const iWon = last?.soldTo === role
                return (
                  <>
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      className="text-8xl"
                    >
                      {iWon ? '🏆🥳' : '💔😔'}
                    </motion.div>
                    
                    <motion.div
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className={`font-bebas text-4xl md:text-5xl tracking-widest text-center ${iWon ? 'text-green-400' : 'text-red-400'}`}
                      style={{ textShadow: iWon ? '0 0 30px #4ade80' : '0 0 30px #f87171' }}
                    >
                      {iWon ? '🎉 PLAYER ACQUIRED! 🎉' : '😢 SOLD AWAY! 😢'}
                    </motion.div>

                    <motion.div
                      initial={{ y: 30, opacity: 0, scale: 0.9 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4, type: 'spring', stiffness: 150 }}
                      className="glass-card-lg p-6 text-center w-full max-w-sm relative overflow-hidden"
                      style={{
                        background: iWon 
                          ? 'linear-gradient(135deg, rgba(74,222,128,0.2), rgba(34,197,94,0.1))' 
                          : 'linear-gradient(135deg, rgba(248,113,113,0.2), rgba(239,68,68,0.1))',
                        border: `2px solid ${iWon ? '#4ade80' : '#f87171'}`,
                      }}
                    >
                      <div className="flex items-center justify-center gap-3 mb-3">
                        {last?.photo && (
                          <img 
                            src={last.photo} 
                            alt={last.name}
                            className="w-12 h-12 rounded-full border-2 border-ipl-gold object-cover"
                          />
                        )}
                        <div className="font-bebas text-3xl text-white">{last?.name}</div>
                      </div>
                      
                      <div className="text-ipl-gold font-bebas text-4xl mt-2" style={{ textShadow: '0 0 20px #FFD700' }}>
                        {fmt(last?.soldPrice)}
                      </div>
                      
                      <div className="flex items-center gap-2 my-3">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/20"></div>
                        <span className="text-white/40 text-xs tracking-wider">SOLD TO</span>
                        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/20"></div>
                      </div>
                      
                      <div className="flex items-center justify-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg"
                          style={{ background: `linear-gradient(135deg, ${winner?.color}, ${winner?.light})` }}
                        >
                          {winner?.emoji}
                        </div>
                        <div className="text-left">
                          <div 
                            className="font-bebas text-2xl tracking-wider"
                            style={{ color: winner?.color === '#FFB800' ? '#FFD055' : winner?.light }}
                          >
                            {winner?.id}
                          </div>
                          <div className="text-white/50 text-xs">{winner?.name}</div>
                        </div>
                      </div>
                      
                      {iWon && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 }}
                          className="mt-4 text-green-400 text-sm font-bold flex items-center justify-center gap-1"
                        >
                          <span>✓</span> Added to your squad
                        </motion.div>
                      )}
                    </motion.div>
                  </>
                )
              })()}
            </motion.div>
          )}

          {/* UNSOLD state */}
          {auctionStatus === 'unsold' && (
            <motion.div
              key="unsold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center gap-4"
            >
              <div className="text-7xl">😮</div>
              <div className="font-bebas text-5xl tracking-widest text-red-400">NO TAKERS!</div>
              <div className="text-white/40 text-center">Player goes unsold this round.</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── My Squad (bottom strip) ── */}
      {mySquad.length > 0 && (
        <div className="border-t border-white/5 px-4 py-3"
             style={{ background: `linear-gradient(0deg, ${myColor}10, transparent)` }}>
          <div className="text-xs text-white/30 font-rajdhani tracking-widest mb-2">MY SQUAD ({mySquad.length})</div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {mySquad.map(p => (
              <div key={p.id} className="shrink-0 glass-card px-3 py-1.5 flex items-center gap-2 min-w-fit">
                {p.photo ? (
                  <img src={p.photo} alt={p.name} className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <span className="text-sm">🏏</span>
                )}
                <div>
                  <div className="font-semibold text-xs whitespace-nowrap">{p.name}</div>
                  <div className="text-ipl-gold text-xs">{fmt(p.price)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget bar at very bottom */}
      <div className="px-4 pb-3 pt-2">
        <div className="flex justify-between text-xs text-white/30 mb-1">
          <span>REMAINING PURSE</span>
          <span>₹{myBudget} Cr / ₹{myTeam?.budget ?? 100} Cr</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${(myBudget / (myTeam?.budget ?? 100)) * 100}%` }}
            transition={{ duration: 0.5 }}
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${myColor}, ${myLight})` }}
          />
        </div>
      </div>
    </div>
  )
}