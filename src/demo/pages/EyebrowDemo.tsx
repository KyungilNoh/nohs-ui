// nohs-ui/src/demo/pages/EyebrowDemo.tsx

'use client';

import React, { useMemo, useState } from 'react';
import LiveDemoTemplate from '../LiveDemoTemplate';
import { D } from '../previewDefaults';

import { Eyebrow, Input, Select } from '@ds';
import { PropertyTable } from '@dds';

type EyebrowAlign = 'left' | 'center' | 'right';
type EyebrowTone = 'default' | 'muted' | 'primary';


export default function EyebrowDemoPage() {
  const [text, setText] = useState<string>(D.Eyebrow.text);
  const [align, setAlign] = useState<EyebrowAlign>(D.Eyebrow.align);
  const [tone, setTone] = useState<EyebrowTone>(D.Eyebrow.tone);


  const demo = <Eyebrow align={align} tone={tone}>{text || 'EYEBROW'}</Eyebrow>;

  const controls = useMemo(
    () => (
      <>
        <Input label='Text' value={text} onChange={(e) => setText(e.target.value)} fullWidth />
        <Select
          label='Align'
          value={align}
          onChange={(e) => setAlign(e.target.value as EyebrowAlign)}
          options={[{ value: 'left', label: 'left' }, { value: 'center', label: 'center' }, { value: 'right', label: 'right' }]}
          fullWidth
        />
        <Select
          label='Tone'
          value={tone}
          onChange={(e) => setTone(e.target.value as EyebrowTone)}
          options={[{ value: 'default', label: 'default' }, { value: 'muted', label: 'muted' }, { value: 'primary', label: 'primary' }]}
          fullWidth
        />
      </>
    ),
    [text, align, tone]
  );

  const usageCode = useMemo(() => {
    const props: string[] = [];
    if (align !== 'left') props.push(`align='${align}'`);
    if (tone !== 'default') props.push(`tone='${tone}'`);

    return `<Eyebrow${props.length ? ' ' + props.join(' ') : ''}>${text || 'EYEBROW'}</Eyebrow>`;
  }, [text, align, tone]);

  const properties = useMemo<React.ComponentProps<typeof PropertyTable>['data']>(
    () => [
      { name: 'align', description: 'Sets the alignment.', type: `'left' | 'center' | 'right'` },
      { name: 'tone', description: 'Sets the colour tone.', type: `'default' | 'muted' | 'primary'` },
    ],
    []
  );

  return (
    <LiveDemoTemplate
      title='Eyebrow'
      description='A small label above a heading. Names the section before you read it.'
      usageCode={usageCode}
      properties={properties}
      controls={controls}
    >
      {demo}
    </LiveDemoTemplate>
  );
}
