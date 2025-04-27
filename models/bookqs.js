const mongoose = require('mongoose');

const historicalDataSchema = new mongoose.Schema({
  Location: { type: String, default: "Coimbatore, Peelamedu" },
  Temperature: Number,
  'Gas Emission Value': Number,
  Threshold: Number,  // Changed from String to Number
  Analog: Number,
  Timestamp: { type: String, default: () => new Date().toISOString() },
  Date: { type: String, default: () => new Date().toISOString().split('T')[0] }
}, { collection: 'bookqs' });  // Explicitly set collection name

const HistoricalData = mongoose.model('bookqs', historicalDataSchema);

module.exports = HistoricalData;