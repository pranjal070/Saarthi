/* Sets a new supreme-admin password in MongoDB WITHOUT touching any other data.
   Usage (PowerShell, inside the backend folder):
     $env:NEW_ADMIN_PASSWORD = "your-new-password"
     node scripts/set-admin-password.js
   It reads MONGO_URI from backend/.env, so run it where a .env exists. */
require('node:dns/promises').setServers(['8.8.8.8', '1.1.1.1']);
require('dotenv').config();
const mongoose = require('mongoose'), bcrypt = require('bcryptjs');
const Rec = require('../models/Rec'), Meta = require('../models/Meta');
const pw = process.env.NEW_ADMIN_PASSWORD;
if (!process.env.MONGO_URI) { console.error('MONGO_URI not found. Run this where backend/.env exists.'); process.exit(1); }
if (!pw || pw.length < 8) { console.error('Set NEW_ADMIN_PASSWORD first (8+ characters), then run again.'); process.exit(1); }
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const r = await Rec.findOne({ coll: 'authorities', rid: 'admin' });
  if (!r) { console.error('Supreme admin record not found. Has the database been seeded?'); process.exit(1); }
  r.data = { ...r.data, password: await bcrypt.hash(String(pw), 10), blocked: false }; r.markModified('data'); await r.save();
  await Meta.findOneAndUpdate({ name: 'rev' }, { $inc: { n: 1 } }, { upsert: true });
  console.log('Supreme admin password updated. Sign in with username "admin" and the new password.');
  process.exit(0);
})().catch(e => { console.error('Failed:', e.message); process.exit(1); });
