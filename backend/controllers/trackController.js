const Rec = require('../models/Rec'), HttpError = require('../utils/HttpError'), asyncHandler = require('../utils/asyncHandler');
/* POST /api/track — public tracking: the registered mobile number must match the application */
exports.track = asyncHandler(async (req, res) => {
  const { appNo, phone } = req.body || {};
  const r = await Rec.findOne({ coll: 'complaints', rid: String(appNo) }).lean();
  if (!r) throw new HttpError(404, 'No grievance found.');
  if (r.data.phone !== phone) throw new HttpError(403, 'Mobile number does not match our records for this application. Please check and try again.');
  res.json({ ok: true, complaint: r.data });
});
