const SUPABASE_URL = 'https://caxbgtzhkwuipmflqmsm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNheGJndHpoa3d1aXBtZmxxbXNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwOTk1OTAsImV4cCI6MjA5NDY3NTU5MH0.SCBTqIsAIEN9_zDhxfnKiSZvQUtaHrrqMQFgnXGceXg';

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const NEIGHBOURHOODS = [
  { id: 1,  name: 'Södermalm',        slug: 'sodermalm',        color: '#1D9E75' },
  { id: 2,  name: 'Vasastan',          slug: 'vasastan',          color: '#2ECC71' },
  { id: 3,  name: 'Östermalm',         slug: 'ostermalm',         color: '#27AE60' },
  { id: 4,  name: 'Kungsholmen',       slug: 'kungsholmen',       color: '#16A085' },
  { id: 5,  name: 'Gamla Stan',        slug: 'gamla-stan',        color: '#1ABC9C' },
  { id: 6,  name: 'Norrmalm',          slug: 'norrmalm',          color: '#0E8A5F' },
  { id: 7,  name: 'Hammarby Sjöstad',  slug: 'hammarby-sjostad',  color: '#148F77' },
  { id: 8,  name: 'Liljeholmen',       slug: 'liljeholmen',       color: '#117A65' },
  { id: 9,  name: 'Lidingö',           slug: 'lidingo',           color: '#0D6655' },
  { id: 10, name: 'Djurgården',        slug: 'djurgarden',        color: '#0A5040' },
];

function calculatePoints(activity, duration, intensity) {
  const actMult = { run: 1.5, gym: 1.2, cycle: 1.3, swim: 1.4, walk: 0.8 };
  const intMult = { low: 0.7, medium: 1.0, high: 1.4 };
  return Math.round(duration * (actMult[activity] ?? 1.0) * (intMult[intensity] ?? 1.0));
}

function showPtsAnimation(points) {
  const el = document.createElement('div');
  el.className = 'pts-popup';
  el.textContent = `+${points} pts`;
  el.style.left = '50%';
  el.style.top = '50%';
  el.style.transform = 'translate(-50%, -50%)';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1400);
}

function getWeekStart() {
  const d = new Date();
  const day = d.getDay();
  // Sunday=0 → offset 6, Monday=1 → offset 0, etc.
  const offset = (day === 0 ? 6 : day - 1);
  d.setDate(d.getDate() - offset);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getTodayStr() {
  return formatDate(new Date());
}

function getWeekDays() {
  const monday = getWeekStart();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

async function requireAuth() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    window.location.href = 'login.html';
    return null;
  }
  return session.user;
}

async function getProfile(userId) {
  const { data, error } = await sb
    .from('profiles')
    .select('*, neighbourhoods(*)')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}
