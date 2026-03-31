// BE Agent — /api/analyze 엔드포인트
// agent.md 섹션 9.3: Rate Limiting, 파일 검증, Gemini 연동

import { NextRequest, NextResponse } from 'next/server';
import { analyzeFinancialPDF } from '@/lib/gemini';

// 보안 Agent 게이트: 파일 크기 제한 (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// BE Agent: 표준 응답 형식
function successResponse(data: unknown, meta?: Record<string, unknown>) {
  return NextResponse.json({
    success: true,
    data,
    meta: meta || {},
  });
}

function errorResponse(code: string, message: string, status: number = 400) {
  return NextResponse.json(
    {
      success: false,
      error: { code, message },
    },
    { status }
  );
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    // 유효성 검사 — 보안 Agent 승인 기준
    if (!file) {
      return errorResponse('NO_FILE', 'PDF 파일이 필요합니다.');
    }

    if (file.type !== 'application/pdf') {
      return errorResponse('INVALID_TYPE', 'PDF 파일만 업로드 가능합니다.');
    }

    if (file.size > MAX_FILE_SIZE) {
      return errorResponse(
        'FILE_TOO_LARGE',
        `파일 크기가 50MB를 초과합니다. (현재: ${(file.size / 1024 / 1024).toFixed(1)}MB)`
      );
    }

    // PDF → Buffer (메모리 내 처리 — 보안 Agent 규정)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Gemini 2.5 Flash 분석 실행
    const result = await analyzeFinancialPDF(buffer);

    const duration = Date.now() - startTime;

    return successResponse(result, {
      duration: `${duration}ms`,
      fileSize: `${(file.size / 1024).toFixed(0)}KB`,
      fileName: file.name,
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    console.error('[BE Agent] 분석 오류:', error);

    // 에러 유형별 응답 (agent.md 섹션 2.2 기준)
    if (message.includes('PDF를 읽을 수 없')) {
      return errorResponse('PARSE_ERROR', 'PDF를 읽을 수 없습니다. 다른 파일을 시도해보세요.', 422);
    }

    if (message.includes('API_KEY') || message.includes('환경변수')) {
      return errorResponse('CONFIG_ERROR', '서버 설정 오류. 관리자에게 문의하세요.', 500);
    }

    return errorResponse('ANALYSIS_ERROR', `분석 서버 오류. 잠시 후 다시 시도해주세요. (${message})`, 500);
  }
}

// BE Agent: 최대 요청 시간 = 2분 (agent.md 타임아웃 기준)
export const maxDuration = 120;
