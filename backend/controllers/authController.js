const bcrypt = require('bcryptjs');
const Rec = require('../models/Rec'), Token = require('../models/Token');
const HttpError = require('../utils/HttpError'), asyncHandler = require('../utils/asyncHandler'), sec = require('../utils/security'), mail = require('../utils/mail');
const { sign } = require('../middleware/auth'), lock = require('../middleware/rateLimit'), revision = require('../services/revisionService');
const { find, getUser, allUsers, issueToken, sendVerify } = require('../services/recordService');
const hashPw = pw => bcrypt.hash(pw, 10), EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* POST /api/auth/login — one endpoint, four account kinds (citizen / officer / mc / authority) */
exports.login = asyncHandler(async (req, res) => {
  const { kind, password = '' } = req.body || {};
  const LK = lock.lockKey(req), wait = lock.lockedFor(LK);
  if (wait) throw new HttpError(429, `Too many wrong passwords. This account is locked for ${wait} more minute(s).`);
  let acct, session, role, sub;
  if (kind === 'citizen') {
    const phone = String(req.body.phone || '').trim();
    if (!/^[6-9]\d{9}$/.test(phone)) throw new HttpError(400, 'Enter a valid 10-digit mobile number.', 'phone');
    acct = await find('users', u => u.phone === phone);
    if (!acct) throw new HttpError(404, 'No account found. Please register first.', 'phone');
    if (acct.blocked) throw new HttpError(403, 'This account has been blocked by the administration. Contact the Municipal Council for assistance.', 'phone');
    role = 'citizen'; sub = acct.id;
    session = { role, id: acct.id, name: acct.name, ward: acct.ward, ulb: acct.ulb || 'rajpura', district: acct.district || 'patiala', phone: acct.phone, emailVerified: !!acct.emailVerified };
  } else if (kind === 'officer') {
    const empId = String(req.body.empId || '').trim().toUpperCase(), oid = req.body.officerId;
    acct = await find('officers', o => empId ? (o.empId || '').toUpperCase() === empId : o.id === oid);
    if (!acct) throw new HttpError(404, empId ? 'No employee found with that roll ID.' : 'Select an officer.', empId ? 'empId' : 'officerId');
    if (acct.blocked) throw new HttpError(403, acct.suspension ? `This officer is suspended (${acct.suspension.by}, ${new Date(acct.suspension.at).toLocaleDateString('en-IN')}). Contact the issuing authority.` : 'This account has been blocked by the administration.');
    role = 'officer'; sub = acct.id;
    session = { role, dept: acct.dept, district: acct.district, empId: acct.empId, officerId: acct.id, name: acct.name, designation: acct.designation };
  } else if (kind === 'mc') {
    const ulb = req.body.ulb, ward = Number(req.body.ward);
    acct = await find('mcs', m => (m.ulb || 'rajpura') === ulb && m.ward === ward);
    if (!acct) throw new HttpError(404, 'No councillor is registered for this ward yet.', 'ward');
    if (acct.blocked) throw new HttpError(403, 'This account has been blocked by the administration.');
    role = 'mc'; sub = `${ulb}:${ward}`;
    session = { role, ward, ulb, district: req.body.district, name: acct.name };
  } else if (kind === 'authority') {
    const username = String(req.body.username || '');
    acct = await find('authorities', a => a.username === username);
    if (!acct) throw new HttpError(404, 'This account does not exist.');
    if (acct.blocked) throw new HttpError(403, acct.role === 'minister' ? 'This ministry is vacant — no minister holds it at the moment.' : 'This account is not active.');
    role = acct.role; sub = acct.username;
    session = { role, username: acct.username, name: acct.name, title: acct.title, district: acct.district || null, ulb: acct.ulb || null, portfolio: acct.portfolio || null, ministryKey: acct.ministryKey || null, ac: acct.ac || null, ls: acct.ls || null };
  } else throw new HttpError(400, 'Unknown sign-in type.');
  if (!acct.password || !(await bcrypt.compare(String(password), acct.password))) { lock.recordFailure(LK); throw new HttpError(401, 'Incorrect password.', 'password'); }
  lock.clearFailures(LK);
  res.json({ ok: true, token: sign({ role, sub, district: session.district || null, ulb: session.ulb || null }), session });
});

/* POST /api/auth/register — validation, uniqueness (phone / email / Aadhaar hash), hashing, welcome + admin mails */
exports.register = asyncHandler(async (req, res) => {
  const u = req.body || {}, bad = (f, m) => { throw new HttpError(400, m, f); };
  if (!u.name || String(u.name).trim().length < 3) bad('name', 'Enter your full name.');
  if (!/^[6-9]\d{9}$/.test(u.phone || '')) bad('phone', 'Enter a valid 10-digit mobile number.');
  const email = String(u.email || '').trim().toLowerCase();
  if (!EMAIL_RE.test(email)) bad('email', 'Enter a valid email address.');
  const pwErr = sec.passwordProblem(u.password); if (pwErr) bad('password', pwErr);
  const aad = String(u.aadhaar || '').replace(/\s/g, '');
  if (!sec.aadhaarValid(aad)) bad('aadhaar', 'Enter a valid 12-digit Aadhaar number.');
  if (!u.ulb || !u.ward) bad('ward', 'Select your council and ward.');
  const aHash = sec.aadhaarHash(aad), all = await allUsers();
  if (all.some(x => x.phone === u.phone)) throw new HttpError(409, 'This mobile number is already registered. Please sign in.', 'phone');
  if (all.some(x => (x.email || '').toLowerCase() === email)) throw new HttpError(409, 'This email address is already registered.', 'email');
  if (all.some(x => x.aadhaarHash === aHash)) throw new HttpError(409, 'An account already exists for this Aadhaar number.', 'aadhaar');
  const { aadhaar, ...rest } = u;                                              // the full Aadhaar number is discarded here
  const user = { ...rest, email, id: 'C' + Date.now() + Math.floor(Math.random() * 90 + 10), createdAt: Date.now(), password: await hashPw(String(u.password)), aadhaarHash: aHash, aadhaarMasked: 'XXXX-XXXX-' + aad.slice(-4), emailVerified: false };
  await Rec.create({ coll: 'users', rid: user.id, data: user }); await revision.bump();
  sendVerify(user).catch(e => console.error('[verify]', e.message));
  mail.adminNewUser(user);
  const session = { role: 'citizen', id: user.id, name: user.name, ward: Number(user.ward), ulb: user.ulb, district: user.district, phone: user.phone, emailVerified: false };
  res.status(201).json({ ok: true, token: sign({ role: 'citizen', sub: user.id, district: user.district, ulb: user.ulb }), session });
});

