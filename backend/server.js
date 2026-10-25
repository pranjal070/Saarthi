/* Saarthi API entry point: load config → connect MongoDB → start HTTP server + escalation timer.
   Architecture (MVC):  routes/ → controllers/ → services/ → models/ (MongoDB),   View = ../frontend */
const config = require('./config/env');
const mongoose = require('mongoose'), app = require('./app'), revision = require('./services/revisionService'), escalation = require('./services/escalationService');
mongoose.connect(config.MONGO_URI).then(async () => {
  await revision.load();
  app.listen(config.PORT, () => console.log(`Saarthi running → http://localhost:${config.PORT}`));
  const tick = () => escalation.runOnce().catch(e => console.error('[escalation]', e.message));
  setTimeout(tick, 30000); setInterval(tick, config.ESCALATION_MS);
}).catch(e => { console.error('MongoDB connection failed:', e.message); process.exit(1); });
