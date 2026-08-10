// design-system/src/demo/blocks/DemoPageHeader.tsx

'use client';

import React from 'react';
import { Title, Paragraph } from '@ds';

interface DemoPageHeaderProps {
  title: string;
  description?: string;
}

export function DemoPageHeader({
  title,
  description,
}: DemoPageHeaderProps) {
  return (
    <header className='mb-20 flex flex-col gap-1'>
      <Title className='font-extrabold text-onsurface'>
        {title}
      </Title>

      {description && (
        <Paragraph
          size='lg'
          weight='light'
          className='max-w-2xl text-onsurface'
        >
          {description}
        </Paragraph>
      )}
    </header>
  );
}

export default DemoPageHeader;
