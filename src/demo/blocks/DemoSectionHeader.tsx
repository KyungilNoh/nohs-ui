// design-system/src/demo/blocks/DemoSectionHeader.tsx

'use client';

import React, { type ReactNode } from 'react';

interface DemoSectionHeaderProps {
  title: string;
  right?: ReactNode;
}

export default function DemoSectionHeader({
  title,
  right,
}: DemoSectionHeaderProps) {
  return (
    <div
      className={[
        'box-border flex items-center justify-between px-6',
        'h-[54px]',
        'bg-surface',
        // border 대신 inset shadow로 라인 (레이아웃 영향 0)
        'shadow-[inset_0_-1px_0_0_rgb(var(--color-outline))]',
      ].join(' ')}
    >
      <span className='font-medium tracking-wider text-[12px] leading-none text-onsurface'>
        {title}
      </span>

      {right ? <div className='flex items-center h-full'>{right}</div> : null}
    </div>
  );
}