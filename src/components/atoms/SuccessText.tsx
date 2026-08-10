// design-system/src/components/atoms/SuccessText.tsx

'use client';

import React from 'react';
import type { ControlSize } from '../_tokens/control';
import { controlDescTextSize } from '../_tokens/control';

type SuccessTextProps = {
  children: React.ReactNode;
  size?: ControlSize;
  className?: string;
  id?: string;
};

const cx = (...v: Array<string | false | null | undefined>) =>
  v.filter(Boolean).join(' ');

export default function SuccessText({
  children,
  size = 'md',
  className,
  id,
}: SuccessTextProps) {
  return (
    <p
      id={id}
      className={cx(
        controlDescTextSize[size],
        'text-success',
        className
      )}
    >
      {children}
    </p>
  );
}
