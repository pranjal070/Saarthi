const mail = require('../utils/mail'), { getUser } = require('./recordService');
/* After complaints are saved: e-mail the citizen (and the admin mailbox) about new grievances and status changes. */
module.exports.notifyComplaints = async (upserts, before) => {
  for (const { rid, data: c } of upserts) {
    const old = before.get(String(rid)); if (!c || !c.citizenId) continue;
    const isNew = !old, changed = old && old.status !== c.status; if (!isNew && !changed) continue;
    const r = await getUser(c.citizenId); if (!r || !r.data.email) continue;
    const last = (c.timeline || [])[(c.timeline || []).length - 1];
    if (isNew) { mail.complaintRegistered(r.data, c); mail.adminNewComplaint(r.data, c); } else mail.complaintUpdated(r.data, c, last && last.note);
  }
};
