// design-system/src/demo/blocks/DemoPreviewBlock.tsx

'use client';

import React, { type ReactNode, memo } from 'react';
import DemoCard from './DemoCard';
import DemoSectionHeader from './DemoSectionHeader';
import { PREVIEW_SURFACE } from './previewSurface';

interface DemoPreviewBlockProps {
  children: ReactNode;
}

function DemoPreviewBlock({ children }: DemoPreviewBlockProps) {
  return (
    <DemoCard className='p-0'>
      <DemoSectionHeader title='Preview' />

      <div
        className='min-h-[360px] px-6 py-10 flex items-center justify-center'
        style={PREVIEW_SURFACE}
      >
        {children}
      </div>
    </DemoCard>
  );
}

export default memo(DemoPreviewBlock);