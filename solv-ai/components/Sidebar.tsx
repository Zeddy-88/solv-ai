'use client';

import { X, Plus, Search, Star, Settings, Zap, ChevronRight } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewAnalysis: () => void;
  history: Array<{ id: string; companyName: string; date: string; status: 'active' | 'done'; isFavorite: boolean }>;
  onSelectHistory: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

// FE Agent — 사이드바 컴포넌트
export default function Sidebar({ isOpen, onClose, onNewAnalysis, history, onSelectHistory, onToggleFavorite }: SidebarProps) {
  const favorites = history.filter(h => h.isFavorite);
  const recents = history.filter(h => !h.isFavorite);

  const statusColor = (status: string) => {
    if (status === 'active')   return 'bg-[#378ADD]';
    return 'bg-[#639922]'; // 'done'
  };

  return (
    <>
      {/* 모바일 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* 사이드바 */}
      <aside
        id="sidebar"
        className={`
          fixed top-0 left-0 h-full w-[240px] bg-sidebar z-50
          flex flex-col border-r border-black/10
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* 로고 영역 */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-black/8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-klein flex items-center justify-center shadow-sm">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-[15px] font-black text-gray-900 tracking-tight">Solv AI</span>
          </div>
          {/* 모바일 닫기 버튼 */}
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-black/5 text-gray-400 lg:hidden transition-colors"
            aria-label="사이드바 닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 새로운 재무분석 버튼 */}
        <div className="px-4 py-4">
          <button
            id="new-analysis-btn"
            onClick={() => { onNewAnalysis(); onClose(); }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4
                       bg-klein text-white rounded-xl font-bold text-[14px]
                       hover:opacity-90 active:scale-[0.98] transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            새로운 재무분석
          </button>
        </div>

        {/* 검색 버튼 */}
        <div className="px-4 pb-2">
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl
                             text-gray-500 hover:bg-white transition-colors text-[13px] font-medium">
            <Search className="w-4 h-4" />
            분석 이력 검색
          </button>
        </div>

        <div className="h-px bg-black/10 mx-5 my-2" />

        {/* 즐겨찾기 */}
        {favorites.length > 0 && (
          <>
            <div className="px-5 pt-3 pb-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                즐겨찾기
              </span>
            </div>
            <div className="px-3 space-y-0.5">
              {favorites.map(item => (
                <button
                  key={item.id}
                  onClick={() => onSelectHistory(item.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                             hover:bg-white transition-colors group text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-yellow-50 flex items-center justify-center
                                  text-[11px] font-black text-yellow-600 flex-shrink-0">
                    {item.companyName.charAt(0)}
                  </div>
                  <span className="text-[13px] font-medium text-gray-700 truncate flex-1">
                    {item.companyName}
                  </span>
                  <Star
                    className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 flex-shrink-0 cursor-pointer hover:scale-110 transition-transform"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(item.id);
                    }}
                  />
                </button>
              ))}
            </div>
            <div className="h-px bg-black/10 mx-5 my-2" />
          </>
        )}

        {/* 최근 분석 이력 */}
        <div className="px-5 pt-3 pb-2">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            최근 분석 이력
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-0.5 pb-4">
          {recents.length === 0 ? (
            <div className="px-3 py-6 text-center">
              <p className="text-[12px] text-gray-400 font-medium">
                분석 이력이 없습니다
              </p>
              <p className="text-[11px] text-gray-300 mt-1">
                PDF를 업로드하여 시작하세요
              </p>
            </div>
          ) : (
            recents.map(item => (
              <button
                key={item.id}
                onClick={() => onSelectHistory(item.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                           hover:bg-white transition-colors group text-left"
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusColor(item.status)}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-gray-700 truncate">{item.companyName}</p>
                  <p className="text-[11px] text-gray-400">{item.date}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(item.id);
                  }}
                  className="p-1 rounded-md hover:bg-black/5 text-gray-300 hover:text-yellow-400 transition-colors"
                >
                  <Star className="w-3.5 h-3.5" />
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-400 flex-shrink-0" />
              </button>
            ))
          )}
        </div>

        {/* 사용자 프로필 (하단 고정) */}
        <div className="border-t border-black/10 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-klein flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[11px] font-black">S</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-gray-800 truncate">사용자</p>
              <p className="text-[11px] text-gray-400">영업 담당자</p>
            </div>
            <button className="p-1.5 rounded-lg hover:bg-black/5 transition-colors">
              <Settings className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
