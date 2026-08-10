// design-system/src/demo/pages/Overview.tsx

'use client';

import React from 'react';
import LiveDemoTemplate from '../LiveDemoTemplate';
import { OverviewCard } from '@dds';

const COMPONENTS = [
  {
    title: 'Button',
    description: 'Buttons trigger actions or events',
    href: '/button', // routes.tsx 에서 경로 지정
    thumbnailSrc: '/demo/thumbnails/button.png'
  },
  {
    title: 'Checkbox',
    description: 'Buttons trigger actions or events',
    href: '/checkbox', // routes.tsx 에서 경로 지정
    thumbnailSrc: '/demo/thumbnails/button.png'
  },
  {
    title: 'Input',
    description: 'Buttons trigger actions or events',
    href: '/input', // routes.tsx 에서 경로 지정
    thumbnailSrc: '/demo/thumbnails/button.png'
  },
  {
    title: 'Switch',
    description: 'Buttons trigger actions or events',
    href: '/switch', // routes.tsx 에서 경로 지정
    thumbnailSrc: '/demo/thumbnails/button.png'
  },
  {
    title: 'Design',
    description: 'Buttons trigger actions or events',
    href: '---', // routes.tsx 에서 경로 지정
    thumbnailSrc: '/demo/thumbnails/design.png'
  },
  {
    title: 'Fun',
    description: 'Buttons trigger actions or events',
    href: '---', // routes.tsx 에서 경로 지정
    thumbnailSrc: '/demo/thumbnails/fun.png'
  },
  {
    title: 'Created',
    description: 'Buttons trigger actions or events',
    href: '---', // routes.tsx 에서 경로 지정
    thumbnailSrc: '/demo/thumbnails/created.png'
  },
] as const;

export default function OverviewPage() {
  return (
    <LiveDemoTemplate
      pageOnly
      title='Components'
      description='Browse all components available in the design system.'
      // ✅ pageOnly에서도 “데모 전용 props”를 안전값으로 명시 (향후 템플릿 변경 대비)
      usageCode=''
      properties={[]}
      controls={null}
      propertyTableProps={undefined}
    >
      <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3'>
        {COMPONENTS.map((c) => (
          <OverviewCard
            key={c.title}
            title={c.title}
            description={c.description}
            href={c.href}
            thumbnailSrc={c.thumbnailSrc}
            thumbnailAlt={`${c.title} thumbnail`}
          />
        ))}
      </div>
    </LiveDemoTemplate>
  );
}