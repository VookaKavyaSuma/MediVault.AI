require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const OpenAI = require('openai');
const Notification = require('./models/Notification');

const app = express();
// 🔧 FIX 1: CHANGE PORT TO 5001 (Bypasses Mac AirPlay)
const PORT = 5001; 

// --- 🛑 CORS CONFIGURATION ---
// We allow your Frontend to talk to this Backend
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"], 
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());
// Serve uploaded files publicly
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ DB Connection Error:', err));

// Models
const Record = require('./models/Record');
// const User = require('./models/User'); // Uncomment if you created this file

// --- ROUTES ---

// 1. LOGIN API
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (email === "admin@medivault.ai" && password === "admin123") {
    return res.json({ success: true, role: "doctor", name: "Dr. Ananya" });
  } 
  if (email === "patient@medivault.ai" && password === "patient123") {
    return res.json({ success: true, role: "patient", name: "Kavya Suma" });
  }

  res.status(401).json({ success: false, message: "Invalid Credentials" });
});

// 2. CHATBOT API
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  let botReply = "I am analyzing your health records...";
  
  if (message && message.toLowerCase().includes("blood")) {
    botReply = "Based on your latest records, your Hemoglobin levels are stable (13.5 g/dL). However, your Cholesterol is slightly elevated.";
  } else if (message && message.toLowerCase().includes("appointment")) {
    botReply = "You have an upcoming follow-up with Dr. Ananya at Apollo Hospitals on Dec 24th.";
  } else if (message && message.toLowerCase().includes("headache")) {
    botReply = "Frequent headaches can be a sign of stress or hypertension. Since your records show a history of Hypertension, please monitor your BP.";
  } else {
    botReply = "I can help you interpret your medical records. Ask me about your 'Blood Test' or 'Prescriptions'.";
  }

  res.json({ reply: botReply });
});

// 3. UPLOAD RECORDS API
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');

  // 1. Save Record
  const newRecord = new Record({
    patientName: "Kavya Suma",
    fileName: req.file.originalname,
    fileUrl: `http://localhost:${PORT}/uploads/${req.file.filename}`,
    fileType: req.file.mimetype.includes("pdf") ? "PDF" : "Image",
    aiSummary: {
      hospitalVisits: [{ hospital: "Apollo Hospitals", date: "2024-12-20" }],
      tests: [{ name: "Complete Blood Count", result: "Normal" }],
      medicines: [{ name: "Dolo 650", dosage: "Twice a day" }]
    }
  });
  await newRecord.save();

  // 2. 🔔 CREATE NOTIFICATION (New Code)
  const newNotif = new Notification({
    title: "New Record Analyzed",
    message: `Your file '${req.file.originalname}' has been processed by AI.`,
    type: "success"
  });
  await newNotif.save();

  res.json({ success: true, record: newRecord });
});

// 4. GET ALL RECORDS
app.get('/api/records', async (req, res) => {
  try {
    const records = await Record.find().sort({ uploadDate: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: "Error fetching records" });
  }
});

// 5. GET NOTIFICATIONS
app.get('/api/notifications', async (req, res) => {
  const notifs = await Notification.find().sort({ date: -1 });
  res.json(notifs);
});

// 6. MARK NOTIFICATION AS READ
app.put('/api/notifications/:id', async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { read: true });
  res.json({ success: true });
});

// 7. DELETE RECORD API
app.delete('/api/records/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // 1. Delete from Database
    await Record.findByIdAndDelete(id);
    
    // (Optional: In a real app, you would also delete the file from 'uploads' folder here)
    
    res.json({ success: true, message: "Record deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));