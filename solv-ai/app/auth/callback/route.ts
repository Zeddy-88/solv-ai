import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'

/**
 * OAuth 인증 후 리다이렉트되어 세션을 생성하는 콜백 엔드포인트입니다.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // 'next' 파라미터가 있으면 그곳으로, 없으면 루트로 이동
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    
    console.error('Auth callback error:', error)
  }

  // 에러 발생 시 에러 페이지 또는 루트로 리다이렉트
  return NextResponse.redirect(`${origin}/auth/auth-error`)
}
