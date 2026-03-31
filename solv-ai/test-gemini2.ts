import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { buildMasterPrompt } from './lib/prompt.js';

const genAI = new GoogleGenerativeAI('AIzaSyB-Rxvcl7Sn52LnROG7JtnMZlSbaDBbB8I');

async function main() {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.3,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
    },
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ],
  });

  try {
    const prompt = buildMasterPrompt();
    console.log("Sending request to Gemini...");
    const result = await model.generateContent([{text: "경림전기(주) 재무 데이터 가짜로 만들어서 분석해줘."}, {text: prompt}]);
    
    console.log("Finish reason:", result.response.candidates[0].finishReason);
    
    const text = result.response.text();
    console.log("Response text length:", text.length);
    console.log("Last 100 chars:", text.slice(-100));
    
    JSON.parse(text);
    console.log("Parsed perfectly!");
  } catch (err) {
    console.error("Error:", err.message);
  }
}

main();
