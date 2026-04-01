# Solv AI — 기술 스킬 명세서 (skill.md)

> 이 문서는 Solv AI 프로젝트 구현에 필요한 기술 스택, 스킬 요구사항, 코딩 컨벤션을 정의합니다.

---

## 1. 프론트엔드 (Frontend)

### 1.1 핵심 기술 스택

| 기술 | 버전 | 용도 |
|---|---|---|
| HTML5 | - | 시맨틱 마크업, 접근성 |
| Vanilla CSS / Tailwind CSS | CDN v3 | 스타일링, 애니메이션 |
| JavaScript (ES6+) | - | 동적 렌더링, 인터랙션 |
| Lucide Icons | latest | UI 아이콘 시스템 |
| Pretendard | Variable | 한국어 최적화 폰트 |

### 1.2 디자인 시스템 토큰

```css
/* 색상 Variables */
--color-klein: #002FA7;        /* 브랜드 컬러, 버튼/강조 수치 */
--color-tertiary: #F0EFE9;     /* 대시보드 배경 */
--color-sidebar: #F7F7F5;      /* 사이드바 배경 */
--color-text-primary: #1A1A18; /* 기본 텍스트 */
--color-purple-accent: #534AB7; /* 통합 인사이트 배경 */

/* 폰트 설정 */
font-family: 'Pretendard', -apple-system, sans-serif;
font-size-display: 32px+, font-weight: 900 (Black)
font-size-metric: 36px+, font-weight: 900 (Black)
font-size-body: 15px, font-weight: 400 (Normal)
font-size-label: 11px, font-weight: 700 (Bold)

/* 테두리 반경 */
border-radius-card: 16px (rounded-2xl)
border-radius-modal: 40px (rounded-[40px])
border-radius-summary: 32px (rounded-[32px])
border-radius-persona: 24px (rounded-3xl)
```

### 1.3 레이아웃 아키텍처

```
[Body] h-screen, overflow-hidden, flex
  ├── [Mobile TopBar] lg:hidden, h-14
  ├── [Sidebar Overlay] fixed, z-30 (모바일 전용)
  ├── [Sidebar] w-[240px], flex-shrink-0
  │     ├── Logo + Brand (Solv AI + Klein Blue)
  │     ├── 새로운 재무분석 버튼 (Klein Blue, full-width)
  │     ├── 검색 버튼
  │     ├── 즐겨찾기 섹션
  │     ├── 최근 분석 이력 (스크롤 가능)
  │     └── 사용자 프로필 (하단 고정)
  └── [Main] flex-1, flex, flex-col, overflow-hidden
        ├── [Header] h-16, bg-white (Desktop 전용)
        │     ├── 회사명 + 신용등급/업계순위/WATCH 배지
        │     └── 분석 이력 공유 버튼
        └── [Dashboard] flex-1, overflow-y-auto, p-10
              ├── Company Info Header (h1, 태그 배지)
              ├── Metric Grid (4열 → 2열 → 1열)
              ├── Diagnosis + Trend 2열 레이아웃
              ├── Analysis Summary Card (rounded-[32px])
              ├── 4 Persona Grid (2x2)
              ├── Integrated Insight (보라색 배경)
              ├── Proposal Grid (3열 → 2열 → 1열)
              ├── Sales Scripts (아코디언)
              └── PDF Export 버튼
```

### 1.4 반응형 브레이크포인트

| 구분 | 클래스 | 핵심 지표 그리드 | 제안 그리드 | 페르소나 그리드 |
|---|---|---|---|---|
| Mobile | default | 1열 | 1열 | 1열 |
| Tablet | sm: (640px+) | 2열 | 2열 | 1열 |
| Desktop | lg: (1024px+) | 4열 | 3열 | 2열 |

### 1.5 애니메이션 스킬

```css
/* 페이드인 — 대시보드 로드 시 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade { animation: fadeIn 0.4s ease-out forwards; }

/* 슬라이드업 — 모달 팝업 시 */
@keyframes slideUp {
  from { transform: translateY(1rem); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.animate-slide-up { animation: slideUp 0.5s ease-out forwards; }

/* 호버 스케일 — 지표 카드 */
.hover\:scale-\[1\.02\]:hover { transform: scale(1.02); }

/* 사이드바 슬라이드 (모바일) */
transition: transform 300ms ease-in-out;
-translate-x-full (숨김) ↔ translate-x-0 (표시)
```

---

## 2. AI / 멀티모달 (AI & Multimodal)

### 2.1 Gemini 3.1 Pro API

