const mongoose = require('mongoose');

const SharedLinkSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  patientName: String,
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SharedLink', SharedLinkSchema);