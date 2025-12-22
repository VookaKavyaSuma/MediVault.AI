const fs = require("fs");
const pdf = require("pdf-extraction");
const Tesseract = require("tesseract.js");

// 🦜🔗 LangChain Imports
const { ChatGroq } = require("@langchain/groq");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");

// Initialize LangChain Chat Model
const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile",
  temperature: 0, // Keep it deterministic
});

// Helper: Extract Text from PDF
async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (err) {
    console.error("❌ PDF Error:", err);
    return "";
  }
}

// Helper: Extract Text from Image (OCR)
async function extractTextFromImage(filePath) {
  try {
    console.log("📸 Starting OCR...");
    const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
    return text;
  } catch (err) {
    console.error("❌ OCR Error:", err);
    return "";
  }
}

async function analyzeMedicalReport(filePath, fileType) {
  try {
    let textData = "";

    // 1. Extraction Logic (Same as before)
    if (fileType === "application/pdf") {
      textData = await extractTextFromPDF(filePath);
    } else if (fileType.startsWith("image/")) {
      textData = await extractTextFromImage(filePath);
    } else {
      return null;
    }

    if (!textData || textData.trim().length < 20) {
      console.warn("⚠️ Text is too short/empty.");
      return null;
    }

    console.log("🦜🔗 LangChain is processing...");

    // 2. Define the Prompt Template (The "Instruction Manual")
    const promptTemplate = ChatPromptTemplate.fromMessages([
      ["system", "You are an expert medical AI assistant. You strictly output only valid JSON. No Markdown."],
      ["human", `Analyze the following medical text and extract data into this exact JSON structure:
      {{
        "hospitalVisits": [{{ "hospital": "String", "date": "YYYY-MM-DD" }}],
        "tests": [{{ "name": "String", "result": "String" }}],
        "medicines": [{{ "name": "String", "dosage": "String" }}],
        "diseases": [{{ "name": "String", "status": "String" }}]
      }}

      CRITICAL RULES:
      1. If a field is missing, use an empty array [].
      2. For 'diseases', include both "History of" conditions (like Hypertension) and current symptoms (like Chest Pain).
      3. For 'tests', look for lab values (e.g., "Hemoglobin: 13.5").
      4. Return ONLY the raw JSON string. Do not wrap it in \`\`\`json.

      MEDICAL TEXT:
      {text}`]
    ]);

    // 3. Create the Chain (Prompt -> Model -> Parser)
    const chain = promptTemplate.pipe(model).pipe(new StringOutputParser());

    // 4. Run the Chain
    const aiResponse = await chain.invoke({
      text: textData.substring(0, 15000) // Pass variable to template
    });

    // 5. Clean & Parse
    // Even with LangChain, Llama 3 sometimes adds a tiny bit of whitespace
    const jsonStart = aiResponse.indexOf('{');
    const jsonEnd = aiResponse.lastIndexOf('}');
    
    if (jsonStart === -1 || jsonEnd === -1) throw new Error("Invalid JSON output from LangChain");

    const cleanJson = aiResponse.substring(jsonStart, jsonEnd + 1);
    console.log("✅ LangChain Analysis Complete!");

    return JSON.parse(cleanJson);

  } catch (error) {
    console.error("❌ LangChain Error:", error.message);
    return null;
  }
}

module.exports = { analyzeMedicalReport };