/* Loads .env once and exposes validated settings to the rest of the app. */
require('node:dns/promises').setServers(['8.8.8.8', '1.1.1.1']);      // fixes "querySrv" Atlas DNS errors on some networks
require('dotenv').config();
const e = process.env;
if (!e.MONGO_URI) { console.error('Set MONGO_URI in backend/.env (see .env.example)'); process.exit(1); }
if (!e.AADHAAR_PEPPER || e.AADHAAR_PEPPER.length < 16) { console.error('Set AADHAAR_PEPPER in backend/.env (16+ random characters, keep it secret and never change it).'); process.exit(1); }
module.exports = {
  MONGO_URI: e.MONGO_URI, JWT_SECRET: e.JWT_SECRET || 'dev-only-secret', PORT: e.PORT || 3000,
  PROD: e.NODE_ENV === 'production', SITE: (e.PUBLIC_URL || '').replace(/\/$/, ''),
  REQUIRE_VERIFY: e.REQUIRE_EMAIL_VERIFY !== 'false', ESCALATION_MS: Math.max(1, Number(e.ESCALATION_MINUTES) || 10) * 60000
};
