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
