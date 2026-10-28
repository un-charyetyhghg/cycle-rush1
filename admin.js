// Panneau d'administration CycleRush. Chaque action est rev\u00e9rifi\u00e9e par le serveur.
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
class Raw { constructor(s) { this.s = s; } }
const raw = s => new Raw(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const out = v => v instanceof Raw ? v.s : Array.isArray(v) ? v.map(out).join('') : v === null || v === undefined || v === false ? '' : esc(v);
const html = (s, ...v) => raw(s.reduce((a, x, i) => a + x + (i < v.length ? out(v[i]) : ''), ''));

const nf = n => Number(n || 0).toLocaleString('fr-FR');
const dt = d => d ? new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '\u2014';
const day = d => d ? new Date(d).toLocaleDateString('fr-FR') : '\u2014';
const ROLE = { user: 'Utilisateur', moderator: 'Mod\u00e9rateur', admin: 'Administrateur', superadmin: 'Super-administrateur' };
const STATUS = { active: ['Actif', 'ok'], suspended: ['Suspendu', 'warn'], banned: ['Banni', 'bad'] };
const RSTATUS = { pending: ['En attente', 'warn'], in_progress: ['En cours', 'cyan'], resolved: ['R\u00e9solu', 'ok'] };
const REASON = { spam: 'Spam', harassment: 'Harc\u00e8lement', inappropriate: 'Contenu inappropri\u00e9', impersonation: 'Usurpation d\u2019identit\u00e9', cheating: 'Donn\u00e9es truqu\u00e9es', other: 'Autre' };
const DECISION = { no_action: 'Aucune action', warning: 'Avertissement', content_hidden: 'Contenu masqu\u00e9', suspended: 'Suspension', banned: 'Bannissement' };
const ACTION = {
  'user.suspend': 'Suspension', 'user.reactivate': 'R\u00e9activation', 'user.ban': 'Bannissement', 'user.delete': 'Suppression de compte', 'user.role': 'Changement de r\u00f4le', 'user.verify_email': 'E-mail confirm\u00e9 manuellement',
  'report.status': 'Signalement pris en charge', 'report.note': 'Note interne', 'report.resolve': 'Signalement r\u00e9solu',
  'activity.hide': 'Activit\u00e9 masqu\u00e9e', 'activity.unhide': 'Activit\u00e9 r\u00e9tablie',
  'challenge.create': 'D\u00e9fi cr\u00e9\u00e9', 'challenge.update': 'D\u00e9fi modifi\u00e9', 'challenge.delete': 'D\u00e9fi supprim\u00e9',
  'announcement.create': 'Annonce publi\u00e9e', 'announcement.delete': 'Annonce supprim\u00e9e', 'settings.update': 'R\u00e9glages modifi\u00e9s', 'setup.superadmin': 'Installation du super-administrateur', 'user.rewards': 'Ajustement XP / pi\u00e8ces', 'user.bike_give': 'V\u00e9lo offert', 'user.bike_take': 'V\u00e9lo retir\u00e9',
  'user.item_give': '\u00c9quipement offert', 'user.item_take': '\u00c9quipement retir\u00e9', 'mp.close': 'Session multijoueur ferm\u00e9e',
  'shop.update': 'Prix de la boutique modifi\u00e9', 'milestone.update': 'Palier de niveau modifi\u00e9', 'route.enable': 'Parcours r\u00e9activ\u00e9', 'route.disable': 'Parcours d\u00e9sactiv\u00e9', 'route.diagnostic': 'Diagnostic de parcours', 'incident.status': 'Statut d\u2019un incident modifi\u00e9',
};
const VIS = { public: 'tout le monde', friends: 'amis', private: 'priv\u00e9' };
const pill = ([l, k]) => html`<span class="pill ${k}">${l}</span>`;
const ava = u => html`<span class="ava" aria-hidden="true">${u.avatar ? html`<img src="${u.avatar}" alt="">` : (u.username || '?')[0].toUpperCase()}</span>`;

let me = null, perms = [];
const can = p => perms.includes(p);

async function api(method, path, body) {
  let r;
  try { r = await fetch('/api' + path, { method, credentials: 'same-origin', headers: { 'content-type': 'application/json', 'x-veloverse': '1' }, body: body === undefined ? undefined : JSON.stringify(body) }); }
  catch { throw Object.assign(new Error('Le serveur de CycleRush est injoignable (connexion coup\u00e9e ou serveur arr\u00eat\u00e9). V\u00e9rifie ta connexion puis r\u00e9essaie.'), { status: 0 }); }
  let d = {}; try { d = await r.json(); } catch {}
  if (r.status === 401) { location.href = './'; throw new Error('Session expir\u00e9e.'); }
  if (!r.ok) throw Object.assign(new Error(d.error || (r.status >= 500 ? `Le serveur a rencontr\u00e9 une erreur (code ${r.status}). R\u00e9essaie dans un instant.` : `Requ\u00eate refus\u00e9e (code ${r.status}).`)), { status: r.status });
  return d;
}
function toast(msg, kind = 'ok') { const t = document.createElement('div'); t.className = 'toast ' + kind; t.setAttribute('role', 'status'); t.textContent = msg; $('#toasts').append(t); setTimeout(() => t.remove(), 4500); }
function modal(content, onMount) {
  const bg = document.createElement('div'); bg.className = 'modal-bg';
  bg.innerHTML = out(html`<div class="modal" role="dialog" aria-modal="true">${content}</div>`);
  const close = () => { bg.remove(); document.removeEventListener('keydown', k); };
  const k = e => { if (e.key === 'Escape') close(); };
  bg.addEventListener('click', e => { if (e.target === bg || e.target.closest('[data-close]')) close(); });
  document.addEventListener('keydown', k);
  document.body.append(bg);
  bg.querySelector('input,select,textarea,button:not([data-close])')?.focus();
  onMount?.(bg.firstElementChild, close);
}
// Fen\u00eatre de confirmation avec champs ; \u00ab fn \u00bb re\u00e7oit les valeurs et lance l'action.
function confirmForm({ title, text, fields = '', confirm = 'Confirmer', danger = false, fn }) {
  modal(html`<h2>${title}</h2>${text ? html`<p class="muted" style="margin:0">${text}</p>` : ''}
    <form id="cf" style="display:flex;flex-direction:column;gap:12px"><div class="alert bad" id="cfe" hidden></div>${fields}
    <div class="modal-acts"><button type="button" class="btn" data-close>Annuler</button><button class="btn ${danger ? 'danger' : 'primary'}" type="submit">${confirm}</button></div></form>`,
  (box, close) => {
    $('#cf', box).onsubmit = async e => {
      e.preventDefault();
      const b = e.submitter || $('[type=submit]', box); b.disabled = true;
      try { await fn(Object.fromEntries(new FormData(e.target))); close(); }
      catch (err) { const x = $('#cfe', box); x.textContent = err.message; x.hidden = false; b.disabled = false; }
    };
  });
}

/* ---------- Graphique ---------- */
function bars(rows, label) {
  const W = 560, H = 180, pl = 30, pb = 24, pt = 10;
  const max = Math.max(4, ...rows.map(r => r.n)); const top = Math.ceil(max / 4) * 4; const bw = (W - pl - 6) / rows.length;
  const y = v => H - pb - (v / top) * (H - pt - pb);
  let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}">`;
  for (let v = 0; v <= top; v += top / 4) s += `<line x1="${pl}" x2="${W}" y1="${y(v)}" y2="${y(v)}" stroke="#1b2d4b"/><text x="${pl - 5}" y="${y(v) + 4}" text-anchor="end" font-size="10" fill="#90a7c0">${v}</text>`;
  rows.forEach((r, i) => {
    const x = pl + i * bw + 1; s += `<rect x="${x}" y="${y(r.n)}" width="${Math.max(1, bw - 2)}" height="${y(0) - y(r.n)}" rx="2" fill="#22d3ee" opacity="${i === rows.length - 1 ? 1 : .7}"><title>${new Date(r.day).toLocaleDateString('fr-FR')} : ${r.n}</title></rect>`;
    if (i % 7 === 0 || (i === rows.length - 1 && i % 7 >= 3)) s += `<text x="${x + bw / 2}" y="${H - 7}" text-anchor="middle" font-size="10" fill="#90a7c0">${new Date(r.day).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</text>`;
  });
  return raw(s + '</svg>');
}
const pager = (r, base) => r.pages > 1 ? html`<div class="pager"><span>${nf(r.total)} r\u00e9sultat${r.total > 1 ? 's' : ''} \u00b7 page ${r.page} / ${r.pages}</span><span class="acts">
  ${r.page > 1 ? html`<a class="btn sm" href="${base}&page=${r.page - 1}">Pr\u00e9c\u00e9dent</a>` : ''}${r.page < r.pages ? html`<a class="btn sm" href="${base}&page=${r.page + 1}">Suivant</a>` : ''}</span></div>`
  : html`<div class="pager"><span>${nf(r.total)} r\u00e9sultat${r.total > 1 ? 's' : ''}</span></div>`;
const auditRows = items => items.length ? html`<div class="tbl-wrap"><table><thead><tr><th>Date</th><th>Par</th><th>Action</th><th>Cible</th><th>D\u00e9tails</th></tr></thead><tbody>
  ${items.map(a => html`<tr><td class="num">${dt(a.created_at)}</td><td>${a.actor_name} <span class="muted">(${ROLE[a.actor_role] || a.actor_role})</span></td><td>${ACTION[a.action] || a.action}</td>
  <td>${a.target_type === 'user' && a.target_id ? html`<a href="#utilisateur/${a.target_id}">${a.target_label || '#' + a.target_id}</a>` : a.target_type === 'report' ? html`<a href="#signalement/${a.target_id}">${a.target_label}</a>` : a.target_label || '\u2014'}</td>
  <td class="muted">${auditDetails(a)}</td></tr>`)}</tbody></table></div>` : html`<div class="empty">Aucune action enregistr\u00e9e.</div>`;
function auditDetails(a) {
  const d = a.details || {};
  const parts = [];
  if (d.reason) parts.push('Motif : ' + d.reason);
  if (d.days) parts.push(d.days + ' j');
  if (d.decision) parts.push(DECISION[d.decision]);
  if (d.from && d.to && a.action === 'user.role') parts.push(`${ROLE[d.from]} \u2192 ${ROLE[d.to]}`);
  if (d.status) parts.push(RSTATUS[d.status]?.[0]);
  if (d.recipients !== undefined) parts.push(d.recipients + ' destinataires');
  if (a.action === 'user.bike_give' || a.action === 'user.bike_take') parts.push(d.bike);
  if (a.action === 'user.item_give' || a.action === 'user.item_take') parts.push(d.item + (d.self ? ' (son propre compte)' : ''));
  if (a.action === 'mp.close') parts.push(`${d.players} participant${d.players > 1 ? 's' : ''} pr\u00e9sent${d.players > 1 ? 's' : ''}`);
  if (a.action === 'user.rewards') { parts.push(`${d.xp >= 0 ? '+' : ''}${d.xp} XP, ${d.coins >= 0 ? '+' : ''}${d.coins} pi\u00e8ces`); if (d.before && d.after) parts.push(`solde : ${nf(d.before.coins)} \u2192 ${nf(d.after.coins)} pi\u00e8ces, ${nf(d.before.xp)} \u2192 ${nf(d.after.xp)} XP`); }
  if (a.action === 'shop.update' && d.from && d.to) parts.push(`${nf(d.from.price)} \u2192 ${nf(d.to.price)} pi\u00e8ces` + (d.from.available !== d.to.available ? ` ; ${d.to.available ? 'remis en vente' : 'retir\u00e9 de la vente'}` : ''));
  if (a.action === 'milestone.update' && d.from && d.to) { const c = []; if (d.from.coins !== d.to.coins) c.push(`${nf(d.from.coins)} \u2192 ${nf(d.to.coins)} pi\u00e8ces`); if (d.from.bike !== d.to.bike) c.push(`v\u00e9lo : ${d.from.bikeName || 'aucun'} \u2192 ${d.to.bikeName || 'aucun'}`); if (d.from.enabled !== d.to.enabled) c.push(d.to.enabled ? 'r\u00e9activ\u00e9' : 'd\u00e9sactiv\u00e9'); parts.push(c.join(' ; ')); }
  if ((a.action === 'route.enable' || a.action === 'route.disable') && d.from) parts.push(`${d.from} \u2192 ${d.to}`);
  if (a.action === 'route.diagnostic') parts.push(`${d.problems} probl\u00e8me${d.problems > 1 ? 's' : ''} \u00b7 ${d.branches} route${d.branches > 1 ? 's' : ''} secondaire${d.branches > 1 ? 's' : ''}`);
  if (a.action === 'incident.status') parts.push(`incident #${d.incident} : ${(ISTATUS[d.from] || [d.from])[0]} \u2192 ${(ISTATUS[d.to] || [d.to])[0]}` + (d.note ? ' \u2014 ' + d.note : ''));
  if ((a.action === 'user.item_give' || a.action === 'user.item_take') && d.before) parts.push(`${d.before} \u2192 ${d.after}`);
  if (a.action === 'settings.update') parts.push(Object.entries(d).map(([k, v]) => `${k} : ${JSON.stringify(v.from)} \u2192 ${JSON.stringify(v.to)}`).join(' ; '));
  return parts.join(' \u00b7 ') || '\u2014';
}

