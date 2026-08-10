// design-system/src/demo/blocks/DemoPreviewBlock.tsx

'use client';

import React, { type ReactNode, type CSSProperties, memo } from 'react';
import DemoCard from './DemoCard';
import DemoSectionHeader from './DemoSectionHeader';

interface DemoPreviewBlockProps {
  children: ReactNode;
}

// ✅ 투명 배경 느낌의 체커보드 (토큰 기반)
const CHECKERBOARD_STYLE: CSSProperties = {
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

function DemoPreviewBlock({ children }: DemoPreviewBlockProps) {
  return (
    <DemoCard className='p-0'>
      <DemoSectionHeader title='Preview' />

      <div
        className='min-h-[360px] px-6 py-10 flex items-center justify-center'
        style={CHECKERBOARD_STYLE}
      >
        {children}
      </div>
    </DemoCard>
  );
}

export default memo(DemoPreviewBlock);