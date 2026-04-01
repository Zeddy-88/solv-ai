/* 
  Solv AI — Phase 4 Database Schema 
  PostgreSQL (Supabase SQL Editor용)
*/

-- 1. 기업 정보 테이블 (중복 분석 방지 및 통계용)
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  industry TEXT,
  employees INT,
  founded INT,
  credit_rating TEXT,
  industry_rank TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 분석 결과 테이블 (영구 저장 및 공유용)
CREATE TABLE IF NOT EXISTS public.analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL, -- 검색 최적화용 역정규화
  result_json JSONB NOT NULL, -- AnalysisResult 전문 저장
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스 생성 (검색 성능 최적화)
CREATE INDEX IF NOT EXISTS idx_analyses_company_name ON public.analyses(company_name);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON public.analyses(created_at DESC);

-- RLS (Row Level Security) 설정 (초기에는 public 읽기 허용)
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for analyses" ON public.analyses
  FOR SELECT USING (true);

CREATE POLICY "Public insert access for analyses" ON public.analyses
  FOR INSERT WITH CHECK (true);
