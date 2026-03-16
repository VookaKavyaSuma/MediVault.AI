require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// --- IMPORTS ---
const Notification = require('./models/Notification');
const User = require('./models/User');
const Record = require('./models/Record');
const SharedLink = require('./models/SharedLink');

// 🧠 AI HANDLER IMPORT (Unified)
const { 
  analyzeMedicalReport, 
  chatWithReport, 
  chatWithAI, 
  getAIAnalysis 
} = require('./utils/aiHandler');

// --- CONFIGURATION ---
const app = express();
const PORT = 5001; // Avoids AirPlay conflict on Macs

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

// Serve static files (Images/PDFs)
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);
app.use('/uploads', express.static(UPLOADS_DIR));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ DB Connection Error:', err));

// Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

/* =========================================
   🚀 API ROUTES
   ========================================= */

// 1. AUTH: SIGN UP
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password, role, specializedIn, hospitalName, licenseNumber, bloodGroup, allergies, emergencyContact } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: "Email exists." });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name, email, password: hashedPassword, role: role || "patient",
      specializedIn, hospitalName, licenseNumber,
      bloodGroup, allergies, emergencyContact
    });

    await newUser.save();
    res.json({ success: true, message: "Account created!" });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// 2. AUTH: LOGIN
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "User not found." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid Credentials." });

    res.json({ success: true, role: user.role, name: user.name, email: user.email });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// 2.2 USER: GET PROFILE (New) 🆕
app.get('/api/profile', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, message: "Email required" });

    const user = await User.findOne({ email }).select('-password'); // Don't send password
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, user });
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    res.status(500).json({ success: false });
  }
});

// 2.1 USER: UPDATE PROFILE
app.post('/api/profile/update', async (req, res) => {
  try {
    const { email, bloodGroup, allergies, emergencyContact, hospitalName, specializedIn } = req.body;

    // Dynamic update object based on what is sent
    const updateFields = {};
    if (bloodGroup) updateFields.bloodGroup = bloodGroup;
    if (allergies) updateFields.allergies = allergies;
    if (emergencyContact) updateFields.emergencyContact = emergencyContact;
    if (hospitalName) updateFields.hospitalName = hospitalName;
    if (specializedIn) updateFields.specializedIn = specializedIn;

    const user = await User.findOneAndUpdate(
      { email },
      { $set: updateFields },
      { new: true }
    );

    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ success: false });
  }
});

// 3. CORE: UPLOAD & ANALYZE
app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');

  try {
    console.log("🤖 AI Analyzing:", req.file.originalname);
    let { userEmail, targetEmail, doctorName } = req.body;

    // Doctor Upload Logic (Certificate Issue)
    let issuedBy = null;
    if (targetEmail && doctorName) {
      userEmail = targetEmail; // Assign to patient
      issuedBy = doctorName;   // Mark issuer
    }

    if (!userEmail) return res.status(400).json({ success: false, message: "User email required." });

    // Call AI Handler
    const aiResult = await analyzeMedicalReport(req.file.path, req.file.mimetype);

    // Create Record
    const newRecord = new Record({
      patientName: "Patient", 
      fileName: req.file.originalname,
      storedFileName: req.file.filename,
      fileUrl: `http://localhost:${PORT}/uploads/${req.file.filename}`,
      fileType: req.file.mimetype,
      uploadDate: new Date(),
      userEmail: userEmail,
      issuedBy: issuedBy,
      aiSummary: aiResult || {}
    });

    await newRecord.save();
    console.log("✅ Analysis Saved!");

    // Create Notification
    await new Notification({
      title: issuedBy ? "New Certificate Issued" : "AI Analysis Ready",
      message: issuedBy ? `Dr. ${issuedBy} sent you a document.` : `Report "${req.file.originalname}" has been processed.`,
      type: "success",
      userEmail: userEmail
    }).save();

    res.json({ success: true, record: newRecord });

  } catch (error) {
    console.error("Upload Error:", error.message);
    if (error.message === "SCANNED_PDF_ERROR") {
      return res.status(422).json({
        success: false,
        message: "This appears to be a scanned PDF. Please upload an image (JPG/PNG) instead."
      });
    }
    res.status(500).json({ success: false, message: "Upload failed." });
  }
});

// 4. CORE: CHAT WITH DOCUMENT (RAG)
app.post('/api/chat-document', async (req, res) => {
  const { recordId, question } = req.body;

  try {
    const record = await Record.findById(recordId);
    if (!record) return res.status(404).json({ reply: "Record not found." });

    const diskFileName = record.storedFileName || (record.fileUrl ? record.fileUrl.split('/').pop() : record.fileName);
    const filePath = path.join(__dirname, 'uploads', diskFileName);

    if (!fs.existsSync(filePath)) {
      return res.json({ reply: "I can't read the file (it might have been deleted from the server)." });
    }

    const answer = await chatWithReport(filePath, record.fileType, question);
    res.json({ reply: answer });

  } catch (error) {
    console.error("Chat API Error:", error);
    res.status(500).json({ reply: "I'm having trouble thinking right now." });
  }
});

