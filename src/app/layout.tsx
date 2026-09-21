import type { Metadata } from "next";
import { Gowun_Batang, IBM_Plex_Mono, IBM_Plex_Sans_KR } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CommandPalette } from "@/components/CommandPalette";

const sans = IBM_Plex_Sans_KR({ weight: ["400", "500", "600"], subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = IBM_Plex_Mono({ weight: ["400", "500", "600"], subsets: ["latin"], variable: "--font-mono", display: "swap" });
const serif = Gowun_Batang({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-serif", display: "swap" });

export const metadata: Metadata = {
  title: { default: "마포구청 콘텐츠 위생관리", template: "%s · 마포구청 콘텐츠 위생관리" },
  description:
    "공공기관 홈페이지를 읽기 전용으로 전수 스캔해 중복·오표기·낡은 정보·사실 충돌을 찾고, 사람의 승인을 거쳐 수정 요청서와 RAG 인덱스 매니페스트를 만드는 진단·감시 도구. 「마포구청 AI 웹핸드북」 영역 ③ 콘텐츠 정비의 실행 도구.",
  robots: { index: false },
};

// 밝게/어둡게 설정을 첫 그리기 전에 적용 (깜빡임 방지)
const themeInit = `try{var t=localStorage.getItem("mapo-hygiene-theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t);}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${sans.variable} ${mono.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="min-h-screen">
        <div className="flex flex-col lg:flex-row min-h-screen">
          <Nav />
          <div className="flex-1 min-w-0 flex flex-col">
            <main className="flex-1 min-w-0">{children}</main>
            <Footer />
          </div>
        </div>
        <CommandPalette />
      </body>
    </html>
  );
}