/* ---------- Pages ---------- */
const pages = {
  async tableau() {
    const d = await api('GET', '/admin/overview');
    const s = d.stats;
    return html`${s ? html`<div class="stats">
        <div class="stat"><span>Comptes inscrits</span><b>${nf(s.total)}</b></div>
        <div class="stat"><span>Connect\u00e9s maintenant</span><b>${nf(s.online)}</b></div>
        <div class="stat"><span>Actifs (30 j)</span><b>${nf(s.active30)}</b></div>
        <div class="stat"><span>Nouveaux (7 j)</span><b>${nf(s.new7)}</b></div>
        <div class="stat"><span>Nouveaux (30 j)</span><b>${nf(s.new30)}</b></div>
        <div class="stat"><span>Suspendus</span><b>${nf(s.suspended)}</b></div>
        <div class="stat"><span>Bannis</span><b>${nf(s.banned)}</b></div>
        <div class="stat ${d.pendingReports ? 'alert' : ''}"><span>Signalements ouverts</span><b>${nf(d.pendingReports)}</b></div>
      </div>
      <p class="def">Connect\u00e9 maintenant : ${d.definitions.online} Compte actif : ${d.definitions.active} ${nf(s.unverified)} compte${s.unverified > 1 ? 's' : ''} n\u2019${s.unverified > 1 ? 'ont' : 'a'} pas encore confirm\u00e9 leur e-mail.</p>
      <div class="grid2"><section class="card"><h2>Inscriptions par jour (30 jours)</h2>${bars(d.signups, 'Inscriptions par jour sur 30 jours')}</section>
        <section class="card"><h2>Activit\u00e9s enregistr\u00e9es par jour (30 jours)</h2>${bars(d.activity, 'Activit\u00e9s par jour sur 30 jours')}</section></div>
      <section class="card"><div class="card-h"><h2>Derniers comptes cr\u00e9\u00e9s</h2><span class="acts" style="align-items:center"><span class="muted" style="font-size:13px">Mis \u00e0 jour \u00e0 ${new Date(d.generatedAt).toLocaleTimeString('fr-FR')}</span><button class="btn sm" data-refresh>Actualiser</button><a class="btn sm" href="#utilisateurs">Tous les utilisateurs</a></span></div>${d.latestUsers.length ? userTable(d.latestUsers) : html`<div class="empty">Aucun compte inscrit pour l\u2019instant.</div>`}</section>`
      : html`<div class="stats"><div class="stat ${d.pendingReports ? 'alert' : ''}"><span>Signalements ouverts</span><b>${nf(d.pendingReports)}</b></div></div>`}
      <section class="card"><div class="card-h"><h2>Actions r\u00e9centes de l\u2019\u00e9quipe</h2><a href="#journal">Journal complet</a></div>${auditRows(d.recentAudit)}</section>`;
  },

  async utilisateurs(qs) {
    const r = await api('GET', '/admin/users?' + qs.toString());
    const sel = (name, opts) => html`<select class="input" name="${name}" aria-label="${name}">${opts.map(([v, l]) => html`<option value="${v}" ${raw(qs.get(name) === v ? 'selected' : '')}>${l}</option>`)}</select>`;
    return html`<section class="card"><form class="filters" id="uf">
        <input class="input" name="q" value="${qs.get('q') || ''}" placeholder="${can('users.view') ? 'Nom, identifiant ou e-mail' : 'Nom ou identifiant'}" aria-label="Recherche" style="flex:1;min-width:200px">
        ${sel('role', [['', 'Tous les r\u00f4les'], ...Object.entries(ROLE)])}
        ${sel('status', [['', 'Tous les statuts'], ['active', 'Actifs'], ['suspended', 'Suspendus'], ['banned', 'Bannis']])}
        ${sel('verified', [['', 'E-mail : tous'], ['yes', 'E-mail confirm\u00e9'], ['no', 'E-mail non confirm\u00e9']])}
        ${sel('online', [['', 'Connect\u00e9s ou non'], ['yes', 'Connect\u00e9s maintenant']])}
        ${sel('sort', [['created', 'Tri : inscription'], ['username', 'Tri : nom'], ['seen', 'Tri : derni\u00e8re visite'], ['id', 'Tri : identifiant']])}
        ${sel('dir', [['desc', 'D\u00e9croissant'], ['asc', 'Croissant']])}
        <button class="btn primary" type="submit">Filtrer</button></form></section>
      <section class="card">${r.items.length ? userTable(r.items) : html`<div class="empty">Aucun compte ne correspond.</div>`}${pager(r, '#utilisateurs?' + new URLSearchParams([...qs].filter(([k]) => k !== 'page')).toString())}</section>`;
  },

  async utilisateur(qs, id) {
    const d = await api('GET', '/admin/users/' + id);
    const u = d.user;
    const outranks = me.role === 'superadmin' ? u.id !== me.id : ({ user: 0, moderator: 1, admin: 2, superadmin: 3 }[me.role] > { user: 0, moderator: 1, admin: 2, superadmin: 3 }[u.role]);
    return html`<p><a href="#utilisateurs">\u2190 Retour aux utilisateurs</a></p>
      <div class="grid2">
        <section class="card"><div class="card-h"><h2 data-uname="${u.username}">${ava(u)}${u.username}</h2>${pill(STATUS[u.status])}</div>
          <dl class="kv"><dt>Identifiant</dt><dd>#${u.id}</dd>${u.email !== undefined ? html`<dt>E-mail</dt><dd>${u.email} ${u.emailVerified ? html`<span class="pill ok">confirm\u00e9</span>` : html`<span class="pill warn">non confirm\u00e9</span>`}</dd>` : ''}
          <dt>R\u00f4le</dt><dd>${ROLE[u.role]}</dd><dt>Progression</dt><dd>Niveau ${u.level} \u00b7 ${nf(u.xp)} XP \u00b7 ${nf(u.coins)} pi\u00e8ces</dd><dt>Inscription</dt><dd>${dt(u.createdAt)}</dd><dt>Derni\u00e8re visite</dt><dd>${dt(u.lastSeenAt)}</dd>
          ${u.status !== 'active' ? html`<dt>Motif</dt><dd>${u.statusReason || '\u2014'}</dd>${u.suspendedUntil ? html`<dt>Jusqu\u2019au</dt><dd>${dt(u.suspendedUntil)}</dd>` : ''}` : ''}
          <dt>Confidentialit\u00e9</dt><dd>Profil : ${VIS[u.privacy.profile]} \u00b7 Activit\u00e9s : ${VIS[u.privacy.activities]}</dd>
          <dt>Bio</dt><dd>${u.bio || '\u2014'}</dd></dl>
          <p style="margin:12px 0 0">${u.status === 'active' ? html`<a href="./#u-${u.id}-${encodeURIComponent(u.username)}">Voir le profil public</a> <span class="muted" style="font-size:13px">(tel que les autres membres le voient)</span>` : html`<span class="muted">Profil public indisponible : ce compte est ${STATUS[u.status][0].toLowerCase()}.</span>`}</p></section>
        <section class="card"><h2>Statistiques</h2><dl class="kv"><dt>Activit\u00e9s</dt><dd>${nf(d.stats.activities)} (${nf(Math.round(d.stats.distance_m / 1000))} km)</dd><dt>Amis</dt><dd>${nf(d.stats.friends)}</dd>
          <dt>Signalements re\u00e7us</dt><dd>${nf(d.stats.reports_against)}</dd><dt>Signalements \u00e9mis</dt><dd>${nf(d.stats.reports_made)}</dd></dl>
          <h2 style="margin-top:18px">Actions</h2>
          ${outranks ? html`<div class="acts">
            ${can('users.suspend') && u.status === 'active' ? html`<button class="btn warn" data-a="suspend">Suspendre</button>` : ''}
            ${(u.status === 'suspended' && can('users.suspend')) || (u.status === 'banned' && can('users.manage')) ? html`<button class="btn" data-a="reactivate">R\u00e9activer</button>` : ''}
            ${can('users.manage') && u.status !== 'banned' ? html`<button class="btn danger" data-a="ban">Bannir</button>` : ''}
            ${can('users.manage') && u.email !== undefined && !u.emailVerified ? html`<button class="btn" data-a="verify">Confirmer l\u2019e-mail</button>` : ''}
            ${can('roles.manage') ? html`<button class="btn" data-a="role">Changer le r\u00f4le</button>` : ''}
            ${can('users.manage') ? html`<button class="btn danger" data-a="delete">Supprimer le compte</button>` : ''}
          </div>` : html`<p class="muted" style="margin:0">${u.id === me.id ? 'C\u2019est ton compte : les actions de mod\u00e9ration ne s\u2019appliquent pas \u00e0 toi-m\u00eame.' : 'Ce compte a un r\u00f4le \u00e9gal ou sup\u00e9rieur au tien.'}</p>`}
          ${can('users.manage') ? html`<h2 style="margin-top:18px">XP et pi\u00e8ces</h2><p class="muted" style="margin:0 0 10px">Solde actuel : <b style="color:var(--fg)">${nf(u.xp)} XP</b> et <b style="color:var(--fg)">${nf(u.coins)} pi\u00e8ces</b> (niveau ${u.level})</p>
            <div class="acts"><button class="btn" data-a="rw-add" data-xp="${u.xp}" data-coins="${u.coins}">+ Ajouter</button><button class="btn warn" data-a="rw-remove" data-xp="${u.xp}" data-coins="${u.coins}">\u2212 Retirer</button></div>` : ''}
          ${d.bikes ? html`<h2 style="margin-top:18px">V\u00e9los</h2><p class="muted" style="margin:0 0 10px">Le mod\u00e8le A\u00e9ro est offert \u00e0 tous. Donner un v\u00e9lo ne co\u00fbte pas de pi\u00e8ces au membre ; il le voit dans son historique.</p>
            <ul class="bike-list">${d.bikes.map(k => html`<li><span class="bl-name"><b>${k.name}</b><span class="muted num">${nf(k.price)} pi\u00e8ces</span></span>
              ${k.owned ? html`<span class="pill ok">${k.riding ? 'Poss\u00e9d\u00e9 \u00b7 en selle' : 'Poss\u00e9d\u00e9'}</span><button class="btn sm warn" data-a="bike-take" data-bike="${k.id}" data-name="${k.name}">Retirer</button>` : html`<button class="btn sm" data-a="bike-give" data-bike="${k.id}" data-name="${k.name}">Donner</button>`}</li>`)}</ul>` : ''}
        </section></div>
      <section class="card"><h2>Signalements concernant ce compte</h2>${d.reports.length ? html`<div class="tbl-wrap"><table><thead><tr><th>#</th><th>Date</th><th>Par</th><th>Motif</th><th>Statut</th><th>D\u00e9cision</th></tr></thead><tbody>
        ${d.reports.map(r => html`<tr class="link" data-href="#signalement/${r.id}"><td>${r.id}</td><td class="num">${dt(r.created_at)}</td><td>${r.reporter || 'compte supprim\u00e9'}</td><td>${REASON[r.reason]}</td><td>${pill(RSTATUS[r.status])}</td><td>${r.decision ? DECISION[r.decision] : '\u2014'}</td></tr>`)}</tbody></table></div>` : html`<div class="empty">Aucun signalement.</div>`}</section>
      <section class="card"><h2>Historique de mod\u00e9ration</h2>${auditRows(d.history)}</section>`;
  },

  async signalements(qs) {
    const st = qs.get('status') || '';
    const r = await api('GET', '/admin/reports?' + qs.toString());
    const tab = (v, l) => html`<a href="#signalements?status=${v}" ${raw(st === v ? 'aria-current="page"' : '')}>${l}</a>`;
    return html`<div class="tabs">${tab('', 'Ouverts')}${tab('pending', 'En attente')}${tab('in_progress', 'En cours')}${tab('resolved', 'R\u00e9solus')}${tab('all', 'Tous')}</div>
      <section class="card">${r.items.length ? html`<div class="tbl-wrap"><table><thead><tr><th>#</th><th>Re\u00e7u le</th><th>Cible</th><th>Motif</th><th>Signal\u00e9 par</th><th>Statut</th><th>Pris par</th></tr></thead><tbody>
        ${r.items.map(x => html`<tr class="link" data-href="#signalement/${x.id}"><td>${x.id}</td><td class="num">${dt(x.created_at)}</td><td>${x.target_type === 'activity' ? 'Activit\u00e9 de ' : 'Profil de '}${x.target_username || 'compte supprim\u00e9'}</td>
        <td>${REASON[x.reason]}</td><td>${x.reporter || 'compte supprim\u00e9'}</td><td>${pill(RSTATUS[x.status])}</td><td>${x.assignee || '\u2014'}</td></tr>`)}</tbody></table></div>` : html`<div class="empty">Aucun signalement dans cette liste.</div>`}
        ${pager(r, '#signalements?status=' + st)}</section>`;
  },

  async signalement(qs, id) {
    const d = await api('GET', '/admin/reports/' + id);
    const r = d.report, t = d.target, a = d.activity;
    const abuse = d.reporterStats && d.reporterStats.total >= 3 && d.reporterStats.no_action / d.reporterStats.total >= 0.6;
    return html`<p><a href="#signalements">\u2190 Retour aux signalements</a></p>
      <div class="grid2">
        <section class="card"><div class="card-h"><h2>Signalement #${r.id}</h2>${pill(RSTATUS[r.status])}</div>
          <dl class="kv"><dt>Re\u00e7u le</dt><dd>${dt(r.created_at)}</dd><dt>Motif</dt><dd>${REASON[r.reason]}</dd><dt>D\u00e9tails</dt><dd>${r.details || '\u2014'}</dd>
          <dt>Signal\u00e9 par</dt><dd>${r.reporter || 'compte supprim\u00e9'}${d.reporterStats ? html` <span class="muted">(${d.reporterStats.total} signalement${d.reporterStats.total > 1 ? 's' : ''}, dont ${d.reporterStats.no_action} sans suite)</span>` : ''}</dd>
          <dt>Pris en charge par</dt><dd>${r.assignee || '\u2014'}</dd><dt>Autres signalements</dt><dd>${d.otherReports} sur le m\u00eame contenu</dd>
          ${r.status === 'resolved' ? html`<dt>D\u00e9cision</dt><dd>${DECISION[r.decision]} \u2014 ${r.decision_reason}</dd>` : ''}</dl>
          ${abuse ? html`<div class="alert info" style="margin-top:12px">Attention : la plupart des signalements de cette personne ont \u00e9t\u00e9 class\u00e9s sans suite. Possible abus du syst\u00e8me de signalement.</div>` : ''}
          ${r.status !== 'resolved' ? html`<div class="acts" style="margin-top:14px">${r.status === 'pending' ? html`<button class="btn" data-a="take">Prendre en charge</button>` : html`<button class="btn" data-a="release">Remettre en attente</button>`}<button class="btn primary" data-a="resolve">Rendre une d\u00e9cision</button></div>` : ''}
        </section>
        <section class="card"><h2>Contenu signal\u00e9</h2>
          ${t ? html`<dl class="kv"><dt>Compte</dt><dd>${ava(t)}<a href="#utilisateur/${t.id}">${t.username}</a> ${pill(STATUS[t.status])}</dd><dt>R\u00f4le</dt><dd>${ROLE[t.role]}</dd><dt>Inscription</dt><dd>${day(t.createdAt)}</dd><dt>Bio</dt><dd>${t.bio || '\u2014'}</dd></dl>` : html`<p class="muted">Le compte vis\u00e9 a \u00e9t\u00e9 supprim\u00e9.</p>`}
          ${a ? html`<h2 style="margin-top:16px">Activit\u00e9</h2><dl class="kv"><dt>Titre</dt><dd>${a.title} ${a.hidden ? html`<span class="pill bad">masqu\u00e9e</span>` : ''}</dd><dt>Date</dt><dd>${dt(a.started_at)}</dd>
            <dt>Donn\u00e9es</dt><dd>${(a.distance_m / 1000).toFixed(1)} km \u00b7 ${Math.round(a.duration_s / 60)} min \u00b7 ${a.elevation_m} m D+${a.avg_power ? ` \u00b7 ${a.avg_power} W moy.` : ''}${a.avg_hr ? ` \u00b7 ${a.avg_hr} bpm` : ''}</dd>
            <dt>Vitesse moyenne</dt><dd>${(a.distance_m / a.duration_s * 3.6).toFixed(1)} km/h</dd><dt>Source</dt><dd>${a.source === 'home-trainer' ? 'Home trainer' : 'Saisie manuelle'}</dd></dl>` : r.target_type === 'activity' ? html`<p class="muted">L\u2019activit\u00e9 a \u00e9t\u00e9 supprim\u00e9e.</p>` : ''}
        </section></div>
      <section class="card"><h2>Notes internes</h2>${d.notes.length ? d.notes.map(n => html`<div class="note"><small>${n.author_name} \u00b7 ${dt(n.created_at)}</small><div>${n.note}</div></div>`) : html`<p class="muted">Aucune note.</p>`}
        <form id="nf" style="display:flex;flex-direction:column;gap:8px;margin-top:8px"><label class="muted" for="note">Ajouter une note (visible uniquement par l\u2019\u00e9quipe)</label><textarea class="input" id="note" name="note" rows="2" maxlength="2000" required></textarea><div><button class="btn" type="submit">Ajouter la note</button></div></form></section>
      <section class="card"><h2>Historique</h2>${auditRows(d.history)}</section>`;
  },

  async contenus(qs) {
    const tab = qs.get('onglet') || 'defis';
    const t = (v, l) => html`<a href="#contenus?onglet=${v}" ${raw(tab === v ? 'aria-current="page"' : '')}>${l}</a>`;
    let body;
    if (tab === 'defis') {
      const r = await api('GET', '/admin/challenges');
      body = html`<section class="card"><div class="card-h"><h2>D\u00e9fis cyclistes</h2><button class="btn primary" data-a="new-ch">Nouveau d\u00e9fi</button></div>
        ${r.items.length ? html`<div class="tbl-wrap"><table><thead><tr><th>Titre</th><th>Objectif</th><th>Dates</th><th>Participants</th><th>R\u00e9ussis</th><th>\u00c9tat</th><th></th></tr></thead><tbody>
        ${r.items.map(c => html`<tr><td>${c.title}</td><td>${nf(c.target)} ${c.unit}</td><td class="num">${day(c.starts_at)} \u2192 ${day(c.ends_at)}</td><td>${c.participants}</td><td>${c.completed}</td>
          <td>${!c.published ? html`<span class="pill">Brouillon</span>` : new Date(c.ends_at) < new Date() ? html`<span class="pill">Termin\u00e9</span>` : new Date(c.starts_at) > new Date() ? html`<span class="pill cyan">\u00c0 venir</span>` : html`<span class="pill ok">En cours</span>`}</td>
          <td class="acts"><button class="btn sm" data-a="edit-ch" data-id="${c.id}">Modifier</button><button class="btn sm danger" data-a="del-ch" data-id="${c.id}" data-title="${c.title}">Supprimer</button></td></tr>`)}</tbody></table></div>` : html`<div class="empty">Aucun d\u00e9fi. Cr\u00e9e le premier : il appara\u00eetra sur l\u2019accueil et la page D\u00e9fis.</div>`}</section>`;
      pages._challenges = r.items;
    } else if (tab === 'annonces') {
      const r = await api('GET', '/admin/announcements');
      body = html`<section class="card"><div class="card-h"><h2>Annonces officielles</h2><button class="btn primary" data-a="new-ann">Nouvelle annonce</button></div>
        <p class="muted" style="margin-top:0">Une annonce est envoy\u00e9e en notification \u00e0 tous les comptes actifs.</p>
        ${r.items.length ? r.items.map(a => html`<div class="note" style="display:flex;justify-content:space-between;gap:12px"><div><b>${a.title}</b><div>${a.body}</div><small>${a.author || '\u2014'} \u00b7 ${dt(a.created_at)}</small></div><button class="btn sm danger" data-a="del-ann" data-id="${a.id}" data-title="${a.title}">Retirer</button></div>`) : html`<div class="empty">Aucune annonce publi\u00e9e.</div>`}</section>`;
    } else {
      const r = await api('GET', '/admin/activities?' + qs.toString());
      body = html`<section class="card"><form class="filters" id="af"><input type="hidden" name="onglet" value="activites"><input class="input" name="q" value="${qs.get('q') || ''}" placeholder="Titre ou nom d\u2019utilisateur" aria-label="Recherche" style="flex:1;min-width:200px">
        <select class="input" name="hidden" aria-label="Visibilit\u00e9"><option value="">Toutes</option><option value="yes" ${raw(qs.get('hidden') === 'yes' ? 'selected' : '')}>Masqu\u00e9es uniquement</option></select><button class="btn primary" type="submit">Filtrer</button></form></section>
        <section class="card">${r.items.length ? html`<div class="tbl-wrap"><table><thead><tr><th>Date</th><th>Cycliste</th><th>Titre</th><th>Donn\u00e9es</th><th>Source</th><th></th></tr></thead><tbody>
        ${r.items.map(a => html`<tr><td class="num">${dt(a.started_at)}</td><td>${a.username}</td><td>${a.title} ${a.hidden ? html`<span class="pill bad">masqu\u00e9e</span>` : ''}</td><td class="num">${(a.distance_m / 1000).toFixed(1)} km \u00b7 ${Math.round(a.duration_s / 60)} min \u00b7 ${(a.distance_m / a.duration_s * 3.6).toFixed(1)} km/h</td><td>${a.source === 'home-trainer' ? 'Home trainer' : 'Manuelle'}</td>
          <td>${a.hidden ? html`<button class="btn sm" data-a="unhide" data-id="${a.id}">R\u00e9tablir</button>` : html`<button class="btn sm warn" data-a="hide" data-id="${a.id}">Masquer</button>`}</td></tr>`)}</tbody></table></div>` : html`<div class="empty">Aucune activit\u00e9.</div>`}
        ${pager(r, '#contenus?' + new URLSearchParams([...qs].filter(([k]) => k !== 'page')).toString())}</section>`;
    }
    return html`<div class="tabs">${t('defis', 'D\u00e9fis')}${t('annonces', 'Annonces')}${t('activites', 'Activit\u00e9s publi\u00e9es')}</div>${body}`;
  },

  async reglages() {
    const d = await api('GET', '/admin/settings');
    const v = d.values, dis = k => raw(d.sensitive.includes(k) && !d.canEditSensitive ? 'disabled' : '');
    return html`<form id="sf" style="display:flex;flex-direction:column;gap:16px">
      <section class="card"><h2>Param\u00e8tres g\u00e9n\u00e9raux</h2><div style="display:flex;flex-direction:column;gap:14px;max-width:560px">
        <label style="display:flex;gap:10px;align-items:center"><input type="checkbox" name="registration_open" ${raw(v.registration_open ? 'checked' : '')}> Inscriptions ouvertes</label>
        <div class="field"><label for="mm">Message affich\u00e9 sur le tableau de bord de tous les membres (vide = aucun)</label><input class="input" id="mm" name="maintenance_message" maxlength="300" value="${v.maintenance_message}"></div>
        <div class="field"><label for="ce">E-mail de contact affich\u00e9 dans le pied de page</label><input class="input" id="ce" name="contact_email" type="email" value="${v.contact_email}"></div></div></section>
      <section class="card"><h2>Param\u00e8tres sensibles ${d.canEditSensitive ? '' : html`<span class="pill">super-administrateur uniquement</span>`}</h2><div style="display:flex;flex-direction:column;gap:14px;max-width:560px">
        <div class="field"><label for="sd">Dur\u00e9e d\u2019une session sans activit\u00e9 (jours, 1 \u00e0 90)</label><input class="input" id="sd" name="session_days" type="number" min="1" max="90" value="${v.session_days}" ${dis('session_days')}></div>
        <label style="display:flex;gap:10px;align-items:center"><input type="checkbox" name="require_verified_email_for_login" ${raw(v.require_verified_email_for_login ? 'checked' : '')} ${dis('require_verified_email_for_login')}> Exiger un e-mail confirm\u00e9 pour se connecter</label>
        <p class="def">\u00c0 n\u2019activer que si l\u2019envoi d\u2019e-mails (Resend) est configur\u00e9, sinon plus personne ne pourra confirmer son adresse.</p></div></section>
      <div><button class="btn primary" type="submit">Enregistrer les r\u00e9glages</button></div></form>`;
  },

  /* ---------- Gestion des \u00e9quipements ---------- */
  async equipements(qs) {
    const mine = await api('GET', '/admin/equipment?user=me');
    const who = qs.get('membre');
    const target = who ? await api('GET', '/admin/equipment?user=' + encodeURIComponent(who)) : null;
    const found = qs.get('q') ? await api('GET', '/admin/users?' + new URLSearchParams({ q: qs.get('q') }).toString()) : null;
    const wheels = mine.items.filter(i => i.kind === 'wheels');
    const row = (k, t) => html`<li><span class="bl-name"><b>${k.name}</b><span class="muted">${k.kind === 'wheels' ? 'Roues carbone' : 'V\u00e9lo'} \u00b7 ${nf(k.price)} pi\u00e8ces en boutique</span></span>
      ${k.owned ? html`<span class="pill ok">${k.inUse ? 'Poss\u00e9d\u00e9 \u00b7 mont\u00e9' : 'Poss\u00e9d\u00e9'}</span><button class="btn sm warn" data-a="eq-take" data-item="${k.id}" data-name="${k.name}" data-user="${t.me ? 'me' : t.id}" data-uname="${t.username}">Retirer</button>`
        : html`<button class="btn sm" data-a="eq-give" data-item="${k.id}" data-name="${k.name}" data-user="${t.me ? 'me' : t.id}" data-uname="${t.username}">Donner</button>`}</li>`;
    return html`<section class="card"><h2>Me donner des roues carbone</h2>
        <p class="muted" style="margin:6px 0 12px">Les roues sont ajout\u00e9es \u00e0 l\u2019inventaire de ton compte (${me.username}) dans la base de donn\u00e9es : tu les retrouves dans ton garage sur tous tes appareils. L\u2019action est journalis\u00e9e.</p>
        <form id="selfw" class="filters"><select class="input" name="item" aria-label="Mod\u00e8le de roues carbone">${wheels.map(w => html`<option value="${w.id}" ${raw(w.owned ? 'disabled' : '')}>${w.name}${w.owned ? ' \u2014 d\u00e9j\u00e0 dans ton inventaire' : ''}</option>`)}</select>
          <button class="btn primary" type="submit" ${raw(wheels.every(w => w.owned) ? 'disabled' : '')}>Me donner des roues carbone</button></form>
        <ul class="bike-list" style="margin-top:12px">${wheels.map(w => html`<li><span class="bl-name"><b>${w.name}</b><span class="muted">${w.desc}</span></span>${w.owned ? html`<span class="pill ok">${w.inUse ? 'Dans ton inventaire \u00b7 mont\u00e9es' : 'Dans ton inventaire'}</span>` : html`<span class="pill">Pas encore</span>`}</li>`)}</ul>
        ${wheels.some(w => w.owned) ? html`<p class="def" style="margin-top:10px">Pour les monter : <a href="/garage">Garage</a> \u2192 Roues.</p>` : ''}</section>
      <section class="card"><h2>Attribuer un \u00e9quipement \u00e0 un membre</h2>
        <p class="muted" style="margin:6px 0 12px">Cherche le compte, puis donne ou reprends un v\u00e9lo ou des roues carbone. Le membre ne paie rien et voit l\u2019attribution dans son historique. Un \u00e9quipement d\u00e9j\u00e0 poss\u00e9d\u00e9 ne peut pas \u00eatre donn\u00e9 une seconde fois.</p>
        <form id="eqf" class="filters"><input class="input" name="q" value="${qs.get('q') || ''}" placeholder="Nom d\u2019utilisateur ou identifiant" aria-label="Rechercher un membre" style="flex:1;min-width:200px"><button class="btn primary" type="submit">Rechercher</button></form>
        ${found ? (found.items.length ? html`<ul class="bike-list" style="margin-top:12px">${found.items.slice(0, 10).map(u => html`<li><span class="bl-name"><b>${u.username}</b><span class="muted">#${u.id} \u00b7 ${ROLE[u.role]}</span></span><a class="btn sm" href="#equipements?q=${encodeURIComponent(qs.get('q'))}&membre=${u.id}">Choisir</a></li>`)}</ul>` : html`<div class="empty">Aucun compte ne correspond.</div>`) : ''}</section>
      ${target ? html`<section class="card"><div class="card-h"><h2>\u00c9quipements de ${target.target.username}</h2><a href="#utilisateur/${target.target.id}">Fiche du compte</a></div>
        <h3 style="margin:8px 0">Roues carbone</h3><ul class="bike-list">${target.items.filter(i => i.kind === 'wheels').map(k => row(k, target.target))}</ul>
        <h3 style="margin:16px 0 8px">V\u00e9los</h3><ul class="bike-list">${target.items.filter(i => i.kind === 'bike').map(k => row(k, target.target))}</ul></section>` : ''}`;
  },

  /* ---------- Sessions multijoueur ---------- */
  async multijoueur(qs) {
    const st = qs.get('status') === 'recent' ? 'recent' : 'active';
    const r = await api('GET', '/admin/multiplayer?status=' + st);
    const tab = (v, l) => html`<a href="#multijoueur?status=${v}" ${raw(st === v ? 'aria-current="page"' : '')}>${l}</a>`;
    const SPILL = { open: ['Active', 'ok'], ended: ['Termin\u00e9e', ''], closed: ['Ferm\u00e9e par l\u2019\u00e9quipe', 'bad'] };
    return html`<div class="tabs">${tab('active', 'Sessions actives')}${tab('recent', '7 derniers jours')}</div>
      <p class="def">Donn\u00e9es lues dans la base partag\u00e9e, quel que soit l\u2019appareil ou le lieu des participants. \u00ab Connect\u00e9 \u00bb : nouvelle re\u00e7ue il y a moins de ${r.rules.connectedS} s. Un participant sans nouvelle depuis ${r.rules.leaveAfterMin} min est retir\u00e9 ; une session sans participant connect\u00e9 depuis ${r.rules.idleEndMin} min se termine. Seule la position virtuelle sur le parcours est partag\u00e9e, jamais de position GPS. Mise \u00e0 jour automatique toutes les 5 s.</p>
      ${r.items.length ? r.items.map(s => html`<section class="card"><div class="card-h"><h2><span class="num">${s.code}</span> \u00b7 ${s.routeName}</h2><span class="acts" style="align-items:center">${pill(SPILL[s.status])}
          ${s.status === 'open' && can('mp.manage') ? html`<button class="btn sm danger" data-a="mp-close" data-id="${s.id}" data-code="${s.code}">Fermer la session</button>` : ''}</span></div>
        <dl class="kv"><dt>Cr\u00e9\u00e9e le</dt><dd>${dt(s.createdAt)} par ${s.hostName || 'compte supprim\u00e9'}</dd><dt>Joueurs pr\u00e9sents</dt><dd>${s.present} / ${s.maxPlayers} \u00b7 ${s.connected} connect\u00e9${s.connected > 1 ? 's' : ''}</dd>
          ${s.status !== 'open' ? html`<dt>Fin</dt><dd>${dt(s.endedAt)} \u2014 ${s.endReason || '\u2014'}</dd>` : ''}</dl>
        <div class="tbl-wrap" style="margin-top:12px"><table><thead><tr><th>Participant</th><th>Connexion</th><th>\u00c9tat</th><th>Position virtuelle</th><th>Entr\u00e9 dans la session</th><th>Derni\u00e8re nouvelle</th></tr></thead><tbody>
          ${s.players.map(p => html`<tr><td><a href="#utilisateur/${p.id}">${p.username}</a></td><td>${p.state === 'left' ? html`<span class="pill">Parti</span>` : p.connected ? html`<span class="pill ok">\u25cf Connect\u00e9</span>` : html`<span class="pill warn">D\u00e9connect\u00e9</span>`}</td>
            <td>${p.stateLabel}</td><td class="num">km ${String(p.km).replace('.', ',')}</td><td class="num">${dt(p.joinedAt)}</td><td class="num">${p.leftAt ? 'parti le ' + dt(p.leftAt) : dt(p.seenAt)}</td></tr>`)}</tbody></table></div>
        <details style="margin-top:10px"><summary>Changements de statut (${s.events.length})</summary><ul class="mp-ev">${s.events.map(e => html`<li><span class="num muted">${dt(e.at)}</span> <b>${e.username || 'syst\u00e8me'}</b> ${e.label}</li>`)}</ul></details></section>`)
      : html`<div class="empty">${st === 'active' ? 'Aucune session multijoueur active en ce moment.' : 'Aucune session sur les 7 derniers jours.'}</div>`}`;
  },

  async journal(qs) {
    const r = await api('GET', '/admin/audit?' + qs.toString());
    const groups = [['', 'Toutes les actions'], ['user.', 'Comptes'], ['report.', 'Signalements'], ['activity.', 'Activit\u00e9s'], ['challenge.', 'D\u00e9fis'], ['announcement.', 'Annonces'], ['settings.', 'R\u00e9glages'], ['mp.', 'Multijoueur'], ['shop.', 'Prix de la boutique'], ['milestone.', 'Paliers de niveau'], ['route.', 'Parcours'], ['incident.', 'Incidents des parcours']];
    return html`<section class="card"><form class="filters" id="jf"><select class="input" name="action" aria-label="Type d\u2019action">${groups.map(([v, l]) => html`<option value="${v}" ${raw((qs.get('action') || '') === v ? 'selected' : '')}>${l}</option>`)}</select>
      <input class="input" name="actor" value="${qs.get('actor') || ''}" placeholder="Membre de l\u2019\u00e9quipe" aria-label="Auteur"><button class="btn primary" type="submit">Filtrer</button></form></section>
      ${!can('audit.view') ? html`<p class="def">En tant que mod\u00e9rateur, tu vois uniquement les actions de mod\u00e9ration.</p>` : ''}
      <section class="card">${auditRows(r.items)}${pager(r, '#journal?' + new URLSearchParams([...qs].filter(([k]) => k !== 'page')).toString())}</section>`;
  },
};

