const fs = require("fs");
const path = require("path");
const pdf = require("pdf-extraction");
const Tesseract = require("tesseract.js");

// 🦜🔗 LangChain Imports
const { ChatGroq } = require("@langchain/groq");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");

// Initialize Groq Model
const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile",
  temperature: 0.3, // Slightly higher for "reasoning"
});

// --- HELPER: Read File ---
async function extractText(filePath, fileType) {
  try {
    if (!fs.existsSync(filePath)) return null;

    if (fileType.includes("pdf") || filePath.endsWith(".pdf")) {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      if (!data.text || data.text.trim().length < 50) return "SCANNED_PDF_ERROR";
      return data.text;
    } else {
      const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
      return text;
    }
  } catch (err) {
    console.error("❌ Extraction Error:", err.message);
    return null;
  }
}

// --- FUNCTION 1: DEEP ANALYSIS (The "Deep Understanding" Part) ---
async function analyzeMedicalReport(filePath, fileType) {
  try {
    const textData = await extractText(filePath, fileType);
    if (textData === "SCANNED_PDF_ERROR") throw new Error("SCANNED_PDF_ERROR");
    if (!textData) return null;

    // 🧠 UPGRADED PROMPT: Asks for "Clinical Analysis"
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are an advanced Medical AI. Extract structured JSON. In the 'clinicalAnalysis' field, provide a professional summary of what this report implies for the patient's long-term health. Return ONLY valid JSON."],
      ["human", `Analyze this medical text deeply:
      {text}
      
      Format strictly as valid JSON:
      {{
        "hospitalVisits": [{{ "hospital": "String", "date": "String" }}],
        "medicines": [{{ "name": "String", "dosage": "String", "purpose": "String" }}],
        "diseases": [{{ "name": "String", "status": "Active/Recovered/Chronic", "severity": "Low/Medium/High" }}],
        "clinicalAnalysis": "String (A 2-sentence summary of the patient's condition based on this file)"
      }}
      `]
    ]);

    const chain = prompt.pipe(model).pipe(new StringOutputParser());
    console.log("🤖 Deep AI Analysis Started...");
    const response = await chain.invoke({ text: textData.substring(0, 15000) });

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return {};

    return JSON.parse(jsonMatch[0]);

  } catch (error) {
    if (error.message === "SCANNED_PDF_ERROR") throw error;
    console.error("Analysis Error:", error.message);
    return null;
  }
}

// --- FUNCTION 2: RAG CHAT (Specific Document) ---
async function chatWithReport(filePath, fileType, userQuestion) {
  try {
    const textData = await extractText(filePath, fileType);
    if (!textData || textData === "SCANNED_PDF_ERROR") return "Cannot read file.";

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are a medical tutor. Explain the report content simply. Focus on 'Root Cause' and 'Next Steps'."],
      ["human", "Report: {context}\n\nQuestion: {question}"]
    ]);

    const chain = prompt.pipe(model).pipe(new StringOutputParser());
    return await chain.invoke({ context: textData.substring(0, 20000), question: userQuestion });
  } catch (error) {
    return "Analysis failed.";
  }
}

// --- FUNCTION 3: CONTEXT-AWARE GENERAL CHAT (The "Self-Training" Simulation) ---
async function chatWithAI(userMessage, patientHistory = []) {
  try {
    console.log(`🤖 Context Chat: "${userMessage}"`);

    // 1. Construct a "Memory String" from past records
    let memoryContext = "No previous medical records found.";
    
    if (patientHistory.length > 0) {
      memoryContext = "PATIENT HISTORY (Derived from uploaded files):\n";
      patientHistory.forEach((rec, i) => {
        if (rec.aiSummary) {
          const diseases = rec.aiSummary.diseases?.map(d => d.name).join(", ") || "None";
          const meds = rec.aiSummary.medicines?.map(m => m.name).join(", ") || "None";
          memoryContext += `[Record ${i+1} - ${new Date(rec.uploadDate).toLocaleDateString()}]: Found ${diseases}. Meds: ${meds}.\n`;
        }
      });
    }

    // 2. Feed Memory + Question to LLM
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", `You are MediVault AI, a personalized health assistant. 
      
      CONTEXT OF THE USER:
      {memory}

      INSTRUCTIONS:
      1. Use the User's Context to personalize your answer.
      2. If they ask about their health trends, summarize the history provided above.
      3. If the question is generic, answer generally but reference their condition if relevant.
      4. Be empathetic and professional.
      `],
      ["human", "{question}"]
    ]);

    const chain = prompt.pipe(model).pipe(new StringOutputParser());

    const response = await chain.invoke({
      memory: memoryContext,
      question: userMessage
    });

    return response;

  } catch (error) {
    console.error("General Chat Error:", error);
    return "I'm having trouble accessing your history right now.";
  }
}

// --- FUNCTION 4: TOOLS ---
async function getAIAnalysis(type, input) {
   // ... (Keep existing logic or copy from previous turn if needed, sticking to minimal changes here)
   // Assuming you have the previous version, I'll provide a placeholder or you can keep the old one.
   // For safety, I'll re-include the basic version:
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "Return valid JSON analysis."],
      ["human", `Analyze ${type}: ${input}`]
    ]);
    const chain = prompt.pipe(model).pipe(new StringOutputParser());
    const response = await chain.invoke({});
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
}

module.exports = { analyzeMedicalReport, chatWithReport, chatWithAI, getAIAnalysis };