/* GET /api/auth/verify-email?token=… — opened from the e-mail */
exports.verifyEmail = asyncHandler(async (req, res) => {
  const page = (t, m) => res.type('html').send(`<meta name=viewport content="width=device-width,initial-scale=1"><body style="font-family:Segoe UI,Arial;background:#0b0b0d;color:#eee;display:grid;place-items:center;min-height:100vh;margin:0"><div style="max-width:420px;padding:28px;border:1px solid #333;border-radius:14px;text-align:center"><h2 style="color:#f97316">${t}</h2><p>${m}</p><a href="/login.html" style="color:#f97316">Go to sign in</a></div>`);
  const t = await Token.findOne({ hash: sec.hashToken(req.query.token), kind: 'verify' });
  if (!t || t.exp < new Date()) return page('Link expired', 'This verification link is invalid or has expired. Sign in and choose “Resend verification email”.');
  const r = await getUser(t.uid); if (!r) return page('Link expired', 'Account not found.');
  r.data = { ...r.data, emailVerified: true }; r.markModified('data'); await r.save(); await Token.deleteOne({ _id: t._id }); await revision.bump();
  mail.welcome(r.data); page('Email verified ✔', 'Your account is active. You can now file and track grievances.');
});

/* POST /api/auth/resend-verification (signed-in citizen) */
exports.resendVerification = asyncHandler(async (req, res) => {
  if (req.user.role !== 'citizen') throw new HttpError(403, 'Not available for this account type.');
  const r = await getUser(req.user.sub); if (!r) throw new HttpError(404, 'Account not found.');
  const email = String(req.body.email || '').trim().toLowerCase();
  if (email) {                                                                  // older accounts without a (verified) email
    if (r.data.emailVerified) throw new HttpError(400, 'Email already verified.');
    if (!EMAIL_RE.test(email)) throw new HttpError(400, 'Enter a valid email address.', 'email');
    if ((await allUsers()).some(x => x.id !== r.data.id && (x.email || '').toLowerCase() === email)) throw new HttpError(409, 'This email address is already registered.', 'email');
    r.data = { ...r.data, email }; r.markModified('data'); await r.save(); await revision.bump();
  }
  if (r.data.emailVerified) return res.json({ ok: true, already: true });
  if (!r.data.email) throw new HttpError(400, 'Add your email address first.', 'email');
  await sendVerify(r.data); res.json({ ok: true });
});

/* POST /api/auth/forgot-password — same reply whether or not an account matches, so nobody can probe accounts */
exports.forgotPassword = asyncHandler(async (req, res) => {
  const phone = String(req.body.phone || '').trim(), email = String(req.body.email || '').trim().toLowerCase();
  const u = (await allUsers()).find(x => x.phone === phone && x.email && x.email.toLowerCase() === email);
  if (u && !u.blocked) mail.resetPassword(u, await issueToken('reset', u.id, 30));
  res.json({ ok: true, message: 'If these details match an account, a reset link has been emailed. It works for 30 minutes.' });
});

/* POST /api/auth/reset-password — single-use token + strong password */
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body || {}, pwErr = sec.passwordProblem(password); if (pwErr) throw new HttpError(400, pwErr, 'password');
  const t = await Token.findOne({ hash: sec.hashToken(token), kind: 'reset' });
  if (!t || t.exp < new Date()) throw new HttpError(400, 'This reset link is invalid or has expired. Please request a new one.');
  const r = await getUser(t.uid); if (!r) throw new HttpError(400, 'Account not found.');
  r.data = { ...r.data, password: await hashPw(String(password)), emailVerified: true }; r.markModified('data'); await r.save();   // they proved control of the mailbox
  await Token.deleteOne({ _id: t._id }); await revision.bump(); mail.passwordChanged(r.data);
  res.json({ ok: true });
});

/* POST /api/auth/change-password (administration accounts only) */
exports.changePassword = asyncHandler(async (req, res) => {
  const { current = '', next = '' } = req.body || {};
  if (['citizen', 'officer', 'mc'].includes(req.user.role)) throw new HttpError(403, 'Not available for this account type.');
  if (String(next).length < 6) throw new HttpError(400, 'New password must be at least 6 characters.');
  const r = await Rec.findOne({ coll: 'authorities', rid: req.user.sub });
  if (!r || !(await bcrypt.compare(String(current), r.data.password))) throw new HttpError(401, 'Current password is incorrect.');
  r.data = { ...r.data, password: await hashPw(String(next)) }; r.markModified('data'); await r.save(); await revision.bump();
  res.json({ ok: true });
});
