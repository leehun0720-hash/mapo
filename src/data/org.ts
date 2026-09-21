// 조직도 기준 데이터(org_unit) — 2026.8.14 민선9기 첫 조직개편 반영 (8국→7국, 2담당관 37과, 보건소 4과, 16동).
// 출처: 마포구청 홈페이지 조직도·부서안내(핸드북 depts 데이터와 동일 기준). D3 S5 조직 불일치 대조와 부서 선택에 쓴다.

export interface OrgUnit {
  name: string;
  bureau: string;
}

export const ORG_UNITS: OrgUnit[] = [
  { name: "홍보담당관", bureau: "구청장·부구청장 직속" },
  { name: "감사담당관", bureau: "구청장·부구청장 직속" },
  { name: "총무과", bureau: "행정관리국" },
  { name: "자치행정과", bureau: "행정관리국" },
  { name: "구민안전과", bureau: "행정관리국" },
  { name: "청소행정과", bureau: "행정관리국" },
  { name: "민원여권과", bureau: "행정관리국" },
  { name: "스마트정책과", bureau: "행정관리국" },
  { name: "기획예산과", bureau: "기획재정국" },
  { name: "재무과", bureau: "기획재정국" },
  { name: "징수과", bureau: "기획재정국" },
  { name: "재산세과", bureau: "기획재정국" },
  { name: "지방소득세과", bureau: "기획재정국" },
  { name: "관광정책과", bureau: "문화경제국" },
  { name: "지역경제과", bureau: "문화경제국" },
  { name: "문화예술과", bureau: "문화경제국" },
  { name: "고용협력과", bureau: "문화경제국" },
  { name: "청년정책과", bureau: "문화경제국" },
  { name: "체육진흥과", bureau: "문화경제국" },
  { name: "교육청소년과", bureau: "미래교육국" },
  { name: "평생학습과", bureau: "미래교육국" },
  { name: "보육정책과", bureau: "미래교육국" },
  { name: "가족정책과", bureau: "미래교육국" },
  { name: "복지정책과", bureau: "복지국" },
  { name: "생활보장과", bureau: "복지국" },
  { name: "통합돌봄과", bureau: "복지국" },
  { name: "어르신정책과", bureau: "복지국" },
  { name: "장애인정책과", bureau: "복지국" },
  { name: "주택과", bureau: "도시환경국" },
  { name: "도시계획과", bureau: "도시환경국" },
  { name: "건축과", bureau: "도시환경국" },
  { name: "환경과", bureau: "도시환경국" },
  { name: "공원녹지과", bureau: "도시환경국" },
  { name: "부동산정보과", bureau: "도시환경국" },
  { name: "교통행정과", bureau: "교통건설국" },
  { name: "교통지도과", bureau: "교통건설국" },
  { name: "건설관리과", bureau: "교통건설국" },
  { name: "도로과", bureau: "교통건설국" },
  { name: "치수과", bureau: "교통건설국" },
  { name: "보건행정과", bureau: "보건소" },
  { name: "위생과", bureau: "보건소" },
  { name: "건강증진과", bureau: "보건소" },
  { name: "의약과", bureau: "보건소" },
  { name: "의회사무국", bureau: "마포구의회" },
  { name: "공덕동", bureau: "동 주민센터" },
  { name: "아현동", bureau: "동 주민센터" },
  { name: "도화동", bureau: "동 주민센터" },
  { name: "용강동", bureau: "동 주민센터" },
  { name: "대흥동", bureau: "동 주민센터" },
  { name: "염리동", bureau: "동 주민센터" },
  { name: "신수동", bureau: "동 주민센터" },
  { name: "서강동", bureau: "동 주민센터" },
  { name: "서교동", bureau: "동 주민센터" },
  { name: "합정동", bureau: "동 주민센터" },
  { name: "망원1동", bureau: "동 주민센터" },
  { name: "망원2동", bureau: "동 주민센터" },
  { name: "연남동", bureau: "동 주민센터" },
  { name: "성산1동", bureau: "동 주민센터" },
  { name: "성산2동", bureau: "동 주민센터" },
  { name: "상암동", bureau: "동 주민센터" },
];

export const BUREAUS = [...new Set(ORG_UNITS.map((u) => u.bureau))];

/** 이름은 공백·'과/팀' 접미 차이를 흡수해 대조한다 (구성명세서 6.4 D3) */
export function normalizeOrgName(s: string): string {
  return s.replace(/\s+/g, "").replace(/(과|팀|담당관|국|소)$/, "");
}

export function findOrgUnit(name: string | null | undefined): OrgUnit | undefined {
  if (!name) return undefined;
  const n = normalizeOrgName(name);
  return ORG_UNITS.find((u) => normalizeOrgName(u.name) === n);
}

/** 이 앱의 기본 담당(구성명세서: 담당부서를 모르면 디지털정책팀) — 조직개편 후 소속은 스마트정책과 */
export const DEFAULT_DEPARTMENT = "스마트정책과";
