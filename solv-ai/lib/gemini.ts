// BE Agent — Gemini 2.5 Flash API 클라이언트
// agent.md 섹션 9.3 기반

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { AnalysisResult } from './types';
import { buildMasterPrompt } from './prompt';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function analyzeFinancialPDF(
  pdfBuffer: Buffer,
  mimeType: string = 'application/pdf'
): Promise<AnalysisResult> {
  // 보안 Agent 게이트: API 키 확인
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
  }

  // Gemini 2.5 Flash 멀티모달 모델 초기화
  const model = genAI.getGenerativeModel({
    model: 'gemini-3.1-pro-preview',
    generationConfig: {
      temperature: 0.3,           // 일관성 높은 분석 출력
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 65536,
      responseMimeType: 'application/json',
    },
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ],
  });

  // PDF → Base64 인라인 데이터
  const pdfBase64 = pdfBuffer.toString('base64');

  const prompt = buildMasterPrompt();

  try {
    const result = await model.generateContent([
      {
        inlineData: {
          data: pdfBase64,
          mimeType: mimeType,
        },
      },
      { text: prompt },
    ]);

    const responseText = result.response.text();

    let parsed: AnalysisResult;
    try {
      // responseMimeType이 application/json이므로 순수 JSON을 반환함
      const cleanJson = responseText.replace(/```json\n?|\n?```/g, ''); 
      parsed = JSON.parse(cleanJson) as AnalysisResult;
    } catch (parseError) {
      // JSON 파싱에 실패했을 때 터미널에서 원본 텍스트를 파악할 수 있도록 로깅
      const finishReason = result.response?.candidates?.[0]?.finishReason;
      console.error('[BE Agent] AI 분석 종료 사유 (finishReason):', finishReason);
      console.error('[BE Agent] AI 원본 응답 파싱 에러. 응답 내용:', responseText);
      throw new Error(`AI 응답 JSON 파싱 실패: 형식이 올바르지 않습니다. (강제종료 사유 확인필요)`);
    }

    // 응답 유효성 검사 (최소한의 필드 확인)
    if (!parsed.company || !parsed.financials || !parsed.personas) {
      console.error('[BE Agent] AI 분석 응답 (필드 누락):', parsed);
      throw new Error('AI 응답 구조가 올바르지 않습니다. (필수 데이터 누락)');
    }

    return parsed;
  } catch (error) {
    throw error;
  }
}
