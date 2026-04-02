import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

/**
 * PortOne 결제 사후 검증 및 포인트 지급
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { paymentId, points } = await request.json();

    if (!paymentId || !points) {
      return NextResponse.json({ success: false, error: 'Invalid parameters' }, { status: 400 });
    }

    // 1. PortOne V2 API를 통한 결제 상태 조회 (Server-to-Server)
    // TODO: 실제 운영 환경에서는 PORTONE_V2_API_SECRET을 사용하여 사후 검증 수행
    // const payment = await fetch(`https://api.portone.io/payments/${paymentId}`, {
    //   headers: { Authorization: `PortOne ${process.env.PORTONE_API_SECRET}` }
    // }).then(res => res.json());

    // 테스트 환경에서는 paymentId가 존재하면 일단 검증 성공으로 가정 (브라우저 SDK 결과 신뢰)
    // 실제 운영 시에는 반드시 payment.totalAmount === (points * 1000) 검증 필수
    
    // 2. 포인트 충전 (profiles 테이블 업데이트)
    const { data: profile, error: profileFetchError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single();

    if (profileFetchError) throw profileFetchError;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ credits: (profile.credits || 0) + points })
      .eq('id', user.id);

    if (updateError) throw updateError;

    // 3. 트랜잭션 기록
    await supabase.from('credit_transactions').insert({
      user_id: user.id,
      amount: points,
      type: 'CHARGE',
      description: `PortOne Recharge: ${paymentId}`
    });

    return NextResponse.json({ success: true, points: points });

  } catch (error) {
    console.error('[Payment API Error]:', error);
    return NextResponse.json({ 
      success: false, 
      error: '포인트 충전 중 서버 오류가 발생했습니다.' 
    }, { status: 500 });
  }
}
