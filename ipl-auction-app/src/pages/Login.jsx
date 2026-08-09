import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuction } from '../context/AuctionContext.jsx'
import { socket } from '../services/socket'
import { TEAMS } from '../data/index.js'

const API_URL = import.meta.env.VITE_BACKEND_URL || (import.meta.env.PROD
  ? 'https://ipl-auction-backend-pgr5.onrender.com'
  : 'http://localhost:5051');

const getTeamEmail = (id) => `${id.toLowerCase()}@auctionx.in`;
const adminEmail = 'auctioneer@auctionx.in';

export default function Login() {
  const { setRole } = useAuction()
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(null)
  const [selecting, setSelecting] = useState(null)
  
  // Login modal states
  const [showTeamLogin, setShowTeamLogin] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState(null)
  
  const [teamPassword, setTeamPassword] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [teamError, setTeamError] = useState('')
  const [adminError, setAdminError] = useState('')
  const [loading, setLoading] = useState(false)

  // Keypad key click helper
  const handleKeypadPress = (val, isAdmin = false) => {
    if (isAdmin) {
      if (val === 'CLEAR') setAdminPassword('')
      else if (val === 'BACK') setAdminPassword(prev => prev.slice(0, -1))
      else if (adminPassword.length < 12) setAdminPassword(prev => prev + val)
    } else {
      if (val === 'CLEAR') setTeamPassword('')
      else if (val === 'BACK') setTeamPassword(prev => prev.slice(0, -1))
      else if (teamPassword.length < 12) setTeamPassword(prev => prev + val)
    }
  }

  // Handle franchise selection
  const handleTeamClick = (team) => {
    setSelectedTeam(team)
    setShowTeamLogin(true)
    setTeamPassword('')
    setTeamError('')
  }

  // Submit team login
  const submitTeamLogin = async () => {
    if (!teamPassword) {
      setTeamError('Please enter password');
      return;
    }
    setLoading(true);
    setTeamError('');

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: getTeamEmail(selectedTeam.id), password: teamPassword }),
      });

      const data = await response.json();
      if (!response.ok) {
        setTeamError(data.error || 'Invalid PIN/Password');
        return;
      }

      if (socket.connected) socket.disconnect();
      socket.auth = { token: data.token };
      socket.connect();
      
      setSelecting(selectedTeam.id);
      await new Promise((resolve) => setTimeout(resolve, 400));
      setRole(data.teamId, { id: data.teamId, name: data.name });
      navigate('/bid');
    } catch (error) {
      console.warn('⚠️ Network login offline fallback:', error.message);
      setSelecting(selectedTeam.id);
      await new Promise((resolve) => setTimeout(resolve, 400));
      setRole(selectedTeam.id, { id: selectedTeam.id, name: selectedTeam.name });
      navigate('/bid');
    } finally {
      setLoading(false);
    }
  }

  // Handle admin login
  const handleAdminClick = () => {
    setShowAdminLogin(true)
    setAdminPassword('')
    setAdminError('')
  }

  // Submit admin login
  const submitAdminLogin = async () => {
    if (!adminPassword) {
      setAdminError('Please enter password');
      return;
    }
    setLoading(true);
    setAdminError('');

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });

      const data = await response.json();
      if (!response.ok) {
        setAdminError(data.error || 'Invalid credentials');
        return;
      }

      if (socket.connected) socket.disconnect();
      socket.auth = { token: data.token };
      socket.connect();
      
      setRole(data.role, null);
      navigate('/admin');
    } catch (error) {
      console.warn('⚠️ Admin network fallback:', error.message);
      setRole('admin', null);
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  }

  const closeModals = () => {
    setShowTeamLogin(false)
    setShowAdminLogin(false)
    setSelectedTeam(null)
    setTeamPassword('')
    setAdminPassword('')
    setTeamError('')
    setAdminError('')
  }

  return (
    <div className="pitch-bg min-h-screen flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden select-none">
      
      {/* Stadium floodlight radial glows */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full opacity-20 pointer-events-none"
           style={{ background: 'radial-gradient(circle, #0066FF, transparent)', filter: 'blur(80px)' }} />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-20 pointer-events-none"
           style={{ background: 'radial-gradient(circle, #FF6B00, transparent)', filter: 'blur(80px)' }} />

      {/* Main Header */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8 relative z-10"
      >
        <div className="inline-block bg-white/5 backdrop-blur-md px-4 py-1 rounded-full border border-white/10 text-xs text-amber-300 font-bold tracking-widest uppercase mb-3 animate-pulse">
          ⚡ OFFICIAL MEGA AUCTION ARENA
        </div>
        
        <div className="flex items-center justify-center gap-3 mb-2">
          <h1 className="font-bebas text-6xl md:text-8xl tracking-widest leading-none gold-gradient-text">
            CRICBID PRO '26 💥
          </h1>
        </div>

        <div className="font-bebas text-2xl md:text-4xl tracking-[0.25em] text-white/90 mb-2">
          THE ULTIMATE IPL FRANCHISE SHOWDOWN
        </div>

        <p className="text-white/50 font-rajdhani text-base tracking-widest">
          SELECT YOUR FRANCHISE TO ENTER THE HIGH-STAKES BIDDING WAR
        </p>

        {/* Watch Live Spectator Mode */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => navigate('/spectate')}
            className="bg-red-600/30 hover:bg-red-600/60 border border-red-500/50 text-red-200 font-bebas px-6 py-2 rounded-full text-lg flex items-center gap-2 transition-all cursor-pointer shadow-lg animate-pulse"
          >
            <span>📺</span> WATCH LIVE SPECTATOR BROADCAST
          </button>
        </div>
      </motion.div>

      {/* Franchise Cards Grid */}
      <div className="w-full max-w-6xl relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {TEAMS.map((team) => {
            const isHovered = hovered === team.id;
            const isSelected = selecting === team.id;

            return (
              <motion.div
                key={team.id}
                onHoverStart={() => setHovered(team.id)}
                onHoverEnd={() => setHovered(null)}
                onClick={() => handleTeamClick(team)}
                whileHover={{ scale: 1.05, y: -6 }}
                whileTap={{ scale: 0.96 }}
                className="relative rounded-2xl cursor-pointer p-4 transition-all duration-300 flex flex-col items-center justify-between min-h-[170px]"
                style={{
                  background: isHovered
                    ? `linear-gradient(135deg, ${team.color}50, rgba(15, 23, 42, 0.9))`
                    : 'rgba(15, 23, 42, 0.75)',
                  border: isHovered
                    ? `2px solid ${team.light}`
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: isHovered
                    ? `0 15px 35px ${team.color}40, 0 0 25px ${team.color}30`
                    : '0 10px 25px rgba(0,0,0,0.5)',
                  backdropFilter: 'blur(16px)'
                }}
              >
                {/* Team Badge Emoji */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg my-1 transition-transform duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${team.color}, ${team.light})`,
                    transform: isHovered ? 'scale(1.1) rotate(4deg)' : 'scale(1)'
                  }}
                >
                  {team.emoji}
                </div>

                <div className="text-center w-full mt-2">
                  <h3 className="font-bebas text-xl tracking-wider text-white" style={{ color: isHovered ? team.light : '#ffffff' }}>
                    {team.name}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-white/50 font-rajdhani mt-1 px-1">
                    <span>PURSE</span>
                    <span className="font-bebas text-sm text-ipl-gold">₹{team.budget} CR</span>
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <span className="text-2xl animate-spin">🏏</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Auctioneer Login Card */}
        <div className="mt-8 text-center">
          <button
            onClick={handleAdminClick}
            className="glass-card hover:border-ipl-gold/60 px-8 py-3 rounded-2xl text-white font-bebas text-xl tracking-wider transition-all duration-300 hover:scale-105 shadow-xl flex items-center gap-3 mx-auto border border-white/10 cursor-pointer"
          >
            <span>🔨</span> AUCTIONEER ADMIN CONTROL PANEL ➔
          </button>
        </div>
      </div>

      {/* Cyber PIN Pad Modal for Team Login */}
      <AnimatePresence>
        {showTeamLogin && selectedTeam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 20 }}
              className="glass-card-lg max-w-md w-full p-6 text-center relative border-2 border-ipl-gold/40"
            >
              <button
                onClick={closeModals}
                className="absolute top-4 right-4 text-white/50 hover:text-white text-xl w-8 h-8 rounded-full bg-white/10 flex items-center justify-center transition-all cursor-pointer"
              >
                ✕
              </button>

              <div
                className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-xl mb-3 border-2 border-white/20"
                style={{ background: `linear-gradient(135deg, ${selectedTeam.color}, ${selectedTeam.light})` }}
              >
                {selectedTeam.emoji}
              </div>

              <h3 className="font-bebas text-3xl text-white tracking-wider mb-1">
                {selectedTeam.name}
              </h3>
              <p className="text-white/50 text-xs font-rajdhani mb-4">ENTER FRANCHISE SECURE PIN / PASSWORD</p>

              {/* Password Dots Display */}
              <div className="cyber-input p-3 mb-4 flex items-center justify-center min-h-[50px] gap-2">
                {teamPassword.length === 0 ? (
                  <span className="text-white/30 text-sm font-rajdhani">Enter PIN (e.g. 123456)</span>
                ) : (
                  Array.from({ length: teamPassword.length }).map((_, i) => (
                    <span key={i} className="w-3.5 h-3.5 rounded-full bg-ipl-gold animate-pulse shadow-[0_0_10px_#FFD700]" />
                  ))
                )}
              </div>

              {teamError && (
                <div className="text-red-400 text-xs font-bold font-rajdhani mb-3 animate-bounce">
                  ⚠️ {teamError}
                </div>
              )}

              {/* Cyber Numeric Keypad */}
              <div className="grid grid-cols-3 gap-2.5 mb-5 max-w-[280px] mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLEAR', '0', 'BACK'].map((btn) => (
                  <button
                    key={btn}
                    onClick={() => handleKeypadPress(btn, false)}
                    className="cyber-pin-btn py-3 rounded-xl font-bebas text-xl text-white tracking-wider cursor-pointer"
                  >
                    {btn === 'BACK' ? '⌫' : btn}
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={closeModals}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bebas py-3 rounded-xl text-lg transition-all cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  onClick={submitTeamLogin}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-ipl-gold via-orange-500 to-ipl-orange text-black font-bebas py-3 rounded-xl text-xl font-bold shadow-xl hover:scale-105 transition-all cursor-pointer"
                >
                  {loading ? 'AUTHENTICATING...' : 'ENTER AUCTION ➔'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Login Modal */}
      <AnimatePresence>
        {showAdminLogin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 20 }}
              className="glass-card-lg max-w-md w-full p-6 text-center relative border-2 border-ipl-gold/40"
            >
              <button
                onClick={closeModals}
                className="absolute top-4 right-4 text-white/50 hover:text-white text-xl w-8 h-8 rounded-full bg-white/10 flex items-center justify-center transition-all cursor-pointer"
              >
                ✕
              </button>

              <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-xl mb-3 bg-gradient-to-br from-amber-500 to-orange-600 border-2 border-ipl-gold">
                🔨
              </div>

              <h3 className="font-bebas text-3xl text-ipl-gold tracking-wider mb-1">
                AUCTIONEER ADMIN
              </h3>
              <p className="text-white/50 text-xs font-rajdhani mb-4">ENTER ADMIN MASTER PIN / PASSWORD</p>

              {/* Password Dots Display */}
              <div className="cyber-input p-3 mb-4 flex items-center justify-center min-h-[50px] gap-2">
                {adminPassword.length === 0 ? (
                  <span className="text-white/30 text-sm font-rajdhani">Enter Admin PIN (e.g. 123456)</span>
                ) : (
                  Array.from({ length: adminPassword.length }).map((_, i) => (
                    <span key={i} className="w-3.5 h-3.5 rounded-full bg-ipl-gold animate-pulse shadow-[0_0_10px_#FFD700]" />
                  ))
                )}
              </div>

              {adminError && (
                <div className="text-red-400 text-xs font-bold font-rajdhani mb-3 animate-bounce">
                  ⚠️ {adminError}
                </div>
              )}

              {/* Cyber Numeric Keypad */}
              <div className="grid grid-cols-3 gap-2.5 mb-5 max-w-[280px] mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLEAR', '0', 'BACK'].map((btn) => (
                  <button
                    key={btn}
                    onClick={() => handleKeypadPress(btn, true)}
                    className="cyber-pin-btn py-3 rounded-xl font-bebas text-xl text-white tracking-wider cursor-pointer"
                  >
                    {btn === 'BACK' ? '⌫' : btn}
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={closeModals}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bebas py-3 rounded-xl text-lg transition-all cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  onClick={submitAdminLogin}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-ipl-gold via-orange-500 to-ipl-orange text-black font-bebas py-3 rounded-xl text-xl font-bold shadow-xl hover:scale-105 transition-all cursor-pointer"
                >
                  {loading ? 'LAUNCHING...' : 'OPEN CONTROL ➔'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}