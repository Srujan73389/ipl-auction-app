// Player photos for original 12 players
const ViratImg = '/players/virat-kohli.webp';
const RohitImg = '/players/rohit-sharma.webp';
const BumrahImg = '/players/bumrah.webp';
const DhoniImg = '/players/dhoni.webp';
const KLRahulImg = '/players/kl-rahul.webp';
const HardikImg = '/players/hardik-pandya.webp';
const SuryaImg = '/players/suryakumar-yadav.webp';
const RashidImg = '/players/rashid-khan.webp';
const ButtlerImg = '/players/jos-buttler.webp';
const CumminsImg = '/players/pat-cummins.webp';
const JadejaImg = '/players/jadeja.webp';
const WarnerImg = '/players/david-warner.webp';

export const TEAMS = [
  { id: 'MI', name: 'Mumbai Indians', color: '#004BA0', light: '#1A7FE8', emoji: '🐂', budget: 100, logo: null },
  { id: 'CSK', name: 'Chennai Super Kings', color: '#FFB800', light: '#FFD055', emoji: '🦁', budget: 100, logo: null },
  { id: 'RCB', name: 'Royal Challengers Bengaluru', color: '#CC0000', light: '#FF3333', emoji: '🐯', budget: 100, logo: null },
  { id: 'KKR', name: 'Kolkata Knight Riders', color: '#7B2FBE', light: '#A855F7', emoji: '⚔️', budget: 100, logo: null },
  { id: 'DC', name: 'Delhi Capitals', color: '#0078BC', light: '#22AAFF', emoji: '🦅', budget: 100, logo: null },
  { id: 'PBKS', name: 'Punjab Kings', color: '#C8102E', light: '#FF3355', emoji: '👑', budget: 100, logo: null },
  { id: 'RR', name: 'Rajasthan Royals', color: '#E91E8C', light: '#FF55BB', emoji: '🐪', budget: 100, logo: null },
  { id: 'SRH', name: 'Sunrisers Hyderabad', color: '#FF6600', light: '#FF9933', emoji: '☀️', budget: 100, logo: null },
  { id: 'GT', name: 'Gujarat Titans', color: '#1A3A6B', light: '#2B5FBF', emoji: '⚡', budget: 100, logo: null },
  { id: 'LSG', name: 'Lucknow Super Giants', color: '#00B4D8', light: '#48CAE4', emoji: '🚀', budget: 100, logo: null },
];

