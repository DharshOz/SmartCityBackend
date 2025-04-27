const mongoose = require('mongoose');

const accidentSchema = new mongoose.Schema({
  video_url: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
  }
});

module.exports = mongoose.model('videos', accidentSchema);
