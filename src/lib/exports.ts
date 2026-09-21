// 구성명세서 6.6 내보내기 — manifest.json, canonical_map.csv, redirect_map.csv, title_fixes.csv,
// noindex_list.csv, sitemap.xml, kpi.json, tickets.xlsx(별도 xlsx.ts)

import { CLUSTERS, DOCS, docById } from "@/data/docs";
import { SITES, siteById } from "@/data/sites";
import { CURRENT_RUN, KPI_SERIES, RUNS } from "@/data/kpi";
import { readiness } from "@/lib/score";
import type { Doc, Issue, Readiness } from "@/lib/types";

export interface ManifestDoc {
  doc_id: number;
  canonical_url: string;
  alias_urls: string[];
  index: "include" | "exclude" | "hold";
  reason_codes: string[];
  authority: number;
  page_type: string;
  title: string | null;
  title_override: string | null;
  department: string | null;
  lang: string;
  content_sha256: string;
  posted_at: string | null;
  last_verified: string;
  valid_until: string | null;
}

export interface Manifest {
  manifest_version: "1.0";
  generated_at: string;
  run_id: number;
  org: string;
  policy: { approved_only: boolean; board_index_months: number };
  documents: ManifestDoc[];
  facts: { subject: string; attribute: string; qualifier: string; value: Record<string, unknown>; source_doc_id: number; status: "verified" }[];
}

const BOARD_INDEX_MONTHS = 24;
const TODAY = "2026-09-21";

function monthsAgo(date: string | null): number {
  if (!date) return 0;
  const d = new Date(date);
  const t = new Date(TODAY);
  return (t.getFullYear() - d.getFullYear()) * 12 + (t.getMonth() - d.getMonth());
}

export function docReadiness(
  doc: Doc,
  issues: Issue[],
  canonicalOverrides: Record<number, { docId: number }> = {},
): { value: Readiness; reasons: string[] } {
  const mine = issues.filter((i) => i.docId === doc.docId || i.relatedDocIds.includes(doc.docId));
  const openOf = (pred: (i: Issue) => boolean) => mine.some((i) => pred(i) && (i.status === "open" || i.status === "regressed" || i.status === "deferred"));
  const cluster = doc.clusterId != null ? CLUSTERS.find((c) => c.clusterId === doc.clusterId) : undefined;
  const canonicalDocId = cluster ? (canonicalOverrides[cluster.clusterId]?.docId ?? cluster.canonicalDocId) : doc.docId;
  const approvedExclude = mine.some(
    (i) => i.docId === doc.docId && i.status === "approved" && (i.suggestion?.disposition === "archive" || i.suggestion?.disposition === "exclude_index"),
  );
  return readiness({
    isNonCanonical: !!cluster && canonicalDocId !== doc.docId,
    pageType: doc.pageType,
    hasUnresolvedPii: openOf((i) => i.detector === "D8" && i.docId === doc.docId),
    approvedArchiveOrExclude: approvedExclude,
    boardOutOfWindow: doc.pageType === "board_post" && monthsAgo(doc.postedAt) > BOARD_INDEX_MONTHS,
    openD2High: openOf((i) => i.detector === "D2" && i.severity === "high" && (i.docId === doc.docId || i.relatedDocIds.includes(doc.docId))),
    inD7High: openOf((i) => i.detector === "D7" && i.severity === "high"),
    d6AttachmentOnly: openOf((i) => i.code === "D6_ATTACHMENT_ONLY" && i.docId === doc.docId),
    d3PendingReview: openOf((i) => i.detector === "D3" && i.docId === doc.docId),
    d4PairConflict: openOf((i) => i.code === "D4_PAIR_CONFLICT" && (i.docId === doc.docId || i.relatedDocIds.includes(doc.docId))),
  });
}

