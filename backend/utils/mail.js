/* Email sender (Nodemailer). With no MAIL_HOST set it runs in TEST MODE: messages are printed
   and saved in server/outbox/ so the whole flow can be tried before the real mailbox is connected. */
const nodemailer = require('nodemailer'), fs = require('fs'), path = require('path');
const { MAIL_HOST, MAIL_PORT = 465, MAIL_USER, MAIL_PASS, MAIL_FROM } = process.env;
const BREVO_KEY = process.env.BREVO_API_KEY;                                  // HTTPS e-mail API (works on hosts that block SMTP ports, e.g. Render free plan)
const smtp = !!(MAIL_HOST && MAIL_USER && MAIL_PASS), live = !!BREVO_KEY || smtp;
const tx = smtp && !BREVO_KEY ? nodemailer.createTransport({ host: MAIL_HOST, port: Number(MAIL_PORT), secure: Number(MAIL_PORT) === 465, auth: { user: MAIL_USER, pass: MAIL_PASS } }) : null;
const OUT = path.join(__dirname, '..', 'outbox'); if (!live) fs.mkdirSync(OUT, { recursive: true });
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function layout(title, bodyHtml, cta) {
  return `<div style="font-family:Segoe UI,Arial,sans-serif;background:#f4f5f7;padding:24px"><div style="max-width:560px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
  <div style="background:#f97316;color:#fff;padding:16px 22px"><b style="font-size:18px">Saarthi</b> <span style="opacity:.9;font-size:12px">· Civic Grievance Portal · Govt. of Punjab</span></div>
  <div style="padding:22px;color:#1f2937;font-size:14px;line-height:1.55"><h2 style="margin:0 0 12px;font-size:18px">${esc(title)}</h2>${bodyHtml}
  ${cta ? `<p style="margin:22px 0"><a href="${esc(cta.url)}" style="background:#f97316;color:#fff;text-decoration:none;padding:11px 20px;border-radius:8px;font-weight:600;display:inline-block">${esc(cta.label)}</a></p><p style="font-size:12px;color:#6b7280">If the button does not work, copy this link:<br>${esc(cta.url)}</p>` : ''}
  </div><div style="padding:12px 22px;background:#f9fafb;color:#6b7280;font-size:11px">This is an automated message from Saarthi. Please do not share it. If you did not expect it, you can ignore it.</div></div></div>`;
}
async function send(to, subject, html, text, attempt = 1) {
  if (!to) return { skipped: true };
  const msg = { from: MAIL_FROM || MAIL_USER || 'Saarthi <no-reply@saarthi.local>', to, subject, html, text };
  if (!live) { const f = path.join(OUT, `${Date.now()}-${to.replace(/[^\w.@-]/g, '_')}.html`); fs.writeFileSync(f, `<!-- To: ${to}\nSubject: ${subject} -->\n${html}`); console.log(`[mail:test] to ${to} — ${subject}`); return { test: true }; }
  try {
    if (BREVO_KEY) {                                                              // Brevo transactional e-mail API over HTTPS (port 443)
      const m = String(msg.from).match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/), sender = m ? { name: m[1].trim() || 'Saarthi', email: m[2] } : { name: 'Saarthi', email: String(msg.from) };
      const r = await fetch('https://api.brevo.com/v3/smtp/email', { method: 'POST', headers: { 'api-key': BREVO_KEY, 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify({ sender, to: [{ email: to }], subject, htmlContent: html, textContent: text }) });
      if (!r.ok) throw new Error('Brevo ' + r.status + ' ' + (await r.text()).slice(0, 200));
      return { sent: true };
    }
    await tx.sendMail(msg); return { sent: true };
  }
  catch (e) { if (attempt < 3) { await new Promise(r => setTimeout(r, 2000 * attempt)); return send(to, subject, html, text, attempt + 1); } console.error('[mail] failed for', to, e.message); return { failed: true }; }
}
const fire = (...a) => { send(...a).catch(e => console.error('[mail]', e.message)); };       // never blocks a request

