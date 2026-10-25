# v42 — Parv's UI + all v41 features + responsive dashboards

Only `frontend/` changed. `backend/` is byte-for-byte the v41 backend.

## What changed
- **UI is Parv's**: his `style.css` (light theme, blue sidebar, orange/green accents, dark-mode support), SAARTHII logo + top navigation,
  Ashoka-emblem login/sign-up panels with "Login as a …" titles, hero typing animation, "Track your grievance" card,
  trust strip, department cards with photos, numbered "How your file moves" steps, blue chart palette.
- **All v41 features kept**: server-backed `api.js`, strong-password sign-up with email + Aadhaar (Verhoeff), forgot/reset password,
  email-verification banner, `?track=` prefill, MP / MLA / Mayor / Minister roles, 33 departments, Leaflet live map,
  employees & transfers, districts / tehsils / councils, hierarchy rules, credential management, trilingual EN / ਪੰ / हि.
- `css/compat.css` (new): styles for v41-only pieces that Parv's stylesheet had no rules for, plus all responsive rules.
- `css/console.css` (v41 dark console theme) is no longer loaded — replaced by Parv's theme.
- Theme key stays `saarthi_theme_v3`; default is now **light** (Parv's default); the toggle switches to dark.

## Mobile fix (officer + citizen dashboards, and every other table)
- Phones (≤700 px): every table row becomes a card — application no., complaint, status, SLA and action are all visible, no sideways scrolling.
- Tablets (701–900 px): tables scroll sideways inside their own box (with a hint); first column stays pinned.
- Side menu becomes a swipeable top strip on small screens; headers/forms/tabs reflow; no page-level horizontal overflow on any screen.
- Implemented once in `js/app.js` (auto-wraps every `table.tbl`), so it also covers admin/authority tables.

## Not carried over from Parv's files (and why)
- His `data.js` / `app.js` / `demo-seed.js` / `notify.js`: they keep data in the browser (localStorage). v41 keeps data in MongoDB through the API,
  and escalation runs on the server. Nothing was lost — those features exist in v41's versions.
- Web3Forms admin-email call: replaced by the real backend email (Brevo) to the admin inbox.
- Old "Rajpura-only" wording: v41's Punjab-wide wording is kept.

## Department photos (added after the first v42 build)
- All 33 home-page department cards use real photos from `frontend/assets/dept/<id>.jpg` (800×400). Only *Municipal Council* still points at the online photo from Parv's design until a local one is added.
- Admin → Manage departments → "Add a new department" now has a **Department photo** field. The photo is cropped/resized in the browser and stored inside the department record in MongoDB, so it survives Render redeploys; the new card appears on the home page immediately. Admins can also add/change the photo later with the 🖼️ button on each department they created.
- Order used for each card: the department's own photo → `assets/dept/<id>.jpg` → illustrated banner `assets/dept/<id>.svg` → default banner.
