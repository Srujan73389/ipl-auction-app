import { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';
import { TEAMS, PLAYERS } from '../data';
import { socket } from '../services/socket';
import { soundService } from '../services/sound';

const AuctionContext = createContext(null);

const initBudgets = () => Object.fromEntries(TEAMS.map(t => [t.id, t.budget]));
const initSquads  = () => Object.fromEntries(TEAMS.map(t => [t.id, []]));

const INITIAL = {
  role:          null,
  teamInfo:      null,
  playerQueue:   [...PLAYERS],
  currentPlayer: null,
  currentPrice:  0,
  leadingTeam:   null,
  auctionStatus: 'idle',
  timer:         15,
  bids:          [],
  soldPlayers:   [],
  unsoldPlayers: [],
  teamBudgets:   initBudgets(),
  teamSquads:    initSquads(),
  connectedTeams:[],
  teamRtmCounts: { MI: 3, CSK: 3, RCB: 3, KKR: 3, DC: 3, PBKS: 3, RR: 3, SRH: 3, GT: 3, LSG: 3 },
  rtmState:      { pending: false, player: null, bidAmount: 0, leadingTeam: null, rtmTeam: null, timer: 10 },
  chatMessages:  [],
  isConnected:   false,
};

function reducer(s, a) {
  switch (a.type) {
    case 'SET_ROLE':
      return { ...s, role: a.role, teamInfo: a.teamInfo };

    case 'SET_STATE':
      return { ...s, ...a.payload };

    case 'CONNECTION_STATUS':
      return { ...s, isConnected: a.status };

    default:
      return s;
  }
}

export function AuctionProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const isRegistered = useRef(false);
  const prevStateRef = useRef(state);

  useEffect(() => {
    socket.on('stateUpdate', (newState) => {
      // Audio trigger logic based on state transitions
      const prev = prevStateRef.current;
      
      // Sound on new bid
      if (newState.bids && prev.bids && newState.bids.length > prev.bids.length) {
        soundService.playBidPing();
        const latestBid = newState.bids[0];
        if (latestBid) {
          const teamName = TEAMS.find(t => t.id === latestBid.team)?.name || latestBid.team;
          soundService.announceBid(teamName, latestBid.amount);
        }
      }

      // Sound on Hammer / Sold
      if (newState.auctionStatus === 'sold' && prev.auctionStatus !== 'sold') {
        soundService.playGavel();
        soundService.playFanfare();
        const lastSold = newState.soldPlayers[newState.soldPlayers.length - 1];
        if (lastSold) {
          const teamName = TEAMS.find(t => t.id === lastSold.soldTo)?.name || lastSold.soldTo;
          soundService.announceSold(lastSold.name, teamName, lastSold.soldPrice);
        }
      }

      // Sound on Unsold
      if (newState.auctionStatus === 'unsold' && prev.auctionStatus !== 'unsold') {
        soundService.playGavel();
        if (prev.currentPlayer) {
          soundService.announceUnsold(prev.currentPlayer.name);
        }
      }

      prevStateRef.current = newState;
      dispatch({ type: 'SET_STATE', payload: newState });
    });

    socket.on('timerUpdate', (timer) => {
      if (timer <= 5 && timer > 0) {
        soundService.playTick();
      }
      dispatch({ type: 'SET_STATE', payload: { timer } });
    });

    socket.on('error', (errorMsg) => {
      console.error('Server error:', errorMsg);
      alert(errorMsg);
    });
    
    socket.on('connect', () => {
      console.log('✅ Connected to backend server');
      dispatch({ type: 'CONNECTION_STATUS', status: true });
      if (isRegistered.current && state.role) {
        socket.emit('setRole', { role: state.role, teamInfo: state.teamInfo });
      }
    });
    
    socket.on('disconnect', () => {
      console.log('❌ Disconnected from backend server');
      dispatch({ type: 'CONNECTION_STATUS', status: false });
    });

    return () => {
      socket.off('stateUpdate');
      socket.off('timerUpdate');
      socket.off('error');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [state.role, state.teamInfo]);

  const setRole = useCallback((role, teamInfo) => {
    dispatch({ type: 'SET_ROLE', role, teamInfo });
    socket.emit('setRole', { role, teamInfo });
    isRegistered.current = true;
  }, []);

  const startPlayer = useCallback((player) => {
    socket.emit('startPlayer', player);
  }, []);

  const placeBid = useCallback((team, amount) => {
    socket.emit('placeBid', { teamId: team, bidAmount: amount });
  }, []);

  const markSold = useCallback(() => {
    socket.emit('markSold');
  }, []);

  const markUnsold = useCallback(() => {
    socket.emit('markUnsold');
  }, []);

  const reAddUnsoldPlayer = useCallback((player) => {
    socket.emit('reAddUnsoldPlayer', player);
  }, []);

  const resetAuction = useCallback(() => {
    socket.emit('resetAuction');
  }, []);

  const addPlayerToQueue = useCallback((player) => {
    socket.emit('addPlayerToQueue', player);
  }, []);

  const exerciseRTM = useCallback(() => {
    socket.emit('exerciseRTM');
  }, []);

  const declineRTM = useCallback(() => {
    socket.emit('declineRTM');
  }, []);

  const sendChatMessage = useCallback((text) => {
    socket.emit('sendChatMessage', { text });
  }, []);

  const importPlayersCSV = useCallback((playersList) => {
    socket.emit('importPlayersCSV', playersList);
  }, []);

  const toggleAiAutoBid = useCallback((enabled) => {
    socket.emit('toggleAiAutoBid', enabled);
  }, []);

  return (
    <AuctionContext.Provider value={{ 
      state, 
      setRole, 
      startPlayer, 
      placeBid, 
      markSold, 
      markUnsold, 
      reAddUnsoldPlayer,
      resetAuction,
      addPlayerToQueue,
      exerciseRTM,
      declineRTM,
      sendChatMessage,
      importPlayersCSV,
      toggleAiAutoBid
    }}>
      {children}
    </AuctionContext.Provider>
  );
}

export const useAuction = () => {
  const ctx = useContext(AuctionContext);
  if (!ctx) throw new Error('useAuction must be inside AuctionProvider');
  return ctx;
};