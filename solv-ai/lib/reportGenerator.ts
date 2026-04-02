import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { AnalysisResult } from './types';

/**
 * 특정 HTML 요소를 PDF로 변환하여 다운로드합니다. (멀티 페이지 지원)
 * @param elementId 캡처할 요소의 ID
 * @param fileName 저장할 파일명
 */
export async function generatePDF(elementId: string, fileName: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found:', elementId);
    return;
  }

  try {
    // 1. html2canvas로 요소를 캡처 (A4 너비 기준으로 스케일 조정)
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#FFFFFF', // 인쇄 품질을 위해 흰색 배경 권장
      windowWidth: 1200, // 일관된 레이아웃을 위해 윈도우 너비 고정
    });

    const imgData = canvas.toDataURL('image/png');
    
    // 2. jspdf로 PDF 생성 (A4 사이즈)
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // 캔버스 크기를 mm 단위로 변환
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    // 3. 첫 페이지 추가
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // 4. 내용이 남았다면 다음 페이지 계속 추가 (멀티 페이지 분할)
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // 5. 다운로드
    pdf.save(`${fileName}.pdf`);
    return true;
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw error;
  }
}

/**
 * 분석 결과를 CSV 파일로 추출하여 다운로드합니다.
 * @param data AnalysisResult 데이터
 * @param fileName 저장할 파일명
 */
export function exportToCSV(data: AnalysisResult, fileName: string) {
  try {
    const { company, financials, diagnosis } = data;
    
    // 1. CSV 데이터 구성 (재무 추이 중심)
    let csvRows = [];
    
    // 헤더 섹션
    csvRows.push(['Solv AI Business Analysis Report']);
    csvRows.push(['Company', company.name]);
    csvRows.push(['Industry', company.industry]);
    csvRows.push(['Date', new Date().toLocaleDateString()]);
    csvRows.push([]); // 빈 줄

    // 3개년 경영 실적 테이블
    csvRows.push(['[Financial Trends]']);
    const years = financials.trends.map(t => `${t.year} Year`);
    csvRows.push(['Category', ...years]);
    
    csvRows.push(['Revenue (100M KRW)', ...financials.trends.map(t => t.revenue.toLocaleString())]);
    csvRows.push(['Operating Profit (1M KRW)', ...financials.trends.map(t => (t.operatingProfit * 100).toLocaleString())]);
    csvRows.push(['Net Income (1M KRW)', ...financials.trends.map(t => (t.netIncome * 100).toLocaleString())]);
    csvRows.push([]);

    // 11대 진단 섹션
    csvRows.push(['[Diagnosis Results]']);
    csvRows.push(['Domain', 'Grade', 'Value']);
    
    const diagnosisItems = [
      { label: 'Growth', data: diagnosis.growth },
      { label: 'Profitability', data: diagnosis.profitability },
      { label: 'Fin. Structure', data: diagnosis.financialStructure },
      { label: 'Liquidity', data: diagnosis.liquidity },
      { label: 'Debt Repayment', data: diagnosis.debtRepayment },
      { label: 'Interest Coverage', data: diagnosis.interestCoverage },
      { label: 'Cost Ratio', data: diagnosis.costRatio },
      { label: 'Personnel Cost', data: diagnosis.personnelCost },
      { label: 'Cap. Efficiency', data: diagnosis.capitalEfficiency },
      { label: 'Activity', data: diagnosis.activity },
      { label: 'Accounts Receivable', data: diagnosis.accountsReceivable },
    ];

    diagnosisItems.forEach(item => {
      const isOld = typeof item.data === 'string';
      const grade = isOld ? item.data : (item.data as any).grade;
      const value = isOld ? 'N/A' : (item.data as any).value;
      csvRows.push([item.label, grade, value]);
    });

    // 2. CSV 문자열 결합 (Excel 호환을 위한 BOM 추가)
    const csvContent = "\uFEFF" + csvRows.map(row => row.join(',')).join('\n');
    
    // 3. Blob 및 다운로드 링크 생성
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error('CSV export failed:', error);
    return false;
  }
}