function userTable(items) {
  return html`<div class="tbl-wrap"><table><thead><tr><th>#</th><th>Utilisateur</th>${can('users.view') ? html`<th>E-mail</th>` : ''}<th>R\u00f4le</th><th>Statut</th><th>Connexion</th><th>Inscription</th><th>Derni\u00e8re visite</th></tr></thead><tbody>
    ${items.map(u => html`<tr class="link" data-href="#utilisateur/${u.id}"><td class="num">${u.id}</td><td>${ava(u)}${u.username}</td>${can('users.view') ? html`<td>${u.email}${u.emailVerified ? '' : html` <span class="pill warn">non confirm\u00e9</span>`}</td>` : ''}
    <td>${ROLE[u.role]}</td><td>${pill(STATUS[u.status])}</td><td>${u.online ? html`<span class="pill ok">\u25cf En ligne</span>` : html`<span class="pill">Hors ligne</span>`}</td><td class="num">${day(u.createdAt)}</td><td class="num">${day(u.lastSeenAt)}</td></tr>`)}</tbody></table></div>`;
}

/* ---------- Actions ---------- */
const reasonField = (label = 'Motif (visible dans l\u2019historique)') => html`<div class="field"><label for="rs">${label}</label><textarea class="input" id="rs" name="reason" rows="2" minlength="5" maxlength="500" required></textarea></div>`;

function bindUser(main, id) {
  main.addEventListener('click', async e => {
    const b = e.target.closest('[data-a]'); if (!b) return;
    const name = ($('[data-uname]', main) || {}).dataset?.uname || $('h2', main).textContent.trim();
    const done = msg => { toast(msg); show(); };
    const a = b.dataset.a;
    if (a === 'suspend') confirmForm({ title: `Suspendre ${name}`, text: 'Le compte est d\u00e9connect\u00e9 et ne peut plus se connecter jusqu\u2019\u00e0 la fin de la suspension.', confirm: 'Suspendre', danger: true,
      fields: html`<div class="field"><label for="dd">Dur\u00e9e (jours, ${can('users.manage') ? '1 \u00e0 365' : '1 \u00e0 30'})</label><input class="input" id="dd" name="days" type="number" min="1" max="${can('users.manage') ? 365 : 30}" value="7" required></div>${reasonField()}`,
      fn: async f => { await api('POST', `/admin/users/${id}/suspend`, { days: Number(f.days), reason: f.reason }); done('Compte suspendu.'); } });
    if (a === 'reactivate') confirmForm({ title: `R\u00e9activer ${name}`, confirm: 'R\u00e9activer', fields: html`<div class="field"><label for="rs">Motif (facultatif)</label><input class="input" id="rs" name="reason" maxlength="500"></div>`,
      fn: async f => { await api('POST', `/admin/users/${id}/reactivate`, { reason: f.reason }); done('Compte r\u00e9activ\u00e9.'); } });
    if (a === 'ban') confirmForm({ title: `Bannir ${name}`, text: 'Le compte est d\u00e9connect\u00e9 et ne pourra plus se connecter. Un bannissement peut \u00eatre lev\u00e9 avec \u00ab R\u00e9activer \u00bb.', confirm: 'Bannir', danger: true, fields: reasonField(),
      fn: async f => { await api('POST', `/admin/users/${id}/ban`, { reason: f.reason }); done('Compte banni.'); } });
    if (a === 'verify') confirmForm({ title: 'Confirmer l\u2019e-mail manuellement', text: '\u00c0 utiliser seulement si tu as v\u00e9rifi\u00e9 par un autre moyen que l\u2019adresse appartient bien \u00e0 cette personne.', confirm: 'Confirmer',
      fn: async () => { await api('POST', `/admin/users/${id}/verify-email`, {}); done('E-mail confirm\u00e9.'); } });
    if (a === 'role') confirmForm({ title: `R\u00f4le de ${name}`, text: 'La personne est d\u00e9connect\u00e9e et retrouve ses nouveaux droits \u00e0 sa prochaine connexion. Le changement est journalis\u00e9.', confirm: 'Enregistrer',
      fields: html`<div class="field"><label for="ro">Nouveau r\u00f4le</label><select class="input" id="ro" name="role">${Object.entries(ROLE).map(([k, l]) => html`<option value="${k}">${l}</option>`)}</select></div>`,
      fn: async f => { await api('POST', `/admin/users/${id}/role`, { role: f.role }); done('R\u00f4le modifi\u00e9.'); } });
    if (a === 'rw-add' || a === 'rw-remove') {
      const add = a === 'rw-add', curXp = Number(b.dataset.xp), curCoins = Number(b.dataset.coins), key = opKey();
      confirmForm({ title: `${add ? 'Ajouter' : 'Retirer'} des XP ou des pi\u00e8ces \u2014 ${name}`,
        text: add ? 'Le membre voit l\u2019ajout et son motif dans son historique. L\u2019action est journalis\u00e9e.' : `Solde actuel : ${nf(curXp)} XP et ${nf(curCoins)} pi\u00e8ces. Tu ne peux pas retirer plus que ce solde. Le membre voit le retrait et son motif dans son historique.`,
        confirm: add ? 'Ajouter' : 'Retirer', danger: !add,
        fields: html`<div class="grid2"><div class="field"><label for="ax">XP \u00e0 ${add ? 'ajouter' : 'retirer'}</label><input class="input" id="ax" name="xp" type="number" value="0" min="0" max="${add ? 100000 : curXp}"></div>
          <div class="field"><label for="ac">Pi\u00e8ces \u00e0 ${add ? 'ajouter' : 'retirer'}</label><input class="input" id="ac" name="coins" type="number" value="0" min="0" max="${add ? 100000 : curCoins}"></div></div>
          ${!add ? html`<label style="display:flex;gap:8px;align-items:center;font-size:14px"><input type="checkbox" id="rwAll"> Tout retirer (${nf(curXp)} XP et ${nf(curCoins)} pi\u00e8ces)</label>` : ''}
          ${reasonField(`Motif du ${add ? 'gain' : 'retrait'} (visible par le membre)`)}`,
        fn: async f => {
          const xp = Math.abs(Math.round(Number(f.xp || 0))), coins = Math.abs(Math.round(Number(f.coins || 0)));
          if (!xp && !coins) throw new Error('Indique un nombre d\u2019XP ou de pi\u00e8ces.');
          if (!add && (xp > curXp || coins > curCoins)) throw new Error('Tu ne peux pas retirer plus que le solde du membre.');
          await api('POST', `/admin/users/${id}/rewards`, { xp: add ? xp : -xp, coins: add ? coins : -coins, reason: f.reason, opKey: key });
          done(add ? `Ajout\u00e9 : ${nf(xp)} XP et ${nf(coins)} pi\u00e8ces.` : `Retir\u00e9 : ${nf(xp)} XP et ${nf(coins)} pi\u00e8ces.`);
        } });
      const all = $('#rwAll'); if (all) all.onchange = () => { $('#ax').value = all.checked ? curXp : 0; $('#ac').value = all.checked ? curCoins : 0; };
    }
    if (a === 'bike-give' || a === 'bike-take') {
      const give = a === 'bike-give', bike = b.dataset.name, key = opKey();
      confirmForm({ title: `${give ? 'Donner' : 'Retirer'} le v\u00e9lo \u00ab ${bike} \u00bb \u2014 ${name}`,
        text: give ? 'Le v\u00e9lo est ajout\u00e9 gratuitement aux v\u00e9los du membre, qui pourra le choisir dans son garage. L\u2019action est journalis\u00e9e.' : 'Le membre perd ce v\u00e9lo, sans remboursement de pi\u00e8ces. S\u2019il roulait avec, il repasse sur le mod\u00e8le A\u00e9ro. L\u2019action est journalis\u00e9e.',
        confirm: give ? 'Donner le v\u00e9lo' : 'Retirer le v\u00e9lo', danger: !give, fields: reasonField(`Motif (visible par le membre dans son historique)`),
        fn: async f => { await api('POST', `/admin/users/${id}/bikes`, { op: give ? 'give' : 'take', item: b.dataset.bike, reason: f.reason, opKey: key }); done(give ? `V\u00e9lo \u00ab ${bike} \u00bb donn\u00e9.` : `V\u00e9lo \u00ab ${bike} \u00bb retir\u00e9.`); } });
    }
    if (a === 'delete') confirmForm({ title: `Supprimer ${name} d\u00e9finitivement`, text: 'Profil, activit\u00e9s, amiti\u00e9s, r\u00e9actions, notifications et sessions sont supprim\u00e9s. Les signalements sont conserv\u00e9s sans lien vers le compte. Action irr\u00e9versible.', confirm: 'Supprimer d\u00e9finitivement', danger: true,
      fields: html`<div class="field"><label for="cn">Pour confirmer, saisis le nom d\u2019utilisateur \u00ab ${name} \u00bb</label><input class="input" id="cn" name="confirm" autocomplete="off" required></div>${reasonField()}`,
      fn: async f => { await api('DELETE', `/admin/users/${id}`, { confirm: f.confirm, reason: f.reason }); toast('Compte supprim\u00e9.'); location.hash = '#utilisateurs'; } });
  });
}

