const jwt = require('jsonwebtoken'), { JWT_SECRET } = require('../config/env'), HttpError = require('../utils/HttpError');
const sign = payload => jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
/* Optional authentication: if a Bearer token is present it is verified and req.user is set. */
function auth(req, res, next) {
  const h = req.headers.authorization || '';
  if (h.startsWith('Bearer ')) { try { req.user = jwt.verify(h.slice(7), JWT_SECRET); } catch (e) { return next(new HttpError(401, 'Session expired — please sign in again.')); } }
  next();
}
/* Protected route guard. */
const need = (req, res, next) => req.user ? next() : next(new HttpError(401, 'Please sign in.'));
const onlyRole = role => (req, res, next) => req.user && req.user.role === role ? next() : next(new HttpError(403, 'Not allowed.'));
module.exports = { sign, auth, need, onlyRole };
