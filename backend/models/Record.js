const mongoose = require('mongoose');

const RecordSchema = new mongoose.Schema({
  patientName: String,
  fileName: String,
  fileUrl: String,      // We will store the path to the file
  fileType: String,     // "PDF" or "Image"
  uploadDate: { type: Date, default: Date.now },
  
  // The AI Analysis Data
  aiSummary: {
    hospitalVisits: [{ hospital: String, date: String }],
    medicines: [{ name: String, dosage: String }],
    diseases: [{ name: String, status: String }]
  }
});

module.exports = mongoose.model('Record', RecordSchema);