```javascript
// 멀티모달 PDF 분석 요청 구조
const response = await fetch('/api/analyze', {
  method: 'POST',
  body: formData // PDF 파일 + 프롬프트
});

// Gemini API 호출 파라미터
{
  model: "gemini-3.1-pro-preview", // 또는 gemini-3.1-pro
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.3,   // 분석 일관성 위해 낮게 설정
    maxOutputTokens: 8192
  },
  contents: [
    { role: "user", parts: [
      { inlineData: { mimeType: "application/pdf", data: base64PDF } },
      { text: MASTER_PROMPT }
    ]}
  ]
}
```

### 2.2 마스터 프롬프트 구조 (Master Prompt Architecture)

```
[시스템 역할 설정]
당신은 법인 컨설팅 영업을 위한 AI 분석 전문가 팀입니다.

[분석 지시]
업로드된 재무제표 PDF를 분석하여 다음 섹션을 JSON 형식으로 출력하세요:
1. 기업 기본 정보 (company)
2. 핵심 재무 수치 (financials)  
3. 5개 재무 진단 항목 (diagnosis)
4. 기업 분석 요약 (summary)
5. 4인 전문가 페르소나 분석 (personas × 4)
6. 통합 영업 인사이트 (integratedInsight)
7. 핵심 컨설팅 제안 6개 (proposals)
8. 영업 스크립트 4단계 (scripts)

[출력 제약]
- 반드시 유효한 JSON만 출력 (마크다운 코드블록 제외)
- 모든 수치는 PDF에 실제 기재된 값 사용
- 추정값은 "추정" 명시
- 한국어로 출력 (수치/단위는 영문 병기 가능)
```

### 2.3 PDF 파싱 처리 스킬

```javascript
// PDF → Base64 변환
async function pdfToBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result.split(',')[1]);
    reader.readAsDataURL(file);
  });
}

// 파일 유효성 검사
function validatePDF(file) {
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.type !== 'application/pdf') throw new Error('PDF 파일만 업로드 가능합니다');
  if (file.size > maxSize) throw new Error('파일 크기가 50MB를 초과합니다');
  return true;
}
```

---

## 3. 백엔드 / API (Backend)

### 3.1 API 엔드포인트 설계

| Method | 경로 | 설명 |
|---|---|---|
| POST | `/api/analyze` | PDF 업로드 및 분석 요청 |
| GET | `/api/history` | 분석 이력 목록 조회 |
| GET | `/api/history/:id` | 특정 분석 결과 조회 |
| DELETE | `/api/history/:id` | 분석 이력 삭제 |
| POST | `/api/report/pdf` | 대표이사 제출용 PDF 생성 |
| POST | `/api/share` | 분석 이력 공유 링크 생성 |

### 3.2 미들웨어 스택

```javascript
// 요청 처리 순서
1. CORS 설정 (영업팀 도메인만 허용)
2. 파일 사이즈 제한 (multer: 50MB)
3. API 키 인증 (Bearer 토큰)
4. 속도 제한 (분당 10 요청/사용자)
5. 요청 로깅
```

### 3.3 데이터 관리

```javascript
// 분석 세션 데이터 구조
{
  sessionId: "uuid",
  userId: "string",
  companyName: "string",
  analysisResult: { /* JSON Schema */ },
  createdAt: "ISO8601",
  expiresAt: "ISO8601", // 24시간 후 자동 파기
  isStarred: false,
  shareToken: null
}
```

---

## 4. UI 컴포넌트 스킬 (Component Skills)

### 4.1 재무 지표 카드 (MetricCard)

```javascript
// 구현 패턴
function renderMetricCard({ label, value, unit, yoy, trend }) {
  const trendColor = trend > 0 ? 'text-blue-600' : 'text-red-500';
  const trendArrow = trend > 0 ? '↑' : '↓';
  return `
    <div class="bg-white p-6 rounded-2xl border border-black/5 shadow-md 
                transition-transform hover:scale-[1.02]">
      <p class="text-sm text-gray-500 mb-2 font-medium">${label}</p>
      <p class="text-3xl font-extrabold leading-tight tracking-tight text-klein">
        ${value}${unit}
      </p>
      <p class="text-sm font-bold mt-2 ${trendColor}">
        ${trendArrow} ${Math.abs(yoy)}%
      </p>
    </div>
  `;
}
```

### 4.2 재무 진단 카드 (DiagnosisCard) — Hierarchy Swap

```javascript
// Label 크고 굵게, Status 작고 얇게 (UI/UX 스펙 준수)
function renderDiagnosisCard({ label, status }) {
  const statusColor = {
    '양호': 'text-green-600',
    '보통': 'text-yellow-500', 
    '보통이하': 'text-red-500'
  }[status];
  return `
    <div class="bg-white p-4 rounded-xl text-center border border-black/5 
                shadow-sm flex flex-col justify-center">
      <p class="text-base text-gray-800 mb-1 font-black">${label}</p>
      <p class="text-[11px] font-bold ${statusColor} uppercase tracking-tighter">
        ${status}
      </p>
    </div>
  `;
}
```

