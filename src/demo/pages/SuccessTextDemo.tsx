// nohs-ui/src/demo/pages/SuccessTextDemo.tsx

'use client';

import React, { useMemo, useState } from 'react';
import LiveDemoTemplate from '../LiveDemoTemplate';

import { SuccessText, Input, Select } from '@ds';
import { PropertyTable } from '@dds';

type Size = 'sm' | 'md' | 'lg';

export default function SuccessTextDemoPage() {
  const [text, setText] = useState('That name is available.');
  const [size, setSize] = useState<Size>('md');

  const demo = <SuccessText size={size}>{text || 'That name is available.'}</SuccessText>;

  const controls = useMemo(
    () => (
      <>
        <Input label='Text' value={text} onChange={(e) => setText(e.target.value)} fullWidth />
        <Select label='Size' value={size} onChange={(e) => setSize(e.target.value as Size)}
          options={[{ value: 'sm', label: 'sm' }, { value: 'md', label: 'md' }, { value: 'lg', label: 'lg' }]} fullWidth />
      </>
    ),
    [text, size]
  );

  const usageCode = useMemo(
    () => `<SuccessText${size !== 'md' ? ` size='${size}'` : ''}>${text || 'That name is available.'}</SuccessText>`,
    [text, size]
  );

  const properties = useMemo<React.ComponentProps<typeof PropertyTable>['data']>(
    () => [
      { name: 'size', description: 'Sets the text size. Match it to the bound input.', type: `'sm' | 'md' | 'lg'` },
      { name: 'children', description: 'The success text.', type: 'React.ReactNode' },
      { name: 'id', description: 'id used to bind this to an input via aria-describedby.', type: 'string' },
    ],
    []
  );

  return (
    <LiveDemoTemplate title='SuccessText' description='Success message under an input. Confirms it passed, in place.'
      usageCode={usageCode} properties={properties} controls={controls}>
      {demo}
    </LiveDemoTemplate>
  );
}
