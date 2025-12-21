const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  title: String,
  message: String,
  type: { type: String, default: "info" }, // "info" or "alert"
  read: { type: Boolean, default: false },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);