function bindReport(main, id) {
  $('#nf', main)?.addEventListener('submit', async e => {
    e.preventDefault();
    try { await api('POST', `/admin/reports/${id}/note`, { note: new FormData(e.target).get('note') }); toast('Note ajout\u00e9e.'); show(); } catch (err) { toast(err.message, 'bad'); }
  });
  main.addEventListener('click', async e => {
    const b = e.target.closest('[data-a]'); if (!b) return;
    if (b.dataset.a === 'take' || b.dataset.a === 'release') {
      try { await api('POST', `/admin/reports/${id}/status`, { status: b.dataset.a === 'take' ? 'in_progress' : 'pending' }); toast('Statut mis \u00e0 jour.'); show(); } catch (err) { toast(err.message, 'bad'); }
    }
    if (b.dataset.a === 'resolve') {
      const opts = Object.entries(DECISION).filter(([k]) => (k !== 'suspended' || can('users.suspend')) && (k !== 'banned' || can('users.manage')));
      confirmForm({ title: 'Rendre une d\u00e9cision', text: 'La d\u00e9cision s\u2019applique aussi aux autres signalements ouverts sur le m\u00eame contenu. La personne qui a signal\u00e9 est pr\u00e9venue que son signalement a \u00e9t\u00e9 trait\u00e9.', confirm: 'Appliquer la d\u00e9cision',
        fields: html`<div class="field"><label for="dc">D\u00e9cision</label><select class="input" id="dc" name="decision">${opts.map(([k, l]) => html`<option value="${k}">${l}</option>`)}</select></div>
          <div class="field" id="dayf" hidden><label for="dd">Dur\u00e9e de suspension (jours)</label><input class="input" id="dd" name="days" type="number" min="1" max="${can('users.manage') ? 365 : 30}" value="7"></div>${reasonField('Motif de la d\u00e9cision')}`,
        fn: async f => { await api('POST', `/admin/reports/${id}/resolve`, { decision: f.decision, reason: f.reason, days: f.days ? Number(f.days) : undefined }); toast('D\u00e9cision enregistr\u00e9e.'); show(); } });
      const sel = $('#dc'); sel.onchange = () => ($('#dayf').hidden = sel.value !== 'suspended');
    }
  });
}

function challengeForm(c = {}) {
  const d = v => v ? new Date(new Date(v) - new Date(v).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '';
  return html`<div class="field"><label for="ct">Titre</label><input class="input" id="ct" name="title" required minlength="3" maxlength="80" value="${c.title || ''}"></div>
    <div class="field"><label for="cd">Description</label><textarea class="input" id="cd" name="description" rows="2" maxlength="600">${c.description || ''}</textarea></div>
    <div class="grid2"><div class="field"><label for="cm">Mesure</label><select class="input" id="cm" name="metric">${[['distance', 'Distance (km)'], ['elevation', 'D\u00e9nivel\u00e9 (m)'], ['duration', 'Temps (minutes)'], ['count', 'Nombre de sorties']].map(([k, l]) => html`<option value="${k}" ${raw(c.metric === k ? 'selected' : '')}>${l}</option>`)}</select></div>
      <div class="field"><label for="cg">Objectif</label><input class="input" id="cg" name="target" type="number" min="1" required value="${c.target || ''}"></div></div>
    <div class="grid2"><div class="field"><label for="cs">D\u00e9but</label><input class="input" id="cs" name="startsAt" type="datetime-local" required value="${d(c.starts_at)}"></div>
      <div class="field"><label for="ce">Fin</label><input class="input" id="ce" name="endsAt" type="datetime-local" required value="${d(c.ends_at)}"></div></div>
    <label style="display:flex;gap:8px;align-items:center"><input type="checkbox" name="published" ${raw(c.published === false ? '' : 'checked')}> Publi\u00e9 (visible par les membres)</label>`;
}

function bindEquipment(main) {
  const self = $('#selfw', main);
  if (self) self.onsubmit = e => {
    e.preventDefault();
    const sel = $('select', self), name = sel.selectedOptions[0]?.textContent || '';
    confirmForm({ title: 'Me donner des roues carbone', text: `\u00ab ${name} \u00bb sera ajout\u00e9 \u00e0 l\u2019inventaire de ton compte. L\u2019action est inscrite dans le journal de l\u2019\u00e9quipe.`, confirm: 'Ajouter \u00e0 mon inventaire',
      fields: html`<div class="field"><label for="rs">Motif (facultatif)</label><input class="input" id="rs" name="reason" maxlength="500"></div>`,
      fn: async f => { await api('POST', '/admin/equipment', { op: 'give', item: sel.value, user: 'me', reason: f.reason || undefined }); toast(`\u00ab ${name} \u00bb ajout\u00e9 \u00e0 ton inventaire.`); show(); } });
  };
  main.addEventListener('click', e => {
    const b = e.target.closest('[data-a^="eq-"]'); if (!b) return;
    const give = b.dataset.a === 'eq-give', item = b.dataset.name, who = b.dataset.uname, key = opKey();
    confirmForm({ title: `${give ? 'Donner' : 'Retirer'} \u00ab ${item} \u00bb \u2014 ${who}`,
      text: give ? 'L\u2019\u00e9quipement est ajout\u00e9 gratuitement \u00e0 l\u2019inventaire du membre, qui peut l\u2019utiliser dans son garage. L\u2019action est journalis\u00e9e.' : 'Le membre perd cet \u00e9quipement, sans remboursement de pi\u00e8ces. S\u2019il l\u2019utilisait, il repasse sur l\u2019\u00e9quipement gratuit. L\u2019action est journalis\u00e9e.',
      confirm: give ? 'Donner' : 'Retirer', danger: !give, fields: reasonField('Motif (visible par le membre dans son historique)'),
      fn: async f => { await api('POST', '/admin/equipment', { op: give ? 'give' : 'take', item: b.dataset.item, user: b.dataset.user === 'me' ? 'me' : Number(b.dataset.user), reason: f.reason, opKey: key }); toast(give ? `\u00ab ${item} \u00bb donn\u00e9 \u00e0 ${who}.` : `\u00ab ${item} \u00bb retir\u00e9 \u00e0 ${who}.`); show(); } });
  });
}

function bindMultiplayer(main) {
  main.addEventListener('click', e => {
    const b = e.target.closest('[data-a="mp-close"]'); if (!b) return;
    confirmForm({ title: `Fermer la session ${b.dataset.code}`, text: 'Tous les participants sont sortis de la session et voient qu\u2019elle a \u00e9t\u00e9 ferm\u00e9e par l\u2019\u00e9quipe. Leur sortie continue en solo. Action journalis\u00e9e et irr\u00e9versible.', confirm: 'Fermer la session', danger: true,
      fields: html`<div class="field"><label for="cc">Pour confirmer, saisis le code \u00ab ${b.dataset.code} \u00bb</label><input class="input" id="cc" name="confirm" autocomplete="off" required></div>${reasonField('Motif (journal de l\u2019\u00e9quipe)')}`,
      fn: async f => { await api('POST', `/admin/multiplayer/${b.dataset.id}/close`, { confirm: f.confirm.trim().toUpperCase(), reason: f.reason }); toast('Session ferm\u00e9e.'); show(); } });
  });
}

function bindContent(main) {
  main.addEventListener('click', async e => {
    const b = e.target.closest('[data-a]'); if (!b) return;
    const a = b.dataset.a, id = b.dataset.id;
    const save = (existing) => async f => {
      const body = { title: f.title, description: f.description, metric: f.metric, target: Number(f.target), startsAt: new Date(f.startsAt).toISOString(), endsAt: new Date(f.endsAt).toISOString(), published: !!f.published };
      if (existing) await api('PUT', '/admin/challenges/' + existing, body); else await api('POST', '/admin/challenges', body);
      toast(existing ? 'D\u00e9fi modifi\u00e9.' : 'D\u00e9fi cr\u00e9\u00e9.'); show();
    };
    if (a === 'new-ch') confirmForm({ title: 'Nouveau d\u00e9fi', fields: challengeForm(), confirm: 'Cr\u00e9er', fn: save() });
    if (a === 'edit-ch') confirmForm({ title: 'Modifier le d\u00e9fi', fields: challengeForm(pages._challenges.find(c => String(c.id) === id)), confirm: 'Enregistrer', fn: save(id) });
    if (a === 'del-ch') confirmForm({ title: `Supprimer \u00ab ${b.dataset.title} \u00bb ?`, text: 'Les participations et progressions associ\u00e9es sont supprim\u00e9es.', confirm: 'Supprimer', danger: true, fn: async () => { await api('DELETE', '/admin/challenges/' + id); toast('D\u00e9fi supprim\u00e9.'); show(); } });
    if (a === 'new-ann') confirmForm({ title: 'Nouvelle annonce', text: 'Elle sera envoy\u00e9e imm\u00e9diatement en notification \u00e0 tous les comptes actifs.', confirm: 'Publier',
      fields: html`<div class="field"><label for="at">Titre</label><input class="input" id="at" name="title" required minlength="3" maxlength="100"></div><div class="field"><label for="ab">Message</label><textarea class="input" id="ab" name="body" rows="4" required minlength="3" maxlength="1000"></textarea></div>`,
      fn: async f => { const r = await api('POST', '/admin/announcements', f); toast(`Annonce envoy\u00e9e \u00e0 ${r.recipients} membre${r.recipients > 1 ? 's' : ''}.`); show(); } });
    if (a === 'del-ann') confirmForm({ title: `Retirer \u00ab ${b.dataset.title} \u00bb ?`, text: 'La notification dispara\u00eet chez tous les membres.', confirm: 'Retirer', danger: true, fn: async () => { await api('DELETE', '/admin/announcements/' + id); toast('Annonce retir\u00e9e.'); show(); } });
    if (a === 'hide' || a === 'unhide') { try { await api('POST', `/admin/activities/${id}/${a}`); toast(a === 'hide' ? 'Activit\u00e9 masqu\u00e9e.' : 'Activit\u00e9 r\u00e9tablie.'); show(); } catch (err) { toast(err.message, 'bad'); } }
  });
}

/* ====================================================================================================
   \u00c9quipements & R\u00e9compenses : joueurs (solde, \u00e9quipements, pi\u00e8ces / XP), prix de la boutique, paliers 10 \u2192 100, historique.
   Chaque fen\u00eatre de confirmation re\u00e7oit une cl\u00e9 d'op\u00e9ration unique : le serveur n'applique jamais deux fois la m\u00eame.
   ==================================================================================================== */
const opKey = () => (window.crypto && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2)).replace(/[^A-Za-z0-9-]/g, '');
const KINDNAME = { bike: 'V\u00e9lo', wheels: 'Roues carbone', frame: 'Cadre photo', title: 'Titre' };
const LEDGER = { activity: 'Sortie', reversal: 'Annulation', challenge: 'D\u00e9fi', goal: 'Objectif', admin: '\u00c9quipe', purchase: 'Achat', milestone: 'Palier' };
const signed = n => (n > 0 ? '+' : '') + nf(n);
const thumb = i => i.image ? html`<img class="thumb" src="${i.image}" alt="" loading="lazy">` : html`<span class="thumb ph" aria-hidden="true">${i.kind === 'wheels' ? '\u25ce' : i.kind === 'bike' ? '\u26b2' : '\u2605'}</span>`;
const ecoTab = (cur, v, l) => html`<a href="#recompenses?onglet=${v}" ${raw(cur === v ? 'aria-current="page"' : '')}>${l}</a>`;

