'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  BarChart3, 
  Users, 
  Zap, 
  TrendingUp, 
  Star, 
  ArrowLeft, 
  Loader2,
  Calendar,
  CreditCard,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';

interface Stats {
  totalPointsCharged: number;
  totalPointsUsed: number;
  totalAnalyses: number;
  avgRating: number;
  totalUsers: number;
}

interface UserSearch {
  email: string;
  amount: number;
  description: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
}

interface RecentAnalysis {
  id: string;
  company_name: string;
  created_at: string;
  rating: number | null;
  feedback: string | null;
  user_email?: string;
}

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: string;
  description: string;
  created_at: string;
}

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalPointsCharged: 0,
    totalPointsUsed: 0,
    totalAnalyses: 0,
    avgRating: 0,
    totalUsers: 0
  });
  const [recentAnalyses, setRecentAnalyses] = useState<RecentAnalysis[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [grantForm, setGrantForm] = useState<UserSearch>({
    email: '',
    amount: 10,
    description: '이벤트/특별 지급 포인트',
    status: 'idle'
  });
  const supabase = createClient();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. 통계 데이터 (트랜잭션 합계)
      const { data: txData } = await supabase.from('credit_transactions').select('amount, type');
      const charged = txData?.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0) || 0;
      const used = txData?.filter(t => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0) || 0;

      // 2. 분석 및 피드백 데이터
      const { data: analyses } = await supabase
        .from('analyses')
        .select('id, company_name, created_at, rating, feedback')
        .order('created_at', { ascending: false })
        .limit(10);

      // 3. 전체 분석 평균 평점
      const { data: ratings } = await supabase.from('analyses').select('rating').not('rating', 'is', null);
      const avg = ratings && ratings.length > 0 
        ? ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length 
        : 0;

      // 4. 전체 유저 수
      const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

      // 5. 최근 트랜잭션
      const { data: recentTxs } = await supabase
        .from('credit_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      setStats({
        totalPointsCharged: charged,
        totalPointsUsed: used,
        totalAnalyses: analyses?.length || 0,
        avgRating: Number(avg.toFixed(1)),
        totalUsers: userCount || 0
      });
      setRecentAnalyses(analyses || []);
      setTransactions(recentTxs || []);

    } catch (error) {
      console.error('Admin Data Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGrantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGrantForm(prev => ({ ...prev, status: 'loading' }));
    
    try {
      const res = await fetch('/api/admin/grant-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetEmail: grantForm.email,
          amount: grantForm.amount,
          description: grantForm.description
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setGrantForm(prev => ({ ...prev, status: 'success', message: data.message }));
        fetchAdminData(); // 데이터 새로고침
        setTimeout(() => setGrantForm(prev => ({ ...prev, status: 'idle', message: '' })), 3000);
      } else {
        setGrantForm(prev => ({ ...prev, status: 'error', message: data.error }));
      }
    } catch (err) {
      setGrantForm(prev => ({ ...prev, status: 'error', message: 'API 통신 오류' }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-klein animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-12">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-klein transition-colors mb-3 text-sm font-bold">
              <ArrowLeft className="w-4 h-4" />
              서비스로 돌아가기
            </Link>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">관리자 대시보드</h1>
            <p className="text-gray-500 font-medium">Solv AI 서비스 운영 및 결제 현황</p>
          </div>
          <button 
            onClick={fetchAdminData}
            className="px-6 py-3 bg-white border border-gray-200 rounded-2xl font-bold text-[14px] hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
          >
            데이터 새로고침
          </button>
        </div>

        {/* 요약 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard 
            icon={<CreditCard className="w-6 h-6 text-blue-600" />}
            label="누적 포인트 합계"
            value={`${stats.totalPointsCharged.toLocaleString()} P`}
            subValue={`약 ${(stats.totalPointsCharged * 1000).toLocaleString()} 원`}
            color="blue"
          />
          <StatCard 
            icon={<Zap className="w-6 h-6 text-amber-600" />}
            label="누적 분석 차감량"
            value={`${stats.totalPointsUsed.toLocaleString()} P`}
            subValue={`${Math.floor(stats.totalPointsUsed / 2)} 회 분석`}
            color="amber"
          />
          <StatCard 
            icon={<Star className="w-6 h-6 text-yellow-500" />}
            label="평균 분석 만족도"
            value={`${stats.avgRating} / 5.0`}
            subValue="사용자 피드백 기반"
            color="yellow"
          />
          <StatCard 
            icon={<Users className="w-6 h-6 text-emerald-600" />}
            label="가입 사용자 수"
            value={`${stats.totalUsers.toLocaleString()} 명`}
            subValue="누적 기준"
            color="emerald"
          />
        </div>

        {/* [Phase 11.4] 포인트 수동 지급 관리 도구 */}
        <div className="bg-white rounded-[32px] border-2 border-klein/10 p-8 mb-10 shadow-lg shadow-klein/5">
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            <div className="flex-1">
              <h3 className="text-xl font-black text-gray-900 mb-2 flex items-center gap-2">
                <Zap className="w-5 h-5 text-klein fill-klein" />
                사용자 포인트 수동 지급
              </h3>
              <p className="text-gray-500 text-sm font-medium">관리자 권한으로 특정 사용자(이메일 기준)에게 보너스 또는 보상 포인트를 부여합니다.</p>
            </div>
            
            <form onSubmit={handleGrantSubmit} className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">사용자 이메일</label>
                <input 
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={grantForm.email}
                  onChange={e => setGrantForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[14px] font-bold focus:outline-none focus:ring-2 focus:ring-klein/20 transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">지급 포인트 (P)</label>
                <div className="flex gap-2">
                  <input 
                    type="number"
                    required
                    value={grantForm.amount}
                    onChange={e => setGrantForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[14px] font-bold focus:outline-none focus:ring-2 focus:ring-klein/20 transition-all"
                  />
                  <button 
                    disabled={grantForm.status === 'loading'}
                    className={`px-6 rounded-xl font-black text-[14px] transition-all flex items-center gap-2 ${
                      grantForm.status === 'loading' ? 'bg-gray-100 text-gray-400' : 
                      grantForm.status === 'success' ? 'bg-emerald-500 text-white' : 'bg-klein text-white hover:bg-black active:scale-95'
                    }`}
                  >
                    {grantForm.status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : '포인트 지급'}
                  </button>
                </div>
              </div>
              {grantForm.message && (
                <div className={`col-span-1 md:col-span-2 text-[12px] font-bold px-4 py-2 rounded-lg mt-2 ${
                  grantForm.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                }`}>
                  {grantForm.message}
                </div>
              )}
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 최근 분석 리스트 & 피드백 */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-klein" />
                  최근 분석 및 피드백
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                      <th className="px-8 py-4">기업명</th>
                      <th className="px-8 py-4">분석 일시</th>
                      <th className="px-8 py-4">별점</th>
                      <th className="px-8 py-4">피드백</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentAnalyses.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-8 py-5 text-[14px] font-bold text-gray-800">{item.company_name}</td>
                        <td className="px-8 py-5 text-[13px] text-gray-500 font-medium">
                          {new Date(item.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-5">
                          {item.rating ? (
                            <div className="flex items-center gap-1 text-yellow-400 font-black text-[13px]">
                              <Star className="w-3 h-3 fill-current" />
                              {item.rating}
                            </div>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-[12px] text-gray-500 font-medium max-w-[200px] truncate" title={item.feedback || ''}>
                            {item.feedback || <span className="text-gray-300 italic">의견 없음</span>}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 최근 트랜잭션 로그 */}
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-[32px] shadow-2xl p-8 text-white">
              <h3 className="text-lg font-black mb-6 flex items-center gap-2 text-blue-400">
                <Calendar className="w-5 h-5" />
                충전/사용 실시간 로그
              </h3>
              <div className="space-y-5">
                {transactions.map(tx => (
                  <div key={tx.id} className="flex items-start gap-4 border-b border-white/5 pb-4 last:border-0 last:pb-0">
                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${tx.amount > 0 ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]' : 'bg-amber-400'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1 gap-2">
                        <p className="text-[13px] font-bold truncate leading-tight">{tx.description}</p>
                        <span className={`text-[13px] font-black shrink-0 ${tx.amount > 0 ? 'text-blue-400' : 'text-amber-400'}`}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount}P
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 font-medium">
                        {new Date(tx.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-8 py-3 rounded-xl bg-white/5 border border-white/10 text-[12px] font-bold text-gray-400 hover:bg-white/10 hover:text-white transition-all">
                전체 내역 보기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subValue, color }: { icon: React.ReactNode, label: string, value: string, subValue: string, color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  };

  return (
    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-lg shadow-gray-200/40 group hover:-translate-y-1 transition-all">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border ${colorMap[color]}`}>
        {icon}
      </div>
      <p className="text-[13px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-black text-gray-900 mb-2">{value}</p>
      <p className="text-[12px] text-gray-500 font-medium">{subValue}</p>
    </div>
  );
}
