/* Server-side escalation: runs the SAME escalation rules as the website (frontend/js/app.js) on a timer,
   so SLA breaches escalate and officers get suspended even when nobody has the site open. */
const vm = require('vm'), fs = require('fs'), path = require('path');
const Rec = require('../models/Rec'), mail = require('../utils/mail'), revision = require('./revisionService'), { getUser } = require('./recordService');
const FE = path.join(__dirname, '..', '..', 'frontend', 'js'), WATCH = { complaints: r => r.appNo, officers: r => r.id, systemAlerts: r => r.id };
const code = () => {
  const app = fs.readFileSync(path.join(FE, 'app.js'), 'utf8');
  return app.match(/^const hoursLeft = .*$/m)[0] + '\n' + app.match(/function _runEscalationsLocal\(\)\{[\s\S]*?\n\}\n/)[0] + '\n_runEscalationsLocal();';
};
let running = false;
async function runOnce() {
  if (running) return { skipped: true }; running = true;
  try {
    const store = {}, arrays = {};
    for (const r of await Rec.find({}).lean()) {
      if (r.rid === '__value__' || r.rid === '__all__') store['saarthi_' + r.coll] = JSON.stringify(r.data);
      else (arrays[r.coll] = arrays[r.coll] || []).push(r.data);
    }
    for (const [k, v] of Object.entries(arrays)) store['saarthi_' + k] = JSON.stringify(v);
    const before = {}; for (const k of Object.keys(WATCH)) before[k] = Object.fromEntries((arrays[k] || []).map(r => [WATCH[k](r), JSON.stringify(r)]));
    const ctx = vm.createContext({ console: { log() {}, error: console.error, warn() {} }, Date, Math, JSON, localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } }, sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} }, window: {}, document: {}, location: {} });
    for (const f of [path.join(__dirname, '..', 'scripts', 'shim.js'), path.join(FE, 'punjab.js'), path.join(FE, 'data.js')]) vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: f });
    // data.js may seed defaults for collections that did not exist; we only ever persist the watched ones
    vm.runInContext(code(), ctx, { filename: 'escalation' });
    let changed = 0, escalated = 0;
    for (const k of Object.keys(WATCH)) {
      const after = JSON.parse(store['saarthi_' + k] || '[]');
      for (const rec of after) {
        const id = WATCH[k](rec); if (id === undefined || before[k][id] === JSON.stringify(rec)) continue;
        await Rec.updateOne({ coll: k, rid: String(id) }, { $set: { data: rec } }, { upsert: true }); changed++;
        if (k === 'complaints') {
          const old = before[k][id] ? JSON.parse(before[k][id]) : null, oldLen = old ? (old.timeline || []).length : 0, tl = rec.timeline || [];
          const fresh = tl.slice(oldLen).filter(t => t.status === 'Escalated');
          if (old && fresh.length && rec.citizenId) { escalated++; const u = await getUser(rec.citizenId); if (u && u.data.email) mail.complaintEscalated(u.data, rec, fresh[fresh.length - 1].note); }
        }
      }
    }
    if (changed) await revision.bump();
    if (changed) console.log(`[escalation] ${changed} record(s) updated, ${escalated} grievance(s) escalated`);
    return { changed, escalated };
  } finally { running = false; }
}
module.exports = { runOnce };
