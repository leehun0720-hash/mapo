import { describe, expect, it } from "vitest";
import { detectPii, maskText } from "@/lib/pii";

describe("D8 개인정보", () => {
  it("주민등록번호·외국인등록번호 구분 + 날짜 유효성", () => {
    const hits = detectPii(
      "담당 김철수 900101-1234567, 외국인 850505-5123456, 잘못된 991399-1234567",
    );
    expect(hits.map((h) => h.code)).toEqual(["D8_RRN", "D8_FRN"]);
    expect(hits[0].masked).toBe("900101-*******");
  });
  it("휴대전화 탐지, 화이트리스트 제외", () => {
    const hits = detectPii("문의 010-1234-5678 / 부서 010-9999-0000", {
      whitelistPhones: ["010-9999-0000"],
    });
    expect(hits).toHaveLength(1);
    expect(hits[0].code).toBe("D8_MOBILE");
  });
  it("시민 게시판 이메일", () => {
    expect(detectPii("hong@example.com", { citizenPost: true })[0].code).toBe("D8_EMAIL_CITIZEN");
    expect(detectPii("hong@example.com")).toHaveLength(0);
  });
  it("마스킹본", () => {
    const { masked } = maskText("연락처 010-1234-5678 입니다");
    expect(masked).toBe("연락처 010-****-**** 입니다");
  });
});
