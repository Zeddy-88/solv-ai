// Solv AI — 공유 TypeScript 타입 정의
// DB Agent · BE Agent · FE Agent 공통 사용

export interface CompanyInfo {
  name: string;
  industry: string;
  employees: number;
  founded: number;
  creditRating: string;
  industryRank: string;
}

export interface FinancialData {
  revenue: { value: number; unit: string; yoy: number };
  operatingMargin: { value: number; unit: string; yoy: number };
  netIncome: { value: number; unit: string; yoy: number };
  debtRatio: { value: number; unit: string; industryAvg: number };
  trends: Array<{
    year: number;
    revenue: number;
    operatingProfit: number;
    netIncome: number;
  }>;
}

export type DiagnosisGrade = '양호' | '보통' | '보통이하';

export interface Diagnosis {
  growth: DiagnosisGrade;
  profitability: DiagnosisGrade;
  financialStructure: DiagnosisGrade;
  debtRepayment: DiagnosisGrade;
  activity: DiagnosisGrade;
}

export interface Summary {
  headline: string;
  tags: string[];
  body: string;
}

export type PersonaColor = 'blue' | 'green' | 'purple' | 'amber';

export interface Persona {
  name: string;
  role: string;
  opinion: string;
  key: string;
  color: PersonaColor;
  icon: string;
}

export type ProposalTag = '긴급' | '즉시' | '추천' | '검토';
export type ProposalColor = 'red' | 'blue' | 'green';

export interface ProposalDetail {
  summary: string;
  steps: string[];
  effects: [string, string][];
  note: string;
}

export interface Proposal {
  key: string;
  tag: ProposalTag;
  color: ProposalColor;
  title: string;
  desc: string;
  detail: ProposalDetail;
}

export interface ScriptWWH {
  what: string;
  why: string;
  how: string;
}

export type ScriptType = '오프닝' | '문제 제시' | '해결안' | '클로징';

export interface Script {
  id: number;
  type: ScriptType;
  tag: string;
  script: string;
  wwh: ScriptWWH;
}

export interface AnalysisResult {
  company: CompanyInfo;
  financials: FinancialData;
  diagnosis: Diagnosis;
  summary: Summary;
  personas: Persona[];
  integratedInsight: string;
  proposals: Proposal[];
  scripts: Script[];
}

export type AnalysisStatus = 'idle' | 'uploading' | 'analyzing' | 'done' | 'error';

export interface AnalysisState {
  status: AnalysisStatus;
  result: AnalysisResult | null;
  error: string | null;
  progress: number; // 0-100
}
