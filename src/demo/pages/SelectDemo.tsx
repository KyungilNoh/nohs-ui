// nohs-ui/src/demo/pages/SelectDemo.tsx

'use client';

import React, { useMemo, useState } from 'react';
import LiveDemoTemplate from '../LiveDemoTemplate';
import { D, PREVIEW_FIELD_W, PREVIEW_FULL_WIDTH } from '../previewDefaults';

import { Select, Input, Label, Switch } from '@ds';
import { PropertyTable } from '@dds';
import { controlFieldLabelToContentGap, controlGroupInnerGap } from '../../components/_tokens/control';

type Size = 'sm' | 'md' | 'lg';

const SAMPLE_OPTIONS = [
  { value: 'seoul', label: 'Seoul' },
  { value: 'busan', label: 'Busan' },
  { value: 'daegu', label: 'Daegu' },
  { value: 'incheon', label: 'Incheon' },
];

export default function SelectDemoPage() {
  const [size, setSize] = useState<Size>(D.Select.size);
  const [value, setValue] = useState<string>(D.Select.value);
  const [label, setLabel] = useState<string>(D.Select.label);
  const [description, setDescription] = useState<string>(D.Select.description);

  const [labelHidden, setLabelHidden] = useState(false);
  const [showDescription, setShowDescription] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [fullWidth, setFullWidth] = useState(PREVIEW_FULL_WIDTH);

  const demo = (
    // 폼 컨트롤은 같은 폭 칸에 담는다 — 나란히 놓았을 때 폭이 맞아야 한다
    <div className={PREVIEW_FIELD_W}>
    <Select
      label={label || undefined}
      labelHidden={labelHidden}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      options={SAMPLE_OPTIONS}
      description={showDescription ? description : undefined}
      error={hasError ? 'Please choose a city.' : undefined}
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
            { value: 'lg', label: 'lg' },
          ]}
          fullWidth
        />

        <Input label='Label' value={label} onChange={(e) => setLabel(e.target.value)} fullWidth />
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
            <Switch
              label='Label hidden'
              checked={labelHidden}
              onChange={setLabelHidden}
              size='md'
              description='Hidden visually, still read by screen readers.'
            />
            <Switch label='Description' checked={showDescription} onChange={setShowDescription} size='md' />
            <Switch label='Error' checked={hasError} onChange={setHasError} size='md' />
            <Switch label='Disabled' checked={disabled} onChange={setDisabled} size='md' />
            <Switch label='Full width' checked={fullWidth} onChange={setFullWidth} size='md' />
          </div>
        </div>
      </>
    ),
    [size, label, description, labelHidden, showDescription, hasError, disabled, fullWidth]
  );

  const usageCode = useMemo(() => {
    const props: string[] = [];
    if (label) props.push(`label='${label}'`);
    if (labelHidden) props.push('labelHidden');
    props.push(`value={value}`, `onChange={handleChange}`, `options={OPTIONS}`);
    if (showDescription && description) props.push(`description='${description}'`);
    if (hasError) props.push(`error='Please choose a city.'`);
    if (size !== 'md') props.push(`size='${size}'`);
    if (disabled) props.push('disabled');
    if (fullWidth) props.push('fullWidth');
    return `<Select ${props.join(' ')} />`;
  }, [label, labelHidden, description, showDescription, hasError, size, disabled, fullWidth]);

  const properties = useMemo<React.ComponentProps<typeof PropertyTable>['data']>(
    () => [
      { name: 'options', description: 'The list of choices, as { value, label }.', type: 'SelectOption[]' },
      { name: 'label', description: 'Names the input.', type: 'React.ReactNode' },
      { name: 'labelHidden', description: 'Hides the label visually; screen readers still read it.', type: 'boolean' },
      { name: 'description', description: 'Guidance shown under the input.', type: 'React.ReactNode' },
      { name: 'error', description: 'Error message. Replaces description when set.', type: 'string' },
      { name: 'size', description: 'Sets the input size.', type: `'sm' | 'md' | 'lg'` },
      { name: 'rightIconName', description: 'Overrides the trailing icon (a chevron by default).', type: 'IconName' },
      { name: 'fullWidth', description: 'Stretches to the parent width.', type: 'boolean' },
    ],
    []
  );

  return (
    <LiveDemoTemplate
      title='Select'
      description='Pick one from a list. Items are passed as an options array.'
      usageCode={usageCode}
      properties={properties}
      controls={controls}
    >
      {demo}
    </LiveDemoTemplate>
  );
}
