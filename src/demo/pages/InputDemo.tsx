// design-system/src/demo/pages/InputDemo.tsx

'use client';

import React, { useMemo, useState } from 'react';
import LiveDemoTemplate from '../LiveDemoTemplate';

import { Input, Label, Select, Switch, Checkbox } from '@ds';
import { PropertyTable } from '@dds';
import { controlFieldLabelToContentGap, controlGroupInnerGap, controlCompGap } from '../../components/_tokens/control';

type Size = 'sm' | 'md' | 'lg';
type Type =
  | 'text'
  | 'email'
  | 'password'
  | 'search'
  | 'tel'
  | 'url'
  | 'number';

const escapeForSingleQuote = (v: string) =>
  v.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

export default function InputDemoPage() {
  const [size, setSize] = useState<Size>('md');

  const [disabled, setDisabled] = useState(false);
  const [fullWidth, setFullWidth] = useState(false);

  const [type, setType] = useState<Type>('text');

  // ✅ placeholder는 데모 기본값으로만 (옵션 제공 X)
  const [placeholder] = useState('Type something...');

  // ✅ 데모는 controlled로 유지 (Value 옵션 UI는 제거)
  const [value, setValue] = useState('');

  // label
  const [labelEnabled, setLabelEnabled] = useState(true);
  const [label, setLabel] = useState('Label');

  // helper/description
  const [descriptionEnabled, setDescriptionEnabled] = useState(false);
  const [description, setDescription] = useState('This field is description');

  // error
  const [errorEnabled, setErrorEnabled] = useState(false);
  const [errorText, setErrorText] = useState('This field is required');

  // success
  const [successEnabled, setSuccessEnabled] = useState(false);
  const [successText, setSuccessText] = useState('Looks good!');

  // 정책: labelHidden이면 helper/error/success도 숨김
  const handleShowLabelChange = (next: boolean) => {
    setLabelEnabled(next);
    if (!next) {
      setDescriptionEnabled(false);
      setErrorEnabled(false);
      setSuccessEnabled(false);
    }
  };

  // 상태 우선순위: error > success > description
  const handleErrorEnabledChange = (next: boolean) => {
    setErrorEnabled(next);
    if (next) {
      setSuccessEnabled(false);
      setDescriptionEnabled(false);
    }
  };

  const handleSuccessEnabledChange = (next: boolean) => {
    setSuccessEnabled(next);
    if (next) {
      setErrorEnabled(false);
      setDescriptionEnabled(false);
    }
  };

  const handleDescriptionEnabledChange = (next: boolean) => {
    setDescriptionEnabled(next);
    if (next) {
      setErrorEnabled(false);
      setSuccessEnabled(false);
    }
  };

  const demo = (
    <Input
      label={label || 'Label'}
      labelHidden={!labelEnabled}
      size={size}
      type={type}
      disabled={disabled}
      fullWidth={fullWidth}
      placeholder={placeholder}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      description={
        labelEnabled && descriptionEnabled
          ? description || 'This field is description'
          : undefined
      }
      error={
        labelEnabled && errorEnabled
          ? errorText || 'This field is required'
          : undefined
      }
      success={
        labelEnabled && successEnabled
          ? successText || 'Looks good!'
          : undefined
      }
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

        <Select
          label='Type'
          value={type}
          onChange={(e) => setType(e.target.value as Type)}
          options={[
            { value: 'text', label: 'text' },
            { value: 'email', label: 'email' },
            { value: 'password', label: 'password' },
            { value: 'search', label: 'search' },
            { value: 'tel', label: 'tel' },
            { value: 'url', label: 'url' },
            { value: 'number', label: 'number' },
          ]}
          fullWidth
        />

        {/* ✅ Label group — 컴포넌트 ↔ 밑에 붙는 요소 간격은 controlCompGap */}
        <div className='flex flex-col'>
          <Input
            label='Label'
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder='Label'
            fullWidth
            disabled={!labelEnabled}
          />
          <div className={controlCompGap}>
            <Checkbox
              label='Show label'
              checked={labelEnabled}
              onChange={(e) => handleShowLabelChange(e.target.checked)}
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

            {/* 스위치 + 활성 시 Input 을 한 그룹으로 묶어 controlGroupInnerGap 은 그룹 사이에만, controlCompGap 은 스위치↔Input 에만 적용 */}
            <div className='flex flex-col'>
              <Switch
                label='Description'
                checked={labelEnabled && descriptionEnabled}
                onChange={handleDescriptionEnabledChange}
                size='md'
                disabled={!labelEnabled || errorEnabled || successEnabled}
              />
              {labelEnabled && descriptionEnabled ? (
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
                checked={labelEnabled && errorEnabled}
                onChange={handleErrorEnabledChange}
                size='md'
                disabled={!labelEnabled || successEnabled}
              />
              {labelEnabled && errorEnabled ? (
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

            <div className='flex flex-col'>
              <Switch
                label='Success'
                checked={labelEnabled && successEnabled}
                onChange={handleSuccessEnabledChange}
                size='md'
                disabled={!labelEnabled || errorEnabled}
              />
              {labelEnabled && successEnabled ? (
                <div className={controlCompGap}>
                  <Input
                    label='Success text'
                    labelHidden
                    value={successText}
                    onChange={(e) => setSuccessText(e.target.value)}
                    placeholder='Looks good!'
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
      type,
      label,
      labelEnabled,
      disabled,
      fullWidth,
      descriptionEnabled,
      description,
      errorEnabled,
      errorText,
      successEnabled,
      successText,
    ]
  );

  const usageCode = useMemo(() => {
    const props: string[] = [];

    if (size !== 'md') props.push(`size='${size}'`);
    if (type !== 'text') props.push(`type='${type}'`);

    if (disabled) props.push('disabled');
    if (!fullWidth) props.push('fullWidth={false}');

    const safeLabel = escapeForSingleQuote(label || 'Label');
    props.push(`label='${safeLabel}'`);
    if (!labelEnabled) props.push('labelHidden');

    if (labelEnabled) {
      if (errorEnabled) {
        props.push(
          `error='${escapeForSingleQuote(errorText || 'This field is required')}'`
        );
      } else if (successEnabled) {
        props.push(
          `success='${escapeForSingleQuote(successText || 'Looks good!')}'`
        );
      } else if (descriptionEnabled) {
        props.push(
          `description='${escapeForSingleQuote(
            description || 'This field is description'
          )}'`
        );
      }
    }

    props.push(`value='${escapeForSingleQuote(value)}'`);
    props.push('onChange={(e) => setValue(e.target.value)}');
    props.push(`placeholder='${escapeForSingleQuote(placeholder)}'`);

    return `<Input ${props.join(' ')} />`;
  }, [
    size,
    type,
    disabled,
    fullWidth,
    label,
    labelEnabled,
    descriptionEnabled,
    description,
    errorEnabled,
    errorText,
    successEnabled,
    successText,
    value,
    placeholder,
  ]);

  const properties = useMemo<React.ComponentProps<typeof PropertyTable>['data']>(
    () => [
      { name: 'label', description: '인풋 라벨입니다. 의미상 항상 존재합니다.', type: 'React.ReactNode' },
      { name: 'labelHidden', description: '라벨을 시각적으로 숨깁니다(sr-only).', type: 'boolean' },
      { name: 'description', description: '보조 설명 텍스트입니다(기본 상태).', type: 'React.ReactNode' },
      { name: 'error', description: '에러 메시지(에러 상태)입니다. success/description보다 우선합니다.', type: 'string' },
      { name: 'success', description: '성공 메시지(성공 상태)입니다. error가 있으면 무시됩니다.', type: 'string' },
      { name: 'size', description: '인풋 크기입니다.', type: `'sm' | 'md' | 'lg'` },
      { name: 'fullWidth', description: 'wrapper를 부모 너비에 맞춥니다.', type: 'boolean' },
      { name: 'disabled', description: '비활성화 상태입니다.', type: 'boolean' },
      { name: 'type', description: 'HTML input type 입니다.', type: 'string' },
      { name: 'placeholder', description: 'placeholder 텍스트입니다.', type: 'string' },
      { name: 'name', description: '폼 name 속성입니다.', type: 'string' },
      { name: 'id', description: 'id 속성입니다. 없으면 자동 생성됩니다.', type: 'string' },
      { name: 'value', description: '컨트롤드 입력 값입니다.', type: 'string' },
      { name: 'onChange', description: '값 변경 이벤트 핸들러입니다.', type: `(event: React.ChangeEvent<HTMLInputElement>) => void` },
    ],
    []
  );

  return (
    <LiveDemoTemplate
      title='Input'
      description='An input allows users to enter text. Supports helper, error, and success states.'
      usageCode={usageCode}
      properties={properties}
      controls={controls}
      propertyTableProps={{ fadeBottom: true, fadeHeightPx: 100 }}
    >
      {demo}
    </LiveDemoTemplate>
  );
}