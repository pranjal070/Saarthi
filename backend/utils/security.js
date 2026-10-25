const crypto = require('crypto');
// ---- strong password: 10+ chars, upper, lower, digit, symbol, not a common one ----
const COMMON = ['password', 'password1', 'qwerty', 'welcome', 'letmein', 'admin', 'saarthi', 'punjab', 'iloveyou', '12345678', '123456789'];
function passwordProblem(pw = '') {
  pw = String(pw);
  if (pw.length < 10) return 'Password must be at least 10 characters.';
  if (!/[a-z]/.test(pw) || !/[A-Z]/.test(pw)) return 'Use both upper-case and lower-case letters.';
  if (!/\d/.test(pw)) return 'Add at least one digit.';
  if (!/[^A-Za-z0-9]/.test(pw)) return 'Add at least one symbol such as ! @ # $ %.';
  if (COMMON.some(c => pw.toLowerCase().includes(c))) return 'That password is too easy to guess. Choose something less common.';
  return null;
}
// ---- Aadhaar: Verhoeff checksum + keyed one-way hash (the number itself is never stored) ----
const D = [[0,1,2,3,4,5,6,7,8,9],[1,2,3,4,0,6,7,8,9,5],[2,3,4,0,1,7,8,9,5,6],[3,4,0,1,2,8,9,5,6,7],[4,0,1,2,3,9,5,6,7,8],[5,9,8,7,6,0,4,3,2,1],[6,5,9,8,7,1,0,4,3,2],[7,6,5,9,8,2,1,0,4,3],[8,7,6,5,9,3,2,1,0,4],[9,8,7,6,5,4,3,2,1,0]];
const P = [[0,1,2,3,4,5,6,7,8,9],[1,5,7,6,2,8,3,0,9,4],[5,8,0,3,7,9,6,1,4,2],[8,9,1,6,0,4,3,5,2,7],[9,4,5,3,1,2,6,8,7,0],[4,2,8,6,5,7,3,9,0,1],[2,7,9,3,8,0,6,4,1,5],[7,0,4,6,9,1,3,2,5,8]];
const aadhaarValid = a => { if (!/^[2-9]\d{11}$/.test(a)) return false; let c = 0; [...a].reverse().forEach((d, i) => { c = D[c][P[i % 8][Number(d)]]; }); return c === 0; };
const aadhaarHash = a => crypto.createHmac('sha256', process.env.AADHAAR_PEPPER || '').update(a).digest('hex');
// ---- single-use tokens: the emailed value is random; only its hash is stored ----
const newToken = () => { const raw = crypto.randomBytes(32).toString('hex'); return { raw, hash: crypto.createHash('sha256').update(raw).digest('hex') }; };
const hashToken = raw => crypto.createHash('sha256').update(String(raw)).digest('hex');
module.exports = { passwordProblem, aadhaarValid, aadhaarHash, newToken, hashToken };
