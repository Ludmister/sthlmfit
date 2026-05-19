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

// Stockholm skyline — Stadshuset (left), Riddarholmen spire, Gamla Stan church spires, Norrmalm
const STOCKHOLM_SKYLINE = '<path d="M0,120 L0,96 Q14,91 28,94 L34,93 L36,88 L46,88 L46,80 L52,80 L52,72 L54,72 L54,66 L58,66 L58,60 L60,54 L62,40 L64,24 L66,10 L68,6 L72,6 L74,10 L76,24 L78,40 L80,54 L82,60 L82,66 L86,66 L86,72 L92,72 L100,72 L100,80 L106,80 L106,88 Q112,90 119,88 L121,88 L122,74 L123,50 L124,24 L125,8 L126,24 L127,50 L128,74 L129,88 Q135,86 142,81 L147,76 L152,69 L155,62 L157,52 L159,38 L161,22 L162,8 L163,2 L164,8 L165,22 L167,38 L169,52 L171,62 L174,67 L180,71 L184,70 L186,62 L188,48 L190,32 L191,18 L192,9 L193,18 L194,32 L196,48 L198,62 L202,67 L209,70 L217,70 L222,70 L222,57 L232,57 L232,66 L236,66 L236,51 L248,51 L248,59 L252,59 L252,46 L265,46 L265,54 L269,54 L269,50 L281,50 L281,58 L285,58 L285,54 L298,54 L298,63 L302,63 L302,58 L315,58 L315,67 L319,67 L319,63 L332,63 L332,72 L336,72 L336,67 L348,67 L348,76 L352,76 L352,72 L364,72 L364,80 L366,80 L366,76 L376,76 L376,84 Q385,90 393,94 400,96 L400,120 Z"/>';

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