Object.assign(pages, {
  async recompenses(qs) {
    const tab = qs.get('onglet') || 'joueurs';
    const tabs = html`<div class="tabs">${ecoTab(tab, 'joueurs', 'Joueurs')}${ecoTab(tab, 'boutique', 'Prix de la boutique')}${ecoTab(tab, 'paliers', 'R\u00e9compenses des niveaux')}${ecoTab(tab, 'historique', 'Historique')}${can('items.grant') ? ecoTab(tab, 'moi', 'Mon inventaire') : ''}</div>`;
    let body = '';
    if (tab === 'joueurs') {
      const term = (qs.get('q') || '').trim(), who = qs.get('membre');
      const [found, d] = await Promise.all([term ? api('GET', '/admin/users?' + new URLSearchParams({ q: term }).toString()) : null, who ? api('GET', '/admin/economy/players/' + encodeURIComponent(who)) : null]);
      pages._eco = d;
      body = html`<section class="card"><h2>Rechercher un joueur</h2>
        <form class="filters" id="ecoq"><input type="hidden" name="onglet" value="joueurs"><input class="input" name="q" value="${term}" placeholder="Pseudo, e-mail ou identifiant" aria-label="Pseudo, e-mail ou identifiant" style="flex:1;min-width:200px"><button class="btn primary" type="submit">Rechercher</button></form>
        ${found ? (found.items.length ? html`<div class="tbl-wrap" style="margin-top:12px"><table><thead><tr><th>#</th><th>Joueur</th>${can('users.view') ? html`<th>E-mail</th>` : ''}<th>Niveau</th><th>XP</th><th>Pi\u00e8ces</th><th></th></tr></thead><tbody>
          ${found.items.slice(0, 15).map(u => html`<tr><td class="num">${u.id}</td><td>${ava(u)}${u.username}</td>${can('users.view') ? html`<td>${u.email}</td>` : ''}<td class="num">${u.level}</td><td class="num">${nf(u.xp)}</td><td class="num">${nf(u.coins)}</td>
            <td><a class="btn sm ${String(u.id) === who ? 'primary' : ''}" href="#recompenses?onglet=joueurs&q=${encodeURIComponent(term)}&membre=${u.id}">Ouvrir</a></td></tr>`)}</tbody></table></div>` : html`<div class="empty">Aucun joueur ne correspond \u00e0 \u00ab ${term} \u00bb.</div>`) : ''}</section>
        ${d ? ecoPlayer(d) : !term ? html`<div class="empty">Cherche un joueur pour voir son solde, ses \u00e9quipements et son historique.</div>` : ''}`;
    } else if (tab === 'boutique') {
      const d = await api('GET', '/admin/shop'), k = qs.get('type') || 'equip', term = (qs.get('q') || '').toLowerCase();
      pages._shop = d.items;
      const list = d.items.filter(i => (k === 'all' || (k === 'equip' ? i.kind === 'bike' || i.kind === 'wheels' : i.kind === k)) && (!term || i.name.toLowerCase().includes(term)));
      body = html`<section class="card"><form class="filters" id="shopf"><input type="hidden" name="onglet" value="boutique">
          <select class="input" name="type" aria-label="Type d\u2019objet">${[['equip', 'V\u00e9los et roues'], ['bike', 'V\u00e9los'], ['wheels', 'Roues carbone'], ['frame', 'Cadres photo'], ['title', 'Titres'], ['all', 'Tous les objets']].map(([v, l]) => html`<option value="${v}" ${raw(k === v ? 'selected' : '')}>${l}</option>`)}</select>
          <input class="input" name="q" value="${qs.get('q') || ''}" placeholder="Nom de l\u2019objet" aria-label="Nom de l\u2019objet" style="flex:1;min-width:160px"><button class="btn primary" type="submit">Filtrer</button></form>
        <p class="def">Le prix enregistr\u00e9 ici est celui que la boutique applique imm\u00e9diatement \u00e0 tous les joueurs (la page de la boutique et l\u2019achat relisent le prix sur le serveur). Le prix du catalogue reste la r\u00e9f\u00e9rence tant que personne ne l\u2019a modifi\u00e9. Un objet retir\u00e9 de la vente reste chez les joueurs qui le poss\u00e8dent.</p></section>
        <section class="card">${list.length ? html`<div class="tbl-wrap"><table><thead><tr><th></th><th>Objet</th><th>Type</th><th>Prix catalogue</th><th>Prix actuel</th><th>Disponibilit\u00e9</th><th>Poss\u00e9d\u00e9 par</th><th>Modifi\u00e9 le</th><th></th></tr></thead><tbody>
          ${list.map(i => html`<tr><td>${thumb(i)}</td><td><b>${i.name}</b>${i.exclusive ? html` <span class="pill">r\u00e9compense de palier</span>` : ''}</td><td>${KINDNAME[i.kind]}</td><td class="num">${nf(i.basePrice)}</td>
            <td class="num"><b>${nf(i.price)}</b>${i.price !== i.basePrice ? html` <span class="pill cyan">modifi\u00e9</span>` : ''}</td><td>${i.available ? html`<span class="pill ok">En vente</span>` : html`<span class="pill warn">Retir\u00e9 de la vente</span>`}</td>
            <td class="num">${nf(i.owners)} joueur${i.owners > 1 ? 's' : ''}</td><td class="num">${i.changedAt ? dt(i.changedAt) : '\u2014'}</td>
            <td>${can('economy.manage') ? html`<button class="btn sm" data-a="shop-edit" data-id="${i.id}">Modifier</button>` : ''}</td></tr>`)}</tbody></table></div>` : html`<div class="empty">Aucun objet ne correspond.</div>`}</section>`;
    } else if (tab === 'paliers') {
      const d = await api('GET', '/admin/milestones');
      pages._ms = d;
      body = html`<section class="card"><p class="def" style="margin-top:0">\u00c0 chaque palier, le joueur choisit <b>une</b> r\u00e9compense : le v\u00e9lo propos\u00e9 ou les pi\u00e8ces. Chaque palier ne se r\u00e9clame qu\u2019une fois (v\u00e9rifi\u00e9 par le serveur, sur tous ses appareils). Si le joueur poss\u00e8de d\u00e9j\u00e0 le v\u00e9lo du palier, le v\u00e9lo d\u2019un palier inf\u00e9rieur, puis de la boutique, lui est propos\u00e9. Modifier un palier ne change pas les r\u00e9compenses d\u00e9j\u00e0 r\u00e9clam\u00e9es. Un palier d\u00e9sactiv\u00e9 reste \u00e0 r\u00e9clamer plus tard. En plus, chaque nouveau niveau rapporte ${nf(d.levelUpCoins)} pi\u00e8ces.</p></section>
        <section class="card"><div class="tbl-wrap"><table><thead><tr><th>Niveau</th><th>XP requis</th><th>Pi\u00e8ces</th><th>V\u00e9lo au choix</th><th>\u00c9tat</th><th>Ont atteint le niveau</th><th>R\u00e9clam\u00e9</th><th>Pi\u00e8ces vers\u00e9es</th><th></th></tr></thead><tbody>
          ${d.items.map(m => html`<tr><td><b>Niveau ${m.level}</b></td><td class="num">${nf(m.xpRequired)}</td>
            <td class="num"><b>${nf(m.coins)}</b>${m.coins !== m.defaults.coins ? html`<br><span class="muted" style="font-size:12px">d\u00e9faut : ${nf(m.defaults.coins)}</span>` : ''}</td>
            <td>${m.bike ? m.bike.name : html`<span class="muted">aucun v\u00e9lo (pi\u00e8ces seulement)</span>`}${(m.bike ? m.bike.id : null) !== m.defaults.bike.id ? html`<br><span class="muted" style="font-size:12px">d\u00e9faut : ${m.defaults.bike.name}</span>` : ''}</td>
            <td>${m.enabled ? html`<span class="pill ok">Active</span>` : html`<span class="pill warn">D\u00e9sactiv\u00e9e</span>`}${m.custom ? html`<br><span class="muted" style="font-size:12px">modifi\u00e9e le ${dt(m.updatedAt)}</span>` : ''}</td>
            <td class="num">${nf(m.reached)}</td><td class="num">${nf(m.claimed)}${m.claimed ? html`<br><span class="muted" style="font-size:12px">${m.claimedBike} v\u00e9lo${m.claimedBike > 1 ? 's' : ''} \u00b7 ${m.claimedCoins} en pi\u00e8ces</span>` : ''}</td>
            <td class="num">${nf(m.coinsPaid)}</td><td>${can('economy.manage') ? html`<button class="btn sm" data-a="ms-edit" data-level="${m.level}">Modifier</button>` : ''}</td></tr>`)}</tbody></table></div></section>`;
    } else if (tab === 'historique') {
      const t = qs.get('type') || '', u = qs.get('user') || '';
      const r = await api('GET', '/admin/economy/history?' + new URLSearchParams([...qs].filter(([k]) => k !== 'onglet')).toString());
      body = html`<section class="card"><form class="filters" id="ecoh"><input type="hidden" name="onglet" value="historique">
          <select class="input" name="type" aria-label="Type d\u2019op\u00e9ration">${[['', 'Toutes les op\u00e9rations'], ['user.rewards', 'Pi\u00e8ces et XP'], ['user.item', '\u00c9quipements'], ['user.bike', 'V\u00e9los (fiche du compte)'], ['shop.', 'Prix de la boutique'], ['milestone.', 'Paliers de niveau']].map(([v, l]) => html`<option value="${v}" ${raw(t === v ? 'selected' : '')}>${l}</option>`)}</select>
          <input class="input" name="user" value="${u}" inputmode="numeric" placeholder="Identifiant du joueur (facultatif)" aria-label="Identifiant du joueur"><button class="btn primary" type="submit">Filtrer</button></form></section>
        <section class="card">${auditRows(r.items)}${pager(r, '#recompenses?' + new URLSearchParams([...qs].filter(([k]) => k !== 'page')).toString())}</section>`;
    } else if (tab === 'moi') {
      const mine = await api('GET', '/admin/equipment?user=me'), wheels = mine.items.filter(i => i.kind === 'wheels');
      body = html`<section class="card"><h2>Me donner des roues carbone</h2>
        <p class="muted" style="margin:6px 0 12px">Les roues sont ajout\u00e9es \u00e0 l\u2019inventaire de ton compte (${me.username}) : tu les retrouves dans ton garage sur tous tes appareils. L\u2019action est journalis\u00e9e.</p>
        <form id="selfw" class="filters"><select class="input" name="item" aria-label="Mod\u00e8le de roues carbone">${wheels.map(w => html`<option value="${w.id}" ${raw(w.owned ? 'disabled' : '')}>${w.name}${w.owned ? ' \u2014 d\u00e9j\u00e0 dans ton inventaire' : ''}</option>`)}</select>
          <button class="btn primary" type="submit" ${raw(wheels.every(w => w.owned) ? 'disabled' : '')}>Me donner des roues carbone</button></form>
        <ul class="bike-list" style="margin-top:12px">${wheels.map(w => html`<li><span class="bl-name"><b>${w.name}</b><span class="muted">${w.desc}</span></span>${w.owned ? html`<span class="pill ok">${w.inUse ? 'Dans ton inventaire \u00b7 mont\u00e9es' : 'Dans ton inventaire'}</span>` : html`<span class="pill">Pas encore</span>`}</li>`)}</ul></section>`;
    }
    return html`${tabs}${body}`;
  },
});

function ecoPlayer(d) {
  const u = d.user, L = u.levelInfo, pct = Math.round(L.intoLevel / L.levelSpan * 100);
  const eq = k => d.items.filter(i => i.kind === k);
  const row = i => html`<tr><td>${thumb(i)}</td><td><b>${i.name}</b></td><td class="num">${nf(i.price)}${i.available ? '' : html` <span class="pill warn">hors vente</span>`}</td>
    <td>${i.owned ? html`<span class="pill ok">${i.inUse ? 'Poss\u00e9d\u00e9 \u00b7 utilis\u00e9' : 'Poss\u00e9d\u00e9'}</span>` : html`<span class="pill">Non poss\u00e9d\u00e9</span>`}</td><td class="num">${i.acquiredAt ? dt(i.acquiredAt) : '\u2014'}</td>
    <td>${can('items.grant') ? (i.owned ? html`<button class="btn sm warn" data-a="eco-take" data-item="${i.id}" data-name="${i.name}">Retirer</button>` : html`<button class="btn sm" data-a="eco-give" data-item="${i.id}" data-name="${i.name}">Attribuer</button>`) : ''}</td></tr>`;
  const table = list => html`<div class="tbl-wrap"><table><thead><tr><th></th><th>\u00c9quipement</th><th>Prix boutique</th><th>\u00c9tat</th><th>Depuis le</th><th></th></tr></thead><tbody>${list.map(row)}</tbody></table></div>`;
  return html`<section class="card" data-player="${u.id}" data-uname="${u.username}"><div class="card-h"><h2>${ava(u)}${u.username} <span class="muted num" style="font-size:14px">#${u.id}</span></h2><span class="acts">${pill(STATUS[u.status])}<a class="btn sm" href="#utilisateur/${u.id}">Fiche du compte</a></span></div>
      ${u.email !== undefined ? html`<p class="muted" style="margin:-4px 0 12px">${u.email}</p>` : ''}
      <div class="stats"><div class="stat"><span>Niveau</span><b>${u.level}</b><div class="bar" role="img" aria-label="${pct} % du niveau suivant"><i style="width:${pct}%"></i></div><span>${nf(L.intoLevel)} / ${nf(L.levelSpan)} XP vers le niveau ${u.level + 1}</span></div>
        <div class="stat"><span>XP</span><b>${nf(u.xp)}</b></div><div class="stat"><span>Pi\u00e8ces</span><b>${nf(u.coins)}</b></div>
        <div class="stat"><span>\u00c9quipements</span><b>${d.items.filter(i => i.owned).length}</b><span>sur ${d.items.length} v\u00e9los et roues</span></div></div>
      ${can('economy.manage') ? html`<div class="acts" style="margin-top:14px"><button class="btn primary" data-a="eco-add">+ Ajouter des pi\u00e8ces ou de l\u2019XP</button><button class="btn warn" data-a="eco-remove">\u2212 Retirer des pi\u00e8ces ou de l\u2019XP</button></div>` : ''}</section>
    <div class="grid2"><section class="card"><h2>Roues carbone</h2>${table(eq('wheels'))}</section>
      <section class="card"><h2>Paliers de niveau r\u00e9clam\u00e9s</h2>${d.milestones.length ? html`<ul class="bike-list">${d.milestones.map(m => html`<li><b>Niveau ${m.level}</b><span class="muted">${m.choice === 'bike' ? 'V\u00e9lo ' + (m.item ? m.item.name : '\u2014') : nf(m.coins) + ' pi\u00e8ces'} \u00b7 ${dt(m.at)}</span></li>`)}</ul>` : html`<div class="empty">Aucun palier r\u00e9clam\u00e9.</div>`}</section></div>
    <section class="card"><h2>V\u00e9los</h2>${table(eq('bike'))}</section>
    <div class="grid2"><section class="card"><h2>Gains et d\u00e9penses (60 derniers)</h2>${d.ledger.length ? html`<div class="tbl-wrap"><table><thead><tr><th>Date</th><th>Type</th><th>Libell\u00e9</th><th>XP</th><th>Pi\u00e8ces</th></tr></thead><tbody>
        ${d.ledger.map(l => html`<tr><td class="num">${dt(l.created_at)}</td><td>${LEDGER[l.kind] || l.kind}</td><td>${l.label || '\u2014'}</td><td class="num">${l.xp ? signed(l.xp) : ''}</td><td class="num">${l.coins ? signed(l.coins) : ''}</td></tr>`)}</tbody></table></div>` : html`<div class="empty">Aucun mouvement.</div>`}</section>
      <section class="card"><h2>Op\u00e9rations de l\u2019\u00e9quipe sur ce compte</h2>${auditRows(d.ops)}</section></div>`;
}

