# Saarthi architecture

## Pattern: MVC
| Layer | Folder | Responsibility |
|---|---|---|
| Model | `backend/models` | Mongoose schemas: `Rec` (every record), `Meta` (counters, revision), `Token` (e-mail links with TTL) |
| View | `frontend/` | HTML, CSS and JavaScript pages; `js/api.js` calls the API |
| Controller | `backend/controllers` | Validate the request, call services/models, return JSON |
| Routes | `backend/routes` | Map URL + HTTP method to a controller |
| Middleware | `backend/middleware` | JWT auth, rate limit and lockout, CORS, error handler |
| Services | `backend/services` | Business logic: access policy, e-mail notifications, escalation, revision counter |
| Utils | `backend/utils` | `HttpError`, `asyncHandler`, security helpers, mailer |

## Request flow
`Browser → Express (helmet, body parser, CORS, auth) → routes → controller → service → Mongoose model → MongoDB Atlas`, then a JSON response. Any thrown error ends in `middleware/errorHandler.js`.

## Data model
Every record is a document `{ coll, rid, data }` with a unique index on `(coll, rid)`. `coll` is the collection name (users, complaints, officers…), `rid` the record id and `data` the record. This keeps ~40 kinds of data in one flexible schema and makes concurrent writes safe through upserts. Trade-off: less strict validation than one schema per entity.

## Security measures
bcrypt password hashing · JWT (12 h) · strong-password rule · Aadhaar stored only as an HMAC-SHA256 hash plus last 4 digits · single-use hashed e-mail tokens with TTL · per-IP rate limit and 5-wrong-password lockout · helmet headers · CORS allow-list · request size limits · role-based access policy.

## Background work
`backend/services/escalationService.js` runs every 10 minutes: when a grievance misses its SLA it moves to the next officer, then the Deputy Commissioner, then the CMO, and the citizen is e-mailed.

## E-mail
Nodemailer through Gmail SMTP. Messages: welcome and verify, verified, grievance registered, every status change, escalation, password reset and changed, plus alerts to the admin mailbox. With `MAIL_HOST` empty the app saves e-mails as HTML in `backend/outbox/` (test mode).
