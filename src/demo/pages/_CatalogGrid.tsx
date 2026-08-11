// nohs-ui/src/demo/pages/_CatalogGrid.tsx

'use client';

import React from 'react';
import { OverviewCard } from '@dds';
import type { Entry } from '../catalog';

/** Molecules · Atoms 페이지가 함께 쓰는 카드 격자 */
export default function CatalogGrid({ entries }: { entries: Entry[] }) {
  return (
    <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3'>
      {entries.map((c) => (
        <OverviewCard
          key={c.title}
          title={c.title}
          description={c.description}
          href={c.href}
          preview={c.preview}
        />
      ))}
    </div>
  );
}
