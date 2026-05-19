const SUPABASE_URL = 'https://caxbgtzhkwuipmflqmsm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNheGJndHpoa3d1aXBtZmxxbXNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwOTk1OTAsImV4cCI6MjA5NDY3NTU5MH0.SCBTqIsAIEN9_zDhxfnKiSZvQUtaHrrqMQFgnXGceXg';

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const NEIGHBOURHOODS = [
  { id: 1,  name: 'Södermalm',        color: '#378ADD' },
  { id: 2,  name: 'Vasastan',          color: '#639922' },
  { id: 3,  name: 'Östermalm',         color: '#BA7517' },
  { id: 4,  name: 'Kungsholmen',       color: '#534AB7' },
  { id: 5,  name: 'Gamla Stan',        color: '#D85A30' },
  { id: 6,  name: 'Norrmalm',          color: '#5F5E5A' },
  { id: 7,  name: 'Hammarby Sjöstad',  color: '#1D9E75' },
  { id: 8,  name: 'Liljeholmen',       color: '#D4537E' },
  { id: 9,  name: 'Lidingö',           color: '#85B7EB' },
  { id: 10, name: 'Djurgården',        color: '#3B6D11' },
];

const STRAVA_AUTH_URL =
  'https://www.strava.com/oauth/authorize' +
  '?client_id=247766' +
  '&response_type=code' +
  '&redirect_uri=' + encodeURIComponent('https://ludmister.github.io/sthlmfit/callback.html') +
  '&approval_prompt=auto' +
  '&scope=activity:read_all';

async function requireAuth() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) { window.location.href = 'login.html'; return null; }
  return session.user;
}

async function getProfile(userId) {
  const { data } = await sb.from('profiles')
    .select('*, neighbourhoods(*)')
    .eq('id', userId)
    .maybeSingle();
  return data;
}

function formatKm(km) {
  return Number(km).toFixed(1).replace('.', ',') + ' km';
}

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// Neighbourhood silhouette SVG paths (viewBox 0 0 200 80), keyed by neighbourhood id
const SILHOUETTES = {
  // Södermalm — Skinnarviksberget rocky hill
  1: '<path d="M0,80 L0,63 C14,57 28,50 44,42 57,34 69,25 82,17 92,11 101,6 111,5 121,4 133,9 145,17 157,25 168,35 181,44 191,52 196,57 200,60L200,80Z"/>',
  // Vasastan — Observatorielunden dome
  2: '<path d="M0,80 0,70 46,70 46,56C54,43 66,29 78,19 85,13 92,10 100,9 108,10 115,13 122,19 134,29 146,43 154,56L154,70 200,70 200,80Z"/>',
  // Östermalm — Strandvägen lamp posts and water
  3: '<path d="M0,80 0,70Q100,60 200,70L200,80Z M19,70 19,28 27,28 27,70Z M9,22A14,8 0 1,1 37,22A14,8 0 1,1 9,22Z M91,70 91,28 99,28 99,70Z M81,22A14,8 0 1,1 109,22A14,8 0 1,1 81,22Z M163,70 163,28 171,28 171,70Z M153,22A14,8 0 1,1 181,22A14,8 0 1,1 153,22Z"/>',
  // Kungsholmen — Stadshuset tower and crown
  4: '<path d="M26,80 26,52 44,52 44,20 52,14 60,8 68,4 76,1 84,4 92,8 100,14 108,20 108,52 126,52 126,80Z M108,80 108,58 130,58 130,80Z M22,80 22,58 44,58 44,80Z"/>',
  // Gamla Stan — medieval church spires
  5: '<path d="M5,80 5,58 20,58 26,46 32,30 38,16 44,5 50,0 56,5 62,16 68,30 74,46 80,58 96,58 100,47 106,32 112,17 118,5 122,2 126,5 132,17 138,32 144,47 148,58 165,58 165,80Z"/>',
  // Norrmalm — modern office skyline
  6: '<path d="M0,80 0,65 10,65 10,52 26,52 26,40 42,40 42,50 58,50 58,28 74,28 74,50 90,50 90,42 106,42 106,55 122,55 122,44 138,44 138,60 154,60 154,65 172,65 172,54 188,54 188,65 200,65 200,80Z"/>',
  // Hammarby Sjöstad — industrial crane and waterfront
  7: '<path d="M46,80 46,14 54,14 54,11 148,11 148,18 54,18 54,80Z M140,11 148,11 148,52 140,52Z M0,80 0,68Q40,58 76,63Q108,67 140,67L200,67 200,80Z"/>',
  // Liljeholmen — bridge over water
  8: '<path d="M0,80 0,60 12,60 12,52C12,52 32,28 100,26 168,24 188,52 188,52L188,60 200,60 200,80 180,80 180,60 20,60 20,80Z"/>',
  // Lidingö — sailboat and archipelago
  9: '<path d="M0,80 0,68Q28,62 56,65L200,65 200,80Z M72,65 72,15 128,60Z M72,15 72,60 36,48Z M150,65Q164,60 178,62Q190,64 198,65L198,80 150,80Z"/>',
  // Djurgården — tree line and Gröna Lund ferris wheel
  10: '<path d="M0,80 0,62Q22,55 46,58Q64,61 78,65L78,80Z"/><path fill-rule="evenodd" d="M118,37A30,30 0 1,1 178,37A30,30 0 1,1 118,37Z M135,37A13,13 0 1,1 161,37A13,13 0 1,1 135,37Z"/><path d="M146,7 150,7 150,67 146,67Z M118,35 118,39 178,39 178,35Z M144,67 152,67 152,80 144,80Z"/>',
};

function getCountdown() {
  const now = new Date();
  const monday = new Date(now);
  const day = monday.getDay();
  monday.setDate(monday.getDate() + (day === 1 ? 7 : (8 - day) % 7));
  monday.setHours(0, 0, 0, 0);
  const diff = monday - now;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (h >= 24) { const d = Math.floor(h/24); return `${d}d ${h%24}h ${m}min`; }
  return `${h}h ${m}min ${s}s`;
}
