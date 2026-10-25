const HttpError = require('../utils/HttpError');
/* 1) per-IP limiter: 30 requests per minute on sensitive routes */
const attempts = new Map();
function limiter(req, res, next) {
  const k = req.ip, now = Date.now(), a = (attempts.get(k) || []).filter(t => now - t < 60000);
  if (a.length >= 30) return next(new HttpError(429, 'Too many attempts. Wait a minute and try again.'));
  a.push(now); attempts.set(k, a); next();
}
/* 2) per-account lockout: 5 wrong passwords lock that account for 10 minutes */
const fails = new Map(), MAX_FAILS = 5, LOCK_MS = 10 * 60000;
const lockKey = req => `${req.body.kind}:${String(req.body.phone || req.body.empId || req.body.officerId || req.body.username || `${req.body.ulb}:${req.body.ward}`).toLowerCase()}`;
const lockedFor = k => { const f = fails.get(k); return f && f.until > Date.now() ? Math.ceil((f.until - Date.now()) / 60000) : 0; };
const recordFailure = k => { const f = fails.get(k) || { n: 0, until: 0 }; if (f.until && f.until <= Date.now()) { f.n = 0; f.until = 0; } f.n++; if (f.n >= MAX_FAILS) f.until = Date.now() + LOCK_MS; fails.set(k, f); };
const clearFailures = k => fails.delete(k);
setInterval(() => { for (const [k, f] of fails) if (f.until < Date.now() - LOCK_MS) fails.delete(k); }, 15 * 60000).unref();
module.exports = { limiter, lockKey, lockedFor, recordFailure, clearFailures };
