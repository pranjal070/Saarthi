// In-memory stand-in for the browser DB driver, used ONLY by seed.js to generate the first data set.
const DB = {
  get(key){ return JSON.parse(localStorage.getItem('saarthi_' + key)) || []; },
  set(key, val){ localStorage.setItem('saarthi_' + key, JSON.stringify(val)); },
  has(key){ return localStorage.getItem('saarthi_' + key) !== null; },
  val(key, def){ const r = localStorage.getItem('saarthi_' + key); return r === null ? def : JSON.parse(r); },
  setVal(key, v){ localStorage.setItem('saarthi_' + key, JSON.stringify(v)); },
  seq(){ const n = Number(localStorage.getItem('saarthi_seq') || 0) + 1; localStorage.setItem('saarthi_seq', n); return n; },
  nextDeptCode(){ const n = Math.max(13, Number(localStorage.getItem('saarthi_deptcode_seq') || 13)) + 1; localStorage.setItem('saarthi_deptcode_seq', n); return String(n).padStart(2, '0'); },
  nextEmpSeq(){ const n = Number(localStorage.getItem('saarthi_empseq') || 0) + 1; localStorage.setItem('saarthi_empseq', n); return n; }
};
