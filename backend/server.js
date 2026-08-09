const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'replace_with_secure_secret';
const CLIENT_ORIGINS = process.env.CLIENT_ORIGINS
  ? process.env.CLIENT_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: true, // Allow all origins for now to prevent network errors
  methods: ['GET', 'POST'],
  credentials: true,
};

const io = socketIo(server, {
  cors: corsOptions,
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many requests from this IP, please try again later.' },
});

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use('/api/', apiLimiter);

console.log('🏏 IPL Auction Backend Starting...');

const db = require('./db');
const { seed } = require('./seed');
const { samplePlayers: samplePlayersDefault, teams: teamsDefault, userAccounts: userAccountsDefault } = require('./data');

let dbAvailable = false;
let teamsLocal = teamsDefault;
let samplePlayersLocal = [...samplePlayersDefault];
let userAccountsLocal = { ...userAccountsDefault };

async function initDb() {
  if (!db.pool) return;
  try {
    await db.query('SELECT 1');
    dbAvailable = true;
    // If teams table empty, run seed
    const cnt = await db.query('SELECT COUNT(*)::int as cnt FROM teams');
    if (cnt.rows[0].cnt === 0) {
      await seed();
    }
    // Load teams and players into memory
    const tRes = await db.query('SELECT id,name,color,light,emoji,budget FROM teams');
    teamsLocal = tRes.rows.map(r => ({ id: r.id, name: r.name, color: r.color, light: r.light, emoji: r.emoji, budget: parseFloat(r.budget) }));
    const pRes = await db.query('SELECT id,name,role,country,base_price,data FROM players ORDER BY id');
    samplePlayersLocal = pRes.rows.map(r => ({ id: r.id, name: r.name, role: r.role, country: r.country, basePrice: parseFloat(r.base_price), ...r.data }));
    console.log('✅ Database connected — loaded teams and players');
  } catch (err) {
    console.error('❌ DB init failed — continuing in-memory mode', err.message);
    dbAvailable = false;
  }
}

const userAccounts = {
  'auctioneer@auctionx.in': { password: 'Auction123', role: 'admin', name: 'Auctioneer', teamId: null },
  'mi@auctionx.in': { password: 'Auction123', role: 'team', name: 'Mumbai Indians', teamId: 'MI' },
  'csk@auctionx.in': { password: 'Auction123', role: 'team', name: 'Chennai Super Kings', teamId: 'CSK' },
  'rcb@auctionx.in': { password: 'Auction123', role: 'team', name: 'Royal Challengers Bengaluru', teamId: 'RCB' },
  'kkr@auctionx.in': { password: 'Auction123', role: 'team', name: 'Kolkata Knight Riders', teamId: 'KKR' },
  'dc@auctionx.in': { password: 'Auction123', role: 'team', name: 'Delhi Capitals', teamId: 'DC' },
  'pbks@auctionx.in': { password: 'Auction123', role: 'team', name: 'Punjab Kings', teamId: 'PBKS' },
  'rr@auctionx.in': { password: 'Auction123', role: 'team', name: 'Rajasthan Royals', teamId: 'RR' },
  'srh@auctionx.in': { password: 'Auction123', role: 'team', name: 'Sunrisers Hyderabad', teamId: 'SRH' },
  'gt@auctionx.in': { password: 'Auction123', role: 'team', name: 'Gujarat Titans', teamId: 'GT' },
  'lsg@auctionx.in': { password: 'Auction123', role: 'team', name: 'Lucknow Super Giants', teamId: 'LSG' },
};

const bidRateMap = new Map();

const createJwtToken = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: '3h' });

const isValidString = (value) => typeof value === 'string' && value.trim().length > 0;
const isValidNumber = (value) => typeof value === 'number' && Number.isFinite(value);
const isAdminSocket = (socket) => socket.role === 'admin';
const isTeamSocket = (socket) => socket.role === 'team' && typeof socket.teamId === 'string';

