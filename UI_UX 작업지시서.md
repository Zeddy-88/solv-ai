# **\[UI/UX Spec\] Solv AI 디자인 가이드라인 v2.0**

## **1\. 디자인 원칙**

* **Focused Clarity**: 큰 화면에서 콘텐츠가 분산되지 않도록 중앙 집중형 레이아웃 적용.  
* **Professional Minimal**: 불필요한 아이콘을 배제하고 텍스트의 두께와 크기(Typography Hierarchy)로 정보를 구분.  
* **Responsive Trust**: 어떤 기기에서도 데이터가 깨지지 않고 신뢰감 있게 전달됨.

## **2\. 비주얼 시스템**

* **Color Palette**:  
  * Klein Blue (\#002FA7): 브랜드 핵심 컬러. 수치 및 강조 텍스트에 사용.  
  * Tertiary Beige (\#F0EFE9): 대시보드 배경색. 눈의 피로도 저하 및 고급스러운 분위기.  
  * Sidebar Gray (\#F7F7F5): 보조 네비게이션 영역.  
* **Typography**:  
  * Primary Font: Pretandard (Variable Font 권장).  
  * Emphasis: 분석 리포트 제목(32px+, Black), 핵심 수치(36px+, Black).

## **3\. 레이아웃 상세 (Layout Architecture)**

### **3.1. PC/Desktop (Max-width 6xl)**

* **Centered Container**: 전체 메인 콘텐츠는 max-w-6xl (약 1152px) 내에 배치하고 중앙 정렬(mx-auto).  
* **Sidebar**: 왼쪽 240px 고정 네비게이션.  
* **Main Scroll**: 대시보드 영역만 별도 스크롤 처리하여 상단 헤더 고정 효과 유지.

### **3.2. Mobile/Tablet (Responsive)**

* **Sidebar**: 화면 왼쪽 밖으로 숨김 처리(-translate-x-full). 햄버거 메뉴 버튼 클릭 시 오버레이로 노출.  
* **Top Bar**: 모바일 전용 상단바 노출 (로고 \+ 메뉴 버튼).  
* **Grid Transformation**:  
  * 핵심 지표: 4열 → 모바일 1열 / 태블릿 2열.  
  * 페르소나/제안 포인트: 수평 배치를 수직 스택으로 전환.

## **4\. 컴포넌트 상세 가이드**

### **4.1. 재무진단 카드 (Hierarchy Swap)**

* **Label**: '성장성', '수익성' 등 항목명을 **크고 굵게(font-black)** 표시.  
* **Status**: '양호', '보통이하' 등 결과값은 **작고 얇게(text-\[11px\] font-bold)** 상단 혹은 하단에 배치하여 항목 자체를 먼저 인지하게 함.

### **4.2. 영업 스크립트 섹션**

* **Font Setting**: 본문 폰트 크기는 15px, 두께는 font-normal로 설정하여 가독성 확보.  
* **Interaction**: 카드 제목 클릭 시 멘트와 WWH 데이터가 슬라이드 방식으로 펼쳐짐.

### **4.3. 상세 제안 모달 (Fullscreen Overlay)**

* **Design**: 반투명 어두운 배경(bg-black/75) 위에 흰색 라운드 박스(rounded-\[48px\]) 배치.  
* **Header**: 제안 항목명과 상태 뱃지를 상단에 고정.  
* **Content**: 세로 스크롤을 지원하며, '기대 효과' 섹션은 3열 그리드로 시각적 재미 부여.

## **5\. 인터랙션 요구사항**

* **Hover Effect**: 제안 포인트 카드 및 분석 이력 리스트는 마우스 오버 시 미세한 그림자 확대 및 배경색 변화 적용.  
* **Transition**: 모달 팝업 및 사이드바 노출 시 ease-out 애니메이션을 사용하여 부드러운 전환 제공.