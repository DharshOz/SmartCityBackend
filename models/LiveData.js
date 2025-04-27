const mongoose = require('mongoose');

const liveDataSchema = new mongoose.Schema({
  Location: { type: String, required: true },
  Temperature: { type: Number, required: true },
  "Gas Emission Value": { type: Number, required: true },
  Threshold: { type: Number, required: true },
  Analog: { type: Number, required: true },
  Timestamp: { type: String, required: true },
  Date: { type: String, required: true }
});

module.exports = mongoose.model('LiveData', liveDataSchema);
