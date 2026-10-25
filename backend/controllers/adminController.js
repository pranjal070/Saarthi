const asyncHandler = require('../utils/asyncHandler'), escalation = require('../services/escalationService'), revision = require('../services/revisionService');
/* POST /api/admin/run-escalations — supreme admin can run the SLA check on demand */
exports.runEscalations = asyncHandler(async (req, res) => res.json({ ok: true, ...(await escalation.runOnce()) }));
/* GET /api/health — used by uptime monitors */
exports.health = (req, res) => res.json({ ok: true, rev: revision.get() });
