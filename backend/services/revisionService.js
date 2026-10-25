const Meta = require('../models/Meta');
/* A global "data revision" number: browsers poll it and download data only when it has changed. */
let rev = 0;
module.exports = {
  get: () => rev,
  load: async () => { const m = await Meta.findOne({ name: 'rev' }); rev = m ? m.n : 0; },
  bump: async () => { const m = await Meta.findOneAndUpdate({ name: 'rev' }, { $inc: { n: 1 } }, { upsert: true, new: true }); rev = m.n; }
};
