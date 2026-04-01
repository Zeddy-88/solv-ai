import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * 특정 HTML 요소를 PDF로 변환하여 다운로드합니다.
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
    // 1. html2canvas로 요소를 캔버스로 변환
    // scale을 높여서 해상도를 확보합니다.
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true, // 외부 이미지(아이콘 등) 허용
      logging: false,
      backgroundColor: '#F0EFE9', // 대시보드 배경색과 일치
    });

    const imgData = canvas.toDataURL('image/png');

    // 2. jspdf로 PDF 생성 (A4 사이즈)
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    // 3. 이미지 추가
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

    // 4. 다운로드
    pdf.save(`${fileName}.pdf`);
    
    return true;
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw error;
  }
}
