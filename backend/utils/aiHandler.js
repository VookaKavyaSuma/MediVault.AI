const fs = require("fs");
const path = require("path");
const pdf = require("pdf-extraction");
const Tesseract = require("tesseract.js");

// 🦜🔗 LangChain Imports
const { ChatGroq } = require("@langchain/groq");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");

// Initialize Groq Model (Llama 3 is fast & accurate)
const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile",
  temperature: 0.2, // Low creativity for medical accuracy
});

// --- HELPER: Read File ---
async function extractText(filePath, fileType) {
  try {
    if (!fs.existsSync(filePath)) {
      console.error("❌ File not found:", filePath);
      return null;
    }

    // PDF Handling
    if (fileType.includes("pdf") || filePath.endsWith(".pdf")) {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);

      // 🚨 Check if PDF text is empty (likely scanned)
      if (!data.text || data.text.trim().length < 50) {
        console.warn("⚠️ Warning: PDF appears to be empty or scanned.");
        return "SCANNED_PDF_ERROR";
      }
      return data.text;
    }
    // Image Handling
    else {
      console.log("📸 OCR scanning image...");
      const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
      return text;
    }
  } catch (err) {
    console.error("❌ Extraction Error:", err.message);
    return null;
  }
}

// --- FUNCTION 1: ANALYZE (Generates JSON Summary) ---
async function analyzeMedicalReport(filePath, fileType) {
  try {
    const textData = await extractText(filePath, fileType);

    if (textData === "SCANNED_PDF_ERROR") {
      throw new Error("SCANNED_PDF_ERROR");
    }
    if (!textData) return null;

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are a medical AI. Extract structured data as JSON. Return ONLY valid JSON. No Markdown. No ```json tags. If a field is not found, use an empty array or null string."],
      ["human", `Extract medical details from this text:
      {text}
      
      Format strictly as valid JSON:
      {{
        "hospitalVisits": [{{ "hospital": "String", "date": "String" }}],
        "tests": [{{ "name": "String", "result": "String" }}],
        "medicines": [{{ "name": "String", "dosage": "String" }}],
        "diseases": [{{ "name": "String", "status": "String" }}]
      }}
      `]
    ]);

    const chain = prompt.pipe(model).pipe(new StringOutputParser());
    console.log("🤖 AI Analysis Started...");
    const response = await chain.invoke({ text: textData.substring(0, 15000) });

    // Robust JSON Extraction (Regex)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("❌ No JSON found in AI response");
      return {};
    }

    return JSON.parse(jsonMatch[0]);

  } catch (error) {
    if (error.message === "SCANNED_PDF_ERROR") throw error; // Re-throw for server handling
    console.error("Analysis Error:", error.message);
    return null; // Return null for generic errors to prevent crash
  }
}

// --- FUNCTION 2: CHAT (Answers Questions) 🆕 ---
async function chatWithReport(filePath, fileType, userQuestion) {
  try {
    const textData = await extractText(filePath, fileType);

    if (textData === "SCANNED_PDF_ERROR") {
      return "This appears to be a scanned PDF. I cannot read the text inside it. Please upload a clear image of the report instead.";
    }
    if (!textData) return "I cannot read this file. It might be corrupted or missing.";

    console.log(`💬 Analyzing Question: "${userQuestion}"`);

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are an empathetic and knowledgeable medical tutor AI. Your goal is to explain medical reports to patients in simple, easy-to-understand language. \n\nWhen answering:\n1. Simplify complex medical terms.\n2. Explain the **ROOT CAUSE** of the condition found in the report.\n3. Suggest **PREVENTIVE MEASURES** and lifestyle changes.\n4. Be comforting but professional.\n\nAnswer based ONLY on the report content below. If the answer is not in the report, say so."],
      ["human", `
      REPORT CONTENT:
      {context}
      
      USER QUESTION: {question}
      `]
    ]);

    const chain = prompt.pipe(model).pipe(new StringOutputParser());

    const response = await chain.invoke({
      context: textData.substring(0, 20000), // Larger context for chat
      question: userQuestion
    });

    return response;

  } catch (error) {
    console.error("Chat Logic Error:", error);
    return "I am having trouble analyzing this document right now.";
  }
}

// --- FUNCTION 3: GENERAL CHAT (No Document) 🆕 ---
async function chatWithAI(userMessage) {
  try {
    console.log(`🤖 General Chat: "${userMessage}"`);

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are MediVault AI, a friendly and knowledgeable health assistant. Answer general health, fitness, and nutrition questions. Do NOT verify medical documents here. Do NOT diagnose serious conditions—always advise seeing a doctor for that. Keep answers concise and easier to read (use bullet points if needed)."],
      ["human", "{question}"]
    ]);

    const chain = prompt.pipe(model).pipe(new StringOutputParser());

    const response = await chain.invoke({
      question: userMessage
    });

    return response;

  } catch (error) {
    console.error("General Chat Error:", error);
    return "I'm having a bit of trouble connecting to my brain right now. Try again?";
  }
}

// --- FUNCTION 4: DOCTOR TOOLS (Risk/Drugs) 🆕 ---
async function getAIAnalysis(type, input) {
  try {
    let systemPrompt = "";
    let userPrompt = "";

    if (type === "symptoms") {
      systemPrompt = "You are an expert diagnostic assistant. Analyze the symptoms provided. Return a JSON object with: { \"risk\": \"Low/Medium/High\", \"score\": 0-100, \"condition\": \"Most likely condition\", \"explanation\": \"Brief explanation\", \"tests\": [\"List of recommended tests\"] }. Return ONLY valid JSON.";
      userPrompt = `Patient Symptoms: ${input}`;
    } else if (type === "drugs") {
      systemPrompt = "You are a clinical pharmacist AI. Analyze the drug list for interactions. Return a JSON object with: { \"status\": \"✅ Safe / ⚠️ Caution / ❌ Unsafe\", \"message\": \"Brief summary of interactions\", \"details\": \"Detailed explanation of specific interactions\" }. Return ONLY valid JSON.";
      userPrompt = `Medications: ${input}`;
    }

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", systemPrompt],
      ["human", userPrompt]
    ]);

    const chain = prompt.pipe(model).pipe(new StringOutputParser());
    console.log(`🩺 AI Analysis (${type}): "${input.substring(0, 50)}..."`);

    const response = await chain.invoke({});
    console.log("🤖 Raw AI Response:", response); // 🆕 Debug log

    // Extract JSON
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn("⚠️ No JSON found in AI response");
      return null;
    }
    return JSON.parse(jsonMatch[0]);

  } catch (error) {
    console.error("❌ AI Tool Error:", error);
    return null;
  }
}

// Export ALL functions
module.exports = { analyzeMedicalReport, chatWithReport, chatWithAI, getAIAnalysis };