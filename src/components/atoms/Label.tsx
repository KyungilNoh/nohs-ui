// design-system/src/components/atoms/Label.tsx

'use client';

import React, { forwardRef, type ElementType } from 'react';
import type { ControlSize } from '../_tokens/control';
import { controlLabelTextSize } from '../_tokens/control';

type LabelAs = ElementType;
type LabelVariant = 'field' | 'control';

export interface LabelProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  as?: LabelAs;

  /** Control 컴포넌트와 같은 사이즈 체계 */
  size?: ControlSize;

  /** ✅ 필드 라벨 vs 컨트롤 텍스트 */
  variant?: LabelVariant;

  /** 시각적으로 숨김(sr-only) */
  hidden?: boolean;

  /** label일 때만 의미 */
  htmlFor?: string;

  children: React.ReactNode;
}

const cx = (...v: Array<string | false | null | undefined>) =>
  v.filter(Boolean).join(' ');

export const Label = forwardRef<HTMLElement, LabelProps>(
  (
    {
      as: Component = 'label',
      size = 'md',
      variant = 'field',
      hidden = false,
      className,
      htmlFor,
      children,
      ...rest
    },
    ref
  ) => {
    const isLabelTag = Component === 'label';

    return (
      <Component
        ref={ref as any}
        {...(isLabelTag ? ({ htmlFor } as any) : {})}
        className={cx(
          'text-onsurface select-none',
          variant === 'field' ? 'font-medium' : 'font-normal',
          controlLabelTextSize[size],
          hidden && 'sr-only',
          className
        )}
        {...(rest as any)}
      >
        {children}
      </Component>
    );
  }
);

Label.displayName = 'Label';
export default Label;
