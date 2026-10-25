/* One-time (re-runnable) loader: builds Saarthi's starting data (districts, councils, officers, MLAs, ministers…)
   by running the same front-end seed code, then stores it in MongoDB with bcrypt-hashed passwords.
   Usage:  npm run seed          (add  -- --reset  to wipe the database first) */
   require('node:dns/promises').setServers(['8.8.8.8', '1.1.1.1']);
require('dotenv').config();
const fs = require('fs'), path = require('path'), vm = require('vm'), mongoose = require('mongoose'), bcrypt = require('bcryptjs');
const FE = path.join(__dirname, '..', '..', 'frontend', 'js'), store = {};
const ctx = vm.createContext({ console, Date, Math, JSON, localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } }, sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} }, window: {}, document: {}, location: {} });
for (const f of [path.join(__dirname, 'shim.js'), path.join(FE, 'punjab.js'), path.join(FE, 'data.js')]) vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: f });

const ID = { complaints: r => r.appNo, authorities: r => r.username, mcs: r => `${r.ulb || 'rajpura'}:${r.ward}`, mlas: r => r.ac, mps: r => r.ls, ministries: r => r.key, acOverrides: r => r.no, ulbMap: r => r.ulb };
const VALUES = new Set(['schema', 'maintenance', 'notify']), COUNTERS = { seq: 'seq', deptcode_seq: 'deptcode', empseq: 'empseq' };
const PW = new Set(['users', 'officers', 'mcs', 'authorities']);

(async () => {
  if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.length < 8) { console.error('Set ADMIN_PASSWORD (8+ characters) in server/.env first — it becomes the supreme admin password.'); process.exit(1); }
  await mongoose.connect(process.env.MONGO_URI);
  const Rec = mongoose.connection.collection('recs'), Meta = mongoose.connection.collection('metas');
  if (process.argv.includes('--reset')) { await Rec.deleteMany({}); await Meta.deleteMany({}); console.log('database cleared'); }
  await Rec.createIndex({ coll: 1, rid: 1 }, { unique: true });
  const cache = {}, hash = pw => cache[pw] || (cache[pw] = bcrypt.hashSync(pw, 10));   // identical default passwords share one hash
  let total = 0;
  for (const k of Object.keys(store)) {
    const key = k.replace(/^saarthi_/, ''), raw = JSON.parse(store[k]);
    if (COUNTERS[key]) { await Meta.updateOne({ name: 'seq_' + COUNTERS[key] }, { $max: { n: Number(raw) } }, { upsert: true }); continue; }
    if (VALUES.has(key)) { await Rec.updateOne({ coll: key, rid: '__value__' }, { $setOnInsert: { data: raw } }, { upsert: true }); continue; }
    if (!Array.isArray(raw)) continue;
    const idf = ID[key] || (r => r.id), ops = [];
    if (raw.some(r => idf(r) === undefined)) { await Rec.updateOne({ coll: key, rid: '__all__' }, { $setOnInsert: { data: raw } }, { upsert: true }); total += raw.length; continue; }
    for (const r of raw) {
      const rid = idf(r); if (rid === undefined) continue;
      if (PW.has(key) && r.password && !/^\$2[aby]\$/.test(r.password)) r.password = hash(r.password);
      if (key === 'authorities' && r.username === 'admin' && process.env.ADMIN_PASSWORD) r.password = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10);
      ops.push({ updateOne: { filter: { coll: key, rid: String(rid) }, update: { $setOnInsert: { data: r } }, upsert: true } });   // never overwrites live data
    }
    if (ops.length) await Rec.bulkWrite(ops); total += ops.length;
  }
  await Meta.updateOne({ name: 'rev' }, { $inc: { n: 1 } }, { upsert: true });
  console.log(`Seeded ${total} records. Start the server with: npm start`); process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
