// design-system/src/components/_tokens/control.ts

export type ControlSize = 'sm' | 'md' | 'lg';

/** Control (Checkbox / Radio / Switch) 공통 텍스트 토큰 */
export const controlLabelTextSize: Record<ControlSize, string> = {
  sm: 'text-xs',
  md: 'text-sm', // md에 xs는 일반적으로 너무 작으므로, 보통 text-sm이 더 적당합니다.
  lg: 'text-base',
};

export const controlDescTextSize: Record<ControlSize, string> = {
  sm: 'text-[11px]',
  md: 'text-xs',
  lg: 'text-sm',
};

/** 1) 라벨 ↔ 컴포넌트 간격 — x축 (스위치/체크박스 옆 라벨, 가로) */
export const controlLabelToControlGapX = 'gap-x-2';

/** 1) 라벨 ↔ 컴포넌트 간격 — y축 (Input/Textarea/Select 라벨 위→필드). margin-top으로 적용해 컨트롤↔디스크립션 간격과 분리 */
export const controlLabelToControlGapY = 'mt-1.5';

/** 2) 컴포넌트 ↔ 디스크립션/헬퍼/에러 간격 or 컴포넌트 ↔ 귀속된 컴포넌트의 간격. margin-top으로 적용 (Input/Select/Textarea/Switch/Checkbox) */
export const controlCompGap = 'mt-1.5';

/** 3) 필드 라벨 행 ↔ 컨트롤 그룹 간격 (데모 "Options" ↔ 스위치/체크 그룹). content div에 margin-top으로 적용 */
export const controlFieldLabelToContentGap = 'mt-1.5';

/** 4) 컨트롤 그룹 내부 간격 (Options 블록 안 스위치/그룹 사이). */
export const controlGroupInnerGap = 'gap-2';