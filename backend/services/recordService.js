const Rec = require('../models/Rec'), Token = require('../models/Token'), sec = require('../utils/security'), mail = require('../utils/mail');
const find = (coll, pred) => Rec.find({ coll }).lean().then(l => l.map(r => r.data).find(pred));
const getUser = id => Rec.findOne({ coll: 'users', rid: id });
const allUsers = async () => (await Rec.find({ coll: 'users' }).lean()).map(r => r.data);
/* Create a single-use token (only its hash is stored) and return the raw value for the e-mail link. */
const issueToken = async (kind, uid, minutes) => { const t = sec.newToken(); await Token.deleteMany({ kind, uid }); await Token.create({ hash: t.hash, kind, uid, exp: new Date(Date.now() + minutes * 60000) }); return t.raw; };
const sendVerify = async user => mail.verifyEmail(user, await issueToken('verify', user.id, 24 * 60));
module.exports = { find, getUser, allUsers, issueToken, sendVerify };
