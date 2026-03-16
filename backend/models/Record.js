const mongoose = require('mongoose');

const RecordSchema = new mongoose.Schema({
  patientName: String,
  fileName: String,
  storedFileName: String, // Actual filename on disk (timestamped)
  fileUrl: String,      // We will store the path to the file
  fileType: String,     // "PDF" or "Image"
  fileType: String,     // "PDF" or "Image"
  uploadDate: { type: Date, default: Date.now },
  uploadDate: { type: Date, default: Date.now },
  userEmail: { type: String, required: true }, // Owner (Patient)
  issuedBy: { type: String }, // 🆕 Doctor Name (if applicable)
  patientEmail: { type: String }, // 🆕 Explicit Target (for Doctor uploads)

  // The AI Analysis Data
  aiSummary: {
    hospitalVisits: [{ hospital: String, date: String }],
    medicines: [{ name: String, dosage: String }],
    diseases: [{ name: String, status: String }]
  }
});

module.exports = mongoose.model('Record', RecordSchema);