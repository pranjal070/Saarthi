/* ============================================================
   SAARTHI · notify.js
   Simulated email + SMS notifications.
   NOTE (honest limitation): this is a client-side prototype with
   no backend, so real email/SMS cannot be sent safely from here —
   doing so would mean exposing Gmail/Twilio API keys in the
   browser. Instead, every "send" is logged as a real record the
   citizen and admin can see, with the exact message that would go
   out. Wiring in Nodemailer (email) and Twilio (SMS) on the
   Express backend in the MERN build is a drop-in replacement for
   this file's sendNotification() function — same call signature.
   ============================================================ */

function notifySettings(){
  return JSON.parse(localStorage.getItem('saarthi_notify')) || { enabled: true };
}
function setNotifySettings(s){ localStorage.setItem('saarthi_notify', JSON.stringify(s)); }

function sendNotification(citizen, subject, message){
  const settings = notifySettings();
  const log = DB.get('notifications');
  const entry = {
    id: 'N' + Date.now() + Math.floor(Math.random()*999),
    citizenId: citizen.id, citizenName: citizen.name,
    email: citizen.email || null, phone: citizen.phone,
    subject, message, at: Date.now(),
    sent: settings.enabled
  };
  log.push(entry);
  DB.set('notifications', log);
  return entry;
}

// Convenience wrappers used across pages
function notifyFiled(citizen, complaint){
  const subj = `Saarthi: Grievance ${complaint.appNo} registered`;
  const msg = `Dear ${citizen.name}, your grievance "${complaint.subject}" has been registered. Application No: ${complaint.appNo}. We will notify you as the status changes.`;
  return sendNotification(citizen, subj, msg);
}
function notifyStatus(citizen, complaint, newStatus){
  const subj = `Saarthi: Grievance ${complaint.appNo} — ${newStatus}`;
  const msg = `Dear ${citizen.name}, your grievance ${complaint.appNo} ("${complaint.subject}") is now: ${newStatus}.`;
  return sendNotification(citizen, subj, msg);
}
