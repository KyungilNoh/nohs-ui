// nohs-ui/src/demo/pages/AtomsPage.tsx

'use client';

import React from 'react';
import LiveDemoTemplate from '../LiveDemoTemplate';
import CatalogGrid from './_CatalogGrid';
import { ATOMS } from '../catalog';

export default function AtomsPage() {
  return (
    <LiveDemoTemplate
      pageOnly
      title='Atoms'
      description={`${ATOMS.length} — The smallest units. Mostly presentational; they hold no state of their own.`}
      usageCode=''
      properties={[]}
      controls={null}
    >
      <CatalogGrid entries={ATOMS} />
    </LiveDemoTemplate>
  );
}
