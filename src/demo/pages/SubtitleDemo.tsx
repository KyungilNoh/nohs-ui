// nohs-ui/src/demo/pages/SubtitleDemo.tsx

'use client';

import React, { useMemo, useState } from 'react';
import LiveDemoTemplate from '../LiveDemoTemplate';

import { Subtitle, Input, Select } from '@ds';
import { PropertyTable } from '@dds';

type SubtitleAs = 'h2' | 'h3' | 'p';
type SubtitleAlign = 'left' | 'center' | 'right';
type SubtitleWeight = 'regular' | 'medium' | 'semibold';
type SubtitleTone = 'default' | 'muted';


export default function SubtitleDemoPage() {
  const [text, setText] = useState('A supporting heading');
  const [as, setAs] = useState<SubtitleAs>('h3');
  const [align, setAlign] = useState<SubtitleAlign>('left');
  const [weight, setWeight] = useState<SubtitleWeight>('medium');
  const [tone, setTone] = useState<SubtitleTone>('default');


  const demo = <Subtitle as={as} align={align} weight={weight} tone={tone}>{text || 'A supporting heading'}</Subtitle>;

  const controls = useMemo(
    () => (
      <>
        <Input label='Text' value={text} onChange={(e) => setText(e.target.value)} fullWidth />
        <Select
          label='As'
          value={as}
          onChange={(e) => setAs(e.target.value as SubtitleAs)}
          options={[{ value: 'h2', label: 'h2' }, { value: 'h3', label: 'h3' }, { value: 'p', label: 'p' }]}
          fullWidth
        />
        <Select
          label='Align'
          value={align}
          onChange={(e) => setAlign(e.target.value as SubtitleAlign)}
          options={[{ value: 'left', label: 'left' }, { value: 'center', label: 'center' }, { value: 'right', label: 'right' }]}
          fullWidth
        />
        <Select
          label='Weight'
          value={weight}
          onChange={(e) => setWeight(e.target.value as SubtitleWeight)}
          options={[{ value: 'regular', label: 'regular' }, { value: 'medium', label: 'medium' }, { value: 'semibold', label: 'semibold' }]}
          fullWidth
        />
        <Select
          label='Tone'
          value={tone}
          onChange={(e) => setTone(e.target.value as SubtitleTone)}
          options={[{ value: 'default', label: 'default' }, { value: 'muted', label: 'muted' }]}
          fullWidth
        />
      </>
    ),
    [text, as, align, weight, tone]
  );

  const usageCode = useMemo(() => {
    const props: string[] = [];
    if (as !== 'h3') props.push(`as='${as}'`);
    if (align !== 'left') props.push(`align='${align}'`);
    if (weight !== 'medium') props.push(`weight='${weight}'`);
    if (tone !== 'default') props.push(`tone='${tone}'`);

    return `<Subtitle${props.length ? ' ' + props.join(' ') : ''}>${text || 'A supporting heading'}</Subtitle>`;
  }, [text, as, align, weight, tone]);

  const properties = useMemo<React.ComponentProps<typeof PropertyTable>['data']>(
    () => [
      { name: 'as', description: 'Tag to render. Use p when it is not semantically a heading.', type: `'h2' | 'h3' | 'p'` },
      { name: 'align', description: 'Sets the alignment.', type: `'left' | 'center' | 'right'` },
      { name: 'weight', description: 'Sets the weight.', type: `'regular' | 'medium' | 'semibold'` },
      { name: 'tone', description: 'Sets the colour tone.', type: `'default' | 'muted'` },
    ],
    []
  );

  return (
    <LiveDemoTemplate
      title='Subtitle'
      description='Supporting heading under a Title. Renders as h2, h3 or p.'
      usageCode={usageCode}
      properties={properties}
      controls={controls}
    >
      {demo}
    </LiveDemoTemplate>
  );
}
