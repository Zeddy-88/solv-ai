'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Dashboard from '@/components/Dashboard';
import { AnalysisResult } from '@/lib/types';
import Sidebar from '@/components/Sidebar';
import { Zap, Loader2 } from 'lucide-react';

import { createClient } from '@/lib/supabase';

export default function SharePage() {
  const params = useParams();
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedReport = async () => {
      if (!params.token) return;

      const supabase = createClient();
      const { data: dbData, error: dbError } = await supabase
        .from('analyses')
        .select('result_json')
        .eq('id', params.token as string)
        .single();

      if (dbError || !dbData) {
        console.error('Failed to fetch shared report:', dbError);
        setError('존재하지 않거나 삭제된 공유 링크입니다.');
      } else {
        setData(dbData.result_json as AnalysisResult);
      }
    };

    fetchSharedReport();
  }, [params.token]);

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#F0EFE9] p-6 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6">
          <Zap className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">링크 오류</h1>
        <p className="text-gray-500 font-medium">{error}</p>
        <a href="/" className="mt-8 px-6 py-3 bg-klein text-white rounded-xl font-bold">
          메인으로 이동
        </a>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F0EFE9]">
        <Loader2 className="w-8 h-8 animate-spin text-klein" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F0EFE9] overflow-hidden">
      {/* 공유 페이지용 미니 사이드바 (읽기 전용 암시) */}
      <aside className="hidden lg:flex w-[240px] bg-sidebar border-r border-black/10 flex-col">
        <div className="p-5 border-b border-black/8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-klein flex items-center justify-center shadow-sm">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-[15px] font-black text-gray-900 tracking-tight">Solv AI</span>
          </div>
        </div>
        <div className="p-6 text-center text-gray-400">
          <p className="text-xs font-bold uppercase tracking-widest mb-4">공유 뷰어</p>
          <div className="p-4 bg-white/50 rounded-2xl border border-black/5 text-[11px] leading-relaxed">
            이 분석 결과는 공유 링크를 통해 조회 중입니다.
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {/* 읽기 전용 대시보드 — 즐겨찾기/리셋 기능 비활성화 */}
        <Dashboard 
          data={data} 
          isFavorite={false} 
          onToggleFavorite={() => {}} 
          onReset={() => {}} 
        />
      </main>
    </div>
  );
}
