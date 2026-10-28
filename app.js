// CycleRush \u2014 application web (sans framework, sans \u00e9tape de compilation).
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

/* ---------- Gabarits HTML \u00e9chapp\u00e9s ---------- */
class Raw { constructor(s) { this.s = s; } toString() { return this.s; } }
const raw = s => new Raw(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const out = v => v instanceof Raw ? v.s : Array.isArray(v) ? v.map(out).join('') : v === null || v === undefined || v === false ? '' : esc(v);
const html = (str, ...vals) => raw(str.reduce((a, s, i) => a + s + (i < vals.length ? out(vals[i]) : ''), ''));

/* ---------- Ic\u00f4nes ---------- */
const I = {
  logo: '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="17" fill="none" stroke="#22d3ee" stroke-width="2.6"/><circle cx="20" cy="20" r="11" fill="none" stroke="#22d3ee" stroke-width="1" opacity=".35"/><path d="M11 12.5l9 16 9-16" fill="none" stroke="#2dd4bf" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a2 2 0 0 1 2 2v.3A6 6 0 0 1 18 10v5l2 2v1H4v-1l2-2v-5a6 6 0 0 1 4-5.7V4a2 2 0 0 1 2-2Zm-2 17h4a2 2 0 0 1-4 0Z"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 6h18v2H3Zm0 5h18v2H3Zm0 5h18v2H3Z"/></svg>',
  route: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h7a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h7"/></svg>',
  pulse: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12h4l3-8 4 16 3-8h4"/></svg>',
  flag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 21V4m0 0h11l-2 4 2 4H5"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 20V10m6 10V4m6 16v-7m4 7H2"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/></svg>',
  target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>',
  bike: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="5.5" cy="17" r="3.5"/><circle cx="18.5" cy="17" r="3.5"/><path d="M5.5 17l4-8h6l3 8M9.5 9 12 17h-1M14 5h2"/></svg>',
  trainer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="17" cy="15" r="4"/><path d="M3 21h18M6 21l3-9h5l3 3M9 12l-1-4h3"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.5-9.2C1 8.3 3.2 5 6.6 5c2 0 3.4 1 4.4 2.4C12 6 13.4 5 15.4 5 18.8 5 21 8.3 19.5 11.8 17.5 16.4 12 21 12 21Z"/></svg>',
  coin: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.5" fill="#fbbf24"/><circle cx="12" cy="12" r="6.8" fill="none" stroke="#b45309" stroke-width="1.4"/><path d="M9.2 9.2 12 15l2.8-5.8" fill="none" stroke="#92400e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  shop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1 12H6Z"/><path d="M9 8a3 3 0 0 1 6 0"/></svg>',
  mountain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M2 20 9 7l4 7 3-4 6 10Z"/></svg>',
};

/* ---------- Mise en forme ---------- */
const nf = (n, d = 0) => Number(n || 0).toLocaleString('fr-FR', { maximumFractionDigits: d, minimumFractionDigits: 0 });
const km = m => nf(Number(m || 0) / 1000, Number(m) >= 100000 ? 0 : 1) + ' km';
const dur = s => { s = Number(s || 0); const h = Math.floor(s / 3600), m = Math.round((s % 3600) / 60); return h ? `${h} h ${String(m).padStart(2, '0')}` : `${m} min`; };
const date = d => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
const dateShort = d => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
const ago = d => {
  const s = (Date.now() - new Date(d)) / 1000;
  if (s < 60) return '\u00e0 l\u2019instant'; if (s < 3600) return `il y a ${Math.floor(s / 60)} min`; if (s < 86400) return `il y a ${Math.floor(s / 3600)} h`;
  if (s < 7 * 86400) return `il y a ${Math.floor(s / 86400)} j`; return dateShort(d);
};
const METRIC = { distance: 'km', elevation: 'm de d\u00e9nivel\u00e9', duration: 'min', count: 'sorties' };
const METRIC_NAME = { distance: 'Distance', elevation: 'D\u00e9nivel\u00e9', duration: 'Temps', count: 'Nombre de sorties' };
const VIS = { public: 'Tout le monde', friends: 'Mes amis', private: 'Moi uniquement' };
const coin = (n, cls = '') => html`<span class="coins ${cls}">${raw(I.coin)}<span class="num">${nf(n)}</span></span>`;
const me = () => state.user ? { ...state.user, frame: state.user.rewards?.frame } : null;
// Portrait du cycliste dessin\u00e9 \u00e0 partir de sa tenue du garage (utilis\u00e9 quand il n'a pas de photo).
const SKIN = { s1: '#f2d3bd', s2: '#e0b393', s3: '#c68e6a', s4: '#9b6a48', s5: '#6b4630' };
const GLASSES = { noires: '#111827', miroir: '#22d3ee', orange: '#f97316' };
const hex = c => /^#[0-9a-f]{6}$/i.test(c || '') ? c : '#9ca3af';
function portrait(r) {
  const sk = SKIN[r.skin] || SKIN.s2, j1 = hex(r.jerseyColor), j2 = hex(r.jerseyColor2), hc = hex(r.helmetColor);
  const band = r.jerseyPattern === 'bande' ? `<rect x="8" y="53" width="48" height="5" fill="${j2}"/>` : r.jerseyPattern === 'bicolore' ? `<rect x="6" y="56" width="52" height="10" fill="${j2}"/>` : '';
  const shoulders = r.jerseyPattern === 'col' || r.jerseyPattern === 'manches' ? j2 : j1;
  const helmet = r.helmet === 'casquette' ? `<path d="M19 27a13 12 0 0 1 26 0z" fill="${hc}"/><path d="M40 26h11l-2 3h-9z" fill="${hc}"/>`
    : r.helmet === 'aero' ? `<path d="M17 29c0-10 7-16 16-16 8 0 13 4 18 13-7 2-14 3-34 3z" fill="${hc}"/>`
    : `<path d="M18 29c0-9 6-15 14-15s14 6 14 15z" fill="${hc}"/><path d="M24 16v6M32 14v7M40 16v6" stroke="#1f2937" stroke-width="2"/>`;
  const gl = GLASSES[r.glasses] ? `<rect x="21" y="30" width="22" height="5" rx="2.5" fill="${GLASSES[r.glasses]}"/>` : '';
  return `<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" fill="#0d1a30"/><path d="M6 66c1-14 10-20 26-20s25 6 26 20z" fill="${j1}"/>${band}<path d="M6 66c1-14 10-20 26-20" fill="none" stroke="${shoulders}" stroke-width="7"/><path d="M58 66c-1-14-10-20-26-20" fill="none" stroke="${shoulders}" stroke-width="7"/><rect x="27" y="38" width="10" height="10" fill="${sk}"/><circle cx="32" cy="31" r="11" fill="${sk}"/>${helmet}${gl}</svg>`;
}
const avatar = (u, cls = '') => html`<span class="ava ${cls} ${u?.frame ? 'fr ' + u.frame : ''} ${!u?.avatar && u?.rider ? 'rider' : ''}" aria-hidden="true">${u?.avatar ? html`<img src="${u.avatar}" alt="">` : u?.rider ? raw(portrait(u.rider)) : (u?.username || '?')[0].toUpperCase()}</span>`;

/* ---------- \u00c9tat et API ---------- */
const state = { user: null, unread: 0, info: {} };
// D\u00e9mo : la page vit dans un cadre ; l'adresse est gard\u00e9e en m\u00e9moire.
const VL = { pathname: '/', search: '', hash: '' };
// D\u00e9mo : un profil a une adresse partageable \u00ab #u-<nom> \u00bb (\u00ab #u-<id>-<nom> \u00bb quand on vient de l'admin).
// L'adresse du cadre suit la page affich\u00e9e, pour survivre \u00e0 une actualisation et servir de lien direct.
function vvHash() {
  const pr = VL.pathname.match(/^\/parcours\/([a-z0-9-]+)$/);
  if (pr) return '#p-' + pr[1];
  if (VL.pathname === '/parcours') return '#liste-parcours';
  if (VL.pathname === '/garage') return '#garage';
  if (VL.pathname === '/boutique') return '#boutique';
  if (VL.pathname === '/capteurs') return '#capteurs';
  if (VL.pathname === '/ensemble') return '#ensemble';
  if (VL.pathname === '/segments') { const q = new URLSearchParams(VL.search); return q.get('id') ? '#seg-' + encodeURIComponent(q.get('id')) : q.get('parcours') ? '#segments-' + q.get('parcours') : '#segments'; }
  const m = VL.pathname.match(/^\/u\/([^/]+)$/);
  if (!m) return location.pathname + location.search;
  const qs = new URLSearchParams(VL.search), id = qs.get('id');
  return '#u-' + (qs.get('depuis') === 'admin' && /^\d+$/.test(id || '') ? id + '-' : '') + m[1];
}
function readVVHash() {
  const h = location.hash || '';
  if (h === '#garage') { setVL('/garage'); return; }
  if (h === '#boutique') { setVL('/boutique'); return; }
  if (h === '#capteurs') { setVL('/capteurs'); return; }
  if (h === '#liste-parcours') { setVL('/parcours'); return; }
  if (h === '#ensemble') { setVL('/ensemble'); return; }
  if (h === '#segments') { setVL('/segments'); return; }
  const sg = h.match(/^#seg-(.+)$/); if (sg) { setVL('/segments?id=' + sg[1]); return; }
  const sp = h.match(/^#segments-([a-z0-9-]+)$/); if (sp) { setVL('/segments?parcours=' + sp[1]); return; }
  const pm = h.match(/^#p-([a-z0-9-]+)$/);
  if (pm) { setVL('/parcours/' + pm[1]); return; }
  let m = h.match(/^#u-(\d+)-([A-Za-z0-9_.-]+)$/);
  if (m) { setVL('/u/' + m[2] + '?depuis=admin&id=' + m[1]); return; }
  m = h.match(/^#u-([A-Za-z0-9_.-]+)$/);
  if (m) setVL('/u/' + m[1]);
}
addEventListener('hashchange', () => { const before = VL.pathname + VL.search; readVVHash(); if (VL.pathname + VL.search !== before) render(); });
function setVL(p) { const u = new URL(p, 'https://demo.local'); VL.pathname = u.pathname; VL.search = u.search; VL.hash = u.hash; }

async function api(method, path, body) {
  let r;
  try {
    r = await fetch('/api' + path, { method, credentials: 'same-origin', headers: { 'content-type': 'application/json', 'x-veloverse': '1' }, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch { throw Object.assign(new Error('Connexion impossible. V\u00e9rifie ta connexion internet.'), { code: 'network' }); }
  let data = {};
  try { data = await r.json(); } catch {}
  if (!r.ok) {
    const e = Object.assign(new Error(data.error || 'Une erreur est survenue.'), { status: r.status, code: data.code, field: data.field });
    if (e.code === 'session_expired' && state.user) { state.user = null; renderNav(); toast('Ta session a expir\u00e9. Reconnecte-toi.', 'bad'); go('/connexion?retour=' + encodeURIComponent(VL.pathname)); }
    throw e;
  }
  return data;
}

async function loadMe() {
  try { const d = await api('GET', '/auth/me'); state.user = d.user; state.unread = d.unread || 0; state.announcement = d.announcement; }
  catch { state.user = null; }
}

/* ---------- Messages et fen\u00eatres ---------- */
function toast(msg, kind = 'ok') {
  const t = document.createElement('div');
  t.className = 'toast ' + kind; t.textContent = msg; t.setAttribute('role', kind === 'bad' ? 'alert' : 'status');
  $('#toasts').append(t); setTimeout(() => t.remove(), 4200);
}

function modal(content, onMount) {
  const bg = document.createElement('div');
  bg.className = 'modal-bg';
  bg.innerHTML = out(html`<div class="modal" role="dialog" aria-modal="true">${content}</div>`);
  const prev = document.activeElement;
  const close = () => { bg.remove(); document.removeEventListener('keydown', onKey); prev?.focus?.(); };
  const onKey = e => { if (e.key === 'Escape') close(); };
  bg.addEventListener('click', e => { if (e.target === bg || e.target.closest('[data-close]')) close(); });
  document.addEventListener('keydown', onKey);
  document.body.append(bg);
  (bg.querySelector('input,textarea,select,button:not([data-close])') || bg.querySelector('button'))?.focus();
  onMount?.(bg.firstElementChild, close);
  return close;
}

function confirmBox({ title, text, confirm = 'Confirmer', danger = false }) {
  return new Promise(res => {
    let done = false;
    const close = modal(html`<h2>${title}</h2><p class="muted" style="margin:0">${text}</p>
      <div class="modal-acts"><button class="btn ghost" data-close>Annuler</button><button class="btn ${danger ? 'danger' : 'primary'}" data-ok>${confirm}</button></div>`,
    m => {
      m.querySelector('[data-ok]').onclick = () => { done = true; close(); res(true); };
      const obs = new MutationObserver(() => { if (!m.isConnected) { obs.disconnect(); if (!done) res(false); } });
      obs.observe(document.body, { childList: true });
    });
  });
}

// Formulaire : envoie, affiche l'erreur au bon endroit, r\u00e9active le bouton.
function bindForm(form, fn) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('[type=submit]'), box = form.querySelector('.form-err');
    $$('[aria-invalid]', form).forEach(x => x.removeAttribute('aria-invalid'));
    if (box) box.hidden = true;
    if (btn) btn.disabled = true;
    try { await fn(Object.fromEntries(new FormData(form)), form); }
    catch (err) {
      if (box) { box.textContent = err.message; box.hidden = false; } else toast(err.message, 'bad');
      if (err.field) { const f = form.querySelector(`[name="${err.field}"]`); if (f) { f.setAttribute('aria-invalid', 'true'); f.focus(); } }
    } finally { if (btn && btn.isConnected) btn.disabled = false; }
  });
}

/* ---------- Routeur ---------- */
const routes = [];
const route = (pattern, fn, opts = {}) => routes.push({ re: new RegExp('^' + pattern.replace(/:(\w+)/g, '([^/]+)') + '/?$'), keys: (pattern.match(/:(\w+)/g) || []).map(k => k.slice(1)), fn, ...opts });

function go(path, { replace = false } = {}) {
  setVL(path);
  const h = vvHash();
  try { if (replace) history.replaceState({ vv: path }, '', h); else history.pushState({ vv: path }, '', h); } catch {}
  render();
}

// Liens internes \u00ab data-go \u00bb : navigation directe dans l'application, sans d\u00e9pendre de l'adresse de la page (fonctionne
// aussi quand l'application est affich\u00e9e dans un cadre ou une page int\u00e9gr\u00e9e).
document.addEventListener('click', e => {
  const a = e.target.closest('a[data-go]');
  if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
  e.preventDefault(); e.stopImmediatePropagation(); go(a.dataset.go);
}, true);
document.addEventListener('click', e => {
  const a = e.target.closest('a[href]');
  if (!a || a.target || a.hasAttribute('download') || a.dataset.external !== undefined || e.metaKey || e.ctrlKey || e.shiftKey) return;
  const u = new URL(a.href, location.href);
  if (u.origin !== location.origin || u.pathname.startsWith('/api') || u.pathname.startsWith('/admin') || /\.\w+$/.test(u.pathname)) return;
  e.preventDefault();
  if (u.pathname === VL.pathname && u.search === VL.search && u.hash) { VL.hash = u.hash; document.getElementById(u.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }); return; }
  go(u.pathname + u.search + u.hash);
});
addEventListener('popstate', e => { if (e.state && e.state.vv) { setVL(e.state.vv); render(); } });

let renderId = 0;
async function render() {
  const id = ++renderId;
  closeMenus();
  stopViews.splice(0).forEach(f => { try { f(); } catch {} });
  const path = VL.pathname;
  const r = routes.find(r => r.re.test(path)) || routes.find(r => r.notFound);
  if (r.auth && !state.user) return go('/connexion?retour=' + encodeURIComponent(path + VL.search), { replace: true });
  if (r.guest && state.user) return go('/tableau-de-bord', { replace: true });
  const params = {};
  const m = path.match(r.re);
  if (m) r.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));
  renderNav();
  const main = $('#main');
  main.innerHTML = '<div class="loading"><div class="spin" role="status" aria-label="Chargement"></div></div>';
  try {
    const view = await r.fn(params, new URLSearchParams(VL.search));
    if (id !== renderId) return;
    main.innerHTML = out(view.html);
    document.title = (view.title ? view.title + ' \u2014 ' : '') + 'CycleRush' + (view.title ? '' : ' \u2014 Le cyclisme sans limites');
    view.mount?.(main);
  } catch (e) {
    if (id !== renderId) return;
    main.innerHTML = out(html`<div class="wrap page"><div class="alert bad" role="alert">${e.message}</div><p><a href="/">Retour \u00e0 l\u2019accueil</a></p></div>`);
  }
  if (VL.hash) document.getElementById(VL.hash.slice(1))?.scrollIntoView();
  else window.scrollTo(0, 0);
  if (!r.keepFocus) main.focus({ preventScroll: true });
  if (state.user && id === renderId) checkMilestones();
}

/* ---------- Navigation ---------- */
function closeMenus() { $('#dropdown')?.remove(); $('.links')?.classList.remove('open'); }

function renderNav() {
  const u = state.user, p = VL.pathname;
  const cur = path => (p === path ? 'aria-current="page"' : '');
  $('#nav').innerHTML = out(html`<div class="nav-in">
    <a class="logo" href="/" aria-label="CycleRush, accueil">${raw(I.logo)}<span class="lt">Cycle<span>Rush</span></span></a>
    <nav class="links" id="links" aria-label="Navigation principale">
      <a href="/" ${raw(cur('/'))}>Accueil</a>
      <a href="/#parcours">Parcours</a>
      <a href="/defis" ${raw(cur('/defis'))}>D\u00e9fis</a>
      ${u ? '' : html`<a href="/#fonctionnalites">Fonctionnalit\u00e9s</a>`}
      ${u ? html`<a href="/ensemble" ${raw(cur('/ensemble'))}>Rouler ensemble</a><a href="/segments" ${raw(cur('/segments'))}>Segments</a><a href="/amis" ${raw(cur('/amis'))}>Amis</a><a href="/tableau-de-bord" ${raw(cur('/tableau-de-bord'))}>Tableau de bord</a>` : ''}
    </nav>
    <div class="nav-right">
      ${u ? html`
        <a class="icon-btn" href="/notifications" aria-label="Notifications${state.unread ? ` (${state.unread} non lues)` : ''}">${raw(I.bell)}${state.unread ? html`<span class="badge">${state.unread > 99 ? '99+' : state.unread}</span>` : ''}</a>
        <a class="xp-chip" href="/boutique" aria-label="Niveau ${u.rewards.level}, ${u.rewards.coins} pi\u00e8ces"><span class="lv">Niv. ${u.rewards.level}</span>${coin(u.rewards.coins)}</a>
        <button class="menu-btn" id="accBtn" aria-haspopup="menu" aria-expanded="false">${avatar(me(), 'sm')}<b>${u.username}</b></button>`
      : html`<a class="btn ghost sm" href="/connexion">Connexion</a><a class="btn primary sm" href="/inscription">Inscription</a>`}
      <button class="icon-btn burger" id="burger" aria-label="Ouvrir le menu" aria-controls="links" aria-expanded="false">${raw(I.menu)}</button>
    </div></div>`);
  $('#burger').onclick = e => { const l = $('#links'); const o = !l.classList.contains('open'); l.classList.toggle('open', o); e.currentTarget.setAttribute('aria-expanded', o); };
  const acc = $('#accBtn');
  if (acc) acc.onclick = e => {
    e.stopPropagation();
    if ($('#dropdown')) return closeMenus();
    const d = document.createElement('div');
    d.id = 'dropdown'; d.className = 'dropdown'; d.setAttribute('role', 'menu');
    d.innerHTML = out(html`<div class="who">Connect\u00e9 en tant que <b>${u.username}</b><br>${u.roleLabel} \u00b7 Niveau ${u.rewards.level} \u00b7 ${nf(u.rewards.xp)} XP</div>
      <a role="menuitem" href="/tableau-de-bord">Tableau de bord</a>
      <a role="menuitem" href="/u/${encodeURIComponent(u.username)}">Mon profil</a>
      <a role="menuitem" href="/amis">Amis</a>
      <a role="menuitem" href="/ensemble">Sorties entre amis et courses</a>
      <a role="menuitem" href="/segments">Segments et records</a>
      <a role="menuitem" href="/boutique">Boutique et progression</a>
      <a role="menuitem" href="/garage">Garage : v\u00e9lo et tenue</a>
      <a role="menuitem" href="/capteurs">Capteurs</a>
      <a role="menuitem" href="home-trainer.html" data-external>Entra\u00eenement home trainer</a>
      <a role="menuitem" href="/parametres">Param\u00e8tres</a>
      ${u.permissions.includes('admin.access') ? html`<a role="menuitem" href="admin.html" data-external>Administration</a>` : ''}
      <hr><button role="menuitem" id="logoutBtn">Se d\u00e9connecter</button>`);
    document.body.append(d);
    acc.setAttribute('aria-expanded', 'true');
    d.querySelector('a').focus();
    $('#logoutBtn').onclick = logout;
  };
}
document.addEventListener('click', e => { if ($('#dropdown') && !e.target.closest('#dropdown')) closeMenus(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('#dropdown')) { closeMenus(); $('#accBtn')?.focus(); } });

async function logout() {
  try { await api('POST', '/auth/logout'); } catch {}
  state.user = null; state.unread = 0;
  toast('Tu es d\u00e9connect\u00e9. \u00c0 bient\u00f4t sur la route !');
  go('/');
}

function renderFooter() {
  const c = state.info.contactEmail;
  $('#footer').innerHTML = out(html`<div class="wrap foot">
    <div><a class="logo" href="/">${raw(I.logo)}<span>Cycle<span>Rush</span></span></a><p>La plateforme de cyclisme virtuel pour rouler, progresser et partager.</p></div>
    <div><h4>Explorer</h4><a href="/">Accueil</a><a href="/#parcours">Parcours</a><a href="/defis">D\u00e9fis</a><a href="/#fonctionnalites">Fonctionnalit\u00e9s</a><a href="home-trainer.html" data-external>Home trainer</a><a href="/capteurs">Capteurs</a></div>
    <div><h4>Compte</h4><a href="/connexion">Connexion</a><a href="/inscription">Inscription</a><a href="/tableau-de-bord">Tableau de bord</a></div>
    <div><h4>Informations</h4><a href="/conditions">Conditions d\u2019utilisation</a><a href="/confidentialite">Politique de confidentialit\u00e9</a>
      ${c ? html`<a href="mailto:${c}">${c}</a>` : html`<p style="margin:4px 0 0">Contact : bient\u00f4t disponible.</p>`}</div>
  </div>`);
}

/* =========================================================
   Pages
   ========================================================= */

/* ---------- Accueil ---------- */
const ROUTES = [
  { id: 'cap-horizon', name: 'Cap Horizon', img: 'img/r1.jpg', km: 32, dplus: 480, level: 'Facile', lv: 1, alt: 'Route c\u00f4ti\u00e8re qui longe la mer' },
  { id: 'col-des-lumieres', name: 'Col des Lumi\u00e8res', img: 'img/r2.jpg', km: 78, dplus: 1420, level: 'Difficile', lv: 3, alt: 'Route de col face aux sommets enneig\u00e9s' },
  { id: 'valley-loop', name: 'Valley Loop', img: 'img/r3.jpg', km: 56, dplus: 860, level: 'Moyen', lv: 2, alt: 'Route au milieu des roches rouges d\u2019un canyon' },
  { id: 'lac-des-sapins', name: 'Lac des Sapins', img: 'img/r4.jpg', km: 48, dplus: 720, level: 'Moyen', lv: 2, alt: 'Route au bord d\u2019un lac entour\u00e9 de sapins' },
];
const LV_COLOR = ['', 'var(--ok)', 'var(--warn)', 'var(--bad)'];

function challengeCard(c, compact = false) {
  const pct = c.progress !== undefined ? Math.min(100, (c.progress / c.target) * 100) : 0;
  const st = c.status === 'upcoming' ? html`<span class="pill cyan">\u00c0 venir</span>` : c.status === 'ended' ? html`<span class="pill">Termin\u00e9</span>` : html`<span class="pill ok">En cours</span>`;
  return html`<article class="card ch">
    <div class="ch-top"><h3>${c.title}</h3>${c.completedAt ? html`<span class="pill ok">R\u00e9ussi</span>` : st}</div>
    ${c.description && !compact ? html`<p class="muted" style="margin:0">${c.description}</p>` : ''}
    <p class="muted" style="margin:0;font-size:14px">Objectif : <b style="color:var(--fg)">${nf(c.target)} ${METRIC[c.metric]}</b> \u00b7 du ${dateShort(c.startsAt)} au ${dateShort(c.endsAt)} \u00b7 ${c.participants} participant${c.participants > 1 ? 's' : ''}</p>
    ${c.joined ? html`<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${c.target}" aria-valuenow="${c.progress}" aria-label="Progression"><i style="width:${pct}%"></i></div>
      <p class="num" style="margin:0;font-size:14px">${nf(c.progress, 1)} / ${nf(c.target)} ${METRIC[c.metric]}</p>` : ''}
    ${compact ? '' : html`<div>${!state.user ? html`<a class="btn sm" href="/connexion?retour=/defis">Connecte-toi pour participer</a>`
      : c.joined ? html`<button class="btn sm ghost" data-leave="${c.id}">Quitter le d\u00e9fi</button>`
      : c.status !== 'ended' ? html`<button class="btn sm primary" data-join="${c.id}">Participer</button>` : ''}</div>`}
  </article>`;
}

function bindChallenges(root, reload) {
  root.addEventListener('click', async e => {
    const j = e.target.closest('[data-join]'), l = e.target.closest('[data-leave]');
    if (!j && !l) return;
    const b = j || l; b.disabled = true;
    try {
      await api('POST', `/challenges/${(j || l).dataset[j ? 'join' : 'leave']}/${j ? 'join' : 'leave'}`);
      toast(j ? 'Tu participes au d\u00e9fi. Tes prochaines sorties comptent !' : 'Tu as quitt\u00e9 le d\u00e9fi.');
      reload();
    } catch (err) { toast(err.message, 'bad'); b.disabled = false; }
  });
}

route('/', async () => {
  const ch = await api('GET', '/challenges').catch(() => ({ items: [] }));
  const items = ch.items.filter(c => c.status !== 'ended').slice(0, 3);
  const u = state.user;
  const feats = [
    [I.route, 'Parcours virtuels', 'Des routes de c\u00f4te, de col et de canyon \u00e0 parcourir depuis ton home trainer.'],
    [I.pulse, 'Suivi des activit\u00e9s', 'Chaque sortie enregistr\u00e9e : distance, dur\u00e9e, d\u00e9nivel\u00e9, puissance et cardio.'],
    [I.flag, 'D\u00e9fis cyclistes', 'Rejoins des d\u00e9fis dat\u00e9s et vois ta progression se mettre \u00e0 jour \u00e0 chaque sortie.'],
    [I.chart, 'Statistiques personnelles', 'Tes kilom\u00e8tres, ton temps et ton d\u00e9nivel\u00e9, semaine apr\u00e8s semaine.'],
    [I.users, 'Amis et social', 'Ajoute des amis, suis leurs sorties et encourage-les d\u2019un clic.'],
    [I.target, 'Progression et objectifs', 'Fixe tes objectifs de la semaine ou du mois et suis o\u00f9 tu en es.'],
  ];
  return {
    html: html`
    <section class="hero">
      <div class="hero-bg" role="img" aria-label="Cycliste sur une route de corniche au bord d\u2019un lac de montagne"></div>
      <div class="wrap hero-in">
        <span class="tag">${raw(I.bike.replace('<svg', '<svg width="18" height="18"'))} Plateforme de cyclisme virtuel</span>
        <h1 style="margin-top:16px">Le cyclisme <em>sans limites.</em></h1>
        <p>CycleRush te permet de d\u00e9couvrir des parcours, de suivre tes activit\u00e9s et de partager ta passion du v\u00e9lo avec une communaut\u00e9 de cyclistes.</p>
        <div class="hero-cta">
          <a class="btn primary" href="${u ? '/tableau-de-bord' : '/inscription'}">Commencer l\u2019aventure</a>
          <a class="btn ghost" href="/parcours" data-go="/parcours">D\u00e9couvrir les parcours</a>
        </div>
      </div>
      <div class="hero-line" aria-hidden="true"></div>
    </section>

    <div class="wrap">
      <section class="sec" id="fonctionnalites" aria-labelledby="f-t">
        <div class="sec-h"><div><span class="tag">Fonctionnalit\u00e9s</span><h2 id="f-t">Tout pour rouler, progresser et partager</h2></div></div>
        <div class="grid g3">${feats.map(([ic, t, d]) => html`<article class="feat"><div class="ic">${raw(ic)}</div><h3>${t}</h3><p>${d}</p></article>`)}</div>
      </section>

      <section class="sec" id="parcours" aria-labelledby="p-t">
        <div class="sec-h"><div><span class="tag">Parcours</span><h2 id="p-t">Choisis ta route</h2><p>Des d\u00e9cors vari\u00e9s, du bord de mer aux grands cols.</p></div>
          <a class="btn" href="home-trainer.html" data-external>${raw(I.trainer.replace('<svg', '<svg width="18" height="18"'))} Rouler sur home trainer</a></div>
        <div class="grid g4">${ROUTES.map(r => html`<a class="route-link" href="/parcours/${r.id}" aria-label="Aper\u00e7u du parcours ${r.name}"><article class="route"><img src="${r.img}" alt="${r.alt}" loading="lazy" width="640" height="320">
          <div class="route-b"><h3>${r.name}</h3>
          <div class="route-m"><span>${raw(I.route.replace('<svg', '<svg width="15" height="15" style="vertical-align:-2px"'))} ${r.km} km</span><span>${raw(I.mountain.replace('<svg', '<svg width="15" height="15" style="vertical-align:-2px"'))} ${nf(r.dplus)} m D+</span></div>
          <div class="route-m"><span><span class="dots">${[1, 2, 3].map(i => html`<i style="${i <= r.lv ? `background:${LV_COLOR[r.lv]}` : ''}"></i>`)}</span>${r.level}</span></div></div></article></a>`)}</div>
        <p class="example">Clique sur un parcours pour voir son aper\u00e7u en 3D et le rouler. <a href="/parcours">Voir tous les parcours</a></p>
      </section>

      <section class="sec" id="defis" aria-labelledby="d-t">
        <div class="sec-h"><div><span class="tag">D\u00e9fis</span><h2 id="d-t">Rel\u00e8ve des d\u00e9fis</h2><p>Les d\u00e9fis sont publi\u00e9s par l\u2019\u00e9quipe CycleRush. Chaque sortie enregistr\u00e9e fait avancer ta progression.</p></div>
          <a class="btn" href="/defis">Voir tous les d\u00e9fis</a></div>
        ${items.length ? html`<div class="grid g3" id="chList">${items.map(c => challengeCard(c))}</div>`
          : html`<div class="empty">Aucun d\u00e9fi n\u2019est ouvert pour le moment. Reviens bient\u00f4t : les prochains d\u00e9fis appara\u00eetront ici.</div>`}
      </section>

      <section class="cta-band">
        <h2>Pr\u00eat \u00e0 rejoindre CycleRush ?</h2>
        <p>Cr\u00e9e ton compte gratuitement, connecte ton home trainer et commence \u00e0 enregistrer tes sorties.</p>
        <a class="btn primary" href="${u ? '/tableau-de-bord' : '/inscription'}">${u ? 'Aller \u00e0 mon tableau de bord' : 'Cr\u00e9er mon compte'}</a>
      </section>
    </div>`,
    mount: m => { const l = $('#chList', m); if (l) bindChallenges(l, render); },
  };
});

/* ---------- Acc\u00e8s ---------- */
const pwHint = 'Au moins 10 caract\u00e8res, avec au moins une lettre et un chiffre.';
function strength(pw) {
  let s = 0; if (pw.length >= 10) s++; if (pw.length >= 14) s++; if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++; if (/\d/.test(pw)) s++; if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
function bindMeter(input, meter) {
  input.addEventListener('input', () => {
    const s = strength(input.value), i = meter.firstElementChild;
    i.style.width = (s / 5) * 100 + '%';
    i.style.background = s <= 2 ? 'var(--bad)' : s === 3 ? 'var(--warn)' : 'var(--ok)';
  });
}
async function afterLogin(retour) {
  await loadMe();
  const inv = sessionStorage.getItem('vv_invite');
  if (inv) { sessionStorage.removeItem('vv_invite'); try { await api('POST', `/invites/${inv}/accept`); toast('Invitation accept\u00e9e : vous \u00eates maintenant amis !'); } catch {} }
  const dest = retour && retour.startsWith('/') && !retour.startsWith('//') ? retour : '/tableau-de-bord';
  if (dest.startsWith('/admin')) location.href = 'admin.html'; else if (/\.html$/.test(dest.split('?')[0])) location.href = dest.replace(/^\//, ''); else go(dest);
}

route('/connexion', async (p, qs) => ({
  title: 'Connexion',
  html: html`<div class="wrap"><section class="auth card" aria-labelledby="t">
    <h1 id="t">Content de te revoir</h1>
    <form id="f" novalidate>
      <div class="alert bad form-err" role="alert" hidden></div>
      <div class="field"><label for="login">E-mail ou nom d\u2019utilisateur</label><input class="input" id="login" name="login" autocomplete="username" required></div>
      <div class="field"><label for="password">Mot de passe</label><input class="input" id="password" name="password" type="password" autocomplete="current-password" required></div>
      <a href="/mot-de-passe-oublie" style="font-size:14px;align-self:flex-end">Mot de passe oubli\u00e9 ?</a>
      <button class="btn primary" type="submit">Se connecter</button>
    </form>
    <p class="alt">Pas encore de compte ? <a href="/inscription">Inscris-toi</a></p>
  </section></div>`,
  mount: m => bindForm($('#f', m), async d => {
    if (!d.login || !d.password) throw new Error('Remplis les deux champs.');
    await api('POST', '/auth/login', d);
    toast('Connexion r\u00e9ussie.');
    await afterLogin(qs.get('retour'));
  }),
}), { guest: true });

route('/inscription', async () => ({
  title: 'Inscription',
  html: html`<div class="wrap"><section class="auth card" aria-labelledby="t">
    <h1 id="t">Rejoins CycleRush</h1>
    ${state.info.registrationOpen === false ? html`<div class="alert info">Les inscriptions sont ferm\u00e9es pour le moment. R\u00e9essaie plus tard.</div>` : ''}
    ${sessionStorage.getItem('vv_invite') ? html`<div class="alert info">Tu as \u00e9t\u00e9 invit\u00e9 : tu seras ajout\u00e9 automatiquement comme ami.</div>` : ''}
    <form id="f" novalidate>
      <div class="alert bad form-err" role="alert" hidden></div>
      <div class="field"><label for="username">Nom d\u2019utilisateur</label><input class="input" id="username" name="username" autocomplete="username" minlength="3" maxlength="20" pattern="[A-Za-z0-9_.\\-]+" required aria-describedby="uh"><span class="hint" id="uh">3 \u00e0 20 caract\u00e8res : lettres sans accent, chiffres, \u00ab _ \u00bb, \u00ab . \u00bb, \u00ab - \u00bb. Il sera visible par les autres.</span></div>
      <div class="field"><label for="email">Adresse e-mail</label><input class="input" id="email" name="email" type="email" autocomplete="email" required><span class="hint">Jamais affich\u00e9e publiquement.</span></div>
      <div class="field"><label for="password">Mot de passe</label><input class="input" id="password" name="password" type="password" autocomplete="new-password" required aria-describedby="ph"><div class="meter" id="meter"><i></i></div><span class="hint" id="ph">${pwHint}</span></div>
      <div class="field"><label for="password2">Confirme le mot de passe</label><input class="input" id="password2" name="password2" type="password" autocomplete="new-password" required></div>
      <label class="check"><input type="checkbox" name="terms" id="terms"> <span>J\u2019accepte les <a href="/conditions" target="_blank" rel="noopener">conditions d\u2019utilisation</a> et la <a href="/confidentialite" target="_blank" rel="noopener">politique de confidentialit\u00e9</a>.</span></label>
      <button class="btn primary" type="submit">Cr\u00e9er mon compte</button>
    </form>
    <p class="alt">D\u00e9j\u00e0 inscrit ? <a href="/connexion">Connecte-toi</a></p>
  </section></div>`,
  mount: m => {
    bindMeter($('#password', m), $('#meter', m));
    bindForm($('#f', m), async d => {
      if (!/^[A-Za-z0-9_.-]{3,20}$/.test(d.username || '')) throw Object.assign(new Error('Nom d\u2019utilisateur invalide : 3 \u00e0 20 caract\u00e8res, lettres sans accent, chiffres, \u00ab _ \u00bb, \u00ab . \u00bb ou \u00ab - \u00bb.'), { field: 'username' });
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email || '')) throw Object.assign(new Error('Cette adresse e-mail n\u2019est pas valide.'), { field: 'email' });
      if ((d.password || '').length < 10 || !/\d/.test(d.password) || !/[A-Za-z\u00c0-\u00ff]/.test(d.password)) throw Object.assign(new Error('Mot de passe trop faible. ' + pwHint), { field: 'password' });
      if (d.password !== d.password2) throw Object.assign(new Error('Les deux mots de passe ne sont pas identiques.'), { field: 'password2' });
      if (!d.terms) throw Object.assign(new Error('Tu dois accepter les conditions d\u2019utilisation.'), { field: 'terms' });
      const invite = sessionStorage.getItem('vv_invite') || undefined;
      await api('POST', '/auth/register', { username: d.username, email: d.email, password: d.password, acceptTerms: true, invite });
      sessionStorage.removeItem('vv_invite');
      await loadMe();
      toast('Bienvenue sur CycleRush ! Un e-mail de confirmation t\u2019a \u00e9t\u00e9 envoy\u00e9.');
      go('/tableau-de-bord');
    });
  },
}), { guest: true });

route('/mot-de-passe-oublie', async () => ({
  title: 'Mot de passe oubli\u00e9',
  html: html`<div class="wrap"><section class="auth card" aria-labelledby="t">
    <h1 id="t">Mot de passe oubli\u00e9</h1>
    <p class="muted" style="margin:0">Indique ton adresse e-mail. Si un compte y correspond, tu recevras un lien valable une heure.</p>
    <form id="f" novalidate>
      <div class="alert bad form-err" role="alert" hidden></div>
      <div class="alert ok" id="okBox" role="status" hidden></div>
      <div class="field"><label for="email">Adresse e-mail</label><input class="input" id="email" name="email" type="email" autocomplete="email" required></div>
      <button class="btn primary" type="submit">Envoyer le lien</button>
    </form>
    <p class="alt"><a href="/connexion">Retour \u00e0 la connexion</a></p>
  </section></div>`,
  mount: m => bindForm($('#f', m), async d => {
    const r = await api('POST', '/auth/forgot', { email: d.email });
    const ok = $('#okBox', m); ok.textContent = r.message; ok.hidden = false;
  }),
}));

route('/reinitialiser', async (p, qs) => ({
  title: 'Nouveau mot de passe',
  html: html`<div class="wrap"><section class="auth card" aria-labelledby="t">
    <h1 id="t">Choisis un nouveau mot de passe</h1>
    <form id="f" novalidate>
      <div class="alert bad form-err" role="alert" hidden></div>
      <div class="field"><label for="password">Nouveau mot de passe</label><input class="input" id="password" name="password" type="password" autocomplete="new-password" required><div class="meter" id="meter"><i></i></div><span class="hint">${pwHint}</span></div>
      <div class="field"><label for="password2">Confirme le mot de passe</label><input class="input" id="password2" name="password2" type="password" autocomplete="new-password" required></div>
      <button class="btn primary" type="submit">Enregistrer</button>
    </form>
  </section></div>`,
  mount: m => {
    bindMeter($('#password', m), $('#meter', m));
    bindForm($('#f', m), async d => {
      if (d.password !== d.password2) throw Object.assign(new Error('Les deux mots de passe ne sont pas identiques.'), { field: 'password2' });
      await api('POST', '/auth/reset', { token: qs.get('jeton'), password: d.password });
      state.user = null;
      toast('Mot de passe modifi\u00e9. Connecte-toi avec ton nouveau mot de passe.');
      go('/connexion');
    });
  },
}));

route('/verifier', async (p, qs) => {
  let ok = true, msg = 'Ton adresse e-mail est confirm\u00e9e. Toutes les fonctions de CycleRush sont d\u00e9bloqu\u00e9es.';
  try { await api('POST', '/auth/verify', { token: qs.get('jeton') }); await loadMe(); } catch (e) { ok = false; msg = e.message; }
  return { title: 'Confirmation de l\u2019e-mail', html: html`<div class="wrap"><section class="auth card"><h1>${ok ? 'Adresse confirm\u00e9e' : 'Lien invalide'}</h1>
    <div class="alert ${ok ? 'ok' : 'bad'}">${msg}</div><a class="btn primary" href="${state.user ? '/tableau-de-bord' : '/connexion'}">${state.user ? 'Aller \u00e0 mon tableau de bord' : 'Me connecter'}</a></section></div>` };
});

/* ---------- Tableau de bord ---------- */
function weekChart(weeks) {
  const W = 640, H = 220, pl = 40, pr = 8, pt = 16, pb = 30;
  const vals = weeks.map(w => w.distance_m / 1000);
  const max = Math.max(10, ...vals);
  const step = max > 400 ? 100 : max > 200 ? 50 : max > 80 ? 20 : max > 40 ? 10 : 5;
  const top = Math.ceil(max / step) * step;
  const bw = (W - pl - pr) / weeks.length;
  const y = v => H - pb - (v / top) * (H - pt - pb);
  let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Distance parcourue par semaine sur les 12 derni\u00e8res semaines"><defs><linearGradient id="gb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#22d3ee"/><stop offset="1" stop-color="#2dd4bf" stop-opacity=".55"/></linearGradient></defs>`;
  for (let v = 0; v <= top; v += step) s += `<line x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}" stroke="#1d3152"/><text x="${pl - 6}" y="${y(v) + 4}" text-anchor="end" font-size="11" fill="#93a9c2">${v}</text>`;
  weeks.forEach((w, i) => {
    const v = vals[i], x = pl + i * bw + bw * 0.18, h = y(0) - y(v);
    s += `<rect x="${x}" y="${y(v)}" width="${bw * 0.64}" height="${Math.max(h, v > 0 ? 2 : 0)}" rx="4" fill="url(#gb)" opacity="${i === weeks.length - 1 ? 1 : 0.75}"><title>Semaine du ${dateShort(w.week)} : ${nf(v, 1)} km</title></rect>`;
    if (i % 2 === weeks.length % 2 || i === weeks.length - 1) s += `<text x="${x + bw * 0.32}" y="${H - 10}" text-anchor="middle" font-size="11" fill="#93a9c2">${dateShort(w.week)}</text>`;
  });
  const last = vals[vals.length - 1];
  if (last > 0) s += `<text x="${pl + (weeks.length - 1) * bw + bw / 2}" y="${y(last) - 6}" text-anchor="middle" font-size="12" font-weight="600" fill="#eaf4fb">${nf(last, 1)}</text>`;
  return raw(s + `<text x="${pl}" y="11" font-size="11" fill="#93a9c2">km</text></svg>`);
}

function activityRow(a, { del = false } = {}) {
  return html`<div class="act"><span class="ic">${raw(a.source === 'home-trainer' ? I.trainer : I.bike)}</span>
    <div class="act-b"><b>${a.title}</b><span class="num">${date(a.started_at)} \u00b7 ${km(a.distance_m)} \u00b7 ${dur(a.duration_s)}${a.elevation_m ? ` \u00b7 ${nf(a.elevation_m)} m D+` : ''}${a.avg_power ? ` \u00b7 ${a.avg_power} W` : ''}${a.hidden ? ' \u00b7 masqu\u00e9e par la mod\u00e9ration' : ''}</span></div>
    ${del ? html`<button class="btn sm ghost" data-del-act="${a.id}" aria-label="Supprimer l\u2019activit\u00e9 ${a.title}">Supprimer</button>` : ''}</div>`;
}

function feedItem(it) {
  const who = html`<a href="/u/${encodeURIComponent(it.user.username)}" style="color:var(--fg);font-weight:600;text-decoration:none">${it.mine ? 'Tu' : it.user.username}</a>`;
  let text;
  if (it.kind === 'activity' && it.activity) text = html`${who} ${it.mine ? 'as roul\u00e9' : 'a roul\u00e9'} : <b>${it.activity.title}</b><br><span class="muted num" style="font-size:14px">${km(it.activity.distanceM)} \u00b7 ${dur(it.activity.durationS)}${it.activity.elevationM ? ` \u00b7 ${nf(it.activity.elevationM)} m D+` : ''}${it.activity.avgPower ? ` \u00b7 ${it.activity.avgPower} W` : ''}</span>`;
  else if (it.kind === 'challenge_completed') text = html`${who} ${it.mine ? 'as termin\u00e9' : 'a termin\u00e9'} le d\u00e9fi <b>${it.data.title}</b> \ud83c\udfc1`;
  else if (it.kind === 'goal_reached') text = html`${who} ${it.mine ? 'as atteint ton' : 'a atteint son'} objectif : ${nf(it.data.target)} ${it.data.unit} ${it.data.period === 'week' ? 'cette semaine' : 'ce mois-ci'}`;
  else text = html`${who}`;
  return html`<div class="feed-item">${avatar(it.user)}<div class="body"><p>${text}</p>
    <p style="display:flex;gap:10px;align-items:center;margin-top:6px"><time class="muted" style="font-size:13px" datetime="${it.at}">${ago(it.at)}</time>
    ${it.activity ? html`<button class="kudo" data-kudo="${it.activity.id}" aria-pressed="${it.activity.reacted}" aria-label="Encourager">${raw(I.heart)}<span>${it.activity.reactions}</span></button>` : ''}</p></div></div>`;
}
function bindKudos(root) {
  root.addEventListener('click', async e => {
    const b = e.target.closest('[data-kudo]'); if (!b) return;
    b.disabled = true;
    try { const r = await api('POST', `/activities/${b.dataset.kudo}/react`); b.setAttribute('aria-pressed', r.reacted); b.querySelector('span').textContent = r.reactions; }
    catch (err) { toast(err.message, 'bad'); }
    b.disabled = false;
  });
}

route('/tableau-de-bord', async () => {
  const d = await api('GET', '/dashboard');
  const u = state.user;
  const t = d.totals, w = d.week;
  return {
    title: 'Tableau de bord',
    html: html`<div class="wrap page">
      <div class="page-h"><div><h1>Salut ${u.username} !</h1><p>Toutes ces statistiques sont calcul\u00e9es \u00e0 partir de tes activit\u00e9s enregistr\u00e9es.</p></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn" href="home-trainer.html" data-external>${raw(I.trainer.replace('<svg', '<svg width="18" height="18"'))} Home trainer</a><a class="btn primary" href="/parcours">Rouler un parcours</a></div></div>
      ${!u.emailVerified ? html`<div class="alert info" style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between"><span>Confirme ton adresse e-mail pour ajouter des amis, cr\u00e9er des invitations et signaler des contenus.</span><button class="btn sm" id="resend">Renvoyer l\u2019e-mail</button></div>` : ''}
      ${state.announcement ? html`<div class="alert info">${state.announcement}</div>` : ''}
      ${levelCard(u.rewards)}
      <div class="grid g4">
        <div class="card stat"><span>Distance totale</span><b>${km(t.distance_m)}</b><small>${km(w.distance_m)} cette semaine</small></div>
        <div class="card stat"><span>Temps d\u2019activit\u00e9</span><b>${dur(t.duration_s)}</b><small>${dur(w.duration_s)} cette semaine</small></div>
        <div class="card stat"><span>D\u00e9nivel\u00e9 cumul\u00e9</span><b>${nf(t.elevation_m)} m</b><small>${nf(w.elevation_m)} m cette semaine</small></div>
        <div class="card stat"><span>Sorties</span><b>${nf(t.rides)}</b><small>${nf(d.month.rides)} ce mois-ci</small></div>
      </div>
      <div class="grid split">
        <section class="card"><h2>Distance par semaine</h2>${t.rides ? weekChart(d.weeks) : html`<div class="empty">Ton graphique appara\u00eetra d\u00e8s ta premi\u00e8re activit\u00e9. Lance une s\u00e9ance sur le <a href="home-trainer.html" data-external>home trainer</a> ou roule un <a href="/parcours">parcours 3D</a>.</div>`}</section>
        <section class="card"><div class="card-h"><h2>Mes objectifs</h2></div>
          <div id="goals">${goalsBlock(d.goals)}</div>
          <form id="gf" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px">
            <label class="sr" for="g-m">Mesure</label><select class="input" id="g-m" name="metric">${Object.entries(METRIC_NAME).map(([k, v]) => html`<option value="${k}">${v}</option>`)}</select>
            <label class="sr" for="g-p">P\u00e9riode</label><select class="input" id="g-p" name="period"><option value="week">Par semaine</option><option value="month">Par mois</option></select>
            <label class="sr" for="g-t">Objectif</label><input class="input" id="g-t" name="target" type="number" min="1" placeholder="Objectif" required>
            <button class="btn" type="submit">Fixer</button>
          </form></section>
      </div>
      <div class="grid g2">
        <section class="card"><div class="card-h"><h2>Activit\u00e9s r\u00e9centes</h2></div><div id="recent">${d.recent.length ? d.recent.map(a => activityRow(a, { del: true })) : html`<div class="empty">Aucune activit\u00e9 pour l\u2019instant.</div>`}</div></section>
        <section class="card"><div class="card-h"><h2>Mes d\u00e9fis</h2><a href="/defis" style="font-size:14px">Tous les d\u00e9fis</a></div>
          ${d.challenges.length ? html`<div style="display:flex;flex-direction:column;gap:12px">${d.challenges.map(c => challengeCard({ ...c, status: new Date(c.endsAt) < new Date() ? 'ended' : 'active' }, true))}</div>` : html`<div class="empty">Tu ne participes \u00e0 aucun d\u00e9fi. <a href="/defis">Choisis-en un</a>.</div>`}</section>
      </div>
      <section class="card"><div class="card-h"><h2>Activit\u00e9 de mes amis</h2><a href="/amis" style="font-size:14px">G\u00e9rer mes amis</a></div><div id="feed"><div class="loading"><div class="spin"></div></div></div><div id="feedMore"></div></section>
    </div>`,
    mount: m => {
      $('#resend', m)?.addEventListener('click', async e => { e.target.disabled = true; try { await api('POST', '/auth/resend-verification'); toast('E-mail de confirmation envoy\u00e9.'); } catch (err) { toast(err.message, 'bad'); e.target.disabled = false; } });
      $('#recent', m).addEventListener('click', async e => {
        const b = e.target.closest('[data-del-act]'); if (!b) return;
        if (!(await confirmBox({ title: 'Supprimer cette activit\u00e9 ?', text: 'Elle dispara\u00eetra de tes statistiques, de ton profil et du fil de tes amis.', confirm: 'Supprimer', danger: true }))) return;
        try { await api('DELETE', '/activities/' + b.dataset.delAct); toast('Activit\u00e9 supprim\u00e9e.'); render(); } catch (err) { toast(err.message, 'bad'); }
      });
      bindForm($('#gf', m), async f => { const r = await api('PUT', '/goals', { metric: f.metric, period: f.period, target: Number(f.target) }); $('#goals', m).innerHTML = out(goalsBlock(r.items)); $('#gf', m).reset(); toast('Objectif enregistr\u00e9.'); });
      $('#goals', m).addEventListener('click', async e => { const b = e.target.closest('[data-del-goal]'); if (!b) return; await api('DELETE', '/goals/' + b.dataset.delGoal).catch(err => toast(err.message, 'bad')); b.closest('.goal').remove(); });
      loadFeed(m, 1);
      bindKudos($('#feed', m));
    },
  };
});

function goalsBlock(goals) {
  if (!goals.length) return html`<div class="empty" style="padding:14px">Aucun objectif. Fixe-en un ci-dessous.</div>`;
  return html`<div style="display:flex;flex-direction:column;gap:14px">${goals.map(g => { const pct = Math.min(100, (g.progress / g.target) * 100); return html`<div class="goal">
    <div style="display:flex;justify-content:space-between;gap:8px;font-size:14px;margin-bottom:6px"><span>${METRIC_NAME[g.metric]} ${g.period === 'week' ? 'cette semaine' : 'ce mois-ci'}</span>
    <span class="num">${pct >= 100 ? html`<span class="pill ok">Atteint</span> ` : ''}${nf(g.progress, 1)} / ${nf(g.target)} ${g.unit} <button class="btn sm ghost" style="padding:2px 8px" data-del-goal="${g.id}" aria-label="Supprimer l\u2019objectif">\u00d7</button></span></div>
    <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${g.target}" aria-valuenow="${g.progress}"><i style="width:${pct}%"></i></div></div>`; })}</div>`;
}

async function loadFeed(m, p) {
  try {
    const r = await api('GET', '/feed?page=' + p);
    const box = $('#feed', m);
    if (!box) return; // la page a \u00e9t\u00e9 quitt\u00e9e pendant le chargement
    const items = out(r.items.map(feedItem));
    if (p === 1) box.innerHTML = items || out(html`<div class="empty">Rien pour l\u2019instant. <a href="/amis">Ajoute des amis</a> pour suivre leurs sorties ici.</div>`);
    else box.insertAdjacentHTML('beforeend', items);
    $('#feedMore', m).innerHTML = r.more ? '<button class="btn sm" style="margin-top:12px">Voir plus</button>' : '';
    const more = $('#feedMore button', m); if (more) more.onclick = () => loadFeed(m, p + 1);
  } catch (e) { const box = $('#feed', m); if (box) box.innerHTML = out(html`<div class="alert bad">${e.message}</div>`); }
}

/* ---------- Pi\u00e8ces, XP et boutique ---------- */
function rewardText(prefix, r) {
  if (!r || (!r.xp && !r.coins)) return prefix + (r?.capped ? ' (plafond de gains du jour atteint).' : '.');
  return `${prefix} : +${nf(r.xp)} XP${r.bonusXp ? ` (dont ${nf(r.bonusXp)} de bonus d\u2019arriv\u00e9e)` : ''} et +${nf(r.coins)} pi\u00e8ces${r.capped ? ' (plafond du jour atteint)' : ''}${r.levelUp ? `. Niveau ${r.levelUp} atteint !` : '.'}`;
}
function levelCard(rw, { link = true } = {}) {
  const pct = Math.min(100, (rw.intoLevel / rw.levelSpan) * 100);
  return html`<section class="card lvl">
    <div class="lvl-badge" aria-hidden="true"><span>Niv.</span><b>${rw.level}</b></div>
    <div class="lvl-main"><div class="lvl-top"><b>Niveau ${rw.level}</b><span class="muted num">${nf(rw.intoLevel)} / ${nf(rw.levelSpan)} XP vers le niveau ${rw.level + 1}</span></div>
      <div class="bar" role="progressbar" aria-label="Progression vers le niveau suivant" aria-valuemin="0" aria-valuemax="${rw.levelSpan}" aria-valuenow="${rw.intoLevel}"><i style="width:${pct}%"></i></div>
      ${rw.nextMilestone ? html`<div class="lvl-ms muted"><span>Palier ${rw.nextMilestone.level} (v\u00e9lo ou pi\u00e8ces) : encore <b class="num">${nf(rw.nextMilestone.remaining)} XP</b></span>
        <div class="bar thin" role="progressbar" aria-label="Progression vers le palier ${rw.nextMilestone.level}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${rw.nextMilestone.pct}"><i style="width:${rw.nextMilestone.pct}%"></i></div></div>` : ''}
      <div class="lvl-foot"><span class="muted">${nf(rw.xp)} XP au total</span>${coin(rw.coins, 'big')}${link ? html`<a class="btn sm" href="/boutique">${raw(I.shop.replace('<svg', '<svg width="16" height="16"'))} Boutique</a>` : ''}</div></div>
  </section>`;
}
const KIND = { activity: 'Sortie', reversal: 'Retrait', challenge: 'D\u00e9fi', goal: 'Objectif', admin: '\u00c9quipe', purchase: 'Achat', milestone: 'Palier', race: 'Course', migration: 'Niveaux' };
const histRow = h => html`<div class="act"><span class="ic">${raw(h.kind === 'purchase' ? I.shop : h.kind === 'challenge' || h.kind === 'milestone' ? I.flag : h.kind === 'goal' ? I.target : I.bike)}</span>
  <div class="act-b"><b>${h.label || KIND[h.kind]}</b><span>${KIND[h.kind]} \u00b7 ${ago(h.created_at)}</span></div>
  <span class="gain num ${h.xp < 0 || h.coins < 0 ? 'neg' : ''}">${h.xp ? `${h.xp > 0 ? '+' : ''}${nf(h.xp)} XP` : ''}${h.xp && h.coins ? ' \u00b7 ' : ''}${h.coins ? `${h.coins > 0 ? '+' : ''}${nf(h.coins)} pi\u00e8ces` : ''}</span></div>`;

/* ---------- Paliers de niveau : une r\u00e9compense au choix (v\u00e9lo ou pi\u00e8ces) tous les 10 niveaux ---------- */
const msRow = x => html`<div class="ms ${x.claimed ? 'done' : x.reached ? 'ready' : ''}"><b class="ms-lv">Niv. ${x.level}</b>
  <span class="ms-txt">${x.claimed ? (x.claimed.choice === 'bike' ? html`V\u00e9lo choisi : <b>${x.claimed.item ? x.claimed.item.name : '\u2014'}</b>` : html`Pi\u00e8ces choisies : <b>${nf(x.claimed.coins)}</b>`)
    : html`${x.offer.bike ? html`V\u00e9lo <b>${x.offer.bike.name}</b> ou ` : ''}<b>${nf(x.offer.coins)} pi\u00e8ces</b>`}</span>
  ${x.claimed ? html`<span class="pill ok">R\u00e9clam\u00e9</span>` : x.disabled ? html`<span class="pill">Indisponible pour le moment</span>` : x.reached ? html`<button class="btn sm primary" data-claim="${x.level}">Choisir</button>` : html`<span class="pill">\u00c0 venir</span>`}</div>`;
// paliers report\u00e9s (\u00ab Plus tard \u00bb) pour la session de l'onglet ; la fen\u00eatre revient \u00e0 la prochaine visite, la boutique permet de r\u00e9clamer \u00e0 tout moment
const msSnoozed = (() => { let v = []; try { v = JSON.parse(sessionStorage.getItem('vv_ms_snooze') || '[]'); } catch {} const set = new Set(v);
  const add = set.add.bind(set); set.add = l => { add(l); try { sessionStorage.setItem('vv_ms_snooze', JSON.stringify([...set])); } catch {} return set; }; return set; })();
let msOpen = false;
async function milestoneModal(level, { force = false } = {}) {
  if (msOpen || (!force && msSnoozed.has(level))) return;
  msOpen = true;
  let data;
  try { data = await api('GET', '/rewards/milestones'); } catch (e) { msOpen = false; return; }
  const x = data.items.find(i => i.level === level);
  if (!x || !x.reached || x.claimed || x.disabled) { msOpen = false; if (x && x.disabled) msSnoozed.add(level); else await loadMe(); return; }
  const b = x.offer.bike, pending = data.items.filter(i => i.reached && !i.claimed).length;
  modal(html`<div class="ms-modal"><span class="tag">Palier atteint \u00b7 niveau ${level}</span>
      <h2 style="margin:6px 0 4px">Choisis ta r\u00e9compense</h2>
      <p class="muted" style="margin:0 0 14px">Une seule des deux, et pour de bon.${pending > 1 ? html` Il te reste ${pending} paliers \u00e0 r\u00e9clamer.` : ''}</p>
      <div class="ms-choices">
        <section class="ms-opt">${b ? html`<div class="ms-bike">${b.image ? html`<img src="${b.image}" alt="V\u00e9lo ${b.name}">` : html`<canvas id="msBike" aria-label="V\u00e9lo ${b.name} en 3D"></canvas>`}</div>
            <h3>V\u00e9lo ${b.name}</h3><p class="muted">${b.desc}</p><button class="btn primary" data-pick="bike">Choisir le v\u00e9lo</button>`
          : html`<h3>V\u00e9lo</h3><p class="muted">Tu poss\u00e8des d\u00e9j\u00e0 tous les v\u00e9los.</p><button class="btn" disabled>Indisponible</button>`}</section>
        <section class="ms-opt"><div class="ms-coins">${coin(x.offer.coins)}</div><h3>${nf(x.offer.coins)} pi\u00e8ces</h3><p class="muted">Ajout\u00e9es tout de suite \u00e0 ton solde, pour la boutique.</p><button class="btn primary" data-pick="coins">Prendre les pi\u00e8ces</button></section>
      </div>
      <div class="modal-acts"><button type="button" class="btn ghost" data-close>Plus tard</button></div></div>`, (box, close) => {
    if (b && !b.image) loadWorld().then(() => { const c = $('#msBike', box); if (c) show3d(c, { bike: { model: b.model, ...(VVRider.CATALOG.presets[b.model] || {}) } }, { noRider: true }); });
    const obs = new MutationObserver(() => { if (!box.isConnected) { obs.disconnect(); msOpen = false; if (!box.dataset.done) msSnoozed.add(level); } }); obs.observe(document.body, { childList: true });
    box.addEventListener('click', async e => {
      const p = e.target.closest('[data-pick]'); if (!p) return;
      box.querySelectorAll('[data-pick]').forEach(q => q.disabled = true);
      try {
        const res = await api('POST', `/rewards/milestones/${level}/claim`, { choice: p.dataset.pick, bikeId: b ? b.id : undefined, coins: x.offer.coins });
        box.dataset.done = '1'; close();
        toast(res.choice === 'bike' ? `V\u00e9lo ${res.bike.name} ajout\u00e9 \u00e0 ta collection : choisis-le dans le garage.` : `+${nf(res.coins)} pi\u00e8ces ajout\u00e9es \u00e0 ton solde.`);
        await loadMe(); renderNav(); if (VL.pathname === '/boutique' || VL.pathname === '/garage') render(); else checkMilestones();
      } catch (err) { toast(err.message, 'bad'); box.querySelectorAll('[data-pick]').forEach(q => q.disabled = false); }
    });
  });
}
// Apr\u00e8s chaque page : si un palier est atteint et pas encore r\u00e9clam\u00e9, la fen\u00eatre s'ouvre (le plus bas d'abord).
function checkMilestones() {
  const p = state.user?.rewards?.milestones?.pending || [];
  const next = p.find(l => !msSnoozed.has(l));
  if (next) setTimeout(() => milestoneModal(next), 400);
}

route('/boutique', async () => {
  const [r, ms] = await Promise.all([api('GET', '/rewards'), api('GET', '/rewards/milestones')]);
  const A = r.rules.activity;
  const item = i => html`<article class="card item ${i.equipped ? 'on' : ''} ${i.locked ? 'locked' : ''}">
    <div class="item-prev ${i.kind === 'bike' || i.kind === 'wheels' ? 'bike' : ''}">${i.kind === 'frame' ? avatar({ ...me(), frame: i.id }, 'lg') : i.kind === 'bike' || i.kind === 'wheels' ? (i.image ? html`<img src="${i.image}" alt="${i.name}" loading="lazy">` : html`<canvas class="bike3d" data-bike3d="${i.model}" aria-label="V\u00e9lo ${i.name} en 3D"></canvas>`) : html`<span class="ptitle big">${i.name}</span>`}</div>
    <h3>${i.name}</h3><p class="muted">${i.desc}</p>
    <div class="item-foot">${i.owned ? html`<span class="pill ok">Poss\u00e9d\u00e9</span>` : i.exclusive ? html`<span class="pill">R\u00e9compense du niveau ${i.minLevel}</span>` : i.available === false ? html`<span class="pill">Pas en vente pour le moment</span>` : html`${coin(i.price)}${i.locked ? html`<span class="pill">Niveau ${i.minLevel}</span>` : ''}`}
      ${(i.exclusive || i.available === false) && !i.owned ? '' : i.owned ? (i.equipped ? html`<button class="btn sm ghost" data-unequip="${i.kind}">Retirer</button>` : html`<button class="btn sm primary" data-equip="${i.id}">Utiliser</button>`)
        : html`<button class="btn sm primary" data-buy="${i.id}" ${raw(i.locked || r.coins < i.price ? 'disabled' : '')}>Acheter</button>`}</div></article>`;
  return {
    title: 'Boutique',
    html: html`<div class="wrap page">
      <div class="page-h"><div><h1>Boutique et progression</h1><p>Gagne de l\u2019XP et des pi\u00e8ces en roulant, puis personnalise ton profil.</p></div></div>
      ${levelCard(r, { link: false })}
      <section><div class="sec-h" style="margin-bottom:14px"><div><h2 style="font-size:24px">Paliers de niveau</h2><p>Tous les 10 niveaux, choisis un v\u00e9lo ou des pi\u00e8ces. Un seul choix par palier.</p></div></div><div class="ms-list" id="msList">${(ms.items || []).map(msRow)}</div></section>
      <section><div class="sec-h" style="margin-bottom:14px"><div><h2 style="font-size:24px">V\u00e9los</h2><p>Choisis le v\u00e9lo affich\u00e9 sur ton profil.</p></div></div><div class="grid g2 bikes">${r.items.filter(i => i.kind === 'bike').map(item)}</div></section>
      <section><div class="sec-h" style="margin-bottom:14px"><div><h2 style="font-size:24px">Roues carbone</h2><p>Se montent sur tous les v\u00e9los, depuis la boutique ou le garage.</p></div></div><div class="grid g2 bikes">${r.items.filter(i => i.kind === 'wheels').map(item)}</div></section>
      <section><div class="sec-h" style="margin-bottom:14px"><div><h2 style="font-size:24px">Cadres de photo</h2></div></div><div class="grid g4">${r.items.filter(i => i.kind === 'frame').map(item)}</div></section>
      <section><div class="sec-h" style="margin-bottom:14px"><div><h2 style="font-size:24px">Titres de profil</h2></div></div><div class="grid g4">${r.items.filter(i => i.kind === 'title').map(item)}</div></section>
      <div class="grid g2">
        <section class="card"><h2>Comment gagner</h2><ul class="rules">
          <li><b>Chaque sortie valid\u00e9e</b> : ${A.xpPerKm} XP par km, ${A.xpPer100mDplus} XP par 100 m de d\u00e9nivel\u00e9, ${A.xpPerMinute} XP par minute \u00b7 ${nf(A.coinsPerRefKm.coins)} pi\u00e8ces pour ${A.coinsPerRefKm.km} km, proportionnellement \u00e0 la distance parcourue. Jusqu\u2019\u00e0 ${nf(A.maxXp)} XP et ${nf(A.maxCoins)} pi\u00e8ces par sortie.</li>
          <li><b>Parcours termin\u00e9</b> : bonus d\u2019arriv\u00e9e selon sa longueur, son d\u00e9nivel\u00e9 et sa pente, une fois par jour et par parcours${r.rules.routeXp ? html` : ${r.rules.routeXp.map((x, k) => html`${k ? ' \u00b7 ' : ''}${x.name} +${nf(x.xp)}`)}` : ''}.</li>
          <li><b>Niveaux</b> : ${nf(r.rules.levels.base)} XP pour le niveau 2, puis ${nf(r.rules.levels.step)} XP de plus \u00e0 chaque niveau${(() => { const t = r.rules.levels.table.filter(x => x.level % 10 === 0 && x.level <= 50); return html` (niveau ${t.map((x, k) => html`${k ? ' \u00b7 ' : ''}${x.level} : ${nf(x.xp)} XP`)})`; })()}. Une heure de selle rapporte environ 550 \u00e0 600 XP.</li>
          <li><b>Chaque niveau gagn\u00e9</b> : +50 pi\u00e8ces (une seule fois par niveau).</li>
          <li><b>Paliers de niveau</b> (10, 20 \u2026 100) : choisis un v\u00e9lo ou des pi\u00e8ces${(() => { const c = (ms.items || []).filter(x => x.offer).map(x => x.offer.coins); return c.length ? ` (de ${nf(Math.min(...c))} \u00e0 ${nf(Math.max(...c))})` : ''; })()}.</li>
          <li><b>D\u00e9fi r\u00e9ussi</b> : +${r.rules.challenge.xp} XP et +${r.rules.challenge.coins} pi\u00e8ces.</li>
          <li><b>Objectif atteint</b> : +${r.rules.goal.xp} XP et +${r.rules.goal.coins} pi\u00e8ces.</li>
          <li><b>Plafond</b> : ${nf(r.rules.dailyCap.xp)} XP et ${nf(r.rules.dailyCap.coins)} pi\u00e8ces par jour pour les sorties.</li>
          <li>Une sortie supprim\u00e9e ou masqu\u00e9e par la mod\u00e9ration perd ce qu\u2019elle avait rapport\u00e9.</li></ul></section>
        <section class="card"><h2>Historique</h2><div id="hist">${r.history.length ? r.history.map(histRow) : html`<div class="empty">Rien pour l\u2019instant. Ta premi\u00e8re sortie te rapportera de l\u2019XP et des pi\u00e8ces.</div>`}</div><div id="histMore">${r.more ? html`<button class="btn sm" style="margin-top:10px">Voir plus</button>` : ''}</div></section>
      </div></div>`,
    mount: m => {
      $('#msList', m).addEventListener('click', e => { const b = e.target.closest('[data-claim]'); if (b) milestoneModal(Number(b.dataset.claim), { force: true }); });
      $('.page', m).addEventListener('click', async e => {
        const b = e.target.closest('[data-buy],[data-equip],[data-unequip]'); if (!b) return;
        b.disabled = true;
        try {
          if (b.dataset.buy) { const it = r.items.find(i => i.id === b.dataset.buy); if (!(await confirmBox({ title: `Acheter \u00ab ${it.name} \u00bb ?`, text: `${it.price} pi\u00e8ces seront d\u00e9bit\u00e9es de ton solde (${nf(r.coins)} pi\u00e8ces).`, confirm: 'Acheter' }))) { b.disabled = false; return; } await api('POST', `/shop/${b.dataset.buy}/buy`, { price: it.price }); toast('Achat r\u00e9ussi ! Clique sur \u00ab Utiliser \u00bb pour l\u2019afficher.'); }
          else if (b.dataset.equip) { await api('POST', `/shop/${b.dataset.equip}/equip`); toast(b.dataset.equip.startsWith('bike-') ? 'C\u2019est ton v\u00e9lo dans le garage et sur ton profil.' : b.dataset.equip.startsWith('wheel-') ? 'Roues mont\u00e9es sur ton v\u00e9lo.' : 'C\u2019est affich\u00e9 sur ton profil.'); }
          else { await api('POST', '/shop/unequip', { kind: b.dataset.unequip }); toast('Retir\u00e9 de ton profil.'); }
          await loadMe(); render();
        } catch (err) { toast(err.message, 'bad'); b.disabled = false; }
      });
      // aper\u00e7u 3D des v\u00e9los qui n'ont pas de photo
      const SHOP3D = { grimpeur: { frameColor: '#ffffff', accentColor: '#22d3ee', wheels: 'bas', tapeColor: '#ffffff' }, gravel: { frameColor: '#f97316', accentColor: '#111827', wheels: 'bas', tyres: 'beige' }, clm: { frameColor: '#facc15', accentColor: '#111827', wheels: 'disque' } };
      loadWorld().then(() => $$('[data-bike3d]', m).forEach(c => show3d(c, { bike: { model: c.dataset.bike3d, ...(SHOP3D[c.dataset.bike3d] || VVRider.CATALOG.presets[c.dataset.bike3d] || {}) } }, { noRider: true })));
      let pg = 1;
      const more = () => { const btn = $('#histMore button', m); if (btn) btn.onclick = async () => { pg++; const x = await api('GET', '/rewards?page=' + pg); $('#hist', m).insertAdjacentHTML('beforeend', out(x.history.map(histRow))); $('#histMore', m).innerHTML = x.more ? '<button class="btn sm" style="margin-top:10px">Voir plus</button>' : ''; more(); }; };
      more();
    },
  };
}, { auth: true });

/* ---------- D\u00e9fis ---------- */
route('/defis', async () => {
  const r = await api('GET', '/challenges');
  return {
    title: 'D\u00e9fis',
    html: html`<div class="wrap page"><div class="page-h"><div><h1>D\u00e9fis</h1><p>Rejoins un d\u00e9fi : chaque activit\u00e9 enregistr\u00e9e pendant ses dates compte dans ta progression.</p></div></div>
      ${r.items.length ? html`<div class="grid g3" id="chList">${r.items.map(c => challengeCard(c))}</div>` : html`<div class="empty">Aucun d\u00e9fi pour le moment. L\u2019\u00e9quipe CycleRush en publiera bient\u00f4t.</div>`}</div>`,
    mount: m => { const l = $('#chList', m); if (l) bindChallenges(l, render); },
  };
});

/* ---------- Amis ---------- */
const REL = { friends: ['Amis', 'ok'], outgoing: ['Demande envoy\u00e9e', 'warn'], incoming: ['Demande re\u00e7ue', 'cyan'], none: ['Aucune relation', ''], self: ['Toi', ''] };
function relActions(username, rel) {
  const u = encodeURIComponent(username);
  if (rel === 'none') return html`<button class="btn sm primary" data-rel="request" data-u="${username}">Ajouter</button>`;
  if (rel === 'outgoing') return html`<button class="btn sm ghost" data-rel="cancel" data-u="${u}">Annuler la demande</button>`;
  if (rel === 'incoming') return html`<button class="btn sm primary" data-rel="accept" data-u="${u}">Accepter</button><button class="btn sm ghost" data-rel="decline" data-u="${u}">Refuser</button>`;
  if (rel === 'friends') return html`<button class="btn sm ghost" data-rel="remove" data-u="${u}" data-name="${username}">Retirer</button>`;
  return '';
}
function bindRel(root, after) {
  root.addEventListener('click', async e => {
    const b = e.target.closest('[data-rel]'); if (!b) return;
    const a = b.dataset.rel;
    if (a === 'remove' && !(await confirmBox({ title: `Retirer ${b.dataset.name} de tes amis ?`, text: 'Vous ne verrez plus les activit\u00e9s r\u00e9serv\u00e9es aux amis l\u2019un de l\u2019autre. Tu pourras renvoyer une demande plus tard.', confirm: 'Retirer', danger: true }))) return;
    b.disabled = true;
    try {
      if (a === 'request') await api('POST', '/friends', { username: b.dataset.u });
      else if (a === 'remove') await api('DELETE', `/friends/${b.dataset.u}`);
      else await api('POST', `/friends/${b.dataset.u}/${a}`);
      toast({ request: 'Demande envoy\u00e9e.', cancel: 'Demande annul\u00e9e.', accept: 'Vous \u00eates maintenant amis !', decline: 'Demande refus\u00e9e.', remove: 'Ami retir\u00e9.' }[a]);
      after();
    } catch (err) { toast(err.message, 'bad'); b.disabled = false; }
  });
}
const personRow = (p, rel, extra = '') => html`<div class="person">${avatar(p)}<div><a class="name" href="/u/${encodeURIComponent(p.username)}">${p.username}</a>${extra ? html`<div class="muted" style="font-size:13px">${extra}</div>` : ''}</div>
  <div class="acts"><span class="pill ${REL[rel][1]}">${REL[rel][0]}</span>${relActions(p.username, rel)}</div></div>`;

route('/amis', async (p, qs) => {
  const f = await api('GET', '/friends');
  const tab = qs.get('onglet') || (f.incoming.length ? 'recues' : 'amis');
  const lists = { amis: [f.friends, 'friends', 'Tu n\u2019as pas encore d\u2019amis sur CycleRush. Cherche un cycliste ci-dessus ou partage ton lien d\u2019invitation.'], recues: [f.incoming, 'incoming', 'Aucune demande re\u00e7ue.'], envoyees: [f.outgoing, 'outgoing', 'Aucune demande en attente.'] };
  const [list, rel, empty] = lists[tab] || lists.amis;
  return {
    title: 'Amis',
    html: html`<div class="wrap page">
      <div class="page-h"><div><h1>Amis</h1><p>Retrouve tes amis, g\u00e8re tes demandes et invite d\u2019autres cyclistes.</p></div></div>
      <div class="grid split">
        <div style="display:flex;flex-direction:column;gap:16px;min-width:0">
          <section class="card"><h2>Rechercher un cycliste</h2>
            <form id="sf" role="search" style="display:flex;gap:8px"><label class="sr" for="sq">Nom d\u2019utilisateur</label><input class="input" id="sq" name="q" placeholder="Nom d\u2019utilisateur" minlength="2" maxlength="30" autocomplete="off"><button class="btn" type="submit">Chercher</button></form>
            <div id="results" style="margin-top:8px"></div></section>
          <section class="card">
            <div class="tabs" role="tablist" aria-label="Listes">
              ${[['amis', `Amis (${f.friends.length})`], ['recues', `Demandes re\u00e7ues (${f.incoming.length})`], ['envoyees', `Demandes envoy\u00e9es (${f.outgoing.length})`]].map(([k, l]) => html`<button role="tab" aria-selected="${k === tab}" data-tab="${k}">${l}</button>`)}
            </div>
            <div id="list" style="margin-top:12px">${list.length ? list.map(x => personRow(x, rel, rel === 'friends' ? 'Amis depuis le ' + date(x.since) : ago(x.since))) : html`<div class="empty">${empty}</div>`}</div>
          </section>
        </div>
        <section class="card" style="align-self:start"><h2>Inviter un ami</h2>
          <p class="muted" style="margin-top:0;font-size:15px">Cr\u00e9e un lien valable 14 jours (10 utilisations). La personne qui l\u2019ouvre et rejoint CycleRush devient ton amie automatiquement. Le lien ne r\u00e9v\u00e8le que ton nom d\u2019utilisateur.</p>
          <button class="btn primary" id="inv">Cr\u00e9er un lien d\u2019invitation</button>
          <div id="invBox" hidden style="margin-top:12px"><label class="label" for="invUrl">Ton lien</label><div style="display:flex;gap:8px;margin-top:6px"><input class="input" id="invUrl" readonly><button class="btn" id="copy">Copier</button></div></div>
        </section>
      </div></div>`,
    mount: m => {
      $$('[data-tab]', m).forEach(b => (b.onclick = () => go('/amis?onglet=' + b.dataset.tab, { replace: true })));
      bindRel($('#list', m), render);
      const search = async (q, pg = 1) => {
        const box = $('#results', m);
        try {
          const r = await api('GET', `/users?q=${encodeURIComponent(q)}&page=${pg}`);
          box.innerHTML = out(r.items.length ? html`${r.items.map(x => personRow(x, x.relation))}
            ${r.pages > 1 ? html`<div style="display:flex;gap:8px;justify-content:center;margin-top:10px">${pg > 1 ? html`<button class="btn sm" data-pg="${pg - 1}">Pr\u00e9c\u00e9dent</button>` : ''}<span class="muted" style="align-self:center">Page ${pg} / ${r.pages}</span>${pg < r.pages ? html`<button class="btn sm" data-pg="${pg + 1}">Suivant</button>` : ''}</div>` : ''}`
            : html`<p class="muted">Aucun cycliste trouv\u00e9 pour \u00ab ${q} \u00bb.</p>`);
          $$('[data-pg]', box).forEach(b => (b.onclick = () => search(q, +b.dataset.pg)));
        } catch (e) { box.innerHTML = out(html`<div class="alert bad">${e.message}</div>`); }
      };
      $('#sf', m).onsubmit = e => { e.preventDefault(); const q = $('#sq', m).value.trim(); if (q.length < 2) return toast('Tape au moins 2 caract\u00e8res.', 'bad'); search(q); };
      bindRel($('#results', m), () => search($('#sq', m).value.trim()));
      $('#inv', m).onclick = async e => {
        e.target.disabled = true;
        try { const r = await api('POST', '/invites'); $('#invUrl', m).value = r.url; $('#invBox', m).hidden = false; }
        catch (err) { toast(err.message, 'bad'); }
        e.target.disabled = false;
      };
      $('#copy', m).onclick = async () => { const i = $('#invUrl', m); try { await navigator.clipboard.writeText(i.value); toast('Lien copi\u00e9.'); } catch { i.select(); toast('S\u00e9lectionn\u00e9 : copie-le avec Ctrl+C.'); } };
    },
  };
}, { auth: true });

/* ---------- Profil public ---------- */
const REASONS = { spam: 'Spam ou publicit\u00e9', harassment: 'Harc\u00e8lement ou propos offensants', inappropriate: 'Contenu inappropri\u00e9', impersonation: 'Usurpation d\u2019identit\u00e9', cheating: 'Donn\u00e9es de course truqu\u00e9es', other: 'Autre' };
function reportDialog(targetType, target, label) {
  if (!state.user) return go('/connexion?retour=' + encodeURIComponent(VL.pathname));
  modal(html`<h2>Signaler ${label}</h2><form id="rf" style="display:flex;flex-direction:column;gap:12px">
    <div class="alert bad form-err" role="alert" hidden></div>
    <div class="field"><label for="r-r">Motif</label><select class="input" id="r-r" name="reason">${Object.entries(REASONS).map(([k, v]) => html`<option value="${k}">${v}</option>`)}</select></div>
    <div class="field"><label for="r-d">D\u00e9tails (facultatif, 1 000 caract\u00e8res max)</label><textarea class="input" id="r-d" name="details" rows="3" maxlength="1000"></textarea></div>
    <p class="hint" style="margin:0">Les signalements abusifs peuvent entra\u00eener une sanction. La personne signal\u00e9e ne sait pas qui l\u2019a signal\u00e9e.</p>
    <div class="modal-acts"><button type="button" class="btn ghost" data-close>Annuler</button><button class="btn primary" type="submit">Envoyer</button></div></form>`,
  (box, close) => bindForm($('#rf', box), async f => { const r = await api('POST', '/reports', { targetType, target, reason: f.reason, details: f.details }); close(); toast(r.message); }));
}

// Lien \u00ab Retour \u00e0 l'administration \u00bb quand le profil est ouvert depuis /admin par un membre de l'\u00e9quipe.
function adminBack(qs) {
  if (qs.get('depuis') !== 'admin' || !state.user?.permissions.includes('admin.access')) return '';
  const id = /^\d+$/.test(qs.get('id') || '') ? qs.get('id') : null;
  return html`<p style="margin:0"><a class="btn sm ghost" href="${id ? 'admin.html#utilisateur/' + id : 'admin.html#utilisateurs'}" data-external>\u2190 Retour \u00e0 l\u2019administration</a></p>`;
}

/* ---------- Informations personnelles et sportives (profil, visibles par le joueur seul) ----------
   Enregistr\u00e9es sur le compte (r\u00e9glages synchronis\u00e9s, PATCH /me/prefs) : m\u00eames FTP et poids que le home trainer et le
   jeu 3D, retrouv\u00e9s sur tous les appareils. Le serveur ne les renvoie qu'\u00e0 leur propri\u00e9taire. */
const GENDER = { homme: 'Homme', femme: 'Femme', non_precise: 'Pr\u00e9f\u00e8re ne pas pr\u00e9ciser' };
const SPORT = [
  { k: 'ftp', label: 'FTP (puissance au seuil fonctionnel)', unit: 'W', hint: 'Nombre entier de watts, entre 80 et 600 (par exemple 250).', fmt: v => nf(v) + ' W' },
  { k: 'kg', label: 'Poids', unit: 'kg', hint: 'Entre 35 et 160 kg, au dixi\u00e8me pr\u00e8s (par exemple 72,5).', fmt: v => String(v).replace('.', ',') + ' kg' },
  { k: 'age', label: '\u00c2ge', unit: 'ans', hint: 'Nombre entier entre 13 et 100 ans.', fmt: v => v + ' ans' },
  { k: 'gender', label: 'Genre', hint: '', fmt: v => GENDER[v] || '' },
];
const sportVal = k => { const e = (state.user && state.user.prefs || {})[k]; return e && e.v !== null && e.v !== undefined ? e.v : null; };
function sportCard(editing) {
  const view = html`<div class="grid g4 sport-grid">${SPORT.map(f => { const v = sportVal(f.k); return html`<div class="stat"><span>${f.label}</span>${v === null ? html`<b class="unset">Non renseign\u00e9</b>` : html`<b>${f.fmt(v)}</b>`}</div>`; })}</div>`;
  const field = f => { const v = sportVal(f.k), id = 'sp-' + f.k;
    if (f.k === 'gender') return html`<div class="field"><label for="${id}">${f.label}</label><select class="input" id="${id}" name="gender"><option value="">Non renseign\u00e9</option>${Object.entries(GENDER).map(([g, l]) => html`<option value="${g}" ${raw(v === g ? 'selected' : '')}>${l}</option>`)}</select></div>`;
    return html`<div class="field"><label for="${id}">${f.label} <span class="muted">(${f.unit})</span></label><input class="input" id="${id}" name="${f.k}" inputmode="${f.k === 'kg' ? 'decimal' : 'numeric'}" autocomplete="off" value="${v === null ? '' : String(v).replace('.', ',')}" placeholder="Non renseign\u00e9" aria-describedby="${id}-h"><span class="hint" id="${id}-h">${f.hint} Laisse vide pour \u00ab Non renseign\u00e9 \u00bb.</span></div>`; };
  return html`<section class="card" id="sport"><div class="card-h"><div><h2 style="margin:0">Informations personnelles et sportives</h2><p class="muted" style="margin:4px 0 0;font-size:14px">\ud83d\udd12 Visibles uniquement par toi : jamais sur ton profil public, dans les classements ni dans les sessions multijoueur.</p></div>
      ${editing ? '' : html`<button class="btn" id="spEdit">Modifier mon profil</button>`}</div>
    ${editing ? html`<form id="spForm" novalidate style="display:flex;flex-direction:column;gap:14px;margin-top:14px"><div class="alert bad form-err" role="alert" hidden></div>
        <div class="grid g2 sport-form">${SPORT.map(field)}</div>
        <p class="hint" style="margin:0">Ton FTP et ton poids sont aussi ceux du home trainer et des parcours 3D (zones de puissance, r\u00e9sistance) : ils sont synchronis\u00e9s sur tous tes appareils.</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn primary" type="submit">Enregistrer</button><button class="btn ghost" type="button" id="spCancel">Annuler</button></div></form>`
    : html`<div style="margin-top:14px">${view}</div>`}</section>`;
}
// Lecture stricte de la saisie : une valeur invalide est signal\u00e9e, jamais arrondie ni remplac\u00e9e en silence.
function readSport(d) {
  const set = {}, unset = [], err = (field, msg) => Object.assign(new Error(msg), { field });
  const txt = k => String(d[k] ?? '').trim();
  if (txt('ftp')) { if (!/^\d+$/.test(txt('ftp'))) throw err('ftp', 'Le FTP doit \u00eatre un nombre entier de watts (sans virgule), par exemple 250.'); const n = Number(txt('ftp')); if (n < 80 || n > 600) throw err('ftp', 'Le FTP doit \u00eatre compris entre 80 et 600 W.'); set.ftp = n; } else unset.push('ftp');
  if (txt('kg')) { const t = txt('kg').replace(',', '.'); if (!/^\d+(\.\d)?$/.test(t)) throw err('kg', 'Le poids doit \u00eatre un nombre avec au plus un chiffre apr\u00e8s la virgule, par exemple 72,5.'); const n = Number(t); if (n < 35 || n > 160) throw err('kg', 'Le poids doit \u00eatre compris entre 35 et 160 kg.'); set.kg = n; } else unset.push('kg');
  if (txt('age')) { if (!/^\d+$/.test(txt('age'))) throw err('age', 'L\u2019\u00e2ge doit \u00eatre un nombre entier d\u2019ann\u00e9es, par exemple 34.'); const n = Number(txt('age')); if (n < 13 || n > 100) throw err('age', 'L\u2019\u00e2ge doit \u00eatre compris entre 13 et 100 ans.'); set.age = n; } else unset.push('age');
  if (txt('gender')) { if (!GENDER[txt('gender')]) throw err('gender', 'Choisis Homme, Femme ou Pr\u00e9f\u00e8re ne pas pr\u00e9ciser.'); set.gender = txt('gender'); } else unset.push('gender');
  return { set, unset: unset.filter(k => sportVal(k) !== null) }; // n'efface que ce qui \u00e9tait renseign\u00e9
}
function bindSport(m) {
  const box = $('#sportBox', m); if (!box) return;
  const draw = editing => { box.innerHTML = out(sportCard(editing)); wire(editing); };
  const wire = editing => {
    if (!editing) { $('#spEdit', box).onclick = () => { draw(true); $('#sp-ftp', box).focus(); }; return; }
    $('#spCancel', box).onclick = () => draw(false);
    bindForm($('#spForm', box), async d => {
      const body = readSport(d);
      if (!Object.keys(body.set).length && !body.unset.length) { draw(false); return; }
      const r = await api('PATCH', '/me/prefs', body);
      state.user.prefs = r.prefs; draw(false); toast('Informations enregistr\u00e9es sur ton compte.');
    });
  };
  wire(false);
}

route('/u/:username', async ({ username }, qs) => {
  let p;
  try { p = await api('GET', '/users/' + encodeURIComponent(username)); }
  catch (e) {
    if (e.status !== 404) throw e;
    return { title: 'Profil introuvable', html: html`<div class="wrap page">${adminBack(qs)}<section class="card" style="text-align:center;padding:40px 20px">
      <h1 style="font-size:28px">Profil introuvable</h1>
      <p class="muted" style="max-width:46ch;margin:10px auto 20px">Aucun cycliste actif ne s\u2019appelle \u00ab ${username} \u00bb. Le compte a peut-\u00eatre \u00e9t\u00e9 supprim\u00e9, suspendu, ou le lien est incorrect.</p>
      <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">${state.user ? html`<a class="btn primary" href="/amis">Chercher un cycliste</a>` : ''}<a class="btn" href="/">Retour \u00e0 l\u2019accueil</a></div></section></div>` };
  }
  const me = p.relation === 'self';
  return {
    title: p.username,
    html: html`<div class="wrap page">
      ${adminBack(qs)}
      <section class="card prof-h">${avatar(p, 'lg')}
        <div><h1>${p.username}</h1>${p.title ? html`<p class="ptitle">${p.title}</p>` : ''}${p.level ? html`<span class="pill cyan" style="margin-top:6px">Niveau ${p.level}</span> ` : ''}<p class="muted" style="margin:4px 0 0">${p.createdAt ? 'Membre depuis le ' + date(p.createdAt) : 'Profil priv\u00e9'}</p>
          ${!me && state.user ? html`<span class="pill ${REL[p.relation][1]}" style="margin-top:8px">${REL[p.relation][0]}</span>` : ''}</div>
        <div class="prof-acts" id="pacts">${me ? html`<a class="btn ghost" href="/parametres">Param\u00e8tres du compte</a>` : state.user ? html`${relActions(p.username, p.relation)}<button class="btn sm ghost" id="rep">Signaler</button>` : html`<a class="btn primary sm" href="/connexion?retour=/u/${encodeURIComponent(p.username)}">Connecte-toi pour l\u2019ajouter</a>`}</div>
      </section>
      ${me && state.user ? html`<div id="sportBox">${sportCard(false)}</div>` : ''}
      ${!p.profileVisible ? html`<div class="empty">Ce profil est priv\u00e9. Seul ${p.username} peut voir ses informations.</div>` : html`
        ${p.garage && p.rider ? html`<section class="card g3d-card"><div class="g3d-view"><canvas id="profil3d" aria-label="Le cycliste ${p.username} et son v\u00e9lo en 3D"></canvas></div><div><span class="tag">Sa tenue et son v\u00e9lo</span><h2 style="margin:4px 0 6px">${bikeName(p.garage.bike.model)}</h2><p class="muted" style="margin:0">Tel qu\u2019il roule sur les parcours CycleRush.</p>${me ? html`<a class="btn sm" href="/garage" style="margin-top:12px">Modifier dans le garage</a>` : ''}</div></section>` : ''}
        ${p.bike && p.bike.image ? html`<section class="card bike-card"><img src="${p.bike.image}" alt="V\u00e9lo ${p.bike.name}"><div><span class="tag">Son v\u00e9lo</span><h2 style="margin:4px 0 0">${p.bike.name}</h2></div></section>` : ''}
        ${p.bio ? html`<section class="card"><h2>Bio</h2><p style="margin:0;white-space:pre-line">${p.bio}</p></section>` : ''}
        ${p.activitiesVisible ? html`
          <div class="grid g4">
            <div class="card stat"><span>Distance</span><b>${km(p.totals.distance_m)}</b></div>
            <div class="card stat"><span>Temps</span><b>${dur(p.totals.duration_s)}</b></div>
            <div class="card stat"><span>D\u00e9nivel\u00e9</span><b>${nf(p.totals.elevation_m)} m</b></div>
            <div class="card stat"><span>Sorties</span><b>${nf(p.totals.rides)}</b></div>
          </div>
          <section class="card" id="pacts2"><h2>Activit\u00e9s r\u00e9centes</h2>${p.activities.length ? p.activities.map(a => html`<div class="act"><span class="ic">${raw(a.source === 'home-trainer' ? I.trainer : I.bike)}</span>
            <div class="act-b"><b>${a.title}</b><span class="num">${date(a.started_at)} \u00b7 ${km(a.distance_m)} \u00b7 ${dur(a.duration_s)}${a.elevation_m ? ` \u00b7 ${nf(a.elevation_m)} m D+` : ''}</span></div>
            ${state.user ? html`<button class="kudo" data-kudo="${a.id}" aria-pressed="${a.reacted}" aria-label="Encourager">${raw(I.heart)}<span>${a.reactions}</span></button>${!me ? html`<button class="btn sm ghost" data-rep-act="${a.id}" aria-label="Signaler l\u2019activit\u00e9 ${a.title}">Signaler</button>` : ''}` : html`<span class="muted">${raw(I.heart.replace('<svg', '<svg width="14" height="14"'))} ${a.reactions}</span>`}</div>`) : html`<div class="empty">Aucune activit\u00e9.</div>`}</section>`
        : html`<div class="empty">${p.username} partage ses activit\u00e9s ${p.relation === 'friends' ? 'avec personne' : 'uniquement avec ses amis'}.</div>`}
        <section class="card"><h2>Amis (${p.friendsCount})</h2>${p.friends.length ? html`<div style="display:flex;flex-wrap:wrap;gap:10px">${p.friends.map(f => html`<a href="/u/${encodeURIComponent(f.username)}" style="display:flex;align-items:center;gap:8px;color:var(--fg);text-decoration:none;padding:6px 12px 6px 6px;border:1px solid var(--line);border-radius:999px">${avatar(f, 'sm')}${f.username}</a>`)}</div>` : html`<p class="muted" style="margin:0">Pas encore d\u2019amis.</p>`}</section>`}
    </div>`,
    mount: m => {
      bindRel($('#pacts', m), render);
      if (me) bindSport(m);
      const c3 = $('#profil3d', m); if (c3) show3d(c3, { rider: p.rider, bike: p.garage.bike });
      $('#rep', m)?.addEventListener('click', () => reportDialog('user', p.username, p.username));
      const a = $('#pacts2', m);
      if (a) { bindKudos(a); a.addEventListener('click', e => { const b = e.target.closest('[data-rep-act]'); if (b) reportDialog('activity', Number(b.dataset.repAct), 'cette activit\u00e9'); }); }
    },
  };
});

/* ---------- Notifications ---------- */
function notifText(n) {
  const d = n.data || {}, U = name => html`<a href="/u/${encodeURIComponent(name)}">${name}</a>`;
  switch (n.kind) {
    case 'friend_request': return html`${U(d.from)} t\u2019a envoy\u00e9 une demande d\u2019ami. <a href="/amis?onglet=recues">R\u00e9pondre</a>`;
    case 'friend_accepted': return html`${U(d.by)} a accept\u00e9 ta demande d\u2019ami.`;
    case 'invite_accepted': return html`${U(d.by)} a rejoint CycleRush gr\u00e2ce \u00e0 ton invitation. Vous \u00eates amis.`;
    case 'reaction': return html`${U(d.by)} a encourag\u00e9 ton activit\u00e9 \u00ab ${d.title} \u00bb.`;
    case 'challenge_completed': return html`Bravo, d\u00e9fi r\u00e9ussi : <a href="/defis">${d.title}</a> ! +500 XP et +100 pi\u00e8ces.`;
    case 'goal_reached': return html`Objectif atteint : ${nf(d.target)} ${d.unit} ${d.period === 'week' ? 'cette semaine' : 'ce mois-ci'}. +200 XP et +40 pi\u00e8ces.`;
    case 'announcement': return html`<b>${d.title}</b><br>${d.body}`;
    case 'moderation_warning': return html`Avertissement de l\u2019\u00e9quipe de mod\u00e9ration. Motif : ${d.reason}`;
    case 'content_hidden': return html`Une de tes activit\u00e9s a \u00e9t\u00e9 masqu\u00e9e par la mod\u00e9ration. Motif : ${d.reason}`;
    case 'account_suspended': return html`Ton compte a \u00e9t\u00e9 suspendu pendant ${d.days} jour${d.days > 1 ? 's' : ''}.`;
    case 'report_resolved': return html`Ton signalement a \u00e9t\u00e9 trait\u00e9 par l\u2019\u00e9quipe. Merci pour ton aide.`;
    case 'role_changed': return html`Ton r\u00f4le sur CycleRush est maintenant : ${d.role}.`;
    case 'mp_invite': return html`${U(d.from)} t\u2019invite \u00e0 ${d.mode === 'race' ? 'une course' : 'une sortie'} sur ${d.routeName}. <a href="${rideUrl(d.code, d.routeId)}" data-external>Rejoindre (code ${d.code})</a>`;
    case 'level_up': return html`Niveau ${d.level} atteint ! De nouveaux objets t\u2019attendent peut-\u00eatre dans la <a href="/boutique">boutique</a>.`;
    default: return html`Nouvelle notification.`;
  }
}
route('/notifications', async (p, qs) => {
  const pg = Math.max(1, Number(qs.get('page')) || 1);
  const r = await api('GET', '/notifications?page=' + pg);
  return {
    title: 'Notifications',
    html: html`<div class="wrap page" style="max-width:820px"><div class="page-h"><div><h1>Notifications</h1><p>${r.unread ? `${r.unread} non lue${r.unread > 1 ? 's' : ''}` : 'Tout est lu.'}</p></div>${r.unread ? html`<button class="btn sm" id="readAll">Tout marquer comme lu</button>` : ''}</div>
      <section class="card">${r.items.length ? r.items.map(n => html`<div class="notif ${n.read_at ? '' : 'unread'}"><div><p>${notifText(n)}</p><time datetime="${n.created_at}">${ago(n.created_at)}</time></div></div>`) : html`<div class="empty">Aucune notification.</div>`}</section>
      <div style="display:flex;gap:8px;justify-content:center">${pg > 1 ? html`<a class="btn sm" href="/notifications?page=${pg - 1}">Plus r\u00e9centes</a>` : ''}${r.more ? html`<a class="btn sm" href="/notifications?page=${pg + 1}">Plus anciennes</a>` : ''}</div></div>`,
    mount: m => {
      $('#readAll', m)?.addEventListener('click', async () => { await api('POST', '/notifications/read', {}); state.unread = 0; render(); });
      const ids = r.items.filter(n => !n.read_at).map(n => n.id);
      if (ids.length) setTimeout(async () => { try { await api('POST', '/notifications/read', { ids }); state.unread = Math.max(0, state.unread - ids.length); renderNav(); } catch {} }, 1500);
    },
  };
}, { auth: true });

/* ---------- Param\u00e8tres ---------- */
function resizeImage(file) {
  return new Promise((res, rej) => {
    if (!/^image\//.test(file.type)) return rej(new Error('Choisis une image (JPEG, PNG ou WebP).'));
    if (file.size > 12e6) return rej(new Error('Image trop lourde (12 Mo maximum).'));
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const s = 256, c = document.createElement('canvas'); c.width = c.height = s;
      const k = Math.min(img.width, img.height), ctx = c.getContext('2d');
      ctx.drawImage(img, (img.width - k) / 2, (img.height - k) / 2, k, k, 0, 0, s, s);
      URL.revokeObjectURL(url); res(c.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => rej(new Error('Cette image ne peut pas \u00eatre lue.'));
    img.src = url;
  });
}

route('/parametres', async () => {
  const u = state.user;
  return {
    title: 'Param\u00e8tres',
    html: html`<div class="wrap page" style="max-width:860px"><div class="page-h"><div><h1>Param\u00e8tres</h1><p>Ton profil, ta confidentialit\u00e9 et la s\u00e9curit\u00e9 de ton compte.</p></div></div>
      <section class="card"><h2>Profil</h2><form id="pf" style="display:flex;flex-direction:column;gap:14px">
        <div class="alert bad form-err" role="alert" hidden></div>
        <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap"><span id="avaPrev">${avatar(u, 'lg')}</span>
          <div style="display:flex;gap:8px;flex-wrap:wrap"><label class="btn" for="avaFile">Changer la photo</label><input type="file" id="avaFile" accept="image/jpeg,image/png,image/webp" class="sr">
          ${u.avatar ? html`<button type="button" class="btn ghost" id="avaDel">Retirer</button>` : ''}</div></div>
        <div class="field"><label>Nom d\u2019utilisateur</label><input class="input" value="${u.username}" disabled><span class="hint">Le nom d\u2019utilisateur ne peut pas \u00eatre modifi\u00e9.</span></div>
        <div class="field"><label for="bio">Biographie</label><textarea class="input" id="bio" name="bio" rows="3" maxlength="400" placeholder="Ton style, tes cols pr\u00e9f\u00e9r\u00e9s, ton mat\u00e9riel\u2026">${u.bio}</textarea></div>
        <div><button class="btn primary" type="submit">Enregistrer le profil</button></div></form></section>

      <section class="card"><h2>Confidentialit\u00e9</h2><form id="cf" style="display:flex;flex-direction:column;gap:14px">
        <div class="alert bad form-err" role="alert" hidden></div>
        <div class="grid g2"><div class="field"><label for="pv">Qui peut voir mon profil (bio, date d\u2019inscription, amis)</label><select class="input" id="pv" name="profile">${Object.entries(VIS).map(([k, v]) => html`<option value="${k}" ${raw(u.privacy.profile === k ? 'selected' : '')}>${v}</option>`)}</select></div>
          <div class="field"><label for="av">Qui peut voir mes activit\u00e9s et statistiques</label><select class="input" id="av" name="activities">${Object.entries(VIS).map(([k, v]) => html`<option value="${k}" ${raw(u.privacy.activities === k ? 'selected' : '')}>${v}</option>`)}</select></div></div>
        <label class="check"><input type="checkbox" name="searchable" ${raw(u.privacy.searchable ? 'checked' : '')}> <span>Les autres cyclistes peuvent me trouver dans la recherche</span></label>
        <p class="hint" style="margin:0">Ces r\u00e9glages sont appliqu\u00e9s par le serveur : une information masqu\u00e9e n\u2019est jamais envoy\u00e9e aux personnes qui n\u2019y ont pas droit.</p>
        <div><button class="btn primary" type="submit">Enregistrer</button></div></form></section>

      <section class="card"><h2>S\u00e9curit\u00e9</h2><form id="sf" style="display:flex;flex-direction:column;gap:14px;max-width:460px">
        <div class="alert bad form-err" role="alert" hidden></div>
        <div class="field"><label for="cur">Mot de passe actuel</label><input class="input" id="cur" name="current" type="password" autocomplete="current-password" required></div>
        <div class="field"><label for="np">Nouveau mot de passe</label><input class="input" id="np" name="password" type="password" autocomplete="new-password" required><span class="hint">${pwHint}</span></div>
        <div class="field"><label for="np2">Confirme le nouveau mot de passe</label><input class="input" id="np2" name="password2" type="password" autocomplete="new-password" required></div>
        <div><button class="btn primary" type="submit">Changer le mot de passe</button></div>
        <p class="hint" style="margin:0">Tes autres appareils seront d\u00e9connect\u00e9s.</p></form></section>

      <section class="card"><h2>Compte</h2>
        <p style="margin:0 0 6px">Adresse e-mail : <b>${u.email}</b> ${u.emailVerified ? html`<span class="pill ok">Confirm\u00e9e</span>` : html`<span class="pill warn">Non confirm\u00e9e</span>`}</p>
        <p class="muted" style="margin:0 0 6px">R\u00f4le : ${u.roleLabel} \u00b7 Inscrit le ${date(u.createdAt)}</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">${!u.emailVerified ? html`<button class="btn" id="resend">Renvoyer l\u2019e-mail de confirmation</button>` : ''}<button class="btn danger" id="delAcc">Supprimer mon compte</button></div></section>


    </div>`,
    mount: m => {
      let avatarData;
      $('#avaFile', m).onchange = async e => {
        const f = e.target.files[0]; if (!f) return;
        try { avatarData = await resizeImage(f); $('#avaPrev', m).innerHTML = out(avatar({ ...u, avatar: avatarData }, 'lg')); toast('Photo pr\u00eate : enregistre le profil pour la publier.'); }
        catch (err) { toast(err.message, 'bad'); }
      };
      $('#avaDel', m)?.addEventListener('click', () => { avatarData = null; $('#avaPrev', m).innerHTML = out(avatar({ username: u.username }, 'lg')); });
      bindForm($('#pf', m), async f => {
        const body = { bio: f.bio }; if (avatarData !== undefined) body.avatar = avatarData;
        await api('PATCH', '/me/profile', body); await loadMe(); renderNav(); toast('Profil enregistr\u00e9.');
      });
      bindForm($('#cf', m), async f => { await api('PATCH', '/me/profile', { privacy: { profile: f.profile, activities: f.activities, searchable: !!f.searchable } }); await loadMe(); toast('Confidentialit\u00e9 enregistr\u00e9e.'); });
      bindForm($('#sf', m), async (f, form) => {
        if (f.password !== f.password2) throw Object.assign(new Error('Les deux mots de passe ne sont pas identiques.'), { field: 'password2' });
        await api('POST', '/auth/change-password', { current: f.current, password: f.password }); form.reset(); toast('Mot de passe modifi\u00e9.');
      });
      $('#resend', m)?.addEventListener('click', async e => { e.target.disabled = true; try { await api('POST', '/auth/resend-verification'); toast('E-mail envoy\u00e9.'); } catch (err) { toast(err.message, 'bad'); e.target.disabled = false; } });
      $('#delAcc', m).onclick = () => modal(html`<h2>Supprimer ton compte ?</h2><p class="muted" style="margin:0">Ton profil, tes activit\u00e9s, tes amiti\u00e9s et tes notifications seront supprim\u00e9s d\u00e9finitivement. Cette action est irr\u00e9versible.</p>
        <form id="df" style="display:flex;flex-direction:column;gap:12px"><div class="alert bad form-err" role="alert" hidden></div>
        <div class="field"><label for="dp">Confirme avec ton mot de passe</label><input class="input" id="dp" name="password" type="password" autocomplete="current-password" required></div>
        <div class="modal-acts"><button type="button" class="btn ghost" data-close>Annuler</button><button class="btn danger" type="submit">Supprimer d\u00e9finitivement</button></div></form>`,
      (box, close) => bindForm($('#df', box), async f => { await api('DELETE', '/account', { password: f.password }); close(); state.user = null; toast('Ton compte a \u00e9t\u00e9 supprim\u00e9.'); go('/'); }));
    },
  };
}, { auth: true });

/* ---------- Invitation ---------- */
route('/invitation/:token', async ({ token }) => {
  let inv, err;
  try { inv = await api('GET', '/invites/' + encodeURIComponent(token)); } catch (e) { err = e.message; }
  return {
    title: 'Invitation',
    html: html`<div class="wrap"><section class="auth card" style="text-align:center;align-items:center">
      ${err ? html`<h1>Invitation invalide</h1><div class="alert bad">${err}</div><a class="btn" href="/">D\u00e9couvrir CycleRush</a>`
      : html`${avatar({ username: inv.inviter, avatar: inv.avatar }, 'lg')}<h1>${inv.inviter} t\u2019invite sur CycleRush</h1>
        <p class="muted" style="margin:0">Rejoins-le pour suivre vos sorties, vous encourager et relever des d\u00e9fis ensemble.</p>
        ${state.user ? html`<button class="btn primary" id="acc">Accepter l\u2019invitation</button>`
        : html`<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center"><a class="btn primary" href="/inscription" id="toReg">Cr\u00e9er mon compte</a><a class="btn" href="/connexion" id="toLog">J\u2019ai d\u00e9j\u00e0 un compte</a></div>`}`}
    </section></div>`,
    mount: m => {
      if (err) return;
      if (!state.user) sessionStorage.setItem('vv_invite', token);
      $('#acc', m)?.addEventListener('click', async e => {
        e.target.disabled = true;
        try { const r = await api('POST', `/invites/${encodeURIComponent(token)}/accept`); toast(r.already ? 'Vous \u00eates d\u00e9j\u00e0 amis.' : 'Vous \u00eates maintenant amis !'); go('/amis'); }
        catch (er) { toast(er.message, 'bad'); e.target.disabled = false; }
      });
    },
  };
});

/* ---------- Pages l\u00e9gales ---------- */
route('/conditions', async () => ({
  title: 'Conditions d\u2019utilisation',
  html: html`<div class="wrap page legal"><h1>Conditions d\u2019utilisation</h1>
    <p class="muted">Ce texte de base d\u00e9crit le fonctionnement de CycleRush. Fais-le relire par un professionnel avant une ouverture au grand public.</p>
    <h2>Ton compte</h2><p>Tu dois fournir une adresse e-mail valide et garder ton mot de passe secret. Tu es responsable de ce qui est fait avec ton compte. Un seul compte par personne.</p>
    <h2>Respect des autres</h2><p>Le harc\u00e8lement, les propos offensants, le spam, l\u2019usurpation d\u2019identit\u00e9 et les donn\u00e9es de sortie truqu\u00e9es sont interdits. Tout membre peut signaler un profil ou une activit\u00e9.</p>
    <h2>Mod\u00e9ration</h2><p>L\u2019\u00e9quipe CycleRush peut avertir, masquer un contenu, suspendre ou bannir un compte qui ne respecte pas ces r\u00e8gles. Chaque d\u00e9cision est enregistr\u00e9e avec son motif.</p>
    <h2>Tes contenus</h2><p>Tu restes propri\u00e9taire de tes activit\u00e9s et de ta photo. Tu nous autorises \u00e0 les afficher selon les r\u00e9glages de confidentialit\u00e9 que tu choisis.</p>
    <h2>Suppression</h2><p>Tu peux supprimer ton compte \u00e0 tout moment depuis tes param\u00e8tres. Tes donn\u00e9es sont alors effac\u00e9es.</p></div>`,
}));
route('/confidentialite', async () => ({
  title: 'Politique de confidentialit\u00e9',
  html: html`<div class="wrap page legal"><h1>Politique de confidentialit\u00e9</h1>
    <p class="muted">Ce texte de base d\u00e9crit les donn\u00e9es r\u00e9ellement trait\u00e9es par CycleRush. Compl\u00e8te-le avec l\u2019identit\u00e9 du responsable du site.</p>
    <h2>Donn\u00e9es collect\u00e9es</h2><ul><li>Compte : nom d\u2019utilisateur, adresse e-mail, mot de passe (stock\u00e9 sous forme chiffr\u00e9e irr\u00e9versible), date d\u2019inscription.</li><li>Profil : photo et biographie si tu les ajoutes.</li><li>Activit\u00e9s : date, dur\u00e9e, distance, d\u00e9nivel\u00e9, et si tu les fournis, puissance et fr\u00e9quence cardiaque.</li><li>Social : amiti\u00e9s, r\u00e9actions, notifications, signalements.</li></ul>
    <h2>Utilisation</h2><p>Ces donn\u00e9es servent uniquement \u00e0 faire fonctionner CycleRush : ton tableau de bord, tes d\u00e9fis, tes amis et la mod\u00e9ration. Elles ne sont pas vendues.</p>
    <h2>Visibilit\u00e9</h2><p>Tu choisis qui voit ton profil et tes activit\u00e9s : tout le monde, tes amis ou toi seul. Ton adresse e-mail n\u2019est jamais visible par les autres membres ; seuls les administrateurs peuvent la consulter.</p>
    <h2>Cookies</h2><p>CycleRush utilise un seul cookie, n\u00e9cessaire pour garder ta session ouverte. Aucun cookie publicitaire ni de mesure d\u2019audience.</p>
    <h2>Tes droits</h2><p>Tu peux modifier tes informations dans tes param\u00e8tres et supprimer ton compte \u00e0 tout moment.</p></div>`,
}));

/* ---------- 3D : garage, aper\u00e7us et parcours ---------- */
const stopViews = [];
let worldReady;
function loadWorld() {
  // t\u00e9l\u00e9chargements en parall\u00e8le, ex\u00e9cution dans l'ordre (async = false) ; catalog.js : segments et routes secondaires d\u00e9j\u00e0 calcul\u00e9s
  worldReady ||= Promise.all(['world/vv3d.js', 'world/rider.js', 'world/world.js', 'world/catalog.js'].map(src => new Promise((res, rej) => {
    const el = document.createElement('script'); el.src = src; el.async = false; el.onload = res; el.onerror = () => rej(new Error('Le moteur 3D n\u2019a pas pu \u00eatre charg\u00e9.')); document.head.append(el);
  })));
  worldReady.catch(() => { worldReady = null; });
  return worldReady;
}
const BIKE_NAMES = { aero: 'A\u00e9ro', grimpeur: 'Grimpeur', gravel: 'Gravel', clm: 'Contre-la-montre', 'rouge-carbone': 'Rouge Carbone', 'givre-rouge': 'Givre Rouge', 'eclair-blanc': '\u00c9clair Blanc', 'or-olympe': 'Or Olympe', 'nuit-polaire': 'Nuit Polaire', aurore: 'Aurore', legende: 'L\u00e9gende', rubis: 'Rubis', celeste: 'C\u00e9leste', flamme: 'Flamme', braise: 'Braise', neige: 'Neige', comete: 'Com\u00e8te', arlequin: 'Arlequin', soleil: 'Soleil', meteore: 'M\u00e9t\u00e9ore', contraste: 'Contraste', 'chrono-or': 'Chrono Or', 'grenat-cross': 'Grenat Cross', 'prisme-or': 'Prisme Or', 'lichen': 'Lichen', 'arc-en-ciel': 'Arc-en-ciel', 'citron-fluo': 'Citron Fluo', 'ivoire': 'Ivoire', 'azur': 'Azur' };
const bikeName = m => BIKE_NAMES[m] || 'V\u00e9lo';
const fmtDur = s => { const h = Math.floor(s / 3600), m = Math.round((s % 3600) / 60); return h ? `${h} h ${String(m).padStart(2, '0')}` : `${m} min`; };

// Aper\u00e7u 3D tournant d'un cycliste (glisser pour faire tourner). Renvoie { set(cfg) } pour le mettre \u00e0 jour.
async function show3d(canvas, cfg, { noRider = false } = {}) {
  await loadWorld();
  const { M, Renderer, Geo } = VV3D;
  let R;
  try { R = new Renderer(canvas); } catch (e) { canvas.replaceWith(Object.assign(document.createElement('p'), { className: 'muted', textContent: e.message })); return { set() {} }; }
  R.env({ sky: '#0d1a30', fog: '#0d1a30', ground: '#1d3152', near: 30, far: 60, amb: 0.7 });
  const floor = new Geo(); floor.cyl(M.t(0, -0.03, 0), 1.25, 1.25, 0.03, 32, '#132544'); floor.ring(M.chain(M.t(0, 0.002, 0), M.rx(Math.PI / 2)), 1.18, 1.25, 0.001, '#22d3ee', 48);
  const fm = R.mesh(floor);
  const model = new VVRider.Model(R, cfg);
  let yaw = 0.7, drag = null, alive = true, t0 = performance.now(), spin = true, opts = { noRider };
  canvas.addEventListener('pointerdown', e => { drag = e.clientX; spin = false; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', e => { if (drag !== null) { yaw += (e.clientX - drag) * 0.01; drag = e.clientX; } });
  canvas.addEventListener('pointerup', () => { drag = null; });
  const loop = now => {
    if (!alive || !canvas.isConnected) return;
    const t = (now - t0) / 1000; if (spin) yaw += 0.004;
    const d = 3.3;
    R.begin(M.lookAt([Math.cos(yaw) * d, 1.45, Math.sin(yaw) * d], [0.02, 0.72, 0]), 0.75);
    R.draw(fm); model.draw(M.id(), t * 4, t * 2.4, opts);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  stopViews.push(() => { alive = false; model.dispose(); R.free(fm); });
  return { set(c, o) { model.set(c); if (o) opts = o; model.lastCrank = null; } };
}

// Page Capteurs : connexion et test du home trainer, du cardio, du capteur de cadence et du capteur de puissance.
let sensorsReady = null;
function loadSensors() {
  sensorsReady ||= new Promise((res, rej) => { const el = document.createElement('script'); el.src = 'world/sensors.js'; el.onload = res; el.onerror = () => rej(new Error('Le module des capteurs n\u2019a pas pu \u00eatre charg\u00e9.')); document.head.append(el); });
  sensorsReady.catch(() => { sensorsReady = null; });
  return sensorsReady;
}
route('/capteurs', async () => {
  await loadSensors();
  return {
    title: 'Capteurs',
    html: html`<div class="wrap page">
      <div class="page-h"><div><h1>Capteurs</h1><p>Connecte et teste ton home trainer, ton cardio, ton capteur de cadence et ton capteur de puissance. Les valeurs affich\u00e9es viennent directement de tes appareils.</p></div>
        <a class="btn primary" href="/parcours">Choisir un parcours</a></div>
      <section class="card sensors-card"><div id="sensorsPanel"></div></section>
      <section class="card"><h2>Bon \u00e0 savoir</h2><ul class="sensors-tips">
        <li><b>Navigateur</b> : le Bluetooth fonctionne dans Chrome ou Edge, sur ordinateur et Android. Sur iPhone et iPad, utilise l\u2019app Bluefy.</li>
        <li><b>Plusieurs capteurs</b> : pour la puissance, le capteur de puissance passe avant le home trainer ; pour la cadence, le capteur de cadence passe en premier. Une valeur gris\u00e9e n\u2019est pas utilis\u00e9e.</li>
        <li><b>Pendant une sortie</b> : le navigateur coupe la connexion Bluetooth quand on change de page. Sur un parcours 3D, reconnecte tes capteurs avec le bouton <b>Capteurs</b> ; le nom du dernier appareil utilis\u00e9 est rappel\u00e9.</li>
        <li><b>Un capteur n\u2019appara\u00eet pas ?</b> R\u00e9veille-le (p\u00e9dale ou mouille la ceinture cardio), v\u00e9rifie qu\u2019il n\u2019est pas d\u00e9j\u00e0 connect\u00e9 \u00e0 une autre application, puis r\u00e9essaie.</li>
      </ul></section></div>`,
    mount: m => { const panel = VVSensors.mountPanel($('#sensorsPanel', m)); stopViews.push(() => panel.destroy()); },
  };
});

route('/garage', async () => {
  const [g, rw] = await Promise.all([api('GET', '/garage'), api('GET', '/rewards').catch(() => null)]);
  await loadWorld();
  const C = VVRider.CATALOG, cfg = { rider: { ...g.rider }, bike: { ...g.bike } };
  const sw = (group, key, list) => html`<div class="field"><span class="label">${list.label}</span><div class="swatches" role="radiogroup" aria-label="${list.label}">${C.palette.map(c => html`<button type="button" class="sw ${cfg[group][key] === c ? 'on' : ''}" style="background:${c}" data-g="${group}" data-k="${key}" data-v="${c}" role="radio" aria-checked="${cfg[group][key] === c}" aria-label="Couleur ${c}"></button>`)}</div></div>`;
  const choice = (group, key, label, items, locked = []) => html`<div class="field"><span class="label">${label}</span><div class="chips" role="radiogroup" aria-label="${label}">${items.map(([v, l]) => html`<button type="button" class="chip ${cfg[group][key] === v ? 'on' : ''}" data-g="${group}" data-k="${key}" data-v="${v}" role="radio" aria-checked="${cfg[group][key] === v}" ${raw(locked.includes(v) ? 'disabled title="Se d\u00e9bloque dans la boutique"' : '')}>${l}${locked.includes(v) ? ' \ud83d\udd12' : ''}</button>`)}</div></div>`;
  const lockedBikes = C.bike.model.map(m => m[0]).filter(m => m !== 'aero' && !g.unlocked.includes(m));
  const panels = () => ({
    velo: html`${choice('bike', 'model', 'Mod\u00e8le', C.bike.model.map(([v, l]) => [v, l]), lockedBikes)}
      ${lockedBikes.length ? html`<p class="hint" style="margin-top:-4px">Les v\u00e9los \ud83d\udd12 s\u2019ach\u00e8tent avec tes pi\u00e8ces dans la <a href="/boutique">boutique</a> ou se gagnent aux paliers de niveau (10, 20\u2026 100). Le mod\u00e8le A\u00e9ro est offert.</p>` : ''}
      <p class="hint" id="modelDesc">${(C.bike.model.find(m => m[0] === cfg.bike.model) || [])[2] || ''}</p>
      ${(C.bike.model.find(m => m[0] === cfg.bike.model) || [])[3] ? html`<img class="g-model-img" src="${C.bike.model.find(m => m[0] === cfg.bike.model)[3]}" alt="Photo du v\u00e9lo ${bikeName(cfg.bike.model)}" loading="lazy">` : ''}
      ${sw('bike', 'frameColor', { label: 'Couleur du cadre' })}${sw('bike', 'accentColor', { label: 'Fourche et douille' })}
      ${choice('bike', 'wheels', 'Roues', C.bike.wheels, ['carbone67', 'batons', 'arcenciel45', 'or60'].filter(w => !(g.unlockedWheels || []).includes(w)))}${sw('bike', 'rimColor', { label: 'Couleur des jantes' })}
      ${choice('bike', 'tyres', 'Pneus', C.bike.tyres)}${sw('bike', 'tapeColor', { label: 'Guidoline' })}${sw('bike', 'saddleColor', { label: 'Selle' })}`,
    cycliste: html`${choice('rider', 'skin', 'Teint', C.rider.skin.map(([v], i) => [v, 'Teint ' + (i + 1)]))}
      ${choice('rider', 'helmet', 'Casque', C.rider.helmet)}${sw('rider', 'helmetColor', { label: 'Couleur du casque' })}
      ${choice('rider', 'glasses', 'Lunettes', C.rider.glasses.map(x => [x[0], x[1]]))}
      ${choice('rider', 'jerseyPattern', 'Motif du maillot', C.rider.jerseyPattern)}${sw('rider', 'jerseyColor', { label: 'Couleur principale du maillot' })}${sw('rider', 'jerseyColor2', { label: 'Deuxi\u00e8me couleur du maillot' })}
      ${sw('rider', 'shortsColor', { label: 'Cuissard' })}
      ${choice('rider', 'gloves', 'Gants', [['aucun', 'Sans gants'], ['#111827', 'Noirs'], ['#ffffff', 'Blancs'], [cfg.rider.jerseyColor, 'Assortis au maillot']].filter((x, i, a) => a.findIndex(y => y[0] === x[0]) === i))}
      ${choice('rider', 'socks', 'Chaussettes', C.rider.socks)}${sw('rider', 'socksColor', { label: 'Couleur des chaussettes' })}${sw('rider', 'shoesColor', { label: 'Chaussures' })}`,
  });
  let tab = 'velo';
  return {
    title: 'Garage',
    html: html`<div class="wrap page">
      <div class="page-h"><div><h1>Garage</h1><p>Choisis ton v\u00e9lo et ta tenue. Ils seront affich\u00e9s sur ton profil, dans le fil de tes amis et sur les parcours 3D.</p></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn" href="/parcours">Voir les parcours</a><button class="btn primary" id="gsave">Enregistrer</button></div></div>
      <div class="garage">
        <section class="card g-prev"><div class="g3d-view big"><canvas id="g3d" aria-label="Aper\u00e7u 3D du cycliste et du v\u00e9lo"></canvas></div>
          <div class="g-prev-foot"><span id="gport">${avatar({ rider: cfg.rider, username: state.user.username }, 'lg')}</span><div><b id="gname">${bikeName(cfg.bike.model)}</b><p class="muted" style="margin:0;font-size:14px">Glisse sur l\u2019aper\u00e7u pour faire tourner. Ton portrait (\u00e0 gauche) remplace l\u2019initiale quand tu n\u2019as pas de photo.</p></div></div>
          <p class="hint" id="gstate" style="margin:10px 0 0">${g.saved ? 'Tenue enregistr\u00e9e.' : 'Aucune tenue enregistr\u00e9e pour l\u2019instant : voici la tenue par d\u00e9faut.'}</p></section>
        <section class="card g-opts"><div class="tabs" role="tablist"><button role="tab" data-tab="velo" aria-selected="true">V\u00e9lo</button><button role="tab" data-tab="cycliste" aria-selected="false">Cycliste</button></div><div id="gpanel" style="display:flex;flex-direction:column;gap:14px;margin-top:14px">${panels()[tab]}</div></section>
      </div></div>`,
    mount: async m => {
      const view = await show3d($('#g3d', m), cfg);
      let dirty = false;
      const refresh = () => { $('#gpanel', m).innerHTML = out(panels()[tab]); $('#gname', m).textContent = bikeName(cfg.bike.model); $('#gport', m).innerHTML = out(avatar({ rider: cfg.rider, username: state.user.username }, 'lg')); };
      $('.g-opts', m).addEventListener('click', e => {
        const t = e.target.closest('[data-tab]');
        if (t) { tab = t.dataset.tab; $$('[data-tab]', m).forEach(b => b.setAttribute('aria-selected', b === t)); refresh(); return; }
        const b = e.target.closest('[data-g]'); if (!b || b.disabled) return;
        cfg[b.dataset.g][b.dataset.k] = b.dataset.v; dirty = true;
        if (b.dataset.g === 'bike' && b.dataset.k === 'model' && C.presets && C.presets[b.dataset.v]) Object.assign(cfg.bike, C.presets[b.dataset.v]);
        $('#gstate', m).textContent = 'Modifications non enregistr\u00e9es.';
        view.set(cfg); refresh();
      });
      $('#gsave', m).onclick = async e => {
        e.target.disabled = true;
        try { await api('PUT', '/garage', { rider: cfg.rider, bike: cfg.bike }); dirty = false; await loadMe(); renderNav(); $('#gstate', m).textContent = 'Tenue et v\u00e9lo enregistr\u00e9s dans ton compte.'; toast('Garage enregistr\u00e9.'); }
        catch (err) { toast(err.message, 'bad'); }
        e.target.disabled = false;
      };
      stopViews.push(() => { if (dirty) toast('Les modifications du garage n\u2019ont pas \u00e9t\u00e9 enregistr\u00e9es.', 'bad'); });
    },
  };
}, { auth: true });

// Segments et routes secondaires d'un parcours : catalogue d\u00e9j\u00e0 calcul\u00e9 (instantan\u00e9), sinon calcul complet par le moteur.
const segsFor = (r, w) => (window.VVCatalog && VVCatalog[r.id] ? VVCatalog[r.id].segs : VVWorld.segmentsOf ? VVWorld.segmentsOf(w) : []);
const brsFor = (r, w) => (window.VVCatalog && VVCatalog[r.id] ? VVCatalog[r.id].branches : VVWorld.branchesOf ? VVWorld.branchesOf(w) : []);
// Vignette fixe d'un parcours, calcul\u00e9e une fois par le moteur 3D.
const thumbs = {};
async function routeThumb(route) {
  if (thumbs[route.id]) return thumbs[route.id];
  await loadWorld();
  const c = document.createElement('canvas'); c.style.cssText = 'position:fixed;left:-2000px;top:0;width:480px;height:240px'; document.body.append(c);
  try {
    const { M } = VV3D, R = new VV3D.Renderer(c), sc = new VVWorld.Scenery(R, route), w = sc.w, s = Math.min(w.length * 0.5, 2600);
    for (let i = 0; i < 20; i++) sc.update(s, 900, 200);
    const p = VVWorld.at(w, s), b = VVWorld.at(w, s - 30);
    const cam = [b.x - Math.sin(p.heading) * 8, b.y + 14, b.z + Math.cos(p.heading) * 8];
    R.begin(M.lookAt(cam, [p.x + Math.cos(p.heading) * 60, p.y, p.z + Math.sin(p.heading) * 60]), 0.9);
    sc.draw(cam);
    thumbs[route.id] = c.toDataURL('image/jpeg', 0.82); sc.dispose();
  } catch { thumbs[route.id] = null; }
  c.remove();
  return thumbs[route.id];
}

// Segments sur le profil : bande color\u00e9e et trait \u00e9pais sur la courbe, \u00e0 leur position sur le parcours (route secondaire :
// trait pointill\u00e9 au niveau de l'embranchement, puisqu'elle quitte la route principale).
function segOverlay(w, segs, W, H, y) {
  if (!segs || !segs.length) return '';
  const ST = VVWorld.SEG_STYLE, n = w.n, L = w.length;
  return segs.map(g => {
    const a = g.road < 0 ? g.sA : g.mainA, b = g.road < 0 ? g.sB : g.mainB, c = ST[g.kind].color, x0 = a / L * W, x1 = b / L * W;
    let d = ''; for (let s = a; s <= b + 1; s += Math.max(VVWorld.STEP, (b - a) / 40)) { const i = Math.min(n - 1, Math.round(Math.min(s, b) / VVWorld.STEP)); d += (d ? ' L' : 'M') + (i / (n - 1) * W).toFixed(1) + ' ' + y(w.E[i]).toFixed(1); }
    return `<g><title>${esc(ST[g.kind].label + ' \u00b7 ' + g.name)}</title><rect x="${x0.toFixed(1)}" y="0" width="${Math.max(1.5, x1 - x0).toFixed(1)}" height="${H}" fill="${c}" opacity=".16"/>`
      + `<path d="${d}" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round" vector-effect="non-scaling-stroke"${g.road >= 0 ? ' stroke-dasharray="6 4"' : ''}/>`
      + `<line x1="${x0.toFixed(1)}" x2="${x0.toFixed(1)}" y1="0" y2="${H}" stroke="${c}" stroke-width="1.5" vector-effect="non-scaling-stroke"/><line x1="${x1.toFixed(1)}" x2="${x1.toFixed(1)}" y1="0" y2="${H}" stroke="${c}" stroke-width="1.5" stroke-dasharray="3 3" vector-effect="non-scaling-stroke"/></g>`;
  }).join('');
}
const segLegend = segs => { const ST = VVWorld.SEG_STYLE, kinds = [...new Set((segs || []).map(g => g.kind))]; return kinds.length ? html`<div class="seg-legend">${kinds.map(k => html`<span><i style="background:${ST[k].color}"></i>${ST[k].label}${k === 'branch' ? ' (pointill\u00e9s)' : ''}</span>`)}<span class="muted">trait plein : d\u00e9part \u00b7 pointill\u00e9s : arriv\u00e9e</span></div>` : ''; };
function profileSvg(w, pos = null, segs = null) {
  const W = 600, H = 120, n = w.n, step = Math.max(1, Math.floor(n / 300));
  const min = w.minE, max = Math.max(w.maxE, min + 50), y = e => H - 8 - (e - min) / (max - min) * (H - 20);
  let d = `M0 ${H}`;
  for (let i = 0; i < n; i += step) d += ` L${(i / (n - 1) * W).toFixed(1)} ${y(w.E[i]).toFixed(1)}`;
  d += ` L${W} ${y(w.E[n - 1]).toFixed(1)} L${W} ${H} Z`;
  return `<svg class="elev" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Profil d\u2019altitude"><defs><linearGradient id="eg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#22d3ee" stop-opacity=".9"/><stop offset="1" stop-color="#2dd4bf" stop-opacity=".25"/></linearGradient></defs><path d="${d}" fill="url(#eg)"/>${segOverlay(w, segs, W, H, y)}${pos !== null ? `<line x1="${pos * W}" x2="${pos * W}" y1="0" y2="${H}" stroke="#fff" stroke-width="2"/>` : ''}</svg>`;
}
const routeFacts = (r, w, est, xp) => html`<div class="facts">
  <div><span>Distance</span><b>${nf(r.km)} km</b></div><div><span>D\u00e9nivel\u00e9</span><b>${nf(w.dplus)} m</b></div>
  <div><span>Difficult\u00e9</span><b><span class="dots">${[1, 2, 3].map(i => html`<i style="${i <= r.lv ? `background:${LV_COLOR[r.lv]}` : ''}"></i>`)}</span>${r.level}</b></div>
  <div><span>Dur\u00e9e estim\u00e9e</span><b>${fmtDur(est)}</b></div>${xp ? html`<div><span>XP en le terminant</span><b title="Dont ${nf(xp.finish)} XP de bonus d\u2019arriv\u00e9e, une fois par jour sur ce parcours">\u2248 ${nf(xp.total)} XP</b></div>` : ''}</div>`;

/* ---------- Rouler \u00e0 plusieurs : cr\u00e9er ou rejoindre une session avec un code ---------- */
// La session est partag\u00e9e par le serveur : chacun roule chez soi, sur son appareil, et voit les autres sur le m\u00eame
// parcours virtuel. Seule la distance parcourue sur le trac\u00e9 est \u00e9chang\u00e9e, jamais une position GPS.
const rideUrl = (code, routeId) => `ride.html?session=${encodeURIComponent(code)}#${routeId}`;
function mpCard(routeId) {
  if (!state.user) return html`<section class="card mp-card"><h2>Rouler \u00e0 plusieurs</h2><p class="muted">Cr\u00e9e une session et partage son code, ou rejoins tes amis avec le leur : vous roulez ensemble sur le m\u00eame parcours, chacun chez soi.</p>
    <a class="btn primary" href="/connexion?retour=${encodeURIComponent(VL.pathname)}">Se connecter pour rouler \u00e0 plusieurs</a></section>`;
  return html`<section class="card mp-card" aria-labelledby="mp-t"><h2 id="mp-t">Rouler \u00e0 plusieurs</h2>
    <p class="muted">Vous roulez ensemble dans le m\u00eame parcours virtuel, m\u00eame \u00e0 des kilom\u00e8tres les uns des autres : seule votre position sur le trac\u00e9 est partag\u00e9e, jamais votre position GPS.</p><p class="example" style="margin:0">Ici, les donn\u00e9es restent dans ce navigateur : pour rouler avec des amis sur d\u2019autres appareils, utilise CycleRush en ligne.</p>
    <div class="alert info" id="mpMine" hidden></div>
    <div class="mp-grid">
      <div class="mp-col"><h3>Cr\u00e9er un salon</h3><p class="muted">Choisis le type : rouler ensemble sans chrono, ou une vraie course avec d\u00e9part commun et classement.</p>
        <div class="mp-acts"><a class="btn primary" href="/ensemble?type=ride${routeId ? '&parcours=' + routeId : ''}">Sortie entre amis</a><a class="btn" href="/ensemble?type=race${routeId ? '&parcours=' + routeId : ''}">Course multijoueur</a></div></div>
      <form class="mp-col" id="mpJoin"><h3>Rejoindre avec un code</h3><p class="muted">Saisis les 6 caract\u00e8res re\u00e7us d\u2019un ami.</p>
        <div class="mp-join"><input class="input num" id="mpIn" name="code" maxlength="7" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="EX. K7Q2MP" aria-label="Code de la session" required><button class="btn primary" type="submit">Rejoindre</button></div>
        <p class="mp-err" id="mpErr" role="alert" hidden></p></form>
    </div></section>`;
}
function mpBind(m, routeId) {
  if (!state.user || !$('#mpJoin', m)) return;
  api('GET', '/mp/mine').then(d => { if (d.session && $('#mpMine', m)) { const b = $('#mpMine', m); b.hidden = false; b.innerHTML = out(html`Tu fais partie ${d.session.mode === 'race' ? 'de la course' : 'de la sortie'} <b class="num">${d.session.code}</b> (${d.session.routeName}). <a href="${rideUrl(d.session.code, d.session.routeId)}" data-external>Revenir dans la session</a>`); } }).catch(() => {});
  const f = $('#mpJoin', m), inp = $('#mpIn', m), err = $('#mpErr', m);
  inp.oninput = () => { inp.value = inp.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6); err.hidden = true; inp.removeAttribute('aria-invalid'); };
  f.onsubmit = async e => {
    e.preventDefault();
    const code = inp.value.trim(), btn = $('button', f), fail = msg => { err.textContent = msg; err.hidden = false; inp.setAttribute('aria-invalid', 'true'); btn.disabled = false; };
    if (code.length !== 6) return fail('Le code contient 6 caract\u00e8res (lettres et chiffres).');
    btn.disabled = true;
    try {
      const r = await joinByCode(code);
      location.href = r.go;
    } catch (x) { fail(x.message); }
  };
}

// \u00c9tat des parcours (l'\u00e9quipe peut en d\u00e9sactiver un) : lu sur le serveur, qui refuse aussi les sorties sur un parcours d\u00e9sactiv\u00e9.
const routeStatus = () => api('GET', '/routes/status').then(d => Object.fromEntries(d.routes.map(r => [r.id, { ...r, xpRules: d.xpRules }]))).catch(() => ({}));
// XP attendue en terminant le parcours (bar\u00e8me envoy\u00e9 par le serveur) : distance, d\u00e9nivel\u00e9, dur\u00e9e estim\u00e9e et bonus d'arriv\u00e9e.
const routeXp = (r, w, est, st) => { if (!st || !st.xpRules) return null; const R = st.xpRules; return { finish: st.finishXp, total: Math.min(R.maxXp, Math.round(r.km * R.xpPerKm + w.dplus / 100 * R.xpPer100mDplus + est / 60 * R.xpPerMinute) + st.finishXp) }; };
route('/parcours', async () => {
  const [, RST] = await Promise.all([loadWorld(), routeStatus()]);
  const list = VVWorld.ROUTES;
  return {
    title: 'Parcours',
    html: html`<div class="wrap page"><div class="page-h"><div><h1>Parcours</h1><p>${list.length} parcours \u00e0 rouler en 3D avec ton home trainer, dont ${list.filter(r => r.sprint).length} parcours de sprint courts et plats. Choisis un parcours pour voir son aper\u00e7u.</p></div><a class="btn" href="/garage">Mon garage</a></div>
      <div class="grid g3">${list.map(r => { const w = VVWorld.build(r); return html`<a class="route-link" href="/parcours/${r.id}"><article class="route"><img data-thumb="${r.id}" src="${r.img || ''}" alt="Paysage du parcours ${r.name}" width="640" height="320">
        <div class="route-b"><span class="tag">${VVWorld.THEMES[r.theme].label}</span>${r.sprint ? html` <span class="pill cyan">Sprint \u00b7 plat</span>` : ''}${RST[r.id] && RST[r.id].enabled === false ? html` <span class="pill bad">Temporairement indisponible</span>` : ''}<h3>${r.name}</h3><div class="route-m"><span>${r.km} km</span><span>${nf(w.dplus)} m D+</span><span>\u2248 ${fmtDur(VVWorld.estimate(r))}</span></div>
        <div class="route-m"><span><span class="dots">${[1, 2, 3].map(i => html`<i style="${i <= r.lv ? `background:${LV_COLOR[r.lv]}` : ''}"></i>`)}</span>${r.level}</span>${(() => { const x = routeXp(r, w, VVWorld.estimate(r), RST[r.id]); return x ? html`<span class="xp-est" title="XP estim\u00e9e en terminant le parcours, dont ${nf(x.finish)} XP de bonus d\u2019arriv\u00e9e (une fois par jour)">\u2248 ${nf(x.total)} XP</span>` : ''; })()}</div>
        <div class="route-prof">${raw(profileSvg(w, null, segsFor(r, w)))}</div></div></article></a>`; })}</div>
      ${segLegend([{ kind: 'climb' }, { kind: 'fast' }, { kind: 'branch' }])}
      <p class="example">Dur\u00e9e estim\u00e9e pour un cycliste de 75 kg qui tient 200 W (vitesse limit\u00e9e \u00e0 60 km/h en descente). Elle d\u00e9pend de ton niveau.</p>
      ${mpCard(null)}</div>`,
    mount: async m => { mpBind(m, null); for (const img of $$('img[data-thumb]', m)) { if (img.getAttribute('src')) continue; const u = await routeThumb(VVWorld.byId(img.dataset.thumb)); if (u && img.isConnected) img.src = u; } },
  };
});

route('/parcours/:id', async ({ id }) => {
  const [, RST] = await Promise.all([loadWorld(), routeStatus()]);
  const r = VVWorld.byId(id);
  if (!r) return { title: 'Parcours introuvable', html: html`<div class="wrap page"><section class="card" style="text-align:center;padding:40px 20px"><h1 style="font-size:28px">Parcours introuvable</h1><p class="muted">Ce parcours n\u2019existe pas.</p><a class="btn primary" href="/parcours">Voir les parcours</a></section></div>` };
  const w = VVWorld.build(r), est = VVWorld.estimate(r), T = VVWorld.THEMES[r.theme], off = RST[r.id] && RST[r.id].enabled === false;
  return {
    title: r.name,
    html: html`<div class="wrap page">
      <p style="margin:0"><a href="/parcours">\u2190 Tous les parcours</a></p>
      <div class="page-h"><div><span class="tag">${T.label}</span><h1>${r.name}</h1><p>${r.desc}</p></div>
        ${off ? html`<button class="btn" disabled>Parcours indisponible</button>` : html`<a class="btn primary" href="ride.html#${r.id}" data-external>Rouler ce parcours</a>`}</div>
      ${off ? html`<div class="alert info" role="status">Ce parcours est temporairement d\u00e9sactiv\u00e9 par l\u2019\u00e9quipe${RST[r.id].reason ? ' : ' + RST[r.id].reason : ''}. Tes sorties et ton historique sur ce parcours sont conserv\u00e9s.</div>` : ''}
      <section class="card" style="padding:0;overflow:hidden"><div class="route-3d" style="background-image:url('img/apercu-${r.id}.jpg')"><canvas id="r3d" aria-label="Survol 3D du parcours ${r.name}"></canvas><span class="route-3d-tag">Aper\u00e7u \u00b7 3D en pr\u00e9paration</span></div></section>
      ${routeFacts(r, w, est, routeXp(r, w, est, RST[r.id]))}
      <section class="card"><h2>Profil d\u2019altitude et segments</h2>${raw(profileSvg(w, null, segsFor(r, w)))}<div class="elev-axis"><span>0 km</span><span>Point culminant : ${nf(Math.round(w.maxE))} m</span><span>${r.km} km</span></div>${segLegend(segsFor(r, w))}</section>
      ${(() => { const B = brsFor(r, w); return B.length ? html`<section class="card"><h2>Routes secondaires</h2><p class="muted" style="margin:0 0 10px">\u00c0 chaque embranchement, un panneau te propose la route secondaire (fl\u00e8che \u2190 ou \u2192) ; sinon tu continues tout droit. Chacune rejoint la route principale plus loin.</p>
        <div class="tbl-wrap"><table class="br-tbl"><thead><tr><th>Route</th><th>Type</th><th>D\u00e9part</th><th>Retour</th><th>Longueur</th><th>D+</th><th>Pente max</th></tr></thead><tbody>
        ${B.map(b => html`<tr><td><b>${b.name}</b></td><td>${b.kind}</td><td class="num">km ${nf(b.sA / 1000, 1)}</td><td class="num">km ${nf(b.sB / 1000, 1)}</td><td class="num">${nf(b.len / 1000, 1)} km</td><td class="num">${b.dplus} m</td><td class="num">${nf(b.maxGrade * 100, 0)} %</td></tr>`)}</tbody></table></div></section>` : ''; })()}
      ${(() => { const SG = segsFor(r, w); return SG.length ? html`<section class="card"><h2>Segments chronom\u00e9tr\u00e9s</h2><p class="muted" style="margin:0 0 10px">Pars de la ligne de d\u00e9part du parcours : le chrono de chaque segment d\u00e9marre tout seul \u00e0 son passage. Records et classements : <a href="/segments?parcours=${r.id}">voir les segments de ce parcours</a>.</p>
        <div class="tbl-wrap"><table class="br-tbl"><thead><tr><th>Segment</th><th>Type</th><th>Position</th><th>Longueur</th><th>Pente</th><th></th></tr></thead><tbody>
        ${SG.map(g => html`<tr><td><i class="seg-dot" style="background:${VVWorld.SEG_STYLE[g.kind].color}"></i><b>${g.name}</b></td><td>${{ climb: 'Mont\u00e9e', fast: 'Portion rapide', branch: 'Route secondaire' }[g.kind]}</td><td class="num">${g.road < 0 ? 'km ' + nf(g.sA / 1000, 1) : 'embranchement km ' + nf((g.mainA || 0) / 1000, 1)}</td><td class="num">${nf(g.len / 1000, 2)} km</td><td class="num">${nf(g.grade, 1)} %</td><td>${state.user && !off ? html`<a class="btn sm" href="ride.html?seg=${encodeURIComponent(g.id)}#${r.id}" data-external>Tenter</a>` : ''}</td></tr>`)}</tbody></table></div></section>` : ''; })()}
      <p class="example">Dur\u00e9e estim\u00e9e pour un cycliste de 75 kg qui tient 200 W. Sur le parcours, ton home trainer durcit dans les mont\u00e9es et s\u2019all\u00e8ge dans les descentes.</p>
      ${off ? '' : mpCard(r.id)}</div>`,
    mount: async m => {
      if (!off) mpBind(m, r.id);
      const c = $('#r3d', m), { M } = VV3D;
      let R; try { R = new VV3D.Renderer(c); } catch (e) { c.replaceWith(Object.assign(document.createElement('p'), { className: 'muted', textContent: e.message, style: 'padding:20px' })); return; }
      const sc = new VVWorld.Scenery(R, r, { worker: 'world/scenery-worker.js', lazy: true, syncNear: false }), meM = new VVRider.Model(R, { rider: state.user?.rider || undefined, bike: state.user?.bike || undefined });
      const bots = [1, 2, 3].map(k => new VVRider.Model(R, VVRider.randomCfg(VV3D.rng(r.seed + k))));
      // Image du parcours affich\u00e9e tout de suite (m\u00eame point de vue que la cam\u00e9ra au d\u00e9part de l'aper\u00e7u), puis fondu vers la
      // 3D en direct d\u00e8s que le d\u00e9cor est pr\u00eat : l'animation ne d\u00e9marre qu'\u00e0 ce moment-l\u00e0, le passage est donc invisible.
      let alive = true, s = 120, last = performance.now(), t0 = null, first = null; const tag = $('.route-3d-tag', m);
      const loop = now => {
        if (!alive || !c.isConnected) return;
        const dt = Math.min(0.05, (now - last) / 1000); last = now;
        sc.update(s, 900, 120);
        if (t0 === null) { if (sc.chunks.size && first === null) first = now; // pr\u00eat : d\u00e9cor proche et horizon re\u00e7us (ou 0,8 s apr\u00e8s le premier tron\u00e7on)
          if (first !== null && window.__vvPoster && !sc.busy()) window.__vvPreviewReady = true; // fabrication des images d'aper\u00e7u (scripts) : on reste au d\u00e9part
          else if (first !== null && (!sc.busy() || now - first > 800)) { t0 = now + 600; /* immobile pendant le fondu : la 3D recouvre exactement l'image */ c.classList.add('on'); if (tag) tag.textContent = 'Aper\u00e7u en direct'; window.__vvPreviewReady = true; } }
        else if (now > t0) { s += 11 * dt; if (s > Math.min(w.length - 50, 3000)) s = 120; }
        const p = VVWorld.at(w, s), b = VVWorld.at(w, s - 14), t = t0 === null ? 0 : Math.max(0, now - t0) / 1000;
        const cam = [b.x - Math.sin(p.heading) * 6 + Math.cos(t * 0.2) * 3, b.y + 5 + Math.sin(t * 0.3), b.z + Math.cos(p.heading) * 6];
        R.begin(M.lookAt(cam, [p.x + Math.cos(p.heading) * 10, p.y + 1, p.z + Math.sin(p.heading) * 10]), 0.9);
        sc.draw(cam);
        meM.draw(VVWorld.placeOn(w, s, 1).m, s / 0.34, s / 0.34 / 3);
        bots.forEach((bm, k) => { const ss = s + 5 + k * 3.5; bm.draw(VVWorld.placeOn(w, ss, k % 2 ? -1.2 : 1.6).m, ss / 0.34, ss / 0.34 / 3 + k); });
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
      stopViews.push(() => { alive = false; sc.dispose(); meM.dispose(); bots.forEach(b => b.dispose()); });
    },
  };
});

/* ---------- Rouler ensemble : sorties entre amis et courses multijoueurs (m\u00eame syst\u00e8me de salons) ---------- */
const fmtMs = t => { if (t === null || t === undefined) return '\u2014'; const s = t / 1000, h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return (h ? h + ':' + String(m).padStart(2, '0') + ':' : m + ':') + x.toFixed(1).padStart(4, '0').replace('.', ','); };
const MODE_LABEL = { ride: 'Sortie entre amis', race: 'Course multijoueur' };
const ACCESS_OPTS = [['friends', 'Mes amis et mes invit\u00e9s (priv\u00e9e)'], ['approval', 'Sur acceptation : je valide chaque demande'], ['code', 'Toute personne qui a le code ou le lien']];
// Message clair pour chaque refus du serveur (aper\u00e7u avant de rejoindre)
const CAN_MSG = { ended: 'Cette session est termin\u00e9e.', full: 'Cette session est compl\u00e8te.', mp_private: 'Session priv\u00e9e : seuls les amis de l\u2019organisateur et les personnes invit\u00e9es peuvent la rejoindre.',
  mp_race_started: 'Cette course a d\u00e9j\u00e0 commenc\u00e9 : on ne peut plus la rejoindre.', mp_race_left: 'Tu as quitt\u00e9 cette course apr\u00e8s le d\u00e9part : tu ne peux plus y revenir.', forbidden: 'L\u2019organisateur t\u2019a retir\u00e9 de cette session : tu ne peux plus la rejoindre.' };
async function joinByCode(code) {
  const p = await api('GET', '/mp/sessions/' + code);
  if (p.member || p.pending) return { go: rideUrl(code, p.session.routeId), p };
  if (p.can !== 'ok' && p.can !== 'approval') throw new Error(CAN_MSG[p.can] || 'Tu ne peux pas rejoindre cette session.');
  await api('POST', `/mp/sessions/${code}/join`);
  return { go: rideUrl(code, p.session.routeId), p };
}
function sessionSummary(s, extra = '') {
  return html`<div class="ens-sum"><span class="pill ${s.mode === 'race' ? 'warn' : 'cyan'}">${MODE_LABEL[s.mode] || 'Sortie'}</span> <b>${s.title || s.routeName}</b>
    <span class="muted">${s.title ? s.routeName + ' \u00b7 ' : ''}${s.mode === 'race' && s.raceM ? nf(s.raceM / 1000, 1) + ' km \u00b7 ' : ''}${s.accessLabel} \u00b7 ${s.maxPlayers} places${extra}</span></div>`;
}
route('/ensemble', async (p, qs) => {
  const [, RST, mine, races, fr] = await Promise.all([loadWorld(), routeStatus(), api('GET', '/mp/mine').catch(() => ({})), api('GET', '/races/mine').catch(() => ({ items: [] })), api('GET', '/friends').catch(() => ({ friends: [] }))]);
  const routesOk = VVWorld.ROUTES.filter(r => !(RST[r.id] && RST[r.id].enabled === false));
  const pre = qs.get('parcours'), type = qs.get('type') === 'race' ? 'race' : 'ride';
  const opts = html`${routesOk.map(r => html`<option value="${r.id}" ${r.id === pre ? 'selected' : ''}>${r.name} \u2014 ${r.km} km</option>`)}`;
  const accSel = def => html`<select class="input" name="access">${ACCESS_OPTS.map(([v, l]) => html`<option value="${v}" ${v === def ? 'selected' : ''}>${l}</option>`)}</select>`;
  const plSel = html`<select class="input" name="maxPlayers">${[2, 3, 4, 5, 6, 7, 8].map(n => html`<option value="${n}" ${n === 8 ? 'selected' : ''}>${n} participants au maximum</option>`)}</select>`;
  const cur = mine.session;
  return {
    title: 'Rouler ensemble',
    html: html`<div class="wrap page"><div class="page-h"><div><h1>Rouler ensemble</h1><p>Sortie entre amis ou course multijoueur : chacun roule chez soi sur son home trainer et voit les autres dans le m\u00eame monde 3D. Le salon, les acc\u00e8s et le classement sont g\u00e9r\u00e9s par le serveur CycleRush.</p></div><a class="btn" href="/segments">Segments et records</a></div>
      ${cur ? html`<div class="alert info ens-cur">Tu es dans ${cur.mode === 'race' ? 'la course' : 'la sortie'} <b class="num">${cur.code}</b> (${cur.routeName})${cur.pending ? ' \u2014 en attente de l\u2019accord de l\u2019organisateur' : ''}. <a class="btn sm primary" href="${rideUrl(cur.code, cur.routeId)}" data-external>${cur.pending ? 'Ouvrir le salon' : 'Revenir dans la session'}</a></div>` : ''}
      <div class="tabs" role="tablist" aria-label="Type de session"><button role="tab" data-t="ride" aria-selected="${type === 'ride'}">Sortie entre amis</button><button role="tab" data-t="race" aria-selected="${type === 'race'}">Course multijoueur</button><button role="tab" data-t="join" aria-selected="false">Rejoindre avec un code</button></div>
      <div class="grid split ens-grid">
        <section class="card ens-pane" data-p="ride" ${type === 'ride' ? '' : 'hidden'}><h2>Cr\u00e9er une sortie entre amis</h2><p class="muted">Pas de chrono ni de classement : vous roulez ensemble. Les participants se retrouvent dans le salon et tu lances la sortie quand tout le monde est l\u00e0.</p>
          <form class="ens-form" data-mode="ride"><div class="field"><label>Parcours</label><select class="input" name="routeId">${opts}</select></div>
            <div class="field"><label>Nom de la sortie (facultatif)</label><input class="input" name="title" maxlength="60" placeholder="Ex. Sortie du dimanche"></div>
            <div class="field"><label>Qui peut entrer ?</label>${accSel('friends')}</div><div class="field"><label>Participants</label>${plSel}</div>
            <p class="mp-err" role="alert" hidden></p><button class="btn primary" type="submit">Cr\u00e9er le salon</button></form></section>
        <section class="card ens-pane" data-p="race" ${type === 'race' ? '' : 'hidden'}><h2>Cr\u00e9er une course multijoueur</h2><p class="muted">D\u00e9part commun apr\u00e8s un compte \u00e0 rebours, classement en direct avec les \u00e9carts, temps officiels mesur\u00e9s par le serveur, r\u00e9sultats et historique. Bonus de pi\u00e8ces et d\u2019XP si ta sortie est valid\u00e9e (home trainer) et qu\u2019au moins deux coureurs prennent le d\u00e9part.</p>
          <form class="ens-form" data-mode="race"><div class="field"><label>Parcours</label><select class="input" name="routeId">${opts}</select></div>
            <div class="field"><label>Distance de la course (km)</label><input class="input num" name="raceKm" type="number" min="2" step="0.5" placeholder="Parcours complet"><small class="muted" data-max></small></div>
            <div class="field"><label>Qui peut entrer ?</label>${accSel('code')}</div><div class="field"><label>Participants</label>${plSel}</div>
            <p class="mp-err" role="alert" hidden></p><button class="btn primary" type="submit">Cr\u00e9er la course</button></form></section>
        <section class="card ens-pane" data-p="join" hidden><h2>Rejoindre avec un code</h2><p class="muted">Saisis les 6 caract\u00e8res re\u00e7us (ou ouvre le lien d\u2019invitation). L\u2019acc\u00e8s est v\u00e9rifi\u00e9 par le serveur.</p>
          <form id="ensJoin" class="mp-join"><input class="input num" id="ensCode" maxlength="7" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="EX. K7Q2MP" aria-label="Code de la session" required><button class="btn" type="button" id="ensPeek">V\u00e9rifier</button></form>
          <div id="ensPeekOut"></div></section>
        <section class="card" id="ensMade" hidden></section>
        <section class="card"><h2>Mes courses</h2>${races.items.length ? html`<div class="tbl-wrap"><table class="br-tbl"><thead><tr><th>Date</th><th>Parcours</th><th>Place</th><th>Temps</th><th>Bonus</th></tr></thead><tbody>
          ${races.items.map(r => html`<tr><td>${r.startAt ? dateShort(r.startAt) : '\u2014'}</td><td>${r.routeName} <span class="muted">${nf(r.raceM / 1000, 1)} km</span></td><td class="num">${r.status === 'finished' ? html`<b>${r.place}</b>/${r.of}` : 'Non class\u00e9'}</td><td class="num">${r.status === 'finished' ? fmtMs(r.finishMs) : '\u2014'}</td><td>${r.bonusCoins ? coin(r.bonusCoins) : r.status === 'finished' && !r.verified ? html`<span class="pill">non v\u00e9rifi\u00e9</span>` : '\u2014'}</td></tr>`)}</tbody></table></div>` : html`<div class="empty">Aucune course termin\u00e9e pour l\u2019instant.</div>`}</section>
      </div></div>`,
    mount: m => {
      const tabs = $$('[role=tab]', m), panes = $$('.ens-pane', m);
      tabs.forEach(t => t.onclick = () => { tabs.forEach(x => x.setAttribute('aria-selected', x === t)); panes.forEach(p => p.hidden = p.dataset.p !== t.dataset.t); });
      const rf = $('.ens-form[data-mode=race]', m), maxTxt = () => { const r = VVWorld.byId(rf.routeId.value); if (!r) return; rf.raceKm.max = r.km; $('[data-max]', rf).textContent = 'De 2 \u00e0 ' + r.km + ' km (vide = parcours complet).'; };
      if (rf) { rf.routeId.onchange = maxTxt; maxTxt(); }
      const made = $('#ensMade', m);
      function showMade(s) {
        const url = location.origin + rideUrl(s.code, s.routeId);
        made.hidden = false;
        made.innerHTML = out(html`<h2>Salon cr\u00e9\u00e9</h2>${sessionSummary(s)}<div class="mp-code"><span class="muted">Code</span><b class="num">${s.code}</b></div>
          <div class="mp-acts"><button class="btn sm" id="ensCopy" type="button">Copier le lien d\u2019invitation</button><a class="btn primary" href="${rideUrl(s.code, s.routeId)}" data-external>Entrer dans le salon</a></div>
          <h3 style="margin:14px 0 6px">Inviter des amis</h3>${fr.friends.length ? html`<p class="muted" style="margin:0 0 8px">Ils re\u00e7oivent une notification et peuvent entrer m\u00eame si le salon est priv\u00e9.</p><ul class="ens-inv">${fr.friends.map(f => html`<li><span>${f.username}</span><button class="btn sm" data-inv="${f.username}" type="button">Inviter</button></li>`)}</ul>` : html`<p class="muted">Ajoute des amis pour les inviter directement, ou partage le lien.</p>`}`);
        $('#ensCopy', made).onclick = async () => { try { await navigator.clipboard.writeText(url); toast('Lien copi\u00e9.'); } catch { toast('Copie impossible : le code est ' + s.code + '.', 'bad'); } };
        $$('[data-inv]', made).forEach(b => b.onclick = async () => { b.disabled = true; try { await api('POST', `/mp/sessions/${s.code}/invite`, { username: b.dataset.inv }); b.textContent = 'Invit\u00e9 \u2713'; } catch (e) { toast(e.message, 'bad'); b.disabled = false; } });
        made.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      $$('.ens-form', m).forEach(f => f.onsubmit = async e => {
        e.preventDefault(); const btn = $('button[type=submit]', f), err = $('.mp-err', f); err.hidden = true; btn.disabled = true;
        const body = { routeId: f.routeId.value, mode: f.dataset.mode, access: f.access.value, maxPlayers: Number(f.maxPlayers.value) };
        if (f.title && f.title.value.trim()) body.title = f.title.value.trim();
        if (f.raceKm && f.raceKm.value) body.raceKm = Number(f.raceKm.value);
        try { const d = await api('POST', '/mp/sessions', body); showMade(d.session); } catch (x) { err.textContent = x.message; err.hidden = false; }
        btn.disabled = false;
      });
      const inp = $('#ensCode', m), outp = $('#ensPeekOut', m);
      inp.oninput = () => { inp.value = inp.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6); outp.innerHTML = ''; };
      const peek = async () => {
        const code = inp.value; if (code.length !== 6) { outp.innerHTML = out(html`<p class="mp-err">Le code contient 6 caract\u00e8res (lettres et chiffres).</p>`); return; }
        try {
          const d = await api('GET', '/mp/sessions/' + code), s = d.session;
          const ok = d.member || d.pending || d.can === 'ok' || d.can === 'approval';
          outp.innerHTML = out(html`${sessionSummary(s, ' \u00b7 ' + d.count + ' inscrit' + (d.count > 1 ? 's' : ''))}<p class="muted" style="margin:6px 0">Organis\u00e9 par ${d.hostName || '\u2014'}${s.phase === 'lobby' ? ' \u00b7 en attente du d\u00e9part' : s.phase === 'running' ? ' \u00b7 en cours' : ''}</p>
            ${ok ? html`<button class="btn primary" id="ensGo" type="button">${d.member ? 'Revenir dans la session' : d.pending ? 'Voir ma demande' : d.can === 'approval' ? 'Demander \u00e0 entrer' : 'Rejoindre'}</button>` : html`<p class="mp-err">${CAN_MSG[d.can] || 'Tu ne peux pas rejoindre cette session.'}</p>`}`);
          const g = $('#ensGo', outp); if (g) g.onclick = async () => { g.disabled = true; try { const r = await joinByCode(code); location.href = r.go; } catch (x) { toast(x.message, 'bad'); g.disabled = false; } };
        } catch (x) { outp.innerHTML = out(html`<p class="mp-err">${x.message}</p>`); }
      };
      $('#ensPeek', m).onclick = peek; $('#ensJoin', m).onsubmit = e => { e.preventDefault(); peek(); };
      const c0 = qs.get('code'); if (c0) { tabs[2].click(); inp.value = c0.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6); peek(); }
    },
  };
}, { auth: true });

/* ---------- Segments chronom\u00e9tr\u00e9s, classements et records ---------- */
const KIND_ICON = { climb: '\u26f0', fast: '\u26a1', branch: '\u21b3' };
route('/segments', async (p, qs) => {
  await loadWorld();
  const id = qs.get('id');
  if (id) {
    const d = await api('GET', '/segments/' + encodeURIComponent(id)), s = d.segment;
    return {
      title: s.name,
      html: html`<div class="wrap page"><p style="margin:0"><a href="/segments?parcours=${s.routeId}">\u2190 Segments de ${s.routeName}</a></p>
        <div class="page-h"><div><span class="tag">${s.kindLabel}</span><h1>${s.name}</h1><p>${s.routeName} \u00b7 ${nf(s.len / 1000, 2)} km \u00b7 pente moyenne ${nf(s.grade, 1)} %${s.dplus ? ' \u00b7 ' + nf(s.dplus) + ' m D+' : ''} \u00b7 ${s.road < 0 ? 'route principale, du km ' + nf(s.sA / 1000, 2) + ' au km ' + nf(s.sB / 1000, 2) : 'route secondaire, depuis l\u2019embranchement du km ' + nf(s.mainA / 1000, 1)}</p></div>
          <a class="btn primary" href="ride.html?seg=${encodeURIComponent(s.id)}#${s.routeId}" data-external>Tenter ce segment (d\u00e9part du parcours)</a></div>
        <div class="facts"><div><span>Mon record</span><b class="num">${d.me ? fmtMs(d.me.timeMs) : '\u2014'}</b></div><div><span>Ma place</span><b class="num">${d.me ? d.me.rank + ' / ' + d.riders : '\u2014'}</b></div><div><span>Record du segment</span><b class="num">${d.board[0] ? fmtMs(d.board[0].timeMs) : '\u2014'}</b></div><div><span>Tentatives enregistr\u00e9es</span><b class="num">${nf(d.efforts)}</b></div></div>
        <div class="grid split">
          <section class="card"><h2>Classement</h2>${d.board.length ? html`<div class="tbl-wrap"><table class="br-tbl"><thead><tr><th>#</th><th>Cycliste</th><th>Temps</th><th>Vitesse</th><th>Puissance</th><th>Date</th></tr></thead><tbody>
            ${d.board.map(r => html`<tr class="${r.me ? 'me' : ''}"><td class="num">${r.rank}</td><td><a href="/u/${encodeURIComponent(r.username)}">${r.username}</a></td><td class="num"><b>${fmtMs(r.timeMs)}</b></td><td class="num">${nf(r.kmh, 1)} km/h</td><td class="num">${r.power ? r.power + ' W' : '\u2014'}</td><td>${dateShort(r.at)}</td></tr>`)}</tbody></table></div>` : html`<div class="empty">Aucun temps enregistr\u00e9 : sois le premier !</div>`}</section>
          <section class="card"><h2>Mes derni\u00e8res tentatives</h2>${d.recent.length ? html`<ul class="seg-rec">${d.recent.map(r => html`<li><b class="num">${fmtMs(r.timeMs)}</b><span class="muted">${nf(r.kmh, 1)} km/h${r.power ? ' \u00b7 ' + r.power + ' W' : ''} \u00b7 ${date(r.at)}</span>${r.valid ? '' : html`<span class="pill bad">sortie invalid\u00e9e</span>`}</li>`)}</ul>` : html`<div class="empty">Pas encore de tentative.</div>`}
            <p class="example">Un temps n\u2019est enregistr\u00e9 que pendant une sortie suivie par le serveur, avec un home trainer ou un capteur de puissance. Le serveur horodate le d\u00e9part et l\u2019arriv\u00e9e et refuse les temps incoh\u00e9rents (chronom\u00e8tre diff\u00e9rent de son horloge, vitesse impossible). Il ne peut pas prouver qu\u2019un capteur n\u2019a pas \u00e9t\u00e9 trafiqu\u00e9.</p></section>
        </div></div>`,
    };
  }
  const RT = VVWorld.ROUTES, sel = qs.get('parcours') && VVWorld.byId(qs.get('parcours')) ? qs.get('parcours') : RT[0].id;
  const d = await api('GET', '/segments?route=' + sel);
  return {
    title: 'Segments et records',
    html: html`<div class="wrap page"><div class="page-h"><div><h1>Segments et records</h1><p>Des portions chronom\u00e9tr\u00e9es sur chaque parcours : mont\u00e9es, portions rapides et routes secondaires. Le chrono part tout seul quand tu passes la ligne de d\u00e9part, et ton record personnel est conserv\u00e9 sur ton compte.</p></div><a class="btn" href="/ensemble">Rouler ensemble</a></div>
      <div class="tabs" role="tablist" aria-label="Parcours">${RT.map(r => html`<a class="btn sm ${r.id === sel ? 'primary' : ''}" role="tab" aria-selected="${r.id === sel}" href="/segments?parcours=${r.id}">${r.name}</a>`)}</div>
      <section class="card"><div class="tbl-wrap"><table class="br-tbl seg-tbl"><thead><tr><th>Segment</th><th>Type</th><th>Distance</th><th>Pente</th><th>Record</th><th>Mon record</th><th>Tentatives</th><th></th></tr></thead><tbody>
        ${d.items.map(s => html`<tr><td><i class="seg-dot" style="background:${VVWorld.SEG_STYLE[s.kind].color}"></i><a href="/segments?id=${encodeURIComponent(s.id)}"><b>${s.name}</b></a><br><span class="muted">${s.road < 0 ? 'km ' + nf(s.sA / 1000, 1) + ' \u2192 ' + nf(s.sB / 1000, 1) : 'route secondaire (km ' + nf(s.mainA / 1000, 1) + ')'}</span></td>
          <td>${KIND_ICON[s.kind]} ${s.kindLabel}</td><td class="num">${nf(s.len / 1000, 2)} km</td><td class="num">${nf(s.grade, 1)} %</td>
          <td class="num">${s.leader ? html`<b>${fmtMs(s.leader.timeMs)}</b><br><span class="muted">${s.leader.username}</span>` : '\u2014'}</td>
          <td class="num">${s.mine ? html`<b>${fmtMs(s.mine.timeMs)}</b><br><span class="muted">${dateShort(s.mine.at)}</span>` : '\u2014'}</td><td class="num">${nf(s.efforts)}</td>
          <td><a class="btn sm" href="ride.html?seg=${encodeURIComponent(s.id)}#${s.routeId}" data-external>Tenter</a></td></tr>`)}</tbody></table></div></section>
      <p class="example">Pour qu\u2019un temps compte, il faut partir de la ligne de d\u00e9part du parcours (le serveur v\u00e9rifie la distance r\u00e9ellement roul\u00e9e). Le classement garde le meilleur temps de chaque cycliste. Seuls les temps r\u00e9alis\u00e9s pendant une sortie suivie par le serveur et mesur\u00e9e par un home trainer ou un capteur sont accept\u00e9s.</p></div>`,
  };
}, { auth: true });

route('.*', async () => ({ title: 'Page introuvable', html: html`<div class="wrap page"><h1>Page introuvable</h1><p class="muted">Cette page n\u2019existe pas ou a \u00e9t\u00e9 d\u00e9plac\u00e9e.</p><p><a class="btn primary" href="/">Retour \u00e0 l\u2019accueil</a></p></div>` }), { notFound: true });

/* ---------- Pr\u00e9sence ---------- */
// Tant que l'onglet est visible, un petit signal toutes les 90 s garde le compte \u00ab connect\u00e9 \u00bb c\u00f4t\u00e9 serveur
// et met \u00e0 jour le nombre de notifications non lues.
setInterval(async () => {
  if (!state.user || document.visibilityState !== 'visible') return;
  try { const d = await api('GET', '/auth/me'); if (d.user) { const changed = d.unread !== state.unread; state.user = d.user; state.unread = d.unread; if (changed) renderNav(); } } catch {}
}, 90000);

/* ---------- D\u00e9marrage ---------- */
(async () => {
  readVVHash();
  try { history.replaceState({ vv: VL.pathname + VL.search }, ''); } catch {}
  const [, info] = await Promise.all([loadMe(), api('GET', '/public/info').catch(() => ({}))]);
  state.info = info || {};
  renderFooter();
  render();
})();

// Application installable (\u00e9cran d'accueil Android, version Google Play) : service worker sans cache de l'API.

