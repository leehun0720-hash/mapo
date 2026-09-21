import type { Rules } from "@/lib/types";

// rules/*.yaml 초기값 (구성명세서 3장·6.4). 화면에서 편집하고 localStorage에 보관한다.
export const DEFAULT_RULES: Rules = {
  timeboundKeywords: [
    "코로나19",
    "확진자",
    "거리두기",
    "이동경로",
    "민선8기",
    "민선 8기",
    "2024년 계획",
    "2025년 계획",
    "임시 휴관",
    "재난지원금",
  ],
  noiseParams: ["cp", "sortOrder", "baNotice", "searchCategory", "searchKeyword", "pageSize", "viewMode", "listType", "menuLevel"],
  citizenBoards: ["/site/main/board/free", "/site/main/board/qna", "/site/main/board/suggest"],
  boardPairs: [
    {
      legacy: "/site/main/board/gosi",
      current: "/nPortal/gosi",
      authority: "current",
    },
  ],
  subjectAliases: {
    "여권 재발급": ["여권 갱신", "여권 재발급 신청", "여권 유효기간 연장"],
    "건축물대장 발급": ["건축물대장 등본", "건축물대장 열람"],
    "주민등록등본 발급": ["등본 발급", "주민등록 등·초본"],
  },
};
