/* ── Sky Background ── */
function initSky() {
  const sky = document.getElementById('sky');
  if (!sky) return;
  const rnd = (a,b) => a + Math.random()*(b-a);

  for (let i=0; i<160; i++) {
    const el = document.createElement('div');
    el.className = 'sky-star';
    const s = rnd(1,3.5);
    Object.assign(el.style, {
      width:s+'px', height:s+'px',
      left:rnd(0,100)+'%', top:rnd(0,100)+'%',
      '--d':rnd(2,5)+'s', '--dd':rnd(0,4)+'s',
      '--lo':rnd(.1,.35), '--hi':rnd(.6,1)
    });
    sky.appendChild(el);
  }

  [{l:'11%',t:'9%',w:90,h:90,c:'#e8a020',pd:'7s',oa:.7,ob:.9},
   {l:'79%',t:'5%',w:72,h:72,c:'#f5c842',pd:'5s',oa:.5,ob:.75},
   {l:'87%',t:'26%',w:38,h:38,c:'#f0d060',pd:'8s',oa:.4,ob:.65},
   {l:'4%',t:'45%',w:48,h:48,c:'#c47a15',pd:'9s',oa:.25,ob:.42}
  ].forEach(d => {
    const el = document.createElement('div');
    el.className = 'sky-orb';
    Object.assign(el.style, { left:d.l, top:d.t, width:d.w+'px', height:d.h+'px', background:d.c,
      '--pd':d.pd, '--oa':d.oa, '--ob':d.ob, '--dd':Math.random()*3+'s' });
    sky.appendChild(el);
  });
}

/* ── Toast ── */
let toastTimer;
function toast(msg, type='info') {
  let el = document.getElementById('toast');
  if (!el) { el = document.createElement('div'); el.id='toast'; document.body.appendChild(el); }
  el.textContent = msg;
  el.className = 'show ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.className='', 3000);
}

/* ── Nav scroll ── */
function initNavScroll() {
  const nav = document.querySelector('nav');
  if (!nav) return;
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 50));
}

/* ── Auth helpers ── */
const API = '';  // same origin

function getToken() { return localStorage.getItem('lumina_token'); }
function getUser()  { try { return JSON.parse(localStorage.getItem('lumina_user')); } catch { return null; } }
function setAuth(token, user) {
  localStorage.setItem('lumina_token', token);
  localStorage.setItem('lumina_user', JSON.stringify(user));
}
function clearAuth() { localStorage.removeItem('lumina_token'); localStorage.removeItem('lumina_user'); }
function isLoggedIn() { return !!getToken(); }

async function apiFetch(path, opts={}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(opts.headers||{}) };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(API + path, { ...opts, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

async function apiFetchForm(path, formData, method='POST') {
  const token = getToken();
  const headers = {};
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(API + path, { method, headers, body: formData });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

/* ── Nav auth state ── */
function updateNavAuth() {
  const user = getUser();
  const navRight = document.getElementById('navRight');
  if (!navRight) return;
  if (user) {
    navRight.innerHTML = `
      <a href="/dashboard" class="btn btn-ghost btn-sm">Dashboard</a>
      ${user.role==='admin'?'<a href="/admin" class="btn btn-ghost btn-sm">Admin</a>':''}
      <button onclick="logout()" class="btn btn-ghost btn-sm">Logout</button>
    `;
  } else {
    navRight.innerHTML = `
      <a href="/auth" class="btn btn-ghost btn-sm">Login</a>
      <a href="/auth?mode=register" class="btn btn-gold btn-sm">Sign Up</a>
    `;
  }
}

function logout() {
  clearAuth();
  toast('Logged out successfully', 'success');
  setTimeout(() => location.href = '/', 800);
}

/* ── Art placeholder SVG ── */
function artSVG(seed, w=400, h=300) {
  const pals = [['#0d2240','#1a3a6b'],['#1b2838','#2d4a7a'],['#071220','#1a3060']];
  const p = pals[seed%3];
  const g = ['#f5c842','#e8a020','#ffd060'][seed%3];
  const r = (a,b) => a + ((seed*1234+a*b)%100)/100*(b-a);
  let s = '';
  for(let i=0;i<5;i++) s+=`<ellipse cx="${r(0,w)}" cy="${r(0,h)}" rx="${r(20,w/2)}" ry="${r(20,h/2)}" fill="${p[i%2]}" opacity="${.25+i*.1}"/>`;
  for(let i=0;i<3;i++) s+=`<circle cx="${r(w*.2,w*.8)}" cy="${r(h*.2,h*.8)}" r="${r(5,22)}" fill="${g}" opacity="${.35+i*.15}"/>`;
  for(let i=0;i<4;i++) s+=`<path d="M${r(0,w)},${r(0,h)} Q${r(0,w)},${r(0,h)} ${r(0,w)},${r(0,h)}" stroke="${g}" stroke-width="${r(.5,2)}" fill="none" opacity="${.1+i*.08}"/>`;
  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block;">
    <defs><radialGradient id="g${seed}" cx="40%" cy="40%"><stop offset="0%" stop-color="${p[1]}"/><stop offset="100%" stop-color="${p[0]}"/></radialGradient></defs>
    <rect width="${w}" height="${h}" fill="url(#g${seed})"/>${s}</svg>`;
}

/* ── Intersection reveal ── */
function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if(e.isIntersecting){ e.target.style.opacity='1'; e.target.style.transform='translateY(0)'; }
    });
  }, { threshold:.08 });
  document.querySelectorAll('.reveal').forEach((el,i) => {
    el.style.cssText += `opacity:0;transform:translateY(22px);transition:opacity .6s ${i*.05}s ease,transform .6s ${i*.05}s ease;`;
    obs.observe(el);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initSky();
  initNavScroll();
  updateNavAuth();
  initReveal();
});
