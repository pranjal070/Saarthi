# Deployment guide (MongoDB Atlas + Render)

1. **Atlas**: create a cluster, add a database user, and under Network Access allow `0.0.0.0/0` (Render has no fixed IP).
2. **GitHub**: the repository contains `frontend/` and `backend/`; `.env` is never committed.
3. **Render**: New → Web Service → choose the repository.
   - Root Directory: `backend` · Build Command: `npm install` · Start Command: `npm start` · Instance: Free.
4. **Environment variables** (Render → Environment): `MONGO_URI`, `JWT_SECRET`, `ADMIN_PASSWORD`, `AADHAAR_PEPPER`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM`, `NODE_ENV=production`, and after the first deploy `PUBLIC_URL=https://<service>.onrender.com`.
5. **Seed once** from your PC against the same Atlas database: `cd backend` → `npm run seed`.
6. **Check**: open `https://<service>.onrender.com/api/health` → `{"ok":true,…}`; then test with the Postman collection in `docs/`.
7. **Keep it awake**: the free plan sleeps after ~15 minutes idle; add an UptimeRobot monitor on `/api/health` every 5 minutes.

## Known limits
Free-plan disk is wiped on every deploy (uploaded files are lost); cold start takes ~30 seconds; SMS is not implemented.
