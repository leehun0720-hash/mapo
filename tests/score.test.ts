import { describe, expect, it } from "vitest";
import { fingerprint, readiness, siteScore } from "@/lib/score";

const zero = { dup: 0, title: 0, stale: 0, conflict: 0, broken: 0, url: 0 };

describe("6.5 채점", () => {
  it("문제 없으면 100점", () => {
    expect(siteScore({ docCount: 100, problemDocs: zero }).score).toBe(100);
  });
  it("중복률 15%면 dup 감점 = 30 × (0.15/0.30) = 15", () => {
    expect(siteScore({ docCount: 100, problemDocs: { ...zero, dup: 15 } }).score).toBe(85);
  });
  it("상한을 넘으면 가중치 전부 감점", () => {
    expect(siteScore({ docCount: 100, problemDocs: { ...zero, dup: 90 } }).score).toBe(70);
  });
  it("준비도 판정표", () => {
    const b = {
      isNonCanonical: false,
      pageType: "content",
      hasUnresolvedPii: false,
      approvedArchiveOrExclude: false,
      boardOutOfWindow: false,
      openD2High: false,
      inD7High: false,
      d6AttachmentOnly: false,
      d3PendingReview: false,
      d4PairConflict: false,
    };
    expect(readiness(b).value).toBe("ready");
    expect(readiness({ ...b, openD2High: true }).value).toBe("fix_first");
    expect(readiness({ ...b, hasUnresolvedPii: true, openD2High: true }).value).toBe("exclude");
  });
  it("지문 안정성", () => {
    expect(fingerprint("D1_CROSS_HOST_DUP", "https://a", "k")).toBe(
      fingerprint("D1_CROSS_HOST_DUP", "https://a", "k"),
    );
    expect(fingerprint("D1_CROSS_HOST_DUP", "https://a", "k")).not.toBe(
      fingerprint("D1_CROSS_HOST_DUP", "https://a", "k2"),
    );
  });
});
