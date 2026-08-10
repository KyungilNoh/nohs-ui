// design-system/src/demo/blocks/DemoConfigurationBlock.tsx

'use client';

import React, { type ReactNode } from 'react';
import DemoCard from './DemoCard';
import DemoSectionHeader from './DemoSectionHeader';

export default function DemoConfigurationBlock({
  title = 'Configuration',
  children,
  sticky = true,
}: {
  title?: string;
  children?: ReactNode;
  sticky?: boolean;
}) {
  return (
    <div className={sticky ? 'sticky top-8' : ''}>
      <DemoCard className='p-0'>
        <DemoSectionHeader title={title} />

        <div className='px-6 py-5'>
          {children ? (
            <div className='flex flex-col gap-5'>{children}</div>
          ) : (
            <div className='rounded-lg bg-surface-alt px-4 py-12 text-center border border-dashed border-outline'>
              <div className='text-xs text-muted font-medium'>
                조정 가능한 속성이 없습니다.
              </div>
            </div>
          )}
        </div>
      </DemoCard>
    </div>
  );
}