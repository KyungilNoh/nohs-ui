// nohs-ui/src/demo/pages/ErrorTextDemo.tsx

'use client';

import React, { useMemo, useState } from 'react';
import LiveDemoTemplate from '../LiveDemoTemplate';
import { D } from '../previewDefaults';

import { ErrorText, Input, Select } from '@ds';
import { PropertyTable } from '@dds';

type Size = 'sm' | 'md' | 'lg';

export default function ErrorTextDemoPage() {
  const [text, setText] = useState<string>(D.ErrorText.text);
  const [size, setSize] = useState<Size>(D.ErrorText.size);

  const demo = <ErrorText size={size}>{text || 'That is not a valid email.'}</ErrorText>;

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
    () => `<ErrorText${size !== 'md' ? ` size='${size}'` : ''}>${text || 'That is not a valid email.'}</ErrorText>`,
    [text, size]
  );

  const properties = useMemo<React.ComponentProps<typeof PropertyTable>['data']>(
    () => [
      { name: 'size', description: 'Sets the text size. Match it to the bound input.', type: `'sm' | 'md' | 'lg'` },
      { name: 'children', description: 'The error text.', type: 'React.ReactNode' },
      { name: 'id', description: 'id used to bind this to an input via aria-describedby.', type: 'string' },
    ],
    []
  );

  return (
    <LiveDemoTemplate title='ErrorText' description='Error message under an input. Says what went wrong.'
      usageCode={usageCode} properties={properties} controls={controls}>
      {demo}
    </LiveDemoTemplate>
  );
}
