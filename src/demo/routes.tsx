// nohs-ui/src/demo/routes.tsx
//
// LNB 는 «층» 만 보여준다. 19종을 한 줄로 늘어놓으면 목록이 길어지기만 하고
// 어디부터 어디까지가 한 갈래인지 안 보인다 — 컴포넌트는 각 층 페이지의
// 카드에서 들어간다.

import type { ReactNode } from 'react';

import MoleculesPage from './pages/MoleculesPage';
import AtomsPage from './pages/AtomsPage';
import TokensDemo from './pages/TokensDemo';
import Overview from './pages/Overview';

// Molecules — 상호작용 / 조합
import ButtonDemo from './pages/ButtonDemo';
import InputDemo from './pages/InputDemo';
import TextareaDemo from './pages/TextareaDemo';
import SelectDemo from './pages/SelectDemo';
import CheckboxDemo from './pages/CheckboxDemo';
import SwitchDemo from './pages/SwitchDemo';
import CardDemo from './pages/CardDemo';
import SectionHeaderDemo from './pages/SectionHeaderDemo';

// Atoms — 표시 전용
import TitleDemo from './pages/TitleDemo';
import SubtitleDemo from './pages/SubtitleDemo';
import ParagraphDemo from './pages/ParagraphDemo';
import EyebrowDemo from './pages/EyebrowDemo';
import LabelDemo from './pages/LabelDemo';
import HelperTextDemo from './pages/HelperTextDemo';
import ErrorTextDemo from './pages/ErrorTextDemo';
import SuccessTextDemo from './pages/SuccessTextDemo';
import TagDemo from './pages/TagDemo';
import IconDemo from './pages/IconDemo';

export type DSRoute = {
  to: string;
  label: string;
  element: ReactNode;
  tooltip?: string;
  end?: boolean;
  /** false 면 라우트로만 살아 있고 LNB 에는 안 뜬다 */
  inNav?: boolean;
  /**
   * 이 라우트가 속한 LNB 항목의 경로.
   * 개별 데모로 들어가도 LNB 선택이 풀리지 않게 한다 — 사용자는 여전히
   * 그 층 «안» 에 있는 것이지, 아무 데도 아닌 곳으로 나간 게 아니다.
   */
  parent?: string;
};

export const DS_ROUTES: DSRoute[] = [
  // ── LNB 에 뜨는 것 ─────────────────────────────────────────
  // 층이 쌓이는 순서대로. Overview 에서 전체 그림을 보고, 아래층부터 올라간다.
  { to: '/', label: 'Overview', element: <Overview />, end: true, inNav: true },
  { to: '/tokens', label: 'Tokens', element: <TokensDemo />, inNav: true },
  { to: '/atoms', label: 'Atoms', element: <AtomsPage />, inNav: true },
  { to: '/molecules', label: 'Molecules', element: <MoleculesPage />, inNav: true },

  // ── 카드에서 들어가는 개별 데모 ────────────────────────────

  { to: '/button', label: 'Button', element: <ButtonDemo />, parent: '/molecules' },
  { to: '/input', label: 'Input', element: <InputDemo />, parent: '/molecules' },
  { to: '/textarea', label: 'Textarea', element: <TextareaDemo />, parent: '/molecules' },
  { to: '/select', label: 'Select', element: <SelectDemo />, parent: '/molecules' },
  { to: '/checkbox', label: 'Checkbox', element: <CheckboxDemo />, parent: '/molecules' },
  { to: '/switch', label: 'Switch', element: <SwitchDemo />, parent: '/molecules' },
  { to: '/card', label: 'Card', element: <CardDemo />, parent: '/molecules' },
  { to: '/section-header', label: 'SectionHeader', element: <SectionHeaderDemo />, parent: '/molecules' },

  { to: '/title', label: 'Title', element: <TitleDemo />, parent: '/atoms' },
  { to: '/subtitle', label: 'Subtitle', element: <SubtitleDemo />, parent: '/atoms' },
  { to: '/paragraph', label: 'Paragraph', element: <ParagraphDemo />, parent: '/atoms' },
  { to: '/eyebrow', label: 'Eyebrow', element: <EyebrowDemo />, parent: '/atoms' },
  { to: '/label', label: 'Label', element: <LabelDemo />, parent: '/atoms' },
  { to: '/helper-text', label: 'HelperText', element: <HelperTextDemo />, parent: '/atoms' },
  { to: '/error-text', label: 'ErrorText', element: <ErrorTextDemo />, parent: '/atoms' },
  { to: '/success-text', label: 'SuccessText', element: <SuccessTextDemo />, parent: '/atoms' },
  { to: '/tag', label: 'Tag', element: <TagDemo />, parent: '/atoms' },
  { to: '/icon', label: 'Icon', element: <IconDemo />, parent: '/atoms' },
];

/** LNB 가 그리는 항목 */
export const DS_NAV_ROUTES = DS_ROUTES.filter((r) => r.inNav);

// 소속 관계의 단일 소유자는 navMap.ts 다 — LiveDemoTemplate 도 같은 것을 본다
export { sectionPathFor as navPathFor } from './navMap';
