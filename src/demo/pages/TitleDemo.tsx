// nohs-ui/src/demo/pages/TitleDemo.tsx

'use client';

import React, { useMemo, useState } from 'react';
import LiveDemoTemplate from '../LiveDemoTemplate';
import { D } from '../previewDefaults';

import { Title, Input, Select } from '@ds';
import { PropertyTable } from '@dds';

type TitleAlign = 'left' | 'center' | 'right';
type TitleWeight = 'semibold' | 'bold' | 'extrabold';


export default function TitleDemoPage() {
  const [text, setText] = useState<string>(D.Title.text);
  const [align, setAlign] = useState<TitleAlign>(D.Title.align);
  const [weight, setWeight] = useState<TitleWeight>(D.Title.weight);


  const demo = <Title align={align} weight={weight}>{text || 'A heading'}</Title>;

  const controls = useMemo(
    () => (
      <>
        <Input label='Text' value={text} onChange={(e) => setText(e.target.value)} fullWidth />
        <Select
          label='Align'
          value={align}
          onChange={(e) => setAlign(e.target.value as TitleAlign)}
          options={[{ value: 'left', label: 'left' }, { value: 'center', label: 'center' }, { value: 'right', label: 'right' }]}
          fullWidth
        />
        <Select
          label='Weight'
          value={weight}
          onChange={(e) => setWeight(e.target.value as TitleWeight)}
          options={[{ value: 'semibold', label: 'semibold' }, { value: 'bold', label: 'bold' }, { value: 'extrabold', label: 'extrabold' }]}
          fullWidth
        />
      </>
    ),
    [text, align, weight]
  );

  const usageCode = useMemo(() => {
    const props: string[] = [];
    if (align !== 'left') props.push(`align='${align}'`);
    if (weight !== 'bold') props.push(`weight='${weight}'`);

    return `<Title${props.length ? ' ' + props.join(' ') : ''}>${text || 'A heading'}</Title>`;
  }, [text, align, weight]);

  const properties = useMemo<React.ComponentProps<typeof PropertyTable>['data']>(
    () => [
      { name: 'level', description: 'Which of h1–h6 to render. This decides the document outline.', type: '1 | 2 | 3 | 4 | 5 | 6' },
      { name: 'align', description: 'Sets the alignment.', type: `'left' | 'center' | 'right'` },
      { name: 'weight', description: 'Sets the weight.', type: `'semibold' | 'bold' | 'extrabold'` },
    ],
    []
  );

  return (
    <LiveDemoTemplate
      title='Title'
      description='Document heading. Choose h1–h6 with level, then weight and align.'
      usageCode={usageCode}
      properties={properties}
      controls={controls}
    >
      {demo}
    </LiveDemoTemplate>
  );
}
