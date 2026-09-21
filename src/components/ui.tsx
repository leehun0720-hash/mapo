import type { Grade, IssueStatus, Severity } from "@/lib/types";
import { SEVERITY_LABEL, STATUS_LABEL } from "@/data/messages";

const SEV: Record<Severity, string> = {
  critical: "text-critical border-critical/50",
  high: "text-high border-high/50",
  medium: "text-medium border-medium/50",
  low: "text-low border-low/50",
};
const SEV_MARK: Record<Severity, string> = { critical: "!!", high: "!", medium: "•", low: "·" };

/** 색만으로 구분하지 않는다 — 기호 + 글자 병기 */
export function SeverityBadge({ s }: { s: Severity }) {
  return (
    <span className={`inline-flex items-center gap-1 border rounded px-1.5 py-0.5 text-[11px] font-medium ${SEV[s]}`}>
      <span aria-hidden>{SEV_MARK[s]}</span>
      {SEVERITY_LABEL[s]}
    </span>
  );
}

export function StatusBadge({ s }: { s: IssueStatus }) {
  const cls =
    s === "approved" ? "bg-accent-soft text-accent" : s === "fixed" ? "text-low border border-low/40" : s === "regressed" ? "text-critical border border-critical/40" : s === "rejected" || s === "deferred" ? "text-muted border border-border" : "border border-border";
  return <span className={`inline-block rounded px-1.5 py-0.5 text-[11px] ${cls}`}>{STATUS_LABEL[s]}</span>;
}

export function GradeBadge({ g }: { g: Grade }) {
  return (
    <span className={`inline-block rounded px-1.5 py-0.5 text-[11px] ${g === "suggest" ? "bg-accent-soft text-accent" : "text-muted border border-border"}`}>
      {g === "suggest" ? "자동 제안" : "관찰"}
    </span>
  );
}

export function PageHeader({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-3">
      <div>
        <h1 className="text-[20px] font-semibold leading-tight">{title}</h1>
        {sub && <p className="text-muted text-[13px] mt-1">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  onClick,
  tone,
}: {
  label: string;
  value: string | number;
  hint?: string;
  onClick?: () => void;
  tone?: "critical" | "accent";
}) {
  const inner = (
    <>
      <div className="text-[12px] text-muted">{label}</div>
      <div className={`text-[24px] font-semibold leading-tight mt-1 ${tone === "critical" ? "text-critical" : tone === "accent" ? "text-accent" : ""}`}>{value}</div>
      {hint && <div className="text-[11px] text-muted mt-1">{hint}</div>}
    </>
  );
  return onClick ? (
    <button onClick={onClick} className="card p-4 text-left hover:border-accent transition-colors" type="button">
      {inner}
    </button>
  ) : (
    <div className="card p-4">{inner}</div>
  );
}

export function Empty({ text }: { text: string }) {
  return <div className="text-muted text-[13px] py-10 text-center">{text}</div>;
}