function bindEconomy(main, qs) {
  const ff = (id, sec) => { const f = $('#' + id, main); if (f) f.onsubmit = e => { e.preventDefault(); location.hash = '#' + sec + '?' + new URLSearchParams([...new FormData(f)].filter(([, v]) => v)).toString(); }; };
  ff('ecoq', 'recompenses'); ff('shopf', 'recompenses'); ff('ecoh', 'recompenses');
  const self = $('#selfw', main);
  if (self) self.onsubmit = e => {
    e.preventDefault();
    const sel = $('select', self), name = sel.selectedOptions[0]?.textContent || '', key = opKey();
    confirmForm({ title: 'Me donner des roues carbone', text: `\u00ab ${name} \u00bb sera ajout\u00e9 \u00e0 l\u2019inventaire de ton compte. L\u2019action est inscrite dans le journal de l\u2019\u00e9quipe.`, confirm: 'Ajouter \u00e0 mon inventaire',
      fields: html`<div class="field"><label for="rs">Motif (facultatif)</label><input class="input" id="rs" name="reason" maxlength="500"></div>`,
      fn: async f => { await api('POST', '/admin/equipment', { op: 'give', item: sel.value, user: 'me', reason: f.reason || undefined, opKey: key }); toast(`\u00ab ${name} \u00bb ajout\u00e9 \u00e0 ton inventaire.`); show(); } });
  };
  main.addEventListener('click', e => {
    const b = e.target.closest('[data-a]'); if (!b) return;
    const a = b.dataset.a, pl = $('[data-player]', main), uid = pl && pl.dataset.player, uname = pl && pl.dataset.uname, key = opKey();
    if (a === 'eco-add' || a === 'eco-remove') {
      const add = a === 'eco-add', d = pages._eco.user;
      confirmForm({ title: `${add ? 'Ajouter' : 'Retirer'} des pi\u00e8ces ou de l\u2019XP \u2014 ${uname}`,
        text: add ? `Solde actuel : ${nf(d.xp)} XP et ${nf(d.coins)} pi\u00e8ces. Le joueur voit l\u2019ajout et son motif dans son historique.` : `Solde actuel : ${nf(d.xp)} XP et ${nf(d.coins)} pi\u00e8ces. Impossible de retirer plus que le solde. Le joueur voit le retrait et son motif dans son historique.`,
        confirm: add ? 'Confirmer l\u2019ajout' : 'Confirmer le retrait', danger: !add,
        fields: html`<div class="grid2"><div class="field"><label for="ax">XP \u00e0 ${add ? 'ajouter' : 'retirer'}</label><input class="input" id="ax" name="xp" type="number" value="0" min="0" step="1" max="${add ? 100000 : d.xp}"></div>
          <div class="field"><label for="ac">Pi\u00e8ces \u00e0 ${add ? 'ajouter' : 'retirer'}</label><input class="input" id="ac" name="coins" type="number" value="0" min="0" step="1" max="${add ? 100000 : d.coins}"></div></div>
          <p class="def" id="ecoPrev" style="margin:0"></p>${reasonField(`Motif ${add ? 'de l\u2019ajout' : 'du retrait'} (obligatoire, visible par le joueur)`)}`,
        fn: async f => {
          const xp = Math.round(Number(f.xp || 0)), coins = Math.round(Number(f.coins || 0));
          if (!Number.isFinite(xp) || !Number.isFinite(coins) || xp < 0 || coins < 0) throw new Error('Indique des nombres positifs.');
          if (!xp && !coins) throw new Error('Indique un nombre d\u2019XP ou de pi\u00e8ces.');
          if (!add && (xp > d.xp || coins > d.coins)) throw new Error('Tu ne peux pas retirer plus que le solde du joueur.');
          await api('POST', `/admin/users/${uid}/rewards`, { xp: add ? xp : -xp, coins: add ? coins : -coins, reason: f.reason, opKey: key });
          toast(add ? `Ajout\u00e9 \u00e0 ${uname} : ${nf(xp)} XP et ${nf(coins)} pi\u00e8ces.` : `Retir\u00e9 \u00e0 ${uname} : ${nf(xp)} XP et ${nf(coins)} pi\u00e8ces.`); show();
        } });
      const prev = () => { const x = Number($('#ax').value || 0), c = Number($('#ac').value || 0), sg = add ? 1 : -1; $('#ecoPrev').textContent = `Nouveau solde : ${nf(Math.max(0, d.xp + sg * x))} XP et ${nf(Math.max(0, d.coins + sg * c))} pi\u00e8ces.`; };
      $('#ax').oninput = prev; $('#ac').oninput = prev; prev();
    }
    if (a === 'eco-give' || a === 'eco-take') {
      const give = a === 'eco-give', item = b.dataset.name;
      confirmForm({ title: `${give ? 'Attribuer' : 'Retirer'} \u00ab ${item} \u00bb \u2014 ${uname}`,
        text: give ? 'L\u2019\u00e9quipement est ajout\u00e9 gratuitement \u00e0 l\u2019inventaire du joueur (base de donn\u00e9es) : il le retrouve dans son garage sur tous ses appareils. Action journalis\u00e9e.' : 'Le joueur perd cet \u00e9quipement, sans remboursement. S\u2019il l\u2019utilisait, il repasse sur l\u2019\u00e9quipement gratuit. Action journalis\u00e9e.',
        confirm: give ? 'Attribuer' : 'Retirer', danger: !give, fields: reasonField('Motif (obligatoire, visible par le joueur)'),
        fn: async f => { await api('POST', '/admin/equipment', { op: give ? 'give' : 'take', item: b.dataset.item, user: Number(uid), reason: f.reason, opKey: key }); toast(give ? `\u00ab ${item} \u00bb attribu\u00e9 \u00e0 ${uname}.` : `\u00ab ${item} \u00bb retir\u00e9 \u00e0 ${uname}.`); show(); } });
    }
    if (a === 'shop-edit') {
      const i = pages._shop.find(x => x.id === b.dataset.id);
      confirmForm({ title: `Prix de \u00ab ${i.name} \u00bb`, text: `Prix du catalogue : ${nf(i.basePrice)} pi\u00e8ces. Prix actuel : ${nf(i.price)} pi\u00e8ces (${i.available ? 'en vente' : 'retir\u00e9 de la vente'}). Le nouveau prix s\u2019applique tout de suite dans la boutique de tous les joueurs ; les achats d\u00e9j\u00e0 faits ne changent pas.`,
        confirm: 'Enregistrer', fields: html`<div class="grid2"><div class="field"><label for="sp">Nouveau prix (pi\u00e8ces, nombre entier de 0 \u00e0 1 000 000)</label><input class="input" id="sp" name="price" type="number" min="0" max="1000000" step="1" required value="${i.price}"></div>
          <div class="field"><label>Disponibilit\u00e9</label><label style="display:flex;gap:8px;align-items:center;min-height:42px"><input type="checkbox" name="available" ${raw(i.available ? 'checked' : '')}> En vente dans la boutique</label></div></div>
          <p class="def" id="spPrev" style="margin:0"></p>
          ${i.basePrice !== i.price ? html`<button type="button" class="btn sm" id="spReset" style="align-self:flex-start">Revenir au prix du catalogue (${nf(i.basePrice)})</button>` : ''}
          ${reasonField('Motif du changement (journal de l\u2019\u00e9quipe)')}`,
        fn: async f => {
          const price = Number(f.price);
          if (!Number.isInteger(price) || price < 0 || price > 1000000) throw new Error('Le prix doit \u00eatre un nombre entier entre 0 et 1 000 000.');
          await api('PUT', '/admin/shop/' + encodeURIComponent(i.id), { price, available: !!f.available, reason: f.reason, expected: { price: i.price, available: i.available }, opKey: key });
          toast(`Prix de \u00ab ${i.name} \u00bb enregistr\u00e9 : ${nf(price)} pi\u00e8ces${f.available ? '' : ' (retir\u00e9 de la vente)'}.`); show();
        } });
      const prev = () => { const v = $('#sp').value, ok = /^\d+$/.test(v) && Number(v) <= 1000000; $('#spPrev').textContent = ok ? `${nf(i.price)} \u2192 ${nf(Number(v))} pi\u00e8ces${Number(v) === 0 ? ' (gratuit)' : ''}` : 'Prix invalide : nombre entier positif uniquement.'; };
      $('#sp').oninput = prev; prev(); const rs = $('#spReset'); if (rs) rs.onclick = () => { $('#sp').value = i.basePrice; prev(); };
    }
    if (a === 'ms-edit') {
      const d = pages._ms, m = d.items.find(x => String(x.level) === b.dataset.level);
      confirmForm({ title: `Palier du niveau ${m.level}`, text: `${nf(m.reached)} joueur${m.reached > 1 ? 's ont' : ' a'} atteint ce niveau, ${nf(m.claimed)} ${m.claimed > 1 ? 'ont' : 'a'} d\u00e9j\u00e0 r\u00e9clam\u00e9. Les r\u00e9compenses d\u00e9j\u00e0 r\u00e9clam\u00e9es ne changent pas ; les autres joueurs verront la nouvelle offre.`,
        confirm: 'Enregistrer le palier', fields: html`<div class="grid2"><div class="field"><label for="mc">R\u00e9compense en pi\u00e8ces (d\u00e9faut : ${nf(m.defaults.coins)})</label><input class="input" id="mc" name="coins" type="number" min="0" max="1000000" step="1" required value="${m.coins}"></div>
          <div class="field"><label for="mb">V\u00e9lo propos\u00e9 au choix (d\u00e9faut : ${m.defaults.bike.name})</label><select class="input" id="mb" name="bike"><option value="">Aucun v\u00e9lo (pi\u00e8ces seulement)</option>${d.bikes.map(k => html`<option value="${k.id}" ${raw(m.bike && m.bike.id === k.id ? 'selected' : '')}>${k.name}</option>`)}</select></div></div>
          <label style="display:flex;gap:8px;align-items:center"><input type="checkbox" name="enabled" ${raw(m.enabled ? 'checked' : '')}> Palier actif (d\u00e9coch\u00e9 : les joueurs ne peuvent pas le r\u00e9clamer pour le moment, il reste \u00e0 r\u00e9clamer plus tard)</label>
          ${reasonField('Motif du changement (journal de l\u2019\u00e9quipe)')}`,
        fn: async f => {
          const coins = Number(f.coins);
          if (!Number.isInteger(coins) || coins < 0 || coins > 1000000) throw new Error('Le montant doit \u00eatre un nombre entier entre 0 et 1 000 000.');
          await api('PUT', '/admin/milestones/' + m.level, { coins, bike: f.bike || null, enabled: !!f.enabled, reason: f.reason, expected: { coins: m.coins, bike: m.bike ? m.bike.id : null, enabled: m.enabled }, opKey: key });
          toast(`Palier du niveau ${m.level} enregistr\u00e9.`); show();
        } });
    }
  });
}

/* ====================================================================================================
   Gestion des parcours : tableau, diagnostic (le vrai moteur 3D tourne dans ce navigateur), routes secondaires,
   activation / d\u00e9sactivation, incidents r\u00e9ellement constat\u00e9s.
   ==================================================================================================== */