export const PLAYERS = [
  // ============ ORIGINAL 12 PLAYERS (with photos) ============
  { id: 1, name: 'Virat Kohli', role: 'Batsman', country: '🇮🇳 India', basePrice: 2, caps: 237, avg: 36.2, sr: 131.4, runs: 7263, grade: 'A+', bg: 'from-red-900 to-red-700', photo: ViratImg, formerTeam: 'RCB', t20Rating: 97, fairVal: 18.5 },
  { id: 2, name: 'Rohit Sharma', role: 'Batsman', country: '🇮🇳 India', basePrice: 2, caps: 243, avg: 29.5, sr: 130.1, runs: 6211, grade: 'A+', bg: 'from-blue-900 to-blue-700', photo: RohitImg, formerTeam: 'MI', t20Rating: 95, fairVal: 16.0 },
  { id: 3, name: 'Jasprit Bumrah', role: 'Bowler', country: '🇮🇳 India', basePrice: 2, caps: 131, wickets: 145, economy: 7.4, avg: 21.3, grade: 'A+', bg: 'from-indigo-900 to-indigo-700', photo: BumrahImg, formerTeam: 'MI', t20Rating: 99, fairVal: 19.0 },
  { id: 4, name: 'MS Dhoni', role: 'Wicketkeeper', country: '🇮🇳 India', basePrice: 2, caps: 250, avg: 38.1, sr: 135.9, runs: 5082, grade: 'LEGEND', bg: 'from-yellow-900 to-yellow-700', photo: DhoniImg, formerTeam: 'CSK', t20Rating: 98, fairVal: 15.0 },
  { id: 5, name: 'KL Rahul', role: 'Batsman', country: '🇮🇳 India', basePrice: 2, caps: 115, avg: 46.1, sr: 134.9, runs: 4683, grade: 'A', bg: 'from-teal-900 to-teal-700', photo: KLRahulImg, formerTeam: 'LSG', t20Rating: 91, fairVal: 14.0 },
  { id: 6, name: 'Hardik Pandya', role: 'All-Rounder', country: '🇮🇳 India', basePrice: 2, caps: 115, avg: 28.9, sr: 143.2, wickets: 67, grade: 'A', bg: 'from-orange-900 to-orange-700', photo: HardikImg, formerTeam: 'MI', t20Rating: 93, fairVal: 15.5 },
  { id: 7, name: 'Suryakumar Yadav', role: 'Batsman', country: '🇮🇳 India', basePrice: 2, caps: 147, avg: 33.2, sr: 160.4, runs: 3282, grade: 'A+', bg: 'from-cyan-900 to-cyan-700', photo: SuryaImg, formerTeam: 'MI', t20Rating: 98, fairVal: 17.5 },
  { id: 8, name: 'Rashid Khan', role: 'Bowler', country: '🇦🇫 Afghanistan', basePrice: 2, caps: 122, wickets: 166, economy: 6.6, avg: 17.8, grade: 'A+', bg: 'from-green-900 to-green-700', photo: RashidImg, formerTeam: 'GT', t20Rating: 97, fairVal: 16.5 },
  { id: 9, name: 'Jos Buttler', role: 'Wicketkeeper', country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England', basePrice: 2, caps: 94, avg: 38.9, sr: 149.7, runs: 3582, grade: 'A', bg: 'from-purple-900 to-purple-700', photo: ButtlerImg, formerTeam: 'RR', t20Rating: 94, fairVal: 14.5 },
  { id: 10, name: 'Pat Cummins', role: 'Bowler', country: '🇦🇺 Australia', basePrice: 2, caps: 42, wickets: 61, economy: 9.1, avg: 28.3, grade: 'A', bg: 'from-yellow-800 to-yellow-600', photo: CumminsImg, formerTeam: 'SRH', t20Rating: 92, fairVal: 15.0 },
  { id: 11, name: 'Ravindra Jadeja', role: 'All-Rounder', country: '🇮🇳 India', basePrice: 2, caps: 236, avg: 26.6, sr: 127.4, wickets: 132, grade: 'A', bg: 'from-pink-900 to-pink-700', photo: JadejaImg, formerTeam: 'CSK', t20Rating: 90, fairVal: 13.5 },
  { id: 12, name: 'David Warner', role: 'Batsman', country: '🇦🇺 Australia', basePrice: 1, caps: 184, avg: 41.6, sr: 139.9, runs: 6565, grade: 'B+', bg: 'from-amber-900 to-amber-700', photo: WarnerImg, formerTeam: 'DC', t20Rating: 88, fairVal: 10.0 },

  // ============ ADDITIONAL 50 PLAYERS (No photos - shows 🏏 emoji) ============
  { id: 13, name: 'Shubman Gill', role: 'Batsman', country: '🇮🇳 India', basePrice: 2, caps: 45, avg: 38.5, sr: 145.2, runs: 1450, grade: 'A', bg: 'from-purple-900 to-purple-700', photo: null },
  { id: 14, name: 'Mohammed Shami', role: 'Bowler', country: '🇮🇳 India', basePrice: 2, caps: 65, wickets: 95, economy: 8.1, grade: 'A', bg: 'from-green-900 to-green-700', photo: null },
  { id: 15, name: 'Rishabh Pant', role: 'Wicketkeeper', country: '🇮🇳 India', basePrice: 2, caps: 55, avg: 34.2, sr: 148.5, runs: 1850, grade: 'A+', bg: 'from-teal-900 to-teal-700', photo: null },
  { id: 16, name: 'Sanju Samson', role: 'Wicketkeeper', country: '🇮🇳 India', basePrice: 2, caps: 48, avg: 31.5, sr: 140.2, runs: 1520, grade: 'A', bg: 'from-orange-900 to-orange-700', photo: null },
  { id: 17, name: 'Axar Patel', role: 'All-Rounder', country: '🇮🇳 India', basePrice: 1.5, caps: 62, avg: 25.3, sr: 135.6, wickets: 52, grade: 'B+', bg: 'from-indigo-900 to-indigo-700', photo: null },
  { id: 18, name: 'Yuzvendra Chahal', role: 'Bowler', country: '🇮🇳 India', basePrice: 1.5, caps: 75, wickets: 85, economy: 7.8, grade: 'B+', bg: 'from-cyan-900 to-cyan-700', photo: null },
  { id: 19, name: 'Trent Boult', role: 'Bowler', country: '🇳🇿 New Zealand', basePrice: 2, caps: 55, wickets: 72, economy: 7.2, grade: 'A', bg: 'from-yellow-800 to-yellow-600', photo: null },
  { id: 20, name: 'Cameron Green', role: 'All-Rounder', country: '🇦🇺 Australia', basePrice: 2, caps: 28, avg: 35.2, sr: 142.5, wickets: 22, grade: 'A', bg: 'from-green-700 to-green-500', photo: null },
  { id: 21, name: 'Sam Curran', role: 'All-Rounder', country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England', basePrice: 2, caps: 45, avg: 26.8, sr: 138.5, wickets: 45, grade: 'A', bg: 'from-pink-900 to-pink-700', photo: null },
  { id: 22, name: 'Marcus Stoinis', role: 'All-Rounder', country: '🇦🇺 Australia', basePrice: 1.5, caps: 58, avg: 29.1, sr: 141.5, wickets: 32, grade: 'B+', bg: 'from-amber-900 to-amber-700', photo: null },
  { id: 23, name: 'Faf du Plessis', role: 'Batsman', country: '🇿🇦 South Africa', basePrice: 1.5, caps: 98, avg: 35.8, sr: 132.5, runs: 3450, grade: 'B+', bg: 'from-purple-800 to-purple-600', photo: null },
  { id: 24, name: 'Ishan Kishan', role: 'Wicketkeeper', country: '🇮🇳 India', basePrice: 2, caps: 32, avg: 29.5, sr: 135.8, runs: 980, grade: 'B+', bg: 'from-blue-800 to-blue-600', photo: null },
  { id: 25, name: 'Deepak Chahar', role: 'Bowler', country: '🇮🇳 India', basePrice: 1.5, caps: 28, wickets: 35, economy: 7.5, grade: 'B', bg: 'from-cyan-800 to-cyan-600', photo: null },
  { id: 26, name: 'Bhuvneshwar Kumar', role: 'Bowler', country: '🇮🇳 India', basePrice: 1.5, caps: 82, wickets: 95, economy: 7.2, grade: 'B+', bg: 'from-indigo-800 to-indigo-600', photo: null },
  { id: 27, name: 'Kagiso Rabada', role: 'Bowler', country: '🇿🇦 South Africa', basePrice: 2, caps: 62, wickets: 88, economy: 8.2, grade: 'A', bg: 'from-yellow-700 to-yellow-500', photo: null },
  { id: 28, name: 'Anrich Nortje', role: 'Bowler', country: '🇿🇦 South Africa', basePrice: 2, caps: 42, wickets: 58, economy: 7.8, grade: 'A', bg: 'from-red-800 to-red-600', photo: null },
  { id: 29, name: 'Lockie Ferguson', role: 'Bowler', country: '🇳🇿 New Zealand', basePrice: 1.5, caps: 38, wickets: 48, economy: 8.5, grade: 'B+', bg: 'from-green-800 to-green-600', photo: null },
  { id: 30, name: 'Jofra Archer', role: 'Bowler', country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England', basePrice: 2, caps: 35, wickets: 42, economy: 7.5, grade: 'A', bg: 'from-pink-800 to-pink-600', photo: null },
  { id: 31, name: 'Mohammed Siraj', role: 'Bowler', country: '🇮🇳 India', basePrice: 1.5, caps: 45, wickets: 55, economy: 8.0, grade: 'B+', bg: 'from-blue-700 to-blue-500', photo: null },
  { id: 32, name: 'Prithvi Shaw', role: 'Batsman', country: '🇮🇳 India', basePrice: 1.5, caps: 38, avg: 28.5, sr: 145.8, runs: 1050, grade: 'B+', bg: 'from-orange-800 to-orange-600', photo: null },
  { id: 33, name: 'Devon Conway', role: 'Batsman', country: '🇳🇿 New Zealand', basePrice: 1.5, caps: 32, avg: 38.5, sr: 135.5, runs: 1120, grade: 'B+', bg: 'from-teal-800 to-teal-600', photo: null },
  { id: 34, name: 'Ruturaj Gaikwad', role: 'Batsman', country: '🇮🇳 India', basePrice: 2, caps: 38, avg: 35.2, sr: 138.5, runs: 1250, grade: 'A', bg: 'from-cyan-700 to-cyan-500', photo: null },
  { id: 35, name: 'Venkatesh Iyer', role: 'All-Rounder', country: '🇮🇳 India', basePrice: 1.5, caps: 28, avg: 28.5, sr: 142.5, wickets: 18, grade: 'B+', bg: 'from-purple-700 to-purple-500', photo: null },
  { id: 36, name: 'Rahul Tripathi', role: 'Batsman', country: '🇮🇳 India', basePrice: 1.5, caps: 45, avg: 32.5, sr: 140.5, runs: 1350, grade: 'B+', bg: 'from-red-700 to-red-500', photo: null },
  { id: 37, name: 'Liam Livingstone', role: 'All-Rounder', country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England', basePrice: 2, caps: 42, avg: 28.5, sr: 155.5, wickets: 25, grade: 'A', bg: 'from-yellow-600 to-yellow-400', photo: null },
  { id: 38, name: 'Tim David', role: 'Batsman', country: '🇸🇬 Singapore', basePrice: 1.5, caps: 22, avg: 32.5, sr: 158.5, runs: 650, grade: 'B+', bg: 'from-green-600 to-green-400', photo: null },
  { id: 39, name: 'Andre Russell', role: 'All-Rounder', country: '🇯🇲 West Indies', basePrice: 2, caps: 85, avg: 28.5, sr: 165.2, wickets: 48, grade: 'A+', bg: 'from-red-800 to-red-600', photo: null },
  { id: 40, name: 'Sunil Narine', role: 'Bowler', country: '🇯🇲 West Indies', basePrice: 2, caps: 95, wickets: 102, economy: 6.8, grade: 'A+', bg: 'from-purple-800 to-purple-600', photo: null },
  { id: 41, name: 'Nicholas Pooran', role: 'Wicketkeeper', country: '🇯🇲 West Indies', basePrice: 2, caps: 68, avg: 28.5, sr: 142.5, runs: 1850, grade: 'A', bg: 'from-orange-700 to-orange-500', photo: null },
  { id: 42, name: 'Kieron Pollard', role: 'All-Rounder', country: '🇯🇲 West Indies', basePrice: 2, caps: 123, avg: 31.5, sr: 152.5, wickets: 55, grade: 'A+', bg: 'from-blue-700 to-blue-500', photo: null },
  { id: 43, name: 'Dwayne Bravo', role: 'All-Rounder', country: '🇯🇲 West Indies', basePrice: 1.5, caps: 145, avg: 26.5, sr: 135.5, wickets: 125, grade: 'A', bg: 'from-cyan-700 to-cyan-500', photo: null },
  { id: 44, name: 'Harry Brook', role: 'Batsman', country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England', basePrice: 2, caps: 28, avg: 38.5, sr: 148.5, runs: 950, grade: 'A', bg: 'from-yellow-800 to-yellow-600', photo: null },
  { id: 45, name: 'Will Jacks', role: 'All-Rounder', country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England', basePrice: 1.5, caps: 18, avg: 32.5, sr: 155.5, wickets: 12, grade: 'B+', bg: 'from-red-700 to-red-500', photo: null },
  { id: 46, name: 'Phil Salt', role: 'Wicketkeeper', country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England', basePrice: 1.5, caps: 25, avg: 28.5, sr: 145.5, runs: 750, grade: 'B+', bg: 'from-teal-700 to-teal-500', photo: null },
  { id: 47, name: 'Ben Stokes', role: 'All-Rounder', country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England', basePrice: 2, caps: 65, avg: 32.5, sr: 142.5, wickets: 42, grade: 'A+', bg: 'from-indigo-700 to-indigo-500', photo: null },
  { id: 48, name: 'Moeen Ali', role: 'All-Rounder', country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England', basePrice: 1.5, caps: 82, avg: 26.5, sr: 138.5, wickets: 48, grade: 'A', bg: 'from-green-700 to-green-500', photo: null },
  { id: 49, name: 'Chris Gayle', role: 'Batsman', country: '🇯🇲 West Indies', basePrice: 2, caps: 150, avg: 32.5, sr: 148.5, runs: 4850, grade: 'LEGEND', bg: 'from-orange-800 to-orange-600', photo: null },
  { id: 50, name: 'AB de Villiers', role: 'Batsman', country: '🇿🇦 South Africa', basePrice: 2, caps: 184, avg: 38.5, sr: 152.5, runs: 4850, grade: 'LEGEND', bg: 'from-red-800 to-red-600', photo: null },
  { id: 51, name: 'Kane Williamson', role: 'Batsman', country: '🇳🇿 New Zealand', basePrice: 2, caps: 85, avg: 38.5, sr: 132.5, runs: 2850, grade: 'A', bg: 'from-cyan-800 to-cyan-600', photo: null },
  { id: 52, name: 'Steve Smith', role: 'Batsman', country: '🇦🇺 Australia', basePrice: 2, caps: 98, avg: 35.5, sr: 135.5, runs: 3250, grade: 'A', bg: 'from-yellow-800 to-yellow-600', photo: null },
  { id: 53, name: 'Mitchell Starc', role: 'Bowler', country: '🇦🇺 Australia', basePrice: 2, caps: 58, wickets: 78, economy: 7.5, grade: 'A+', bg: 'from-blue-800 to-blue-600', photo: null },
  { id: 54, name: 'Shakib Al Hasan', role: 'All-Rounder', country: '🇧🇩 Bangladesh', basePrice: 2, caps: 115, avg: 28.5, sr: 135.5, wickets: 85, grade: 'A', bg: 'from-green-800 to-green-600', photo: null },
  { id: 55, name: 'Babar Azam', role: 'Batsman', country: '🇵🇰 Pakistan', basePrice: 2, caps: 85, avg: 42.5, sr: 138.5, runs: 3250, grade: 'A+', bg: 'from-teal-800 to-teal-600', photo: null },
  { id: 56, name: 'Shaheen Afridi', role: 'Bowler', country: '🇵🇰 Pakistan', basePrice: 2, caps: 45, wickets: 68, economy: 7.2, grade: 'A', bg: 'from-indigo-800 to-indigo-600', photo: null },
  { id: 57, name: 'Tom Curran', role: 'All-Rounder', country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England', basePrice: 1.5, caps: 35, avg: 25.5, sr: 135.5, wickets: 32, grade: 'B+', bg: 'from-pink-800 to-pink-600', photo: null },
  { id: 58, name: 'Jason Roy', role: 'Batsman', country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England', basePrice: 1.5, caps: 62, avg: 32.5, sr: 145.5, runs: 2150, grade: 'B+', bg: 'from-orange-800 to-orange-600', photo: null },
  { id: 59, name: 'Jonny Bairstow', role: 'Wicketkeeper', country: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England', basePrice: 2, caps: 78, avg: 32.5, sr: 145.5, runs: 2850, grade: 'A', bg: 'from-yellow-800 to-yellow-600', photo: null },
  { id: 60, name: 'Quinton de Kock', role: 'Wicketkeeper', country: '🇿🇦 South Africa', basePrice: 2, caps: 85, avg: 35.5, sr: 145.5, runs: 3250, grade: 'A', bg: 'from-cyan-800 to-cyan-600', photo: null },
  { id: 61, name: 'Harshal Patel', role: 'Bowler', country: '🇮🇳 India', basePrice: 1.5, caps: 45, wickets: 68, economy: 8.5, grade: 'B+', bg: 'from-purple-700 to-purple-500', photo: null },
  { id: 62, name: 'Avesh Khan', role: 'Bowler', country: '🇮🇳 India', basePrice: 1.5, caps: 25, wickets: 38, economy: 8.2, grade: 'B', bg: 'from-red-700 to-red-500', photo: null },
];

export const getTeam = (id) => TEAMS.find(t => t.id === id);