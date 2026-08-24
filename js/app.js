/* ============================================================
   SAARTHI · app.js — shared utilities
   Syllabus: functions, arrow functions, higher-order functions,
   template literals, destructuring, dates, DOM (T7–24)
   ============================================================ */

// ---------- Session (sessionStorage — clears when tab closes) ----------
const Session = {
  login: user => sessionStorage.setItem('saarthi_session', JSON.stringify(user)),
  current: () => JSON.parse(sessionStorage.getItem('saarthi_session')),
  // location.replace() (not location.href) is deliberate here: it REPLACES the
  // dashboard's browser-history entry instead of adding a new one on top of it.
  // That's what makes the dashboard genuinely unreachable via the Back button
  // after signing out — not just re-checked-and-redirected, but gone from history.
  logout(){ sessionStorage.removeItem('saarthi_session'); location.replace('login.html'); },
  guard(role){ // protect dashboard pages
    const u = Session.current();
    if (!u || u.role !== role) { location.replace('login.html'); return null; }
    return u;
  }
};

// ---------- Application number: YY + DeptCode + 6-digit sequence ----------
const genAppNo = deptCode => {
  const yy = String(new Date().getFullYear()).slice(2);
  return yy + deptCode + String(DB.seq()).padStart(6, '0');
};

// ---------- Dates & SLA ----------
const fmt = ts => new Date(ts).toLocaleString('en-IN',
  { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });

// hoursLeft() reflects the SLA clock for wherever the file CURRENTLY sits in the
// hierarchy (levelStartedAt resets every time it moves — auto-escalation or a manual
// forward). Older complaints filed before this field existed fall back to createdAt.
const hoursLeft = c => deptSlaHours(c.dept) - (Date.now() - (c.levelStartedAt || c.createdAt)) / 36e5;

const slaTag = c => {
  if ([STATUS.RESOLVED, STATUS.CLOSED].includes(c.status))
    return `<span class="sla ok">✔ Within record</span>`;
  const h = hoursLeft(c);
  if (h <= 0)  return `<span class="sla over">⏱ SLA breached</span>`;
  if (h <= 12) return `<span class="sla warn">⏱ ${Math.floor(h)}h left</span>`;
  return `<span class="sla ok">⏱ ${Math.floor(h)}h left</span>`;
};

