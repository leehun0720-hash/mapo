"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const STEPS = [
  { href: "/", label: "현황 확인" },
  { href: "/issues", label: "검토·승인" },
  { href: "/exports", label: "결과 내려받기" },
];

export function WorkspaceHeader() {
  const path = usePathname();
  return <header className="workspace-header no-print">
    <div className="workspace-top"><span>마포구청 <span className="text-muted">/ 홈페이지 콘텐츠 관리</span></span><Link href="/help" className="text-accent">처음 사용하시나요? 사용 안내 →</Link></div>
    <div className="demo-notice"><b>시연 환경</b><span>예시 데이터로 작업합니다. 변경 내용은 현재 브라우저에 저장되며, 실제 홈페이지에는 반영되지 않습니다.</span></div>
    <nav aria-label="기본 업무 순서" className="workflow-nav">
      {STEPS.map((step, index) => <Link key={step.href} href={step.href} aria-current={path === step.href ? "step" : undefined}><span>{index + 1}</span>{step.label}</Link>)}
    </nav>
  </header>;
}