function authority(doc: Doc): number {
  const site = siteById(doc.siteId);
  let a = 0.5;
  if (site?.siteKey === "nportal") a += 0.3;
  if (site?.siteKey === "main") a += 0.2;
  if (doc.postedAt && doc.postedAt >= "2026-01-01") a += 0.1;
  if (doc.department && doc.department !== "디지털정책팀") a += 0.05;
  return Math.min(1, Math.round(a * 100) / 100);
}

export function buildManifest(
  issues: Issue[],
  canonicalOverrides: Record<number, { docId: number }> = {},
  approvedOnly = true,
): Manifest {
  const documents: ManifestDoc[] = DOCS.map((doc) => {
    const r = docReadiness(doc, issues, canonicalOverrides);
    let index: ManifestDoc["index"] = r.value === "ready" ? "include" : r.value === "exclude" ? "exclude" : "hold";
    // approved_only: 사람이 승인한 제외만 exclude, 미승인 제안은 hold. 규칙 확정(비대표·목록·PII)은 승인 없이 exclude
    if (approvedOnly && index === "exclude") {
      const ruleBased = r.reasons.some((x) => x === "NON_CANONICAL" || x.startsWith("PAGE_TYPE_") || x === "PII" || x === "BOARD_OUT_OF_WINDOW" || x === "APPROVED_EXCLUDE");
      if (!ruleBased) index = "hold";
    }
    const titleOverride = issues.find((i) => i.docId === doc.docId && i.status === "approved" && i.suggestion?.newTitle && !i.suggestion.newTitle.includes("{"))?.suggestion?.newTitle ?? null;
    return {
      doc_id: doc.docId,
      canonical_url: doc.canonicalUrl,
      alias_urls: doc.aliasUrls,
      index,
      reason_codes: r.reasons,
      authority: authority(doc),
      page_type: doc.pageType,
      title: doc.title,
      title_override: titleOverride,
      department: doc.department,
      lang: doc.lang,
      content_sha256: doc.contentSha256,
      posted_at: doc.postedAt,
      last_verified: TODAY,
      valid_until: null,
    };
  });
  const facts: Manifest["facts"] = [];
  for (const i of issues) {
    if (i.detector === "D7" && i.status === "approved" && i.evidence.values?.length) {
      const best = i.evidence.values[0];
      const [subject, attribute, qualifier] = i.code === "D7_CONFLICT_FEE" ? ["여권 재발급", "fee", "10년 복수여권(58면)"] : ["건축물대장 발급", "phone", ""];
      facts.push({
        subject,
        attribute,
        qualifier,
        value: attribute === "fee" ? { krw: Number(best.value.replace(/\D/g, "")) } : { digits: best.value.replace(/\D/g, "") },
        source_doc_id: i.docId ?? 0,
        status: "verified",
      });
    }
  }
  return {
    manifest_version: "1.0",
    generated_at: new Date().toISOString(),
    run_id: CURRENT_RUN,
    org: "마포구청",
    policy: { approved_only: approvedOnly, board_index_months: BOARD_INDEX_MONTHS },
    documents,
    facts,
  };
}

function csv(rows: (string | number | null | undefined)[][]): string {
  const esc = (v: string | number | null | undefined) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return "﻿" + rows.map((r) => r.map(esc).join(",")).join("\r\n");
}

export function canonicalMapCsv(canonicalOverrides: Record<number, { docId: number }> = {}): string {
  const rows: (string | number)[][] = [["alias_url", "canonical_url", "rule", "cluster_id"]];
  for (const c of CLUSTERS) {
    const canonId = canonicalOverrides[c.clusterId]?.docId ?? c.canonicalDocId;
    const canon = docById(canonId)!;
    for (const id of c.docIds) {
      if (id === canonId) continue;
      const d = docById(id)!;
      rows.push([d.canonicalUrl, canon.canonicalUrl, canonicalOverrides[c.clusterId] ? "사람 지정" : c.canonicalRule, c.clusterId]);
    }
  }
  for (const d of DOCS) for (const a of d.aliasUrls) rows.push([a, d.canonicalUrl, "① owner_path_prefixes", d.clusterId ?? ""]);
  return csv(rows);
}

