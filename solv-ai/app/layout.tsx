import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Solv AI — 법인 재무분석 영업 인텔리전스",
  description: "PDF 한 장으로 CEO 미팅 전 30초 안에 핵심 재무 리스크를 파악하는 AI 영업 도구",
  keywords: "재무분석, 영업 인텔리전스, AI, 법인, 소상공인, 컨설팅",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
