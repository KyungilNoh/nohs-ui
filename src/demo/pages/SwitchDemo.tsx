// design-system/src/demo/pages/SwitchDemo.tsx

'use client';

import React, { useMemo, useState } from 'react';
import LiveDemoTemplate from '../LiveDemoTemplate';

import { Switch, Label, Select, Input, Checkbox } from '@ds';
import { PropertyTable } from '@dds';
import { controlFieldLabelToContentGap, controlGroupInnerGap, controlCompGap } from '../../components/_tokens/control';

type SwitchSize = 'sm' | 'md' | 'lg';
type LabelPosition = 'left' | 'right';

export default function SwitchDemoPage() {
  const [size, setSize] = useState<SwitchSize>('md');
  const [disabled, setDisabled] = useState(false);

  // ✅ checked는 항상 controlled (데모 기본 off)
  const [checked, setChecked] = useState(false);

  // label
  const [labelEnabled, setLabelEnabled] = useState(true);
  const [label, setLabel] = useState('Switch');
  const [labelPosition, setLabelPosition] = useState<LabelPosition>('right');

  // description
  const [descriptionEnabled, setDescriptionEnabled] = useState(false);
  const [description, setDescription] = useState('This field is description');

  const demo = (
    <Switch
      size={size}
      disabled={disabled}
      label={label || 'Switch'}
      labelHidden={!labelEnabled}
      labelPosition={labelPosition}
      description={
        descriptionEnabled
          ? description || 'This field is description'
          : undefined
      }
      checked={checked}
      onChange={setChecked}
    />
  );

  const controls = useMemo(
    () => (
      <>
        {/* Size */}
        <Select
          label='Size'
          value={size}
          onChange={(e) => setSize(e.target.value as SwitchSize)}
          options={[
            { value: 'sm', label: 'sm' },
            { value: 'md', label: 'md' },
            { value: 'lg', label: 'lg' },
          ]}
          fullWidth
        />

        {/* Label group — 컴포넌트 ↔ 밑에 붙는 요소 간격은 controlCompGap */}
        <div className='flex flex-col'>
          <div className={`flex flex-col ${controlGroupInnerGap}`}>
            <Input
              label='Label'
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder='Switch'
              fullWidth
            />
            <Select
              label='Label position'
              value={labelPosition}
              labelHidden
              onChange={(e) =>
                setLabelPosition(e.target.value as LabelPosition)
              }
              options={[
                { value: 'left', label: 'left' },
                { value: 'right', label: 'right' },
              ]}
              fullWidth
            />
          </div>
          <div className={controlCompGap}>
            <Checkbox
              label='Show label'
              checked={labelEnabled}
              onChange={(e) => setLabelEnabled(e.target.checked)}
              size='md'
              fullWidth={false}
            />
          </div>
        </div>

        {/* Options */}
        <div className='dsField'>
          <div className='dsFieldLabelRow'>
            <Label as='div' variant='field' size='md' className='dsFieldLabel'>
              Options
            </Label>
          </div>

          <div className={`flex flex-col ${controlGroupInnerGap} ${controlFieldLabelToContentGap}`}>
            {/* Checked */}
            <Switch
              label='Checked'
              checked={checked}
              onChange={setChecked}
              size='md'
            />

            <Switch
              label='Disabled'
              checked={disabled}
              onChange={setDisabled}
              size='md'
            />

            <div className='flex flex-col'>
              <Switch
                label='Description'
                checked={descriptionEnabled}
                onChange={setDescriptionEnabled}
                size='md'
                disabled={!labelEnabled}
              />
              {descriptionEnabled ? (
                <div className={controlCompGap}>
                  <Input
                    label='Description text'
                    labelHidden
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder='This field is description'
                    fullWidth
                    disabled={!labelEnabled}
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
      disabled,
      checked,
      label,
      labelEnabled,
      labelPosition,
      descriptionEnabled,
      description,
    ]
  );

  const usageCode = useMemo(() => {
    const props: string[] = [];

    if (size !== 'md') props.push(`size='${size}'`);
    if (disabled) props.push('disabled');

    props.push(`label='${label || 'Switch'}'`);
    if (!labelEnabled) props.push('labelHidden');
    if (labelPosition !== 'right')
      props.push(`labelPosition='${labelPosition}'`);

    if (descriptionEnabled)
      props.push(`description='${description || 'Description'}'`);

    props.push(`checked={${checked ? 'true' : 'false'}}`);
    props.push('onChange={setChecked}');

    const propStr = props.length ? ` ${props.join(' ')}` : '';
    return `<Switch${propStr} />`;
  }, [
    size,
    disabled,
    checked,
    label,
    labelEnabled,
    labelPosition,
    descriptionEnabled,
    description,
  ]);

  const properties = useMemo<React.ComponentProps<typeof PropertyTable>['data']>(
    () => [
      { name: 'checked', description: '스위치의 on/off 상태를 제어합니다.', type: 'boolean' },
      { name: 'onChange', description: '상태 변경 콜백입니다.', type: '(value: boolean) => void' },
      { name: 'size', description: '스위치 크기를 설정합니다.', type: `'sm' | 'md' | 'lg'` },
      { name: 'disabled', description: '비활성화 상태를 설정합니다.', type: 'boolean' },
      { name: 'label', description: '스위치 라벨(의미는 항상 존재)입니다.', type: 'React.ReactNode' },
      { name: 'labelHidden', description: '라벨을 시각적으로 숨깁니다(sr-only).', type: 'boolean' },
      { name: 'labelPosition', description: '라벨 위치입니다.', type: `'left' | 'right'` },
      { name: 'description', description: '보조 설명문(시각용)입니다.', type: 'React.ReactNode' },
      { name: 'className', description: '추가 클래스입니다.', type: 'string' },
    ],
    []
  );

  return (
    <LiveDemoTemplate
      title='Switch'
      description='A switch toggles a setting on or off.'
      usageCode={usageCode}
      properties={properties}
      controls={controls}
      propertyTableProps={{ fadeBottom: true, fadeHeightPx: 100 }}
    >
      {demo}
    </LiveDemoTemplate>
  );
}