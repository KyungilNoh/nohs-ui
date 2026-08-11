// nohs-ui/src/demo/pages/ParagraphDemo.tsx

'use client';

import React, { useMemo, useState } from 'react';
import LiveDemoTemplate from '../LiveDemoTemplate';

import { Paragraph, Input, Select } from '@ds';
import { PropertyTable } from '@dds';

type ParagraphSize = 'sm' | 'md' | 'lg';
type ParagraphWeight = 'light' | 'regular' | 'medium';
type ParagraphAlign = 'left' | 'center' | 'right';
type ParagraphTone = 'default' | 'muted' | 'strong';


export default function ParagraphDemoPage() {
  const [text, setText] = useState('Body copy sized and spaced for reading.');
  const [size, setSize] = useState<ParagraphSize>('md');
  const [weight, setWeight] = useState<ParagraphWeight>('regular');
  const [align, setAlign] = useState<ParagraphAlign>('left');
  const [tone, setTone] = useState<ParagraphTone>('default');


  const demo = <Paragraph size={size} weight={weight} align={align} tone={tone}>{text || 'Body copy sized and spaced for reading.'}</Paragraph>;

  const controls = useMemo(
    () => (
      <>
        <Input label='Text' value={text} onChange={(e) => setText(e.target.value)} fullWidth />
        <Select
          label='Size'
          value={size}
          onChange={(e) => setSize(e.target.value as ParagraphSize)}
          options={[{ value: 'sm', label: 'sm' }, { value: 'md', label: 'md' }, { value: 'lg', label: 'lg' }]}
          fullWidth
        />
        <Select
          label='Weight'
          value={weight}
          onChange={(e) => setWeight(e.target.value as ParagraphWeight)}
          options={[{ value: 'light', label: 'light' }, { value: 'regular', label: 'regular' }, { value: 'medium', label: 'medium' }]}
          fullWidth
        />
        <Select
          label='Align'
          value={align}
          onChange={(e) => setAlign(e.target.value as ParagraphAlign)}
          options={[{ value: 'left', label: 'left' }, { value: 'center', label: 'center' }, { value: 'right', label: 'right' }]}
          fullWidth
        />
        <Select
          label='Tone'
          value={tone}
          onChange={(e) => setTone(e.target.value as ParagraphTone)}
          options={[{ value: 'default', label: 'default' }, { value: 'muted', label: 'muted' }, { value: 'strong', label: 'strong' }]}
          fullWidth
        />
      </>
    ),
    [text, size, weight, align, tone]
  );

  const usageCode = useMemo(() => {
    const props: string[] = [];
    if (size !== 'md') props.push(`size='${size}'`);
    if (weight !== 'regular') props.push(`weight='${weight}'`);
    if (align !== 'left') props.push(`align='${align}'`);
    if (tone !== 'default') props.push(`tone='${tone}'`);

    return `<Paragraph${props.length ? ' ' + props.join(' ') : ''}>${text || 'Body copy sized and spaced for reading.'}</Paragraph>`;
  }, [text, size, weight, align, tone]);

  const properties = useMemo<React.ComponentProps<typeof PropertyTable>['data']>(
    () => [
      { name: 'size', description: 'Sets the text size.', type: `'sm' | 'md' | 'lg'` },
      { name: 'weight', description: 'Sets the weight.', type: `'light' | 'regular' | 'medium'` },
      { name: 'align', description: 'Sets the alignment.', type: `'left' | 'center' | 'right'` },
      { name: 'tone', description: 'Sets the colour tone. Use muted for secondary information.', type: `'default' | 'muted' | 'strong'` },
    ],
    []
  );

  return (
    <LiveDemoTemplate
      title='Paragraph'
      description='Body text. 3 sizes · 3 weights · 3 tones.'
      usageCode={usageCode}
      properties={properties}
      controls={controls}
    >
      {demo}
    </LiveDemoTemplate>
  );
}
