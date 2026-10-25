# Saarthi — Viva preparation (Node.js, Express.js, MongoDB)

Every answer points to real code in this project so you can open the file and show it.

## 1. Project in 30 seconds
Saarthi is a civic grievance portal. Citizens register and file complaints; officers act on them; if an officer misses the SLA the complaint auto-escalates (officer → senior officer → DC → CMO). Backend: Node.js + Express + MongoDB Atlas (Mongoose). Frontend: HTML/CSS/JS served by the same Express app. Deployed on Render.

## 2. MVC — how it maps here
- **Model** = `backend/models/` (Rec, Meta, Token) — Mongoose schemas that talk to MongoDB.
- **View** = `frontend/` — what the user sees. (An API returns JSON; the browser is the view.)
- **Controller** = `backend/controllers/` — receives the request, validates, calls services/models, sends the response.
- **Routes** = `backend/routes/` — map URL + HTTP method to a controller function.
- **Why MVC?** Separation of concerns: each file has one job, easy to test, debug and extend.

## 3. Node.js
1. **What is Node.js?** A JavaScript runtime built on Chrome's V8 engine that lets JS run outside the browser, on the server.
2. **Event loop / non-blocking I/O:** Node runs JS on one thread; slow operations (DB, files, network) are handed off and their callbacks/promises run when ready. That lets one process serve many users.
3. **Callbacks → Promises → async/await:** callbacks nest ("callback hell"); a Promise represents a future value (`.then/.catch`); `async/await` is syntax over promises. Example: `await Rec.find({})` in `dataController.getDb`.
4. **`require` / `module.exports`:** CommonJS modules. Each file exports what others may use (`module.exports = router`).
5. **npm and package.json:** dependency manager; `dependencies` vs `devDependencies`; `scripts` (`npm start`, `npm run seed`); `package-lock.json` pins exact versions.
6. **`process.env` and dotenv:** configuration and secrets live in `.env`, never in code or Git (`config/env.js`).
7. **File system:** `fs.mkdirSync` creates the uploads folder (`uploadController.js`).
8. **Core modules used:** `path`, `fs`, `crypto` (HMAC-SHA256, randomBytes, SHA-256), `vm` (runs the escalation rules in `escalationService.js`).
9. **`setInterval` / `setTimeout`:** the escalation timer in `server.js` runs every 10 minutes.

## 4. Express.js
1. **What is Express?** A minimal web framework over Node's `http` module: routing + middleware.
2. **Middleware:** a function `(req, res, next)` that runs between request and response; it can change `req`/`res`, end the response, or call `next()`. Ours: `helmet`, `express.json`, `cors`, `auth`, `limiter`, `errorHandler`. Order matters — see `app.js`.
3. **Types of middleware:** application-level (`app.use`), router-level (`router.use`), built-in (`express.json`, `express.static`), third-party (`helmet`, `multer`), error-handling (4 arguments `(err, req, res, next)`).
4. **Routing:** `router.post('/login', limiter, c.login)` — method + path + chain of handlers. `express.Router()` groups routes (`routes/authRoutes.js`).
5. **req / res:** `req.body`, `req.params` (`/db/:key`), `req.query` (`?rev=3`), `req.headers`, `req.user` (set by our auth); `res.json()`, `res.status(201)`, `res.type('html').send()`.
6. **Status codes we use:** 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized (not signed in / wrong password), 403 Forbidden (signed in but not allowed), 404 Not Found, 409 Conflict (duplicate phone/email), 413 Payload Too Large, 429 Too Many Requests, 500 Server Error.
7. **Error handling:** controllers `throw new HttpError(status, message)`; `asyncHandler` forwards rejections to `next(err)`; `middleware/errorHandler.js` turns them into JSON — one place for all errors.
8. **`express.static`:** serves the frontend folder and `/uploads`.
9. **CORS:** browsers block cross-site API calls unless the server allows the origin; `middleware/cors.js` allows only our own site.
10. **REST:** resources + HTTP verbs. GET reads (`/api/db`), POST creates/actions (`/api/auth/register`), PUT replaces/updates (`/api/db/:key`).
11. **`trust proxy`:** behind Render's proxy, `req.ip` would be the proxy; the setting makes Express use the real visitor IP so rate-limiting works.