### 4.3 영업 스크립트 아코디언 (ScriptAccordion)

```javascript
// 클릭 시 슬라이드 펼침 + 쉐브론 회전
function toggleScript(id) {
  const content = document.getElementById(`script-content-${id}`);
  const chevron = document.getElementById(`chevron-${id}`);
  content.classList.toggle('hidden');
  chevron.style.transform = content.classList.contains('hidden') 
    ? 'rotate(0deg)' 
    : 'rotate(180deg)';
}

// WWH 카드 색상 규칙
// What → text-blue-500
// Why  → text-green-500
// How  → text-amber-500
```

### 4.4 상세 제안 모달 (ProposalModal)

```javascript
// 모달 열기/닫기
function openModal() {
  const overlay = document.getElementById('modalOverlay');
  overlay.classList.remove('hidden');
  overlay.classList.add('flex');
}
function closeModal() {
  const overlay = document.getElementById('modalOverlay');
  overlay.classList.add('hidden');
  overlay.classList.remove('flex');
}

// 모달 구조: 
// - 배경: bg-black/60 backdrop-blur-md
// - 컨텐츠: max-w-2xl, rounded-[40px], max-h-[75vh] overflow-y-auto
// - 헤더: 태그 배지 + 제목 + X 버튼 (고정)
// - 본문: 현황 → 프로세스(Step 1~N) → 기대효과 그리드 → 전문가 코멘트
```

---

## 5. 보안 스킬 (Security)

### 5.1 데이터 보안

```javascript
// 세션 종료 시 임시 데이터 파기
window.addEventListener('beforeunload', () => {
  fetch('/api/session/cleanup', { method: 'DELETE', keepalive: true });
});

// 암호화 처리
// - HTTPS 필수 (TLS 1.3)
// - PDF 파일: 서버 전송 후 메모리에서만 처리 (디스크 저장 금지)
// - 분석 결과: AES-256 암호화 후 저장
// - API 키: 환경 변수 (process.env.GEMINI_API_KEY)
```

### 5.2 입력 유효성 검사

```javascript
// PDF 파일 검증
const ALLOWED_TYPES = ['application/pdf'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_PAGES = 100; // 최대 100페이지

// XSS 방지 — 동적 HTML 렌더링 시
function sanitize(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
```

---

## 6. PDF 보고서 생성 스킬 (Phase 3)

### 6.1 대표이사 제출용 PDF

```javascript
// 영업 전략 멘트 제거된 순수 재무 리포트
const REPORT_SECTIONS = [
  '기업 개요 및 기본 정보',
  '핵심 재무 지표 (4개)',
  '5개 재무 진단 결과',
  '3개년 수익성 추이',
  '컨설팅 제안 요약 (영업 스크립트 제외)',
  '기대 효과 수치'
];

// 생성 엔진: jsPDF + html2canvas OR Puppeteer (서버 사이드)
// 브랜드: Solv AI 로고 + Klein Blue 헤더
// 기밀: "영업 외부 유출 금지" 워터마크 제거 후 전달
```

---

## 7. 개발 환경 설정 (Dev Setup)

```bash
# 로컬 서버 실행
# 단순 HTML 버전 (현재 MVP)
open mock-up.html  # 브라우저에서 직접 열기

# Next.js 버전 (확장 시)
npx -y create-next-app@latest ./ --typescript --tailwind --eslint --app
npm run dev  # http://localhost:3000

# 환경 변수 설정
GEMINI_API_KEY=your_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 7.1 코딩 컨벤션

```
- 컴포넌트: camelCase 함수명 (renderMetricCard, openProposal)
- CSS 클래스: Tailwind 유틸리티 우선, 커스텀은 BEM 방식
- ID: kebab-case (script-content-1, modal-overlay)
- 데이터 구조: snake_case JSON 키
- 주석: 한국어로 기능 설명, 영어로 기술 상세
```

### 7.2 폴더 구조 (확장 시)

```
solv-ai/
├── app/
│   ├── page.tsx           # 메인 대시보드
│   ├── upload/page.tsx    # PDF 업로드 페이지
│   └── api/
│       ├── analyze/route.ts
│       ├── history/route.ts
│       └── report/route.ts
├── components/
│   ├── Sidebar.tsx
│   ├── MetricCard.tsx
│   ├── DiagnosisCard.tsx
│   ├── PersonaCard.tsx
│   ├── ProposalCard.tsx
│   ├── ProposalModal.tsx
│   ├── ScriptAccordion.tsx
│   └── TrendTable.tsx
├── lib/
│   ├── gemini.ts          # Gemini API 클라이언트
│   ├── pdfParser.ts       # PDF 처리 유틸
│   └── reportGenerator.ts # PDF 보고서 생성
└── types/
    └── analysis.ts        # TypeScript 타입 정의
```
