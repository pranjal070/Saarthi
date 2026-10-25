const bcrypt = require('bcryptjs');
const Rec = require('../models/Rec'), Meta = require('../models/Meta');
const HttpError = require('../utils/HttpError'), asyncHandler = require('../utils/asyncHandler');
const P = require('../services/policy'), revision = require('../services/revisionService'), { REQUIRE_VERIFY } = require('../config/env');
const { getUser } = require('../services/recordService'), { notifyComplaints } = require('../services/notificationService');
const hashPw = pw => bcrypt.hash(pw, 10);
const strip = d => { if (d && typeof d === 'object' && ('password' in d || 'aadhaarHash' in d)) { const { password, aadhaarHash, ...rest } = d; return rest; } return d; };

/* GET /api/db — everything the signed-in user is allowed to see (anonymous visitors get only public data) */
exports.getDb = asyncHandler(async (req, res) => {
  if (req.query.rev && Number(req.query.rev) === revision.get() && !req.query.force) return res.json({ rev: revision.get(), same: true });
  const u = req.user, role = u && u.role, staff = role && role !== 'citizen';
  const recs = await Rec.find({}).lean(), data = {}, stats = { complaints: 0 };
  for (const r of recs) {
    if (r.coll === 'complaints') stats.complaints++;
    if (P.PRIVATE.has(r.coll)) {
      if (!u) continue;
      if (!staff) {                                                               // citizens see only their own records
        const mine = r.coll === 'users' ? r.data.id === u.sub : (r.coll === 'complaints' || r.coll === 'notifications') ? r.data.citizenId === u.sub : false;
        if (!mine) continue;
      }
    }
    if (r.rid === '__value__' || r.rid === '__all__') data[r.coll] = r.data;
    else (data[r.coll] = data[r.coll] || []).push(P.PW_COLLS.has(r.coll) ? strip(r.data) : r.data);
  }
  res.json({ rev: revision.get(), data, stats });
});

/* PUT /api/db/:key — write changed records of one collection, with role-based permission checks */
exports.putCollection = asyncHandler(async (req, res) => {
  const key = req.params.key; if (!P.KEY_RE.test(key)) throw new HttpError(400, 'Bad collection name.');
  const { role, sub } = req.user, { upserts = [], deletes = [], replace, value } = req.body || {};
  if (upserts.length > 500 || deletes.length > 500) throw new HttpError(413, 'Too many records in one request.');
  if (P.READ_ONLY_ROLES.has(role)) throw new HttpError(403, 'This account has view-only access.');
  if (role === 'citizen' && !P.CITIZEN_WRITE.has(key)) throw new HttpError(403, 'Not allowed.');
  if (role === 'citizen' && deletes.length) throw new HttpError(403, 'Not allowed.');
  if (role === 'mc' && !P.CITIZEN_WRITE.has(key) && key !== 'mcs') throw new HttpError(403, 'Not allowed.');
  if (role === 'officer' && P.OFFICER_BLOCKED.has(key)) throw new HttpError(403, 'Not allowed.');
  const owns = d => key === 'users' ? d.id === sub : (key === 'complaints' || key === 'notifications') ? d.citizenId === sub : key === 'systemAlerts';
  if (role === 'citizen' && !upserts.map(x => x.data).every(owns)) throw new HttpError(403, 'You can only change your own records.');
  const prep = async (rid, d) => {                                                // protect server-owned fields, hash new passwords, keep old when absent
    if (key === 'users' && role === 'citizen') { const old = await Rec.findOne({ coll: 'users', rid }).lean(); if (!old) throw new HttpError(403, 'Not allowed.'); for (const f of P.SERVER_OWNED) { if (f in old.data) d[f] = old.data[f]; else delete d[f]; } }
    if (!P.PW_COLLS.has(key) || !d || typeof d !== 'object') return d;
    if (d.password && !P.isBcrypt(d.password)) { if (role === 'citizen' && key === 'users') delete d.password; else d.password = await hashPw(String(d.password)); }
    if (!d.password) { const old = await Rec.findOne({ coll: key, rid }).lean(); if (old && old.data.password) d.password = old.data.password; }
    return d;
  };
  const before = new Map();
  if (key === 'complaints' && upserts.length) {
    for (const o of await Rec.find({ coll: 'complaints', rid: { $in: upserts.map(x => String(x.rid)) } }).lean()) before.set(o.rid, o.data);
    if (role === 'citizen' && REQUIRE_VERIFY) {                                    // unverified email cannot file new grievances
      const me = await getUser(sub);
      if (upserts.some(x => !before.has(String(x.rid))) && !(me && me.data.emailVerified)) throw new HttpError(403, 'Please verify your email address first — check your inbox (or resend the link from your dashboard).');
    }
  }
  if (value !== undefined) await Rec.updateOne({ coll: key, rid: '__value__' }, { $set: { data: value } }, { upsert: true });
  else if (Array.isArray(replace)) { await Rec.deleteMany({ coll: key, rid: { $ne: '__all__' } }); await Rec.updateOne({ coll: key, rid: '__all__' }, { $set: { data: replace } }, { upsert: true }); }
  else {
    await Rec.deleteMany({ coll: key, rid: '__all__' });
    for (const { rid, data } of upserts) { if (!rid) continue; await Rec.updateOne({ coll: key, rid: String(rid) }, { $set: { data: await prep(String(rid), data) } }, { upsert: true }); }
    if (deletes.length) await Rec.deleteMany({ coll: key, rid: { $in: deletes.map(String) } });
  }
  await revision.bump(); res.json({ ok: true, rev: revision.get() });
  if (key === 'complaints') notifyComplaints(upserts, before).catch(e => console.error('[notify]', e.message));
});

/* POST /api/seq/:name — atomic counters (application numbers, roll IDs) */
exports.nextSeq = asyncHandler(async (req, res) => {
  if (!P.KEY_RE.test(req.params.name)) throw new HttpError(400, 'Bad counter.');
  const m = await Meta.findOneAndUpdate({ name: 'seq_' + req.params.name }, { $inc: { n: 1 } }, { upsert: true, new: true });
  res.json({ n: m.n });
});
