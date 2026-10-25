# Saarthi v42 — Civic Grievance Portal, Govt. of Punjab (MVC backend)

Stack: **Node.js + Express + MongoDB (Mongoose)** backend, vanilla HTML/CSS/JS frontend. One GitHub repo, two folders: `frontend/` and `backend/`.

## MVC structure
```
backend/
  server.js            entry: config → MongoDB connect → listen + escalation timer
  app.js               Express app: helmet, body parsers, CORS, auth, routes, static frontend, error handler
  config/env.js        reads .env, validates required settings
  models/              M  Rec.js (all records), Meta.js (counters/revision), Token.js (e-mail links, TTL index)
  controllers/         C  authController, dataController, trackController, uploadController, adminController
  routes/              URL → controller maps (authRoutes, dataRoutes, index)
  middleware/          auth (JWT), rateLimit (+ account lockout), cors, errorHandler
  services/            business logic: policy, recordService, notificationService, escalationService, revisionService
  utils/               HttpError, asyncHandler, security (password rules, Aadhaar hash, tokens), mail (Nodemailer)
  scripts/             seed.js (loads starting data), shim.js
frontend/              V  HTML pages, css/, js/ (api.js talks to the API)
docs/                  Saarthi.postman_collection.json, VIVA_PREP.md
```
Request flow: `Browser → routes → middleware → controller → service → model → MongoDB`, and back as JSON. Errors anywhere go to `middleware/errorHandler.js`.

## Run locally (Windows / VS Code)
1. Install Node.js LTS. Create a free MongoDB Atlas cluster, add a database user, allow your IP (or 0.0.0.0/0), copy the connection string.
2. In a terminal: `cd backend`, copy `.env.example` to `.env`, fill it in (never share or commit `.env`).
3. `npm install` → `npm run seed` (once) → `npm start` → open http://localhost:3000 (the backend also serves the frontend).
`npm run seed -- --reset` wipes and reloads the database.

## Deploy (Render)
Push the repo to GitHub, then Render → New Web Service: Root Directory `backend`, Build `npm install`, Start `npm start`, Environment: `MONGO_URI, JWT_SECRET, ADMIN_PASSWORD, AADHAAR_PEPPER, MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS, MAIL_FROM, NODE_ENV=production`, then `PUBLIC_URL=https://<your-service>.onrender.com`. Run `npm run seed` once from your PC against the same Atlas database. Atlas → Network Access must allow 0.0.0.0/0.
Because the backend serves the frontend, the frontend calls the deployed API at `/api` automatically. To host the frontend elsewhere, set `window.SAARTHI_API = 'https://<service>.onrender.com/api'` before `js/api.js` loads, and set `PUBLIC_URL` to the frontend address for CORS.

## API testing
Import `docs/Saarthi.postman_collection.json` into Postman (or Thunder Client). Set `baseUrl` (local or Render) and `adminPassword`, run **Login – supreme admin** (it stores the token automatically), then any other request.

## Features
JWT sign-in for citizens/officers/councillors/administration, bcrypt hashing, strong-password rule, one account per mobile/e-mail/Aadhaar (Aadhaar kept only as a keyed one-way hash + last 4 digits), e-mail verification, password reset, Multer uploads, e-mails on registration / grievance filed / every status change / escalation (Nodemailer + Gmail SMTP; with `MAIL_HOST` empty it runs in test mode and saves e-mails in `backend/outbox/`), server-side SLA escalation every 10 min, role-based access (MLA/MP/Mayor view-only), `helmet`, CORS allow-list, request-size limits, 5-wrong-passwords lockout.

## Demo accounts (after seeding)
District admin `district@123`, DC `dc@123`, EO `eo@123`, Mayor `mayor@123`, MLA `mla@123`, MP `mp@123`, CMO `cmo@123`, Minister `minister@123`, Councillor `mc@123`, employees `officer@123` (sign in with roll ID). Supreme admin password = the `ADMIN_PASSWORD` you set. Change defaults before any public demo.

## Known limits (honest notes)
- SMS is not implemented. Render's free disk is wiped on deploy (uploaded files are lost) and the free service sleeps when idle (escalation pauses). Aadhaar check is checksum + duplicate protection only — it does not prove the number is genuine. Business rules for grievance workflow live partly in the browser code that the server re-uses for escalation.
