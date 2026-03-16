require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

console.log("------------------------------------------------");
console.log("🔍 DEBUGGING API KEY CONNECTION");

const key = process.env.GEMINI_API_KEY;

if (!key) {
  console.error("❌ ERROR: API Key is MISSING or UNDEFINED.");
  console.error("👉 Make sure your .env file is in the 'backend' folder.");
  console.error("👉 Make sure the variable is named GEMINI_API_KEY");
} else {
  console.log(`✅ API Key Loaded! (Starts with: ${key.substring(0, 4)}...)`);
  
  // Try connecting with the loaded key
  const genAI = new GoogleGenerativeAI(key);
  
  async function test() {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent("Test");
      console.log("🎉 SUCCESS! The key is working.");
    } catch (err) {
      console.error("❌ Key Loaded, but Request Failed:", err.message);
    }
  }
  test();
}
console.log("------------------------------------------------");