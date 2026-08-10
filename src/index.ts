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
