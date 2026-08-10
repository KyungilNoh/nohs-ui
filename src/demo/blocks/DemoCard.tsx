/* DemoConfigurationBlock, DemoImplementationBlock, DemoPreviewBlock의 카드 스타일*/

// design-system/src/demo/blocks/DemoCard.tsx

'use client';

import React, { type ReactNode } from 'react';

interface DemoCardProps {
  className?: string;
  children: ReactNode;
}

export default function DemoCard({ className = '', children }: DemoCardProps) {
  return (
    <div
      className={[
        'rounded-xl overflow-hidden',
        'border border-outline bg-surface shadow-sm',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}