'use client';

import { useState } from 'react';
import { X, Zap, CreditCard, ChevronRight, LogIn, Loader2 } from 'lucide-react';
import { loginWithSocial } from '@/lib/auth';
import * as PortOne from '@portone/browser-sdk/v2';

/**
 * 로그인 유도 및 소셜 로그인 선택 모달
 */
export function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (provider: 'google' | 'kakao' | 'github') => {
    setLoading(provider);
    await loginWithSocial(provider);
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-slide-up">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-2xl bg-klein flex items-center justify-center shadow-lg shadow-klein/20">
              <Zap className="w-6 h-6 text-white fill-white" />
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-2">시작하기</h2>
          <p className="text-gray-500 text-sm font-medium mb-8">
            재무제표 분석을 시작하려면 로그인이 필요합니다.<br />
            신규 가입 시 **2회 무료 분석 포인트(4P)**를 드립니다.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => handleLogin('kakao' as any)}
              disabled={!!loading}
              className="w-full py-4 bg-[#FEE500] text-[#191919] rounded-2xl font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading === 'kakao' ? <Loader2 className="w-5 h-5 animate-spin" /> : <div className="w-5 h-5 bg-[#191919] rounded-full" />}
              카카오로 시작하기
            </button>
            <button
              onClick={() => handleLogin('google')}
              disabled={!!loading}
              className="w-full py-4 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-50 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading === 'google' ? <Loader2 className="w-5 h-5 animate-spin" /> : <div className="w-5 h-5 bg-red-500 rounded-full" />}
              Google로 시작하기
            </button>
          </div>
          
          <p className="mt-8 text-center text-[11px] text-gray-400 font-medium">
            로그인 시 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * 포인트 충전 모달 (수익화 핵심)
 */
export function CreditModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handlePurchase = async (points: number, price: number) => {
    setLoading(true);
    
    const paymentId = `p_${crypto.randomUUID().split('-')[0]}_${Date.now()}`;
    
    try {
      const response = await PortOne.requestPayment({
        storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID || 'store-304f58c7-2c58-40af-98f2-dced16744883', // 테스트 스토어 ID
        channelKey: 'channel-key-7d7168d4-53c8-477d-bb62-0b0c534433bd', // 테스트 채널 키
        paymentId,
        orderName: `Solv AI ${points} 포인트 충전`,
        totalAmount: price,
        currency: 'CURRENCY_KRW',
        payMethod: 'CARD', // 또는 'EASY_PAY' 등
      });

      if (response && response.code !== 'FAILURE') {
        // 결제 성공 시 서버에 사후 검증 요청
        const verifyRes = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId, points }),
        });

        if (verifyRes.ok) {
          alert(`축하합니다! ${points} 포인트가 충전되었습니다.`);
          window.location.reload();
        } else {
          alert('결제 검증에 실패했습니다. 고객센터로 문의해주세요.');
        }
      } else {
        alert(`결제 실패: ${response?.message || '결제가 취소되었습니다.'}`);
      }
    } catch (err) {
      console.error('PortOne Error:', err);
      alert('결제 창을 여는 중 장치가 응답하지 않습니다.');
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-slide-up">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-black text-gray-900">분석 포인트 충전</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div 
              onClick={() => handlePurchase(5, 5000)}
              className="p-6 rounded-[24px] border-2 border-gray-100 hover:border-klein hover:bg-blue-50/30 transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="bg-klein/10 text-klein px-3 py-1 rounded-full text-[11px] font-black w-fit mb-3">5 포인트</div>
              <div className="text-lg font-black text-gray-900 mb-1">베이직 충전</div>
              <div className="text-2xl font-black text-klein">5,000원</div>
              <p className="text-[11px] text-gray-400 mt-1 font-bold">1,000원 = 1P</p>
              <ChevronRight className="absolute right-6 bottom-6 w-5 h-5 text-gray-300 group-hover:text-klein transition-colors" />
            </div>

            <div 
              onClick={() => handlePurchase(20, 18000)}
              className="p-6 rounded-[24px] border-2 border-klein bg-blue-50/50 shadow-lg shadow-klein/5 relative group cursor-pointer"
            >
              <div className="absolute top-0 right-0 bg-klein text-white px-4 py-1 rounded-bl-xl text-[10px] font-black">10% 할인가</div>
              <div className="bg-klein text-white px-3 py-1 rounded-full text-[11px] font-black w-fit mb-3">20 포인트</div>
              <div className="text-lg font-black text-gray-900 mb-1">비즈니스 팩</div>
              <div className="text-2xl font-black text-klein">18,000원</div>
              <p className="text-[11px] text-klein/60 mt-1 font-bold">분석 10회 분량</p>
              <ChevronRight className="absolute right-6 bottom-6 w-5 h-5 text-klein" />
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-5 mb-8">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-gray-900 mb-1">법인카드 / 개인카드 무이자 할부</p>
                <p className="text-[11px] text-gray-500 font-medium">PortOne 보안 결제 시스템을 통해 안전하게 처리됩니다.</p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all active:scale-[0.98]"
          >
            나중에 충전하기
          </button>
        </div>
      </div>
    </div>
  );
}
