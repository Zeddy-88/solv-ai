import { GoogleGenerativeAI } from '@google/generative-ai';

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
  });

  try {
    const result = await model.generateContent("Return a JSON array of 3 fruits. Example: [\"apple\", ...]");
    const text = result.response.text();
    console.log("Raw Response:");
    console.log(text);
    const parsed = JSON.parse(text);
    console.log("Parsed successfully!");
  } catch (err) {
    console.error("Error:", err.message);
  }
}

main();
