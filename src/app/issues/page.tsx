import { Suspense } from "react";
import { IssueQueue } from "@/components/IssueQueue";

export default function IssuesPage() {
  return (
    <Suspense fallback={<div className="p-6 text-muted">불러오는 중…</div>}>
      <IssueQueue />
    </Suspense>
  );
}
