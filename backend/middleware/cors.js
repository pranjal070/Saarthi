const { PROD, SITE } = require('../config/env');
/* CORS: only our own site (PUBLIC_URL) — plus localhost while developing. */
module.exports = (req, res, next) => {
  const o = req.headers.origin;
  if (o && (o === SITE || (!PROD && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o)))) res.set({ 'Access-Control-Allow-Origin': o, 'Vary': 'Origin', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS' });
  req.method === 'OPTIONS' ? res.sendStatus(204) : next();
};
