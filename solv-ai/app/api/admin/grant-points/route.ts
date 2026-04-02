import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

/**
 * 관리자 전용: 특정 사용자에게 포인트 수동 지급
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 1. 관리자 권한 확인 (미들웨어와 동일 로직)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    const adminEmails = ['zeddykeepgoing@gmail.com'];
    
    if (authError || !user || !adminEmails.includes(user.email || '')) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { targetEmail, amount, description } = await request.json();

    if (!targetEmail || !amount) {
      return NextResponse.json({ success: false, error: 'Target email and amount are required' }, { status: 400 });
    }

    // 2. 대상 사용자 프로필 조회
    const { data: targetProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, credits')
      .eq('email', targetEmail)
      .single();

    if (profileError || !targetProfile) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // 3. 포인트 업데이트 (트랜잭션 처리 권장이나 여기서는 단순 순차 처리)
    const newCredits = (targetProfile.credits || 0) + amount;
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ credits: newCredits })
      .eq('id', targetProfile.id);

    if (updateError) throw updateError;

    // 4. 트랜잭션 로그 기록
    const { error: txError } = await supabase.from('credit_transactions').insert({
      user_id: targetProfile.id,
      amount: amount,
      type: 'ADMIN_GRANT',
      description: description || `Admin Manual Grant (${user.email})`
    });

    if (txError) {
      console.error('[Grant Points] Transaction Log Error:', txError);
      // 로그 기록 실패해도 포인트는 지급된 상태 (필요 시 복구 로직 추가 가능)
    }

    return NextResponse.json({ 
      success: true, 
      newCredits,
      message: `${targetEmail}님에게 ${amount}포인트가 지급되었습니다.`
    });

  } catch (error) {
    console.error('[Admin Grant Points Error]:', error);
    return NextResponse.json({ 
      success: false, 
      error: '관리자 포인트 지급 처리 중 서버 오류가 발생했습니다.' 
    }, { status: 500 });
  }
}