export function redirectMapCsv(issues: Issue[]): string {
  const rows: (string | number)[][] = [["from_url", "to_url", "type", "reason"]];
  for (const i of issues) {
    if (i.status !== "approved" || i.suggestion?.disposition !== "redirect") continue;
    const to = i.suggestion.canonicalUrl ?? docById(i.docId)?.canonicalUrl ?? "";
    for (const id of i.relatedDocIds) {
      const d = docById(id);
      if (d) rows.push([d.canonicalUrl, to, 301, i.code]);
    }
    for (const a of docById(i.docId)?.aliasUrls ?? []) rows.push([a, to, 301, i.code]);
  }
  return csv(rows);
}

export function titleFixesCsv(issues: Issue[]): string {
  const rows: (string | number)[][] = [["url", "current_title", "suggested_title", "code", "template"]];
  for (const i of issues) {
    if (i.detector !== "D2" || i.status !== "approved") continue;
    const d = docById(i.docId);
    const tmpl = i.code === "D2_T3_MASS_SHARED" ? "Y" : "N";
    rows.push([d?.canonicalUrl ?? "", d?.title ?? "", i.suggestion?.newTitle ?? "", i.code, tmpl]);
    if (tmpl === "Y") for (const id of i.relatedDocIds) {
      const r = docById(id);
      if (r) rows.push([r.canonicalUrl, r.title ?? "", (i.suggestion?.newTitle ?? "").replace("{h1}", r.h1 ?? ""), i.code, "Y"]);
    }
  }
  return csv(rows);
}

export function noindexCsv(issues: Issue[], decisions: Record<number, { decidedBy: string; decidedAt: string }>): string {
  const rows: (string | number)[][] = [["url", "reason", "approved_by", "approved_at"]];
  for (const i of issues) {
    if (i.status !== "approved") continue;
    const disp = i.suggestion?.disposition;
    if (disp !== "archive" && disp !== "exclude_index") continue;
    const d = docById(i.docId);
    const dec = decisions[i.issueId];
    rows.push([d?.canonicalUrl ?? "", i.code, dec?.decidedBy ?? "", dec?.decidedAt?.slice(0, 19) ?? ""]);
  }
  return csv(rows);
}

export function sitemapXml(manifest: Manifest): string {
  const urls = manifest.documents.filter((d) => d.index === "include").map((d) => `  <url><loc>${d.canonical_url.replace(/&/g, "&amp;")}</loc><lastmod>${d.last_verified}</lastmod></url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}

export function kpiJson(issues: Issue[], manifest: Manifest) {
  const latest = KPI_SERIES[KPI_SERIES.length - 1];
  const run = RUNS.find((r) => r.runId === CURRENT_RUN)!;
  const byDept: Record<string, number> = {};
  for (const i of issues) if (i.status === "open" || i.status === "regressed") byDept[i.department] = (byDept[i.department] ?? 0) + 1;
  const dist = { include: 0, exclude: 0, hold: 0 };
  for (const d of manifest.documents) dist[d.index]++;
  return {
    generated_at: new Date().toISOString(),
    run_id: CURRENT_RUN,
    dup_rate: latest.dupRate,
    title_errors: latest.titleErrors,
    stale_90d: latest.stale90d,
    expired: latest.expired,
    fact_conflicts: latest.factConflicts,
    broken_links: latest.brokenLinks,
    include_ratio: latest.includeRatio,
    readiness_distribution_sample: dist,
    open_issues_by_department: byDept,
    llm_cost_krw: run.stats.llmCostKrw,
    series: KPI_SERIES,
    sites: SITES.map((s) => ({ key: s.siteKey, docs: s.docCount })),
  };
}

export function download(filename: string, content: string | Blob, type = "text/plain;charset=utf-8") {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
