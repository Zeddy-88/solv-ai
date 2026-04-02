import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

/**
 * PortOne 웹훅 수신 및 결제 최종 확정
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    
    // PortOne V2 웹훅에서는 paymentId가 포함됨
    const { paymentId, status } = body;

    // 결제 완료(PAID) 상태인 경우에만 처리
    if (status !== 'PAID') {
      return NextResponse.json({ received: true });
    }

    // 1. PortOne V2 API를 통한 결제 정보 조회 (사후 검증)
    // const payment = await fetch(`https://api.portone.io/payments/${paymentId}`, {
    //   headers: { Authorization: `PortOne ${process.env.PORTONE_API_SECRET}` }
    // }).then(res => res.json());

    // 2. 이미 처리된 결제인지 확인 (중복 충전 방지)
    const { data: existingTx } = await supabase
      .from('credit_transactions')
      .select('id')
      .eq('description', `PortOne Recharge: ${paymentId}`)
      .single();

    if (existingTx) {
      return NextResponse.json({ message: 'Already processed' });
    }

    // 3. 결제 금액에 따른 포인트 산출 및 유저 식별
    // 웹훅 데이터에는 유저 ID나 요청 포인트 정보가 직접 없을 수 있으므로, 
    // 사전에 DB에 '결제 요청(PENDING)' 상태로 저장해둔 데이터를 조회하는 것이 정석입니다.
    // 여기서는 데모를 위해 고정 로직 또는 payment custom data를 활용하는 구조를 가정합니다.
    
    console.log(`[Webhook] 결제 완료 감지: ${paymentId}`);
    
    // TODO: 결제 요청 시 저장한 포인트를 조회하여 충전 로직 수행
    // (현재는 검증 API에서 유저 세션 기반으로 선처리하므로 웹훅은 무결성 보조 용도)

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[Webhook Error]:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
