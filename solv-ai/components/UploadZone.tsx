'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, AlertCircle, Loader2 } from 'lucide-react';

interface UploadZoneProps {
  onAnalysisStart: () => void;
  onAnalysisSuccess: (data: unknown) => void;
  onAnalysisError: (message: string) => void;
  isAnalyzing: boolean;
}

// FE Agent — PDF 드래그앤드롭 업로드 컴포넌트
export default function UploadZone({
  onAnalysisStart,
  onAnalysisSuccess,
  onAnalysisError,
  isAnalyzing,
}: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 보안 Agent 게이트: 파일 유효성 검사 (클라이언트 측)
  const validateFile = (file: File): string | null => {
    if (file.type !== 'application/pdf') {
      return 'PDF 파일만 업로드 가능합니다.';
    }
    if (file.size > 50 * 1024 * 1024) {
      return `파일 크기가 50MB를 초과합니다. (현재: ${(file.size / 1024 / 1024).toFixed(1)}MB)`;
    }
    return null;
  };

  const handleFile = useCallback(async (file: File) => {
    const error = validateFile(file);
    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError(null);
    setSelectedFile(file);

    // 분석 시작
    onAnalysisStart();
    setUploadProgress(0);

    // 업로드 진행 상태 시뮬레이션
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 85) { clearInterval(progressInterval); return 85; }
        return prev + Math.random() * 10;
      });
    }, 400);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const json = await response.json();

      if (!response.ok || !json.success) {
        const msg = json.error?.message || '분석 서버 오류. 잠시 후 다시 시도해주세요.';
        onAnalysisError(msg);
        return;
      }

      onAnalysisSuccess(json.data);
    } catch {
      clearInterval(progressInterval);
      onAnalysisError('네트워크 오류가 발생했습니다. 인터넷 연결을 확인하세요.');
    } finally {
      setTimeout(() => {
        setUploadProgress(0);
        setSelectedFile(null);
      }, 1000);
    }
  }, [onAnalysisStart, onAnalysisSuccess, onAnalysisError]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8 min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-2xl">
        {/* 헤더 */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-klein mx-auto mb-5 flex items-center justify-center shadow-lg">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">
            재무제표 AI 분석
          </h1>
          <p className="text-base text-gray-500 font-medium leading-relaxed">
            법인 재무제표 PDF를 업로드하면<br />
            <strong className="text-gray-700">30초~2분</strong> 안에 맞춤형 영업 인사이트를 생성합니다
          </p>
        </div>

        {/* 업로드 존 */}
        <div
          id="upload-zone"
          className={`upload-zone p-12 text-center cursor-pointer transition-all
                      ${isDragOver ? 'drag-over' : ''}
                      ${isAnalyzing ? 'pointer-events-none opacity-70' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isAnalyzing && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleInputChange}
          />

          {isAnalyzing ? (
            /* 분석 중 상태 */
            <div className="space-y-6">
              <Loader2 className="w-12 h-12 text-klein mx-auto animate-spin" />
              <div>
                <p className="text-lg font-black text-gray-800 mb-1">
                  AI가 재무제표를 분석하고 있습니다...
                </p>
                <p className="text-sm text-gray-500 font-medium">
                  {selectedFile?.name || '파일 처리 중'}
                </p>
              </div>

              {/* 진행 상태 바 */}
              <div className="w-full max-w-sm mx-auto">
                <div className="flex justify-between text-xs text-gray-400 mb-2 font-bold">
                  <span>분석 진행 중</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-klein rounded-full transition-all duration-500"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>

              <p className="text-xs text-gray-400 font-medium">
                4인 전문가 페르소나 분석 + 영업 스크립트 생성 중...
              </p>
            </div>
          ) : (
            /* 유휴 상태 */
            <div className="space-y-5">
              <Upload className={`w-12 h-12 mx-auto transition-colors ${
                isDragOver ? 'text-klein' : 'text-gray-300'
              }`} />
              <div>
                <p className="text-lg font-black text-gray-700 mb-1">
                  PDF를 여기에 드롭하거나 클릭하여 선택
                </p>
                <p className="text-sm text-gray-400 font-medium">
                  최대 50MB · PDF 형식만 지원
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                {['재무제표', '손익계산서', '대차대조표', '현금흐름표'].map(tag => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-500">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 유효성 오류 */}
        {validationError && (
          <div className="mt-4 flex items-center gap-3 p-4 bg-red-50 rounded-2xl border border-red-100 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm font-bold text-red-700">{validationError}</p>
          </div>
        )}

        {/* 하단 안내 */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          {[
            { icon: '🔒', title: '보안 처리', desc: '분석 후 즉시 파일 삭제' },
            { icon: '⚡', title: '빠른 분석', desc: '30초~2분 내 완료' },
            { icon: '🎯', title: '맞춤 인사이트', desc: '4인 페르소나 + 영업 스크립트' },
          ].map(item => (
            <div key={item.title} className="text-center p-4 bg-white/60 rounded-2xl border border-black/5">
              <div className="text-2xl mb-2">{item.icon}</div>
              <p className="text-[13px] font-black text-gray-800">{item.title}</p>
              <p className="text-[11px] text-gray-400 mt-0.5 font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
