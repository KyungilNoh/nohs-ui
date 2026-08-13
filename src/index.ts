// design-system/src/index.ts
// atoms/ · molecules/ · layouts 구조로 export (Cursor 룰 및 landing-template 사용 최적화)

// Atoms — primitive, presentational (Text, Icon, Label 등)
export * from './components/atoms';

// Molecules — interactive / composite (Button, Input, Card, SectionHeader 등)
export * from './components/molecules';

// Layouts — structural (향후 Section, Container 등)
export * from './components/layouts';

// Shell — chrome/shell 컴포넌트 (ThemeToggle 등)
export * from './components/shell';

// nohsJam 은 여기 없다. 판은 folio 레포가 소유한다(folio/components/jam/) —
// 원자·분자와 층이 다른 «캔버스 앱» 이라, 쓰는 곳 하나가 원본을 들고 있는
// 편이 두 벌을 맞춰 두는 것보다 낫다.