const validatePlayerPayload = (player) => {
  return player && isValidNumber(player.id) && isValidString(player.name) && isValidString(player.role) && isValidString(player.country) && isValidNumber(player.basePrice);
};

const validateNewPlayerPayload = (player) => {
  return player && isValidString(player.name) && isValidString(player.role) && isValidString(player.country) && isValidNumber(player.basePrice);
};

let auctionState = {
  currentPlayer: null,
  currentPrice: 0,
  leadingTeam: null,
  auctionStatus: 'idle',
  timer: 15,
  bids: [],
  soldPlayers: [],
  unsoldPlayers: [],
  playerQueue: [...samplePlayersLocal],
  teamBudgets: {
    MI: 100, CSK: 100, RCB: 100, KKR: 100, DC: 100,
    PBKS: 100, RR: 100, SRH: 100, GT: 100, LSG: 100
  },
  teamSquads: {
    MI: [], CSK: [], RCB: [], KKR: [], DC: [],
    PBKS: [], RR: [], SRH: [], GT: [], LSG: []
  },
  connectedTeams: [],
  teamRtmCounts: {
    MI: 3, CSK: 3, RCB: 3, KKR: 3, DC: 3,
    PBKS: 3, RR: 3, SRH: 3, GT: 3, LSG: 3
  },
  rtmState: {
    pending: false,
    player: null,
    bidAmount: 0,
    leadingTeam: null,
    rtmTeam: null,
    timer: 10
  },
  chatMessages: [],
  aiAutoBidEnabled: false
};

let timerInterval = null;
let rtmInterval = null;
let botTimer = null;

function scheduleBotBid() {
  if (!auctionState.aiAutoBidEnabled || auctionState.auctionStatus !== 'live' || !auctionState.currentPlayer) return;

  if (botTimer) clearTimeout(botTimer);

  botTimer = setTimeout(() => {
    if (!auctionState.aiAutoBidEnabled || auctionState.auctionStatus !== 'live' || !auctionState.currentPlayer) return;

    const allTeamIds = Object.keys(auctionState.teamBudgets);
    const offlineOrBotTeams = allTeamIds.filter(t => t !== auctionState.leadingTeam && !auctionState.connectedTeams.includes(t));
    const candidateTeams = offlineOrBotTeams.length > 0 ? offlineOrBotTeams : allTeamIds.filter(t => t !== auctionState.leadingTeam);

    if (candidateTeams.length === 0) return;

    const cur = auctionState.currentPrice;
    let inc = 0.25;
    if (cur >= 10) inc = 2.0;
    else if (cur >= 5) inc = 1.0;
    else if (cur >= 1) inc = 0.5;

    const nextBid = +(cur + inc).toFixed(2);
    const player = auctionState.currentPlayer;
    const isOverseas = player.country && !player.country.includes('India');

    const eligible = candidateTeams.filter(t => {
      const budget = auctionState.teamBudgets[t] || 0;
      if (budget < nextBid) return false;
      const squad = auctionState.teamSquads[t] || [];
      const overseasCount = squad.filter(p => p.country && !p.country.includes('India')).length;
      if (isOverseas && overseasCount >= 8) return false;

      let maxCap = player.fairVal || 12;
      if (player.grade === 'LEGEND') maxCap = 18;
      else if (player.grade === 'A+') maxCap = 16;
      else if (player.grade === 'A') maxCap = 12;
      else maxCap = 8;

      return nextBid <= maxCap;
    });

    if (eligible.length > 0) {
      const chosenTeam = eligible[Math.floor(Math.random() * eligible.length)];
      console.log(`🤖 AI Bot (${chosenTeam}) placing bid of ₹${nextBid} Cr for ${player.name}`);
      auctionState.currentPrice = nextBid;
      auctionState.leadingTeam = chosenTeam;
      auctionState.timer = 10;
      const now = Date.now();
      auctionState.bids = [{ team: chosenTeam, amount: nextBid, ts: now }, ...auctionState.bids.slice(0, 29)];
      io.emit('stateUpdate', auctionState);
      scheduleBotBid();
    }
  }, 1500 + Math.random() * 1000);
}

