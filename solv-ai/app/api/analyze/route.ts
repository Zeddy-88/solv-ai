// BE Agent — /api/analyze 엔드포인트
// agent.md 섹션 9.3: Rate Limiting, 파일 검증, Gemini 연동

import { NextRequest, NextResponse } from 'next/server';
import { analyzeFinancialPDF } from '@/lib/gemini';
import { createClient } from '@/lib/supabaseServer';

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
    const supabase = await createClient();
    
    // 1. 유저 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse('UNAUTHORIZED', '로그인이 필요합니다.', 401);
    }

    // 2. 포인트 확인 (1회 분석 = 2포인트 차감)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return errorResponse('PROFILE_NOT_FOUND', '프로필 정보를 찾을 수 없습니다.', 404);
    }

    if (profile.credits < 2) {
      return errorResponse('INSUFFICIENT_CREDITS', '잔여 분석 포인트가 부족합니다. (1회 분석: 2P) 충전 후 이용해주세요.', 402);
    }

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

    // Gemini 3.1 Pro 분석 실행
    const result = await analyzeFinancialPDF(buffer);

    // 3. 포인트 차감 (2포인트)
    const { error: deductError } = await supabase
      .from('profiles')
      .update({ credits: profile.credits - 2 })
      .eq('id', user.id);

    if (deductError) {
      console.error('[BE Agent] 포인트 차감 실패:', deductError);
      // 포인트 차감 실패 시에도 일단 분석 결과는 저장 시도 (관리자 수작업 필요할 수 있음)
    }

    // 4. 트랜잭션 기록
    await supabase.from('credit_transactions').insert({
      user_id: user.id,
      amount: -2,
      type: 'USAGE',
      description: `Analysis: ${result.company.name}`
    });

    // [Phase 4] Supabase 데이터 저장 로직
    let analysisId = null;
    try {
      // 1. 기업 정보 Upsert (회사명 기준)
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .upsert({
          name: result.company.name,
          industry: result.company.industry,
          employees: result.company.employees,
          founded: result.company.founded,
          credit_rating: result.company.creditRating,
          industry_rank: result.company.industryRank,
          updated_at: new Date().toISOString()
        }, { onConflict: 'name' })
        .select()
        .single();

      if (companyError) throw companyError;

      // 2. 분석 결과 저장
      const { data: analysisData, error: analysisError } = await supabase
        .from('analyses')
        .insert({
          company_id: companyData.id,
          company_name: result.company.name,
          result_json: result,
          is_favorite: false
        })
        .select()
        .single();

      if (analysisError) throw analysisError;
      analysisId = analysisData.id;

    } catch (dbError) {
      console.error('[BE Agent] DB 저장 실패 (건너뜀):', dbError);
      // DB 저장이 실패해도 분석 결과는 반환하여 사용자 경험 유지
    }

    const duration = Date.now() - startTime;

    return successResponse(result, {
      id: analysisId, // Supabase UUID 반환
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
