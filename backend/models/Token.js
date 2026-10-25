const mongoose = require('mongoose');
/* Single-use e-mail links (verify / reset). Only a SHA-256 hash is stored; MongoDB deletes expired rows itself (TTL index). */
const schema = new mongoose.Schema({ hash: { type: String, unique: true }, kind: String, uid: String, exp: Date });
schema.index({ exp: 1 }, { expireAfterSeconds: 0 });
module.exports = mongoose.model('Token', schema);
