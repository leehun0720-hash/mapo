// 콘텐츠 위생 앱 — 공통 타입 (구성명세서 5장 데이터 모델을 화면용으로 축약)

export type PageType =
  | "content"
  | "board_post"
  | "board_list"
  | "citizen_post"
  | "file"
  | "nav"
  | "error";

export type Severity = "critical" | "high" | "medium" | "low";
export type Grade = "suggest" | "observe";
export type IssueStatus =
  | "open"
  | "approved"
  | "rejected"
  | "deferred"
  | "fixed"
  | "regressed";
export type Disposition =
  | "update"
  | "retitle"
  | "redirect"
  | "archive"
  | "exclude_index"
  | "keep";
export type Readiness = "ready" | "fix_first" | "exclude";
export type DetectorId = "D1" | "D2" | "D3" | "D4" | "D5" | "D6" | "D7" | "D8";

export interface Site {
  siteId: number;
  siteKey: string;
  name: string;
  baseUrl: string;
  originGroup: string;
  crawlMode: "full" | "linkcheck_only" | "excluded";
  priority: number;
  ownerPathPrefixes: string[];
  defaultTitle: string | null;
  docCount: number;
}

export interface Doc {
  docId: number;
  siteId: number;
  canonicalUrl: string;
  aliasUrls: string[];
  pageType: PageType;
  title: string | null;
  h1: string | null;
  breadcrumb: string[];
  declaredCanonical: string | null;
  department: string | null;
  contactPhone: string | null;
  postedAt: string | null;
  latestDateInText: string | null;
  bodyExcerpt: string;
  bodyLen: number;
  contentSha256: string;
  clusterId: number | null;
  lang: string;
}

export interface Cluster {
  clusterId: number;
  kind: "exact" | "near";
  canonicalDocId: number;
  canonicalRule: string;
  docIds: number[];
  jaccard?: number;
}

export interface IssueEvidence {
  excerpt?: string;
  compare?: { label: string; url: string; text?: string }[];
  signals?: { name: string; strength: "강" | "약"; detail: string }[];
  values?: { value: string; url: string; quote: string; postedAt?: string }[];
  title?: string | null;
  h1?: string | null;
  breadcrumb?: string[];
  pattern?: string;
  snapshotId?: number;
  score?: number;
  extra?: Record<string, string | number | boolean | null>;
}

export interface IssueSuggestion {
  disposition?: Disposition;
  newTitle?: string;
  canonicalUrl?: string;
  text?: string;
  aiDraft?: boolean;
}

export interface Issue {
  issueId: number;
  fingerprint: string;
  detector: DetectorId;
  code: string;
  severity: Severity;
  grade: Grade;
  confidence: number;
  docId: number | null;
  clusterId: number | null;
  relatedDocIds: number[];
  evidence: IssueEvidence;
  suggestion: IssueSuggestion | null;
  department: string;
  status: IssueStatus;
  firstSeenRun: number;
  lastSeenRun: number;
  fixtureId?: string; // F1~F9 회귀 사례
}

export interface Action {
  actionId: number;
  issueId: number;
  decision: "approve" | "reject" | "defer";
  disposition: Disposition | null;
  note: string;
  decidedBy: string;
  decidedAt: string;
}

export interface Run {
  runId: number;
  kind: "full" | "incremental" | "fixtures";
  startedAt: string;
  finishedAt: string | null;
  stats: {
    urls: number;
    docs: number;
    errorRate: number;
    llmCostKrw: number;
    durationMin: number;
  };
}

export interface KpiPoint {
  date: string;
  dupRate: number;
  titleErrors: number;
  stale90d: number;
  expired: number;
  factConflicts: number;
  brokenLinks: number;
  includeRatio: number;
  structuredRatio: number; // 구조화된 민원 안내 비율 (핸드북 영역 ③ 측정 지표)
}

export interface Rules {
  timeboundKeywords: string[];
  noiseParams: string[];
  citizenBoards: string[];
  boardPairs: { legacy: string; current: string; authority: "legacy" | "current" }[];
  subjectAliases: Record<string, string[]>;
}
