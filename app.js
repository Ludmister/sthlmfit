const SUPABASE_URL = 'https://caxbgtzhkwuipmflqmsm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNheGJndHpoa3d1aXBtZmxxbXNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwOTk1OTAsImV4cCI6MjA5NDY3NTU5MH0.SCBTqIsAIEN9_zDhxfnKiSZvQUtaHrrqMQFgnXGceXg';

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const NEIGHBOURHOODS = [
  { id: 1,  name: 'Södermalm',        slug: 'sodermalm',        color: '#1D9E75' }, // teal green
  { id: 2,  name: 'Vasastan',          slug: 'vasastan',          color: '#84CC16' }, // lime
  { id: 3,  name: 'Östermalm',         slug: 'ostermalm',         color: '#166534' }, // deep forest
  { id: 4,  name: 'Kungsholmen',       slug: 'kungsholmen',       color: '#0891B2' }, // sky blue
  { id: 5,  name: 'Gamla Stan',        slug: 'gamla-stan',        color: '#B45309' }, // ochre
  { id: 6,  name: 'Norrmalm',          slug: 'norrmalm',          color: '#475569' }, // slate
  { id: 7,  name: 'Hammarby Sjöstad',  slug: 'hammarby-sjostad',  color: '#0284C7' }, // water blue
  { id: 8,  name: 'Liljeholmen',       slug: 'liljeholmen',       color: '#7C3AED' }, // purple
  { id: 9,  name: 'Lidingö',           slug: 'lidingo',           color: '#38BDF8' }, // lake
  { id: 10, name: 'Djurgården',        slug: 'djurgarden',        color: '#4D7C0F' }, // moss
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

function activityLabel(key) {
  return { run: 'Löpning', gym: 'Gym', walk: 'Promenad', cycle: 'Cykel', swim: 'Simning' }[key] || key;
}
function activityIcon(key) {
  return { run: 'ti-run', gym: 'ti-barbell', walk: 'ti-walk', cycle: 'ti-bike', swim: 'ti-swim' }[key] || 'ti-bolt';
}
function activityKm(activity, duration) {
  const speed = { run: 10, walk: 5, cycle: 20, swim: 2 };
  const km = (speed[activity] || 0) * duration / 60;
  return km > 0 ? `${km.toFixed(1).replace('.',',')} km` : null;
}
function timeAgo(dateStr) {
  const s = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (s < 60)    return 'just nu';
  if (s < 3600)  return `${Math.floor(s/60)} min sedan`;
  if (s < 86400) return `${Math.floor(s/3600)} h sedan`;
  return `${Math.floor(s/86400)} d sedan`;
}
function getCountdownToMonday() {
  const now = new Date();
  const monday = new Date(now);
  const day = monday.getDay();
  const daysUntil = day === 1 ? 7 : (8 - day) % 7;
  monday.setDate(monday.getDate() + daysUntil);
  monday.setHours(0, 0, 0, 0);
  const diff = monday - now;
  const totalH = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (totalH >= 24) return `${Math.floor(totalH/24)}d ${totalH%24}h`;
  return `${totalH}h ${m}min`;
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
