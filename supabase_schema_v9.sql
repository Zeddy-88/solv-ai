/* 
  Solv AI — Phase 9 Monetization & Credit Schema 
  PostgreSQL (Supabase SQL Editor용)
*/

-- 1. 사용자 프로필 테이블 (Auth 연동)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  credits INT DEFAULT 0 CHECK (credits >= 0),
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 크레딧 거래 내역 테이블
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INT NOT NULL, -- + (충전) 또는 - (사용)
  type TEXT NOT NULL, -- 'CHARGE', 'USAGE', 'REFUND', 'PROMOTION'
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 설정
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view own transactions" ON public.credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- 신규 가입 시 기본 크레딧(1회) 지급 트리거 함수
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, credits)
  VALUES (new.id, new.email, 4); -- 최초 가입 시 4포인트 (2회 분석분) 증정

  INSERT INTO public.credit_transactions (user_id, amount, type, description)
  VALUES (new.id, 4, 'PROMOTION', 'Welcome bonus (4 Points)');

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 연결
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
