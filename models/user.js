// models/user.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  phoneNumber:    { type: String, required: true },
  profession: String,
  location: {
    district: String,
    state: String
  },
  password: { type: String, required: true }
});

module.exports = mongoose.model('User', userSchema);
