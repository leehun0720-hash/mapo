import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "마포구청 콘텐츠 위생관리",
  description:
    "공공기관 홈페이지를 읽기 전용으로 전수 스캔해 중복·오표기·낡은 정보·사실 충돌을 찾고, 사람의 승인을 거쳐 수정 요청서와 RAG 인덱스 매니페스트를 만드는 진단·감시 도구",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen">
        <div className="flex min-h-screen">
          <Nav />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </body>
    </html>
  );
}
