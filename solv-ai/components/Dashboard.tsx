'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Star, Share2, BarChart3 } from 'lucide-react';
import { AnalysisResult, DiagnosisGrade, Proposal } from '@/lib/types';
import { ComposedChart, Bar, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import ProposalModal from '@/components/ProposalModal';

interface DashboardProps {
  id: string | null;
  data: AnalysisResult;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onReset: () => void;
  onShare?: () => void;
}

function gradeColor(grade: DiagnosisGrade): string {
  if (grade === '양호') return 'grade-good';
  if (grade === '보통') return 'grade-ok';
  return 'grade-bad';
}

// 5-step 타이포 스케일:
// text-xs  (12px) — 레이블, 배지, 상태 태그
// text-sm  (14px) — 보조 텍스트, 본문 설명
// text-base(16px) — 섹션 제목, 카드 제목
// text-lg  (18px) — 회사명 (모바일)
// text-3xl (30px) — 핵심 수치 강조

function YoYBadge({ value, unit = '%' }: { value: number; unit?: string }) {
  if (value > 0) return (
    <span className="flex items-center gap-1 text-[#2563EB] font-bold text-[14px]">
      <TrendingUp className="w-4 h-4" />
      ↑ {Math.abs(value).toFixed(1)}{unit}
    </span>
  );
  if (value < 0) return (
    <span className="flex items-center gap-1 text-[#EF4444] font-bold text-[14px]">
      <TrendingDown className="w-4 h-4" />
      ↓ {Math.abs(value).toFixed(1)}{unit}
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-[#9CA3AF] font-bold text-[14px]">
      <Minus className="w-4 h-4" />
      변동 없음
    </span>
  );
}

function ScriptAccordion({ script }: { script: AnalysisResult['scripts'][0] }) {
  const [isOpen, setIsOpen] = useState(false);

  const stepColors: Record<string, string> = {
    '오프닝': 'bg-[#EFF6FF] text-[#1E40AF]',
    '문제 제시': 'bg-[#FFF7ED] text-[#C2410C]',
    '해결안': 'bg-[#F0FDF4] text-[#15803D]',
    '클로징': 'bg-[#F5F3FF] text-[#6D28D9]',
  };

  return (
    <div className="bg-white rounded-3xl border border-black/10 shadow-md overflow-hidden transition-all hover:shadow-xl">
      <div
        className="p-6 flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4">
          <div className="w-7 h-7 rounded-full bg-[#F3F4F6] text-[#4B5563]
                          flex items-center justify-center text-[12px] font-black shadow-inner">
            {script.id}
          </div>
          <span className="text-[16px] font-black text-[#111827]">{script.type}</span>
          <span className={`px-3 py-1 text-[12px] rounded-full font-black ${stepColors[script.type] || 'bg-[#EFF6FF] text-[#1E40AF]'}`}>
            {script.tag}
          </span>
        </div>
        <span className={`text-[#9CA3AF] transition-transform duration-200 inline-block ${isOpen ? 'rotate-180' : ''}`}>▾</span>
      </div>

      {isOpen && (
        <div className="px-8 md:px-14 pb-8 animate-fade-in">
          <div className="bg-[#F9FAFB] p-5 rounded-2xl text-[14px] leading-relaxed
                          border border-[#F3F4F6] mb-6 font-normal text-[#1F2937]">
            {script.script}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'What', value: script.wwh.what, color: 'text-[#3B82F6]' },
              { label: 'Why', value: script.wwh.why, color: 'text-[#10B981]' },
              { label: 'How', value: script.wwh.how, color: 'text-[#F59E0B]' },
            ].map(card => (
              <div key={card.label} className="p-4 bg-white rounded-xl border border-black/5 shadow-sm">
                <p className={`text-[12px] font-black uppercase mb-1.5 tracking-widest ${card.color}`}>
                  {card.label}
                </p>
                <p className="text-[12px] text-[#4B5563] leading-relaxed font-bold">{card.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard({ id, data, isFavorite, onToggleFavorite, onReset, onShare }: DashboardProps) {
  const { company, financials, diagnosis, summary, personas, integratedInsight, proposals, scripts } = data;
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);


  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      // 대안 로직 (UUID 기반 정식 공유 링크 복사)
      const shareId = id || data.company.name; // UUID가 없으면 이전 방식 폴백
      const shareUrl = `${window.location.origin}/share/${shareId}`;
      navigator.clipboard.writeText(shareUrl);
      alert('공유 링크가 클립보드에 복사되었습니다.');
    }
  };

  const personaIconMap: Record<string, string> = {
    blue: '🛡️', green: '⚡', purple: '💬', amber: '🧠',
  };

  const personaColorMap: Record<string, string> = {
    blue: 'bg-[#EFF6FF] text-[#2563EB]',
    green: 'bg-[#F0FDF4] text-[#16A34A]',
    purple: 'bg-[#F5F3FF] text-[#7C3AED]',
    amber: 'bg-[#FFFBEB] text-[#D97706]',
  };

  const tagColorMap: Record<string, string> = {
    '긴급': 'bg-[#FEF2F2] text-[#DC2626]',
    '즉시': 'bg-[#FEF2F2] text-[#DC2626]',
    '추천': 'bg-[#EFF6FF] text-[#2563EB]',
    '검토': 'bg-[#F0FDF4] text-[#16A34A]',
  };

  const latestYear = Math.max(...financials.trends.map(t => t.year));

  return (
    <div className="space-y-6 p-6 md:p-8 animate-slide-up">
      <div className="space-y-8 bg-[#FFFFFF] p-8 rounded-3xl shadow-sm border border-[#E5E7EB]">
        {/* ── 헤더 ── */}
        <div className="flex items-start gap-4">
          <div className="space-y-1 flex-1 min-w-0">
            <p className="text-[12px] text-[#9CA3AF] font-bold uppercase tracking-widest">분석 완료</p>
            <div className="flex items-center gap-3">
              <h1 className="text-[18px] md:text-[30px] font-black text-[#111827] truncate">
                {company.name}
              </h1>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleShare}
                  data-html2canvas-ignore
                  className="p-2 rounded-xl border border-[#0000001A] bg-white text-[#9CA3AF] hover:text-[#2563EB] hover:border-[#BFDBFE] transition-all"
                  title="분석 결과 공유"
                >
                  <Share2 className="w-5 h-5" color="#9CA3AF" />
                </button>
                <button
                  onClick={onToggleFavorite}
                  data-html2canvas-ignore
                  className={`p-2 rounded-xl border transition-all ${isFavorite
                    ? 'bg-[#FFFBEB] border-[#FEF3C7] text-[#EAB308]'
                    : 'bg-white border-[#0000001A] text-[#D1D5DB] hover:text-[#EAB308]'
                    }`}
                >
                  <Star className={`w-5 h-5 ${isFavorite ? 'fill-[#EAB308]' : ''}`} color={isFavorite ? '#EAB308' : '#D1D5DB'} />
                </button>
              </div>
            </div>
            <p className="text-[14px] text-[#6B7280] font-medium">
              {company.industry} · 종업원 {company.employees}명 · 창업 {company.founded}년
            </p>
          </div>
        </div>

        {/* 배지 */}
        {(company.creditRating || company.industryRank) && (
          <div className="flex flex-wrap gap-2">
            {company.creditRating && (
              <span className="px-3 py-1.5 bg-[#FFFBEB] text-[#D97706] border border-[#FEF3C7] rounded-full text-[11px] font-black">
                {company.creditRating}
              </span>
            )}
            {company.industryRank && (
              <span className="px-3 py-1.5 bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] rounded-full text-[11px] font-black">
                업계 {company.industryRank}
              </span>
            )}
          </div>
        )}

        {/* ── 핵심 재무 지표 4종 ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: '연 매출', value: financials.revenue.value, unit: financials.revenue.unit, yoy: financials.revenue.yoy, isKlein: true },
            { label: '영업이익률', value: financials.operatingMargin.value, unit: financials.operatingMargin.unit, yoy: financials.operatingMargin.yoy, isKlein: false },
            { label: '당기순이익', value: financials.netIncome.value, unit: financials.netIncome.unit, yoy: financials.netIncome.yoy, isKlein: false },
            { label: '부채비율', value: financials.debtRatio.value, unit: financials.debtRatio.unit, yoy: 0, industryAvg: financials.debtRatio.industryAvg, isKlein: false },
          ].map((item) => (
            <div key={item.label} className="bg-white p-6 rounded-2xl border border-[#0000000D] shadow-sm">
              <p className="text-[11px] text-[#6B7280] mb-2 font-bold uppercase tracking-wider">{item.label}</p>
              <p className={`text-[30px] font-extrabold leading-tight tracking-tight ${item.isKlein ? 'text-klein' : item.yoy < 0 ? 'text-[#EF4444]' : 'text-[#111827]'
                }`}>
                {item.value}<span className="text-[14px] font-bold ml-1">{item.unit}</span>
              </p>
              <div className="mt-2">
                {'industryAvg' in item ? (
                  <span className="text-[14px] text-[#9CA3AF] font-bold">업종평균 {item.industryAvg}%</span>
                ) : (
                  <YoYBadge value={item.yoy} />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── 재무 진단 (상단 가로 배치) ── */}
        <div className="w-full">
          {/* 재무 진단 */}
          <div className="bg-white p-6 rounded-2xl border border-[#0000000D] shadow-sm">
            <h2 className="text-[16px] font-black text-[#111827] mb-4">재무 종합 진단 (11개 도메인)</h2>

            {/* 주요 3대 지표 */}
            <div className="grid grid-cols-3 gap-3 mb-3">
              {([
                { label: '성장성', grade: diagnosis.growth },
                { label: '수익성', grade: diagnosis.profitability },
                { label: '재무구조', grade: diagnosis.financialStructure },
              ] as const).map(item => (
                <div key={item.label} className="bg-[#EFF6FF80] p-4 rounded-xl text-center border border-[#DBEAFE80]">
                  <p className="text-[14px] text-[#1F2937] mb-1 font-black">{item.label}</p>
                  <p className={`text-[11px] font-bold uppercase tracking-tighter ${gradeColor(item.grade.grade)}`}>
                    {item.grade.grade}
                  </p>
                </div>
              ))}
            </div>

            {/* 건전성 및 효율성 지표 (4x2) */}
            {/* 건전성 및 효율성 지표 (확장된 11대 도메인) */}
            <div className="space-y-8">
              {[
                { 
                  title: '재무 안정성', 
                  items: [
                    { label: '재무구조', data: diagnosis.financialStructure },
                    { label: '유동성', data: diagnosis.liquidity },
                    { label: '부채상환', data: diagnosis.debtRepayment },
                    { label: '이자보상', data: diagnosis.interestCoverage },
                  ] 
                },
                { 
                  title: '수익성 및 효율성', 
                  items: [
                    { label: '수익성', data: diagnosis.profitability },
                    { label: '원가율', data: diagnosis.costRatio },
                    { label: '인건비', data: diagnosis.personnelCost },
                    { label: '자본효율', data: diagnosis.capitalEfficiency },
                  ] 
                },
                { 
                  title: '성장성 및 활동성', 
                  items: [
                    { label: '성장성', data: diagnosis.growth },
                    { label: '활동성', data: diagnosis.activity },
                    { label: '채권건전성', data: diagnosis.accountsReceivable },
                  ] 
                }
              ].map(group => (
                <div key={group.title}>
                  <h3 className="text-[14px] font-black text-gray-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-klein"></span>
                    {group.title}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {group.items.map(item => {
                      // 하위 호환성 처리 (old data fallback)
                      const isOld = typeof item.data === 'string';
                      const grade = isOld ? item.data as unknown as DiagnosisGrade : item.data.grade;
                      const value = isOld ? '분석중...' : item.data.value;

                      return (
                        <div key={item.label} className="bg-[#F9FAFB] p-4 rounded-2xl border border-[#0000000D] transition-all hover:bg-white hover:shadow-md group relative overflow-hidden">
                          <p className="text-[10px] text-[#6B7280] mb-1.5 font-bold group-hover:text-klein transition-colors uppercase tracking-tight">{item.label}</p>
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-[14px] font-black text-[#111827] leading-tight truncate flex-1">{value}</p>
                            <p className={`text-[9px] font-black uppercase tracking-tighter shrink-0 ml-1 ${gradeColor(grade)}`}>
                              {grade}
                            </p>
                          </div>
                          <div className="mt-2.5 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${
                                grade === '양호' ? 'bg-[#2563EB] w-[90%]' : 
                                grade === '보통' ? 'bg-[#10B981] w-[60%]' : 'bg-[#EF4444] w-[30%]'
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 3개년 수익성 추이 (하단 가로 배치) ── */}
        <div className="bg-white p-8 rounded-2xl border border-[#0000000D] shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[18px] font-black text-[#111827] flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-klein" />
              3개년 수익성 추이
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* 왼쪽: 수치 테이블 (2컬럼 차지) */}
            <div className="lg:col-span-2">
              <div className="flex text-[12px] font-bold text-[#9CA3AF] border-b border-[#0000000D] pb-3 mb-2 uppercase tracking-widest">
                <div className="flex-1">항목</div>
                {financials.trends.map(t => (
                  <div key={t.year} className={`w-20 text-right ${t.year === latestYear ? 'text-[#000000] font-black' : ''}`}>
                    &apos;{String(t.year).slice(2)}
                  </div>
                ))}
              </div>

              <div className="space-y-1">
                {(
                  [
                    { title: '매출액', unit: '(억)', key: 'revenue' as const, multiplier: 1 },
                    { title: '영업이익', unit: '(백만)', key: 'operatingProfit' as const, multiplier: 100 },
                    { title: '당기순이익', unit: '(백만)', key: 'netIncome' as const, multiplier: 100 },
                  ]
                ).map(row => {
                  const values = financials.trends.map(t => t[row.key] * row.multiplier);
                  const isLatestDown = values[values.length - 1] < values[values.length - 2];
                  return (
                    <div key={row.title} className="flex items-center py-5 border-b border-[#F9FAFB] last:border-0 hover:bg-gray-50 transition-colors">
                      <div className="flex-1 ml-1">
                        <div className="text-[15px] font-black text-gray-800 leading-tight">{row.title}</div>
                        <div className="text-[11px] font-bold text-gray-400 mt-0.5">{row.unit}</div>
                      </div>
                      {values.map((v, i) => {
                        const isLatest = i === values.length - 1;
                        return (
                          <div key={i} className={`w-20 text-right text-[15px] ${isLatest
                            ? isLatestDown ? 'text-[#EF4444] font-black' : 'text-klein font-black'
                            : 'text-[#6B7280] font-bold'
                            }`}>
                            {v.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 오른쪽: 시각화 차트 (3컬럼 차지) */}
            <div className="lg:col-span-3 min-h-[350px] w-full bg-[#FBFBFF] rounded-2xl p-6 border border-klein/5">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={financials.trends} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="year" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fontWeight: 'bold', fill: '#9CA3AF' }}
                    tickFormatter={(v) => `'${String(v).slice(2)}년`}
                  />
                  {/* 왼쪽 Y축: 매출 (억 단위) */}
                  <YAxis yAxisId="left" hide />
                  {/* 오른쪽 Y축: 이익 (백만 단위) - 스케일이 달라 별도축 사용 */}
                  <YAxis yAxisId="right" orientation="right" hide />
                  
                  <Tooltip 
                    cursor={{ fill: 'rgba(0, 47, 167, 0.05)' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontSize: '12px', padding: '12px' }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    align="right" 
                    iconType="circle"
                    wrapperStyle={{ paddingBottom: '20px', fontSize: '11px', fontWeight: 'bold' }}
                  />
                  
                  {/* 매출액 Bar */}
                  <Bar yAxisId="left" dataKey="revenue" fill="#002FA7" radius={[6, 6, 0, 0]} barSize={40} name="매출액(억)">
                    {financials.trends.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === financials.trends.length - 1 ? '#002FA7' : '#002FA733'} />
                    ))}
                  </Bar>
                  
                  {/* 영업이익 Line */}
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey={(d) => d.operatingProfit * 100} 
                    stroke="#10B981" 
                    strokeWidth={3} 
                    dot={{ fill: '#10B981', r: 4 }} 
                    activeDot={{ r: 6 }} 
                    name="영업이익(백만)" 
                  />
                  
                  {/* 당기순이익 Line (Area-like style) */}
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey={(d) => d.netIncome * 100} 
                    stroke="#F59E0B" 
                    strokeWidth={3} 
                    strokeDasharray="5 5"
                    dot={{ fill: '#F59E0B', r: 4 }} 
                    activeDot={{ r: 6 }} 
                    name="당기순이익(백만)" 
                  />
                </ComposedChart>
              </ResponsiveContainer>
              <div className="text-center mt-4 border-t border-dashed border-gray-200 pt-3">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">3개년 실적 트렌드 (수익성 지표 통합 시각화)</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 기업 분석 요약 ── */}
        <div className="bg-white p-8 border border-[#0000001A] shadow-md rounded-xl">
          <p className="text-[16px] font-bold text-[#111827] mb-3">{summary.headline}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {summary.tags.map(tag => (
              <span key={tag} className="px-4 py-1.5 bg-[#F3F4F6] text-[#4B5563] text-[12px] font-bold rounded-full">{tag}</span>
            ))}
          </div>
          <p className="text-[14px] leading-relaxed text-[#374151] font-medium">{summary.body}</p>
        </div>

        {/* ── 다각도 분석 ── */}
        <div>
          <h2 className="text-[16px] font-black text-[#111827] mb-5">다각도 분석</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {personas.map(p => (
              <div key={p.name} className="bg-white rounded-3xl border border-[#0000001A] p-7 shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl`}>
                    {personaIconMap[p.color] || '💡'}
                  </div>
                  <div>
                    <p className="text-[16px] font-black text-[#111827]">{p.name}</p>
                    <p className="text-[11px] text-[#9CA3AF] font-bold">{p.role}</p>
                  </div>
                </div>
                <p className="text-[14px] leading-relaxed text-[#1F2937] mb-5 font-medium italic">
                  &ldquo;{p.opinion}&rdquo;
                </p>
                <div className={`p-3 rounded-xl text-[14px] font-black text-center ${personaColorMap[p.color] || 'bg-[#F9FAFB]'}`}>
                  핵심: {p.key}
                </div>
              </div>
            ))}
          </div>

          {/* 종합의견 */}
          <div className="mt-5 p-8 rounded-xl text-white shadow-xl relative overflow-hidden" style={{ background: '#534AB7' }}>
            <div className="relative z-10">
              <h4 className="text-[12px] font-black text-[#E9D5FF] uppercase mb-2 tracking-widest">종합의견</h4>
              <p className="text-[16px] leading-relaxed font-bold">{integratedInsight}</p>
            </div>
            <div className="absolute top-0 right-0 text-[120px] opacity-10 leading-none m-4">💬</div>
          </div>
        </div>

        {/* ── 핵심 컨설팅 제안 포인트 ── */}
        <div>
          <h2 className="text-[16px] font-black text-[#111827] mb-5">핵심 컨설팅 제안 포인트</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {proposals.map(p => (
              <div
                key={p.key}
                onClick={() => setSelectedProposal(p)}
                className="bg-white p-6 rounded-2xl border border-[#0000001A] shadow-md hover:border-[#2563EB] transition-all cursor-pointer group hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className={`text-[12px] font-black px-3 py-1.5 rounded-full mb-4 inline-block ${tagColorMap[p.tag] || 'bg-[#F9FAFB] text-[#6B7280]'}`}>
                  {p.tag}
                </span>
                <p className="text-[16px] font-black mb-2 text-[#111827]">{p.title}</p>
                <p className="text-[14px] text-[#6B7280] leading-relaxed mb-4 line-clamp-2 font-medium">{p.desc}</p>
                <div className="text-[14px] text-[#D1D5DB] flex items-center gap-2 group-hover:text-[#2563EB] font-bold transition-colors">
                  <span>ℹ️</span> 상세 제안 시나리오 보기
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ProposalModal
        proposal={selectedProposal}
        onClose={() => setSelectedProposal(null)}
      />

      {/* ── 영업 스크립트 ── (PDF 제외 영역) */}
      <div className="mt-12">
        <h2 className="text-[16px] font-black text-[#111827] mb-5">영업 현장 브리핑 스크립트</h2>
        <div className="space-y-4">
          {scripts.map(s => <ScriptAccordion key={s.id} script={s} />)}
        </div>
      </div>

      {/* ── 하단 면책 조항 (Disclaimer) ── */}
      <footer className="mt-20 pb-12 border-t border-gray-100 pt-10">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <p className="text-[12px] font-bold text-gray-400 flex items-center justify-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-200"></span>
            본 분석 리포트는 Solv AI 엔진에 의해 자동 생성된 참고용 자료입니다.
          </p>
          <p className="text-[11px] leading-relaxed text-gray-400/70">
            데이터의 정확성을 위해 최선을 다하고 있으나, 실제 재무 상태와의 차이가 있을 수 있습니다.<br />
            중요한 비즈니스 의사결정 시에는 반드시 전문가의 자문을 받으시기 바랍니다.
          </p>
          <p className="text-[10px] text-gray-300 pt-6 font-medium uppercase tracking-widest">
            &copy; {new Date().getFullYear()} Solv AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
