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

   EXCEPTION — real admin email via Web3Forms:
   Web3Forms's Access Key is a *public* key by design (safe to ship
   in frontend code, like a reCAPTCHA site key) — unlike SMTP/API
   secrets, it can't be used to read your inbox or send as you, only
   to relay a submission to the inbox it's tied to. That's why this
   one email (new-complaint → admin) can be wired for real, while
   citizen/officer notifications above stay simulated pending a
   backend.
   Get a key: sign in at https://web3forms.com with the admin inbox
   (sarthiadmin@gmail.com), copy the Access Key it gives you, and
   paste it below in place of 'YOUR_WEB3FORMS_ACCESS_KEY'.
   ============================================================ */
const WEB3FORMS_ACCESS_KEY = '4e06c630-eb71-474c-b82d-d276cae22f06';

async function notifyAdminOfComplaint(complaint){
  if (WEB3FORMS_ACCESS_KEY === 'YOUR_WEB3FORMS_ACCESS_KEY') {
    console.warn('Saarthi: set WEB3FORMS_ACCESS_KEY in js/notify.js to email the admin on new complaints.');
    return { sent: false, reason: 'no_access_key' };
  }
  const deptName = complaint.dept === 'mc-office' ? 'Municipal Councillor Office' : (typeof deptById === 'function' && deptById(complaint.dept) ? deptById(complaint.dept).name : complaint.dept);
  const body = {
    access_key: WEB3FORMS_ACCESS_KEY,
    subject: `Saarthi: New grievance ${complaint.appNo} filed — ${deptName}`,
    from_name: 'Saarthi Portal',
    'Application No': complaint.appNo,
    'Department': deptName,
    'Citizen': complaint.name,
    'Phone': complaint.phone,
    'Ward': complaint.ward,
    'Subject': complaint.subject,
    'Description': complaint.description,
    'Address': complaint.address || 'Not provided',
    'Filed at': new Date(complaint.createdAt).toLocaleString('en-IN')
  };
  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return { sent: !!data.success, reason: data.message };
  } catch (err) {
    console.error('Saarthi: admin email failed to send.', err);
    return { sent: false, reason: 'network_error' };
  }
}

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