// ---------- Auto-escalation engine ----------
// Runs on every page load. When a file breaches its SLA at its current level:
//   department front-line officer → next-senior officer in the same department
//     → (hierarchy exhausted) → Deputy Commissioner
//       → (DC also breaches)  → Chief Minister's Office, Punjab (top of the chain)
// A CMO-flagged urgent referral that breaches its own SLA can also suspend the
// officer who failed to act, if the CMO opted into that when referring the file.
function runEscalations(){
  const list = DB.get('complaints');
  const officers = DB.get('officers');
  let changed = false, officersChanged = false;

  // Migration: complaints filed before the hierarchy system existed have no
  // currentOfficerId/level yet — assign them to their department's front-line
  // officer so they don't silently disappear from every officer's queue.
  list.forEach(c => {
    if (c.currentOfficerId === undefined && c.dept !== 'mc-office') {
      const fl = frontLineOfficer(c.dept);
      c.currentOfficerId = fl ? fl.id : null;
      c.level = fl ? fl.rank : null;
      c.levelStartedAt = c.levelStartedAt || c.createdAt;
      c.escalatedToDC = !!c.escalatedToDC; c.escalatedToCMO = !!c.escalatedToCMO;
      c.urgentFromCMO = !!c.urgentFromCMO; c.cmoAutoBan = !!c.cmoAutoBan; c.forceClosed = !!c.forceClosed;
      changed = true;
    } else if (c.currentOfficerId === undefined) {
      c.levelStartedAt = c.levelStartedAt || c.createdAt;
      c.escalatedToDC = !!c.escalatedToDC; c.escalatedToCMO = !!c.escalatedToCMO;
      c.urgentFromCMO = !!c.urgentFromCMO; c.cmoAutoBan = !!c.cmoAutoBan; c.forceClosed = !!c.forceClosed;
      changed = true;
    }
  });

  list.forEach(c => {
    const live = ![STATUS.RESOLVED, STATUS.CLOSED].includes(c.status);
    if (!live || hoursLeft(c) > 0) return;

    // Officer failed to act on a CMO-flagged urgent file with auto-ban enabled.
    if (c.urgentFromCMO && c.cmoAutoBan && typeof c.level === 'number') {
      const off = officerById(c.currentOfficerId);
      if (off && !off.blocked) {
        off.blocked = true; off.blockedByCMO = true; officersChanged = true;
        c.timeline.push({
          status: 'Escalated',
          note: `${off.name} (${off.designation}) failed to act on a CMO-flagged urgent grievance within the required window. Account suspended — only the CMO Punjab or System Administrator can restore access.`,
          by: 'Saarthi System', at: Date.now()
        });
      }
    }

    if (typeof c.level === 'number') {
      const senior = seniorTierOfficers(c.dept, c.level);
      if (senior.length) {
        const target = senior[0]; // automatic breach-escalation picks the first; manual forwarding lets the officer choose among peers
        c.currentOfficerId = target.id; c.level = target.rank; c.levelStartedAt = Date.now(); c.escalated = true;
        c.timeline.push({
          status: 'Escalated',
          note: `${deptSlaHours(c.dept)}-hour resolution window lapsed. Grievance auto-escalated to ${target.name} (${target.designation}).`,
          by: 'Saarthi System', at: Date.now()
        });
      } else {
        c.escalatedToDC = true; c.level = 'dc'; c.levelStartedAt = Date.now(); c.escalated = true;
        c.timeline.push({
          status: 'Escalated',
          note: `Departmental hierarchy exhausted without resolution. Grievance escalated to the Deputy Commissioner, Patiala.`,
          by: 'Saarthi System', at: Date.now()
        });
        systemAlert('dc', `Grievance ${c.appNo} has escalated to your desk — departmental hierarchy exhausted.`, c.appNo);
      }
      changed = true;
    } else if (c.level === 'dc') {
      c.escalatedToCMO = true; c.level = 'cmo'; c.levelStartedAt = Date.now(); c.escalated = true;
      c.timeline.push({
        status: 'Escalated',
        note: `Continued delay at the Deputy Commissioner's level. Grievance escalated to the Chief Minister's Office, Punjab.`,
        by: 'Saarthi System', at: Date.now()
      });
      systemAlert('dc', `Grievance ${c.appNo} has escalated past your desk to CMO Punjab due to continued delay.`, c.appNo);
      changed = true;
    } else if (c.level === 'cmo' && !c.escalated) {
      c.escalated = true; changed = true; // already at the top of the chain — just flag it
    }
  });

  if (changed) DB.set('complaints', list);
  if (officersChanged) DB.set('officers', officers);
}

// ---------- Status badge ----------
const STATUS_KEY = {
  [STATUS.SUBMITTED]:'st_Submitted', [STATUS.RECEIVED]:'st_Received', [STATUS.REVIEW]:'st_Review',
  [STATUS.ASSIGNED]:'st_Assigned', [STATUS.PROGRESS]:'st_Progress', [STATUS.RESOLVED]:'st_Resolved',
  [STATUS.CLOSED]:'st_Closed', [STATUS.REOPENED]:'st_Reopened'
};
const trStatus = s => (typeof t === 'function' ? t(STATUS_KEY[s] || s) : s);
const badge = c => {
  const map = {
    [STATUS.SUBMITTED]:'b-sub', [STATUS.RECEIVED]:'b-rec', [STATUS.REVIEW]:'b-rev',
    [STATUS.ASSIGNED]:'b-asg', [STATUS.PROGRESS]:'b-prog', [STATUS.RESOLVED]:'b-res',
    [STATUS.CLOSED]:'b-cls', [STATUS.REOPENED]:'b-reo'
  };
  return `<span class="badge ${map[c.status] || 'b-sub'}">${trStatus(c.status)}</span>`
       + (c.escalated && ![STATUS.RESOLVED, STATUS.CLOSED].includes(c.status)
          ? ` <span class="badge b-esc">${typeof t === 'function' ? t('st_Escalated') : 'Escalated'}</span>` : '');
};

// ---------- Timeline ledger (signature UI element) ----------
const ledgerHTML = c => c.timeline.map((e, i) => `
  <div class="entry ${i === c.timeline.length - 1 ? 'last' : ''}">
    <b>${e.status}</b>
    <div class="note">${e.note}</div>
    <div class="meta">${e.by} · ${fmt(e.at)}</div>
  </div>`).join('');

