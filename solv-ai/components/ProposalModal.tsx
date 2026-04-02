'use client';

import { useEffect } from 'react';
import { X, CheckCircle2, ArrowRight, Info } from 'lucide-react';
import { Proposal, ProposalTag, ProposalDetail } from '@/lib/types';

interface ProposalModalProps {
  proposal: Proposal | null;
  onClose: () => void;
}

const tagColorMap: Record<ProposalTag, string> = {
  '긴급': 'bg-[#FEF2F2] text-[#DC2626]',
  '즉시': 'bg-[#FEF2F2] text-[#DC2626]',
  '추천': 'bg-[#EFF6FF] text-[#2563EB]',
  '검토': 'bg-[#F0FDF4] text-[#16A34A]',
};

export default function ProposalModal({ proposal, onClose }: ProposalModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!proposal) return null;

  const { title, tag, detail } = proposal;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content max-h-[90vh] overflow-hidden flex flex-col" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`text-[12px] font-black px-3 py-1 rounded-full ${tagColorMap[tag]}`}>
              {tag}
            </span>
            <h2 className="text-[18px] font-black text-gray-900">{title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth">
          {/* Summary Section */}
          <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50">
            <div className="flex items-center gap-2 mb-3 text-blue-700">
              <Info className="w-5 h-5" />
              <span className="text-[14px] font-black">전략 요약</span>
            </div>
            <p className="text-[15px] leading-relaxed text-gray-700 font-medium whitespace-pre-wrap">
              {detail.summary}
            </p>
          </div>

          {/* Steps Section */}
          <div>
            <h3 className="text-[16px] font-black text-gray-900 mb-5 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
              상세 실행 프로세스
            </h3>
            <div className="space-y-4">
              {detail.steps.map((step, idx) => (
                <div key={idx} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-[14px] font-black shrink-0 shadow-lg shadow-blue-200">
                      {idx + 1}
                    </div>
                    {idx < detail.steps.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-100 my-1 group-last:hidden"></div>
                    )}
                  </div>
                  <div className="pt-1 pb-4">
                    <p className="text-[15px] text-gray-700 font-bold leading-relaxed">{step}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Effects Section */}
          <div>
            <h3 className="text-[16px] font-black text-gray-900 mb-5 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-green-600 rounded-full"></span>
              기대 효과
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {detail.effects.map(([label, value], idx) => (
                <div key={idx} className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2">
                  <p className="text-[12px] font-black text-gray-400 uppercase tracking-wider">{label}</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <p className="text-[15px] font-black text-gray-800">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Note Section */}
          {detail.note && (
            <div className="pt-6 border-t border-gray-100">
              <div className="flex items-start gap-3 text-amber-600 bg-amber-50 p-5 rounded-2xl border border-amber-100">
                <Info className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[12px] font-black mb-1 uppercase">주의 사항 / Tip</p>
                  <p className="text-[14px] font-medium leading-relaxed opacity-90">{detail.note}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-gray-900 text-white rounded-xl text-[14px] font-black hover:bg-gray-800 transition-all active:scale-95"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
