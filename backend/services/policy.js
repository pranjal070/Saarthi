/* Who may read / write what. Kept in one place so the rules are easy to explain and audit. */
module.exports = {
  PW_COLLS: new Set(['users', 'officers', 'mcs', 'authorities']),                          // collections that hold passwords
  PRIVATE: new Set(['users', 'complaints', 'notifications', 'systemAlerts', 'transfers', 'mergeRequests', 'officeLog', 'geoLog', 'cabinetLog', 'notify']),
  READ_ONLY_ROLES: new Set(['mla', 'mp', 'mayor']),                                         // view-only accounts
  CITIZEN_WRITE: new Set(['users', 'complaints', 'notifications', 'systemAlerts']),
  OFFICER_BLOCKED: new Set(['authorities', 'ministries', 'users']),
  SERVER_OWNED: ['password', 'aadhaarHash', 'aadhaarMasked', 'emailVerified', 'email', 'phone', 'id', 'createdAt', 'blocked'],   // citizens cannot overwrite these
  KEY_RE: /^[A-Za-z][A-Za-z0-9_]{0,40}$/,
  isBcrypt: s => /^\$2[aby]\$/.test(s)
};