// ---------- Toast ----------
function toast(msg, type = 'ok'){
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
  t.textContent = msg; t.className = `show ${type}`;
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ---------- Shared chrome ----------
function govStrip(){
  return `<div class="govstrip"><div class="wrap">
    <span><span class="pa">ਸੇਵਾ · ਪਾਰਦਰਸ਼ਤਾ · ਜਵਾਬਦੇਹੀ</span> | Civic Grievance Portal - Govt. of Punjab</span>
    <span class="gov-top-links">
      <a href="#departments">Departments</a>
      <a href="directory.html">Grievance Map</a>
      <a href="login.html?role=officer">Officer Desk</a>
    </span>
  </div></div><div class="phulkari"></div>`;
}

// ---------- Site maintenance kill-switch (Admin-controlled) ----------
function getMaintenance(){
  return JSON.parse(localStorage.getItem('saarthi_maintenance')) || { enabled:false, reopenAt:null, message:'' };
}
function setMaintenance(m){ localStorage.setItem('saarthi_maintenance', JSON.stringify(m)); }
// Returns true if the site should currently be shown as closed. Auto-clears the flag
// on its own once the scheduled reopen time has passed — no admin action needed then.
function maintenanceActive(){
  const m = getMaintenance();
  if (!m.enabled) return false;
  if (m.reopenAt && Date.now() >= m.reopenAt) { setMaintenance({ enabled:false, reopenAt:null, message:'' }); return false; }
  return true;
}
// Call this at the very top of any citizen/officer/MC-facing page's script. Admin's own
// sign-in and dashboard are never gated, so Admin can always get back in to reopen it.
function maintenanceGate(){
  if (maintenanceActive()) { location.replace('maintenance.html'); return true; }
  return false;
}

// ---------- Custom confirm dialog (replaces the browser's native confirm()) ----------
function confirmDialog({ icon = '⚠️', title, message, okLabel = 'Continue', cancelLabel = 'Cancel', danger = false }){
  return new Promise(resolve => {
    let bg = document.getElementById('confirmBg');
    if (!bg) {
      bg = document.createElement('div');
      bg.id = 'confirmBg'; bg.className = 'confirm-bg';
      bg.innerHTML = `<div class="confirm-box">
        <div class="ci" id="cfIcon"></div>
        <div class="cbody">
          <h4 id="cfTitle"></h4>
          <p id="cfMsg"></p>
          <div class="cactions">
            <button class="btn btn-outline" id="cfCancel"></button>
            <button class="btn btn-pine" id="cfOk"></button>
          </div>
        </div></div>`;
      document.body.appendChild(bg);
    }
    bg.querySelector('#cfIcon').textContent = icon;
    bg.querySelector('#cfTitle').textContent = title;
    bg.querySelector('#cfMsg').textContent = message;
    const okBtn = bg.querySelector('#cfOk'), cancelBtn = bg.querySelector('#cfCancel');
    okBtn.textContent = okLabel; cancelBtn.textContent = cancelLabel;
    okBtn.className = danger ? 'btn btn-danger' : 'btn btn-pine';
    bg.classList.add('open');
    const cleanup = result => { bg.classList.remove('open'); okBtn.onclick = null; cancelBtn.onclick = null; resolve(result); };
    okBtn.onclick = () => cleanup(true);
    cancelBtn.onclick = () => cleanup(false);
    bg.onclick = e => { if (e.target === bg) cleanup(false); };
  });
}

// ---------- Leave-to-home confirmation (ends the session) ----------
async function goHome(){
  const ok = await confirmDialog({
    icon: '🏠', title: 'Return to portal home?',
    message: 'This will end your current session. You will need to sign in again to access your dashboard.',
    okLabel: 'Yes, go to home', cancelLabel: 'Stay here'
  });
  if (ok) { sessionStorage.removeItem('saarthi_session'); location.replace('index.html'); }
}

// ---------- Sign-out confirmation ----------
async function confirmSignOut(){
  const ok = await confirmDialog({
    icon: '↩️', title: 'Sign out of Saarthi?',
    message: 'You will need to enter your credentials again the next time you sign in.',
    okLabel: 'Sign out', cancelLabel: 'Cancel', danger: true
  });
  if (ok) Session.logout();
}
function setInvalid(input, message){
  const field = input.closest('.field');
  field.classList.add('invalid');
  field.querySelector('.err').textContent = message;
}
function clearInvalid(form){
  form.querySelectorAll('.field.invalid').forEach(f => f.classList.remove('invalid'));
}
