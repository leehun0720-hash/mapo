import Link from "next/link";
import { HANDBOOK_LINKS, TENAI_URL } from "@/data/handbook";

export function Footer() {
  return (
    <footer className="ft mx-6 mt-10 mb-6 pt-4 border-t border-border text-[12px] text-muted flex flex-wrap gap-x-4 gap-y-1 justify-between">
      <span>
        © 2026 TenAI · 마포구청 콘텐츠 위생관리 — 시연용 표본 데이터 기준이며, 실제 수치는 첫 크롤 뒤 확정합니다. 원본은 수정하지 않고, 모든 처분은 사람이 승인합니다.
      </span>
      <span className="flex gap-3">
        <a href={HANDBOOK_LINKS.home} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
          AI 웹핸드북
        </a>
        <a href={TENAI_URL} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
          www.tenai.kr
        </a>
        <Link href="/help" className="hover:text-accent">
          도움말
        </Link>
      </span>
    </footer>
  );
}
