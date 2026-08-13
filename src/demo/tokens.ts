// nohs-ui/src/demo/tokens.ts
//
// 스타일시트에 실제로 선언된 토큰 이름을 긁어온다.
//
// 이름을 어딘가에 적어두지 않는다 — 적어두는 순간 tokens.css 와 어긋나기
// 시작하고, 어긋난 걸 알아챌 방법이 없다. 토큰 페이지와 관계도가 이 한 곳을
// 같이 본다.

export function collectTokenNames(): string[] {
  const names = new Set<string>();
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules; // 교차 출처 스타일시트는 접근 시 던진다
    } catch {
      continue;
    }
    for (const rule of Array.from(rules)) {
      if (!(rule instanceof CSSStyleRule)) continue;
      if (!/:root|\[data-theme/.test(rule.selectorText)) continue;
      for (const prop of Array.from(rule.style)) {
        if (prop.startsWith('--')) names.add(prop);
      }
    }
  }
  return [...names].sort();
}
