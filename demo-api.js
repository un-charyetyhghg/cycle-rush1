// CycleRush \u2014 API de d\u00e9monstration qui tourne dans le navigateur (aucun serveur).
// Imite l'API r\u00e9elle : m\u00eames routes, m\u00eames r\u00e8gles de droits et de confidentialit\u00e9.
// Les donn\u00e9es restent dans ce navigateur (localStorage) et peuvent \u00eatre r\u00e9initialis\u00e9es.
(function () {
  const KEY = 'vv_demo_db_v3', SKEY = 'vv_demo_session_v1';
  const now = () => new Date().toISOString();
  const daysAgo = (d, h = 9) => { const x = new Date(); x.setDate(x.getDate() - d); x.setHours(h, 0, 0, 0); return x.toISOString(); };
  const ROLE_LEVEL = { user: 0, moderator: 1, admin: 2, superadmin: 3 };
  const ROLE_LABEL = { user: 'Utilisateur', moderator: 'Mod\u00e9rateur', admin: 'Administrateur', superadmin: 'Super-administrateur' };
  const PERMS = { 'admin.access': 1, 'reports.view': 1, 'reports.handle': 1, 'users.suspend': 1, 'audit.moderation': 1, 'users.basic': 1, 'users.view': 2, 'users.manage': 2, 'content.manage': 2, 'settings.general': 2, 'stats.view': 2, 'audit.view': 2, 'roles.manage': 3, 'settings.sensitive': 3 };
  const ADMIN_EMAILS = ['julientruffautroche@gmail.com'];
  const staffAllowed = u => !!u && !!u.email_verified_at && ADMIN_EMAILS.includes(String(u.email).toLowerCase());
  const can = (u, p) => !!u && ROLE_LEVEL[u.role] >= PERMS[p] && (PERMS[p] === 0 || !!u.email_verified_at);
  const MOD_ACTIONS = ['report.status', 'report.note', 'report.resolve', 'user.suspend', 'user.reactivate', 'activity.hide', 'activity.unhide'];
  const METRIC_LABEL = { distance: 'km', elevation: 'm de d\u00e9nivel\u00e9', duration: 'min', count: 'sorties' };
  const SETTINGS = { registration_open: true, maintenance_message: '', contact_email: '', session_days: 30, require_verified_email_for_login: false };
  const SENSITIVE = ['session_days', 'require_verified_email_for_login'];

  class E extends Error { constructor(status, msg, code = 'invalid', extra = {}) { super(msg); this.status = status; this.code = code; this.extra = extra; } }
  const bad = (m, f) => new E(400, m, 'invalid', f ? { field: f } : {});
  const forbidden = (m = 'Tu n\u2019as pas les droits pour faire cela.') => new E(403, m, 'forbidden');
  const notFound = (m = 'Introuvable.') => new E(404, m, 'not_found');

  /* ---------- Donn\u00e9es ---------- */
  function seed() {
    const db = { seq: 100, ledger: [], items: [], users: [], activities: [], friendships: [], reactions: [], challenges: [], parts: [], goals: [], feed: [], notifs: [], invites: [], reports: [], notes: [], audit: [], announcements: [], settings: { ...SETTINGS }, sessions: {} };
    const u = (id, username, bio, extra = {}) => db.users.push({ id, username, email: username.replace(/[^a-z]/g, '') + '@exemple.demo', pw: null, role: 'user', status: 'active', status_reason: null, suspended_until: null, email_verified_at: daysAgo(40), bio, avatar: null, profile_visibility: 'public', activity_visibility: 'public', searchable: true, created_at: daysAgo(40 - id), last_seen_at: daysAgo(1), demo: true, xp: [0, 2650, 1480, 820][id], coins: [0, 210, 95, 60][id], equipped_frame: id === 1 ? 'frame-or' : null, equipped_title: id === 1 ? 'title-grimpeur' : null, equipped_bike: id === 2 ? 'bike-rouge-carbone' : null, rider_config: [null, { skin: 's2', helmet: 'route', helmetColor: '#ffffff', jerseyPattern: 'col', jerseyColor: '#ec4899', jerseyColor2: '#111827', shortsColor: '#111827', socks: 'hautes', socksColor: '#ffffff', shoesColor: '#ffffff', glasses: 'miroir', gloves: 'aucun' }, { skin: 's4', helmet: 'aero', helmetColor: '#facc15', jerseyPattern: 'bicolore', jerseyColor: '#facc15', jerseyColor2: '#111827', shortsColor: '#111827', socks: 'courtes', socksColor: '#111827', shoesColor: '#111827', glasses: 'noires', gloves: '#111827' }, null][id], bike_config: [null, { model: 'grimpeur', frameColor: '#ffffff', accentColor: '#ec4899', wheels: 'bas', rimColor: '#111827', tyres: 'noir', tapeColor: '#ffffff', saddleColor: '#111827' }, { model: 'aero', frameColor: '#111827', accentColor: '#facc15', wheels: 'haut', rimColor: '#111827', tyres: 'noir', tapeColor: '#111827', saddleColor: '#111827' }, null][id], ...extra });
    u(1, 'lea_grimpe', 'Compte de d\u00e9monstration. Fan de cols et de longues mont\u00e9es.');
    u(2, 'tom_watts', 'Compte de d\u00e9monstration. Sprints et s\u00e9ances au home trainer.', { activity_visibility: 'friends' });
    u(3, 'nina.velo', 'Compte de d\u00e9monstration. Sorties du dimanche au bord du lac.');
    const act = (uid, title, d, dur, km, dp, w, src = 'manual') => { const a = { id: ++db.seq, user_id: uid, title, source: src, started_at: daysAgo(d, 8 + (db.seq % 9)), duration_s: dur, distance_m: km * 1000, elevation_m: dp, avg_power: w, avg_hr: null, tss: null, hidden: false, created_at: daysAgo(d, 18) }; db.activities.push(a); db.feed.push({ id: ++db.seq, user_id: uid, kind: 'activity', activity_id: a.id, data: {}, created_at: a.created_at }); return a; };
    act(1, 'Col de la Croix', 2, 9000, 68, 1350, 205); act(1, 'R\u00e9cup au bord de l\u2019eau', 6, 3600, 28, 120, 140); act(1, 'Tour des cr\u00eates', 13, 12600, 92, 1800, 198);
    act(2, 'Sweet Spot 2\u00d715', 1, 3180, 31, 0, 232, 'home-trainer'); act(2, 'VO2max 5\u00d73', 4, 3000, 27, 0, 218, 'home-trainer'); act(2, 'Sortie club', 9, 10800, 95, 900, 210);
    act(3, 'Boucle du lac', 3, 5400, 41, 280, 160); act(3, 'Balade du dimanche', 10, 7200, 52, 410, 150);
    db.friendships.push({ id: ++db.seq, requester_id: 1, addressee_id: 2, status: 'accepted', created_at: daysAgo(20), responded_at: daysAgo(19) });
    const s = new Date(); s.setDate(1); s.setHours(0, 0, 0, 0); const e = new Date(s); e.setMonth(e.getMonth() + 1);
    db.challenges.push({ id: ++db.seq, title: '300 km ce mois-ci', description: 'Accumule 300 km avant la fin du mois, sur la route ou au home trainer.', metric: 'distance', target: 300, starts_at: s.toISOString(), ends_at: e.toISOString(), published: true, created_by: null, created_at: daysAgo(15) });
    const s2 = new Date(); s2.setDate(s2.getDate() - ((s2.getDay() + 6) % 7)); s2.setHours(0, 0, 0, 0); const e2 = new Date(s2); e2.setDate(e2.getDate() + 7);
    db.challenges.push({ id: ++db.seq, title: 'Semaine des grimpeurs', description: 'Grimpe 2 000 m de d\u00e9nivel\u00e9 cette semaine.', metric: 'elevation', target: 2000, starts_at: s2.toISOString(), ends_at: e2.toISOString(), published: true, created_by: null, created_at: daysAgo(3) });
    db.parts.push({ challenge_id: db.challenges[0].id, user_id: 1, joined_at: daysAgo(10), completed_at: null });
    db.reports.push({ id: ++db.seq, reporter_id: 3, target_type: 'user', target_id: 2, target_user_id: 2, reason: 'spam', details: 'Exemple de signalement pour d\u00e9couvrir la mod\u00e9ration.', status: 'pending', decision: null, decision_reason: null, assigned_to: null, resolved_by: null, created_at: daysAgo(1), updated_at: daysAgo(1) });
    return db;
  }
  let db;
  try { db = JSON.parse(localStorage.getItem(KEY)); } catch {}
  if (!db) { db = seed(); db.fresh = true; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch {} };
  const id = () => ++db.seq;
  window.vvDemoReset = () => { try { localStorage.removeItem(KEY); localStorage.removeItem(SKEY); } catch {} db = seed(); save(); };

  const sha = async s => { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('veloverse-demo:' + s)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); };
  const byId = i => db.users.find(u => u.id === Number(i));
  const byName = n => db.users.find(u => u.username.toLowerCase() === String(n || '').toLowerCase());
  const curUser = () => {
    let sid; try { sid = localStorage.getItem(SKEY); } catch {}
    const u = sid && db.sessions[sid] ? byId(db.sessions[sid]) : null;
    if (!u) return null;
    if (u.status === 'suspended' && u.suspended_until && new Date(u.suspended_until) <= new Date()) { u.status = 'active'; u.suspended_until = null; u.status_reason = null; }
    if (u.status !== 'active') { killSessions(u.id); return null; }
    u.last_seen_at = now();
    const to = staffAllowed(u) && u.email === ADMIN_EMAILS[0] && u.role !== 'superadmin' ? 'superadmin' : null;
    if (to) { audit({ username: 'syst\u00e8me', role: 'system' }, 'user.role', 'user', u.id, u.username, { from: u.role, to, via: 'ADMIN_EMAILS' }); u.role = to; }
    return u;
  };
  const killSessions = uid => { for (const k of Object.keys(db.sessions)) if (db.sessions[k] === uid) delete db.sessions[k]; };
  const login = uid => { const sid = Math.random().toString(36).slice(2) + Date.now(); db.sessions[sid] = uid; try { localStorage.setItem(SKEY, sid); } catch {} };
  const requireUser = u => { if (!u) throw new E(401, 'Ta session a expir\u00e9 ou tu n\u2019es pas connect\u00e9. Reconnecte-toi.', 'session_expired'); return u; };
  const requireVerified = u => { requireUser(u); if (!u.email_verified_at) throw new E(403, 'Confirme d\u2019abord ton adresse e-mail.', 'email_unverified'); };
  const requirePerm = (u, p) => { requireUser(u); if (!can(u, p)) throw forbidden(); };
  const requireOutranks = (a, t) => { if (a.id === t.id) throw forbidden('Tu ne peux pas faire cette action sur ton propre compte.'); if (a.role === 'superadmin') return; if (ROLE_LEVEL[a.role] <= ROLE_LEVEL[t.role]) throw forbidden('Ce compte a un r\u00f4le \u00e9gal ou sup\u00e9rieur au tien.'); };
  const selfView = u => ({ id: u.id, username: u.username, email: u.email, role: u.role, roleLabel: ROLE_LABEL[u.role], bio: u.bio, avatar: u.avatar, emailVerified: !!u.email_verified_at, createdAt: u.created_at, privacy: { profile: u.profile_visibility, activities: u.activity_visibility, searchable: u.searchable }, permissions: Object.keys(PERMS).filter(p => can(u, p)), rewards: rewardsView(u), rider: u.rider_config || null, bike: { ...DEF_BIKE, ...(u.bike_config || {}) }, prefs: u.prefs || {} });
  const notify = (uid, kind, data = {}) => db.notifs.push({ id: id(), user_id: uid, kind, data, read_at: null, created_at: now() });
  const audit = (a, action, tt, tid, label, details = {}) => db.audit.push({ id: id(), actor_id: a?.id ?? null, actor_name: a?.username ?? 'syst\u00e8me', actor_role: a?.role ?? 'system', action, target_type: tt ?? null, target_id: tid ?? null, target_label: label ?? null, details, created_at: now() });
  const pair = (a, b) => db.friendships.find(f => (f.requester_id === a && f.addressee_id === b) || (f.requester_id === b && f.addressee_id === a));
  const relation = (v, o) => { if (!v) return 'none'; if (v === o) return 'self'; const f = pair(v, o); if (!f) return 'none'; if (f.status === 'accepted') return 'friends'; return f.requester_id === v ? 'outgoing' : 'incoming'; };
  const visible = (lvl, rel) => rel === 'self' || lvl === 'public' || (lvl === 'friends' && rel === 'friends');
  const str = (v, name, min = 0, max = 500) => { const s = typeof v === 'string' ? v.trim() : ''; if (min && s.length < min) throw bad(`${name} doit contenir au moins ${min} caract\u00e8res.`); if (s.length > max) throw bad(`${name} ne peut pas d\u00e9passer ${max} caract\u00e8res.`); return s; };
  const int = (v, name, min, max, req = true) => { if (v === undefined || v === null || v === '') { if (req) throw bad(`${name} est obligatoire.`); return null; } const n = Number(v); if (!Number.isInteger(n) || n < min || n > max) throw bad(`${name} doit \u00eatre un nombre entier entre ${min} et ${max}.`); return n; };
  const checkPw = (pw, u) => { if (typeof pw !== 'string' || pw.length < 10) return 'Le mot de passe doit contenir au moins 10 caract\u00e8res.'; if (!/[A-Za-z\u00c0-\u00ff]/.test(pw) || !/\d/.test(pw)) return 'Le mot de passe doit contenir au moins une lettre et un chiffre.'; if (u && u.length >= 3 && pw.toLowerCase().includes(u.toLowerCase())) return 'Le mot de passe ne doit pas contenir ton nom d\u2019utilisateur.'; return null; };
  const paging = (qs, size = 20) => { const p = Math.max(1, Number(qs.get('page')) || 1); return { page: p, size, offset: (p - 1) * size }; };
  const pageOf = (arr, qs, size) => { const p = paging(qs, size); return { items: arr.slice(p.offset, p.offset + p.size), total: arr.length, page: p.page, pages: Math.max(1, Math.ceil(arr.length / p.size)), more: arr.length > p.offset + p.size }; };
  const card = (u, rel) => ({ id: u.id, username: u.username, avatar: u.avatar || null, rider: u.rider_config || null, relation: rel });

  const acts = uid => db.activities.filter(a => a.user_id === uid && !a.hidden);
  const sumOf = list => ({ rides: list.length, distance_m: list.reduce((s, a) => s + a.distance_m, 0), duration_s: list.reduce((s, a) => s + a.duration_s, 0), elevation_m: list.reduce((s, a) => s + a.elevation_m, 0) });
  const metric = (uid, m, from, to) => { const l = acts(uid).filter(a => a.started_at >= from && a.started_at < to); const v = m === 'distance' ? l.reduce((s, a) => s + a.distance_m, 0) / 1000 : m === 'elevation' ? l.reduce((s, a) => s + a.elevation_m, 0) : m === 'duration' ? l.reduce((s, a) => s + a.duration_s, 0) / 60 : l.length; return Math.round(v * 10) / 10; };
  const bounds = period => { const s = new Date(); s.setHours(0, 0, 0, 0); let e; if (period === 'week') { s.setDate(s.getDate() - ((s.getDay() + 6) % 7)); e = new Date(s); e.setDate(e.getDate() + 7); } else { s.setDate(1); e = new Date(s); e.setMonth(e.getMonth() + 1); } return { start: s.toISOString(), stop: e.toISOString(), key: period + s.toISOString().slice(0, 10) }; };
  const activityView = (a, viewer) => ({ ...a, reactions: db.reactions.filter(r => r.activity_id === a.id).length, reacted: !!db.reactions.find(r => r.activity_id === a.id && r.user_id === viewer) });
  const chView = c => ({ id: c.id, title: c.title, description: c.description, metric: c.metric, unit: METRIC_LABEL[c.metric], target: c.target, startsAt: c.starts_at, endsAt: c.ends_at, participants: db.parts.filter(p => p.challenge_id === c.id).length });
  const goalsOf = uid => db.goals.filter(g => g.user_id === uid).map(g => { const b = bounds(g.period); return { id: g.id, metric: g.metric, period: g.period, target: g.target, unit: METRIC_LABEL[g.metric], progress: metric(uid, g.metric, b.start, b.stop) }; });

  function checkAchievements(u) {
    for (const p of db.parts.filter(p => p.user_id === u.id && !p.completed_at)) {
      const c = db.challenges.find(c => c.id === p.challenge_id);
      if (!c || !c.published || new Date(c.ends_at) < new Date(Date.now() - 86400e3)) continue;
      if (metric(u.id, c.metric, c.starts_at, c.ends_at) >= c.target) { p.completed_at = now(); db.feed.push({ id: id(), user_id: u.id, kind: 'challenge_completed', activity_id: null, data: { title: c.title }, created_at: now() }); notify(u.id, 'challenge_completed', { title: c.title }); credit(u.id, 'challenge', RULES.challenge.xp, RULES.challenge.coins, 'D\u00e9fi r\u00e9ussi : ' + c.title); }
    }
    for (const g of db.goals.filter(g => g.user_id === u.id)) {
      const b = bounds(g.period);
      if (g.last_reached_period === b.key) continue;
      if (metric(u.id, g.metric, b.start, b.stop) >= g.target) { g.last_reached_period = b.key; const data = { metric: g.metric, period: g.period, target: g.target, unit: METRIC_LABEL[g.metric] }; db.feed.push({ id: id(), user_id: u.id, kind: 'goal_reached', activity_id: null, data, created_at: now() }); notify(u.id, 'goal_reached', data); credit(u.id, 'goal', RULES.goal.xp, RULES.goal.coins, `Objectif atteint : ${g.target} ${METRIC_LABEL[g.metric]}`); }
    }
  }
  const userRow = (u, a) => { const r = { online: Object.values(db.sessions).includes(u.id), id: u.id, username: u.username, role: u.role, roleLabel: ROLE_LABEL[u.role], status: u.status, statusReason: u.status_reason, suspendedUntil: u.suspended_until, createdAt: u.created_at, lastSeenAt: u.last_seen_at, emailVerified: !!u.email_verified_at, avatar: u.avatar, xp: u.xp || 0, coins: u.coins || 0, level: levelInfo(u.xp || 0).level }; if (can(a, 'users.view')) r.email = u.email; return r; };
  const deleteUser = uid => {
    const ids = new Set(db.activities.filter(a => a.user_id === uid).map(a => a.id));
    db.users = db.users.filter(u => u.id !== uid); db.activities = db.activities.filter(a => a.user_id !== uid);
    db.friendships = db.friendships.filter(f => f.requester_id !== uid && f.addressee_id !== uid);
    db.reactions = db.reactions.filter(r => r.user_id !== uid && !ids.has(r.activity_id));
    db.parts = db.parts.filter(p => p.user_id !== uid); db.goals = db.goals.filter(g => g.user_id !== uid);
    db.feed = db.feed.filter(f => f.user_id !== uid); db.ledger = db.ledger.filter(l => l.user_id !== uid); db.items = db.items.filter(i => i.user_id !== uid); db.notifs = db.notifs.filter(n => n.user_id !== uid); db.invites = db.invites.filter(i => i.inviter_id !== uid);
    for (const r of db.reports) { if (r.reporter_id === uid) r.reporter_id = null; if (r.target_user_id === uid) r.target_user_id = null; }
    killSessions(uid);
  };

  const DEF_RIDER = { skin: 's2', helmet: 'route', helmetColor: '#ffffff', jerseyPattern: 'bande', jerseyColor: '#22d3ee', jerseyColor2: '#111827', shortsColor: '#111827', socks: 'courtes', socksColor: '#ffffff', shoesColor: '#ffffff', glasses: 'noires', gloves: 'aucun' };
  const DEF_BIKE = { model: 'aero', frameColor: '#111827', accentColor: '#22d3ee', wheels: 'moyen', rimColor: '#111827', tyres: 'noir', tapeColor: '#111827', saddleColor: '#111827' };
  /* ---------- Pi\u00e8ces et XP ---------- */
  // M\u00eames bar\u00e8mes que server/rewards.mjs et server/levels.mjs
  const RULES = { activity: { xpPerKm: 12, xpPer100mDplus: 15, xpPerMinute: 1, maxXp: 2000, coinsPerRefKm: { km: 40, coins: 950 }, maxCoins: 4750 }, completion: { base: 50, perKm: 3, per100mDplus: 10, gradeDiv: 4, maxGradeBoost: 0.5, minShare: 0.98, perRoutePerDay: 1 }, dailyCap: { xp: 3000, coins: 7125 }, challenge: { xp: 500, coins: 100 }, goal: { xp: 200, coins: 40 } };
  const completionXp = rid => { const r = RROUTES[rid], C = RULES.completion; if (!r) return 0; const grade = r[2] / (r[1] * 10); return Math.round((C.base + C.perKm * r[1] + C.per100mDplus * r[2] / 100) * (1 + Math.min(C.maxGradeBoost, grade / C.gradeDiv))); };
  const routeXpTable = () => Object.keys(RROUTES).map(id => ({ id, name: RROUTES[id][0], xp: completionXp(id) })).sort((a, b) => a.xp - b.xp);
  const ITEMS = [
    { id: 'frame-cyan', kind: 'frame', name: 'Cadre Cyan', desc: 'Un liser\u00e9 cyan autour de ta photo.', price: 50, minLevel: 1 },
    { id: 'frame-turquoise', kind: 'frame', name: 'Cadre Turquoise', desc: 'Double anneau turquoise lumineux.', price: 120, minLevel: 2 },
    { id: 'frame-or', kind: 'frame', name: 'Cadre Or', desc: 'Pour celles et ceux qui roulent devant.', price: 300, minLevel: 4 },
    { id: 'frame-aurore', kind: 'frame', name: 'Cadre Aurore', desc: 'D\u00e9grad\u00e9 cyan, violet et rose.', price: 600, minLevel: 6 },
    { id: 'title-rouleur', kind: 'title', name: 'Rouleur', desc: 'Titre affich\u00e9 sous ton nom.', price: 80, minLevel: 1 },
    { id: 'title-grimpeur', kind: 'title', name: 'Grimpeur', desc: 'Titre affich\u00e9 sous ton nom.', price: 150, minLevel: 3 },
    { id: 'title-sprinteur', kind: 'title', name: 'Sprinteur', desc: 'Titre affich\u00e9 sous ton nom.', price: 150, minLevel: 3 },
    { id: 'bike-grimpeur', kind: 'bike', model: 'grimpeur', name: 'Grimpeur', desc: 'Cadre fin et l\u00e9ger, roues basses pour la montagne.', price: 800, minLevel: 1 },
    { id: 'bike-gravel', kind: 'bike', model: 'gravel', name: 'Gravel', desc: 'Pneus larges et cintre \u00e9vas\u00e9, pour tous les chemins.', price: 1200, minLevel: 1 },
    { id: 'bike-clm', kind: 'bike', model: 'clm', name: 'Contre-la-montre', desc: 'Prolongateurs et roue lenticulaire, pour rouler seul contre le chrono.', price: 2000, minLevel: 1 },
    { id: 'bike-rouge-carbone', kind: 'bike', model: 'rouge-carbone', name: 'Rouge Carbone', desc: 'V\u00e9lo de course en carbone rouge, freins \u00e0 disque et roues carbone.', price: 2800, minLevel: 1, image: 'img/velo-rouge.jpg' },
    { id: 'bike-givre-rouge', kind: 'bike', model: 'givre-rouge', name: 'Givre Rouge', desc: 'Cadre blanc qui vire au rouge, roues carbone hautes et flancs beiges.', price: 3200, minLevel: 1, image: 'img/velo-givre-rouge.jpg' },
    { id: 'bike-rubis', kind: 'bike', model: 'rubis', name: 'Rubis', desc: 'Cadre rouge vif, d\u00e9co noire, roues 45 mm.', price: 1500, minLevel: 1, image: 'img/velo-rubis.jpg' },
    { id: 'bike-celeste', kind: 'bike', model: 'celeste', name: 'C\u00e9leste', desc: 'Turquoise int\u00e9gral, d\u00e9co sombre, roues hautes.', price: 2500, minLevel: 1, image: 'img/velo-celeste.jpg' },
    { id: 'bike-flamme', kind: 'bike', model: 'flamme', name: 'Flamme', desc: 'D\u00e9grad\u00e9 orange et rouge, avant noir.', price: 3000, minLevel: 1, image: 'img/velo-flamme.jpg' },
    { id: 'bike-braise', kind: 'bike', model: 'braise', name: 'Braise', desc: 'Rouge qui s\u2019assombrit vers le noir, roues carbone \u00e0 motifs.', price: 4000, minLevel: 1, image: 'img/velo-braise.jpg' },
    { id: 'bike-neige', kind: 'bike', model: 'neige', name: 'Neige', desc: 'Blanc nacr\u00e9, d\u00e9co bleu nuit, flancs beiges.', price: 4200, minLevel: 1, image: 'img/velo-neige.jpg' },
    { id: 'bike-comete', kind: 'bike', model: 'comete', name: 'Com\u00e8te', desc: 'Blanc argent\u00e9, cockpit rouge en d\u00e9grad\u00e9, roues hautes.', price: 4500, minLevel: 1, image: 'img/velo-comete.jpg' },
    { id: 'bike-arlequin', kind: 'bike', model: 'arlequin', name: 'Arlequin', desc: 'Bleu roi, tube de selle rouge, tube horizontal jaune.', price: 4800, minLevel: 1, image: 'img/velo-arlequin.jpg' },
    { id: 'bike-soleil', kind: 'bike', model: 'soleil', name: 'Soleil', desc: 'Jaune int\u00e9gral, guidoline et selle jaunes, jantes \u00e0 motifs jaunes.', price: 5000, minLevel: 1, image: 'img/velo-soleil.jpg' },
    { id: 'bike-meteore', kind: 'bike', model: 'meteore', name: 'M\u00e9t\u00e9ore', desc: 'Gris pierre et rose vif, tige de selle dor\u00e9e.', price: 5500, minLevel: 1, image: 'img/velo-meteore.jpg' },
    { id: 'bike-contraste', kind: 'bike', model: 'contraste', name: 'Contraste', desc: 'A\u00e9ro noir mat, avant blanc, jantes \u00e0 grands motifs blancs.', price: 6000, minLevel: 1, image: 'img/velo-contraste.jpg' },
    { id: 'bike-grenat-cross', kind: 'bike', model: 'grenat-cross', name: 'Grenat Cross', desc: 'Cyclo-cross rouge qui plonge vers le noir, pneus \u00e0 crampons \u00e0 flancs beiges.', price: 3500, minLevel: 1, image: 'img/velo-grenat-cross.jpg' },
    { id: 'bike-prisme-or', kind: 'bike', model: 'prisme-or', name: 'Prisme Or', desc: 'Blanc nacr\u00e9, lettrage or, jantes blanches \u00e0 motifs g\u00e9om\u00e9triques dor\u00e9s.', price: 5200, minLevel: 1, image: 'img/velo-prisme-or.jpg' },
    { id: 'bike-lichen', kind: 'bike', model: 'lichen', name: 'Lichen', desc: 'Vert-de-gris satin\u00e9, lettrage argent, roues carbone hautes \u00e0 motifs sombres.', price: 4600, minLevel: 1, image: 'img/velo-lichen.jpg' },
    { id: 'bike-arc-en-ciel', kind: 'bike', model: 'arc-en-ciel', name: 'Arc-en-ciel', desc: 'Blanc, tube horizontal bleu ciel, filets aux couleurs arc-en-ciel, roues hautes \u00e0 lettrage blanc.', price: 6200, minLevel: 1, image: 'img/velo-arc-en-ciel.jpg' },
    { id: 'bike-citron-fluo', kind: 'bike', model: 'citron-fluo', name: 'Citron Fluo', desc: 'Jaune fluo qui plonge vers le noir, guidoline fluo, roues hautes \u00e0 bandeaux fluo.', price: 5400, minLevel: 1, image: 'img/velo-citron-fluo.jpg' },
    { id: 'bike-ivoire', kind: 'bike', model: 'ivoire', name: 'Ivoire', desc: 'Blanc mat, tige de selle noire, guidoline blanche, roues hautes \u00e0 grands motifs blancs.', price: 4400, minLevel: 1, image: 'img/velo-ivoire.jpg' },
    { id: 'bike-azur', kind: 'bike', model: 'azur', name: 'Azur', desc: 'Bleu ciel nacr\u00e9, lettrage noir, roues hautes \u00e0 grands motifs blancs.', price: 4700, minLevel: 1, image: 'img/velo-azur.jpg' },
    { id: 'bike-chrono-or', kind: 'bike', model: 'chrono-or', name: 'Chrono Or', desc: 'Contre-la-montre noir et or, roue lenticulaire, prolongateurs.', price: 6500, minLevel: 1, image: 'img/velo-chrono-or.jpg' },
    { id: 'bike-or-olympe', kind: 'bike', model: 'or-olympe', name: 'Or Olympe', desc: 'Cadre or et noir, roues hautes.', price: 7000, minLevel: 1 },
    { id: 'bike-nuit-polaire', kind: 'bike', model: 'nuit-polaire', name: 'Nuit Polaire', desc: 'Noir profond qui s\u2019illumine de cyan, jantes \u00e0 motifs.', price: 7500, minLevel: 1 },
    { id: 'bike-aurore', kind: 'bike', model: 'aurore', name: 'Aurore', desc: 'D\u00e9grad\u00e9 violet et rose, flancs beiges.', price: 8000, minLevel: 1 },
    { id: 'bike-legende', kind: 'bike', model: 'legende', name: 'L\u00e9gende', desc: 'Blanc et or, jantes dor\u00e9es : le v\u00e9lo des plus grands.', price: 9000, minLevel: 1 },
    { id: 'wheel-carbone67', kind: 'wheels', wheel: 'carbone67', name: 'Roues carbone 67 mm', desc: 'Jantes carbone tr\u00e8s hautes \u00e0 grands motifs blancs.', price: 1800, minLevel: 1, image: 'img/roues-carbone67.jpg' },
    { id: 'wheel-batons', kind: 'wheels', wheel: 'batons', name: 'Roues carbone 5 b\u00e2tons', desc: 'Roues \u00e0 cinq branches en carbone, pour le contre-la-montre et le style.', price: 2500, minLevel: 1, image: 'img/roues-batons.jpg' },
    { id: 'wheel-arcenciel45', kind: 'wheels', wheel: 'arcenciel45', name: 'Roues carbone 45 arc-en-ciel', desc: 'Jantes carbone 45 mm, grands motifs blancs et touches arc-en-ciel.', price: 1600, minLevel: 1, image: 'img/roues-arcenciel45.jpg' },
    { id: 'wheel-or60', kind: 'wheels', wheel: 'or60', name: 'Roues carbone 60 or', desc: 'Jantes carbone 60 mm alv\u00e9ol\u00e9es, grands motifs dor\u00e9s.', price: 2200, minLevel: 1, image: 'img/roues-or60.jpg' },
    { id: 'bike-eclair-blanc', kind: 'bike', model: 'eclair-blanc', name: '\u00c9clair Blanc', desc: 'Cadre a\u00e9ro blanc, tige de selle noire, roues hautes \u00e0 grands motifs blancs.', price: 3500, minLevel: 1, image: 'img/velo-eclair-blanc.jpg' },
    { id: 'title-legende', kind: 'title', name: 'L\u00e9gende de la route', desc: 'Le titre des plus endurants.', price: 1000, minLevel: 10 },
  ];
  const ITEM = Object.fromEntries(ITEMS.map(i => [i.id, i]));
  const SLOT = { frame: 'equipped_frame', title: 'equipped_title', bike: 'equipped_bike' };
  const bikeOf = i => ITEM[i] ? { id: i, name: ITEM[i].name, image: ITEM[i].image } : null;
  // Niveau n \u2192 n+1 : 200 + 40 \u00d7 (n \u2212 1) XP (server/levels.mjs)
  const needFor = n => 200 + 40 * (n - 1), xpFor = L => L <= 1 ? 0 : 200 * (L - 1) + 20 * (L - 1) * (L - 2);
  function levelInfo(xp) { xp = Math.max(0, Math.floor(xp || 0)); let level = 1; while (xpFor(level + 1) <= xp) level++; return { level, xp, levelStart: xpFor(level), nextLevelAt: xpFor(level) + needFor(level), intoLevel: xp - xpFor(level), levelSpan: needFor(level) }; }
  const nextMilestone = xp => { const lv = levelInfo(xp).level, next = Math.ceil((lv + 1) / 10) * 10; if (next > 100) return null; const from = xpFor(next - 10), at = xpFor(next); return { level: next, xpAt: at, remaining: Math.max(0, at - xp), pct: Math.max(0, Math.min(100, Math.round((xp - from) / (at - from) * 1000) / 10)) }; };
  const LEVEL_RULES = { base: 200, step: 40, table: [2, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(L => ({ level: L, xp: xpFor(L) })) };
  // Ancienne \u00e9chelle (500 + 250 \u00d7 (n \u2212 1)) : conversion unique des donn\u00e9es d\u00e9j\u00e0 enregistr\u00e9es dans ce navigateur (m\u00eame niveau, m\u00eame avancement)
  const OLD = { needFor: n => 500 + 250 * (n - 1), xpFor: L => L <= 1 ? 0 : 500 * (L - 1) + 125 * (L - 1) * (L - 2) };
  const oldLevel = xp => { let L = 1; while (OLD.xpFor(L + 1) <= xp) L++; return L; };
  const migrateXp = ox => { ox = Math.max(0, Math.floor(ox || 0)); const L = oldLevel(ox); return xpFor(L) + Math.min(needFor(L) - 1, Math.floor((ox - OLD.xpFor(L)) / OLD.needFor(L) * needFor(L))); };
  if (db.xpCurve !== 2) {
    for (const u of db.users) { const ox = u.xp || 0; if (!ox) continue; u.xp = migrateXp(ox); const L = oldLevel(ox);
      if (!db.fresh) db.ledger.push({ id: id(), user_id: u.id, kind: 'migration', activity_id: null, xp: 0, coins: 0, label: `Nouvelle \u00e9chelle des niveaux : niveau ${L} et ${Math.floor((ox - OLD.xpFor(L)) / OLD.needFor(L) * 100)} % du niveau conserv\u00e9s (${ox.toLocaleString('fr-FR')} XP de l\u2019ancienne \u00e9chelle \u2192 ${u.xp.toLocaleString('fr-FR')} XP)`, created_at: now() }); }
    for (const l of db.ledger) if (l.xp_curve == null) l.xp_curve = 1;
    db.xpCurve = 2; delete db.fresh; save();
  }
  // Paliers de niveau (m\u00eames r\u00e8gles que server/rewards.mjs)
  const MS = { every: 10, max: 100, coins: l => Math.round(300 + 40 * l + 0.4 * l * l), bikes: { 10: 'bike-rubis', 20: 'bike-celeste', 30: 'bike-flamme', 40: 'bike-braise', 50: 'bike-comete', 60: 'bike-soleil', 70: 'bike-meteore', 80: 'bike-chrono-or', 90: 'bike-nuit-polaire', 100: 'bike-legende' }, levelUpCoins: 50 };
  const msLevels = () => Array.from({ length: MS.max / MS.every }, (_, k) => (k + 1) * MS.every);
  const msPending = u => { const lv = levelInfo(u.xp || 0).level, done = new Set(u.milestones || []); return msLevels().filter(m => m <= lv && !done.has(m)); };
  const msBike = (level, owned) => { const tiers = msLevels().filter(m => m <= level).reverse().map(m => MS.bikes[m]); const shop = ITEMS.filter(i => i.kind === 'bike' && !i.exclusive).sort((a, b) => b.price - a.price).map(i => i.id); const id = [...tiers, ...shop].find(b => !owned.has(b)); return id ? ITEM[id] : null; };
  // Prix / disponibilit\u00e9 et paliers r\u00e9gl\u00e9s par l'\u00e9quipe (comme les tables shop_overrides et milestone_config du serveur)
  const effItem = i => { const o = (db.shopOv || {})[i.id]; return { ...i, basePrice: i.price, price: o ? o.price : i.price, available: o ? o.available : true, priceChangedAt: o ? o.updated_at : null }; };
  const msCfg = () => Object.fromEntries(msLevels().map(l => { const r = (db.msCfg || {})[l]; return [l, { level: l, coins: r ? r.coins : MS.coins(l), bike: r ? (r.bike || null) : MS.bikes[l], enabled: r ? r.enabled : true, custom: !!r, updatedAt: r ? r.updated_at : null, defaults: { coins: MS.coins(l), bike: MS.bikes[l] } }]; }));
  const msBikeCfg = (level, owned, cfg) => { const tiers = msLevels().filter(m => m <= level).reverse().map(m => cfg[m].bike).filter(Boolean); const shop = ITEMS.filter(i => i.kind === 'bike' && !i.exclusive).sort((a, b) => b.price - a.price).map(i => i.id); const id = [...tiers, ...shop].find(b => !owned.has(b)); return id ? ITEM[id] : null; };
  const claimOp = (key, actor, action) => { if (key === undefined || key === null || key === '') return; if (typeof key !== 'string' || !/^[A-Za-z0-9_-]{8,80}$/.test(key)) throw new E(400, 'Cl\u00e9 d\u2019op\u00e9ration invalide.', 'bad_op_key'); db.ops = db.ops || {}; if (db.ops[key]) throw new E(409, 'Cette op\u00e9ration a d\u00e9j\u00e0 \u00e9t\u00e9 enregistr\u00e9e : elle n\u2019a pas \u00e9t\u00e9 appliqu\u00e9e une seconde fois.', 'duplicate_op'); db.ops[key] = { actor: actor.id, action, at: now() }; };
  const routeOn = rid => { const r = (db.routeSt || {})[rid]; return r ? r : { enabled: true, reason: null }; };
  const assertRouteOn = rid => { const st = routeOn(rid); if (!st.enabled) throw new E(409, `Le parcours ${RROUTES[rid] ? RROUTES[rid][0] : rid} est temporairement d\u00e9sactiv\u00e9 par l\u2019\u00e9quipe.${st.reason ? ' ' + st.reason : ''}`, 'route_disabled'); };
  const rewardsView = u => ({ ...levelInfo(u.xp || 0), nextMilestone: nextMilestone(u.xp || 0), coins: u.coins || 0, frame: u.equipped_frame || null, title: ITEM[u.equipped_title]?.name || null, bike: bikeOf(u.equipped_bike), milestones: { claimed: u.milestones || [], pending: msPending(u) } });
  function credit(uid, kind, xp, coins, label, activityId = null, routeDone = null) {
    const u = byId(uid); if (!u) return null;
    const rx = Math.max(-(u.xp || 0), xp), rc = Math.max(-(u.coins || 0), coins);
    if (!rx && !rc) return { xp: 0, coins: 0, levelUp: null };
    const before = levelInfo(u.xp || 0).level;
    u.xp = (u.xp || 0) + rx; u.coins = (u.coins || 0) + rc;
    db.ledger.push({ id: id(), user_id: uid, kind, activity_id: activityId, xp: rx, coins: rc, label, created_at: now(), xp_curve: 2, route_done: routeDone });
    const after = levelInfo(u.xp).level; const levelUp = after > before ? after : null;
    if (levelUp) notify(uid, 'level_up', { level: levelUp });
    // +50 pi\u00e8ces par nouveau niveau, une seule fois par niveau (comme le serveur)
    const paid = Math.max(before, u.level_bonus_max ?? before); let levelCoins = 0;
    if (after > paid) { levelCoins = (after - paid) * 50; u.coins += levelCoins; u.level_bonus_max = after; db.ledger.push({ id: id(), user_id: uid, kind: 'milestone', activity_id: null, xp: 0, coins: levelCoins, label: after - paid > 1 ? `Niveaux ${paid + 1} \u00e0 ${after} atteints : +50 pi\u00e8ces par niveau` : `Niveau ${after} atteint : +50 pi\u00e8ces`, created_at: now() }); }
    else if (u.level_bonus_max == null) u.level_bonus_max = Math.max(before, after);
    return { xp: rx, coins: rc, levelUp, levelCoins };
  }
  const todayKey = d => new Date(d).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' });
  function awardActivity(a) {
    // comme le serveur : r\u00e9compenses uniquement pour une sortie suivie et valid\u00e9e (jamais pour une simulation ou une saisie manuelle)
    if (!a || a.source !== 'home-trainer' || !a.ride_session_id || a.simulation) return { xp: 0, coins: 0, levelUp: null, capped: false };
    const R = RULES.activity, km = a.distance_m / 1000, dp = a.elevation_m / 100, min = a.duration_s / 60;
    if (db.ledger.some(l => l.kind === 'activity' && l.activity_id === a.id)) return { xp: 0, coins: 0, levelUp: null, already: true }; // une seule fois par sortie
    const t = todayKey(now()), rows = db.ledger.filter(l => l.user_id === a.user_id && ['activity', 'reversal'].includes(l.kind) && todayKey(l.created_at) === t);
    // parcours termin\u00e9 (\u2265 98 % de sa distance) : bonus d'arriv\u00e9e une fois par parcours et par jour
    const sess = (db.rides || []).find(x => x.id === a.ride_session_id), route = sess && sess.kind === 'route' ? RROUTES[sess.route_id] : null;
    const finished = !!route && sess.distance_m >= route[1] * 1000 * RULES.completion.minShare;
    const bonus = finished && !rows.some(l => l.kind === 'activity' && l.route_done === sess.route_id) ? completionXp(sess.route_id) : 0;
    const ride = Math.round(km * R.xpPerKm + dp * R.xpPer100mDplus + min * R.xpPerMinute);
    const v = { xp: Math.min(R.maxXp, ride + bonus), coins: Math.min(R.maxCoins, Math.floor(a.distance_m * R.coinsPerRefKm.coins / (R.coinsPerRefKm.km * 1000))) };
    const tx = rows.reduce((s, l) => s + l.xp, 0), tc = rows.reduce((s, l) => s + l.coins, 0);
    const xp = Math.max(0, Math.min(v.xp, RULES.dailyCap.xp - tx)), coins = Math.max(0, Math.min(v.coins, RULES.dailyCap.coins - tc));
    return { ...credit(a.user_id, 'activity', xp, coins, a.title, a.id, bonus ? sess.route_id : null), rideXp: ride, bonusXp: bonus, finished, bonusAlreadyToday: finished && !bonus, capped: xp < v.xp || coins < v.coins };
  }
  function reverseActivity(aid, label) {
    const rows = db.ledger.filter(l => l.activity_id === aid && ['activity', 'reversal'].includes(l.kind));
    if (!rows.length) return; const u0 = byId(rows[0].user_id), L = levelInfo((u0 && u0.xp) || 0).level; // XP de l'ancienne \u00e9chelle : convertie avant d'\u00eatre retir\u00e9e
    const xp = rows.reduce((s, l) => s + (l.xp_curve === 1 ? Math.round(l.xp * needFor(L) / OLD.needFor(L)) : l.xp), 0), coins = rows.reduce((s, l) => s + l.coins, 0);
    if (xp > 0 || coins > 0) credit(rows[0].user_id, 'reversal', -xp, -coins, label, aid);
  }

  /* ---------- Routes ---------- */
  const R = [];
  const on = (m, p, fn) => R.push({ m, re: new RegExp('^' + p.replace(/:(\w+)/g, '([^/]+)') + '/?$'), keys: (p.match(/:(\w+)/g) || []).map(k => k.slice(1)), fn });

  on('GET', '/public/info', () => ({ contactEmail: db.settings.contact_email || null, registrationOpen: db.settings.registration_open, maintenance: db.settings.maintenance_message || null }));
  on('GET', '/auth/me', ({ u }) => u ? { user: selfView(u), unread: db.notifs.filter(n => n.user_id === u.id && !n.read_at).length, announcement: db.settings.maintenance_message || null } : { user: null });
  on('POST', '/auth/register', async ({ b }) => {
    if (!db.settings.registration_open) throw forbidden('Les inscriptions sont ferm\u00e9es pour le moment.');
    const username = str(b.username, 'Le nom d\u2019utilisateur', 3, 20);
    if (!/^[A-Za-z0-9_.-]+$/.test(username)) throw bad('Le nom d\u2019utilisateur ne peut contenir que des lettres sans accent, des chiffres, \u00ab _ \u00bb, \u00ab . \u00bb et \u00ab - \u00bb.', 'username');
    if (['admin', 'root', 'veloverse', 'superadmin', 'moderateur', 'support'].includes(username.toLowerCase())) throw bad('Ce nom d\u2019utilisateur est r\u00e9serv\u00e9.', 'username');
    const email = str(b.email, 'L\u2019adresse e-mail', 3, 254).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw bad('Cette adresse e-mail n\u2019est pas valide.', 'email');
    const err = checkPw(b.password, username); if (err) throw bad(err, 'password');
    if (b.acceptTerms !== true) throw bad('Tu dois accepter les conditions d\u2019utilisation.', 'terms');
    if (byName(username)) throw bad('Ce nom d\u2019utilisateur est d\u00e9j\u00e0 pris.', 'username');
    if (db.users.find(u => u.email === email)) throw bad('Un compte existe d\u00e9j\u00e0 avec cette adresse e-mail.', 'email');
    // D\u00e9mo : pas d'envoi d'e-mail, l'adresse est confirm\u00e9e d'office. Seule julientruffautroche@gmail.com devient super-admin.
    const first = email === ADMIN_EMAILS[0];
    const u = { id: id(), username, email, pw: await sha(b.password), role: first ? 'superadmin' : 'user', status: 'active', status_reason: null, suspended_until: null, email_verified_at: now(), bio: '', avatar: null, profile_visibility: 'public', activity_visibility: 'friends', searchable: true, created_at: now(), last_seen_at: now(), xp: 0, coins: 0, equipped_frame: null, equipped_title: null };
    db.users.push(u);
    if (first) audit({ username: 'syst\u00e8me', role: 'system' }, 'user.role', 'user', u.id, u.username, { from: 'user', to: 'superadmin', via: 'ADMIN_EMAILS' });
    if (typeof b.invite === 'string') useInvite(u, b.invite);
    login(u.id);
    return { status: 201, data: { user: selfView(u) } };
  });
  on('POST', '/auth/login', async ({ b }) => {
    const l = String(b.login || '').trim().toLowerCase();
    const u = db.users.find(x => x.email === l || x.username.toLowerCase() === l);
    if (u?.demo) throw new E(401, 'Les comptes de d\u00e9monstration n\u2019ont pas de mot de passe. Cr\u00e9e ton propre compte pour essayer.', 'bad_credentials');
    if (!u || u.pw !== await sha(String(b.password || ''))) throw new E(401, 'Identifiant ou mot de passe incorrect.', 'bad_credentials');
    if (u.status === 'suspended' && u.suspended_until && new Date(u.suspended_until) <= new Date()) u.status = 'active';
    if (u.status === 'banned') throw forbidden('Ce compte a \u00e9t\u00e9 banni.' + (u.status_reason ? ' Motif : ' + u.status_reason : ''));
    if (u.status === 'suspended') throw forbidden('Ce compte est suspendu jusqu\u2019au ' + new Date(u.suspended_until).toLocaleString('fr-FR') + '.');
    login(u.id); return { user: selfView(u) };
  });
  on('POST', '/auth/logout', ({ u }) => { if (u) { try { delete db.sessions[localStorage.getItem(SKEY)]; localStorage.removeItem(SKEY); } catch {} } return { ok: true }; });
  on('POST', '/auth/verify', () => { throw bad('Dans la d\u00e9mo, les adresses e-mail sont confirm\u00e9es automatiquement.', 'bad_token'); });
  on('POST', '/auth/resend-verification', ({ u }) => { requireUser(u); return { ok: true, already: true }; });
  on('POST', '/auth/forgot', ({ b }) => { if (!b.email) throw bad('Indique ton adresse e-mail.'); return { ok: true, message: 'Si un compte correspond \u00e0 cette adresse, un e-mail de r\u00e9initialisation vient d\u2019\u00eatre envoy\u00e9. (Dans la d\u00e9mo, aucun e-mail ne part.)' }; });
  on('POST', '/auth/reset', () => { throw bad('La r\u00e9initialisation par e-mail n\u2019est pas disponible dans la d\u00e9mo.', 'bad_token'); });
  on('POST', '/auth/change-password', async ({ u, b }) => { requireUser(u); if (u.pw !== await sha(String(b.current || ''))) throw bad('Le mot de passe actuel est incorrect.', 'current'); const e = checkPw(b.password, u.username); if (e) throw bad(e, 'password'); u.pw = await sha(b.password); return { ok: true }; });
    on('DELETE', '/account', async ({ u, b }) => {
    requireUser(u); if (u.pw !== await sha(String(b.password || ''))) throw bad('Mot de passe incorrect.', 'password');
    if (u.role === 'superadmin' && db.users.filter(x => x.role === 'superadmin').length <= 1 && db.users.some(x => !x.demo && x.id !== u.id)) throw forbidden('Tu es le seul super-administrateur. Nomme quelqu\u2019un d\u2019autre avant de supprimer ton compte.');
    deleteUser(u.id); try { localStorage.removeItem(SKEY); } catch {} return { ok: true };
  });

  on('PATCH', '/me/profile', ({ u, b }) => {
    requireUser(u);
    if ('bio' in b) u.bio = str(b.bio, 'La biographie', 0, 400);
    if ('avatar' in b) { if (b.avatar !== null && !/^data:image\/(jpeg|png|webp);base64,/.test(b.avatar || '')) throw bad('La photo doit \u00eatre une image.'); u.avatar = b.avatar; }
    if (b.privacy) { for (const [k, c] of [['profile', 'profile_visibility'], ['activities', 'activity_visibility']]) if (k in b.privacy) { if (!['public', 'friends', 'private'].includes(b.privacy[k])) throw bad('Visibilit\u00e9 invalide.'); u[c] = b.privacy[k]; } if ('searchable' in b.privacy) u.searchable = b.privacy.searchable === true; }
    return { ok: true };
  });
  on('GET', '/users', ({ u, qs }) => {
    requireUser(u); const t = (qs.get('q') || '').trim().toLowerCase();
    if (t.length < 2) return { items: [], total: 0, page: 1, pages: 0 };
    const list = db.users.filter(x => x.status === 'active' && x.searchable && x.id !== u.id && x.username.toLowerCase().includes(t)).sort((a, b) => a.username.localeCompare(b.username));
    const r = pageOf(list, qs, 12); r.items = r.items.map(x => card(x, relation(u.id, x.id))); return r;
  });
  on('GET', '/users/:username', ({ u, p }) => {
    const t = byName(p.username); if (!t || t.status !== 'active') throw notFound('Ce cycliste est introuvable.');
    const rel = relation(u?.id, t.id), sp = visible(t.profile_visibility, rel), sa = sp && visible(t.activity_visibility, rel);
    const o = { ...card(t, rel), profileVisible: sp, activitiesVisible: sa, frame: sp ? t.equipped_frame || null : null, title: sp ? ITEM[t.equipped_title]?.name || null : null, bike: sp ? bikeOf(t.equipped_bike) : null }; if (sp) { o.level = levelInfo(t.xp || 0).level; o.garage = { bike: { ...DEF_BIKE, ...(t.bike_config || {}) }, riderSaved: !!t.rider_config }; }
    if (sp) { const fr = db.friendships.filter(f => f.status === 'accepted' && (f.requester_id === t.id || f.addressee_id === t.id)).map(f => byId(f.requester_id === t.id ? f.addressee_id : f.requester_id)).filter(x => x && x.status === 'active'); o.bio = t.bio; o.createdAt = t.created_at; o.friends = fr.map(f => ({ username: f.username, avatar: f.avatar, rider: f.rider_config || null })); o.friendsCount = fr.length; }
    if (sa) { o.totals = sumOf(acts(t.id)); o.activities = acts(t.id).sort((a, b) => b.started_at.localeCompare(a.started_at)).slice(0, 10).map(a => activityView(a, u?.id)); }
    return o;
  });
  on('GET', '/friends', ({ u }) => {
    requireUser(u);
    const rows = db.friendships.filter(f => f.requester_id === u.id || f.addressee_id === u.id).map(f => ({ f, o: byId(f.requester_id === u.id ? f.addressee_id : f.requester_id) })).filter(x => x.o && x.o.status === 'active');
    const c = x => ({ username: x.o.username, avatar: x.o.avatar, rider: x.o.rider_config || null, since: x.f.responded_at || x.f.created_at });
    return { friends: rows.filter(x => x.f.status === 'accepted').map(c), incoming: rows.filter(x => x.f.status === 'pending' && x.f.addressee_id === u.id).map(c), outgoing: rows.filter(x => x.f.status === 'pending' && x.f.requester_id === u.id).map(c) };
  });
  on('POST', '/friends', ({ u, b }) => {
    requireVerified(u); const t = byName(b.username); if (!t || t.status !== 'active') throw notFound('Ce cycliste est introuvable.');
    if (t.id === u.id) throw bad('Tu ne peux pas t\u2019envoyer une demande \u00e0 toi-m\u00eame.');
    const rel = relation(u.id, t.id);
    if (rel === 'friends') throw bad('Vous \u00eates d\u00e9j\u00e0 amis.'); if (rel === 'outgoing') throw bad('Ta demande est d\u00e9j\u00e0 en attente.'); if (rel === 'incoming') throw bad(`${t.username} t\u2019a d\u00e9j\u00e0 envoy\u00e9 une demande : accepte-la dans ta page Amis.`);
    db.friendships.push({ id: id(), requester_id: u.id, addressee_id: t.id, status: 'pending', created_at: now(), responded_at: null });
    notify(t.id, 'friend_request', { from: u.username });
    // D\u00e9mo : les comptes fictifs acceptent automatiquement au bout de quelques secondes.
    if (t.demo) setTimeout(() => { const f = pair(u.id, t.id); if (f && f.status === 'pending') { f.status = 'accepted'; f.responded_at = now(); notify(u.id, 'friend_accepted', { by: t.username }); save(); } }, 4000);
    return { status: 201, data: { ok: true, relation: 'outgoing' } };
  });
  const friendAct = action => ({ u, p }) => {
    requireUser(u); const t = byName(p.username); if (!t) throw notFound('Ce cycliste est introuvable.');
    const rel = relation(u.id, t.id), f = pair(u.id, t.id);
    const drop = () => { db.friendships = db.friendships.filter(x => x !== f); };
    if (action === 'accept') { if (rel !== 'incoming') throw bad('Aucune demande re\u00e7ue de cette personne.'); f.status = 'accepted'; f.responded_at = now(); notify(t.id, 'friend_accepted', { by: u.username }); return { ok: true, relation: 'friends' }; }
    if (action === 'decline') { if (rel !== 'incoming') throw bad('Aucune demande re\u00e7ue de cette personne.'); drop(); return { ok: true, relation: 'none' }; }
    if (action === 'cancel') { if (rel !== 'outgoing') throw bad('Aucune demande envoy\u00e9e \u00e0 cette personne.'); drop(); db.notifs = db.notifs.filter(n => !(n.user_id === t.id && n.kind === 'friend_request' && n.data.from === u.username)); return { ok: true, relation: 'none' }; }
    if (rel !== 'friends') throw bad('Vous n\u2019\u00eates pas amis.'); drop(); return { ok: true, relation: 'none' };
  };
  on('POST', '/friends/:username/accept', friendAct('accept'));
  on('POST', '/friends/:username/decline', friendAct('decline'));
  on('POST', '/friends/:username/cancel', friendAct('cancel'));
  on('DELETE', '/friends/:username', friendAct('remove'));
  function useInvite(u, tok) {
    const inv = db.invites.find(i => i.token === tok && new Date(i.expires_at) > new Date() && i.uses < 10);
    if (!inv || inv.inviter_id === u.id) return false;
    const f = pair(u.id, inv.inviter_id); if (f) return f.status === 'accepted' ? 'already' : false;
    inv.uses++; db.friendships.push({ id: id(), requester_id: inv.inviter_id, addressee_id: u.id, status: 'accepted', created_at: now(), responded_at: now() });
    notify(inv.inviter_id, 'invite_accepted', { by: u.username }); return true;
  }
  on('POST', '/invites', ({ u }) => { requireVerified(u); const token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2); const e = new Date(); e.setDate(e.getDate() + 14); db.invites.push({ token, inviter_id: u.id, expires_at: e.toISOString(), uses: 0 }); return { status: 201, data: { url: 'https://veloverse.exemple/invitation/' + token, expiresInDays: 14, maxUses: 10 } }; });
  on('GET', '/invites/:token', ({ p }) => { const i = db.invites.find(x => x.token === p.token); const u = i && byId(i.inviter_id); if (!u) throw notFound('Ce lien d\u2019invitation est invalide ou a expir\u00e9.'); return { inviter: u.username, avatar: u.avatar }; });
  on('POST', '/invites/:token/accept', ({ u, p }) => { requireUser(u); const r = useInvite(u, p.token); if (r === 'already') return { ok: true, already: true }; if (!r) throw bad('Ce lien d\u2019invitation ne peut pas \u00eatre utilis\u00e9.'); return { ok: true }; });
  on('GET', '/feed', ({ u, qs }) => {
    requireUser(u);
    const list = db.feed.filter(e => { const o = byId(e.user_id); if (!o || o.status !== 'active') return false; const a = e.activity_id && db.activities.find(x => x.id === e.activity_id); if (e.activity_id && (!a || a.hidden)) return false; if (e.user_id === u.id) return true; return relation(u.id, o.id) === 'friends' && o.activity_visibility !== 'private' && o.profile_visibility !== 'private'; }).sort((a, b) => b.created_at.localeCompare(a.created_at));
    const r = pageOf(list, qs, 15);
    return { page: r.page, more: r.more, items: r.items.map(e => { const o = byId(e.user_id), a = e.activity_id && db.activities.find(x => x.id === e.activity_id), av = a && activityView(a, u.id); return { id: e.id, kind: e.kind, data: e.data, at: e.created_at, user: { username: o.username, avatar: o.avatar, frame: o.equipped_frame || null, rider: o.rider_config || null }, mine: o.id === u.id, activity: a ? { id: a.id, title: a.title, source: a.source, startedAt: a.started_at, durationS: a.duration_s, distanceM: a.distance_m, elevationM: a.elevation_m, avgPower: a.avg_power, reactions: av.reactions, reacted: av.reacted } : null }; }) };
  });
  on('POST', '/activities/:id/react', ({ u, p }) => {
    requireUser(u); const a = db.activities.find(x => x.id === Number(p.id)); const o = a && byId(a.user_id);
    if (!a || a.hidden || !o || o.status !== 'active') throw notFound('Activit\u00e9 introuvable.');
    const rel = relation(u.id, o.id); if (!visible(o.profile_visibility, rel) || !visible(o.activity_visibility, rel)) throw notFound('Activit\u00e9 introuvable.');
    const ex = db.reactions.find(r => r.activity_id === a.id && r.user_id === u.id);
    if (ex) db.reactions = db.reactions.filter(r => r !== ex); else { db.reactions.push({ activity_id: a.id, user_id: u.id }); if (o.id !== u.id) notify(o.id, 'reaction', { by: u.username, title: a.title }); }
    return { reacted: !ex, reactions: db.reactions.filter(r => r.activity_id === a.id).length };
  });
  on('GET', '/notifications', ({ u, qs }) => { requireUser(u); const l = db.notifs.filter(n => n.user_id === u.id).sort((a, b) => b.created_at.localeCompare(a.created_at)); const r = pageOf(l, qs, 20); return { items: r.items, more: r.more, page: r.page, unread: l.filter(n => !n.read_at).length }; });
  on('POST', '/notifications/read', ({ u, b }) => { requireUser(u); const ids = Array.isArray(b.ids) ? b.ids.map(Number) : null; for (const n of db.notifs) if (n.user_id === u.id && !n.read_at && (!ids || ids.includes(n.id))) n.read_at = now(); return { ok: true }; });
  on('POST', '/reports', ({ u, b }) => {
    requireVerified(u);
    if (!['user', 'activity'].includes(b.targetType)) throw bad('Type invalide.');
    if (!['spam', 'harassment', 'inappropriate', 'impersonation', 'cheating', 'other'].includes(b.reason)) throw bad('Motif invalide.');
    const details = str(b.details, 'Le d\u00e9tail', 0, 1000); if (b.reason === 'other' && details.length < 10) throw bad('D\u00e9cris le probl\u00e8me en quelques mots (10 caract\u00e8res minimum).');
    let tid, tuid;
    if (b.targetType === 'user') { const t = byName(b.target); if (!t) throw notFound('Ce cycliste est introuvable.'); tid = tuid = t.id; }
    else { const a = db.activities.find(x => x.id === Number(b.target)); if (!a) throw notFound('Activit\u00e9 introuvable.'); tid = a.id; tuid = a.user_id; }
    if (tuid === u.id) throw bad('Tu ne peux pas te signaler toi-m\u00eame.');
    if (db.reports.find(r => r.reporter_id === u.id && r.target_type === b.targetType && r.target_id === tid && r.status !== 'resolved')) throw bad('Tu as d\u00e9j\u00e0 signal\u00e9 ceci. Le signalement est en cours d\u2019examen.');
    db.reports.push({ id: id(), reporter_id: u.id, target_type: b.targetType, target_id: tid, target_user_id: tuid, reason: b.reason, details, status: 'pending', decision: null, decision_reason: null, assigned_to: null, resolved_by: null, created_at: now(), updated_at: now() });
    return { status: 201, data: { ok: true, message: 'Merci. Ton signalement a \u00e9t\u00e9 transmis \u00e0 l\u2019\u00e9quipe de mod\u00e9ration.' } };
  });

  // Ajout manuel supprim\u00e9 (comme sur le serveur) : les activit\u00e9s viennent uniquement des sorties suivies (/rides).
  on('POST', '/activities', ({ u }) => { requireUser(u); throw Object.assign(new E(410, 'L\u2019ajout manuel d\u2019activit\u00e9s n\u2019est plus possible. Tes sorties sont enregistr\u00e9es automatiquement quand tu roules sur un parcours 3D ou une s\u00e9ance home trainer.'), { code: 'manual_activity_disabled' }); });
  // Sorties suivies : m\u00eames contr\u00f4les que server/rides.mjs (horloge, vitesse, continuit\u00e9, puissance mesur\u00e9e, enregistrement unique).
  // D\u00e9mo sans Bluetooth : une sortie sans puissance mesur\u00e9e peut \u00eatre enregistr\u00e9e, marqu\u00e9e \u00ab (simulation) \u00bb, sans aucune r\u00e9compense.
  const RROUTES = { 'cap-horizon': ['Cap Horizon', 32, 480, 91, 169], 'col-des-lumieres': ['Col des Lumi\u00e8res', 78, 1420, 4197, 392], 'valley-loop': ['Valley Loop', 56, 860, 68, 172], 'lac-des-sapins': ['Lac des Sapins', 48, 720, 302, 188], 'vieux-port': ['Vieux Port', 24, 210, 86, 44], 'prairies-dor': ['Prairies d\u2019Or', 41, 390, 1125, 144], 'plaine-des-haies': ['Plaine des Haies', 14, 24, 651, 6], 'criterium-du-bourg': ['Crit\u00e9rium du Bourg', 11, 18, 54, 4] };
  db.rides = db.rides || [];
  const rideOf = (u, rid) => { const s = (db.rides || []).find(x => x.id === Number(rid) && x.user_id === u.id); if (!s) throw notFound('Sortie introuvable.'); if (s.status === 'saved') throw bad('Cette sortie est d\u00e9j\u00e0 enregistr\u00e9e.'); if (s.status === 'rejected') throw bad('Cette sortie n\u2019a pas pu \u00eatre valid\u00e9e (' + s.why + ') : elle ne peut pas \u00eatre enregistr\u00e9e.'); if (s.status !== 'active') throw bad('Cette sortie n\u2019est plus en cours.'); return s; };
  const rideBeat = (s, b) => {
    const wall = (Date.now() - Date.parse(s.started_at)) / 1000, since = (Date.now() - Date.parse(s.last_beat_at || s.started_at)) / 1000;
    const el = int(b.elapsedS, 'La dur\u00e9e', 0, 86400), di = int(b.distanceM, 'La distance', 0, 1000000), pw = int(b.avgPower ?? 0, 'La puissance', 0, 2500), m = b.measured === true, dE = el - s.elapsed_s, dD = di - s.distance_m;
    let why = null;
    if (el > wall + 15) why = 'la dur\u00e9e d\u00e9passe le temps r\u00e9ellement \u00e9coul\u00e9'; else if (dE < 0 || dD < 0) why = 'les compteurs ont recul\u00e9'; else if (dE > since + 15) why = 'la dur\u00e9e avance plus vite que le temps r\u00e9el'; else if (dD > Math.max(dE, 1) * 25 + 20) why = 'vitesse impossible';
    if (why) { s.status = 'rejected'; s.why = why; return why; }
    s.beats++; s.max_gap_s = Math.max(s.max_gap_s, Math.round(since)); s.last_beat_at = now(); s.elapsed_s = el; s.distance_m = di; if (m) { s.energy_j += pw * dE; s.measured_s += dE; } return null;
  };
  on('POST', '/rides/start', ({ u, b }) => {
    requireUser(u); if (!['route', 'workout'].includes(b.kind)) throw bad('Le type de sortie est invalide.');
    if (b.kind === 'route' && !RROUTES[b.routeId]) throw bad('Le parcours est invalide.');
    if (b.kind === 'route') assertRouteOn(b.routeId); // parcours d\u00e9sactiv\u00e9 par l'\u00e9quipe : aucune sortie
    db.rides = db.rides || []; for (const r of db.rides) if (r.user_id === u.id && r.status === 'active') r.status = 'abandoned';
    const s = { id: id(), user_id: u.id, kind: b.kind, route_id: b.kind === 'route' ? b.routeId : null, title: b.kind === 'route' ? RROUTES[b.routeId][0] : str(b.title, 'Le titre', 1, 80), started_at: now(), last_beat_at: null, beats: 0, max_gap_s: 0, elapsed_s: 0, distance_m: 0, energy_j: 0, measured_s: 0, status: 'active' };
    db.rides.push(s); return { status: 201, data: { id: s.id, beatEveryS: 20 } };
  });
  on('POST', '/rides/:id/beat', ({ u, p, b }) => { requireUser(u); const s = rideOf(u, p.id); const why = rideBeat(s, b); if (why) throw bad('Sortie invalid\u00e9e : ' + why + '. Elle ne pourra pas \u00eatre enregistr\u00e9e.'); return { ok: true }; });
  on('POST', '/rides/:id/finish', ({ u, p, b }) => {
    requireUser(u); const s = rideOf(u, p.id);
    const why = rideBeat(s, { elapsedS: b.durationS, distanceM: b.distanceM, avgPower: b.lastPower ?? 0, measured: b.measured === true }); if (why) throw bad('Sortie invalid\u00e9e : ' + why + '.');
    const fail = m => { s.status = 'rejected'; s.why = m; throw bad('Sortie non enregistr\u00e9e : ' + m + '.'); };
    if (s.elapsed_s < 60) throw bad('Roule au moins une minute pour pouvoir enregistrer la sortie.');
    if (s.max_gap_s > 75) fail('elle n\u2019a pas \u00e9t\u00e9 suivie en continu (connexion interrompue plus de 75 s)');
    const sim = s.measured_s < s.elapsed_s * 0.8, elev = int(b.elevationM ?? 0, 'Le d\u00e9nivel\u00e9', 0, 20000);
    if (s.kind === 'route') { const r = RROUTES[s.route_id]; if (s.distance_m > r[1] * 1000 + (r[3] || 0) + 50) fail('distance sup\u00e9rieure \u00e0 la longueur du parcours'); if (elev > (r[2] + (r[4] || 0)) * Math.min(1, s.distance_m / (r[1] * 1000)) * 1.3 + 30) fail('d\u00e9nivel\u00e9 incoh\u00e9rent avec le parcours'); }
    else if (elev > s.distance_m * 0.15 + 30) fail('d\u00e9nivel\u00e9 incoh\u00e9rent avec la distance');
    const a = { id: id(), user_id: u.id, title: s.title + (sim ? ' (simulation)' : ''), source: 'home-trainer', started_at: s.started_at, duration_s: s.elapsed_s, distance_m: s.distance_m, elevation_m: elev, avg_power: sim ? null : Math.round(s.energy_j / Math.max(1, s.measured_s)), avg_hr: b.avgHr ? int(b.avgHr, 'La FC', 20, 250) : null, tss: null, hidden: false, created_at: now(), ride_session_id: s.id, simulation: sim };
    s.status = 'saved'; db.activities.push(a); db.feed.push({ id: id(), user_id: u.id, kind: 'activity', activity_id: a.id, data: {}, created_at: now() });
    const rewards = awardActivity(a); checkAchievements(u); return { status: 201, data: { activity: a, rewards } };
  });
  on('GET', '/activities', ({ u, qs }) => { requireUser(u); const r = pageOf(db.activities.filter(a => a.user_id === u.id).sort((a, b) => b.started_at.localeCompare(a.started_at)), qs, 20); return { items: r.items, more: r.more, page: r.page }; });
  on('DELETE', '/activities/:id', ({ u, p }) => { requireUser(u); const a = db.activities.find(x => x.id === Number(p.id) && x.user_id === u.id); if (!a) throw notFound('Activit\u00e9 introuvable.'); reverseActivity(a.id, 'Activit\u00e9 supprim\u00e9e : ' + a.title); db.activities = db.activities.filter(x => x !== a); db.feed = db.feed.filter(f => f.activity_id !== a.id); db.reactions = db.reactions.filter(r => r.activity_id !== a.id); return { ok: true }; });
  on('GET', '/dashboard', ({ u }) => {
    requireUser(u);
    const w = bounds('week'), m = bounds('month'), all = acts(u.id);
    const inR = (f, t) => sumOf(all.filter(a => a.started_at >= f && a.started_at < t));
    const weeks = []; for (let i = 11; i >= 0; i--) { const s = new Date(w.start); s.setDate(s.getDate() - 7 * i); const e = new Date(s); e.setDate(e.getDate() + 7); weeks.push({ week: s.toISOString().slice(0, 10), ...inR(s.toISOString(), e.toISOString()) }); }
    const challenges = db.parts.filter(p => p.user_id === u.id).map(p => ({ p, c: db.challenges.find(c => c.id === p.challenge_id) })).filter(x => x.c && new Date(x.c.ends_at) > new Date(Date.now() - 14 * 86400e3)).map(x => ({ ...chView(x.c), joined: true, completedAt: x.p.completed_at, progress: metric(u.id, x.c.metric, x.c.starts_at, x.c.ends_at) }));
    return { totals: sumOf(all), week: inR(w.start, w.stop), month: inR(m.start, m.stop), weeks, recent: db.activities.filter(a => a.user_id === u.id).sort((a, b) => b.started_at.localeCompare(a.started_at)).slice(0, 6), challenges, goals: goalsOf(u.id) };
  });
  on('GET', '/challenges', ({ u }) => ({ items: db.challenges.filter(c => c.published && new Date(c.ends_at) > new Date(Date.now() - 30 * 86400e3)).map(c => { const v = chView(c); v.status = new Date(c.starts_at) > new Date() ? 'upcoming' : new Date(c.ends_at) < new Date() ? 'ended' : 'active'; if (u) { const p = db.parts.find(p => p.challenge_id === c.id && p.user_id === u.id); v.joined = !!p; v.completedAt = p?.completed_at || null; if (p) v.progress = metric(u.id, c.metric, c.starts_at, c.ends_at); } return v; }) }));
  on('POST', '/challenges/:id/join', ({ u, p }) => { requireUser(u); const c = db.challenges.find(x => x.id === Number(p.id) && x.published); if (!c) throw notFound('D\u00e9fi introuvable.'); if (new Date(c.ends_at) < new Date()) throw bad('Ce d\u00e9fi est termin\u00e9.'); if (!db.parts.find(x => x.challenge_id === c.id && x.user_id === u.id)) db.parts.push({ challenge_id: c.id, user_id: u.id, joined_at: now(), completed_at: null }); checkAchievements(u); return { ok: true }; });
  on('POST', '/challenges/:id/leave', ({ u, p }) => { requireUser(u); db.parts = db.parts.filter(x => !(x.challenge_id === Number(p.id) && x.user_id === u.id)); return { ok: true }; });
  /* ---------- Garage ---------- */
  const PAL = ['#22d3ee', '#2dd4bf', '#0ea5e9', '#1e3a8a', '#6366f1', '#a855f7', '#ec4899', '#ef4444', '#f97316', '#f59e0b', '#facc15', '#84cc16', '#22c55e', '#ffffff', '#9ca3af', '#111827', '#d6a35e', '#5f6f5c', '#7dd3fc', '#d9f21a'];
  const G_RIDER = { skin: ['s1', 's2', 's3', 's4', 's5'], helmet: ['route', 'aero', 'casquette'], helmetColor: PAL, jerseyPattern: ['uni', 'bande', 'bicolore', 'manches', 'col'], jerseyColor: PAL, jerseyColor2: PAL, shortsColor: PAL, socks: ['courtes', 'hautes'], socksColor: PAL, shoesColor: PAL, glasses: ['aucune', 'noires', 'miroir', 'orange'], gloves: ['aucun', ...PAL] };
  const G_BIKE = { model: ['aero', 'grimpeur', 'gravel', 'clm', 'rouge-carbone', 'givre-rouge', 'eclair-blanc', 'or-olympe', 'nuit-polaire', 'aurore', 'legende', 'rubis', 'celeste', 'flamme', 'braise', 'neige', 'comete', 'arlequin', 'soleil', 'meteore', 'contraste', 'chrono-or', 'grenat-cross', 'prisme-or', 'lichen', 'arc-en-ciel', 'citron-fluo', 'ivoire', 'azur'], frameColor: PAL, accentColor: PAL, wheels: ['bas', 'moyen', 'haut', 'disque', 'carbone67', 'batons', 'arcenciel45', 'or60'], rimColor: PAL, tyres: ['noir', 'beige'], tapeColor: PAL, saddleColor: PAL };
  const cleanG = (input, schema, base) => { if (input === undefined) return null; const o = { ...base }; for (const [k, v] of Object.entries(input || {})) { if (!schema[k]) throw bad('Option inconnue : ' + k + '.'); if (!schema[k].includes(v)) throw bad('Valeur non autoris\u00e9e pour \u00ab ' + k + ' \u00bb.'); o[k] = v; } return o; };
  on('GET', '/garage', ({ u }) => { requireUser(u); return { rider: { ...DEF_RIDER, ...(u.rider_config || {}) }, bike: { ...DEF_BIKE, ...(u.bike_config || {}) }, saved: !!u.rider_config, unlocked: G_BIKE.model.filter(m => m !== 'aero' && db.items.some(i => i.user_id === u.id && i.item_id === 'bike-' + m)), unlockedWheels: ['carbone67', 'batons', 'arcenciel45', 'or60'].filter(w => db.items.some(i => i.user_id === u.id && i.item_id === 'wheel-' + w)) }; });
  on('PUT', '/garage', ({ u, b }) => {
    requireUser(u);
    const rider = cleanG(b.rider, G_RIDER, { ...DEF_RIDER, ...(u.rider_config || {}) }), bike = cleanG(b.bike, G_BIKE, { ...DEF_BIKE, ...(u.bike_config || {}) });
    if (!rider && !bike) throw bad('Rien \u00e0 enregistrer.');
    if (bike && bike.model !== 'aero' && !db.items.some(i => i.user_id === u.id && i.item_id === 'bike-' + bike.model)) throw forbidden('Ce v\u00e9lo se d\u00e9bloque dans la boutique.');
    if (bike && ['carbone67', 'batons', 'arcenciel45', 'or60'].includes(bike.wheels) && !db.items.some(i => i.user_id === u.id && i.item_id === 'wheel-' + bike.wheels)) throw forbidden('Ces roues s\u2019ach\u00e8tent dans la boutique.');
    if (bike) u.equipped_bike = bike.model === 'aero' ? null : 'bike-' + bike.model;
    if (rider) u.rider_config = rider; if (bike) u.bike_config = bike;
    return { ok: true, rider: u.rider_config, bike: { ...DEF_BIKE, ...(u.bike_config || {}) } };
  });

  on('GET', '/rewards', ({ u, qs }) => {
    requireUser(u); const owned = new Set(db.items.filter(i => i.user_id === u.id).map(i => i.item_id)); const lv = levelInfo(u.xp || 0).level;
    const r = pageOf(db.ledger.filter(l => l.user_id === u.id).sort((a, b) => b.created_at.localeCompare(a.created_at) || b.id - a.id), qs, 15);
    return { ...rewardsView(u), rules: { ...RULES, levels: LEVEL_RULES, routeXp: routeXpTable() }, items: ITEMS.map(effItem).map(i => ({ ...i, owned: owned.has(i.id), equipped: i.kind === 'wheels' ? ((u.bike_config || {}).wheels === i.wheel) : u[SLOT[i.kind]] === i.id, locked: lv < i.minLevel })), history: r.items, more: r.more, page: r.page };
  });
  on('POST', '/shop/unequip', ({ u, b }) => { requireUser(u); if (b.kind === 'wheels') { u.bike_config = { ...(u.bike_config || {}), wheels: 'moyen' }; save(); return { ok: true }; } if (!SLOT[b.kind]) throw bad('Type invalide.'); u[SLOT[b.kind]] = null; if (b.kind === 'bike') u.bike_config = { ...(u.bike_config || {}), model: 'aero' }; save(); return { ok: true }; });
  on('GET', '/rewards/milestones', ({ u }) => {
    requireUser(u); const owned = new Set(db.items.filter(i => i.user_id === u.id).map(i => i.item_id)), lv = levelInfo(u.xp || 0).level, cfg = msCfg(); db.levelRewards = db.levelRewards || [];
    return { level: lv, items: msLevels().map(m => { const c = db.levelRewards.find(r => r.user_id === u.id && r.level === m), b = c ? null : msBikeCfg(m, owned, cfg);
      return { level: m, reached: lv >= m, disabled: !c && !cfg[m].enabled, claimed: c ? { choice: c.choice, item: c.item_id ? bikeOf(c.item_id) : null, coins: c.coins, at: c.claimed_at } : null, offer: c ? null : { coins: cfg[m].coins, bike: b ? { id: b.id, name: b.name, desc: b.desc, model: b.model, image: b.image || null } : null } }; }) };
  });
  on('POST', '/rewards/milestones/:level/claim', ({ u, p, b }) => {
    requireUser(u); const level = Number(p.level); if (!msLevels().includes(level)) throw notFound('Ce palier n\u2019existe pas.');
    const choice = b.choice === 'bike' ? 'bike' : b.choice === 'coins' ? 'coins' : null; if (!choice) throw bad('Choisis le v\u00e9lo ou les pi\u00e8ces.');
    if (levelInfo(u.xp || 0).level < level) throw forbidden(`Ce palier se d\u00e9bloque au niveau ${level}.`);
    db.levelRewards = db.levelRewards || [];
    if (db.levelRewards.some(r => r.user_id === u.id && r.level === level)) throw new E(409, 'Tu as d\u00e9j\u00e0 choisi ta r\u00e9compense pour ce palier.', 'milestone_claimed');
    const cfg = msCfg(); if (!cfg[level].enabled) throw forbidden('Ce palier est temporairement indisponible. R\u00e9essaie plus tard : ta r\u00e9compense reste \u00e0 r\u00e9clamer.');
    let item = null, coins = 0;
    if (choice === 'bike') { item = msBikeCfg(level, new Set(db.items.filter(i => i.user_id === u.id).map(i => i.item_id)), cfg); if (!item) throw bad('Tu poss\u00e8des d\u00e9j\u00e0 tous les v\u00e9los : choisis les pi\u00e8ces.'); if (b.bikeId && b.bikeId !== item.id) throw new E(409, 'Le v\u00e9lo propos\u00e9 a chang\u00e9, recharge la page.', 'offer_changed'); db.items.push({ user_id: u.id, item_id: item.id, bought_at: now() }); }
    else { coins = cfg[level].coins; if (b.coins !== undefined && Number(b.coins) !== coins) throw new E(409, 'Le montant de ce palier a chang\u00e9, recharge la page.', 'offer_changed'); u.coins = (u.coins || 0) + coins; }
    db.levelRewards.push({ user_id: u.id, level, choice, item_id: item ? item.id : null, coins, claimed_at: now() });
    u.milestones = [...new Set([...(u.milestones || []), level])].sort((x, y) => x - y);
    db.ledger.push({ id: id(), user_id: u.id, kind: 'milestone', activity_id: null, xp: 0, coins, label: `Palier du niveau ${level} : ` + (item ? 'v\u00e9lo ' + item.name : coins + ' pi\u00e8ces'), created_at: now() });
    return { ok: true, level, choice, coins, bike: item ? bikeOf(item.id) : null };
  });
  on('POST', '/shop/:item/buy', ({ u, p, b }) => {
    requireUser(u); if (!ITEM[p.item]) throw notFound('Objet introuvable.'); const it = effItem(ITEM[p.item]);
    if (!it.available && !it.exclusive) throw forbidden('Cet objet n\u2019est pas en vente pour le moment.');
    if (b && b.price !== undefined && Number(b.price) !== it.price && !it.exclusive) throw new E(409, `Le prix de cet objet vient de changer : ${it.price} pi\u00e8ces. V\u00e9rifie et r\u00e9essaie.`, 'price_changed');
    if (it.exclusive) throw forbidden(`Ce v\u00e9lo ne s\u2019ach\u00e8te pas : il se gagne au palier du niveau ${it.minLevel}.`);
    if (levelInfo(u.xp || 0).level < it.minLevel) throw forbidden(`Cet objet se d\u00e9bloque au niveau ${it.minLevel}.`);
    if (db.items.find(i => i.user_id === u.id && i.item_id === it.id)) throw bad('Tu poss\u00e8des d\u00e9j\u00e0 cet objet.');
    if ((u.coins || 0) < it.price) throw bad(`Il te manque ${it.price - (u.coins || 0)} pi\u00e8ces.`);
    u.coins -= it.price; db.items.push({ user_id: u.id, item_id: it.id, bought_at: now() }); db.ledger.push({ id: id(), user_id: u.id, kind: 'purchase', activity_id: null, xp: 0, coins: -it.price, label: it.name, created_at: now() });
    return { ok: true };
  });
  on('POST', '/shop/:item/equip', ({ u, p }) => { requireUser(u); const it = ITEM[p.item]; if (!it) throw notFound('Objet introuvable.'); if (!db.items.find(i => i.user_id === u.id && i.item_id === it.id)) throw bad('Ach\u00e8te d\u2019abord cet objet.'); if (it.kind === 'wheels') { u.bike_config = { ...(u.bike_config || {}), wheels: it.wheel }; save(); return { ok: true }; } u[SLOT[it.kind]] = it.id; if (it.kind === 'bike' && it.model) u.bike_config = { ...(u.bike_config || {}), model: it.model }; save(); return { ok: true }; });
  on('GET', '/goals', ({ u }) => { requireUser(u); return { items: goalsOf(u.id) }; });
  on('PUT', '/goals', ({ u, b }) => {
    requireUser(u); if (!METRIC_LABEL[b.metric] || !['week', 'month'].includes(b.period)) throw bad('Objectif invalide.');
    const target = int(b.target, 'L\u2019objectif', 1, 100000);
    const g = db.goals.find(g => g.user_id === u.id && g.metric === b.metric && g.period === b.period);
    if (g) { g.target = target; g.last_reached_period = null; } else { if (db.goals.filter(g => g.user_id === u.id).length >= 8) throw bad('Tu peux avoir 8 objectifs au maximum.'); db.goals.push({ id: id(), user_id: u.id, metric: b.metric, period: b.period, target, last_reached_period: null }); }
    checkAchievements(u); return { items: goalsOf(u.id) };
  });
  on('DELETE', '/goals/:id', ({ u, p }) => { requireUser(u); db.goals = db.goals.filter(g => !(g.id === Number(p.id) && g.user_id === u.id)); return { ok: true }; });

  /* ---------- Administration ---------- */
  const lastDays = (list, field) => { const out = []; for (let i = 29; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const k = d.toISOString().slice(0, 10); out.push({ day: k, n: list.filter(x => new Date(x[field]).toISOString().slice(0, 10) === k).length }); } return out; };
  const auditFor = u => can(u, 'audit.view') ? db.audit : db.audit.filter(a => MOD_ACTIONS.includes(a.action));
  on('GET', '/admin/overview', ({ u }) => {
    requirePerm(u, 'admin.access');
    const o = { role: u.role, pendingReports: db.reports.filter(r => r.status !== 'resolved').length, definitions: { active: 'Compte qui a utilis\u00e9 CycleRush (connexion ou action) au cours des 30 derniers jours.', online: 'Compte avec une session ouverte utilis\u00e9e dans les 15 derni\u00e8res minutes. Un compte d\u00e9connect\u00e9 reste inscrit et visible dans la liste.' }, generatedAt: now(), recentAudit: [...auditFor(u)].reverse().slice(0, 10) };
    if (can(u, 'stats.view')) {
      const d30 = Date.now() - 30 * 86400e3, d7 = Date.now() - 7 * 86400e3;
      o.stats = { total: db.users.length, active30: db.users.filter(x => x.last_seen_at && new Date(x.last_seen_at) > d30).length, new7: db.users.filter(x => new Date(x.created_at) > d7).length, new30: db.users.filter(x => new Date(x.created_at) > d30).length, suspended: db.users.filter(x => x.status === 'suspended').length, banned: db.users.filter(x => x.status === 'banned').length, unverified: db.users.filter(x => !x.email_verified_at).length, online: new Set(Object.values(db.sessions)).size };
      o.signups = lastDays(db.users, 'created_at'); o.activity = lastDays(db.activities, 'created_at');
      o.latestUsers = [...db.users].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 8).map(x => userRow(x, u));
    }
    return o;
  });
  on('GET', '/admin/users', ({ u, qs }) => {
    requirePerm(u, 'users.basic');
    const t = (qs.get('q') || '').trim().toLowerCase();
    let l = db.users.filter(x => !t || x.username.toLowerCase().includes(t) || String(x.id) === t || (can(u, 'users.view') && x.email.includes(t)));
    for (const k of ['role', 'status']) if (qs.get(k)) l = l.filter(x => x[k] === qs.get(k));
    if (qs.get('online') === 'yes') l = l.filter(x => Object.values(db.sessions).includes(x.id));
    if (qs.get('verified') === 'yes') l = l.filter(x => x.email_verified_at); if (qs.get('verified') === 'no') l = l.filter(x => !x.email_verified_at);
    const key = { created: 'created_at', username: 'username', seen: 'last_seen_at', id: 'id' }[qs.get('sort')] || 'created_at';
    l.sort((a, b) => String(a[key] ?? '').localeCompare(String(b[key] ?? ''), 'fr', { numeric: true })); if (qs.get('dir') !== 'asc') l.reverse();
    const r = pageOf(l, qs, 25); r.items = r.items.map(x => userRow(x, u)); return r;
  });
  on('GET', '/admin/users/:id', ({ u, p }) => {
    requirePerm(u, 'users.basic'); const t = byId(p.id); if (!t) throw notFound('Compte introuvable.');
    return { user: { ...userRow(t, u), bio: t.bio, privacy: { profile: t.profile_visibility, activities: t.activity_visibility } },
      stats: { activities: db.activities.filter(a => a.user_id === t.id).length, distance_m: db.activities.filter(a => a.user_id === t.id).reduce((s, a) => s + a.distance_m, 0), friends: db.friendships.filter(f => f.status === 'accepted' && (f.requester_id === t.id || f.addressee_id === t.id)).length, reports_against: db.reports.filter(r => r.target_user_id === t.id).length, reports_made: db.reports.filter(r => r.reporter_id === t.id).length },
      history: db.audit.filter(a => a.target_type === 'user' && a.target_id === t.id).reverse(),
      reports: db.reports.filter(r => r.target_user_id === t.id).map(r => ({ ...r, reporter: byId(r.reporter_id)?.username })).reverse(),
      bikes: can(u, 'users.manage') ? ITEMS.filter(i => i.kind === 'bike').map(i => ({ id: i.id, name: i.name, price: i.price, image: i.image || null, owned: db.items.some(x => x.user_id === t.id && x.item_id === i.id), riding: ((t.bike_config && t.bike_config.model) || 'aero') === i.model })) : undefined };
  });
  const suspend = (a, t, days, reason) => { const e = new Date(); e.setDate(e.getDate() + days); t.status = 'suspended'; t.status_reason = reason; t.suspended_until = e.toISOString(); killSessions(t.id); audit(a, 'user.suspend', 'user', t.id, t.username, { days, reason }); notify(t.id, 'account_suspended', { days }); };
  const ban = (a, t, reason) => { t.status = 'banned'; t.status_reason = reason; t.suspended_until = null; killSessions(t.id); audit(a, 'user.ban', 'user', t.id, t.username, { reason }); };
  const reason = (b, min = 5) => str(b.reason, 'Le motif', min, 500);
  const userAction = action => ({ u, p, b }) => {
    const t = byId(p.id); if (!t) throw notFound('Compte introuvable.');
    if (action === 'suspend') { requirePerm(u, 'users.suspend'); requireOutranks(u, t); if (t.status === 'banned') throw bad('Ce compte est banni.'); suspend(u, t, int(b.days, 'La dur\u00e9e', 1, can(u, 'users.manage') ? 365 : 30), reason(b)); }
    else if (action === 'reactivate') { requirePerm(u, t.status === 'banned' ? 'users.manage' : 'users.suspend'); requireOutranks(u, t); if (t.status === 'active') throw bad('Ce compte est d\u00e9j\u00e0 actif.'); const from = t.status; t.status = 'active'; t.status_reason = null; t.suspended_until = null; audit(u, 'user.reactivate', 'user', t.id, t.username, { from, reason: b.reason || null }); }
    else if (action === 'ban') { requirePerm(u, 'users.manage'); requireOutranks(u, t); ban(u, t, reason(b)); }
    else if (action === 'verify-email') { requirePerm(u, 'users.manage'); t.email_verified_at = t.email_verified_at || now(); audit(u, 'user.verify_email', 'user', t.id, t.username); }
    else if (action === 'role') {
      requirePerm(u, 'roles.manage'); if (!ROLE_LEVEL.hasOwnProperty(b.role)) throw bad('Le r\u00f4le est invalide.');
      if (t.id === u.id) throw forbidden('Tu ne peux pas changer ton propre r\u00f4le.'); if (t.status !== 'active') throw bad('Seul un compte actif peut recevoir un r\u00f4le.'); if (b.role !== 'superadmin' && t.email === ADMIN_EMAILS[0]) throw forbidden('Le r\u00f4le du propri\u00e9taire du site ne peut pas \u00eatre modifi\u00e9.');
      if (t.role === 'superadmin' && b.role !== 'superadmin' && db.users.filter(x => x.role === 'superadmin').length <= 1) throw forbidden('Il doit rester au moins un super-administrateur.');
      const from = t.role; t.role = b.role; killSessions(t.id); audit(u, 'user.role', 'user', t.id, t.username, { from, to: b.role }); notify(t.id, 'role_changed', { role: ROLE_LABEL[b.role] });
    }
    else if (action === 'rewards') {
      if (!can(u, 'economy.manage')) requirePerm(u, 'users.manage'); const xp = int(b.xp ?? 0, 'L\u2019XP', -100000, 100000), coins = int(b.coins ?? 0, 'Les pi\u00e8ces', -100000, 100000);
      if (!xp && !coins) throw bad('Indique une quantit\u00e9 d\u2019XP ou de pi\u00e8ces.'); const why = reason(b); claimOp(b.opKey, u, 'user.rewards');
      const before = { xp: t.xp || 0, coins: t.coins || 0 }, r = credit(t.id, 'admin', xp, coins, 'Ajustement de l\u2019\u00e9quipe : ' + why);
      audit(u, 'user.rewards', 'user', t.id, t.username, { xp: r?.xp ?? 0, coins: r?.coins ?? 0, asked: { xp, coins }, before, after: { xp: t.xp || 0, coins: t.coins || 0 }, reason: why });
    }
    else if (action === 'bikes') {
      requirePerm(u, 'users.manage'); if (!['give', 'take'].includes(b.op)) throw bad('L\u2019op\u00e9ration est invalide.');
      const it = ITEMS.find(i => i.kind === 'bike' && i.id === b.item); if (!it) throw bad('Ce v\u00e9lo n\u2019existe pas.');
      const why = reason(b), has = db.items.some(x => x.user_id === t.id && x.item_id === it.id);
      if (b.op === 'give') { if (has) throw bad('Ce membre a d\u00e9j\u00e0 ce v\u00e9lo.'); db.items.push({ user_id: t.id, item_id: it.id, bought_at: now() }); }
      else { if (!has) throw bad('Ce membre n\u2019a pas ce v\u00e9lo.'); db.items = db.items.filter(x => !(x.user_id === t.id && x.item_id === it.id)); if (t.equipped_bike === it.id) t.equipped_bike = null; if (t.bike_config && t.bike_config.model === it.model) t.bike_config = { ...t.bike_config, model: 'aero' }; }
      db.ledger.push({ id: id(), user_id: t.id, kind: 'admin', activity_id: null, xp: 0, coins: 0, label: (b.op === 'give' ? 'V\u00e9lo offert par l\u2019\u00e9quipe : ' : 'V\u00e9lo retir\u00e9 par l\u2019\u00e9quipe : ') + it.name + ' \u2014 ' + why, created_at: now() });
      audit(u, b.op === 'give' ? 'user.bike_give' : 'user.bike_take', 'user', t.id, t.username, { bike: it.name, reason: why });
    }
    return { ok: true };
  };
  for (const a of ['suspend', 'reactivate', 'ban', 'verify-email', 'role', 'rewards', 'bikes']) on('POST', `/admin/users/:id/${a}`, userAction(a));
  on('DELETE', '/admin/users/:id', ({ u, p, b }) => { requirePerm(u, 'users.manage'); const t = byId(p.id); if (!t) throw notFound('Compte introuvable.'); requireOutranks(u, t); if (b.confirm !== t.username) throw bad(`Pour confirmer, saisis exactement le nom d\u2019utilisateur \u00ab ${t.username} \u00bb.`); const r = reason(b); audit(u, 'user.delete', 'user', t.id, t.username, { reason: r }); deleteUser(t.id); return { ok: true }; });
  on('GET', '/admin/reports', ({ u, qs }) => {
    requirePerm(u, 'reports.view'); const st = qs.get('status');
    let l = db.reports.filter(r => ['pending', 'in_progress', 'resolved'].includes(st) ? r.status === st : st === 'all' ? true : r.status !== 'resolved');
    l = l.sort((a, b) => (a.status === 'resolved') - (b.status === 'resolved') || a.created_at.localeCompare(b.created_at));
    const r = pageOf(l, qs, 20); r.items = r.items.map(x => ({ ...x, reporter: byId(x.reporter_id)?.username, target_username: byId(x.target_user_id)?.username, target_status: byId(x.target_user_id)?.status, assignee: byId(x.assigned_to)?.username })); return r;
  });
  on('GET', '/admin/reports/:id', ({ u, p }) => {
    requirePerm(u, 'reports.view'); const r = db.reports.find(x => x.id === Number(p.id)); if (!r) throw notFound('Signalement introuvable.');
    const t = byId(r.target_user_id), mine = db.reports.filter(x => x.reporter_id === r.reporter_id);
    return { report: { ...r, reporter: byId(r.reporter_id)?.username, assignee: byId(r.assigned_to)?.username }, target: t ? { ...userRow(t, u), bio: t.bio } : null, activity: r.target_type === 'activity' ? db.activities.find(a => a.id === r.target_id) || null : null,
      notes: db.notes.filter(n => n.report_id === r.id), history: db.audit.filter(a => a.target_type === 'report' && a.target_id === r.id), otherReports: db.reports.filter(x => x.id !== r.id && x.target_type === r.target_type && x.target_id === r.target_id).length,
      reporterStats: r.reporter_id ? { total: mine.length, no_action: mine.filter(x => x.decision === 'no_action').length } : null };
  });
  const reportAction = action => ({ u, p, b }) => {
    requirePerm(u, 'reports.handle'); const r = db.reports.find(x => x.id === Number(p.id)); if (!r) throw notFound('Signalement introuvable.');
    if (action === 'status') { if (r.status === 'resolved') throw bad('Ce signalement est d\u00e9j\u00e0 r\u00e9solu.'); if (!['pending', 'in_progress'].includes(b.status)) throw bad('Statut invalide.'); r.status = b.status; r.assigned_to = b.status === 'in_progress' ? u.id : null; audit(u, 'report.status', 'report', r.id, '#' + r.id, { status: b.status }); return { ok: true }; }
    if (action === 'note') { db.notes.push({ id: id(), report_id: r.id, author_name: u.username, note: str(b.note, 'La note', 2, 2000), created_at: now() }); audit(u, 'report.note', 'report', r.id, '#' + r.id); return { ok: true }; }
    if (r.status === 'resolved') throw bad('Ce signalement est d\u00e9j\u00e0 r\u00e9solu.');
    const dec = b.decision; if (!['no_action', 'warning', 'content_hidden', 'suspended', 'banned'].includes(dec)) throw bad('La d\u00e9cision est invalide.');
    const why = reason(b, 3), t = byId(r.target_user_id);
    if (['warning', 'suspended', 'banned'].includes(dec) && !t) throw bad('Le compte vis\u00e9 n\u2019existe plus.');
    if (dec === 'content_hidden' && r.target_type !== 'activity') throw bad('Seule une activit\u00e9 peut \u00eatre masqu\u00e9e.');
    if (dec === 'suspended') { requirePerm(u, 'users.suspend'); requireOutranks(u, t); suspend(u, t, int(b.days, 'La dur\u00e9e', 1, can(u, 'users.manage') ? 365 : 30), why); }
    if (dec === 'banned') { requirePerm(u, 'users.manage'); requireOutranks(u, t); ban(u, t, why); }
    if (dec === 'content_hidden') { const a = db.activities.find(x => x.id === r.target_id); if (a && !a.hidden) { a.hidden = true; reverseActivity(a.id, 'Activit\u00e9 masqu\u00e9e par la mod\u00e9ration'); } audit(u, 'activity.hide', 'activity', r.target_id, t?.username, { reason: why }); if (t) notify(t.id, 'content_hidden', { reason: why }); }
    if (dec === 'warning') notify(t.id, 'moderation_warning', { reason: why });
    for (const x of db.reports) if (x.target_type === r.target_type && x.target_id === r.target_id && x.status !== 'resolved') { x.status = 'resolved'; x.decision = dec; x.decision_reason = why; x.resolved_by = u.id; }
    audit(u, 'report.resolve', 'report', r.id, '#' + r.id, { decision: dec, reason: why });
    if (r.reporter_id) notify(r.reporter_id, 'report_resolved', { id: r.id });
    return { ok: true };
  };
  for (const a of ['status', 'note', 'resolve']) on('POST', `/admin/reports/:id/${a}`, reportAction(a));
  on('GET', '/admin/activities', ({ u, qs }) => { requirePerm(u, 'content.manage'); const t = (qs.get('q') || '').toLowerCase(); const l = db.activities.map(a => ({ ...a, username: byId(a.user_id)?.username || '?' })).filter(a => (!t || a.title.toLowerCase().includes(t) || a.username.toLowerCase().includes(t)) && (qs.get('hidden') !== 'yes' || a.hidden)).sort((a, b) => b.created_at.localeCompare(a.created_at)); return pageOf(l, qs, 25); });
  for (const a of ['hide', 'unhide']) on('POST', `/admin/activities/:id/${a}`, ({ u, p }) => { requirePerm(u, 'content.manage'); const x = db.activities.find(y => y.id === Number(p.id)); if (!x) throw notFound('Activit\u00e9 introuvable.'); if (x.hidden === (a === 'hide')) throw bad('Rien \u00e0 changer.'); x.hidden = a === 'hide'; if (a === 'hide') reverseActivity(x.id, 'Activit\u00e9 masqu\u00e9e par la mod\u00e9ration'); else awardActivity(x); audit(u, 'activity.' + a, 'activity', x.id, `${byId(x.user_id)?.username} \u2014 ${x.title}`); return { ok: true }; });
  on('GET', '/admin/challenges', ({ u }) => { requirePerm(u, 'content.manage'); return { items: [...db.challenges].reverse().map(c => ({ ...c, unit: METRIC_LABEL[c.metric], participants: db.parts.filter(p => p.challenge_id === c.id).length, completed: db.parts.filter(p => p.challenge_id === c.id && p.completed_at).length })) }; });
  const chSave = ({ u, p, b }) => {
    requirePerm(u, 'content.manage'); const title = str(b.title, 'Le titre', 3, 80); if (!METRIC_LABEL[b.metric]) throw bad('La mesure est invalide.');
    const s = new Date(b.startsAt), e = new Date(b.endsAt); if (isNaN(s) || isNaN(e) || e <= s) throw bad('Les dates du d\u00e9fi sont invalides (la fin doit suivre le d\u00e9but).');
    const data = { title, description: str(b.description, 'La description', 0, 600), metric: b.metric, target: int(b.target, 'L\u2019objectif', 1, 1e6), starts_at: s.toISOString(), ends_at: e.toISOString(), published: b.published !== false };
    if (p.id) { const c = db.challenges.find(x => x.id === Number(p.id)); if (!c) throw notFound('D\u00e9fi introuvable.'); Object.assign(c, data); audit(u, 'challenge.update', 'challenge', c.id, title); return { ok: true, id: c.id }; }
    const c = { id: id(), ...data, created_by: u.id, created_at: now() }; db.challenges.push(c); audit(u, 'challenge.create', 'challenge', c.id, title); return { status: 201, data: { ok: true, id: c.id } };
  };
  on('POST', '/admin/challenges', chSave); on('PUT', '/admin/challenges/:id', chSave);
  on('DELETE', '/admin/challenges/:id', ({ u, p }) => { requirePerm(u, 'content.manage'); const c = db.challenges.find(x => x.id === Number(p.id)); if (!c) throw notFound('D\u00e9fi introuvable.'); db.challenges = db.challenges.filter(x => x !== c); db.parts = db.parts.filter(x => x.challenge_id !== c.id); audit(u, 'challenge.delete', 'challenge', c.id, c.title); return { ok: true }; });
  on('GET', '/admin/announcements', ({ u }) => { requirePerm(u, 'content.manage'); return { items: [...db.announcements].reverse().map(a => ({ ...a, author: byId(a.created_by)?.username })) }; });
  on('POST', '/admin/announcements', ({ u, b }) => { requirePerm(u, 'content.manage'); const a = { id: id(), title: str(b.title, 'Le titre', 3, 100), body: str(b.body, 'Le message', 3, 1000), created_by: u.id, created_at: now() }; db.announcements.push(a); const rec = db.users.filter(x => x.status === 'active'); rec.forEach(x => notify(x.id, 'announcement', { announcementId: a.id, title: a.title, body: a.body })); audit(u, 'announcement.create', 'announcement', a.id, a.title, { recipients: rec.length }); return { status: 201, data: { ok: true, recipients: rec.length } }; });
  on('DELETE', '/admin/announcements/:id', ({ u, p }) => { requirePerm(u, 'content.manage'); const a = db.announcements.find(x => x.id === Number(p.id)); if (!a) throw notFound('Annonce introuvable.'); db.announcements = db.announcements.filter(x => x !== a); db.notifs = db.notifs.filter(n => !(n.kind === 'announcement' && n.data.announcementId === a.id)); audit(u, 'announcement.delete', 'announcement', a.id, a.title); return { ok: true }; });
  on('GET', '/admin/settings', ({ u }) => { requirePerm(u, 'settings.general'); return { values: { ...db.settings }, sensitive: SENSITIVE, canEditSensitive: can(u, 'settings.sensitive') }; });
  on('PATCH', '/admin/settings', ({ u, b }) => {
    requirePerm(u, 'settings.general'); const ch = {};
    for (const [k, v] of Object.entries(b)) { if (!(k in SETTINGS)) throw bad('R\u00e9glage inconnu : ' + k); if (SENSITIVE.includes(k)) requirePerm(u, 'settings.sensitive'); const val = k === 'session_days' ? int(v, 'La dur\u00e9e de session', 1, 90) : v; if (JSON.stringify(db.settings[k]) !== JSON.stringify(val)) ch[k] = { from: db.settings[k], to: val }; db.settings[k] = val; }
    if (Object.keys(ch).length) audit(u, 'settings.update', 'settings', null, Object.keys(ch).join(', '), ch); return { ok: true };
  });
  on('GET', '/admin/audit', ({ u, qs }) => { requirePerm(u, 'audit.moderation'); let l = [...auditFor(u)].reverse(); if (qs.get('action')) l = l.filter(a => a.action.startsWith(qs.get('action'))); if (qs.get('actor')) l = l.filter(a => a.actor_name.toLowerCase() === qs.get('actor').toLowerCase()); return pageOf(l, qs, 30); });

  /* ---------- Point d'entr\u00e9e ---------- */
  /* ---------- R\u00e9glages synchronis\u00e9s, \u00e9quipements de l'\u00e9quipe, multijoueur (m\u00eames r\u00e8gles que le serveur) ---------- */
  const PREF_OK = { ftp: v => Number.isInteger(v) && v >= 80 && v <= 600, kg: v => typeof v === 'number' && Number.isFinite(v) && v >= 35 && v <= 160 && Math.abs(v * 10 - Math.round(v * 10)) < 1e-9, age: v => Number.isInteger(v) && v >= 13 && v <= 100, gender: v => ['homme', 'femme', 'non_precise'].includes(v), sound: v => typeof v === 'boolean', spatial: v => typeof v === 'boolean' };
  const PREF_ERR = { ftp: 'Le FTP doit \u00eatre un nombre entier de watts entre 80 et 600.', kg: 'Le poids doit \u00eatre compris entre 35 et 160 kg (au dixi\u00e8me pr\u00e8s, par exemple 72,5).', age: 'L\u2019\u00e2ge doit \u00eatre un nombre entier entre 13 et 100 ans.', gender: 'Le genre doit \u00eatre \u00ab Homme \u00bb, \u00ab Femme \u00bb ou \u00ab Pr\u00e9f\u00e8re ne pas pr\u00e9ciser \u00bb.' };
  on('PATCH', '/me/prefs', ({ u, b }) => {
    requireUser(u); const set = b.set && typeof b.set === 'object' && !Array.isArray(b.set) ? b.set : {}, unset = Array.isArray(b.unset) ? b.unset : [];
    if (!Object.keys(set).length && !unset.length) throw bad('Rien \u00e0 enregistrer.');
    for (const [k, v] of Object.entries(set)) { if (!PREF_OK[k]) throw bad(`R\u00e9glage inconnu : ${k}.`); if (!PREF_OK[k](v)) throw bad(PREF_ERR[k] || `Valeur non autoris\u00e9e pour \u00ab ${k} \u00bb.`, k); }
    for (const k of unset) { if (!['ftp', 'kg', 'age', 'gender'].includes(k)) throw bad(`Ce r\u00e9glage ne peut pas \u00eatre effac\u00e9 : ${k}.`); if (k in set) throw bad(`\u00ab ${k} \u00bb ne peut pas \u00eatre \u00e0 la fois enregistr\u00e9 et effac\u00e9.`); }
    u.prefs = u.prefs || {}; for (const [k, v] of Object.entries(set)) if (!(b.ifMissing === true && u.prefs[k])) u.prefs[k] = { v, at: Date.now() };
    if (b.ifMissing !== true) for (const k of unset) u.prefs[k] = { v: null, at: Date.now() };
    return { prefs: Object.fromEntries(Object.entries(u.prefs).filter(([k]) => PREF_OK[k])) };
  });
  PERMS['mp.view'] = 1; PERMS['mp.manage'] = 2; PERMS['items.grant'] = 2; PERMS['economy.manage'] = 2; PERMS['routes.view'] = 2; PERMS['routes.manage'] = 2;
  const EQUIP = () => ITEMS.filter(i => i.kind === 'bike' || i.kind === 'wheels');
  on('GET', '/admin/equipment', ({ u, qs }) => {
    requirePerm(u, 'items.grant'); const who = qs.get('user'); let t = null;
    if (who) { t = who === 'me' ? u : byId(who); if (!t) throw notFound('Compte introuvable.'); }
    const owned = new Set(t ? db.items.filter(x => x.user_id === t.id).map(x => x.item_id) : []), bc = (t && t.bike_config) || {};
    return { items: EQUIP().map(i => ({ id: i.id, kind: i.kind, name: i.name, desc: i.desc, price: i.price, image: i.image || null, owned: t ? owned.has(i.id) : undefined, inUse: t ? (i.kind === 'bike' ? (bc.model || 'aero') === i.model : (bc.wheels || 'moyen') === i.wheel) : undefined })), target: t ? { id: t.id, username: t.username, me: t.id === u.id } : null };
  });
  on('POST', '/admin/equipment', ({ u, b }) => {
    requirePerm(u, 'items.grant'); if (!['give', 'take'].includes(b.op)) throw bad('L\u2019op\u00e9ration est invalide.');
    const it = EQUIP().find(i => i.id === b.item); if (!it) throw bad('Cet \u00e9quipement n\u2019existe pas.');
    const t = b.user === 'me' ? u : byId(b.user); if (!t) throw notFound('Compte introuvable.'); const self = t.id === u.id;
    if (!self && b.op === 'take') requireOutranks(u, t);
    const why = b.reason ? str(b.reason, 'Le motif', 3, 500) : (self ? 'Attribution \u00e0 son propre compte' : null); if (!why) throw bad('Indique un motif (au moins 3 caract\u00e8res).');
    const has = db.items.some(x => x.user_id === t.id && x.item_id === it.id);
    claimOp(b.opKey, u, 'user.item_' + b.op);
    if (b.op === 'give') { if (has) throw new E(409, self ? 'Tu as d\u00e9j\u00e0 cet \u00e9quipement dans ton inventaire.' : 'Ce membre a d\u00e9j\u00e0 cet \u00e9quipement.', 'already_owned'); db.items.push({ user_id: t.id, item_id: it.id, bought_at: now() }); }
    else {
      if (!has) throw new E(409, self ? 'Tu n\u2019as pas cet \u00e9quipement.' : 'Ce membre n\u2019a pas cet \u00e9quipement.', 'not_owned');
      db.items = db.items.filter(x => !(x.user_id === t.id && x.item_id === it.id));
      if (it.kind === 'bike') { if (t.equipped_bike === it.id) t.equipped_bike = null; if (t.bike_config && t.bike_config.model === it.model) t.bike_config.model = 'aero'; }
      else if (t.bike_config && t.bike_config.wheels === it.wheel) t.bike_config.wheels = 'moyen';
    }
    db.ledger.push({ id: id(), user_id: t.id, kind: 'admin', activity_id: null, xp: 0, coins: 0, label: (b.op === 'give' ? '\u00c9quipement offert par l\u2019\u00e9quipe : ' : '\u00c9quipement retir\u00e9 par l\u2019\u00e9quipe : ') + it.name + ' \u2014 ' + why, created_at: now() });
    audit(u, b.op === 'give' ? 'user.item_give' : 'user.item_take', 'user', t.id, t.username, { item: it.name, itemId: it.id, kind: it.kind, self, reason: why, before: b.op === 'give' ? 'non poss\u00e9d\u00e9' : 'poss\u00e9d\u00e9', after: b.op === 'give' ? 'poss\u00e9d\u00e9' : 'non poss\u00e9d\u00e9' });
    return { ok: true, item: { id: it.id, name: it.name, kind: it.kind }, user: { id: t.id, username: t.username } };
  });
  // Salons multijoueur (sorties entre amis et courses) : m\u00eames r\u00e8gles que server/multiplayer.mjs.
  // D\u00e9mo : les donn\u00e9es restent dans ce navigateur (aucun serveur) \u2014 une session ne relie donc pas plusieurs appareils,
  // et une course (au moins deux coureurs connect\u00e9s en m\u00eame temps) ne peut pas \u00eatre lanc\u00e9e seul ici.
  db.mp = db.mp || { sessions: [], players: [], events: [] };
  db.mp.invites = db.mp.invites || []; db.mp.splits = db.mp.splits || []; db.mp.results = db.mp.results || [];
  const MPR = { maxPlayers: 8, connectedS: 12, leaveAfterMin: 20, idleEndMin: 30, countdownS: 10, raceDropS: 120, splitM: 500, raceMinMs: 3, bonusPerDay: 3, maxSpeedMs: 25 };
  const RACE_BONUS = { coins: [120, 80, 50], xp: [150, 100, 75], finisherCoins: 20, finisherXp: 40 };
  const MPL = { waiting: 'En attente', riding: 'En route', paused: 'En pause', finished: 'Arriv\u00e9', left: 'A quitt\u00e9 la session' };
  const MPACC = { code: 'Toute personne qui a le code ou le lien', friends: 'Amis de l\u2019organisateur et invit\u00e9s', approval: 'Sur acceptation de l\u2019organisateur' };
  const MPE = { created: 'a cr\u00e9\u00e9 la session', joined: 'a rejoint la session', rejoined: 'est revenu dans la session', left: 'a quitt\u00e9 la session', timeout: 'a \u00e9t\u00e9 retir\u00e9 (absent depuis longtemps)', riding: 'roule', paused: 'est en pause', finished: 'est arriv\u00e9', waiting: 'attend le d\u00e9part', disconnected: 'a perdu la connexion', reconnected: 'est reconnect\u00e9', ended: 'a termin\u00e9 la session', closed: 'a ferm\u00e9 la session',
    requested: 'demande \u00e0 rejoindre', approved: 'a \u00e9t\u00e9 accept\u00e9', kicked: 'a \u00e9t\u00e9 retir\u00e9 par l\u2019organisateur', invited: 'a \u00e9t\u00e9 invit\u00e9', started: 'a lanc\u00e9 le d\u00e9part', race_finished: 'course termin\u00e9e', dnf: 'ne sera pas class\u00e9' };
  const T = d => d ? Date.parse(d) : null;
  const mpEv = (s, usr, kind, at) => db.mp.events.push({ id: id(), session_id: s.id, user_id: usr ? usr.id : null, username: usr ? usr.username : null, kind, created_at: at || now() });
  const mpIn = s => db.mp.players.filter(p => p.session_id === s.id && !p.left_at && !p.pending);
  const mpP = (s, uid) => db.mp.players.find(x => x.session_id === s.id && x.user_id === uid);
  const isFriendD = (a, b) => { const f = pair(a, b); return !!f && f.status === 'accepted'; };
  const mpSweep = () => {
    for (const p of db.mp.players) if (!p.left_at && Date.now() - T(p.seen_at) > MPR.leaveAfterMin * 60e3) { p.left_at = now(); p.state = 'left'; const s = db.mp.sessions.find(x => x.id === p.session_id); s && mpEv(s, byId(p.user_id), 'timeout'); }
    for (const s of db.mp.sessions) if (s.status === 'open' && (!db.mp.players.some(p => p.session_id === s.id && !p.left_at) || Date.now() - T(s.created_at) > 12 * 3600e3)) { s.status = 'ended'; s.ended_at = now(); s.end_reason = 'Plus aucun participant'; }
  };
  const mpByCode = c => { c = String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); const s = c.length === 6 && db.mp.sessions.find(x => x.code === c); if (!s) throw new E(404, c.length === 6 ? 'Ce code ne correspond \u00e0 aucune session dans ce navigateur. Dans cette version de d\u00e9monstration, les donn\u00e9es restent sur l\u2019appareil qui a cr\u00e9\u00e9 la session : un ami sur un autre appareil ne peut pas la rejoindre. Pour rouler \u00e0 plusieurs, utilise CycleRush en ligne (version Netlify).' : 'Ce code ne correspond \u00e0 aucune session. V\u00e9rifie les 6 caract\u00e8res.', 'mp_invalid_code'); return s; };
  const mpEnded = s => new E(410, s.status === 'closed' ? 'Cette session a \u00e9t\u00e9 ferm\u00e9e par l\u2019\u00e9quipe CycleRush.' : 'Cette session est termin\u00e9e.', 'mp_session_ended', { status: s.status });
  const mpView = s => ({ code: s.code, routeId: s.route_id, routeName: RROUTES[s.route_id][0], status: s.status, maxPlayers: s.max_players, createdAt: s.created_at, hostId: s.host_id, endReason: s.end_reason || null,
    mode: s.mode || 'ride', access: s.access || 'code', accessLabel: MPACC[s.access || 'code'], phase: s.phase || 'running', startAt: T(s.start_at), raceM: s.race_m ?? null, finishedAt: T(s.finished_at), title: s.title || null });
  const mpConn = p => !p.left_at && Date.now() - T(p.seen_at) < MPR.connectedS * 1000;
  const mpPV = (s, p, viewer) => { const x = byId(p.user_id) || {}; return { id: p.user_id, username: x.username, slot: p.slot, state: p.left_at ? 'left' : p.state, stateLabel: MPL[p.left_at ? 'left' : p.state], connected: mpConn(p), s: p.s, v: p.v, road: p.road ?? -1, u: p.u || 0, at: T(p.seen_at), me: p.user_id === viewer, host: p.user_id === s.host_id, rider: x.rider_config || null, bike: { ...DEF_BIKE, ...(x.bike_config || {}) }, raceS: p.race_s || 0, finishMs: p.finish_ms ?? null, dnf: p.dnf || null }; };
  function mpRank(list, s) {
    const nw = Date.now(); for (const p of list) p.liveS = p.finishMs !== null || p.dnf || p.gone ? p.raceS : Math.min(s.race_m, p.raceS + (p.v || 0) * Math.min(2, Math.max(0, (nw - p.at) / 1000)));
    const order = [...list].sort((a, b) => (a.dnf ? 1 : 0) - (b.dnf ? 1 : 0) || (a.finishMs === null) - (b.finishMs === null) || (a.finishMs ?? 0) - (b.finishMs ?? 0) || b.liveS - a.liveS);
    const by = {}; for (const r of db.mp.splits.filter(r => r.session_id === s.id)) (by[r.user_id] ||= {})[r.mark] = r.t_ms;
    const lead = order[0];
    order.forEach((p, i) => {
      p.rank = p.dnf ? null : i + 1;
      if (!lead || p === lead || p.dnf) { p.gapMs = null; p.gapM = p === lead ? 0 : null; return; }
      p.gapM = Math.max(0, Math.round((lead.finishMs !== null ? s.race_m : lead.liveS) - (p.finishMs !== null ? s.race_m : p.liveS)));
      if (p.finishMs !== null && lead.finishMs !== null) { p.gapMs = p.finishMs - lead.finishMs; return; }
      const k = Math.floor(p.raceS / MPR.splitM), mine = by[p.id] && by[p.id][k], his = by[lead.id] && by[lead.id][k];
      p.gapMs = k > 0 && mine !== undefined && his !== undefined ? Math.max(0, mine - his) : null;
    });
    for (const p of order) delete p.liveS;
    return order;
  }
  const mpPlayers = (s, viewer) => {
    let list = mpIn(s).sort((a, b) => a.slot - b.slot).map(p => mpPV(s, p, viewer));
    if (s.mode === 'race' && s.phase !== 'lobby') {
      list = list.concat(db.mp.players.filter(p => p.session_id === s.id && p.left_at && !p.pending && (p.race_s > 0 || p.dnf)).map(p => ({ ...mpPV(s, p, viewer), gone: true })));
      list = mpRank(list, s);
    }
    return list;
  };
  const mpFull = (s, u) => { const o = { session: mpView(s), players: mpPlayers(s, u.id), now: Date.now() }; if (s.host_id === u.id) o.pending = db.mp.players.filter(p => p.session_id === s.id && !p.left_at && p.pending).map(p => ({ id: p.user_id, username: byId(p.user_id)?.username, at: p.joined_at })); return o; };
  const raceLimitMs = s => s.race_m / MPR.raceMinMs * 1000 + 10 * 60000;
  function mpFinalize(s, dnfReason) {
    if (s.phase === 'finished') return;
    const ps = db.mp.players.filter(p => p.session_id === s.id && !p.pending);
    if (dnfReason) ps.forEach(p => { if (p.finish_ms == null && !p.dnf) p.dnf = dnfReason; });
    ps.sort((a, b) => (a.finish_ms == null) - (b.finish_ms == null) || (a.finish_ms ?? 0) - (b.finish_ms ?? 0) || (b.race_s || 0) - (a.race_s || 0));
    const starters = ps.filter(p => p.finish_ms != null || p.race_s > 0).length; let place = 0;
    for (const p of ps) {
      if (db.mp.results.some(r => r.session_id === s.id && r.user_id === p.user_id)) continue; // \u00e9crit une seule fois
      const fin = p.finish_ms != null && !p.dnf; if (fin) place++;
      const verified = fin && (db.rides || []).some(r => r.user_id === p.user_id && r.kind === 'route' && r.route_id === s.route_id && T(r.started_at) >= T(s.start_at) - 120e3 && ['active', 'saved'].includes(r.status) && r.distance_m >= Math.max(0, s.race_m - 700) && r.measured_s >= r.elapsed_s * 0.8);
      const row = { session_id: s.id, user_id: p.user_id, place: fin ? place : null, status: fin ? 'finished' : 'dnf', finish_ms: fin ? p.finish_ms : null, distance_m: Math.round(Math.min(s.race_m, p.race_s || 0)), verified, bonus_coins: 0, bonus_xp: 0, created_at: now() };
      db.mp.results.push(row);
      if (!fin || !verified || starters < 2) continue;
      const day = new Date().toDateString(); if (db.mp.results.filter(r => r.user_id === p.user_id && r.bonus_coins > 0 && new Date(r.created_at).toDateString() === day).length >= MPR.bonusPerDay) continue;
      row.bonus_coins = RACE_BONUS.coins[place - 1] ?? RACE_BONUS.finisherCoins; row.bonus_xp = RACE_BONUS.xp[place - 1] ?? RACE_BONUS.finisherXp;
      credit(p.user_id, 'race', row.bonus_xp, row.bonus_coins, `Course ${RROUTES[s.route_id][0]} (${s.code}) : ${place}${place === 1 ? 're' : 'e'} place`);
    }
    mpEv(s, null, 'race_finished'); s.phase = 'finished'; s.finished_at = now();
  }
  function mpAdvance(s) {
    if (s.status !== 'open') return;
    if (s.phase === 'countdown' && Date.now() >= T(s.start_at)) s.phase = 'running';
    if (s.mode !== 'race' || s.phase !== 'running') return;
    for (const p of db.mp.players) if (p.session_id === s.id && !p.pending && p.finish_ms == null && !p.dnf && (p.left_at || Date.now() - T(p.seen_at) > MPR.raceDropS * 1000)) { p.dnf = 'connexion perdue'; mpEv(s, byId(p.user_id), 'dnf'); }
    const open = db.mp.players.filter(p => p.session_id === s.id && !p.pending && !p.kicked && p.finish_ms == null && !p.dnf).length;
    if (open === 0 || Date.now() > T(s.start_at) + raceLimitMs(s)) mpFinalize(s, open ? 'temps limite d\u00e9pass\u00e9' : null);
  }
  function mpAdmission(s, u, p) {
    if (p && p.kicked) throw forbidden('L\u2019organisateur t\u2019a retir\u00e9 de cette session : tu ne peux plus la rejoindre.');
    if (p && !p.left_at) return p.pending ? 'pending' : 'ok';
    if (s.mode === 'race' && s.phase !== 'lobby') {
      if (p && (p.finish_ms != null || p.dnf || p.race_s > 0)) throw new E(409, 'Tu as quitt\u00e9 cette course apr\u00e8s le d\u00e9part : tu ne peux plus y revenir.', 'mp_race_left');
      throw new E(409, 'Cette course a d\u00e9j\u00e0 commenc\u00e9 : on ne peut plus la rejoindre.', 'mp_race_started');
    }
    if (s.host_id === u.id || s.access === 'code') return 'ok';
    if (p && !p.pending && p.joined_at) return 'ok';
    if (db.mp.invites.some(i => i.session_id === s.id && i.user_id === u.id)) return 'ok';
    if (s.access === 'friends') { if (isFriendD(s.host_id, u.id)) return 'ok'; throw new E(403, 'Session priv\u00e9e : seuls les amis de l\u2019organisateur et les personnes invit\u00e9es peuvent la rejoindre.', 'mp_private'); }
    return 'pending';
  }
  const mpLeaveOthers = (u, keep) => { for (const p of db.mp.players) if (p.user_id === u.id && !p.left_at && p.session_id !== keep) { p.left_at = now(); p.state = 'left'; p.pending = false; mpEv(db.mp.sessions.find(s => s.id === p.session_id), u, 'left'); } mpSweep(); };
  const mpAdd = (s, u, quiet) => {
    const p = mpP(s, u.id), adm = mpAdmission(s, u, p);
    if (p && !p.left_at) { p.seen_at = now(); return p.pending ? 'pending' : 'already'; }
    const fresh = { slot: -1, state: 'waiting', s: 0, v: 0, epoch: null, seen_at: now(), left_at: null, race_s: 0, race_at: null, finish_ms: null, dnf: null };
    if (adm === 'pending') { if (p) Object.assign(p, fresh, { pending: true }); else db.mp.players.push({ session_id: s.id, user_id: u.id, joined_at: now(), kicked: false, ...fresh, pending: true }); if (!quiet) mpEv(s, u, 'requested'); return 'pending'; }
    if (mpIn(s).length >= s.max_players) throw new E(409, `Cette session est compl\u00e8te (${s.max_players} participants au maximum).`, 'mp_session_full');
    const used = new Set(mpIn(s).map(x => x.slot)); let slot = 0; while (used.has(slot)) slot++;
    if (p) Object.assign(p, fresh, { slot, pending: false }); else db.mp.players.push({ session_id: s.id, user_id: u.id, joined_at: now(), kicked: false, ...fresh, slot, pending: false });
    if (!quiet) mpEv(s, u, p ? 'rejoined' : 'joined'); return p ? 'rejoined' : 'joined';
  };
  const mpHost = (u, code) => { const s = mpByCode(code); if (s.host_id !== u.id) throw forbidden('Seule la personne qui a cr\u00e9\u00e9 la session peut faire cela.'); if (s.status !== 'open') throw mpEnded(s); return s; };
  on('POST', '/mp/sessions', ({ u, b }) => {
    requireUser(u); if (!RROUTES[b.routeId]) throw bad('Le parcours est invalide.'); assertRouteOn(b.routeId); mpSweep();
    const legacy = b.mode === undefined, mode = legacy ? 'ride' : b.mode; if (!['ride', 'race'].includes(mode)) throw bad('Le type de session est invalide.');
    const access = b.access === undefined ? 'code' : b.access; if (!MPACC[access]) throw bad('L\u2019acc\u00e8s est invalide.');
    const maxP = b.maxPlayers === undefined ? MPR.maxPlayers : Number(b.maxPlayers); if (!Number.isInteger(maxP) || maxP < 2 || maxP > MPR.maxPlayers) throw bad(`Le nombre de participants doit \u00eatre compris entre 2 et ${MPR.maxPlayers}.`, 'maxPlayers');
    let raceM = null; if (mode === 'race') { const L = RROUTES[b.routeId][1] * 1000, km = b.raceKm === undefined || b.raceKm === 'full' ? L / 1000 : Number(b.raceKm); if (!Number.isFinite(km) || km < 2 || km * 1000 > L) throw bad(`La distance de la course doit \u00eatre comprise entre 2 et ${L / 1000} km.`, 'raceKm'); raceM = Math.round(km * 1000); }
    const title = b.title ? str(b.title, 'Le nom', 2, 60) : null;
    const AL = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let code; do { code = Array.from(crypto.getRandomValues(new Uint8Array(6)), x => AL[x % AL.length]).join(''); } while (db.mp.sessions.some(s => s.code === code));
    const s = { id: id(), code, route_id: b.routeId, host_id: u.id, status: 'open', max_players: maxP, created_at: now(), ended_at: null, end_reason: null, mode, access, phase: legacy ? 'running' : 'lobby', start_at: null, race_m: raceM, finished_at: null, title };
    db.mp.sessions.push(s); mpAdd(s, u, true); mpLeaveOthers(u, s.id); mpEv(s, u, 'created');
    return { status: 201, data: { session: mpView(s) } };
  });
  on('GET', '/mp/mine', ({ u }) => { requireUser(u); mpSweep(); const p = [...db.mp.players].reverse().find(x => x.user_id === u.id && !x.left_at && db.mp.sessions.find(s => s.id === x.session_id).status === 'open'); return { session: p ? { ...mpView(db.mp.sessions.find(s => s.id === p.session_id)), pending: !!p.pending } : null }; });
  on('GET', '/mp/sessions/:code', ({ u, p }) => {
    requireUser(u); mpSweep(); const s = mpByCode(p.code); mpAdvance(s); const n = mpIn(s).length, me = mpP(s, u.id), member = !!(me && !me.left_at && !me.pending);
    let can = 'ok'; if (s.status !== 'open') can = 'ended'; else if (!member) { try { const a = mpAdmission(s, u, me); can = a === 'pending' ? 'approval' : n >= s.max_players ? 'full' : 'ok'; } catch (e) { can = e.code || 'forbidden'; } }
    return { session: mpView(s), count: n, member, pending: !!(me && !me.left_at && me.pending), full: n >= s.max_players, can, hostName: byId(s.host_id)?.username || null };
  });
  on('POST', '/mp/sessions/:code/join', ({ u, p }) => {
    requireUser(u); mpSweep(); const s = mpByCode(p.code); if (s.status !== 'open') throw mpEnded(s); mpAdvance(s); assertRouteOn(s.route_id); mpLeaveOthers(u, s.id);
    const how = mpAdd(s, u); if (how === 'pending') return { status: 202, data: { session: mpView(s), result: 'pending', players: [], now: Date.now() } };
    return { ...mpFull(s, u), result: how };
  });
  on('POST', '/mp/sessions/:code/tick', ({ u, p, b }) => {
    requireUser(u); const s = mpByCode(p.code); if (s.status !== 'open') throw mpEnded(s); mpAdvance(s);
    if (!['waiting', 'riding', 'paused', 'finished'].includes(b.state)) throw bad('L\u2019\u00e9tat est invalide.');
    const me = mpP(s, u.id); if (!me || me.left_at) throw new E(409, 'Tu ne fais plus partie de cette session. Rejoins-la \u00e0 nouveau avec son code.', 'mp_not_member');
    if (me.pending) { me.seen_at = now(); throw new E(409, 'Ta demande attend l\u2019accord de l\u2019organisateur.', 'mp_pending'); }
    const since = (Date.now() - T(me.seen_at)) / 1000;
    if (since >= 0.3) {
      const road = Number.isInteger(b.road) && b.road >= -1 && b.road < 32 ? b.road : -1;
      let sv = Math.max(0, Math.min(RROUTES[s.route_id][1] * 1000, Number(b.s) || 0)), vv = Math.max(0, Math.min(25, Number(b.v) || 0));
      if (me.epoch === b.epoch) sv = Math.max(me.s - (road >= 0 || me.road >= 0 ? 25 * since + 30 : 5), Math.min(me.s + 25 * since + 30, sv));
      const started = s.phase === 'running' || s.phase === 'finished'; if (!started) { sv = 0; vv = 0; }
      let st = b.state;
      if (s.mode === 'race' && s.phase === 'running' && !me.dnf && me.finish_ms == null) {
        const startMs = T(s.start_at), nw = Date.now(), lastAt = Math.max(T(me.race_at) || startMs, startMs);
        const ns = Math.max(me.race_s, Math.min(Math.min(s.race_m, me.race_s + MPR.maxSpeedMs * (nw - lastAt) / 1000 + 5), sv));
        if (ns > me.race_s) {
          const tAt = m => Math.round(lastAt + (nw - lastAt) * (m - me.race_s) / (ns - me.race_s) - startMs);
          for (let k = Math.floor(me.race_s / MPR.splitM) + 1; k * MPR.splitM <= ns; k++) if (!db.mp.splits.some(r => r.session_id === s.id && r.user_id === u.id && r.mark === k)) db.mp.splits.push({ session_id: s.id, user_id: u.id, mark: k, t_ms: tAt(k * MPR.splitM) });
          if (ns >= s.race_m) { me.finish_ms = tAt(s.race_m); st = 'finished'; mpEv(s, u, 'finished'); }
          me.race_s = ns; me.race_at = now();
        }
      }
      if (since > MPR.connectedS) { mpEv(s, u, 'disconnected', new Date(T(me.seen_at) + MPR.connectedS * 1000).toISOString()); mpEv(s, u, 'reconnected'); }
      if (st !== me.state && st !== 'finished') mpEv(s, u, st);
      Object.assign(me, { state: st, s: sv, v: vv, epoch: String(b.epoch || ''), road, u: Math.max(0, Math.min(20000, Number(b.u) || 0)), seen_at: now() });
      mpAdvance(s);
    }
    return mpFull(s, u);
  });
  on('POST', '/mp/sessions/:code/leave', ({ u, p }) => { requireUser(u); const s = mpByCode(p.code); const me = mpP(s, u.id); if (me && !me.left_at) { if (s.mode === 'race' && s.phase === 'running' && me.finish_ms == null && !me.dnf && !me.pending) me.dnf = 'abandon'; me.left_at = now(); me.state = 'left'; me.pending = false; mpEv(s, u, 'left'); mpSweep(); if (s.mode === 'race') mpAdvance(s); } return { ok: true }; });
  on('POST', '/mp/sessions/:code/start', ({ u, p }) => {
    requireUser(u); const s = mpHost(u, p.code);
    if (s.phase !== 'lobby') throw bad(s.mode === 'race' ? 'Le d\u00e9part de cette course a d\u00e9j\u00e0 \u00e9t\u00e9 donn\u00e9.' : 'Cette sortie est d\u00e9j\u00e0 lanc\u00e9e.');
    if (s.mode === 'race' && mpIn(s).length < 2) throw bad('Il faut au moins deux coureurs dans le salon pour lancer une course. (Dans cette d\u00e9monstration, les donn\u00e9es restent dans ce navigateur : un autre appareil ne peut pas rejoindre la course.)');
    if (s.mode === 'race') { s.phase = 'countdown'; s.start_at = new Date(Date.now() + MPR.countdownS * 1000).toISOString(); } else { s.phase = 'running'; s.start_at = now(); }
    for (const x of db.mp.players.filter(x => x.session_id === s.id)) Object.assign(x, { s: 0, v: 0, race_s: 0, race_at: null, finish_ms: null, dnf: null });
    db.mp.players = db.mp.players.filter(x => !(x.session_id === s.id && x.pending)); mpEv(s, u, 'started');
    return { session: mpView(s) };
  });
  on('POST', '/mp/sessions/:code/players/:uid/approve', ({ u, p }) => {
    requireUser(u); const s = mpHost(u, p.code), x = mpP(s, Number(p.uid));
    if (!x || x.left_at || !x.pending) throw notFound('Aucune demande en attente pour ce joueur.'); if (s.mode === 'race' && s.phase !== 'lobby') throw bad('La course a d\u00e9j\u00e0 commenc\u00e9.');
    if (mpIn(s).length >= s.max_players) throw new E(409, 'La session est compl\u00e8te.', 'mp_session_full');
    const used = new Set(mpIn(s).map(y => y.slot)); let slot = 0; while (used.has(slot)) slot++;
    Object.assign(x, { pending: false, slot, seen_at: now() }); mpEv(s, byId(x.user_id), 'approved'); return { ok: true };
  });
  on('POST', '/mp/sessions/:code/players/:uid/kick', ({ u, p }) => {
    requireUser(u); const s = mpHost(u, p.code), uid = Number(p.uid); if (uid === u.id) throw bad('Tu ne peux pas te retirer toi-m\u00eame : quitte ou termine la session.');
    const x = mpP(s, uid); if (!x || x.left_at) throw notFound('Ce joueur n\u2019est pas dans la session.');
    if (s.mode === 'race' && s.phase === 'running' && x.finish_ms == null && !x.dnf) x.dnf = 'retir\u00e9 par l\u2019organisateur';
    Object.assign(x, { kicked: true, left_at: now(), state: 'left', pending: false }); db.mp.invites = db.mp.invites.filter(i => !(i.session_id === s.id && i.user_id === uid)); mpEv(s, byId(uid), 'kicked'); return { ok: true };
  });
  on('POST', '/mp/sessions/:code/invite', ({ u, p, b }) => {
    requireUser(u); const name = str(b.username, 'Le pseudo', 2, 40), s = mpHost(u, p.code);
    const t = db.users.find(x => x.username.toLowerCase() === name.toLowerCase() && x.status === 'active'); if (!t || t.id === u.id) throw notFound('Aucun ami ne s\u2019appelle ainsi.');
    if (!isFriendD(u.id, t.id)) throw forbidden('Tu ne peux inviter que tes amis.');
    if (!db.mp.invites.some(i => i.session_id === s.id && i.user_id === t.id)) db.mp.invites.push({ session_id: s.id, user_id: t.id, invited_by: u.id });
    notify(t.id, 'mp_invite', { code: s.code, routeId: s.route_id, routeName: RROUTES[s.route_id][0], mode: s.mode, from: u.username }); mpEv(s, t, 'invited');
    return { ok: true, user: { id: t.id, username: t.username } };
  });
  on('POST', '/mp/sessions/:code/end', ({ u, p }) => { requireUser(u); const s = mpByCode(p.code); if (s.host_id !== u.id) throw forbidden('Seule la personne qui a cr\u00e9\u00e9 la session peut la terminer.'); if (s.status !== 'open') throw mpEnded(s); if (s.mode === 'race' && s.phase === 'running') mpFinalize(s, 'course arr\u00eat\u00e9e par l\u2019organisateur'); Object.assign(s, { status: 'ended', ended_at: now(), end_reason: 'Termin\u00e9e par l\u2019h\u00f4te' }); db.mp.players.filter(x => x.session_id === s.id && !x.left_at).forEach(x => { x.left_at = now(); }); mpEv(s, u, 'ended'); return { ok: true }; });
  on('GET', '/mp/sessions/:code/results', ({ u, p }) => {
    requireUser(u); const s = mpByCode(p.code); if (s.mode !== 'race') throw bad('Cette session n\u2019est pas une course.'); mpAdvance(s);
    const rows = db.mp.results.filter(r => r.session_id === s.id).sort((a, b) => (a.place ?? 1e9) - (b.place ?? 1e9) || b.distance_m - a.distance_m);
    return { session: mpView(s), final: s.phase === 'finished', results: rows.map(r => ({ id: r.user_id, username: byId(r.user_id)?.username, place: r.place, status: r.status, finishMs: r.finish_ms, distanceM: r.distance_m, verified: r.verified, bonusCoins: r.bonus_coins, bonusXp: r.bonus_xp, me: r.user_id === u.id })), live: s.phase === 'finished' ? null : mpPlayers(s, u.id) };
  });
  on('GET', '/races/mine', ({ u }) => { requireUser(u); return { items: db.mp.results.filter(r => r.user_id === u.id).reverse().slice(0, 30).map(r => { const s = db.mp.sessions.find(x => x.id === r.session_id); return { code: s.code, routeId: s.route_id, routeName: RROUTES[s.route_id][0], raceM: s.race_m, startAt: s.start_at, place: r.place, of: db.mp.results.filter(x => x.session_id === r.session_id).length, status: r.status, finishMs: r.finish_ms, verified: r.verified, bonusCoins: r.bonus_coins, bonusXp: r.bonus_xp }; }) }; });

  /* ---------- Segments chronom\u00e9tr\u00e9s (m\u00eames contr\u00f4les que server/efforts.mjs, horloge de ce navigateur) ---------- */
  const SEGMENTS = {
 "cap-horizon": [
  {
   "id": "cap-horizon:climb1",
   "kind": "climb",
   "name": "Mont\u00e9e de la Corniche",
   "road": -1,
   "sA": 650,
   "sB": 2650,
   "len": 2000,
   "grade": 3.7,
   "dplus": 75
  },
  {
   "id": "cap-horizon:fast1",
   "kind": "fast",
   "name": "Sprint de la Promenade",
   "road": -1,
   "sA": 4450,
   "sB": 5450,
   "len": 1000,
   "grade": -1.2,
   "dplus": 0
  },
  {
   "id": "cap-horizon:branch3",
   "kind": "branch",
   "name": "Route du Belv\u00e9d\u00e8re marin",
   "road": 2,
   "sA": 0,
   "sB": 2180,
   "mainA": 17405.040570284473,
   "mainB": 19528.038836930646,
   "len": 2180,
   "grade": 0.8,
   "maxGrade": 11.5,
   "dplus": 57
  }
 ],
 "col-des-lumieres": [
  {
   "id": "col-des-lumieres:climb1",
   "kind": "climb",
   "name": "Rampe du Belv\u00e9d\u00e8re",
   "road": -1,
   "sA": 3500,
   "sB": 5500,
   "len": 2000,
   "grade": 2.8,
   "dplus": 57
  },
  {
   "id": "col-des-lumieres:branch1",
   "kind": "branch",
   "name": "Lacets du Belv\u00e9d\u00e8re",
   "road": 0,
   "sA": 0,
   "sB": 2300,
   "mainA": 6759.628930498314,
   "mainB": 7983.855586421144,
   "len": 2300,
   "grade": -0.4,
   "maxGrade": 13,
   "dplus": 65
  },
  {
   "id": "col-des-lumieres:climb2",
   "kind": "climb",
   "name": "Mont\u00e9e des M\u00e9l\u00e8zes",
   "road": -1,
   "sA": 37800,
   "sB": 39300,
   "len": 1500,
   "grade": 4.2,
   "dplus": 62
  },
  {
   "id": "col-des-lumieres:fast1",
   "kind": "fast",
   "name": "Descente des Pr\u00e9s",
   "road": -1,
   "sA": 73600,
   "sB": 74600,
   "len": 1000,
   "grade": -1.2,
   "dplus": 0
  }
 ],
 "valley-loop": [
  {
   "id": "valley-loop:climb2",
   "kind": "climb",
   "name": "Mont\u00e9e de la Mesa",
   "road": -1,
   "sA": 12800,
   "sB": 14300,
   "len": 1500,
   "grade": 3.9,
   "dplus": 58
  },
  {
   "id": "valley-loop:branch2",
   "kind": "branch",
   "name": "Passage des Gr\u00e8s",
   "road": 1,
   "sA": 0,
   "sB": 1160,
   "mainA": 15677.851100376574,
   "mainB": 16878.936564939795,
   "len": 1160,
   "grade": 1.1,
   "maxGrade": 12,
   "dplus": 44
  },
  {
   "id": "valley-loop:fast1",
   "kind": "fast",
   "name": "Ligne droite du D\u00e9sert",
   "road": -1,
   "sA": 27400,
   "sB": 28400,
   "len": 1000,
   "grade": -1.2,
   "dplus": 0
  },
  {
   "id": "valley-loop:climb1",
   "kind": "climb",
   "name": "C\u00f4te des Falaises Rouges",
   "road": -1,
   "sA": 37750,
   "sB": 39750,
   "len": 2000,
   "grade": 4.1,
   "dplus": 82
  }
 ],
 "lac-des-sapins": [
  {
   "id": "lac-des-sapins:climb2",
   "kind": "climb",
   "name": "Mont\u00e9e du Sous-bois",
   "road": -1,
   "sA": 15900,
   "sB": 17400,
   "len": 1500,
   "grade": 4.3,
   "dplus": 64
  },
  {
   "id": "lac-des-sapins:climb1",
   "kind": "climb",
   "name": "C\u00f4te des Sapins",
   "road": -1,
   "sA": 21700,
   "sB": 23700,
   "len": 2000,
   "grade": 3.7,
   "dplus": 73
  },
  {
   "id": "lac-des-sapins:branch3",
   "kind": "branch",
   "name": "Route du Sous-bois",
   "road": 2,
   "sA": 0,
   "sB": 2780,
   "mainA": 23866.57306765206,
   "mainB": 26558.477150313556,
   "len": 2780,
   "grade": -2.3,
   "maxGrade": 12,
   "dplus": 36
  },
  {
   "id": "lac-des-sapins:fast1",
   "kind": "fast",
   "name": "Sprint du Lac",
   "road": -1,
   "sA": 41750,
   "sB": 42750,
   "len": 1000,
   "grade": -1.2,
   "dplus": 0
  }
 ],
 "vieux-port": [
  {
   "id": "vieux-port:fast1",
   "kind": "fast",
   "name": "Sprint des Quais",
   "road": -1,
   "sA": 2050,
   "sB": 3050,
   "len": 1000,
   "grade": -1.2,
   "dplus": 0
  },
  {
   "id": "vieux-port:branch2",
   "kind": "branch",
   "name": "Rue des Jardins",
   "road": 1,
   "sA": 0,
   "sB": 1510,
   "mainA": 13126.354600155415,
   "mainB": 14605.484707114907,
   "len": 1510,
   "grade": 0.4,
   "maxGrade": 4.1,
   "dplus": 15
  },
  {
   "id": "vieux-port:climb1",
   "kind": "climb",
   "name": "C\u00f4te du Clocher",
   "road": -1,
   "sA": 21550,
   "sB": 23550,
   "len": 2000,
   "grade": 1.7,
   "dplus": 34
  }
 ],
 "prairies-dor": [
  {
   "id": "prairies-dor:branch1",
   "kind": "branch",
   "name": "Chemin des Bl\u00e9s",
   "road": 0,
   "sA": 0,
   "sB": 1710,
   "mainA": 4386.91737030167,
   "mainB": 5943.731307005509,
   "len": 1710,
   "grade": -0.5,
   "maxGrade": 12,
   "dplus": 19
  },
  {
   "id": "prairies-dor:climb1",
   "kind": "climb",
   "name": "C\u00f4te du Moulin",
   "road": -1,
   "sA": 9950,
   "sB": 11950,
   "len": 2000,
   "grade": 3.6,
   "dplus": 72
  },
  {
   "id": "prairies-dor:fast1",
   "kind": "fast",
   "name": "Sprint des Tournesols",
   "road": -1,
   "sA": 23700,
   "sB": 24700,
   "len": 1000,
   "grade": -1.2,
   "dplus": 0
  }
 ],
 "plaine-des-haies": [
  {
   "id": "plaine-des-haies:fast5",
   "kind": "fast",
   "name": "Relance du Carrefour",
   "road": -1,
   "sA": 1608,
   "sB": 1908,
   "len": 300,
   "grade": 0,
   "dplus": 0
  },
  {
   "id": "plaine-des-haies:fast2",
   "kind": "fast",
   "name": "Sprint des Peupliers",
   "road": -1,
   "sA": 2255,
   "sB": 2655,
   "len": 400,
   "grade": -0.4,
   "dplus": 0
  },
  {
   "id": "plaine-des-haies:fast6",
   "kind": "fast",
   "name": "Relance des Fermes",
   "road": -1,
   "sA": 2805,
   "sB": 3105,
   "len": 300,
   "grade": 0.7,
   "dplus": 2
  },
  {
   "id": "plaine-des-haies:fast3",
   "kind": "fast",
   "name": "Sprint du Calvaire",
   "road": -1,
   "sA": 4029,
   "sB": 4429,
   "len": 400,
   "grade": -0.9,
   "dplus": 0
  },
  {
   "id": "plaine-des-haies:branch2",
   "kind": "branch",
   "name": "Route des Fermes",
   "road": 1,
   "sA": 0,
   "sB": 930,
   "mainA": 4632.185786552727,
   "mainB": 5371.036065425724,
   "len": 930,
   "grade": 0.3,
   "maxGrade": 1.2,
   "dplus": 3
  },
  {
   "id": "plaine-des-haies:fast4",
   "kind": "fast",
   "name": "Sprint des Pr\u00e9s",
   "road": -1,
   "sA": 7266,
   "sB": 7666,
   "len": 400,
   "grade": -0.2,
   "dplus": 0
  },
  {
   "id": "plaine-des-haies:fast1",
   "kind": "fast",
   "name": "Sprint des Haies",
   "road": -1,
   "sA": 13380,
   "sB": 13780,
   "len": 400,
   "grade": -0.3,
   "dplus": 0
  }
 ],
 "criterium-du-bourg": [
  {
   "id": "criterium-du-bourg:fast4",
   "kind": "fast",
   "name": "Relance de la Place",
   "road": -1,
   "sA": 610,
   "sB": 910,
   "len": 300,
   "grade": 0.2,
   "dplus": 1
  },
  {
   "id": "criterium-du-bourg:fast2",
   "kind": "fast",
   "name": "Sprint de la Mairie",
   "road": -1,
   "sA": 1064,
   "sB": 1464,
   "len": 400,
   "grade": -0.1,
   "dplus": 0
  },
  {
   "id": "criterium-du-bourg:fast3",
   "kind": "fast",
   "name": "Sprint du Champ de Foire",
   "road": -1,
   "sA": 2892,
   "sB": 3292,
   "len": 400,
   "grade": 0.1,
   "dplus": 0
  },
  {
   "id": "criterium-du-bourg:fast5",
   "kind": "fast",
   "name": "Relance du Pont",
   "road": -1,
   "sA": 4383,
   "sB": 4683,
   "len": 300,
   "grade": -0.3,
   "dplus": 0
  },
  {
   "id": "criterium-du-bourg:branch5",
   "kind": "branch",
   "name": "Rue du March\u00e9",
   "road": 4,
   "sA": 0,
   "sB": 830,
   "mainA": 8311.953837633133,
   "mainB": 9125.458943901118,
   "len": 830,
   "grade": 0.2,
   "maxGrade": 1.9,
   "dplus": 2
  },
  {
   "id": "criterium-du-bourg:fast1",
   "kind": "fast",
   "name": "Sprint de la Grand-Rue",
   "road": -1,
   "sA": 10380,
   "sB": 10780,
   "len": 400,
   "grade": 0.5,
   "dplus": 2
  }
 ]
};
  const SEGMENT = Object.fromEntries(Object.entries(SEGMENTS).flatMap(([route, l]) => l.map(s => [s.id, { ...s, route }])));
  const SEG_RULES = { startTolM: 60, endTolM: 80, clockTolMs: 2500, clockTolShare: 0.02, maxSpeedMs: 25, maxVamMh: 2000, minMeasuredShare: 0.8 };
  const SEG_KIND = { climb: 'Mont\u00e9e', fast: 'Portion rapide', branch: 'Route secondaire' };
  db.segAttempts = db.segAttempts || []; db.segEfforts = db.segEfforts || [];
  const segView = s => ({ id: s.id, routeId: s.route, routeName: RROUTES[s.route]?.[0], name: s.name, kind: s.kind, kindLabel: SEG_KIND[s.kind], road: s.road, sA: s.sA, sB: s.sB, mainA: s.mainA ?? s.sA, mainB: s.mainB ?? s.sB, len: s.len, grade: s.grade, maxGrade: s.maxGrade ?? null, dplus: s.dplus });
  const segValid = e => { const r = (db.rides || []).find(x => x.id === e.ride_session_id); const u = byId(e.user_id); return !!r && r.status !== 'rejected' && !!u && u.status === 'active'; };
  const segBest = sid => { const by = {}; for (const e of db.segEfforts.filter(e => e.segment_id === sid && segValid(e))) if (!by[e.user_id] || e.time_ms < by[e.user_id].time_ms) by[e.user_id] = e; return Object.values(by).sort((a, b) => a.time_ms - b.time_ms || a.created_at.localeCompare(b.created_at)); };
  on('POST', '/rides/:id/segment', ({ u, p, b }) => {
    requireUser(u); const seg = SEGMENT[b.segmentId]; if (!seg) throw notFound('Segment introuvable.');
    if (!['start', 'end'].includes(b.phase)) throw bad('Le passage est invalide.'); const el = int(b.elapsedMs, 'Le chronom\u00e8tre', 0, 86400000);
    const road = Number.isInteger(b.road) ? b.road : -1, pos = Number(b.pos); if (!Number.isFinite(pos)) throw bad('Position invalide.');
    const rs = (db.rides || []).find(x => x.id === Number(p.id) && x.user_id === u.id); if (!rs) throw notFound('Sortie introuvable.');
    if (rs.status !== 'active') throw bad('Cette sortie n\u2019est plus en cours : le segment ne peut pas \u00eatre chronom\u00e9tr\u00e9.');
    if (rs.kind !== 'route' || rs.route_id !== seg.route) throw bad('Ce segment n\u2019appartient pas au parcours de ta sortie.');
    if (el > Date.now() - T(rs.started_at) + 15000) throw bad('Chronom\u00e8tre incoh\u00e9rent avec la dur\u00e9e r\u00e9elle de la sortie.');
    const onRoad = road === seg.road, R = SEG_RULES;
    if (b.phase === 'start') {
      if (!onRoad || Math.abs(pos - seg.sA) > R.startTolM) throw bad('Tu n\u2019es pas au d\u00e9part de ce segment.');
      const rideM = Number(b.rideM), from = seg.mainA ?? seg.sA, maxM = rs.distance_m + R.maxSpeedMs * (Date.now() - T(rs.last_beat_at || rs.started_at)) / 1000 + 50;
      if (!Number.isFinite(rideM) || rideM > maxM || rideM < from - 150) throw new E(400, 'Pour \u00eatre chronom\u00e9tr\u00e9, un segment doit \u00eatre roul\u00e9 depuis la ligne de d\u00e9part du parcours.', 'seg_not_from_start');
      db.segAttempts = db.segAttempts.filter(a => !(a.ride === rs.id && a.seg === seg.id)); db.segAttempts.push({ ride: rs.id, seg: seg.id, started_at: now(), start_el: el });
      return { ok: true, phase: 'start' };
    }
    const at = db.segAttempts.find(a => a.ride === rs.id && a.seg === seg.id); if (!at) throw bad('Le d\u00e9part de ce segment n\u2019a pas \u00e9t\u00e9 enregistr\u00e9 : recommence-le depuis son d\u00e9part.');
    db.segAttempts = db.segAttempts.filter(a => a !== at); // tentative consomm\u00e9e, m\u00eame refus\u00e9e
    const fail = why => { throw new E(400, 'Temps non enregistr\u00e9 : ' + why + '.', 'seg_rejected'); };
    if (!onRoad || pos < seg.sB - 5 || pos > seg.sB + R.endTolM) fail('tu n\u2019es pas \u00e0 l\u2019arriv\u00e9e du segment');
    const timeMs = el - at.start_el, serverMs = Date.now() - T(at.started_at);
    if (timeMs <= 0) fail('chronom\u00e8tre incoh\u00e9rent');
    if (Math.abs(serverMs - timeMs) > R.clockTolMs + R.clockTolShare * serverMs) fail('le temps du jeu ne correspond pas au temps mesur\u00e9 (pause ou chronom\u00e8tre modifi\u00e9)');
    const v = seg.len / (timeMs / 1000); if (v > R.maxSpeedMs) fail('vitesse impossible');
    if (seg.dplus > 20 && seg.dplus / (timeMs / 3600000) > R.maxVamMh) fail('vitesse d\u2019ascension impossible');
    if (!(rs.elapsed_s >= 20) || rs.measured_s < rs.elapsed_s * R.minMeasuredShare) fail('la puissance n\u2019a pas \u00e9t\u00e9 mesur\u00e9e par un home trainer ou un capteur');
    if (db.segEfforts.some(e => e.ride_session_id === rs.id && e.segment_id === seg.id && e.started_at === at.started_at)) throw new E(409, 'Ce temps est d\u00e9j\u00e0 enregistr\u00e9.', 'seg_duplicate');
    const mineB = db.segEfforts.filter(e => e.user_id === u.id && e.segment_id === seg.id && segValid(e)).reduce((m, e) => Math.min(m, e.time_ms), Infinity), prev = mineB === Infinity ? null : mineB;
    const power = b.avgPower === undefined ? null : int(b.avgPower, 'La puissance', 0, 2500);
    db.segEfforts.push({ id: id(), user_id: u.id, route_id: seg.route, segment_id: seg.id, ride_session_id: rs.id, time_ms: timeMs, server_ms: serverMs, avg_speed: v, avg_power: power, started_at: at.started_at, created_at: now() });
    const rank = segBest(seg.id).filter(e => e.time_ms < timeMs).length + 1;
    return { status: 201, data: { ok: true, phase: 'end', timeMs, previousBestMs: prev, pr: prev === null || timeMs < prev, first: prev === null, rank, segment: segView(seg) } };
  });
  on('GET', '/segments', ({ u, qs }) => {
    requireUser(u); const route = qs.get('route');
    return { items: Object.values(SEGMENT).filter(s => !route || s.route === route).map(s => { const all = db.segEfforts.filter(e => e.segment_id === s.id), best = segBest(s.id), mine = best.find(e => e.user_id === u.id);
      return { ...segView(s), leader: best[0] ? { username: byId(best[0].user_id).username, timeMs: best[0].time_ms, at: best[0].created_at } : null, efforts: all.length, riders: new Set(all.map(e => e.user_id)).size, mine: mine ? { timeMs: mine.time_ms, at: mine.created_at } : null }; }), rules: SEG_RULES };
  });
  on('GET', '/segments/:id', ({ u, p }) => {
    requireUser(u); const s = SEGMENT[decodeURIComponent(p.id)]; if (!s) throw notFound('Segment introuvable.');
    const all = segBest(s.id), me = all.findIndex(e => e.user_id === u.id);
    const row = (e, i) => ({ rank: i + 1, username: byId(e.user_id).username, timeMs: e.time_ms, at: e.created_at, kmh: Math.round(e.avg_speed * 36) / 10, power: e.avg_power, me: e.user_id === u.id });
    const efforts = db.segEfforts.filter(e => e.segment_id === s.id);
    return { segment: segView(s), board: all.slice(0, 50).map(row), me: me >= 0 ? row(all[me], me) : null, riders: all.length, efforts: efforts.length,
      recent: efforts.filter(e => e.user_id === u.id).reverse().slice(0, 10).map(e => ({ timeMs: e.time_ms, at: e.created_at, kmh: Math.round(e.avg_speed * 36) / 10, power: e.avg_power, valid: segValid(e) })) };
  });
  on('GET', '/admin/multiplayer', ({ u, qs }) => {
    requirePerm(u, 'mp.view'); mpSweep(); const st = qs.get('status') === 'recent' ? 'recent' : 'active';
    const list = db.mp.sessions.filter(s => st === 'active' ? s.status === 'open' : Date.now() - Date.parse(s.created_at) < 7 * 86400e3).reverse();
    return { status: st, rules: MPR, items: list.map(s => { const ps = db.mp.players.filter(x => x.session_id === s.id); return { id: s.id, ...mpView(s), hostName: byId(s.host_id)?.username, endedAt: s.ended_at, present: ps.filter(x => !x.left_at).length, connected: ps.filter(mpConn).length,
      players: ps.map(x => ({ id: x.user_id, username: byId(x.user_id)?.username, state: x.left_at ? 'left' : x.state, stateLabel: MPL[x.left_at ? 'left' : x.state], connected: mpConn(x), joinedAt: x.joined_at, seenAt: x.seen_at, leftAt: x.left_at, km: Math.round(x.s / 100) / 10 })),
      events: db.mp.events.filter(e => e.session_id === s.id).slice(-40).reverse().map(e => ({ username: e.username, kind: e.kind, label: MPE[e.kind] || e.kind, at: e.created_at })) }; }) };
  });
  on('POST', '/admin/multiplayer/:id/close', ({ u, p, b }) => {
    requirePerm(u, 'mp.manage'); const why = str(b.reason, 'Le motif', 3, 300); const s = db.mp.sessions.find(x => x.id === Number(p.id)); if (!s) throw notFound('Session introuvable.');
    if (b.confirm !== s.code) throw bad(`Pour confirmer, saisis exactement le code de la session \u00ab ${s.code} \u00bb.`); if (s.status !== 'open') throw bad('Cette session est d\u00e9j\u00e0 termin\u00e9e.');
    const n = mpIn(s).length; Object.assign(s, { status: 'closed', ended_at: now(), end_reason: 'Ferm\u00e9e par l\u2019\u00e9quipe : ' + why }); mpIn(s).forEach(x => { x.left_at = now(); }); mpEv(s, u, 'closed');
    audit(u, 'mp.close', 'mp_session', s.id, s.code, { route: s.route_id, players: n, reason: why }); return { ok: true };
  });
  /* ---------- \u00c9quipements & r\u00e9compenses (m\u00eames r\u00e8gles que server/admin.mjs) ---------- */
  const ECON = ['user.rewards', 'user.item_give', 'user.item_take', 'user.bike_give', 'user.bike_take', 'shop.update', 'milestone.update'];
  // xpFor : m\u00eame bar\u00e8me que levelInfo
  on('GET', '/admin/economy/players/:id', ({ u, p }) => {
    requirePerm(u, 'economy.manage'); const t = byId(p.id); if (!t) throw notFound('Compte introuvable.');
    const own = new Map(db.items.filter(i => i.user_id === t.id).map(i => [i.item_id, i.bought_at])), bc = t.bike_config || {};
    return { user: { ...userRow(t, u), levelInfo: levelInfo(t.xp || 0) },
      items: ITEMS.filter(i => i.kind === 'bike' || i.kind === 'wheels').map(effItem).map(i => ({ id: i.id, kind: i.kind, name: i.name, image: i.image || null, price: i.price, available: i.available, owned: own.has(i.id), acquiredAt: own.get(i.id) || null, inUse: i.kind === 'bike' ? (bc.model || 'aero') === i.model : (bc.wheels || 'moyen') === i.wheel })),
      milestones: (db.levelRewards || []).filter(r => r.user_id === t.id).sort((a, b) => a.level - b.level).map(c => ({ level: c.level, choice: c.choice, item: c.item_id ? bikeOf(c.item_id) : null, coins: c.coins, at: c.claimed_at })),
      ledger: db.ledger.filter(l => l.user_id === t.id).sort((a, b) => b.created_at.localeCompare(a.created_at) || b.id - a.id).slice(0, 60),
      ops: db.audit.filter(a => a.target_type === 'user' && a.target_id === t.id && ECON.includes(a.action)).reverse().slice(0, 60) };
  });
  on('GET', '/admin/economy/history', ({ u, qs }) => {
    requirePerm(u, 'economy.manage'); let l = db.audit.filter(a => ECON.includes(a.action));
    if (qs.get('type')) l = l.filter(a => a.action.startsWith(qs.get('type'))); if (qs.get('user')) l = l.filter(a => a.target_type === 'user' && a.target_id === Number(qs.get('user')));
    return pageOf(l.reverse(), qs, 30);
  });
  on('GET', '/admin/shop', ({ u }) => {
    requirePerm(u, 'economy.manage'); const owners = {}; for (const i of db.items) owners[i.item_id] = (owners[i.item_id] || 0) + 1;
    return { items: ITEMS.map(effItem).map(i => ({ id: i.id, kind: i.kind, name: i.name, desc: i.desc, image: i.image || null, model: i.model || null, basePrice: i.basePrice, price: i.price, available: i.available, exclusive: !!i.exclusive, minLevel: i.minLevel, owners: owners[i.id] || 0, changedAt: i.priceChangedAt })) };
  });
  on('PUT', '/admin/shop/:item', ({ u, p, b }) => {
    requirePerm(u, 'economy.manage'); const it = ITEM[p.item]; if (!it) throw notFound('Objet introuvable.');
    const price = int(b.price, 'Le prix', 0, 1000000); if (typeof b.available !== 'boolean') throw bad('Indique si l\u2019objet est en vente (oui ou non).'); const why = reason(b, 3);
    const cur = effItem(it), from = { price: cur.price, available: cur.available };
    if (b.expected && (Number(b.expected.price) !== from.price || !!b.expected.available !== from.available)) throw new E(409, `Ce prix a \u00e9t\u00e9 modifi\u00e9 entre-temps (${from.price} pi\u00e8ces). Recharge la page.`, 'stale');
    if (from.price === price && from.available === b.available) throw bad('Aucun changement : le prix et la disponibilit\u00e9 sont d\u00e9j\u00e0 ceux-l\u00e0.');
    claimOp(b.opKey, u, 'shop.update'); db.shopOv = db.shopOv || {}; db.shopOv[it.id] = { price, available: b.available, updated_at: now() };
    audit(u, 'shop.update', 'item', null, it.name, { itemId: it.id, from, to: { price, available: b.available }, catalogPrice: it.price, reason: why });
    return { ok: true, item: { id: it.id, name: it.name, price, available: b.available }, from };
  });
  on('GET', '/admin/milestones', ({ u }) => {
    requirePerm(u, 'economy.manage'); const cfg = msCfg(), lr = db.levelRewards || [];
    return { bikes: ITEMS.filter(i => i.kind === 'bike').map(i => ({ id: i.id, name: i.name })), levelUpCoins: MS.levelUpCoins, items: msLevels().map(L => { const c = cfg[L], cl = lr.filter(r => r.level === L);
      return { level: L, xpRequired: xpFor(L), coins: c.coins, bike: c.bike ? { id: c.bike, name: ITEM[c.bike]?.name || c.bike } : null, enabled: c.enabled, custom: c.custom, updatedAt: c.updatedAt,
        defaults: { coins: c.defaults.coins, bike: { id: c.defaults.bike, name: ITEM[c.defaults.bike]?.name } }, reached: db.users.filter(x => (x.xp || 0) >= xpFor(L)).length,
        claimed: cl.length, claimedBike: cl.filter(r => r.choice === 'bike').length, claimedCoins: cl.filter(r => r.choice === 'coins').length, coinsPaid: cl.reduce((a, r) => a + (r.coins || 0), 0) }; }) };
  });
  on('PUT', '/admin/milestones/:level', ({ u, p, b }) => {
    requirePerm(u, 'economy.manage'); const level = Number(p.level); if (!msLevels().includes(level)) throw notFound('Ce palier n\u2019existe pas.');
    const coins = int(b.coins, 'Les pi\u00e8ces', 0, 1000000), bike = b.bike === null || b.bike === '' ? null : b.bike;
    if (bike !== null && ITEM[bike]?.kind !== 'bike') throw bad('Ce v\u00e9lo n\u2019existe pas.'); if (typeof b.enabled !== 'boolean') throw bad('Indique si le palier est actif.'); const why = reason(b, 3);
    const c = msCfg()[level], from = { coins: c.coins, bike: c.bike, enabled: c.enabled };
    if (b.expected && (Number(b.expected.coins) !== from.coins || (b.expected.bike || null) !== (from.bike || null) || !!b.expected.enabled !== from.enabled)) throw new E(409, 'Ce palier a \u00e9t\u00e9 modifi\u00e9 entre-temps. Recharge la page.', 'stale');
    if (from.coins === coins && (from.bike || null) === bike && from.enabled === b.enabled) throw bad('Aucun changement.');
    claimOp(b.opKey, u, 'milestone.update'); db.msCfg = db.msCfg || {}; db.msCfg[level] = { coins, bike, enabled: b.enabled, updated_at: now() };
    audit(u, 'milestone.update', 'milestone', level, `Palier du niveau ${level}`, { from: { ...from, bikeName: ITEM[from.bike]?.name || null }, to: { coins, bike, enabled: b.enabled, bikeName: ITEM[bike]?.name || null }, reason: why });
    return { ok: true, level };
  });

  /* ---------- Parcours : \u00e9tat, incidents, diagnostics (m\u00eames r\u00e8gles que server/maps.mjs) ---------- */
  const RINFO = { 'cap-horizon': ['littoral', 'img/r1.jpg'], 'col-des-lumieres': ['montagne', 'img/r2.jpg'], 'valley-loop': ['canyon', 'img/r3.jpg'], 'lac-des-sapins': ['foret', 'img/r4.jpg'], 'vieux-port': ['ville', null], 'prairies-dor': ['campagne', null], 'plaine-des-haies': ['campagne', null], 'criterium-du-bourg': ['ville', null] };
  const ENV = { littoral: 'Littoral : corniche, plages et mer', montagne: 'Montagne : vall\u00e9e verte, lacets et col', canyon: 'D\u00e9sert : canyon, dunes, mesas et oasis', foret: 'For\u00eat : sous-bois et lac d\u2019altitude', ville: 'Village : bourg, jardins et port', campagne: 'Campagne : champs, fermes et collines' };
  const KIND = { js: 'Erreur JavaScript', resource: 'Ressource manquante', webgl: 'Rendu 3D (WebGL) indisponible', terrain: 'Terrain ou environnement', route: 'Donn\u00e9es du parcours / routes', audio: 'Audio', load: 'Chargement de la carte' };
  const SEVS = ['info', 'warning', 'error', 'critical'], DSEV = { js: 'error', resource: 'error', webgl: 'critical', terrain: 'critical', route: 'error', audio: 'warning', load: 'critical' };
  const rOf = rid => { if (!RROUTES[rid]) throw notFound('Parcours introuvable.'); return RROUTES[rid]; };
  const rst = rid => { db.routeSt = db.routeSt || {}; return db.routeSt[rid] || (db.routeSt[rid] = { enabled: true, reason: null, loads_ok: 0 }); };
  const cleanD = d => { const o = {}; if (!d || typeof d !== 'object' || Array.isArray(d)) return o; for (const [k, v] of Object.entries(d).slice(0, 16)) { if (!/^[a-zA-Z][a-zA-Z0-9_]{0,30}$/.test(k)) continue; if (typeof v === 'string') o[k] = v.slice(0, k === 'stack' ? 2000 : 400); else if ((typeof v === 'number' && Number.isFinite(v)) || typeof v === 'boolean') o[k] = v; } return o; };
  const incRecord = (route, kind, severity, message, detail, source) => {
    db.incidents = db.incidents || []; const fp = [route, kind, source, String(message).replace(/\d+/g, '#').toLowerCase(), (detail.file || detail.url || '')].join('|');
    const open = db.incidents.find(i => i.fingerprint === fp && i.status !== 'fixed');
    if (open) { open.occurrences++; open.last_at = now(); open.detail = detail; open.severity = severity; return open; }
    const i = { id: id(), route_id: route, kind, severity, message: String(message).slice(0, 300), detail, fingerprint: fp, source, status: 'new', occurrences: 1, first_at: now(), last_at: now(), user_agent: navigator.userAgent.slice(0, 300), status_by: null, status_at: null, note: null };
    db.incidents.push(i); return i;
  };
  const incView = r => ({ id: r.id, route: r.route_id, routeName: RROUTES[r.route_id] ? RROUTES[r.route_id][0] : r.route_id, kind: r.kind, kindLabel: KIND[r.kind], severity: r.severity, message: r.message, detail: r.detail, source: r.source, status: r.status, occurrences: r.occurrences, firstAt: r.first_at, lastAt: r.last_at, userAgent: r.user_agent, statusBy: r.status_by, statusAt: r.status_at, note: r.note });
  const since = () => { const d = [...(db.incidents || []).map(i => i.first_at), ...Object.values(db.routeSt || {}).flatMap(s => [s.last_load_ok_at, s.diag_at]).filter(Boolean)].sort(); return d[0] || null; };
  on('GET', '/routes/status', () => ({ xpRules: { xpPerKm: RULES.activity.xpPerKm, xpPer100mDplus: RULES.activity.xpPer100mDplus, xpPerMinute: RULES.activity.xpPerMinute, maxXp: RULES.activity.maxXp, finishShare: RULES.completion.minShare },
    routes: Object.keys(RROUTES).map(rid => { const s = routeOn(rid); return { id: rid, name: RROUTES[rid][0], finishXp: completionXp(rid), enabled: s.enabled, reason: s.enabled ? null : s.reason }; }) }));
  on('POST', '/routes/:id/report', ({ u, p, b }) => {
    rOf(p.id); if (!KIND[b.kind]) throw bad('Le type d\u2019incident est invalide.'); const msg = str(b.message, 'Le message', 1, 300);
    const i = incRecord(p.id, b.kind, SEVS.includes(b.severity) ? b.severity : DSEV[b.kind], msg, { ...cleanD(b.detail), signedIn: !!u }, 'player');
    return { status: 201, data: { ok: true, id: i.id, occurrences: i.occurrences } };
  });
  on('POST', '/routes/:id/loaded', ({ p, b }) => { rOf(p.id); const s = rst(p.id); s.last_load_ok_at = now(); s.last_load_ms = int(b.ms, 'La dur\u00e9e', 0, 600000); s.loads_ok = (s.loads_ok || 0) + 1; return { ok: true }; });
  // Une fiche impossible \u00e0 calculer n'emp\u00eache plus l'affichage des autres : elle est signal\u00e9e en erreur avec sa cause.
  const rItem = rid => { try { return rItem0(rid); } catch (e) { console.error(e); const r = RROUTES[rid] || [rid]; return { id: rid, name: r[0], itemError: 'Fiche du parcours impossible \u00e0 calculer : ' + e.message, state: 'error', enabled: rst(rid).enabled }; } };
  const rItem0 = rid => { const r = RROUTES[rid], s = rst(rid), ri = RINFO[rid] || (() => { throw new Error('environnement inconnu pour \u00ab ' + rid + ' \u00bb'); })(), inc = (db.incidents || []).filter(i => i.route_id === rid), op = inc.filter(i => i.status !== 'fixed'), last = [...inc].sort((a, b) => b.last_at.localeCompare(a.last_at))[0];
    const rides = (db.rides || []).filter(x => x.route_id === rid), d30 = Date.now() - 30 * 864e5;
    return { id: rid, name: r[0], theme: ri[0], env: ENV[ri[0]] || ri[0], img: ri[1], km: r[1], dplus: r[2], extraM: r[3], extraDplus: r[4], state: !s.enabled ? 'disabled' : op.some(i => i.severity === 'error' || i.severity === 'critical') ? 'error' : 'active',
      enabled: s.enabled, reason: s.reason || null, updatedAt: s.updated_at || null, load: { lastOkAt: s.last_load_ok_at || null, lastMs: s.last_load_ms ?? null, count: s.loads_ok || 0 },
      diag: s.diag ? { at: s.diag_at, by: s.diag_by, ok: !!s.diag.ok, branches: s.diag.branches ? s.diag.branches.length : null, problems: (s.diag.problems || []).length, buildMs: s.diag.buildMs ?? null } : null,
      incidents: { open: op.length, openSerious: op.filter(i => i.severity === 'error' || i.severity === 'critical').length, total: inc.length }, lastIncident: last ? incView(last) : null,
      rides: { total: rides.length, d30: rides.filter(x => new Date(x.started_at).getTime() > d30).length, saved: rides.filter(x => x.status === 'saved').length } }; };
  on('GET', '/admin/routes', ({ u }) => { requirePerm(u, 'routes.view'); return { items: Object.keys(RROUTES).map(rItem), since: since(), canManage: can(u, 'routes.manage') }; });
  on('GET', '/admin/routes/incidents', ({ u, qs }) => {
    requirePerm(u, 'routes.view'); let l = [...(db.incidents || [])];
    const f = (k, fn) => { const v = qs.get(k); if (v) l = l.filter(i => fn(i, v)); };
    f('route', (i, v) => i.route_id === v); f('severity', (i, v) => i.severity === v); f('kind', (i, v) => i.kind === v); f('source', (i, v) => i.source === v);
    const st = qs.get('status'); if (['new', 'in_progress', 'fixed'].includes(st)) l = l.filter(i => i.status === st); else if (st !== 'all') l = l.filter(i => i.status !== 'fixed');
    const r = pageOf(l.sort((a, b) => b.last_at.localeCompare(a.last_at) || b.id - a.id).map(incView), qs, 30);
    return { ...r, since: since(), kinds: KIND, routes: Object.fromEntries(Object.entries(RROUTES).map(([k, v]) => [k, v[0]])), canManage: can(u, 'routes.manage') };
  });
  on('POST', '/admin/routes/incidents/:id/status', ({ u, p, b }) => {
    requirePerm(u, 'routes.manage'); const i = (db.incidents || []).find(x => x.id === Number(p.id)); if (!i) throw notFound('Incident introuvable.');
    if (!['new', 'in_progress', 'fixed'].includes(b.status)) throw bad('Le statut est invalide.'); if (i.status === b.status) throw bad('L\u2019incident a d\u00e9j\u00e0 ce statut.');
    if (i.status === 'fixed' && db.incidents.some(x => x.fingerprint === i.fingerprint && x.status !== 'fixed' && x.id !== i.id)) throw bad('Cette erreur est d\u00e9j\u00e0 r\u00e9apparue dans un incident ouvert plus r\u00e9cent.');
    const from = i.status; i.status = b.status; i.status_by = u.username; i.status_at = now(); if (b.note) i.note = str(b.note, 'La note', 0, 500);
    audit(u, 'incident.status', 'route', null, RROUTES[i.route_id] ? RROUTES[i.route_id][0] : i.route_id, { incident: i.id, from, to: b.status, note: b.note || null });
    return { ok: true, status: b.status, from };
  });
  on('GET', '/admin/routes/:id', ({ u, p }) => {
    requirePerm(u, 'routes.view'); const r = rOf(p.id), it = rItem(p.id), s = rst(p.id);
    return { route: { ...it }, diag: s.diag ? { ...s.diag, at: s.diag_at, by: s.diag_by } : null, incidents: (db.incidents || []).filter(i => i.route_id === p.id).sort((a, b) => b.last_at.localeCompare(a.last_at)).slice(0, 50).map(incView),
      history: db.audit.filter(a => a.target_type === 'route' && a.target_label === r[0]).reverse().slice(0, 30), canManage: can(u, 'routes.manage') };
  });
  const setRoute = enable => ({ u, p, b }) => {
    requirePerm(u, 'routes.manage'); const r = rOf(p.id), why = str(b.reason, 'Le motif', 3, 300);
    if (!enable && String(b.confirm || '').trim().toLowerCase() !== r[0].toLowerCase()) throw bad(`Pour confirmer, saisis exactement le nom du parcours \u00ab ${r[0]} \u00bb.`);
    const s = rst(p.id); if (s.enabled === enable) throw bad(enable ? 'Ce parcours est d\u00e9j\u00e0 actif.' : 'Ce parcours est d\u00e9j\u00e0 d\u00e9sactiv\u00e9.');
    const from = s.enabled; s.enabled = enable; s.reason = enable ? null : why; s.updated_at = now();
    audit(u, enable ? 'route.enable' : 'route.disable', 'route', null, r[0], { routeId: p.id, from: from ? 'actif' : 'd\u00e9sactiv\u00e9', to: enable ? 'actif' : 'd\u00e9sactiv\u00e9', reason: why });
    return { ok: true, enabled: enable };
  };
  on('POST', '/admin/routes/:id/enable', setRoute(true)); on('POST', '/admin/routes/:id/disable', setRoute(false));
  on('POST', '/admin/routes/:id/diagnostic', ({ u, p, b }) => {
    requirePerm(u, 'routes.view'); const r = rOf(p.id);
    const probs = (Array.isArray(b.problems) ? b.problems.slice(0, 50) : []).map(x => { if (!KIND[x.kind]) throw bad('Le type est invalide.'); return { kind: x.kind, severity: SEVS.includes(x.severity) ? x.severity : 'warning', message: str(x.message, 'Le message', 1, 300), detail: cleanD(x.detail) }; });
    const seen = probs.map(x => incRecord(p.id, x.kind, x.severity, x.message, x.detail, 'diagnostic').fingerprint);
    for (const i of (db.incidents || [])) if (i.route_id === p.id && i.source === 'diagnostic' && i.status !== 'fixed' && !seen.includes(i.fingerprint)) { i.status = 'fixed'; i.status_by = 'diagnostic'; i.status_at = now(); i.note = 'Plus constat\u00e9 par le diagnostic du ' + new Date().toLocaleString('fr-FR'); }
    const s = rst(p.id); s.diag = { ok: probs.every(x => x.severity === 'info'), buildMs: b.buildMs ?? null, lengthM: b.lengthM ?? null, branches: (b.branches || []).slice(0, 40).map(cleanD), checks: (b.checks || []).slice(0, 60).map(cleanD), problems: probs, env: cleanD(b.env), main: cleanD(b.main) }; s.diag_at = now(); s.diag_by = u.username;
    audit(u, 'route.diagnostic', 'route', null, r[0], { routeId: p.id, problems: probs.length, branches: (b.branches || []).length });
    return { ok: true, problems: probs.length };
  });

  window.vvApi = async function (method, path, body) {
    await new Promise(r => setTimeout(r, 60));
    try { const fresh = JSON.parse(localStorage.getItem(KEY)); if (fresh) { db = fresh; db.mp = db.mp || { sessions: [], players: [], events: [] }; } } catch {}
    const url = new URL(path, 'https://demo.local');
    const route = url.pathname;
    let methodMismatch = false;
    for (const r of R) {
      const m = route.match(r.re); if (!m) continue;
      if (r.m !== method) { methodMismatch = true; continue; }
      const p = {}; r.keys.forEach((k, i) => (p[k] = decodeURIComponent(m[i + 1])));
      try {
        const res = await r.fn({ u: curUser(), p, b: body || {}, qs: url.searchParams });
        save();
        return res && res.status && res.data ? res : { status: 200, data: res };
      } catch (e) {
        save();
        if (e instanceof E) return { status: e.status, data: { error: e.message, code: e.code, ...e.extra } };
        console.error(e); return { status: 500, data: { error: 'Erreur interne de la d\u00e9mo (' + (e && e.message ? e.message : String(e)).slice(0, 200) + '). Recharge la page ; si l\u2019erreur persiste, signale-la.', code: 'server_error' } };
      }
    }
    return { status: methodMismatch ? 405 : 404, data: { error: 'Point d\u2019acc\u00e8s inconnu.', code: 'not_found' } };
  };
  // Le home trainer et l'admin appellent fetch('/api/\u2026') : on les redirige vers la d\u00e9mo.
  const realFetch = window.fetch.bind(window);
  window.fetch = async (input, init = {}) => {
    const u = typeof input === 'string' ? input : input.url;
    if (/^\/api\//.test(u)) { const r = await window.vvApi((init.method || 'GET').toUpperCase(), u.slice(4), init.body ? JSON.parse(init.body) : undefined); return new Response(JSON.stringify(r.data), { status: r.status, headers: { 'content-type': 'application/json' } }); }
    return realFetch(input, init);
  };
  save();
})();
