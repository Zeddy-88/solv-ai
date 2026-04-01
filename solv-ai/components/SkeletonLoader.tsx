'use client';

// FE Agent — 스켈레톤 로더 컴포넌트 (분석 중 표시)
export default function SkeletonLoader() {
  return (
    <div className="space-y-6 animate-fade-in p-6 md:p-8">
      {/* 헤더 스켈레톤 */}
      <div className="space-y-3">
        <div className="skeleton h-5 w-32 rounded-full" />
        <div className="skeleton h-9 w-64" />
        <div className="skeleton h-5 w-80" />
      </div>

      {/* 지표 카드 4종 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-6 space-y-3">
            <div className="skeleton h-4 w-20" />
            <div className="skeleton h-9 w-28" />
            <div className="skeleton h-4 w-16" />
          </div>
        ))}
      </div>

      {/* 재무 진단 + 추이 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6 space-y-4">
          <div className="skeleton h-5 w-24" />
          <div className="grid grid-cols-3 gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-16" />
            ))}
          </div>
        </div>
        <div className="card p-6 space-y-4">
          <div className="skeleton h-5 w-32" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="skeleton h-4 flex-1" />
              <div className="skeleton h-4 w-12" />
              <div className="skeleton h-4 w-12" />
              <div className="skeleton h-4 w-12" />
            </div>
          ))}
        </div>
      </div>

      {/* 기업 분석 요약 */}
      <div className="card p-8 space-y-4" style={{ borderRadius: '32px' }}>
        <div className="skeleton h-6 w-72" />
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-8 w-24 rounded-full" />)}
        </div>
        <div className="space-y-2">
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-5/6" />
          <div className="skeleton h-4 w-4/6" />
        </div>
      </div>

      {/* 4인 페르소나 */}
      <div>
        <div className="skeleton h-6 w-48 mb-5" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-7 space-y-4">
              <div className="flex items-center gap-4">
                <div className="skeleton w-14 h-14 rounded-2xl" />
                <div className="space-y-2">
                  <div className="skeleton h-5 w-32" />
                  <div className="skeleton h-4 w-24" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-5/6" />
                <div className="skeleton h-4 w-4/6" />
              </div>
              <div className="skeleton h-12 w-full rounded-xl" />
            </div>
          ))}
        </div>

        {/* 통합 인사이트 스켈레톤 */}
        <div className="mt-5 rounded-[32px] p-8" style={{ background: '#534AB7' }}>
          <div className="space-y-3">
            <div className="h-3 w-32 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
            <div className="h-5 w-full rounded" style={{ background: 'rgba(255,255,255,0.2)' }} />
            <div className="h-5 w-4/5 rounded" style={{ background: 'rgba(255,255,255,0.2)' }} />
          </div>
        </div>
      </div>

      {/* 제안 포인트 */}
      <div>
        <div className="skeleton h-6 w-48 mb-5" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-6 space-y-3">
              <div className="skeleton h-6 w-16 rounded-full" />
              <div className="skeleton h-5 w-32" />
              <div className="space-y-1.5">
                <div className="skeleton h-3 w-full" />
                <div className="skeleton h-3 w-5/6" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 분석 중 메시지 */}
      <div className="text-center py-6">
        <p className="text-[14px] text-[#9CA3AF] font-medium animate-pulse-subtle">
          AI가 재무제표를 분석하고 있습니다... 잠시만 기다려주세요.
        </p>
      </div>
    </div>
  );
}