// 4.1 GENERAL CHAT
// ... existing imports ...

// 4.1 CONTEXT-AWARE GENERAL CHAT 💬 (UPDATED)
app.post('/api/chat', async (req, res) => {
  const { message, userEmail } = req.body; // 🆕 Receive Email

  try {
    let patientHistory = [];

    // 1. Fetch User History if email is provided
    if (userEmail) {
      // Fetch only necessary fields to save tokens
      patientHistory = await Record.find({ userEmail })
        .sort({ uploadDate: 1 }) // Oldest to Newest
        .select('uploadDate aiSummary') // Only get AI data
        .limit(10); // Limit to last 10 records to fit context window
    }

    // 2. Call AI with History
    const reply = await chatWithAI(message, patientHistory);
    res.json({ reply });

  } catch (error) {
    console.error("Chat Route Error:", error);
    res.status(500).json({ reply: "Server Error." });
  }
});



// 5. DATA: GET RECORDS
app.get('/api/records', async (req, res) => {
  try {
    const { email, migrate } = req.query;

    if (migrate === "true" && email) {
      const result = await Record.updateMany(
        { userEmail: { $exists: false } },
        { $set: { userEmail: email } }
      );
      return res.json({ success: true, message: `Migrated ${result.modifiedCount} records.` });
    }

    const filter = email ? { userEmail: email } : {};
    let records = await Record.find(filter).sort({ uploadDate: -1 });

    const host = req.get('host');
    records = records.map(doc => ({
      ...doc._doc,
      fileUrl: doc.fileUrl.replace("localhost:5001", host)
    }));

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: "Error fetching records" });
  }
});

// 6. DATA: DELETE RECORD
app.delete('/api/records/:id', async (req, res) => {
  try {
    await Record.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// 7. DATA: NOTIFICATIONS
app.get('/api/notifications', async (req, res) => {
  try {
    const { email } = req.query;
    const filter = email ? { userEmail: email } : {};
    const notifs = await Notification.find(filter).sort({ date: -1 });
    res.json(notifs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications" });
  }
});

app.put('/api/notifications/:id', async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { read: true });
  res.json({ success: true });
});

// 8. DOCTOR: GET PATIENTS
app.get('/api/patients', async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' }).select('-password');
    res.json(patients);
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// 9. FEATURES: QR SHARE
app.post('/api/share', async (req, res) => {
  try {
    const { patientEmail } = req.body;
    const patient = await User.findOne({ email: patientEmail });
    if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });

    const token = crypto.randomBytes(16).toString('hex');
    const newLink = new SharedLink({
      token,
      patientId: patient._id,
      patientName: patient.name,
      patientValues: {
        bloodGroup: patient.bloodGroup,
        allergies: patient.allergies,
        emergencyContact: patient.emergencyContact
      },
      expiresAt: new Date(Date.now() + 15 * 60 * 1000)
    });

    await newLink.save();
    res.json({ success: true, token, expiresAt: newLink.expiresAt });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

app.get('/api/share/:token', async (req, res) => {
  try {
    const link = await SharedLink.findOne({ token: req.params.token });
    if (!link) return res.status(403).json({ success: false, message: "Invalid Link" });

    const patient = await User.findById(link.patientId);
    if (!patient) return res.json({ success: false, message: "Patient not found" });

    let records = await Record.find({ userEmail: patient.email }).sort({ uploadDate: -1 });

    const host = req.get('host');
    records = records.map(doc => ({
      ...doc._doc,
      fileUrl: doc.fileUrl.replace("localhost:5001", host)
    }));

    res.json({
      success: true,
      patientName: patient.name,
      patientValues: {
        bloodGroup: patient.bloodGroup,
        allergies: patient.allergies,
        emergencyContact: patient.emergencyContact
      },
      records
    });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// 10. FEATURES: AI TOOLS (Unified & Safe)
app.post('/api/ai-predict', async (req, res) => {
  const { type, input } = req.body;
  
  if (!getAIAnalysis) {
    console.error("❌ AI Handler function missing!");
    return res.status(500).json({ success: false, message: "AI Service Unavailable" });
  }

  try {
    const result = await getAIAnalysis(type, input);

    if (result) {
      res.json({ success: true, data: result });
    } else {
      res.status(500).json({ success: false, message: "AI Analysis Failed" });
    }
  } catch (error) {
    console.error("AI Route Error:", error);
    res.status(500).json({ success: false });
  }
});

// --- STARTUP ---
app.listen(PORT, () => {
  console.log(`-----------------------------------------------`);
  console.log(`🚀 Server running on: http://localhost:${PORT}`);
  console.log(`📂 Uploads stored in: ${UPLOADS_DIR}`);
  console.log(`-----------------------------------------------`);
});