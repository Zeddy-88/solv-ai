'use client';

import { useState, useCallback, useEffect } from 'react';
import { Menu, Zap, Share2 } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import UploadZone from '@/components/UploadZone';
import SkeletonLoader from '@/components/SkeletonLoader';
import Dashboard from '@/components/Dashboard';
import { AnalysisResult, AnalysisStatus } from '@/lib/types';

// FE Agent — 분석 이력 타입
interface HistoryItem {
  id: string;
  companyName: string;
  date: string;
  status: 'active' | 'done';
  isFavorite: boolean;
  data: AnalysisResult;
}

// ─── Orchestration Agent: 메인 페이지 ───
// 모든 상태를 중앙 집중 관리, FE Agent 컴포넌트들을 조율
export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>('idle');
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 로컬 스토리지 데이터 로드
  useEffect(() => {
    const saved = localStorage.getItem('solv_ai_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load history', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // 로컬 스토리지 데이터 저장
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('solv_ai_history', JSON.stringify(history));
    }
  }, [history, isLoaded]);

  // Orchestration: 분석 시작 이벤트 처리
  const handleAnalysisStart = useCallback(() => {
    setAnalysisStatus('analyzing');
    setErrorMessage(null);
    setCurrentId(null);
    setCurrentResult(null);
  }, []);

  // Orchestration: BE Agent로부터 성공 응답 수신
  const handleAnalysisSuccess = useCallback((data: unknown) => {
    const result = data as AnalysisResult;
    const newId = Date.now().toString();

    setCurrentId(newId);
    setCurrentResult(result);
    setAnalysisStatus('done');

    // 이력에 추가 (FE Agent: 사이드바 이력 관리)
    const newItem: HistoryItem = {
      id: newId,
      companyName: result.company.name,
      date: '오늘',
      status: 'active',
      isFavorite: false,
      data: result,
    };

    setHistory(prev => {
      // 이전 active → done으로 변경
      const updated = prev.map(item => item.status === 'active' ? { ...item, status: 'done' as const } : item);
      return [newItem, ...updated];
    });
  }, []);

  // Orchestration: 에러 이벤트 처리 및 에스컬레이션
  const handleAnalysisError = useCallback((message: string) => {
    setAnalysisStatus('error');
    setErrorMessage(message);
    console.error('[Orchestrator] 분석 오류 수신:', message);
  }, []);

  // Orchestration: 이력 선택
  const handleSelectHistory = useCallback((id: string) => {
    const item = history.find(h => h.id === id);
    if (item) {
      setCurrentId(id);
      setCurrentResult(item.data);
      setAnalysisStatus('done');
      setHistory(prev => prev.map(h => ({
        ...h,
        status: h.id === id ? 'active' : h.status === 'active' ? 'done' : h.status
      })));
    }
    setSidebarOpen(false);
  }, [history]);

  // Orchestration: 즐겨찾기 토글
  const handleToggleFavorite = useCallback((id: string) => {
    setHistory(prev => prev.map(item =>
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    ));
  }, []);

  // Orchestration: 새 분석 시작
  const handleNewAnalysis = useCallback(() => {
    setAnalysisStatus('idle');
    setCurrentId(null);
    setCurrentResult(null);
    setErrorMessage(null);
    setHistory(prev => prev.map(h => h.status === 'active' ? { ...h, status: 'done' as const } : h));
  }, []);

  // 사이드바 이력 타입 변환
  const sidebarHistory = history.map(h => ({
    id: h.id,
    companyName: h.companyName,
    date: h.date,
    status: h.status,
    isFavorite: h.isFavorite,
  }));

  // 현재 보고 있는 항목의 즐겨찾기 상태
  const currentIsFavorite = history.find(h => h.id === currentId)?.isFavorite || false;

  return (
    <div className="flex h-screen overflow-hidden bg-dashboard">

      {/* FE Agent: 사이드바 */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewAnalysis={handleNewAnalysis}
        history={sidebarHistory}
        onSelectHistory={handleSelectHistory}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* 모바일 TopBar */}
        <header className="lg:hidden flex items-center justify-between px-4 h-14 bg-white border-b border-black/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-klein flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <span className="text-[15px] font-black text-gray-900">Solv AI</span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="메뉴 열기"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        </header>

        {/* 데스크톱 헤더 — 분석 완료 시 회사명 표시 */}
        {currentResult && (
          <header className="hidden lg:flex h-16 bg-white border-b border-black/10 items-center justify-between px-8 flex-shrink-0">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-black text-gray-900">{currentResult.company.name}</h2>
              {currentResult.company.creditRating && (
                <span className="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-full text-xs font-black">
                  {currentResult.company.creditRating}
                </span>
              )}
              {currentResult.company.industryRank && (
                <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-xs font-black">
                  업계 {currentResult.company.industryRank}
                </span>
              )}
            </div>
            <button 
              className="p-2.5 rounded-xl border border-black/10 text-gray-400 hover:bg-gray-50 hover:text-klein transition-all shadow-sm"
              title="분석 이력 공유"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </header>
        )}

        {/* 스크롤 영역 */}
        <main className="flex-1 overflow-y-auto">

          {/* 상태 라우팅 — Orchestration Agent 핵심 로직 */}

          {/* 상태 1: 유휴 — PDF 업로드 화면 */}
          {(analysisStatus === 'idle' || analysisStatus === 'error') && (
            <div>
              <UploadZone
                onAnalysisStart={handleAnalysisStart}
                onAnalysisSuccess={handleAnalysisSuccess}
                onAnalysisError={handleAnalysisError}
                isAnalyzing={false}
              />

              {/* 에러 메시지 */}
              {analysisStatus === 'error' && errorMessage && (
                <div className="max-w-2xl mx-auto px-8 pb-8">
                  <div className="p-5 bg-red-50 rounded-3xl border border-red-100">
                    <p className="text-sm font-black text-red-800 mb-1">⚠️ 분석 실패</p>
                    <p className="text-sm text-red-700 font-medium">{errorMessage}</p>
                    <button
                      onClick={handleNewAnalysis}
                      className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-xl text-sm font-bold hover:bg-red-200 transition-colors"
                    >
                      다시 시도
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 상태 2: 분석 중 — 스켈레톤 로더 */}
          {analysisStatus === 'analyzing' && <SkeletonLoader />}

          {/* 상태 3: 완료 — 결과 대시보드 */}
          {analysisStatus === 'done' && currentResult && (
            <Dashboard
              data={currentResult}
              isFavorite={currentIsFavorite}
              onToggleFavorite={() => currentId && handleToggleFavorite(currentId)}
              onReset={handleNewAnalysis}
            />
          )}

        </main>
      </div>
    </div>
  );
}
