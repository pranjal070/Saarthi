# Saarthi API reference

Base URL: `http://localhost:3000/api` (local) or `https://<your-service>.onrender.com/api` (deployed). All bodies are JSON. Protected routes need the header `Authorization: Bearer <token>` (the token comes from login).

## Auth — `/api/auth`
| Method | Path | Auth | Purpose | Main responses |
|---|---|---|---|---|
| POST | `/auth/login` | none | Sign in. Body `kind` = `citizen` / `officer` / `mc` / `authority` plus credentials | 200 token + session, 401 wrong password, 403 blocked, 404 no account, 429 locked |
| POST | `/auth/register` | none | Create a citizen account (strong password, valid Aadhaar, unique phone/e-mail/Aadhaar) | 201, 400 validation, 409 duplicate |
| GET | `/auth/verify-email?token=` | none | Open from the e-mail link; activates the account | HTML page |
| POST | `/auth/resend-verification` | citizen | Send the verification e-mail again | 200 |
| POST | `/auth/forgot-password` | none | Body `phone`, `email`; always the same reply | 200 |
| POST | `/auth/reset-password` | none | Body `token`, `password` (strong); single use, 30 min | 200, 400 |
| POST | `/auth/change-password` | admin accounts | Body `current`, `next` | 200, 401 |

## Data — `/api`
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/db` | optional | Everything the caller may see. `?rev=N` returns `{same:true}` when nothing changed |
| PUT | `/db/:key` | yes | Write changed records of one collection: `{upserts:[{rid,data}], deletes:[rid]}` or `{value}` / `{replace:[…]}` |
| POST | `/seq/:name` | yes | Atomic counter (application numbers, roll IDs) → `{n}` |
| POST | `/track` | none | Public tracking: body `appNo`, `phone` (must match) |
| POST | `/upload` | yes | Multipart field `file` (JPG/PNG/WEBP/PDF, max 5 MB) → `{url}` |

## Admin and system
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/admin/run-escalations` | supreme admin | Run the SLA escalation check now |
| GET | `/health` | none | `{ok:true, rev}` for uptime monitors |

## Status codes used
200 OK · 201 Created · 400 Bad Request · 401 Unauthorized · 403 Forbidden · 404 Not Found · 409 Conflict · 413 Payload Too Large · 429 Too Many Requests · 500 Server Error. Errors look like `{ "ok": false, "error": "message", "field": "phone" }`.

## Access rules (see `backend/services/policy.js`)
- Citizens see and change only their own records; they cannot edit server-owned fields (password, e-mail, phone, Aadhaar hash, verified flag).
- MLA, MP and Mayor accounts are view-only.
- Officers cannot write `authorities`, `ministries` or `users`.
- Passwords and the Aadhaar hash are never returned to the browser.
