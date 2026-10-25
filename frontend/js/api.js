/* ============================================================
   SAARTHI · api.js — the browser's database driver (MongoDB via the Saarthi API)
   • DB.get / DB.set keep the same interface the whole app already uses, so pages need no rewrite.
   • On page load the visible data is fetched once; DB.set sends ONLY the records that changed.
   • A light poll (every 6 s) pulls other users' changes, so every device sees the same data.
   • Nothing is stored in localStorage any more (only the theme / language choice).
   ============================================================ */
const API = (() => {
  const BASE = window.SAARTHI_API || (location.protocol === 'file:' || ['5500', '5501', '5502', '8080'].includes(location.port) ? 'http://localhost:3000/api' : '/api');
  const token = () => sessionStorage.getItem('saarthi_token');
  const VALUE_KEYS = new Set(['schema', 'maintenance', 'notify']);
  const RID = { complaints: r => r.appNo, authorities: r => r.username, mcs: r => `${r.ulb || 'rajpura'}:${r.ward}`, mlas: r => r.ac, mps: r => r.ls, ministries: r => r.key, acOverrides: r => r.no, ulbMap: r => r.ulb };
  const ridOf = (key, r) => (RID[key] || (x => x.id))(r);
  let store = {}, rev = 0, stats = { complaints: 0 }, online = true;

  function call(method, path, body) {              // synchronous request (used for load and writes so nothing is lost on navigation)
    const x = new XMLHttpRequest(); x.open(method, BASE + path, false);
    x.setRequestHeader('Content-Type', 'application/json'); if (token()) x.setRequestHeader('Authorization', 'Bearer ' + token());
    try { x.send(body ? JSON.stringify(body) : null); } catch (e) { return { status: 0, json: {} }; }
    let json = {}; try { json = JSON.parse(x.responseText); } catch (e) {}
    if (x.status === 401 && token() && path !== '/auth/login') { sessionStorage.removeItem('saarthi_token'); sessionStorage.removeItem('saarthi_session'); location.replace('login.html'); }
    return { status: x.status, json };
  }
  function load() {
    const r = call('GET', '/db?force=1');
    if (r.status !== 200) { online = false; banner('Cannot reach the Saarthi server. Start it with "npm start" in the server folder (see README).'); return; }
    store = {}; Object.entries(r.json.data || {}).forEach(([k, v]) => { store[k] = JSON.stringify(v); }); rev = r.json.rev; stats = r.json.stats || stats;
  }
  function banner(msg) {
    document.addEventListener('DOMContentLoaded', () => { const b = document.createElement('div'); b.textContent = '⚠ ' + msg; b.style.cssText = 'position:fixed;z-index:99999;left:0;right:0;top:0;background:#b91c1c;color:#fff;padding:.5rem 1rem;font:600 .85rem system-ui;text-align:center'; document.body.appendChild(b); });
  }
  const mapOf = (key, arr) => { const m = new Map(); for (const r of arr) { const id = ridOf(key, r); if (id === undefined || id === null || m.has(String(id))) return null; m.set(String(id), JSON.stringify(r)); } return m; };

  window.DB = {
    get(key) { return store[key] ? JSON.parse(store[key]) : []; },
    has(key) { return !!store[key] && store[key] !== '[]'; },
    set(key, val) {
      const before = store[key] ? JSON.parse(store[key]) : [], nw = mapOf(key, val), old = mapOf(key, before);
      store[key] = JSON.stringify(val);
      if (!token()) return;
      if (!nw || !old) { if (JSON.stringify(before) !== store[key]) this._put(key, { replace: val }); return; }
      const upserts = [], deletes = [];
      nw.forEach((j, id) => { if (old.get(id) !== j) upserts.push({ rid: id, data: JSON.parse(j) }); });
      old.forEach((j, id) => { if (!nw.has(id)) deletes.push(id); });
      if (upserts.length || deletes.length) this._put(key, { upserts, deletes });
    },
    val(key, def) { return key in store ? JSON.parse(store[key]) : def; },
    setVal(key, v) { store[key] = JSON.stringify(v); if (token()) this._put(key, { value: v }); },
    _put(key, body) { const r = call('PUT', '/db/' + key, body); if (r.status >= 400) console.warn('Saarthi: save of', key, 'refused —', (r.json && r.json.error) || r.status); },
    seq() { return this._n('seq', 0); },
    nextDeptCode() { return String(13 + this._n('deptcode', 0)).padStart(2, '0'); },
    nextEmpSeq() { return this._n('empseq', 0); },
    _n(name, base) { const r = call('POST', '/seq/' + name); return r.status === 200 ? base + r.json.n : Date.now() % 1000000; }
  };

  async function post(path, body) {                // async calls for sign-in / register / track
    let res; try { res = await fetch(BASE + path, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token() ? { Authorization: 'Bearer ' + token() } : {}) }, body: JSON.stringify(body) }); }
    catch (e) { return { ok: false, error: 'Cannot reach the Saarthi server. Is it running?' }; }
    const j = await res.json().catch(() => ({})); return res.ok ? j : { ok: false, error: j.error || 'Something went wrong.', field: j.field };
  }
  const startSession = r => { if (r.ok) { sessionStorage.setItem('saarthi_token', r.token); Session.login(r.session); } return r; };

  load();
  setInterval(async () => {                         // pull other users' changes
    if (document.hidden || !online) return;
    try {
      const res = await fetch(BASE + '/db?rev=' + rev, { headers: token() ? { Authorization: 'Bearer ' + token() } : {} });
      if (!res.ok) return; const j = await res.json(); if (j.same) return;
      store = {}; Object.entries(j.data || {}).forEach(([k, v]) => { store[k] = JSON.stringify(v); }); rev = j.rev; stats = j.stats || stats;
      const a = document.activeElement; if (a && ['INPUT', 'TEXTAREA', 'SELECT'].includes(a.tagName)) return;   // don't disturb typing
      document.dispatchEvent(new Event('saarthi:sync'));
    } catch (e) {}
  }, 6000);

  return {
    login: (kind, body) => post('/auth/login', { kind, ...body }).then(startSession),
    register: user => post('/auth/register', user).then(startSession),
    changePassword: (current, next) => post('/auth/change-password', { current, next }),
    forgot: (phone, email) => post('/auth/forgot-password', { phone, email }),
    reset: (token, password) => post('/auth/reset-password', { token, password }),
    resendVerify: email => post('/auth/resend-verification', { email }),
    track: (appNo, phone) => post('/track', { appNo, phone }),
    upload: async file => { const f = new FormData(); f.append('file', file); const r = await fetch(BASE + '/upload', { method: 'POST', headers: { Authorization: 'Bearer ' + token() }, body: f }); return r.json(); },
    stats: () => stats
  };
})();
