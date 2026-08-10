// design-system/src/components/atoms/ErrorText.tsx

'use client';

import React, { forwardRef, type ElementType } from 'react';
import type { ControlSize } from '../_tokens/control';
import { controlDescTextSize } from '../_tokens/control';

type ErrorTextAs = ElementType;

export interface ErrorTextProps
  extends React.HTMLAttributes<HTMLElement> {
  as?: ErrorTextAs;

  /** Control 컴포넌트와 같은 사이즈 체계 */
  size?: ControlSize;

  /** 시각적으로 숨김(sr-only) */
  hidden?: boolean;
}

const cx = (...v: Array<string | false | null | undefined>) =>
  v.filter(Boolean).join(' ');

export const ErrorText = forwardRef<HTMLElement, ErrorTextProps>(
  (
    {
      as: Component = 'p',
      size = 'md',
      hidden = false,
      className,
      children,
      ...rest
    },
    ref
  ) => {
    return (
      <Component
        ref={ref as any}
        className={cx(
          'text-error select-none',
          controlDescTextSize[size],
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

ErrorText.displayName = 'ErrorText';
export default ErrorText;
