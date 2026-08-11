// nohs-ui/src/demo/pages/MoleculesPage.tsx

'use client';

import React from 'react';
import LiveDemoTemplate from '../LiveDemoTemplate';
import CatalogGrid from './_CatalogGrid';
import { MOLECULES } from '../catalog';

export default function MoleculesPage() {
  return (
    <LiveDemoTemplate
      pageOnly
      title='Molecules'
      description={`${MOLECULES.length} — Built from Atoms to finish one job. They carry interaction and state.`}
      usageCode=''
      properties={[]}
      controls={null}
    >
      <CatalogGrid entries={MOLECULES} />
    </LiveDemoTemplate>
  );
}
