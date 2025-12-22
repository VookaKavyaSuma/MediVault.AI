require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const OpenAI = require('openai');
const Notification = require('./models/Notification');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); 
const SharedLink = require('./models/SharedLink');
const crypto = require('crypto'); // Built-in Node module for random strings
const { analyzeMedicalReport } = require('./utils/aiHandler');

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

// --- AUTH ROUTES ---

// 1. SIGN UP API (Create New User)
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already exists." });
    }

    // Hash the password (Encrypt it)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "patient" // Default to patient if not specified
    });

    await newUser.save();
    res.json({ success: true, message: "Account created! Please login." });

  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// 2. LOGIN API (Verify User)
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found." });
    }

    // Verify password (Compare plain text with hash)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid Credentials." });
    }

    // Success! Send back user info
    res.json({ 
      success: true, 
      role: user.role, 
      name: user.name,
      email: user.email 
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
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

// 3. UPLOAD RECORDS API (With Real AI 🧠)
app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');

  try {
    // 1. Run Real AI Analysis
    console.log("🤖 AI is analyzing:", req.file.originalname);
    
    // Default fallback in case AI fails or file is an image without OCR
    let aiResult = {
      hospitalVisits: [],
      tests: [],
      medicines: [],
      diseases: []
    };

    const realAnalysis = await analyzeMedicalReport(req.file.path, req.file.mimetype);
    
    if (realAnalysis) {
      aiResult = realAnalysis; // Use the real data!
      console.log("✅ AI Analysis Complete!");
    } else {
      console.log("⚠️ AI skipped (Image or Error), using defaults.");
    }

    // 2. Save to Database
    const newRecord = new Record({
      patientName: "Kavya Suma", // You can fetch this from User ID in a real app
      fileName: req.file.originalname,
      fileUrl: `http://localhost:${PORT}/uploads/${req.file.filename}`,
      fileType: req.file.mimetype.includes("pdf") ? "PDF" : "Image",
      uploadDate: new Date(),
      aiSummary: aiResult // <--- SAVING REAL DATA HERE
    });

    await newRecord.save();

    // 3. Send Notification
    // (If you implemented the Notification model earlier)
    const Notification = require('./models/Notification'); // Ensure this is imported at top if used
    if (Notification) {
      await new Notification({
        title: "AI Analysis Complete",
        message: `Analysis for ${req.file.originalname} is ready.`,
        type: "success"
      }).save();
    }

    res.json({ success: true, record: newRecord });

  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ success: false, message: "Server Error during upload" });
  }
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

// 8. GET ALL PATIENTS (Doctor Only)
app.get('/api/patients', async (req, res) => {
  try {
    // Find all users where role is 'patient'
    // .select('-password') means "Don't send the password back!"
    const patients = await User.find({ role: 'patient' }).select('-password');
    res.json(patients);
  } catch (error) {
    console.error("Error fetching patients:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// 9. SHARE ACCESS API (Generate QR Token)
app.post('/api/share', async (req, res) => {
  try {
    const { patientEmail } = req.body;
    
    // Find the patient to get their ID and Name
    const patient = await User.findOne({ email: patientEmail });
    if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });

    // Generate a secure random token
    const token = crypto.randomBytes(16).toString('hex');
    
    // Set expiry (e.g., 15 minutes from now)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const newLink = new SharedLink({
      token,
      patientId: patient._id,
      patientName: patient.name,
      expiresAt
    });

    await newLink.save();
    res.json({ success: true, token, expiresAt });

  } catch (error) {
    console.error("Share Error:", error);
    res.status(500).json({ success: false });
  }
});

// 10. ACCESS SHARED RECORDS (Public Access with Token)
app.get('/api/share/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // 1. Find the link
    const link = await SharedLink.findOne({ token });
    
    // 2. Validate it
    if (!link) {
      return res.status(404).json({ success: false, message: "Invalid Link" });
    }
    if (new Date() > link.expiresAt) {
      return res.status(403).json({ success: false, message: "Link Expired" });
    }

    // 3. Fetch the patient's records
    // (In a real app, we would filter by patientId. For demo, we return all records)
    const records = await Record.find().sort({ uploadDate: -1 });

    res.json({ 
      success: true, 
      patientName: link.patientName, 
      records 
    });

  } catch (error) {
    console.error("Shared Access Error:", error);
    res.status(500).json({ success: false });
  }
});

// 11. DOCTOR AI TOOLS API
app.post('/api/ai-predict', (req, res) => {
  const { type, input } = req.body;
  let result = {};

  // Tool 1: Disease Risk Predictor
  if (type === "symptoms") {
    const symptoms = input.toLowerCase();
    if (symptoms.includes("chest") && symptoms.includes("pain")) {
      result = { risk: "High", condition: "Possible Angina or Cardiac Issue", score: 85 };
    } else if (symptoms.includes("headache") && symptoms.includes("fever")) {
      result = { risk: "Moderate", condition: "Viral Infection / Migraine", score: 45 };
    } else {
      result = { risk: "Low", condition: "General Fatigue or Minor Infection", score: 15 };
    }
  } 
  
  // Tool 2: Drug Interaction Checker
  else if (type === "drugs") {
    const drugs = input.toLowerCase(); // e.g., "aspirin, ibuprofen"
    if (drugs.includes("aspirin") && drugs.includes("ibuprofen")) {
      result = { status: "⚠️ Unsafe", message: "Risk of stomach bleeding and reduced aspirin effect." };
    } else if (drugs.includes("paracetamol") && drugs.includes("alcohol")) {
      result = { status: "❌ Dangerous", message: "High risk of liver damage." };
    } else {
      result = { status: "✅ Safe", message: "No known major interactions found." };
    }
  }

  // Simulate AI "Thinking" delay
  setTimeout(() => {
    res.json({ success: true, data: result });
  }, 1500);
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));