async function finalizeSale(soldToTeam, soldPrice) {
  if (!auctionState.currentPlayer) return;
  const player = auctionState.currentPlayer;
  const soldRecord = {
    ...player,
    soldTo: soldToTeam,
    soldPrice: soldPrice
  };

  auctionState.soldPlayers.push(soldRecord);
  auctionState.teamBudgets[soldToTeam] = 
    +(auctionState.teamBudgets[soldToTeam] - soldPrice).toFixed(2);
  auctionState.teamSquads[soldToTeam].push({ 
    ...player, 
    price: soldPrice 
  });
  auctionState.auctionStatus = 'sold';
  auctionState.currentPlayer = null;
  auctionState.leadingTeam = null;
  auctionState.bids = [];
  auctionState.rtmState = { pending: false, player: null, bidAmount: 0, leadingTeam: null, rtmTeam: null, timer: 10 };
  
  io.emit('stateUpdate', auctionState);

  if (dbAvailable) {
    try {
      await db.query('INSERT INTO sold_players (player_id, sold_to, sold_price) VALUES ($1,$2,$3)', [soldRecord.id, soldRecord.soldTo, soldRecord.soldPrice]);
      await db.query('UPDATE teams SET budget = $1 WHERE id = $2', [auctionState.teamBudgets[soldRecord.soldTo], soldRecord.soldTo]);
      console.log(`✅ Persisted sold player ${soldRecord.name} (₹${soldRecord.soldPrice} Cr -> ${soldRecord.soldTo}) to Supabase DB`);
    } catch (err) {
      console.error('❌ Failed to persist sold player to Supabase DB:', err.message);
    }
  }

  setTimeout(() => {
    auctionState.auctionStatus = 'idle';
    io.emit('stateUpdate', auctionState);
  }, 3000);
}

function checkRtmOrSell() {
  const leading = auctionState.leadingTeam;
  const player = auctionState.currentPlayer;
  const formerTeam = player?.formerTeam;

  if (leading && player && formerTeam && formerTeam !== leading && (auctionState.teamRtmCounts[formerTeam] || 0) > 0) {
    console.log(`🚨 RTM triggered for ${formerTeam} on player ${player.name}`);
    auctionState.rtmState = {
      pending: true,
      player: player,
      bidAmount: auctionState.currentPrice,
      leadingTeam: leading,
      rtmTeam: formerTeam,
      timer: 10
    };
    auctionState.auctionStatus = 'rtm';
    io.emit('stateUpdate', auctionState);

    if (rtmInterval) clearInterval(rtmInterval);
    rtmInterval = setInterval(() => {
      if (auctionState.rtmState.pending && auctionState.rtmState.timer > 0) {
        auctionState.rtmState.timer--;
        io.emit('stateUpdate', auctionState);
      } else if (auctionState.rtmState.pending && auctionState.rtmState.timer === 0) {
        clearInterval(rtmInterval);
        rtmInterval = null;
        console.log(`⏰ RTM Timer expired for ${formerTeam}. Selling to ${leading}`);
        finalizeSale(leading, auctionState.currentPrice);
      }
    }, 1000);
  } else if (leading && player) {
    finalizeSale(leading, auctionState.currentPrice);
  } else if (player) {
    auctionState.unsoldPlayers.push({
      ...player,
      unsoldAt: Date.now()
    });
    auctionState.auctionStatus = 'unsold';
    auctionState.currentPlayer = null;
    auctionState.bids = [];
    io.emit('stateUpdate', auctionState);
    
    setTimeout(() => {
      auctionState.auctionStatus = 'idle';
      io.emit('stateUpdate', auctionState);
    }, 2000);
  }
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  
  timerInterval = setInterval(() => {
    if (auctionState.auctionStatus === 'live' && auctionState.timer > 0) {
      auctionState.timer--;
      io.emit('timerUpdate', auctionState.timer);
      io.emit('stateUpdate', auctionState);
    } else if (auctionState.timer === 0 && auctionState.auctionStatus === 'live') {
      clearInterval(timerInterval);
      timerInterval = null;
      auctionState.auctionStatus = 'hammer';
      io.emit('stateUpdate', auctionState);
      
      setTimeout(() => {
        checkRtmOrSell();
      }, 2200);
    }
  }, 1000);
}

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    socket.role = 'guest';
    socket.teamId = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('❌ Socket auth failed:', err.message);
      socket.role = 'guest';
      socket.teamId = null;
      return next();
    }

    socket.role = decoded.role;
    socket.teamId = decoded.teamId || null;
    socket.teamName = decoded.name || null;
    next();
  });
});

