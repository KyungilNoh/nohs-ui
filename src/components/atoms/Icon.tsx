// design-system/src/components/atoms/Icon.tsx

'use client';

import React from 'react';
import clsx from 'clsx';
import * as Icons from '@mui/icons-material';
import type { SvgIconProps } from '@mui/material/SvgIcon';

// -------------------------------------------------------------------
// 1) Icon 이름 타입 (MUI icons export key)
// -------------------------------------------------------------------
export type IconName = keyof typeof Icons;

// -------------------------------------------------------------------
// 2) Props
// -------------------------------------------------------------------
type BuiltInFontSize = NonNullable<SvgIconProps['fontSize']>; // 'inherit' | 'small' | 'medium' | 'large'

export interface IconProps
  extends Omit<SvgIconProps, 'fontSize' | 'color' | 'component'> {
  name: IconName;

  /**
   * - MUI 기본: 'inherit' | 'small' | 'medium' | 'large'
   * - 확장: number(px), '20px', '1.25rem' 같은 CSS size 문자열
   */
  fontSize?: BuiltInFontSize | number | `${number}px` | `${number}rem` | `${number}em`;

  /**
   * - MUI 기본 색상 키 or CSS color string
   * - (tokens를 className으로 쓰는 패턴이면 color는 생략해도 OK)
   */
  color?: SvgIconProps['color'] | string;

  className?: string;

  /** 기타 data-*, aria-* 등 자유롭게 */
  [key: string]: any;
}

// -------------------------------------------------------------------
// 3) Component
// -------------------------------------------------------------------
export const Icon: React.FC<IconProps> = ({
  name,
  fontSize = 'medium',
  color = 'inherit',
  className,
  sx,
  style,
  ...props
}) => {
  const IconComponent = (Icons as any)[name] as React.ElementType | undefined;

  if (!IconComponent) {
    console.warn(
      `❗️MUI Icon '${String(
        name
      )}'을(를) 찾지 못했습니다. (예: 'SmartToy', 'Add', 'ContentCopy')`
    );
    return (
      <span
        className={clsx('inline-flex align-middle text-gray-400', className)}
        aria-hidden
      >
        ⃠
      </span>
    );
  }

  const isBuiltIn =
    fontSize === 'inherit' ||
    fontSize === 'small' ||
    fontSize === 'medium' ||
    fontSize === 'large';

  // ✅ 숫자/px/rem/em은 MUI fontSize prop이 아니라 style/sx로 전달 (정석)
  const computedSx = isBuiltIn
    ? sx
    : { ...(sx as any), fontSize: typeof fontSize === 'number' ? `${fontSize}px` : fontSize };

  const computedStyle = isBuiltIn
    ? style
    : { ...(style as React.CSSProperties), fontSize: typeof fontSize === 'number' ? `${fontSize}px` : fontSize };

  return (
    <IconComponent
      className={className}
      // ✅ MUI 표준 fontSize만 prop으로 전달
      fontSize={isBuiltIn ? (fontSize as BuiltInFontSize) : 'inherit'}
      // ✅ color는 MUI 규격 문자열 or 커스텀 문자열 모두 허용
      color={color as any}
      sx={computedSx}
      style={computedStyle}
      {...props}
    />
  );
};

export default Icon;