## 5. Authentication & security
1. **bcrypt:** one-way, salted, slow hash for passwords (`bcrypt.hash(pw, 10)`); login uses `bcrypt.compare`. We never store plain passwords.
2. **JWT:** a signed token `header.payload.signature` returned at login; the browser sends `Authorization: Bearer <token>`; `middleware/auth.js` verifies it with `JWT_SECRET` and sets `req.user`. Expires in 12 h. Stateless — no server session.
3. **Authentication vs authorization:** who you are (login/JWT) vs what you may do (`services/policy.js`: citizens only see their own records; MLA/MP/Mayor are view-only; officers cannot change users).
4. **Strong password rule:** `utils/security.js` — 10+ chars, upper+lower, digit, symbol.
5. **Aadhaar:** only a keyed HMAC-SHA256 hash (+ last 4 digits) is stored, so duplicates are blocked but the number can't be recovered. The "pepper" secret is in `.env`.
6. **Email verification & reset:** random token e-mailed; only its SHA-256 hash is stored in the `Token` collection with a TTL index (auto-deleted when expired); single use.
7. **Rate limiting & lockout:** 30 requests/min per IP; 5 wrong passwords lock the account 10 minutes (`middleware/rateLimit.js`).
8. **helmet:** sets secure HTTP headers. **Body size limits:** 50 KB on auth routes, 8 MB elsewhere.
9. **NoSQL/XSS awareness:** inputs are validated with regex before use; the server never builds queries from raw strings.

## 6. MongoDB & Mongoose
1. **MongoDB:** NoSQL document database; data stored as JSON-like documents in collections. **Atlas** = cloud-hosted MongoDB.
2. **Mongoose:** ODM — defines a Schema (shape, types, indexes) and Models (`Rec`, `Meta`, `Token`).
3. **CRUD in our code:** Create `Rec.create`, Read `Rec.find / findOne`, Update `Rec.updateOne({..},{$set:..},{upsert:true})`, Delete `Rec.deleteMany`.
4. **Indexes:** unique compound index `(coll, rid)` on `Rec` prevents duplicates and speeds lookups; TTL index on `Token.exp` auto-deletes expired rows.
5. **Atomic operators:** `$inc` for counters (`Meta` — application numbers can't collide when many users file at once), `$set`, `$setOnInsert` (seed never overwrites live data).
6. **`.lean()`:** returns plain JS objects instead of Mongoose documents — faster for reads.
7. **Design choice:** one document per record `{coll, rid, data}` — flexible schema for ~40 collections; trade-off: less strict validation than a dedicated schema per entity (honest answer: a normalised schema per entity, e.g. `User`, `Complaint`, is the next improvement).
8. **Populate** (course topic): references between documents; here complaints hold `citizenId` and the service looks the user up (`getUser`) — equivalent to a manual populate.

## 7. Other libraries
- **Multer** — multipart file uploads, 5 MB limit, only JPG/PNG/WEBP/PDF (`uploadController.js`).
- **Nodemailer** — sends e-mail through Gmail SMTP (`utils/mail.js`); test mode writes HTML files to `backend/outbox/`.
- **dotenv, helmet, jsonwebtoken, bcryptjs, mongoose, express** — see `backend/package.json`.

## 8. Deployment
Render runs `npm install` then `npm start` in `backend/`; secrets are Render environment variables; MongoDB Atlas allows Render's IPs (0.0.0.0/0); `PUBLIC_URL` is used in e-mail links; UptimeRobot pings `/api/health` to stop the free instance sleeping.

## 9. Flows to be able to explain on the whiteboard
1. **Register:** form → `POST /api/auth/register` → validate → uniqueness checks → bcrypt + Aadhaar hash → `Rec.create` → verification e-mail → JWT returned.
2. **File a grievance:** browser `PUT /api/db/complaints` → policy checks (own record, verified e-mail) → upsert → response → `notificationService` e-mails citizen + admin mailbox.
3. **Status change by officer:** same PUT → status differs from stored → e-mail "Update on grievance".
4. **Escalation:** `setInterval` → `escalationService.runOnce()` → load data → apply rules (SLA lapsed → next officer / DC / CMO) → save → e-mail citizen.
5. **Forgot password:** `POST /forgot-password` (same reply always) → e-mail link → `reset.html` → `POST /reset-password` with token + new strong password.

## 10. Likely "why" questions
- *Why JWT and not sessions?* Stateless; works with any number of servers and the deployed frontend.
- *Why hash Aadhaar with a pepper?* Plain hash of a 12-digit number is brute-forceable; the secret key makes it infeasible without the server's key.
- *Why 401 vs 403?* 401 = not authenticated; 403 = authenticated but not permitted.
- *Why `async/await`?* Cleaner than nested callbacks; errors handled with one try/catch (here `asyncHandler`).
- *What happens if the DB is down?* `mongoose.connect` fails → process exits with a message; at runtime errors become a 500 JSON response.
- *What would you improve?* Per-entity schemas, move business rules fully server-side, tests (Jest/Supertest), cloud file storage, SMS.