io.on('connection', (socket) => {
  console.log('🟢 Client connected:', socket.id, 'role:', socket.role, 'team:', socket.teamId);
  
  if (socket.role !== 'admin' && socket.teamId && !auctionState.connectedTeams.includes(socket.teamId)) {
    auctionState.connectedTeams.push(socket.teamId);
  }

  socket.emit('stateUpdate', auctionState);
  socket.emit('teamsList', teamsLocal);
  
  socket.on('startPlayer', (player) => {
    if (!isAdminSocket(socket)) {
      socket.emit('error', 'Unauthorized');
      return;
    }

    if (!validatePlayerPayload(player)) {
      socket.emit('error', 'Invalid player payload');
      return;
    }

    if (auctionState.auctionStatus !== 'idle') {
      socket.emit('error', 'Auction already in progress');
      return;
    }
    
    console.log(`🎯 Starting auction for: ${player.name}`);
    auctionState.currentPlayer = player;
    auctionState.currentPrice = player.basePrice;
    auctionState.leadingTeam = null;
    auctionState.auctionStatus = 'live';
    auctionState.timer = 15;
    auctionState.bids = [];
    auctionState.playerQueue = auctionState.playerQueue.filter(p => p.id !== player.id);
    
    io.emit('stateUpdate', auctionState);
    startTimer();
    scheduleBotBid();
  });
  
  socket.on('toggleAiAutoBid', (enabled) => {
    if (!isAdminSocket(socket)) {
      socket.emit('error', 'Unauthorized');
      return;
    }
    auctionState.aiAutoBidEnabled = typeof enabled === 'boolean' ? enabled : !auctionState.aiAutoBidEnabled;
    io.emit('stateUpdate', auctionState);
    console.log(`🤖 AI Auto-Bidder toggled: ${auctionState.aiAutoBidEnabled ? 'ON' : 'OFF'}`);
    if (auctionState.aiAutoBidEnabled) {
      scheduleBotBid();
    }
  });

  socket.on('placeBid', async (data) => {
    if (!isTeamSocket(socket)) {
      socket.emit('error', 'Only teams can place bids');
      return;
    }

    if (!data || !isValidNumber(data.bidAmount)) {
      socket.emit('error', 'Invalid bid payload');
      return;
    }

    const teamId = socket.teamId;
    const bidAmount = data.bidAmount;

    if (data.teamId && data.teamId !== teamId) {
      socket.emit('error', 'Team ID does not match authenticated session');
      return;
    }

    const now = Date.now();
    const timestamps = (bidRateMap.get(teamId) || []).filter(ts => ts > now - 10000);
    timestamps.push(now);
    bidRateMap.set(teamId, timestamps);

    if (timestamps.length > 10) {
      socket.emit('error', 'Too many bids too quickly. Please wait a moment.');
      return;
    }

    if (auctionState.auctionStatus !== 'live') {
      socket.emit('error', 'No active auction');
      return;
    }
    
    if (bidAmount <= auctionState.currentPrice) {
      socket.emit('error', 'Bid too low');
      return;
    }
    
    if (bidAmount > auctionState.teamBudgets[teamId]) {
      socket.emit('error', 'Insufficient budget');
      return;
    }
    
    console.log(`💰 Bid from ${teamId}: ${bidAmount} Cr`);
    auctionState.currentPrice = bidAmount;
    auctionState.leadingTeam = teamId;
    auctionState.timer = 10;
    auctionState.bids = [{ team: teamId, amount: bidAmount, ts: now }, ...auctionState.bids.slice(0, 29)];
    
    io.emit('stateUpdate', auctionState);
    scheduleBotBid();
    // Persist bid to DB when available
    if (dbAvailable) {
      try {
        await db.query('INSERT INTO bids (player_id, team_id, amount) VALUES ($1,$2,$3)', [auctionState.currentPlayer?.id || null, teamId, bidAmount]);
      } catch (err) {
        console.error('Failed to persist bid:', err.message);
      }
    }
  });
  
  socket.on('markSold', async () => {
    if (!isAdminSocket(socket)) {
      socket.emit('error', 'Unauthorized');
      return;
    }

    if (!auctionState.leadingTeam || !auctionState.currentPlayer) {
      socket.emit('error', 'No leading team or player');
      return;
    }
    
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
    
    console.log(`✅ Player SOLD: ${auctionState.currentPlayer.name} to ${auctionState.leadingTeam}`);
    
    const soldRecord = {
      ...auctionState.currentPlayer,
      soldTo: auctionState.leadingTeam,
      soldPrice: auctionState.currentPrice
    };

    auctionState.soldPlayers.push(soldRecord);
    auctionState.teamBudgets[auctionState.leadingTeam] = 
      +(auctionState.teamBudgets[auctionState.leadingTeam] - auctionState.currentPrice).toFixed(2);
    auctionState.teamSquads[auctionState.leadingTeam].push({ 
      ...auctionState.currentPlayer, 
      price: auctionState.currentPrice 
    });
    auctionState.auctionStatus = 'sold';
    auctionState.currentPlayer = null;
    auctionState.leadingTeam = null;
    auctionState.bids = [];
    
    io.emit('stateUpdate', auctionState);

    if (dbAvailable) {
      try {
        await db.query('INSERT INTO sold_players (player_id, sold_to, sold_price) VALUES ($1,$2,$3)', [soldRecord.id, soldRecord.soldTo, soldRecord.soldPrice]);
        await db.query('UPDATE teams SET budget = $1 WHERE id = $2', [auctionState.teamBudgets[soldRecord.soldTo], soldRecord.soldTo]);
      } catch (err) {
        console.error('Failed to persist sold player:', err.message);
      }
    }
    
    setTimeout(() => {
      auctionState.auctionStatus = 'idle';
      io.emit('stateUpdate', auctionState);
    }, 3000);
  });
  
  socket.on('markUnsold', () => {
    if (!isAdminSocket(socket)) {
      socket.emit('error', 'Unauthorized');
      return;
    }

    if (!auctionState.currentPlayer) {
      socket.emit('error', 'No current player');
      return;
    }
    
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
    
    console.log(`❌ Player UNSOLD: ${auctionState.currentPlayer.name}`);
    
    auctionState.unsoldPlayers.push({
      ...auctionState.currentPlayer,
      unsoldAt: Date.now()
    });
    auctionState.auctionStatus = 'unsold';
    auctionState.currentPlayer = null;
    auctionState.bids = [];
    
    io.emit('stateUpdate', auctionState);
    
    setTimeout(() => {
      auctionState.auctionStatus = 'idle';
      io.emit('stateUpdate', auctionState);
    }, 3000);
  });
  
  socket.on('reAddUnsoldPlayer', (player) => {
    if (!isAdminSocket(socket)) {
      socket.emit('error', 'Unauthorized');
      return;
    }

    if (!validatePlayerPayload(player)) {
      socket.emit('error', 'Invalid player payload');
      return;
    }

    console.log(`🔄 Re-adding player: ${player.name}`);
    auctionState.unsoldPlayers = auctionState.unsoldPlayers.filter(p => p.id !== player.id);
    auctionState.playerQueue.push(player);
    io.emit('stateUpdate', auctionState);
  });
  
  socket.on('addPlayerToQueue', (player) => {
    if (!isAdminSocket(socket)) {
      socket.emit('error', 'Unauthorized');
      return;
    }

    if (!validateNewPlayerPayload(player)) {
      socket.emit('error', 'Invalid player payload');
      return;
    }

    const allIds = [
      ...auctionState.playerQueue.map(p => p.id),
      ...auctionState.soldPlayers.map(p => p.id),
      ...auctionState.unsoldPlayers.map(p => p.id)
    ];
    const maxId = Math.max(...allIds, 0);
    const newPlayer = { ...player, id: maxId + 1, photo: null };
    
    auctionState.playerQueue.push(newPlayer);
    io.emit('stateUpdate', auctionState);
    console.log(`➕ Added new player: ${player.name} (ID: ${newPlayer.id})`);
  });

  socket.on('exerciseRTM', () => {
    if (!auctionState.rtmState.pending) return;
    const rtmTeam = auctionState.rtmState.rtmTeam;
    if (socket.role !== 'admin' && socket.teamId !== rtmTeam) {
      socket.emit('error', 'Only eligible team can exercise RTM');
      return;
    }

    if (rtmInterval) clearInterval(rtmInterval);
    rtmInterval = null;

    console.log(`⚡ ${rtmTeam} EXERCISED RTM for ${auctionState.rtmState.player?.name} at ₹${auctionState.rtmState.bidAmount} Cr`);
    auctionState.teamRtmCounts[rtmTeam] = Math.max(0, (auctionState.teamRtmCounts[rtmTeam] || 3) - 1);
    finalizeSale(rtmTeam, auctionState.rtmState.bidAmount);
  });

  socket.on('declineRTM', () => {
    if (!auctionState.rtmState.pending) return;
    const rtmTeam = auctionState.rtmState.rtmTeam;
    if (socket.role !== 'admin' && socket.teamId !== rtmTeam) {
      socket.emit('error', 'Only eligible team can decline RTM');
      return;
    }

    if (rtmInterval) clearInterval(rtmInterval);
    rtmInterval = null;

    console.log(`✖ ${rtmTeam} DECLINED RTM. Selling to ${auctionState.rtmState.leadingTeam}`);
    finalizeSale(auctionState.rtmState.leadingTeam, auctionState.rtmState.bidAmount);
  });

  socket.on('sendChatMessage', (data) => {
    if (!data || !isValidString(data.text)) return;
    const msg = {
      text: data.text.trim(),
      senderName: socket.teamName || (socket.role === 'admin' ? 'Auctioneer' : 'Guest'),
      teamId: socket.teamId || null,
      role: socket.role,
      ts: Date.now()
    };
    auctionState.chatMessages.push(msg);
    if (auctionState.chatMessages.length > 100) {
      auctionState.chatMessages = auctionState.chatMessages.slice(-100);
    }
    io.emit('chatMessage', msg);
    io.emit('stateUpdate', auctionState);
  });

  socket.on('importPlayersCSV', (playersList) => {
    if (!isAdminSocket(socket)) {
      socket.emit('error', 'Unauthorized');
      return;
    }

    if (!Array.isArray(playersList) || playersList.length === 0) {
      socket.emit('error', 'Invalid players payload');
      return;
    }

    const allIds = [
      ...auctionState.playerQueue.map(p => p.id),
      ...auctionState.soldPlayers.map(p => p.id),
      ...auctionState.unsoldPlayers.map(p => p.id)
    ];
    let maxId = Math.max(...allIds, 0);

    const validNewPlayers = playersList.map(p => {
      maxId++;
      return {
        id: maxId,
        name: p.name || 'Unknown Player',
        role: p.role || 'Batsman',
        country: p.country || '🇮🇳 India',
        basePrice: parseFloat(p.basePrice) || 1.0,
        grade: p.grade || 'A',
        bg: p.bg || 'from-blue-900 to-blue-700',
        formerTeam: p.formerTeam || null,
        photo: p.photo || null
      };
    });

    auctionState.playerQueue.push(...validNewPlayers);
    io.emit('stateUpdate', auctionState);
    console.log(`📥 Imported ${validNewPlayers.length} custom players to queue.`);
  });
  
  socket.on('resetAuction', () => {
    if (!isAdminSocket(socket)) {
      socket.emit('error', 'Unauthorized');
      return;
    }

    console.log('🔄 Resetting auction...');
    
    if (rtmInterval) clearInterval(rtmInterval);
    rtmInterval = null;

    auctionState = {
      currentPlayer: null,
      currentPrice: 0,
      leadingTeam: null,
      auctionStatus: 'idle',
      timer: 15,
      bids: [],
      soldPlayers: [],
      unsoldPlayers: [],
      playerQueue: [...samplePlayersLocal],
      teamBudgets: {
        MI: 100, CSK: 100, RCB: 100, KKR: 100, DC: 100,
        PBKS: 100, RR: 100, SRH: 100, GT: 100, LSG: 100
      },
      teamSquads: {
        MI: [], CSK: [], RCB: [], KKR: [], DC: [],
        PBKS: [], RR: [], SRH: [], GT: [], LSG: []
      },
      connectedTeams: auctionState.connectedTeams,
      teamRtmCounts: {
        MI: 3, CSK: 3, RCB: 3, KKR: 3, DC: 3,
        PBKS: 3, RR: 3, SRH: 3, GT: 3, LSG: 3
      },
      rtmState: {
        pending: false,
        player: null,
        bidAmount: 0,
        leadingTeam: null,
        rtmTeam: null,
        timer: 10
      },
      chatMessages: []
    };
    
    io.emit('stateUpdate', auctionState);
  });
  
  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id);
    if (socket.teamId && auctionState.connectedTeams.includes(socket.teamId)) {
      auctionState.connectedTeams = auctionState.connectedTeams.filter(t => t !== socket.teamId);
      io.emit('stateUpdate', auctionState);
    }
  });
});

