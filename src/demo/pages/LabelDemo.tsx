// nohs-ui/src/demo/pages/LabelDemo.tsx

'use client';

import React, { useMemo, useState } from 'react';
import LiveDemoTemplate from '../LiveDemoTemplate';
import { D } from '../previewDefaults';

import { Label, Input, Select, Switch } from '@ds';
import { PropertyTable } from '@dds';

type LabelAs = 'label' | 'div' | 'span';
type LabelVariant = 'field' | 'control';
type Size = 'sm' | 'md' | 'lg';

export default function LabelDemoPage() {
  const [text, setText] = useState<string>(D.Label.text);
  const [as, setAs] = useState<LabelAs>(D.Label.as);
  const [variant, setVariant] = useState<LabelVariant>(D.Label.variant);
  const [size, setSize] = useState<Size>(D.Label.size);
  const [hidden, setHidden] = useState(false);

  // 쇼룸에 생짜 <input> 을 놓지 않는다 — 이 시스템의 컴포넌트가 아니다.
  // htmlFor 가 무엇을 하는지는 속성표가 말한다.
  const demo = (
    <Label as={as} variant={variant} size={size} hidden={hidden} htmlFor='label-demo-input'>
      {text || 'Label'}
    </Label>
  );

  const controls = useMemo(
    () => (
      <>
        <Input label='Text' value={text} onChange={(e) => setText(e.target.value)} fullWidth />
        <Select label='As' value={as} onChange={(e) => setAs(e.target.value as LabelAs)}
          options={[{ value: 'label', label: 'label' }, { value: 'div', label: 'div' }, { value: 'span', label: 'span' }]} fullWidth />
        <Select label='Variant' value={variant} onChange={(e) => setVariant(e.target.value as LabelVariant)}
          options={[{ value: 'field', label: 'field — name above an input' }, { value: 'control', label: 'control — name beside a control' }]} fullWidth />
        <Select label='Size' value={size} onChange={(e) => setSize(e.target.value as Size)}
          options={[{ value: 'sm', label: 'sm' }, { value: 'md', label: 'md' }, { value: 'lg', label: 'lg' }]} fullWidth />
        <Switch label='Hidden' checked={hidden} onChange={setHidden} size='md'
          description='Hidden visually, still read by screen readers.' />
      </>
    ),
    [text, as, variant, size, hidden]
  );

  const usageCode = useMemo(() => {
    const props: string[] = [];
    if (as !== 'label') props.push(`as='${as}'`);
    if (variant !== 'field') props.push(`variant='${variant}'`);
    if (size !== 'md') props.push(`size='${size}'`);
    if (hidden) props.push('hidden');
    props.push(`htmlFor='email'`);
    return `<Label ${props.join(' ')}>${text || 'Label'}</Label>`;
  }, [text, as, variant, size, hidden]);

  const properties = useMemo<React.ComponentProps<typeof PropertyTable>['data']>(
    () => [
      { name: 'htmlFor', description: 'The id of the input to bind. Without it, clicking the label does nothing and screen readers have no name.', type: 'string' },
      { name: 'as', description: 'Tag to render. Use div where nothing is actually bound.', type: `'label' | 'div' | 'span'` },
      { name: 'variant', description: 'field is a name above an input; control is a name beside a checkbox or switch.', type: `'field' | 'control'` },
      { name: 'size', description: 'Sets the text size.', type: `'sm' | 'md' | 'lg'` },
      { name: 'hidden', description: 'Hidden visually; stays in the accessibility tree.', type: 'boolean' },
    ],
    []
  );

  return (
    <LiveDemoTemplate title='Label'
      description='Names a form control. htmlFor binds it so clicks and screen readers both work.'
      usageCode={usageCode} properties={properties} controls={controls}>
      {demo}
    </LiveDemoTemplate>
  );
}
