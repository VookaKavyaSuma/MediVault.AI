const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // In real app, hash this!
  role: { type: String, enum: ['doctor', 'patient'], default: 'patient' },
  name: String
});

module.exports = mongoose.model('User', UserSchema);