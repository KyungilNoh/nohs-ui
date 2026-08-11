// design-system/src/demo/pages/CheckboxDemo.tsx

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import LiveDemoTemplate from '../LiveDemoTemplate';
import { PREVIEW_FULL_WIDTH } from '../previewDefaults';

import { Checkbox, Input, Label, Switch, Select } from '@ds';
import { PropertyTable } from '@dds';
import { controlFieldLabelToContentGap, controlGroupInnerGap, controlCompGap } from '../../components/_tokens/control';

type Size = 'sm' | 'md' | 'lg';

const escapeForSingleQuote = (v: string) =>
  v.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

export default function CheckboxDemo() {
  const [size, setSize] = useState<Size>('md');

  const [checked, setChecked] = useState(false);
  const [disabled, setDisabled] = useState(false);

  // ✅ 데모 기본값
  const [fullWidth, setFullWidth] = useState(PREVIEW_FULL_WIDTH);

  const [label, setLabel] = useState('Checkbox');
  const [showLabel, setShowLabel] = useState(true);

  const [descriptionEnabled, setDescriptionEnabled] = useState(false);
  const [description, setDescription] = useState('This field is description');

  const [errorEnabled, setErrorEnabled] = useState(false);
  const [errorText, setErrorText] = useState('This field is required');

  // ✅ Show label OFF → description / error 자동 OFF
  useEffect(() => {
    if (!showLabel) {
      setDescriptionEnabled(false);
      setErrorEnabled(false);
    }
  }, [showLabel]);

  const handleCheckedChange = (next: boolean) => {
    setChecked(next);

    // ✅ 체크되면 에러 자동 해제
    if (next && errorEnabled) setErrorEnabled(false);
  };

  const handleDescriptionEnabledChange = (next: boolean) => {
    if (!showLabel) return;

    setDescriptionEnabled(next);

    if (next && errorEnabled) setErrorEnabled(false);
  };

  const handleErrorEnabledChange = (next: boolean) => {
    if (!showLabel) return;

    // ✅ 에러 ON → 체크 해제
    if (next && checked) setChecked(false);

    setErrorEnabled(next);

    if (next && descriptionEnabled) setDescriptionEnabled(false);
  };

  const demo = (
    <Checkbox
      label={label || 'Checkbox'}
      labelHidden={!showLabel}
      size={size}
      checked={checked}
      onChange={(e) => handleCheckedChange(e.target.checked)}
      disabled={disabled}
      fullWidth={fullWidth}
      description={
        showLabel && !errorEnabled && descriptionEnabled
          ? (description || 'This field is description')
          : undefined
      }

      error={
        showLabel && errorEnabled
          ? (errorText || 'This field is required')
          : undefined
      }
      aria-label={!showLabel ? label || 'Checkbox' : undefined}
    />
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

        {/* ✅ Label group — 컴포넌트 ↔ 밑에 붙는 요소 간격은 controlCompGap */}
        <div className='flex flex-col'>
          <Input
            label='Label'
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder='Checkbox'
            fullWidth
          />
          <div className={controlCompGap}>
            <Checkbox
              label='Show label'
              checked={showLabel}
              onChange={(e) => setShowLabel(e.target.checked)}
              size='md'
              fullWidth={false}
            />
          </div>
        </div>

        <div className='dsField'>
          <div className='dsFieldLabelRow'>
            <Label as='div' variant='field' size='md' className='dsFieldLabel'>
              Options
            </Label>
          </div>

          <div className={`${controlFieldLabelToContentGap} flex flex-col ${controlGroupInnerGap}`}>
            <Switch
              label='Checked'
              checked={checked}
              onChange={handleCheckedChange}
              size='md'
            />

            <Switch
              label='Disabled'
              checked={disabled}
              onChange={setDisabled}
              size='md'
            />

            <Switch
              label='Full width'
              checked={fullWidth}
              onChange={setFullWidth}
              size='md'
            />

            <div className='flex flex-col'>
              <Switch
                label='Description'
                checked={showLabel && descriptionEnabled}
                onChange={handleDescriptionEnabledChange}
                size='md'
                disabled={!showLabel || errorEnabled}
              />
              {showLabel && descriptionEnabled && !errorEnabled ? (
                <div className={controlCompGap}>
                  <Input
                    label='Description text'
                    labelHidden
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder='This field is description'
                    fullWidth
                  />
                </div>
              ) : null}
            </div>

            <div className='flex flex-col'>
              <Switch
                label='Error'
                checked={showLabel && errorEnabled}
                onChange={handleErrorEnabledChange}
                size='md'
                disabled={!showLabel}
              />
              {showLabel && errorEnabled ? (
                <div className={controlCompGap}>
                  <Input
                    label='Error text'
                    labelHidden
                    value={errorText}
                    onChange={(e) => setErrorText(e.target.value)}
                    placeholder='This field is required'
                    fullWidth
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </>
    ),
    [
      size,
      label,
      showLabel,
      checked,
      disabled,
      fullWidth,
      descriptionEnabled,
      description,
      errorEnabled,
      errorText,
    ]
  );

  const usageCode = useMemo(() => {
    const props: string[] = [];

    const safeLabel = escapeForSingleQuote(label || 'Checkbox');
    props.push(`label='${safeLabel}'`);

    if (!showLabel) props.push('labelHidden');
    if (size !== 'md') props.push(`size='${size}'`);
    if (disabled) props.push('disabled');
    if (!fullWidth) props.push('fullWidth={false}');
    if (checked) props.push('checked');

    if (showLabel) {
      if (errorEnabled) {
        props.push(`error='${escapeForSingleQuote(errorText)}'`);
      } else if (descriptionEnabled && description) {
        props.push(`description='${escapeForSingleQuote(description)}'`);
      }
    } else {
      props.push(`aria-label='${safeLabel}'`);
    }

    return `<Checkbox ${props.join(' ')} />`;
  }, [
    label,
    showLabel,
    size,
    disabled,
    fullWidth,
    checked,
    errorEnabled,
    errorText,
    descriptionEnabled,
    description,
  ]);

  const properties = useMemo(
    () => [
      { name: 'label', description: 'The checkbox label. Semantically it is always present.', type: 'React.ReactNode' },
      {
        name: 'labelHidden',
        description:
          'Hides the label visually. Becomes icon-only; description and error hide with it.',
        type: 'boolean',
      },
      { name: 'description', description: 'Guidance text.', type: 'React.ReactNode' },
      { name: 'error', description: 'Shows an error message.', type: 'string' },
      { name: 'size', description: 'The checkbox size.', type: `'sm' | 'md' | 'lg'` },
      { name: 'fullWidth', description: 'Stretches the wrapper to the parent width.', type: 'boolean' },
      { name: 'checked', description: 'Checked state (controlled).', type: 'boolean' },
      { name: 'defaultChecked', description: 'Initial checked state (uncontrolled).', type: 'boolean' },
      { name: 'disabled', description: 'Disabled state.', type: 'boolean' },
      {
        name: 'onChange',
        description: 'Change handler for the checked state.',
        type: `(event: React.ChangeEvent<HTMLInputElement>) => void`,
      },
      {
        name: 'aria-label',
        description: 'Recommended as the accessible name when labelHidden is on.',
        type: 'string',
      },
    ],
    []
  );

  return (
    <LiveDemoTemplate
      title='Checkbox'
      description='A checkbox allows users to select one or more items from a set.'
      usageCode={usageCode}
      properties={properties}
      controls={controls}
      propertyTableProps={{ fadeBottom: true, fadeHeightPx: 100 }}
    >
      {demo}
    </LiveDemoTemplate>
  );
}