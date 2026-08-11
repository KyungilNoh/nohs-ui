// nohs-ui/src/demo/catalog.tsx
//
// 컴포넌트 목록. Molecules · Atoms 페이지가 읽는다.
//
// 그림은 여기서 그리지 않는다 — previews.tsx 가 소유하고 카드는 이름으로 꺼내 쓴다.
// 카드용 그림을 따로 그리면 상세와 갈린다(실제로 Paragraph 는 카드 sm / 상세 md,
// Checkbox 는 카드 2개 / 상세 1개로 어긋나 있었다).

import type React from 'react';
import { PREVIEWS } from './previews';

export interface Entry {
  title: string;
  description: string;
  href: string;
  /** previews.tsx 가 그린 기본 상태 */
  preview: React.ReactNode;
}

interface Meta {
  title: string;
  description: string;
  href: string;
}

const withPreview = (list: Meta[]): Entry[] =>
  list.map((m) => ({ ...m, preview: PREVIEWS[m.title] }));

const MOLECULE_META: Meta[] = [
  { title: 'Button', description: 'Triggers an action. 4 variants · 3 sizes · left/right icons · icon-only.', href: '/button' },
  { title: 'Input', description: 'Single-line input. Bundles label, description, error and success into one accessible unit.', href: '/input' },
  { title: 'Textarea', description: 'Multi-line input. Follows the same label / description / error contract as Input.', href: '/textarea' },
  { title: 'Select', description: 'Pick one from a list. Items are passed as an options array.', href: '/select' },
  { title: 'Checkbox', description: 'Pick many from many. Supports the indeterminate state.', href: '/checkbox' },
  { title: 'Switch', description: 'On/off that applies immediately — no save button in between.', href: '/switch' },
  { title: 'Card', description: 'A surface that holds content. Four elevation steps give it depth.', href: '/card' },
  { title: 'SectionHeader', description: 'Eyebrow, Title and Paragraph bound into one section head.', href: '/section-header' },
];

const ATOM_META: Meta[] = [
  { title: 'Title', description: 'Document heading. Choose h1–h6 with level, then weight and align.', href: '/title' },
  { title: 'Subtitle', description: 'Supporting heading under a Title. Renders as h2, h3 or p.', href: '/subtitle' },
  { title: 'Paragraph', description: 'Body text. 3 sizes · 3 weights · 3 tones.', href: '/paragraph' },
  { title: 'Eyebrow', description: 'A small label above a heading. Names the section before you read it.', href: '/eyebrow' },
  { title: 'Label', description: 'Names a form control. htmlFor binds it so clicks and screen readers both work.', href: '/label' },
  { title: 'HelperText', description: 'Guidance under an input. Says what to type before you get it wrong.', href: '/helper-text' },
  { title: 'ErrorText', description: 'Error message under an input. Says what went wrong.', href: '/error-text' },
  { title: 'SuccessText', description: 'Success message under an input. Confirms it passed, in place.', href: '/success-text' },
  { title: 'Tag', description: 'A chip for status or category. 5 variants, optional icon and remove button.', href: '/tag' },
  { title: 'Icon', description: 'MUI icon wrapper. Call it by name; size and colour come from tokens.', href: '/icon' },
];

export const MOLECULES: Entry[] = withPreview(MOLECULE_META);
export const ATOMS: Entry[] = withPreview(ATOM_META);
