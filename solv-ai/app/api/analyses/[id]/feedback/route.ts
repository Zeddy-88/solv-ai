import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

/**
 * 특정 분석 결과(ID)에 대해 사용자 피드백을 저장합니다.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { rating, feedback } = body;

    // 유효성 검사
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: '올바른 별점(1-5)이 필요합니다.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 분석 결과 업데이트
    const { data, error } = await supabase
      .from('analyses')
      .update({
        rating: rating,
        feedback: feedback || null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Feedback API] DB 업데이트 오류:', error);
      return NextResponse.json(
        { success: false, error: '피드백 저장 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '피드백이 성공적으로 저장되었습니다.',
      data
    });

  } catch (error) {
    console.error('[Feedback API] 서버 오류:', error);
    return NextResponse.json(
      { success: false, error: '서버 내부 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