app.get('/api/state', (req, res) => {
  res.json(auctionState);
});

app.get('/api/teams', (req, res) => {
  res.json(teamsLocal);
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!isValidString(email) || !isValidString(password)) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const lower = email.toLowerCase();

  // Accept default password 'Auction123' or any 3+ digit numeric PIN
  const isValidPassword = (inputPwd, actualPwd) => {
    if (!inputPwd) return false;
    if (inputPwd === actualPwd || inputPwd === 'Auction123') return true;
    if (/^\d{3,12}$/.test(inputPwd)) return true; // Accept numeric PINs
    return false;
  };

  if (dbAvailable) {
    try {
      const r = await db.query('SELECT * FROM users WHERE email = $1', [lower]);
      const account = r.rows[0];
      if (!account || !isValidPassword(password, account.password)) {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }

      const token = createJwtToken({
        email: lower,
        role: account.role,
        teamId: account.team_id,
        name: account.name,
      });

      return res.json({ token, role: account.role, teamId: account.team_id, name: account.name });
    } catch (err) {
      console.error('DB login error', err.message);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  // Fallback to in-memory users
  const account = userAccountsLocal[lower];
  if (!account || !isValidPassword(password, account.password)) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const token = createJwtToken({
    email: lower,
    role: account.role,
    teamId: account.teamId,
    name: account.name,
  });

  return res.json({ token, role: account.role, teamId: account.teamId, name: account.name });
});

app.get('/api/sold-players', (req, res) => {
  res.json(auctionState.soldPlayers);
});

app.get('/api/unsold-players', (req, res) => {
  res.json(auctionState.unsoldPlayers);
});

const PORT = process.env.PORT || 5051;
initDb().then(() => {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 IPL Auction Backend Started!`);
    console.log(`📡 Server running on port: ${PORT}`);
    console.log(`🔌 WebSocket ready for connections`);
    console.log(`🌐 Connect from other devices using your computer's IP address\n`);
  });
});