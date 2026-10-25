const mongoose = require('mongoose');
/* One document per record: { coll: 'complaints', rid: '2601000001', data: {...} }.
   A unique index on (coll, rid) makes upserts safe when many users write at once. */
const schema = new mongoose.Schema({ coll: { type: String, index: true }, rid: String, data: mongoose.Schema.Types.Mixed }, { minimize: false });
schema.index({ coll: 1, rid: 1 }, { unique: true });
module.exports = mongoose.model('Rec', schema);