const base = () => (process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 3000}`).replace(/\/$/, '');
const trackUrl = appNo => `${base()}/index.html?track=${encodeURIComponent(appNo)}#track`;
const adminTo = () => process.env.ADMIN_NOTIFY_EMAIL || MAIL_USER || '';
const row = (k, v) => `<tr><td style="padding:3px 14px 3px 0;color:#6b7280">${k}</td><td>${esc(v)}</td></tr>`;
module.exports = {
  live, base,
  adminNewUser: u => fire(adminTo(), `New registration — ${u.name}`, layout('New citizen registered', `<table style="font-size:14px;border-collapse:collapse">${row('Name', u.name)}${row('Mobile', u.phone)}${row('Email', u.email)}${row('Council / ward', (u.ulb || '') + ' / ' + (u.ward || ''))}${row('District', u.district || '')}</table>`), `New citizen: ${u.name}, ${u.phone}`),
  adminNewComplaint: (u, c) => fire(adminTo(), `New grievance ${c.appNo} — ${c.subject}`, layout('New grievance filed', `<table style="font-size:14px;border-collapse:collapse">${row('Application no.', c.appNo)}${row('Subject', c.subject)}${row('Department', c.dept)}${row('Status', c.status)}${row('Citizen', u.name + ' · ' + u.phone)}</table>`, { url: trackUrl(c.appNo), label: 'Open tracking page' }), `New grievance ${c.appNo}: ${c.subject}`),
  verifyEmail: (u, raw) => fire(u.email, 'Welcome to Saarthi — please verify your email', ...(() => { const url = `${base()}/api/auth/verify-email?token=${raw}`; return [layout('Welcome to Saarthi, ' + u.name.split(' ')[0] + '!', `<p>Thank you for registering on Saarthi, the civic grievance portal of the Govt. of Punjab. With your account you can file grievances, track them live, and get an email at every step.</p><p>One last step: confirm this email address to activate your account. The link works for 24 hours.</p>`, { url, label: 'Verify my email' }), `Welcome to Saarthi! Verify your email: ${url}`]; })()),
  welcome: u => fire(u.email, 'Welcome to Saarthi', layout('Welcome, ' + u.name.split(' ')[0] + '!', `<p>Your email is verified and your account is active. You can now file grievances, track them live, and receive an email at every step.</p>`, { url: `${base()}/login.html`, label: 'Sign in' }), 'Your Saarthi account is active.'),
  resetPassword: (u, raw) => fire(u.email, 'Reset your Saarthi password', ...(() => { const url = `${base()}/reset.html?token=${raw}`; return [layout('Reset your password', `<p>Hello ${esc(u.name)},</p><p>We received a request to reset your password. The link works once and expires in 30 minutes. If you did not ask for this, ignore this email — your password stays unchanged.</p>`, { url, label: 'Choose a new password' }), `Reset your password: ${url}`]; })()),
  passwordChanged: u => fire(u.email, 'Your Saarthi password was changed', layout('Password changed', `<p>Hello ${esc(u.name)}, your password was just changed. If this was not you, reset it immediately and contact the helpline 1100.</p>`), 'Your password was changed.'),
  complaintRegistered: (u, c) => fire(u.email, `Grievance registered — ${c.appNo}`, ...(() => { const url = trackUrl(c.appNo); return [layout('Your grievance is registered', `<p>Hello ${esc(u.name)}, your grievance has been received and routed to the concerned department.</p><table style="font-size:14px;border-collapse:collapse"><tr><td style="padding:3px 14px 3px 0;color:#6b7280">Application no.</td><td><b>${esc(c.appNo)}</b></td></tr><tr><td style="padding:3px 14px 3px 0;color:#6b7280">Subject</td><td>${esc(c.subject)}</td></tr><tr><td style="padding:3px 14px 3px 0;color:#6b7280">Status</td><td>${esc(c.status)}</td></tr></table><p>It must be resolved within the department's SLA, or it escalates automatically. To track it you will be asked for your registered mobile number.</p>`, { url, label: 'Track my grievance' }), `Grievance ${c.appNo} registered. Track: ${url}`]; })()),
  complaintEscalated: (u, c, note) => fire(u.email, `Grievance ${c.appNo} escalated to a senior officer`, ...(() => { const url = trackUrl(c.appNo); return [layout('Your grievance has been escalated', `<p>Hello ${esc(u.name)}, the resolution window for your grievance <b>${esc(c.appNo)}</b> (${esc(c.subject)}) lapsed, so it was automatically moved to a more senior officer.</p><p style="background:#fff7ed;border-left:4px solid #f97316;padding:10px 12px">${esc(note || '')}</p>`, { url, label: 'View full history' }), `Grievance ${c.appNo} was escalated. Track: ${url}`]; })()),
  complaintUpdated: (u, c, note) => fire(u.email, `Update on grievance ${c.appNo}: ${c.status}`, ...(() => { const url = trackUrl(c.appNo); return [layout('Your grievance has an update', `<p>Hello ${esc(u.name)}, there is a new status on your grievance <b>${esc(c.appNo)}</b> (${esc(c.subject)}).</p><p style="background:#fff7ed;border-left:4px solid #f97316;padding:10px 12px"><b>${esc(c.status)}</b>${note ? `<br>${esc(note)}` : ''}</p>`, { url, label: 'View full history' }), `Grievance ${c.appNo} is now: ${c.status}. Track: ${url}`]; })())
};
