// nohs-ui/src/demo/pages/TextareaDemo.tsx

'use client';

import React, { useMemo, useState } from 'react';
import LiveDemoTemplate from '../LiveDemoTemplate';
import { D, PREVIEW_FIELD_W, PREVIEW_FULL_WIDTH } from '../previewDefaults';

import { Textarea, Input, Label, Switch, Select } from '@ds';
import { PropertyTable } from '@dds';
import { controlFieldLabelToContentGap, controlGroupInnerGap } from '../../components/_tokens/control';

type Size = 'sm' | 'md';

export default function TextareaDemoPage() {
  const [size, setSize] = useState<Size>(D.Textarea.size);
  const [label, setLabel] = useState<string>(D.Textarea.label);
  const [placeholder, setPlaceholder] = useState<string>(D.Textarea.placeholder);
  const [description, setDescription] = useState<string>(D.Textarea.description);

  const [showDescription, setShowDescription] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [fullWidth, setFullWidth] = useState(PREVIEW_FULL_WIDTH);

  const demo = (
    // 폼 컨트롤은 같은 폭 칸에 담는다 — 나란히 놓았을 때 폭이 맞아야 한다
    <div className={PREVIEW_FIELD_W}>
    <Textarea
      label={label || undefined}
      placeholder={placeholder}
      description={showDescription ? description : undefined}
      error={hasError ? 'Please write something.' : undefined}
      size={size}
      disabled={disabled}
      fullWidth={fullWidth}
    />
    </div>
  );

  const controls = useMemo(
    () => (
      <>
        <Select
          label='Size'
          value={size}
          onChange={(e) => setSize(e.target.value as Size)}
          options={[
            { value: 'sm', label: 'sm' },
            { value: 'md', label: 'md' },
          ]}
          fullWidth
        />

        <Input label='Label' value={label} onChange={(e) => setLabel(e.target.value)} fullWidth />
        <Input
          label='Placeholder'
          value={placeholder}
          onChange={(e) => setPlaceholder(e.target.value)}
          fullWidth
        />
        <Input
          label='Description'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          disabled={!showDescription}
        />

        <div className='dsField'>
          <div className='dsFieldLabelRow'>
            <Label as='div' variant='field' size='md' className='dsFieldLabel'>
              Options
            </Label>
          </div>
          <div className={`flex flex-col ${controlGroupInnerGap} ${controlFieldLabelToContentGap}`}>
            <Switch label='Description' checked={showDescription} onChange={setShowDescription} size='md' />
            <Switch
              label='Error'
              checked={hasError}
              onChange={setHasError}
              size='md'
              description='When set, error replaces description.'
            />
            <Switch label='Disabled' checked={disabled} onChange={setDisabled} size='md' />
            <Switch label='Full width' checked={fullWidth} onChange={setFullWidth} size='md' />
          </div>
        </div>
      </>
    ),
    [size, label, placeholder, description, showDescription, hasError, disabled, fullWidth]
  );

  const usageCode = useMemo(() => {
    const props: string[] = [];
    if (label) props.push(`label='${label}'`);
    if (placeholder) props.push(`placeholder='${placeholder}'`);
    if (showDescription && description) props.push(`description='${description}'`);
    if (hasError) props.push(`error='Please write something.'`);
    if (size !== 'md') props.push(`size='${size}'`);
    if (disabled) props.push('disabled');
    if (fullWidth) props.push('fullWidth');
    return `<Textarea${props.length ? ' ' + props.join(' ') : ''} />`;
  }, [label, placeholder, description, showDescription, hasError, size, disabled, fullWidth]);

  const properties = useMemo<React.ComponentProps<typeof PropertyTable>['data']>(
    () => [
      { name: 'label', description: 'Names the input. Bound to the textarea via htmlFor.', type: 'React.ReactNode' },
      { name: 'description', description: 'Guidance shown under the input.', type: 'React.ReactNode' },
      { name: 'error', description: 'Error message. Replaces description when set.', type: 'string' },
      { name: 'size', description: 'Sets the input size.', type: `'sm' | 'md'` },
      { name: 'fullWidth', description: 'Stretches to the parent width.', type: 'boolean' },
      { name: 'wrapperClassName', description: 'Class applied to the outer wrapper.', type: 'string' },
    ],
    []
  );

  return (
    <LiveDemoTemplate
      title='Textarea'
      description='Multi-line input. Follows the same label / description / error contract as Input.'
      usageCode={usageCode}
      properties={properties}
      controls={controls}
    >
      {demo}
    </LiveDemoTemplate>
  );
}
