// nohs-ui/src/demo/pages/CardDemo.tsx

'use client';

import React, { useMemo, useState } from 'react';
import LiveDemoTemplate from '../LiveDemoTemplate';
import { D } from '../previewDefaults';

import { Card, Input, Select, Subtitle, Paragraph } from '@ds';
import { PropertyTable } from '@dds';

type Elevation = 'none' | 'sm' | 'md' | 'lg';

export default function CardDemoPage() {
  const [elevation, setElevation] = useState<Elevation>(D.Card.elevation);
  const [title, setTitle] = useState<string>(D.Card.title);
  const [body, setBody] = useState<string>(D.Card.body);

  const demo = (
    <Card elevation={elevation} className='max-w-sm'>
      <Subtitle as='p'>{title || 'Card title'}</Subtitle>
      <Paragraph size='sm' tone='muted' className='mt-1'>
        {body}
      </Paragraph>
    </Card>
  );

  const controls = useMemo(
    () => (
      <>
        <Select
          label='Elevation'
          value={elevation}
          onChange={(e) => setElevation(e.target.value as Elevation)}
          options={[
            { value: 'none', label: 'none — no shadow' },
            { value: 'sm', label: 'sm — default' },
            { value: 'md', label: 'md' },
            { value: 'lg', label: 'lg' },
          ]}
          fullWidth
        />
        <Input label='Title' value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
        <Input label='Body' value={body} onChange={(e) => setBody(e.target.value)} fullWidth />
      </>
    ),
    [elevation, title, body]
  );

  const usageCode = useMemo(
    () =>
      `<Card${elevation !== 'sm' ? ` elevation='${elevation}'` : ''}>\n  <Subtitle as='p'>${title}</Subtitle>\n  <Paragraph size='sm' tone='muted'>${body}</Paragraph>\n</Card>`,
    [elevation, title, body]
  );

  const properties = useMemo<React.ComponentProps<typeof PropertyTable>['data']>(
    () => [
      { name: 'elevation', description: 'Shadow step that gives the surface depth.', type: `'none' | 'sm' | 'md' | 'lg'` },
      { name: 'className', description: 'Extra classes. Width and spacing go here.', type: 'string' },
      { name: 'children', description: 'What the card holds.', type: 'React.ReactNode' },
    ],
    []
  );

  return (
    <LiveDemoTemplate
      title='Card'
      description='A surface that holds content. Four elevation steps give it depth.'
      usageCode={usageCode}
      properties={properties}
      controls={controls}
    >
      {demo}
    </LiveDemoTemplate>
  );
}
