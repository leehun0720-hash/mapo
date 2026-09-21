import { describe, expect, it } from "vitest";
import { normalizeUrl, pathPattern } from "@/lib/urlnorm";

const NOISE = new Set(["cp", "sortOrder", "baNotice"]);
const EXPECT = "https://www.mapo.go.kr/site/main/board/notice/12345?bcId=notice";

describe("6.2 URL 정규화 5개 사례", () => {
  it("1. &amp=& 잔재 + 대문자 호스트", () => {
    const r = normalizeUrl(
      "https://WWW.mapo.go.kr/site/main/board/notice/12345?cp=3&amp=&sortOrder=BA_REGDATE&bcId=notice&baNotice=false",
      NOISE,
    );
    expect(r.urlNorm).toBe(EXPECT);
    expect(r.flags).toEqual(["escape_bug"]);
  });
  it("2. http + &amp; + 프래그먼트", () => {
    const r = normalizeUrl(
      "http://www.mapo.go.kr/site/main/board/notice/12345?bcId=notice&amp;cp=1#top",
      NOISE,
    );
    expect(r.urlNorm).toBe(EXPECT);
    expect(r.flags).toEqual(["escape_bug", "http_link"]);
  });
  it("3. jsessionid", () => {
    const r = normalizeUrl(
      "https://www.mapo.go.kr/site/main/board/notice/12345;jsessionid=ABC123?bcId=notice",
      NOISE,
    );
    expect(r.urlNorm).toBe(EXPECT);
    expect(r.flags).toEqual(["jsessionid"]);
  });
  it("4. 연속 슬래시·끝 슬래시·utm 제거, currentPage 보존(¤ 함정)", () => {
    const r = normalizeUrl(
      "https://www.mapo.go.kr//site/main/list/?currentPage=2&utm_source=kakao",
      NOISE,
    );
    expect(r.urlNorm).toBe("https://www.mapo.go.kr/site/main/list?currentPage=2");
    expect(r.flags).toEqual([]);
  });
  it("5. 이중 이스케이프 &amp;amp;", () => {
    const r = normalizeUrl(
      "https://www.mapo.go.kr/site/main/board/notice/12345?bcId=notice&amp;amp;cp=1",
      NOISE,
    );
    expect(r.urlNorm).toBe(EXPECT);
    expect(r.flags).toEqual(["escape_bug"]);
  });
  it("상태 파라미터 5개 이상이면 state_params", () => {
    const r = normalizeUrl("https://www.mapo.go.kr/b/1?a=1&b=2&c=3&d=4&e=5");
    expect(r.flags).toContain("state_params");
  });
  it("경로 패턴 추출", () => {
    expect(pathPattern("https://www.mapo.go.kr/site/main/board/notice/12345")).toBe(
      "/site/main/board/notice/{id}",
    );
  });
});
