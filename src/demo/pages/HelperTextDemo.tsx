// nohs-ui/src/demo/pages/HelperTextDemo.tsx

'use client';

import React, { useMemo, useState } from 'react';
import LiveDemoTemplate from '../LiveDemoTemplate';

import { HelperText, Input, Select } from '@ds';
import { PropertyTable } from '@dds';

type Size = 'sm' | 'md' | 'lg';

export default function HelperTextDemoPage() {
  const [text, setText] = useState('Use at least 8 characters.');
  const [size, setSize] = useState<Size>('md');

  const demo = <HelperText size={size}>{text || 'Use at least 8 characters.'}</HelperText>;

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
    () => `<HelperText${size !== 'md' ? ` size='${size}'` : ''}>${text || 'Use at least 8 characters.'}</HelperText>`,
    [text, size]
  );

  const properties = useMemo<React.ComponentProps<typeof PropertyTable>['data']>(
    () => [
      { name: 'size', description: 'Sets the text size. Match it to the bound input.', type: `'sm' | 'md' | 'lg'` },
      { name: 'children', description: 'The guidance text.', type: 'React.ReactNode' },
      { name: 'id', description: 'id used to bind this to an input via aria-describedby.', type: 'string' },
    ],
    []
  );

  return (
    <LiveDemoTemplate title='HelperText' description='Guidance under an input. Says what to type before you get it wrong.'
      usageCode={usageCode} properties={properties} controls={controls}>
      {demo}
    </LiveDemoTemplate>
  );
}