const RSTATE = { active: ['Actif', 'ok'], disabled: ['D\u00e9sactiv\u00e9', 'warn'], error: ['En erreur', 'bad'] };
const SEV = { info: ['Info', ''], warning: ['Avertissement', 'warn'], error: ['Erreur', 'bad'], critical: ['Critique', 'bad'] };
const ISTATUS = { new: ['Nouveau', 'warn'], in_progress: ['En cours de r\u00e9solution', 'cyan'], fixed: ['Corrig\u00e9', 'ok'] };
const SRC = { player: 'Navigateur d\u2019un joueur', diagnostic: 'Diagnostic de l\u2019\u00e9quipe' };
const secs = ms => ms == null ? '\u2014' : (ms / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' s';
const tabP = (cur, v, l) => html`<a href="#parcours?onglet=${v}" ${raw(cur === v ? 'aria-current="page"' : '')}>${l}</a>`;
// Moteur 3D charg\u00e9 \u00e0 la demande dans le panneau (m\u00eames fichiers que le jeu).
let engineP = null;
function loadEngine() {
  if (window.VVWorld && window.VVAmbience) return Promise.resolve();
  return engineP ||= ['vv3d.js', 'world.js', 'ambience.js'].reduce((p, f) => p.then(() => new Promise((res, rej) => {
    const s = document.createElement('script'); s.src = 'world/' + f; s.onload = res; s.onerror = () => rej(new Error('Script du moteur introuvable : /world/' + f)); document.head.append(s);
  })), Promise.resolve()).catch(e => { engineP = null; throw e; });
}
// Sch\u00e9ma du parcours \u00ab d\u00e9pli\u00e9 \u00bb : la route principale est une ligne droite (distance en km, de gauche \u00e0 droite) ; chaque
// route secondaire est trac\u00e9e selon son \u00e9cart r\u00e9el \u00e0 la route principale (c\u00f4t\u00e9 gauche en haut, droit en bas), agrandi
// pour rester lisible : un parcours de 50 km et des routes qui s'\u00e9cartent de 100 m ne se verraient pas sur un plan \u00e0 l'\u00e9chelle.
function planSvg(W, B = []) {
  const VW = 1000, padX = 34, L = W.length, X = s => (padX + s / L * (VW - 2 * padX)).toFixed(1);
  const maxOff = Math.max(40, ...B.flatMap(b => b.dense.map(p => Math.abs(p.off))));
  const H = B.length ? 220 : 90, mid = H / 2, Y = off => (mid - off / maxOff * (mid - 26)).toFixed(1); // off < 0 = c\u00f4t\u00e9 gauche (en haut)
  let s = `<svg class="plan" viewBox="0 0 ${VW} ${H}" role="img" aria-label="Sch\u00e9ma du parcours : route principale et ${B.length} route${B.length > 1 ? 's' : ''} secondaire${B.length > 1 ? 's' : ''}">`;
  for (let k = 0; k <= Math.floor(L / 5000); k++) { const x = X(k * 5000); s += `<line x1="${x}" x2="${x}" y1="${mid - 6}" y2="${mid + 6}" stroke="#4b6280"/><text x="${x}" y="${H - 6}" fill="#7f93ad" font-size="13" text-anchor="middle">${k * 5}</text>`; }
  s += `<line x1="${X(0)}" x2="${X(L)}" y1="${mid}" y2="${mid}" stroke="#e8f3fb" stroke-width="3"/>`;
  B.forEach((b, k) => {
    s += `<polyline points="${b.dense.map(p => X(p.s) + ',' + Y(-p.off)).join(' ')}" fill="none" stroke="#22d3ee" stroke-width="2.5" stroke-linejoin="round"/>`;
    const top = b.dense.reduce((m, p) => Math.abs(p.off) > Math.abs(m.off) ? p : m, b.dense[0]), ty = +Y(-top.off) + (top.off < 0 ? -8 : 18);
    s += `<circle cx="${X(b.sA)}" cy="${mid}" r="4.5" fill="#2dd4bf"/><circle cx="${X(b.sB)}" cy="${mid}" r="4.5" fill="#2dd4bf"/><text x="${X(top.s)}" y="${ty.toFixed(1)}" fill="#22d3ee" font-size="15" text-anchor="middle" font-weight="700">${k + 1}</text>`;
  });
  s += `<circle cx="${X(0)}" cy="${mid}" r="7" fill="#34d399"/><circle cx="${X(L)}" cy="${mid}" r="7" fill="#f87171"/><text x="${X(0)}" y="18" fill="#34d399" font-size="13" text-anchor="start">D\u00e9part</text><text x="${X(L)}" y="18" fill="#f87171" font-size="13" text-anchor="end">Arriv\u00e9e \u00b7 ${(L / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} km</text>`;
  return raw(s + '</svg>');
}
const tick = () => new Promise(r => setTimeout(r, 0));
// Lignes du tableau des routes secondaires, calcul\u00e9es avec le moteur du jeu : raccords (\u00e9cart de hauteur), pente, longueur.
function branchRows(W, B) {
  return B.map((b, k) => {
    const gapA = Math.abs(b.road.E[0] - VVWorld.at(W, b.sA).y), gapB = Math.abs(b.road.E[b.road.n - 1] - VVWorld.at(W, b.sB).y);
    const okJ = gapA < 0.5 && gapB < 0.5, okG = b.maxGrade <= 0.135, okS = b.sB > b.sA && b.sB <= W.length && b.len > 0;
    return { n: k + 1, name: b.name, kind: b.kind, side: b.side > 0 ? 'droite' : 'gauche', sA: Math.round(b.sA), sB: Math.round(b.sB), len: Math.round(b.len), dplus: b.dplus, maxGrade: +(b.maxGrade * 100).toFixed(1), gapA: +gapA.toFixed(2), gapB: +gapB.toFixed(2), ok: okJ && okG && okS, okS };
  });
}
const BCACHE = {}; // routes secondaires d\u00e9j\u00e0 calcul\u00e9es dans cette page (le calcul prend quelques secondes)
// Diagnostic d'un parcours : uniquement des v\u00e9rifications r\u00e9elles, ex\u00e9cut\u00e9es sur les fichiers et le moteur du jeu.
async function runDiagnostic(rt, onStep) {
  const t0 = performance.now(), checks = [], problems = [], add = (id, label, ok, detail, prob) => { checks.push({ id, label, ok, detail: String(detail ?? '') }); if (!ok && prob) problems.push(prob); };
  onStep('Fichiers du jeu\u2026', 5);
  const files = ['ride.html', 'world/vv3d.js', 'world/world.js', 'world/rider.js', 'world/sensors.js', 'world/ambience.js', 'world/prefs.js', 'world/telemetry.js'];
  for (const f of files) { let st = 0; try { st = (await fetch(f, { method: 'HEAD', cache: 'no-store' })).status; } catch { st = 0; }
    add('file:' + f, 'Fichier ' + f, st === 200, st ? 'HTTP ' + st : 'injoignable', { kind: 'resource', severity: 'critical', message: `Fichier du jeu introuvable : ${f}`, detail: { url: f, status: st } }); }
  if (rt.img) { let st = 0; try { st = (await fetch(rt.img, { method: 'HEAD', cache: 'no-store' })).status; } catch { st = 0; }
    add('img', 'Image du parcours ' + rt.img, st === 200, st ? 'HTTP ' + st : 'injoignable', { kind: 'resource', severity: 'warning', message: `Image du parcours introuvable : ${rt.img}`, detail: { url: rt.img, status: st } }); }
  onStep('Chargement du moteur 3D\u2026', 12);
  try { await loadEngine(); add('engine', 'Chargement du moteur 3D', true, 'vv3d.js, world.js, ambience.js'); }
  catch (e) { add('engine', 'Chargement du moteur 3D', false, e.message, { kind: 'load', severity: 'critical', message: e.message, detail: {} }); return { checks, problems, durationMs: performance.now() - t0 }; }
  const r = VVWorld.byId(rt.id);
  if (!r) { add('known', 'Parcours connu du moteur 3D', false, rt.id, { kind: 'route', severity: 'critical', message: `Le moteur 3D ne conna\u00eet pas le parcours \u00ab ${rt.id} \u00bb`, detail: {} }); return { checks, problems, durationMs: performance.now() - t0 }; }
  onStep('Trac\u00e9 et relief\u2026', 18); await tick();
  let W, tb = performance.now();
  try { W = VVWorld.build(r); } catch (e) { add('build', 'Construction du trac\u00e9', false, e.message, { kind: 'route', severity: 'critical', message: 'Trac\u00e9 impossible \u00e0 construire : ' + e.message, detail: { stack: String(e.stack || '') } }); return { checks, problems, durationMs: performance.now() - t0 }; }
  const buildMs = performance.now() - tb, finite = [...W.E].every(Number.isFinite) && [...W.X].every(Number.isFinite) && [...W.Z].every(Number.isFinite);
  add('finite', 'Coordonn\u00e9es et altitudes du trac\u00e9 valides', finite, finite ? W.n + ' points' : 'valeurs non num\u00e9riques', { kind: 'route', severity: 'critical', message: 'Trac\u00e9 invalide : coordonn\u00e9es ou altitudes non num\u00e9riques', detail: {} });
  const dl = Math.abs(W.length / 1000 - rt.km) / rt.km;
  add('length', 'Longueur du trac\u00e9 conforme', dl <= 0.1, `${(W.length / 1000).toFixed(1)} km pour ${rt.km} km annonc\u00e9s`, { kind: 'route', severity: 'warning', message: `Longueur du trac\u00e9 (${(W.length / 1000).toFixed(1)} km) diff\u00e9rente de la longueur annonc\u00e9e (${rt.km} km)`, detail: { lengthM: Math.round(W.length) } });
  onStep('Routes secondaires\u2026', 30); await tick();
  let B = [], tbr = performance.now();
  try { B = VVWorld.branchesOf(W); BCACHE[rt.id] = B; } catch (e) { add('branches', 'Construction des routes secondaires', false, e.message, { kind: 'route', severity: 'error', message: 'Routes secondaires impossibles \u00e0 construire : ' + e.message, detail: { stack: String(e.stack || '') } }); }
  const brMs = performance.now() - tbr;
  const branches = branchRows(W, B);
  for (const b of branches) {
    if (b.gapA >= 0.5 || b.gapB >= 0.5) problems.push({ kind: 'route', severity: 'error', message: `Raccord d\u00e9cal\u00e9 sur ${b.name} (${b.gapA} m au d\u00e9part, ${b.gapB} m au retour)`, detail: { branch: b.name, gapA: b.gapA, gapB: b.gapB } });
    if (b.maxGrade > 13.5) problems.push({ kind: 'route', severity: 'warning', message: `Pente trop forte sur ${b.name} (${b.maxGrade} %)`, detail: { branch: b.name, maxGrade: b.maxGrade } });
    if (!b.okS) problems.push({ kind: 'route', severity: 'error', message: `Embranchement invalide sur ${b.name} (d\u00e9part ${b.sA} m, retour ${b.sB} m)`, detail: { branch: b.name } });
    delete b.okS;
  }
  add('branches', 'Routes secondaires reli\u00e9es \u00e0 la route principale', branches.every(b => b.ok), `${branches.length} route${branches.length > 1 ? 's' : ''} (${secs(brMs)})`);
  const extraM = Math.ceil(B.reduce((a, b) => a + Math.max(0, b.len - (b.sB - b.sA)), 0)), extraD = Math.ceil(B.reduce((a, b) => a + b.dplus, 0));
  const okX = extraM <= (rt.extraM ?? Infinity) && extraD <= (rt.extraDplus ?? Infinity);
  add('extras', 'Contr\u00f4le serveur des sorties \u00e0 jour', okX, `d\u00e9tours : +${extraM} m / +${extraD} m D+ (serveur : +${rt.extraM} m / +${rt.extraDplus} m)`, { kind: 'route', severity: 'error', message: 'Les limites du serveur (distance et d\u00e9nivel\u00e9 des routes secondaires) sont d\u00e9pass\u00e9es : des sorties valides pourraient \u00eatre refus\u00e9es. Mettre \u00e0 jour server/rides.mjs (scripts/branches-info.mjs).', detail: { extraM, extraDplus: extraD, serverExtraM: rt.extraM, serverExtraDplus: rt.extraDplus } });
  // d\u00e9cor complet : chaque tron\u00e7on et l'horizon sont construits comme dans le jeu (sans affichage), puis contr\u00f4l\u00e9s
  onStep('D\u00e9cor de tout le parcours\u2026', 40); await tick();
  let bad = 0, verts = 0, chunks = 0, err = null; const sounds = {}; let birds = 0;
  const fakeR = { mesh(g) { const d = g.d; verts += d.length / 10; for (let i = 0; i < d.length; i++) if (!Number.isFinite(d[i])) { bad++; break; } return {}; }, free() {}, env() {}, draw() {} };
  try {
    const sc = new VVWorld.Scenery(fakeR, r), seen = new Set();
    for (let s = 0; s < W.length; s += 200) {
      for (let k = 0; k < 6; k++) if (!sc.update(s, 0, 0)) break;
      for (const [c, ch] of sc.chunks) if (!seen.has(c)) { seen.add(c); chunks++; birds += ch.birds.length; for (const x of ch.sounds) sounds[x.type] = (sounds[x.type] || 0) + 1; }
      if ((s / 200) % 10 === 0) { onStep(`D\u00e9cor : km ${(s / 1000).toFixed(0)} / ${(W.length / 1000).toFixed(0)}\u2026`, 40 + 55 * s / W.length); await tick(); }
    }
  } catch (e) { err = e; }
  add('scenery', 'Construction du d\u00e9cor (terrain, objets, horizon)', !err, err ? err.message : `${chunks} tron\u00e7ons, ${Math.round(verts / 1000)} k sommets`, { kind: 'terrain', severity: 'critical', message: 'D\u00e9cor impossible \u00e0 construire : ' + (err && err.message), detail: { stack: String(err && err.stack || '') } });
  add('geometry', 'G\u00e9om\u00e9trie du terrain sans valeur invalide', bad === 0, bad ? bad + ' maillage(s) avec des valeurs non num\u00e9riques' : 'aucune valeur invalide', { kind: 'terrain', severity: 'critical', message: `${bad} maillage(s) du terrain contiennent des coordonn\u00e9es non num\u00e9riques (trous ou objets invisibles)`, detail: { meshes: bad } });
  // rendu 3D et audio de CE navigateur (information : d\u00e9pend de l'appareil)
  let gl = null; try { const c = document.createElement('canvas'); gl = c.getContext('webgl2') ? 'WebGL 2' : c.getContext('webgl') ? 'WebGL 1' : null; } catch { gl = null; }
  add('webgl', 'Rendu 3D disponible dans ce navigateur', !!gl, gl || 'indisponible', { kind: 'webgl', severity: 'warning', message: 'WebGL indisponible dans le navigateur qui a lanc\u00e9 le diagnostic', detail: {} });
  let audio = 'indisponible'; try { const AC = window.AudioContext || window.webkitAudioContext; if (AC) { const a = new AC(); audio = 'disponible (' + a.sampleRate + ' Hz)'; a.close(); } } catch (e) { audio = 'erreur : ' + e.message; }
  let amb = true; try { VVAmbience.create(r.theme, { bed: false }); } catch { amb = false; }
  add('audio', 'Ambiance sonore du d\u00e9cor', amb && audio.startsWith('disponible'), `audio ${audio} ; ambiance \u00ab ${r.theme} \u00bb ${amb ? 'pr\u00eate' : 'en erreur'}`, amb ? null : { kind: 'audio', severity: 'warning', message: 'Ambiance sonore impossible \u00e0 cr\u00e9er pour ce d\u00e9cor', detail: { theme: r.theme } });
  onStep('Termin\u00e9', 100);
  const env = { theme: r.theme, label: VVWorld.THEMES[r.theme].label, chunks, vertices: Math.round(verts), birds, sounds: Object.entries(sounds).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', '), fog: VVWorld.THEMES[r.theme].far };
  return { checks, problems, branches, buildMs: Math.round(buildMs + brMs), lengthM: W.length, env, main: { lengthM: Math.round(W.length), dplus: W.dplus, minE: Math.round(W.minE), maxE: Math.round(W.maxE), points: W.n }, durationMs: performance.now() - t0, W, B };
}
const SOUND_FR = { songbird: 'oiseaux', bees: 'abeilles', water: 'ressac', lake: 'clapotis du lac', harbor: 'clapotis du port', cascade: 'cascades', oasis: 'oasis', hawk: 'rapaces', camel: 'chameaux', bell: 'cloches de troupeaux', churchbell: 'cloches d\u2019\u00e9glise', cow: 'vaches', rooster: 'coqs', marmot: 'marmottes', woodpecker: 'pics', crickets: 'grillons', sheep: 'moutons', horn: 'corne de brume', gulls: 'mouettes', stream: 'ruisseau' };
const soundsFr = s => (s || '').split(', ').filter(Boolean).map(x => { const [k, n] = x.split(' '); return `${SOUND_FR[k] || k} (${n})`; }).join(', ');
function diagView(dg) {
  if (!dg) return html`<div class="empty">Aucun diagnostic enregistr\u00e9 pour ce parcours. Lance le premier.</div>`;
  return html`${dg.at ? html`<p class="def" style="margin-top:0">Diagnostic du ${dt(dg.at)} par ${dg.by || '\u2014'} \u00b7 calcul du trac\u00e9 et des routes : ${secs(dg.buildMs)}.</p>` : ''}
    <ul class="checks">${(dg.checks || []).map(c => html`<li class="${c.ok ? 'ok' : 'ko'}"><span aria-hidden="true">${c.ok ? '\u2713' : '\u2717'}</span><b>${c.label}</b><span class="muted">${c.detail}</span></li>`)}</ul>
    ${dg.problems && dg.problems.length ? html`<h3 style="margin:14px 0 6px">Probl\u00e8mes d\u00e9tect\u00e9s</h3><ul class="checks">${dg.problems.map(p => html`<li class="ko">${pill(SEV[p.severity])}<b>${p.message}</b></li>`)}</ul>` : html`<p class="alert ok" style="margin-top:12px">Aucun probl\u00e8me d\u00e9tect\u00e9 par ce diagnostic.</p>`}
    ${dg.env ? html`<h3 style="margin:14px 0 6px">Environnement et \u00e9l\u00e9ments associ\u00e9s</h3><dl class="kv"><dt>D\u00e9cor</dt><dd>${dg.env.label || dg.env.theme}</dd><dt>Tron\u00e7ons de d\u00e9cor</dt><dd>${nf(dg.env.chunks)} (${nf(Math.round((dg.env.vertices || 0) / 1000))} k sommets)</dd><dt>Brume</dt><dd>${nf(dg.env.fog)} m</dd><dt>Sources sonores plac\u00e9es</dt><dd>${soundsFr(dg.env.sounds) || '\u2014'}</dd><dt>Oiseaux anim\u00e9s</dt><dd>${nf(dg.env.birds)}</dd></dl>` : ''}`;
}
const branchTable = br => br && br.length ? html`<div class="tbl-wrap"><table class="nowrap"><thead><tr><th>#</th><th>Route secondaire</th><th>Type</th><th>C\u00f4t\u00e9</th><th>Embranchement</th><th>Retour</th><th>Longueur</th><th>D+</th><th>Pente max</th><th>\u00c9cart aux raccords</th><th></th></tr></thead><tbody>
  ${br.map(b => html`<tr><td class="num">${b.n}</td><td><b>${b.name}</b></td><td>${b.kind}</td><td>${b.side}</td><td class="num">km ${(b.sA / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })}</td><td class="num">km ${(b.sB / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })}</td>
    <td class="num">${(b.len / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} km</td><td class="num">${b.dplus} m</td><td class="num">${String(b.maxGrade).replace('.', ',')} %</td><td class="num">${String(b.gapA).replace('.', ',')} m / ${String(b.gapB).replace('.', ',')} m</td><td>${b.ok ? html`<span class="pill ok">OK</span>` : html`<span class="pill bad">\u00c0 v\u00e9rifier</span>`}</td></tr>`)}</tbody></table></div>` : html`<div class="empty">Routes secondaires : lance le diagnostic pour les calculer avec le moteur du jeu.</div>`;
function incidentTable(items, canManage, showRoute = true) {
  return items.length ? html`<div class="tbl-wrap"><table><thead><tr><th>Derni\u00e8re fois</th>${showRoute ? html`<th>Parcours</th>` : ''}<th>Type</th><th>Gravit\u00e9</th><th>Probl\u00e8me</th><th>Fois</th><th>Origine</th><th>Statut</th><th></th></tr></thead><tbody>
    ${items.map(i => html`<tr><td class="num">${dt(i.lastAt)}</td>${showRoute ? html`<td><a href="#carte/${i.route}">${i.routeName}</a></td>` : ''}<td>${i.kindLabel}</td><td>${pill(SEV[i.severity])}</td>
      <td><details><summary>${i.message}</summary><dl class="kv" style="margin-top:6px"><dt>Premi\u00e8re fois</dt><dd>${dt(i.firstAt)}</dd>${Object.entries(i.detail || {}).map(([k, v]) => html`<dt>${k}</dt><dd><code>${String(v)}</code></dd>`)}${i.userAgent ? html`<dt>Navigateur</dt><dd><code>${i.userAgent}</code></dd>` : ''}${i.note ? html`<dt>Note</dt><dd>${i.note}</dd>` : ''}${i.statusBy ? html`<dt>Statut chang\u00e9 par</dt><dd>${i.statusBy} \u00b7 ${dt(i.statusAt)}</dd>` : ''}</dl></details></td>
      <td class="num">${nf(i.occurrences)}</td><td>${SRC[i.source]}</td><td>${pill(ISTATUS[i.status])}</td>
      <td class="acts">${canManage ? (i.status === 'new' ? html`<button class="btn sm" data-a="inc" data-id="${i.id}" data-s="in_progress">Prendre en charge</button><button class="btn sm" data-a="inc" data-id="${i.id}" data-s="fixed">Corrig\u00e9</button>`
        : i.status === 'in_progress' ? html`<button class="btn sm" data-a="inc" data-id="${i.id}" data-s="fixed">Corrig\u00e9</button>` : html`<button class="btn sm" data-a="inc" data-id="${i.id}" data-s="new">Rouvrir</button>`) : ''}</td></tr>`)}</tbody></table></div>` : html`<div class="empty">Aucun incident dans cette liste.</div>`;
}

Object.assign(pages, {
  async parcours(qs) {
    const tab = qs.get('onglet') || 'tableau';
    const tabs = html`<div class="tabs">${tabP(tab, 'tableau', 'Tableau des parcours')}${tabP(tab, 'incidents', 'Historique des probl\u00e8mes')}</div>`;
    if (tab === 'incidents') {
      const r = await api('GET', '/admin/routes/incidents?' + new URLSearchParams([...qs].filter(([k]) => k !== 'onglet')).toString());
      const sel = (name, opts, label) => html`<select class="input" name="${name}" aria-label="${label}">${opts.map(([v, l]) => html`<option value="${v}" ${raw((qs.get(name) || '') === v ? 'selected' : '')}>${l}</option>`)}</select>`;
      return html`${tabs}<p class="def">${r.since ? html`Journalisation active depuis le ${dt(r.since)} : les probl\u00e8mes ant\u00e9rieurs n\u2019ont pas \u00e9t\u00e9 enregistr\u00e9s (aucun historique n\u2019existait).` : 'La journalisation est active, mais aucun probl\u00e8me ni chargement n\u2019a encore \u00e9t\u00e9 enregistr\u00e9 : l\u2019historique commencera au premier incident constat\u00e9.'}
          Les incidents viennent des navigateurs des joueurs (erreurs constat\u00e9es pendant le chargement ou la sortie) et des diagnostics lanc\u00e9s ici.</p>
        <section class="card"><form class="filters" id="incf"><input type="hidden" name="onglet" value="incidents">
          ${sel('route', [['', 'Tous les parcours'], ...Object.entries(r.routes)], 'Parcours')}
          ${sel('severity', [['', 'Toutes gravit\u00e9s'], ...Object.entries(SEV).map(([k, v]) => [k, v[0]])], 'Gravit\u00e9')}
          ${sel('status', [['', 'Ouverts (nouveaux et en cours)'], ['new', 'Nouveaux'], ['in_progress', 'En cours de r\u00e9solution'], ['fixed', 'Corrig\u00e9s'], ['all', 'Tous les statuts']], 'Statut')}
          ${sel('kind', [['', 'Tous les types'], ...Object.entries(r.kinds)], 'Type')}
          ${sel('source', [['', 'Toutes origines'], ['player', SRC.player], ['diagnostic', SRC.diagnostic]], 'Origine')}
          <button class="btn primary" type="submit">Filtrer</button></form></section>
        <section class="card">${incidentTable(r.items, r.canManage)}${pager(r, '#parcours?' + new URLSearchParams([...qs].filter(([k]) => k !== 'page')).toString())}</section>`;
    }
    const d = await api('GET', '/admin/routes');
    pages._routes = d.items;
    return html`${tabs}<p class="def">CycleRush compte <b>${d.items.length} parcours</b>. Leur trac\u00e9, leur relief et leurs routes secondaires sont g\u00e9n\u00e9r\u00e9s par le moteur 3D du jeu : le nombre de routes secondaires vient du dernier diagnostic (calcul\u00e9 avec ce moteur). \u00ab Dernier chargement \u00bb : signal\u00e9 par le navigateur d\u2019un joueur (au plus une fois par jour et par appareil). ${d.since ? html`Suivi actif depuis le ${dt(d.since)}.` : 'Aucun chargement ni incident enregistr\u00e9 pour l\u2019instant.'}</p>
      ${d.items.length ? '' : html`<section class="card"><p class="muted" style="margin:0">Aucun parcours n\u2019est d\u00e9clar\u00e9 sur le serveur.</p></section>`}
      <div class="rgrid">${d.items.map(r => r.itemError ? html`<section class="card rcard"><div class="card-h"><h2>${r.name}</h2>${pill(RSTATE.error)}</div><div class="alert bad" role="alert">${r.itemError}</div><p class="muted">Les autres parcours restent consultables. Recharge la page apr\u00e8s correction.</p><div class="acts" style="margin-top:12px"><a class="btn sm primary" href="#carte/${r.id}">D\u00e9tails et routes</a></div></section>` : html`<section class="card rcard"><div class="rimg">${r.img ? html`<img src="${r.img}" alt="Paysage du parcours ${r.name}" loading="lazy">` : html`<div class="rplan" data-plan="${r.id}"><span class="muted">Plan du trac\u00e9\u2026</span></div>`}</div>
        <div class="card-h" style="margin-top:12px"><h2>${r.name}</h2>${pill(RSTATE[r.state])}</div>
        <dl class="kv"><dt>Environnement</dt><dd>${r.env}</dd><dt>Distance</dt><dd>${r.km} km \u00b7 ${nf(r.dplus)} m D+</dd>
          <dt>Chargement</dt><dd>${r.load.lastOkAt ? html`Dernier r\u00e9ussi le ${dt(r.load.lastOkAt)} (${secs(r.load.lastMs)}) \u00b7 ${nf(r.load.count)} au total` : html`<span class="muted">aucun chargement enregistr\u00e9</span>`}</dd>
          <dt>Routes secondaires</dt><dd>${r.diag && r.diag.branches != null ? html`${r.diag.branches} <span class="muted">(diagnostic du ${dt(r.diag.at)})</span>` : html`<span class="muted">\u2014 lancer le diagnostic</span>`}</dd>
          <dt>Dernier probl\u00e8me</dt><dd>${r.lastIncident ? html`${pill(SEV[r.lastIncident.severity])} ${r.lastIncident.message} <span class="muted">\u00b7 ${dt(r.lastIncident.lastAt)} \u00b7 ${ISTATUS[r.lastIncident.status][0].toLowerCase()}</span>` : html`<span class="muted">aucun probl\u00e8me constat\u00e9</span>`}</dd>
          <dt>Incidents ouverts</dt><dd>${nf(r.incidents.open)}${r.incidents.openSerious ? html` dont ${r.incidents.openSerious} grave${r.incidents.openSerious > 1 ? 's' : ''}` : ''}</dd>
          <dt>Sorties</dt><dd>${nf(r.rides.d30)} sur 30 jours \u00b7 ${nf(r.rides.total)} au total</dd>
          ${!r.enabled ? html`<dt>Motif</dt><dd>${r.reason || '\u2014'} \u00b7 ${dt(r.updatedAt)}</dd>` : ''}</dl>
        <div class="acts" style="margin-top:12px"><a class="btn sm primary" href="#carte/${r.id}">D\u00e9tails et routes</a><a class="btn sm" href="#carte/${r.id}?diag=1">Lancer le diagnostic</a>
          ${d.canManage ? (r.enabled ? html`<button class="btn sm warn" data-a="r-off" data-id="${r.id}">D\u00e9sactiver</button>` : html`<button class="btn sm" data-a="r-on" data-id="${r.id}">R\u00e9activer</button>`) : ''}</div></section>`)}</div>`;
  },

  async carte(qs, id) {
    const d = await api('GET', '/admin/routes/' + encodeURIComponent(id));
    const r = d.route; pages._route = d;
    pages._routes = [{ id: r.id, name: r.name, enabled: r.enabled }];
    const state = !r.enabled ? 'disabled' : d.incidents.some(i => i.status !== 'fixed' && (i.severity === 'error' || i.severity === 'critical')) ? 'error' : 'active';
    return html`<p><a href="#parcours">\u2190 Tous les parcours</a></p>
      <div class="grid2"><section class="card"><div class="card-h"><h2>${r.name}</h2><span class="acts">${pill(RSTATE[state])}${d.canManage ? (r.enabled ? html`<button class="btn sm warn" data-a="r-off" data-id="${r.id}">D\u00e9sactiver</button>` : html`<button class="btn sm" data-a="r-on" data-id="${r.id}">R\u00e9activer</button>`) : ''}</span></div>
          ${r.img ? html`<img class="rhero" src="${r.img}" alt="Paysage du parcours ${r.name}">` : ''}
          <dl class="kv"><dt>Identifiant</dt><dd><code>${r.id}</code></dd><dt>Environnement</dt><dd>${r.env}</dd><dt>Route principale</dt><dd>${r.km} km \u00b7 ${nf(r.dplus)} m D+</dd>
            <dt>D\u00e9tours possibles</dt><dd>+${nf(r.extraM)} m et +${nf(r.extraDplus)} m D+ au plus (limites du contr\u00f4le des sorties)</dd>
            <dt>\u00c9tat</dt><dd>${r.enabled ? 'Actif : visible et jouable' : html`D\u00e9sactiv\u00e9 le ${dt(r.updatedAt)} \u2014 ${r.reason || '\u2014'}`}</dd>
            <dt>Chargement</dt><dd>${r.load.lastOkAt ? html`Dernier r\u00e9ussi chez un joueur le ${dt(r.load.lastOkAt)} en ${secs(r.load.lastMs)} \u00b7 ${nf(r.load.count)} chargement${r.load.count > 1 ? 's' : ''} enregistr\u00e9${r.load.count > 1 ? 's' : ''}` : 'Aucun chargement enregistr\u00e9 pour l\u2019instant.'}</dd></dl>
          <p style="margin:12px 0 0"><a href="ride.html#${r.id}" target="_blank" rel="noopener">Ouvrir le parcours dans le jeu \u2197</a></p></section>
        <section class="card"><div class="card-h"><h2>Plan du parcours</h2><span class="muted" style="font-size:13px">distance en km ; route principale en blanc, routes secondaires en cyan (num\u00e9rot\u00e9es, \u00e9cart lat\u00e9ral agrandi : c\u00f4t\u00e9 gauche en haut, droit en bas)</span></div><div id="plan" class="rplan big"><span class="muted">Calcul du plan avec le moteur 3D\u2026</span></div></section></div>
      <section class="card"><div class="card-h"><h2>Diagnostic</h2><button class="btn primary" data-a="diag">Lancer le diagnostic</button></div>
        <p class="def" style="margin-top:0">Le diagnostic charge les fichiers du jeu et construit ce parcours avec le vrai moteur 3D, dans ce navigateur : trac\u00e9, routes secondaires et raccords, d\u00e9cor de tout le parcours (contr\u00f4le des valeurs invalides), rendu 3D et audio. Les probl\u00e8mes trouv\u00e9s sont enregistr\u00e9s dans l\u2019historique ; ceux d\u2019un diagnostic pr\u00e9c\u00e9dent qui ne sont plus constat\u00e9s passent \u00e0 \u00ab corrig\u00e9 \u00bb. Compte de 10 secondes \u00e0 une minute selon la longueur.</p>
        <div id="diagRun" hidden><div class="bar"><i id="diagBar" style="width:0"></i></div><p class="muted" id="diagStep" style="margin:6px 0 0"></p></div>
        <div id="diagOut">${diagView(d.diag)}</div></section>
      <section class="card"><h2>Routes secondaires, embranchements et raccords</h2><div id="brOut">${branchTable(d.diag && d.diag.branches)}</div></section>
      <section class="card"><h2>Probl\u00e8mes de ce parcours</h2>${incidentTable(d.incidents, d.canManage, false)}</section>
      <section class="card"><h2>Historique des changements d\u2019\u00e9tat</h2>${auditRows(d.history)}</section>`;
  },
});

function bindRoutes(main, name, qs) {
  const f = $('#incf', main); if (f) f.onsubmit = e => { e.preventDefault(); location.hash = '#parcours?' + new URLSearchParams([...new FormData(f)].filter(([, v]) => v)).toString(); };
  // plans des parcours sans photo (tableau) ou plan d\u00e9taill\u00e9 (fiche)
  const plans = $$('[data-plan]', main);
  if (plans.length) loadEngine().then(() => plans.forEach(el => { const r = VVWorld.byId(el.dataset.plan); if (r && el.isConnected) el.innerHTML = out(planSvg(VVWorld.build(r))); })).catch(e => plans.forEach(el => (el.textContent = e.message)));
  const plan = $('#plan', main);
  const runDiag = async () => {
    const d = pages._route, btn = $('[data-a="diag"]', main); if (!btn || btn.disabled) return; btn.disabled = true; $('#diagRun', main).hidden = false; // jamais deux diagnostics en m\u00eame temps
    try {
      const res = await runDiagnostic(d.route, (txt, pct) => { $('#diagStep', main).textContent = txt; $('#diagBar', main).style.width = pct + '%'; });
      if (plan && res.W) plan.innerHTML = out(planSvg(res.W, res.B));
      const payload = { problems: res.problems, checks: res.checks, branches: res.branches || [], buildMs: res.buildMs, lengthM: res.lengthM, env: res.env, main: res.main };
      $('#diagOut', main).innerHTML = out(diagView({ ...payload, at: new Date().toISOString(), by: me.username }));
      $('#brOut', main).innerHTML = out(branchTable(res.branches));
      await api('POST', `/admin/routes/${d.route.id}/diagnostic`, payload);
      toast(res.problems.length ? `Diagnostic termin\u00e9 : ${res.problems.length} probl\u00e8me${res.problems.length > 1 ? 's' : ''} enregistr\u00e9${res.problems.length > 1 ? 's' : ''}.` : 'Diagnostic termin\u00e9 : aucun probl\u00e8me.', res.problems.length ? 'bad' : 'ok');
      setTimeout(() => show({ quiet: true }), 400);
    } catch (e) { toast('Diagnostic interrompu : ' + e.message, 'bad'); }
    finally { btn.disabled = false; const run = $('#diagRun', main); if (run) run.hidden = true; }
  };
  if (plan) loadEngine().then(async () => {
    const d = pages._route, r = VVWorld.byId(d.route.id); if (!r) { plan.textContent = 'Parcours inconnu du moteur 3D.'; return; }
    const W = VVWorld.build(r); plan.innerHTML = out(planSvg(W));
    if (qs.get('diag') === '1') { history.replaceState(null, '', location.pathname + location.search + '#carte/' + encodeURIComponent(d.route.id)); runDiag(); } // lanc\u00e9 une seule fois : la page r\u00e9affich\u00e9e ne le relance pas
    else { await new Promise(res => setTimeout(res, 50)); if (!plan.isConnected) return; const B = BCACHE[r.id] || (BCACHE[r.id] = VVWorld.branchesOf(W)); if (plan.isConnected) plan.innerHTML = out(planSvg(W, B));
      const bo = $('#brOut', main); if (bo && !(d.diag && d.diag.branches && d.diag.branches.length)) bo.innerHTML = out(html`<p class="def" style="margin-top:0">Calcul\u00e9 \u00e0 l\u2019instant avec le moteur du jeu (pas encore enregistr\u00e9 : lance le diagnostic pour l\u2019enregistrer et contr\u00f4ler tout le d\u00e9cor).</p>${branchTable(branchRows(W, B).map(({ okS, ...x }) => x))}`); }
  }).catch(e => { plan.textContent = e.message; });
  main.addEventListener('click', e => {
    const b = e.target.closest('[data-a]'); if (!b) return;
    const a = b.dataset.a;
    if (a === 'diag') runDiag();
    if (a === 'r-off' || a === 'r-on') {
      const rt = (pages._routes || []).find(x => x.id === b.dataset.id), off = a === 'r-off';
      confirmForm({ title: `${off ? 'D\u00e9sactiver' : 'R\u00e9activer'} ${rt.name}`,
        text: off ? 'Le parcours dispara\u00eet des choix de lancement : les joueurs ne peuvent plus d\u00e9marrer de sortie ni de session multijoueur dessus, m\u00eame en ouvrant son adresse directement (le serveur refuse). Les sorties, activit\u00e9s et historiques existants sont conserv\u00e9s. Action journalis\u00e9e.' : 'Le parcours redevient visible et jouable par tous. Action journalis\u00e9e.',
        confirm: off ? 'D\u00e9sactiver le parcours' : 'R\u00e9activer le parcours', danger: off,
        fields: html`${off ? html`<div class="field"><label for="cn">Pour confirmer, saisis le nom du parcours \u00ab ${rt.name} \u00bb</label><input class="input" id="cn" name="confirm" autocomplete="off" required></div>` : ''}<div class="field"><label for="rs">Motif (${off ? 'affich\u00e9 aux joueurs' : 'journal de l\u2019\u00e9quipe'})</label><textarea class="input" id="rs" name="reason" rows="2" minlength="3" maxlength="300" required></textarea></div>`,
        fn: async v => { await api('POST', `/admin/routes/${rt.id}/${off ? 'disable' : 'enable'}`, { confirm: v.confirm, reason: v.reason }); toast(off ? `${rt.name} est d\u00e9sactiv\u00e9.` : `${rt.name} est de nouveau actif.`); show(); } });
    }
    if (a === 'inc') {
      const st = b.dataset.s, lab = { in_progress: 'Prendre en charge', fixed: 'Marquer comme corrig\u00e9', new: 'Rouvrir' }[st];
      confirmForm({ title: `${lab} \u2014 incident #${b.dataset.id}`, confirm: lab, fields: html`<div class="field"><label for="nt">Note (facultative)</label><input class="input" id="nt" name="note" maxlength="500"></div>`,
        fn: async v => { await api('POST', `/admin/routes/incidents/${b.dataset.id}/status`, { status: st, note: v.note || undefined }); toast('Statut de l\u2019incident mis \u00e0 jour.'); show({ quiet: true }); } });
    }
  });
}

/* ---------- Coque et navigation ---------- */
const TITLES = { recompenses: '\u00c9quipements & R\u00e9compenses', parcours: 'Gestion des parcours', carte: 'Parcours', tableau: 'Tableau de bord', utilisateurs: 'Utilisateurs', utilisateur: 'Utilisateur', signalements: 'Signalements', signalement: 'Signalement', contenus: 'Contenus', equipements: 'Gestion des \u00e9quipements', multijoueur: 'Sessions multijoueur', reglages: 'R\u00e9glages', journal: 'Journal des actions' };

function shell(pending) {
  const nav = [['tableau', 'Tableau de bord', 'admin.access'], ['utilisateurs', 'Utilisateurs', 'users.basic'], ['signalements', 'Signalements', 'reports.view'], ['contenus', 'Contenus', 'content.manage'], ['recompenses', '\u00c9quipements & R\u00e9compenses', 'economy.manage'], ['parcours', 'Gestion des parcours', 'routes.view'], ['multijoueur', 'Multijoueur', 'mp.view'], ['reglages', 'R\u00e9glages', 'settings.general'], ['journal', 'Journal', 'audit.moderation']].filter(n => can(n[2]));
  $('#admin').innerHTML = out(html`<div class="shell">
    <aside class="side" id="side"><a class="logo" href="#tableau"><span>Cycle<span>Rush</span><small>Administration</small></span></a>
      <nav aria-label="Sections">${nav.map(([k, l]) => html`<a href="#${k}" data-sec="${k}">${l}${k === 'signalements' && pending ? html`<span class="count">${pending}</span>` : ''}</a>`)}</nav>
      <a class="back" href="./">\u2190 Retour au site</a></aside>
    <div><header class="top"><div style="display:flex;align-items:center;gap:10px"><button class="burger" id="burger" aria-label="Menu" aria-controls="side">\u2630</button><h1 id="title"></h1></div>
      <div class="who"><span>Connect\u00e9 :</span><b>${me.username}</b><span class="pill cyan">${ROLE[me.role]}</span></div></header>
      <main class="content" id="main"></main></div></div><div class="toasts" id="toasts" aria-live="polite"></div>`);
  $('#burger').onclick = () => $('#side').classList.toggle('open');
}

// Actualisation : bouton \u00ab Actualiser \u00bb + rechargement automatique toutes les 30 s
// du tableau de bord et de la liste des utilisateurs (si l'onglet est visible et qu'aucune fen\u00eatre n'est ouverte).
let refreshTimer = null;
function scheduleRefresh(name) {
  clearInterval(refreshTimer);
  if (name !== 'tableau' && name !== 'utilisateurs' && name !== 'multijoueur') return;
  const hash = location.hash;
  refreshTimer = setInterval(() => { if (location.hash === hash && document.visibilityState === 'visible' && !document.querySelector('.modal-bg') && !document.querySelector('details[open]')) show({ quiet: true }); }, name === 'multijoueur' ? 5000 : 30000);
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && me) { const n = (location.hash.slice(1).split('?')[0] || 'tableau').split('/')[0]; if (n === 'tableau' || n === 'utilisateurs') show({ quiet: true }); } });
async function show(opts = {}) {
  const [sec, q = ''] = location.hash.slice(1).split('?');
  const [name, id] = (sec || 'tableau').split('/');
  const fn = pages[name];
  $('#side').classList.remove('open');
  $$('[data-sec]').forEach(a => { if (a.dataset.sec === name || (name === 'utilisateur' && a.dataset.sec === 'utilisateurs') || (name === 'signalement' && a.dataset.sec === 'signalements') || (name === 'carte' && a.dataset.sec === 'parcours') || (name === 'equipements' && a.dataset.sec === 'recompenses')) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  $('#title').textContent = TITLES[name] || 'Administration';
  document.title = (TITLES[name] || 'Administration') + ' \u2014 Administration CycleRush';
  const main = $('#main');
  if (!opts.quiet) main.innerHTML = '<div class="loading">Chargement\u2026</div>';
  const keepScroll = opts.quiet ? window.scrollY : 0;
  let pre = null;
  if (opts.quiet && fn) { try { pre = out(await fn(new URLSearchParams(q), id)); } catch { return; } } // en cas d'\u00e9chec, on garde l'affichage actuel
  const fresh = main.cloneNode(false); main.replaceWith(fresh);
  try {
    if (!fn) throw new Error('Section introuvable.');
    fresh.innerHTML = pre ?? out(await fn(new URLSearchParams(q), id));
    fresh.addEventListener('click', e => { const tr = e.target.closest('tr[data-href]'); if (tr && !e.target.closest('a,button')) location.hash = tr.dataset.href; });
    const filter = (formId, sec) => { const f = $('#' + formId, fresh); if (f) f.onsubmit = e => { e.preventDefault(); location.hash = '#' + sec + '?' + new URLSearchParams([...new FormData(f)].filter(([, v]) => v)).toString(); }; };
    filter('uf', 'utilisateurs'); filter('jf', 'journal'); filter('af', 'contenus'); filter('eqf', 'equipements');
    if (name === 'equipements') bindEquipment(fresh);
    if (name === 'recompenses') bindEconomy(fresh, new URLSearchParams(q));
    if (name === 'parcours' || name === 'carte') bindRoutes(fresh, name, new URLSearchParams(q));
    if (name === 'multijoueur') bindMultiplayer(fresh);
    if (name === 'utilisateur') bindUser(fresh, id);
    if (name === 'signalement') bindReport(fresh, id);
    if (name === 'contenus') bindContent(fresh);
    const sf = $('#sf', fresh);
    if (sf) sf.onsubmit = async e => {
      e.preventDefault();
      const f = new FormData(sf), body = { registration_open: f.has('registration_open'), maintenance_message: f.get('maintenance_message') || '', contact_email: f.get('contact_email') || '' };
      if (!$('[name=session_days]', sf).disabled) { body.session_days = Number(f.get('session_days')); body.require_verified_email_for_login = f.has('require_verified_email_for_login'); }
      try { await api('PATCH', '/admin/settings', body); toast('R\u00e9glages enregistr\u00e9s.'); } catch (err) { toast(err.message, 'bad'); }
    };
  } catch (e) { fresh.innerHTML = out(html`<div class="alert bad" role="alert"><b>${e.status === 403 ? 'Acc\u00e8s refus\u00e9' : e.status === 0 ? 'Serveur injoignable' : 'Impossible de charger cette page'}</b><br>${e.message}</div>${e.status === 403 ? '' : html`<p><button class="btn sm" data-refresh>R\u00e9essayer</button></p>`}`); }
  if (opts.quiet) window.scrollTo(0, keepScroll); else fresh.focus?.();
  fresh.addEventListener('click', e => { if (e.target.closest('[data-refresh]')) show({ quiet: true }); });
  scheduleRefresh(name);
}

(async () => {
  try {
    const d = await api('GET', '/auth/me');
    if (!d.user) { location.href = './'; return; }
    me = d.user; perms = me.permissions;
    if (!perms.includes('admin.access')) { document.body.className = 'blocked'; document.body.innerHTML = '<main class="blocked-box"><p class="logo">Cycle<span>Rush</span></p><h1>Acc\u00e8s refus\u00e9</h1><p>Cet espace est r\u00e9serv\u00e9 \u00e0 l\u2019\u00e9quipe de mod\u00e9ration et d\u2019administration.</p><a class="btn" href="./">Retour au site</a></main>'; return; }
    const o = await api('GET', '/admin/overview');
    shell(o.pendingReports);
    addEventListener('hashchange', show);
    show();
  } catch (e) { document.body.textContent = e.message; }
})();
