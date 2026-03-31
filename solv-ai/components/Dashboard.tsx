'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Star } from 'lucide-react';
import { AnalysisResult, DiagnosisGrade } from '@/lib/types';

interface DashboardProps {
  data: AnalysisResult;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onReset: () => void;
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
    <span className="flex items-center gap-1 text-blue-600 font-bold text-sm">
      <TrendingUp className="w-4 h-4" />
      ↑ {Math.abs(value).toFixed(1)}{unit}
    </span>
  );
  if (value < 0) return (
    <span className="flex items-center gap-1 text-red-500 font-bold text-sm">
      <TrendingDown className="w-4 h-4" />
      ↓ {Math.abs(value).toFixed(1)}{unit}
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-gray-400 font-bold text-sm">
      <Minus className="w-4 h-4" />
      변동 없음
    </span>
  );
}

function ScriptAccordion({ script }: { script: AnalysisResult['scripts'][0] }) {
  const [isOpen, setIsOpen] = useState(false);

  const stepColors: Record<string, string> = {
    '오프닝': 'bg-blue-50 text-blue-700',
    '문제 제시': 'bg-orange-50 text-orange-700',
    '해결안': 'bg-green-50 text-green-700',
    '클로징': 'bg-purple-50 text-purple-700',
  };

  return (
    <div className="bg-white rounded-3xl border border-black/10 shadow-md overflow-hidden transition-all hover:shadow-xl">
      <div
        className="p-6 flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4">
          <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-600
                          flex items-center justify-center text-xs font-black shadow-inner">
            {script.id}
          </div>
          <span className="text-base font-black text-gray-900">{script.type}</span>
          <span className={`px-3 py-1 text-xs rounded-full font-black ${stepColors[script.type] || 'bg-blue-50 text-blue-700'}`}>
            {script.tag}
          </span>
        </div>
        <span className={`text-gray-400 transition-transform duration-200 inline-block ${isOpen ? 'rotate-180' : ''}`}>▾</span>
      </div>

      {isOpen && (
        <div className="px-8 md:px-14 pb-8 animate-fade-in">
          <div className="bg-gray-50 p-5 rounded-2xl text-sm leading-relaxed
                          border border-gray-100 mb-6 font-normal text-gray-800">
            {script.script}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'What', value: script.wwh.what, color: 'text-blue-500' },
              { label: 'Why', value: script.wwh.why, color: 'text-green-500' },
              { label: 'How', value: script.wwh.how, color: 'text-amber-500' },
            ].map(card => (
              <div key={card.label} className="p-4 bg-white rounded-xl border border-black/5 shadow-sm">
                <p className={`text-xs font-black uppercase mb-1.5 tracking-widest ${card.color}`}>
                  {card.label}
                </p>
                <p className="text-xs text-gray-600 leading-relaxed font-bold">{card.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard({ data, isFavorite, onToggleFavorite, onReset }: DashboardProps) {
  const { company, financials, diagnosis, summary, personas, integratedInsight, proposals, scripts } = data;

  const personaIconMap: Record<string, string> = {
    blue: '🛡️', green: '⚡', purple: '💬', amber: '🧠',
  };

  const personaColorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  const tagColorMap: Record<string, string> = {
    '긴급': 'bg-red-50 text-red-600',
    '즉시': 'bg-red-50 text-red-600',
    '추천': 'bg-blue-50 text-blue-600',
    '검토': 'bg-green-50 text-green-600',
  };

  const latestYear = Math.max(...financials.trends.map(t => t.year));

  return (
    <div className="space-y-6 p-6 md:p-8 animate-slide-up">

      {/* ── 헤더 ── */}
      <div className="flex items-start gap-4">
        <div className="space-y-1 flex-1 min-w-0">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">분석 완료</p>
          <div className="flex items-center gap-3">
            <h1 className="text-lg md:text-3xl font-black text-gray-900 truncate">
              {company.name}
            </h1>
            <button
              onClick={onToggleFavorite}
              className={`p-2 rounded-xl border transition-all flex-shrink-0 ${isFavorite
                ? 'bg-yellow-50 border-yellow-200 text-yellow-500'
                : 'bg-white border-black/10 text-gray-300 hover:text-yellow-400'
                }`}
            >
              <Star className={`w-5 h-5 ${isFavorite ? 'fill-yellow-500' : ''}`} />
            </button>
          </div>
          <p className="text-sm text-gray-500 font-medium">
            {company.industry} · 종업원 {company.employees}명 · 창업 {company.founded}년
          </p>
        </div>
      </div>

      {/* 배지 */}
      {(company.creditRating || company.industryRank) && (
        <div className="flex flex-wrap gap-2">
          {company.creditRating && (
            <span className="px-3 py-1.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-full text-xs font-black">
              {company.creditRating}
            </span>
          )}
          {company.industryRank && (
            <span className="px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-xs font-black">
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
          <div key={item.label} className="card card-hover p-6">
            <p className="text-xs text-gray-500 mb-2 font-bold uppercase tracking-wider">{item.label}</p>
            <p className={`text-3xl font-extrabold leading-tight tracking-tight ${item.isKlein ? 'text-klein' : item.yoy < 0 ? 'text-red-500' : 'text-gray-900'
              }`}>
              {item.value}<span className="text-sm font-bold ml-1">{item.unit}</span>
            </p>
            <div className="mt-2">
              {'industryAvg' in item ? (
                <span className="text-sm text-gray-400 font-bold">업종평균 {item.industryAvg}%</span>
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
        <div className="card p-6">
          <h2 className="text-base font-black text-gray-900 mb-4">재무 진단</h2>
          <div className="grid grid-cols-3 gap-3 mb-3">
            {([
              { label: '성장성', grade: diagnosis.growth },
              { label: '수익성', grade: diagnosis.profitability },
              { label: '재무구조', grade: diagnosis.financialStructure },
            ] as const).map(item => (
              <div key={item.label} className="bg-gray-50 p-4 rounded-xl text-center border border-black/5">
                <p className="text-sm text-gray-800 mb-1 font-black">{item.label}</p>
                <p className={`text-xs font-bold uppercase tracking-tighter ${gradeColor(item.grade)}`}>
                  {item.grade}
                </p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {([
              { label: '부채상환', grade: diagnosis.debtRepayment },
              { label: '활동성', grade: diagnosis.activity },
            ] as const).map(item => (
              <div key={item.label} className="bg-gray-50 p-4 rounded-xl text-center border border-black/5">
                <p className="text-sm text-gray-800 mb-1 font-black">{item.label}</p>
                <p className={`text-xs font-bold uppercase tracking-tighter ${gradeColor(item.grade)}`}>
                  {item.grade}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 3개년 추이 */}
        <div className="card p-5 flex flex-col justify-between">
          <h2 className="text-base font-black text-gray-900 mb-4">3개년 수익성 추이</h2>
          <div className="flex text-xs font-bold text-gray-400 border-b border-black/5 pb-3 mb-2">
            <div className="flex-1">항목</div>
            {financials.trends.map(t => (
              <div key={t.year} className={`w-16 text-right ${t.year === latestYear ? 'text-black font-black' : ''}`}>
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
              <div key={row.label} className="flex items-center py-3 border-b border-gray-50 last:border-0">
                <div className="flex-1 text-sm font-bold text-gray-600">{row.label}</div>
                {values.map((v, i) => {
                  const isLatest = i === values.length - 1;
                  return (
                    <div key={i} className={`w-16 text-right text-sm ${isLatest
                      ? isLatestDown ? 'text-red-500 font-black' : 'text-green-600 font-black'
                      : 'text-gray-500 font-medium'
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
      <div className="bg-white p-8 border border-black/10 shadow-md" style={{ borderRadius: '32px' }}>
        <p className="text-base font-bold text-gray-900 mb-3">{summary.headline}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {summary.tags.map(tag => (
            <span key={tag} className="px-4 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">{tag}</span>
          ))}
        </div>
        <p className="text-sm leading-relaxed text-gray-700 font-medium">{summary.body}</p>
      </div>

      {/* ── 다각도 분석 ── */}
      <div>
        <h2 className="text-base font-black text-gray-900 mb-5">다각도 분석</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {personas.map(p => (
            <div key={p.name} className="bg-white rounded-3xl border border-black/10 p-7 shadow-lg card-hover">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${personaColorMap[p.color] || 'bg-gray-50'}`}>
                  {personaIconMap[p.color] || '💡'}
                </div>
                <div>
                  <p className="text-base font-black text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-400 font-bold">{p.role}</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-gray-800 mb-5 font-medium italic">
                &ldquo;{p.opinion}&rdquo;
              </p>
              <div className={`p-3 rounded-xl text-sm font-black text-center ${personaColorMap[p.color] || 'bg-gray-50'}`}>
                핵심: {p.key}
              </div>
            </div>
          ))}
        </div>

        {/* 종합의견 */}
        <div className="mt-5 p-8 rounded-[32px] text-white shadow-xl relative overflow-hidden" style={{ background: '#534AB7' }}>
          <div className="relative z-10">
            <h4 className="text-xs font-black text-purple-200 uppercase mb-2 tracking-widest">종합의견</h4>
            <p className="text-base leading-relaxed font-bold">{integratedInsight}</p>
          </div>
          <div className="absolute top-0 right-0 text-[120px] opacity-10 leading-none m-4">💬</div>
        </div>
      </div>

      {/* ── 핵심 컨설팅 제안 포인트 ── */}
      <div>
        <h2 className="text-base font-black text-gray-900 mb-5">핵심 컨설팅 제안 포인트</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {proposals.map(p => (
            <div key={p.key} className="bg-white p-6 rounded-2xl border border-black/10 shadow-md hover:border-blue-500 transition-all cursor-pointer group card-hover">
              <span className={`text-xs font-black px-3 py-1.5 rounded-full mb-4 inline-block ${tagColorMap[p.tag] || 'bg-gray-50 text-gray-600'}`}>
                {p.tag}
              </span>
              <p className="text-base font-black mb-2 text-gray-900">{p.title}</p>
              <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2 font-medium">{p.desc}</p>
              <div className="text-sm text-gray-300 flex items-center gap-2 group-hover:text-blue-500 font-bold transition-colors">
                <span>ℹ️</span> 상세 제안 시나리오 보기
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 영업 스크립트 ── */}
      <div>
        <h2 className="text-base font-black text-gray-900 mb-5">영업 현장 브리핑 스크립트</h2>
        <div className="space-y-4">
          {scripts.map(s => <ScriptAccordion key={s.id} script={s} />)}
        </div>
      </div>

      {/* ── PDF 내보내기 ── */}
      <div className="py-10 text-center">
        <button className="w-full max-w-2xl py-5 bg-klein text-white rounded-3xl font-black text-base shadow-2xl hover:scale-[1.02] transition-all active:scale-[0.98]">
          대표이사 제출용 원페이지 보고서 생성 (PDF)
        </button>
        <p className="text-sm text-gray-400 mt-4 font-bold tracking-tight">
          영업용 전략 멘트가 제거된 재무 리포트가 생성됩니다.
        </p>
      </div>
    </div>
  );
}
