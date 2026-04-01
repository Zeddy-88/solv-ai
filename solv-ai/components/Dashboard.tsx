'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Star, Loader2, Share2 } from 'lucide-react';
import { AnalysisResult, DiagnosisGrade } from '@/lib/types';
import { generatePDF } from '@/lib/reportGenerator';

interface DashboardProps {
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

export default function Dashboard({ data, isFavorite, onToggleFavorite, onReset, onShare }: DashboardProps) {
  const { company, financials, diagnosis, summary, personas, integratedInsight, proposals, scripts } = data;
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const fileName = `SolvAI_Report_${company.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;
      await generatePDF('report-content', fileName);
    } catch (error) {
      alert('PDF 생성 중 오류가 발생했습니다.');
      console.error(error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      // 대안 로직 (직접 복사)
      const shareUrl = `${window.location.origin}/share/${data.company.name}`; // 폴백
      navigator.clipboard.writeText(shareUrl);
      alert('공유 링크가 복사되었습니다.');
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
      {/* PDF 캡처 대상 영역 — 배경색을 HEX로 지정하여 캡처 품질 확보 및 lab 에러 방지 */}
      <div id="report-content" className="space-y-8 bg-[#FFFFFF] p-6 -m-4 rounded-[40px] shadow-sm border border-[#E5E7EB]">
        {/* ── 헤더 ── */}
        <div className="flex items-start gap-4">
        <div className="space-y-1 flex-1 min-w-0">
          <p className="text-[12px] text-[#9CA3AF] font-bold uppercase tracking-widest">분석 완료</p>
          <div className="flex items-center gap-3">
            <h1 className="text-[18px] md:text-[30px] font-black text-[#111827] truncate">
              {company.name}
            </h1>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleShare}
                className="p-2 rounded-xl border border-[#0000001A] bg-white text-[#9CA3AF] hover:text-[#2563EB] hover:border-[#BFDBFE] transition-all"
                title="분석 결과 공유"
              >
                <Share2 className="w-5 h-5" color="#9CA3AF" />
              </button>
              <button
                onClick={onToggleFavorite}
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

      {/* ── 재무 진단 + 3개년 추이 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                <p className={`text-[11px] font-bold uppercase tracking-tighter ${gradeColor(item.grade)}`}>
                  {item.grade}
                </p>
              </div>
            ))}
          </div>
          
          {/* 건전성 및 효율성 지표 (4x2) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: '부채상환', grade: diagnosis.debtRepayment },
              { label: '활동성', grade: diagnosis.activity },
              { label: '이자보상', grade: diagnosis.interestCoverage },
              { label: '유동성', grade: diagnosis.liquidity },
              { label: '원가율', grade: diagnosis.costRatio },
              { label: '인건비', grade: diagnosis.personnelCost },
              { label: '채권건전성', grade: diagnosis.accountsReceivable },
              { label: '자본효율', grade: diagnosis.capitalEfficiency },
            ].map(item => (
              <div key={item.label} className="bg-[#F9FAFB] p-3 rounded-xl text-center border border-[#0000000D]">
                <p className="text-[11px] text-[#374151] mb-1 font-bold">{item.label}</p>
                <p className={`text-[10px] font-bold uppercase tracking-tighter ${gradeColor(item.grade as DiagnosisGrade)}`}>
                  {item.grade}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 3개년 추이 */}
        <div className="bg-white p-5 rounded-2xl border border-[#0000000D] shadow-sm flex flex-col justify-between">
          <h2 className="text-[16px] font-black text-[#111827] mb-4">3개년 수익성 추이</h2>
          <div className="flex text-[12px] font-bold text-[#9CA3AF] border-b border-[#0000000D] pb-3 mb-2">
            <div className="flex-1">항목</div>
            {financials.trends.map(t => (
              <div key={t.year} className={`w-16 text-right ${t.year === latestYear ? 'text-[#000000] font-black' : ''}`}>
                &apos;{String(t.year).slice(2)}
              </div>
            ))}
          </div>
          {(
            [
              { label: '매출(억)', key: 'revenue' as const },
              { label: '영업이익(백만)', key: 'operatingProfit' as const },
              { label: '순이익(백만)', key: 'netIncome' as const },
            ]
          ).map(row => {
            const values = financials.trends.map(t => t[row.key]);
            const isLatestDown = values[values.length - 1] < values[values.length - 2];
            return (
              <div key={row.label} className="flex items-center py-3 border-b border-[#F9FAFB] last:border-0">
                <div className="flex-1 text-[14px] font-bold text-[#4B5563]">{row.label}</div>
                {values.map((v, i) => {
                  const isLatest = i === values.length - 1;
                  return (
                    <div key={i} className={`w-16 text-right text-[14px] ${isLatest
                      ? isLatestDown ? 'text-[#EF4444] font-black' : 'text-[#16A34A] font-black'
                      : 'text-[#6B7280] font-medium'
                      }`}>
                      {v}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 기업 분석 요약 ── */}
      <div className="bg-white p-8 border border-[#0000001A] shadow-md rounded-[32px]">
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
        <div className="mt-5 p-8 rounded-[32px] text-white shadow-xl relative overflow-hidden" style={{ background: '#534AB7' }}>
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
            <div key={p.key} className="bg-white p-6 rounded-2xl border border-[#0000001A] shadow-md hover:border-[#2563EB] transition-all cursor-pointer group">
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

      {/* ── 영업 스크립트 ── (PDF 제외 영역) */}
      <div>
        <h2 className="text-[16px] font-black text-[#111827] mb-5">영업 현장 브리핑 스크립트</h2>
        <div className="space-y-4">
          {scripts.map(s => <ScriptAccordion key={s.id} script={s} />)}
        </div>
      </div>

      {/* ── PDF 내보내기 ── */}
      <div className="py-10 text-center">
        <button 
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF}
          className="w-full max-w-2xl py-5 bg-klein text-white rounded-3xl font-black text-base shadow-2xl hover:scale-[1.02] transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-wait"
        >
          {isGeneratingPDF ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              보고서 생성 중...
            </>
          ) : (
            '대표이사 제출용 원페이지 보고서 생성 (PDF)'
          )}
        </button>
        <p className="text-[14px] text-[#9CA3AF] mt-4 font-bold tracking-tight">
          영업용 전략 멘트가 제거된 재무 리포트가 생성됩니다.
        </p>
      </div>
    </div>
  );
}
