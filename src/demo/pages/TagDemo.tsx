// nohs-ui/src/demo/pages/TagDemo.tsx

'use client';

import React, { useMemo, useState } from 'react';
import LiveDemoTemplate from '../LiveDemoTemplate';

import { Tag, Icon, Input, Label, Select, Switch } from '@ds';
import { PropertyTable } from '@dds';
import { controlFieldLabelToContentGap, controlGroupInnerGap } from '../../components/_tokens/control';

type Variant = 'default' | 'primary' | 'success' | 'warning' | 'danger';
type Size = 'sm' | 'md';

export default function TagDemoPage() {
  const [variant, setVariant] = useState<Variant>('primary');
  const [size, setSize] = useState<Size>('md');
  const [text, setText] = useState('Tag');
  const [withIcon, setWithIcon] = useState(false);
  const [removable, setRemovable] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const demo = (
    <Tag
      variant={variant}
      size={size}
      disabled={disabled}
      removable={removable}
      onRemove={removable ? () => console.log('removed') : undefined}
      icon={withIcon ? <Icon name='Check' fontSize='inherit' /> : undefined}
    >
      {text || 'Tag'}
    </Tag>
  );

  const controls = useMemo(
    () => (
      <>
        <Select label='Variant' value={variant} onChange={(e) => setVariant(e.target.value as Variant)}
          options={[
            { value: 'default', label: 'default' },
            { value: 'primary', label: 'primary' },
            { value: 'success', label: 'success' },
            { value: 'warning', label: 'warning' },
            { value: 'danger', label: 'danger' },
          ]} fullWidth />
        <Select label='Size' value={size} onChange={(e) => setSize(e.target.value as Size)}
          options={[{ value: 'sm', label: 'sm' }, { value: 'md', label: 'md' }]} fullWidth />
        <Input label='Text' value={text} onChange={(e) => setText(e.target.value)} fullWidth />

        <div className='dsField'>
          <div className='dsFieldLabelRow'>
            <Label as='div' variant='field' size='md' className='dsFieldLabel'>Options</Label>
          </div>
          <div className={`flex flex-col ${controlGroupInnerGap} ${controlFieldLabelToContentGap}`}>
            <Switch label='Icon' checked={withIcon} onChange={setWithIcon} size='md' />
            <Switch label='Removable' checked={removable} onChange={setRemovable} size='md'
              description='Adds a remove button that calls onRemove.' />
            <Switch label='Disabled' checked={disabled} onChange={setDisabled} size='md' />
          </div>
        </div>
      </>
    ),
    [variant, size, text, withIcon, removable, disabled]
  );

  const usageCode = useMemo(() => {
    const props: string[] = [];
    if (variant !== 'default') props.push(`variant='${variant}'`);
    if (size !== 'md') props.push(`size='${size}'`);
    if (withIcon) props.push(`icon={<Icon name='Check' fontSize='inherit' />}`);
    if (removable) props.push('removable', 'onRemove={handleRemove}');
    if (disabled) props.push('disabled');
    return `<Tag${props.length ? ' ' + props.join(' ') : ''}>${text || 'Tag'}</Tag>`;
  }, [variant, size, text, withIcon, removable, disabled]);

  const properties = useMemo<React.ComponentProps<typeof PropertyTable>['data']>(
    () => [
      { name: 'variant', description: 'Colour by meaning. success, warning and danger denote state.', type: `'default' | 'primary' | 'success' | 'warning' | 'danger'` },
      { name: 'size', description: 'Sets the tag size.', type: `'sm' | 'md'` },
      { name: 'icon', description: 'Icon shown before the text.', type: 'React.ReactNode' },
      { name: 'removable', description: 'Adds a remove button.', type: 'boolean' },
      { name: 'onRemove', description: 'Called when the remove button is pressed.', type: '() => void' },
      { name: 'disabled', description: 'Disables the control.', type: 'boolean' },
    ],
    []
  );

  return (
    <LiveDemoTemplate title='Tag'
      description='A chip for status or category. 5 variants, optional icon and remove button.'
      usageCode={usageCode} properties={properties} controls={controls}>
      {demo}
    </LiveDemoTemplate>
  );
}
