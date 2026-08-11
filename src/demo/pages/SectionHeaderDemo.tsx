// nohs-ui/src/demo/pages/SectionHeaderDemo.tsx

'use client';

import React, { useMemo, useState } from 'react';
import LiveDemoTemplate from '../LiveDemoTemplate';

import { SectionHeader, Input, Label, Switch, Select } from '@ds';
import { PropertyTable } from '@dds';
import { controlFieldLabelToContentGap, controlGroupInnerGap } from '../../components/_tokens/control';

type Align = 'left' | 'center' | 'right';

export default function SectionHeaderDemoPage() {
  const [align, setAlign] = useState<Align>('left');
  const [eyebrow, setEyebrow] = useState('SECTION');
  const [title, setTitle] = useState('Section title');
  const [description, setDescription] = useState('One line on what this section covers.');

  const [showEyebrow, setShowEyebrow] = useState(true);
  const [showDescription, setShowDescription] = useState(true);

  const demo = (
    <SectionHeader
      align={align}
      eyebrow={showEyebrow ? eyebrow : undefined}
      title={title || 'Section title'}
      description={showDescription ? description : undefined}
    />
  );

  const controls = useMemo(
    () => (
      <>
        <Select
          label='Align'
          value={align}
          onChange={(e) => setAlign(e.target.value as Align)}
          options={[
            { value: 'left', label: 'left' },
            { value: 'center', label: 'center' },
            { value: 'right', label: 'right' },
          ]}
          fullWidth
        />
        <Input label='Eyebrow' value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} fullWidth disabled={!showEyebrow} />
        <Input label='Title' value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
        <Input label='Description' value={description} onChange={(e) => setDescription(e.target.value)} fullWidth disabled={!showDescription} />

        <div className='dsField'>
          <div className='dsFieldLabelRow'>
            <Label as='div' variant='field' size='md' className='dsFieldLabel'>Options</Label>
          </div>
          <div className={`flex flex-col ${controlGroupInnerGap} ${controlFieldLabelToContentGap}`}>
            <Switch label='Eyebrow' checked={showEyebrow} onChange={setShowEyebrow} size='md' />
            <Switch label='Description' checked={showDescription} onChange={setShowDescription} size='md' />
          </div>
        </div>
      </>
    ),
    [align, eyebrow, title, description, showEyebrow, showDescription]
  );

  const usageCode = useMemo(() => {
    const props: string[] = [];
    if (showEyebrow && eyebrow) props.push(`eyebrow='${eyebrow}'`);
    props.push(`title='${title}'`);
    if (showDescription && description) props.push(`description='${description}'`);
    if (align !== 'left') props.push(`align='${align}'`);
    return `<SectionHeader ${props.join(' ')} />`;
  }, [align, eyebrow, title, description, showEyebrow, showDescription]);

  const properties = useMemo<React.ComponentProps<typeof PropertyTable>['data']>(
    () => [
      { name: 'eyebrow', description: 'Small label above the title. Rendered as Eyebrow.', type: 'React.ReactNode' },
      { name: 'title', description: 'The section title. Rendered as Title level=2.', type: 'React.ReactNode' },
      { name: 'description', description: 'Description under the title. Rendered as Paragraph size=sm.', type: 'React.ReactNode' },
      { name: 'align', description: 'Alignment. Inner elements follow it.', type: `'left' | 'center' | 'right'` },
    ],
    []
  );

  return (
    <LiveDemoTemplate
      title='SectionHeader'
      description='Eyebrow, Title and Paragraph bound into one section head.'
      usageCode={usageCode}
      properties={properties}
      controls={controls}
    >
      {demo}
    </LiveDemoTemplate>
  );
}
