// nohs-ui/src/demo/blocks/previewSurface.ts
//
// «컴포넌트가 놓이는 바닥» 의 단일 소유자.
//
// 목록 카드의 썸네일과 상세의 Preview 는 같은 것을 보여준다 — 바닥이 다르면
// 같은 물건인데 다른 곳에 있는 것처럼 읽힌다. 두 곳이 이 하나를 쓴다.

import type { CSSProperties } from 'react';

/** 투명 배경을 뜻하는 체커보드. 색은 토큰이라 테마를 따라간다 */
export const PREVIEW_SURFACE: CSSProperties = {
  backgroundColor: 'rgb(var(--color-surface))',
  backgroundImage: [
    'linear-gradient(45deg, rgb(var(--color-outline) / 0.12) 25%, transparent 25%)',
    'linear-gradient(-45deg, rgb(var(--color-outline) / 0.12) 25%, transparent 25%)',
    'linear-gradient(45deg, transparent 75%, rgb(var(--color-outline) / 0.12) 75%)',
    'linear-gradient(-45deg, transparent 75%, rgb(var(--color-outline) / 0.12) 75%)',
  ].join(', '),
  backgroundSize: '20px 20px',
  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0',
};
