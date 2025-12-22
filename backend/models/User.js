const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // unique ensures no duplicate emails
  password: { type: String, required: true }, // This will be hashed!
  role: { type: String, enum: ['doctor', 'patient'], default: 'patient' },
  dateJoined: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);