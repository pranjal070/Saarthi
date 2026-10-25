const mongoose = require('mongoose');
/* Named counters: the data revision number and atomic sequences (application numbers, roll IDs). */
module.exports = mongoose.model('Meta', new mongoose.Schema({ name: { type: String, unique: true }, n: { type: Number, default: 0 } }));
