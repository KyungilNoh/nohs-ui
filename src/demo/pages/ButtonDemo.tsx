// design-system/src/demo/pages/ButtonDemo.tsx

'use client';

import React, { useMemo, useState } from 'react';
import LiveDemoTemplate from '../LiveDemoTemplate';

import { Button, Input, Label, Switch, Select } from '@ds';
import { PropertyTable } from '@dds';
import type { IconName } from '@ds';
import { controlFieldLabelToContentGap, controlGroupInnerGap, controlCompGap } from '../../components/_tokens/control';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

export default function ButtonDemoPage() {
  const [variant, setVariant] = useState<Variant>('primary');
  const [size, setSize] = useState<Size>('md');

  const [disabled, setDisabled] = useState(false);
  const [fullWidth, setFullWidth] = useState(false);

  const [label, setLabel] = useState('Button');

  const [leftIconEnabled, setLeftIconEnabled] = useState(false);
  const [rightIconEnabled, setRightIconEnabled] = useState(false);

  const [leftIconName, setLeftIconName] = useState<IconName>('SmartToy');
  const [rightIconName, setRightIconName] = useState<IconName>('ArrowForward');

  // icon only (children 제거)
  const [iconOnly, setIconOnly] = useState(false);

  const ICON_OPTIONS = useMemo(
    () => [
      { value: 'SmartToy', label: 'SmartToy' },
      { value: 'Add', label: 'Add' },
      { value: 'Close', label: 'Close' },
      { value: 'ArrowBack', label: 'ArrowBack' },
      { value: 'ArrowForward', label: 'ArrowForward' },
      { value: 'Check', label: 'Check' },
    ] as Array<{ value: IconName; label: string }>,
    []
  );

  const demo = (
    <Button
      variant={variant}
      size={size}
      disabled={disabled}
      fullWidth={fullWidth}
      // ✅ iconOnly면 leftIcon 강제 ON + SmartToy 기본
      leftIconName={iconOnly ? leftIconName : leftIconEnabled ? leftIconName : undefined}
      rightIconName={iconOnly ? undefined : rightIconEnabled ? rightIconName : undefined}
      iconOnlyDefaultIconName='SmartToy'
      onClick={() => console.log('clicked')}
      aria-label={iconOnly ? 'Button' : undefined}
      title={iconOnly ? 'Button' : undefined}
    >
      {iconOnly ? null : label || 'Button'}
    </Button>
  );

  const controls = useMemo(
    () => (
      <>
        <Select
          label='Variant'
          value={variant}
          onChange={(e) => setVariant(e.target.value as Variant)}
          options={[
            { value: 'primary', label: 'primary' },
            { value: 'secondary', label: 'secondary' },
            { value: 'ghost', label: 'ghost' },
            { value: 'destructive', label: 'destructive' },
          ]}
          fullWidth
        />

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

        <Input
          label='Label'
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder='Button'
          fullWidth
          disabled={iconOnly}
        />


      {/* ✅ Switch group */}
      <div className='dsField'>
        <div className='dsFieldLabelRow'>
          <Label as='div' variant='field' size='md' className='dsFieldLabel'>
            Options
          </Label>
          {/* 필요하면 오른쪽에 보조 텍스트/배지 등 */}
        </div>

        <div className={`flex flex-col ${controlGroupInnerGap} ${controlFieldLabelToContentGap}`}>
          <Switch label='Disabled' checked={disabled} onChange={setDisabled} size='md' />
          <Switch label='Full width' checked={fullWidth} onChange={setFullWidth} size='md' />
          <Switch label='Icon only' checked={iconOnly} onChange={setIconOnly} size='md' />

          {/* Left icon: 트리거 스위치 ↔ 귀속 Select 간격 = controlCompGap */}
          <div className='flex flex-col'>
            <Switch
              label='Left icon'
              checked={iconOnly ? true : leftIconEnabled}
              onChange={setLeftIconEnabled}
              size='md'
              disabled={iconOnly}
              description={iconOnly ? 'Icon-only 모드에서는 Left icon이 항상 활성화됩니다.' : undefined}
            />
            {(iconOnly || leftIconEnabled) ? (
              <div className={controlCompGap}>
                <Select
                  label='Left icon name'
                  labelHidden
                  value={leftIconName}
                  onChange={(e) => setLeftIconName(e.target.value as IconName)}
                  options={ICON_OPTIONS}
                  fullWidth
                />
              </div>
            ) : null}
          </div>

          {/* Right icon: 트리거 스위치 ↔ 귀속 Select 간격 = controlCompGap */}
          <div className='flex flex-col'>
            <Switch
              label='Right icon'
              checked={iconOnly ? false : rightIconEnabled}
              onChange={setRightIconEnabled}
              size='md'
              disabled={iconOnly}
              description={iconOnly ? 'Icon-only 모드에서는 Right icon을 사용하지 않습니다.' : undefined}
            />
            {!iconOnly && rightIconEnabled ? (
              <div className={controlCompGap}>
                <Select
                  label='Right icon name'
                  labelHidden
                  value={rightIconName}
                  onChange={(e) => setRightIconName(e.target.value as IconName)}
                  options={ICON_OPTIONS}
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
      variant,
      size,
      label,
      disabled,
      fullWidth,
      iconOnly,
      leftIconEnabled,
      rightIconEnabled,
      leftIconName,
      rightIconName,
      ICON_OPTIONS,
    ]
  );

  const usageCode = useMemo(() => {
    const props: string[] = [];

    if (variant !== 'secondary') props.push(`variant='${variant}'`);
    if (size !== 'md') props.push(`size='${size}'`);

    if (fullWidth) props.push('fullWidth');
    if (disabled) props.push('disabled');

    if (iconOnly) {
      // icon-only는 leftIconName이 사실상 강제
      props.push(`leftIconName='${leftIconName}'`);
      const propStr = props.length ? ` ${props.join(' ')}` : '';
      return `<Button${propStr} />`;
    }

    if (leftIconEnabled) props.push(`leftIconName='${leftIconName}'`);
    if (rightIconEnabled) props.push(`rightIconName='${rightIconName}'`);

    const propStr = props.length ? ` ${props.join(' ')}` : '';
    return `<Button${propStr}>${label || 'Button'}</Button>`;
  }, [
    variant,
    size,
    fullWidth,
    disabled,
    iconOnly,
    leftIconEnabled,
    rightIconEnabled,
    leftIconName,
    rightIconName,
    label,
  ]);

  const properties = useMemo<React.ComponentProps<typeof PropertyTable>['data']>(
    () => [
      { name: 'variant', description: '버튼 스타일 변형을 설정합니다.', type: `'primary' | 'secondary' | 'ghost' | 'destructive'` },
      { name: 'size', description: '버튼 크기를 설정합니다.', type: `'sm' | 'md' | 'lg'` },
      { name: 'fullWidth', description: '버튼을 부모 너비에 맞춰 꽉 채웁니다.', type: 'boolean' },
      { name: 'leftIconName', description: '왼쪽 아이콘 이름(MUI IconName)입니다.', type: 'IconName' },
      { name: 'rightIconName', description: '오른쪽 아이콘 이름(MUI IconName)입니다.', type: 'IconName' },
      { name: 'iconOnlyDefaultIconName', description: 'Icon-only일 때 기본 아이콘입니다.', type: 'IconName' },
      { name: 'disabled', description: '비활성화 상태를 설정합니다.', type: 'boolean' },
      {
        name: 'children (type blurred)',
        description: '버튼 라벨(텍스트/노드)입니다.',
        type: 'React.ReactNode',
        blur: true,
        blurColumns: ['type'],
      },
      {
        name: 'onClick',
        description: '클릭 이벤트 핸들러입니다.',
        type: `(event: React.MouseEvent<HTMLButtonElement>) => void
        dddasdfasd
        dddasdfasd
        dddasdfasd
        dddasdfasd`,
        blur: true,
      },
    ],
    []
  );

  return (
    <LiveDemoTemplate
      title='Button'
      description='A button triggers an event or action. They let users know what will happen next.'
      usageCode={usageCode}
      properties={properties}
      controls={controls}
      propertyTableProps={{ fadeBottom: true, fadeHeightPx: 100 }}
    >
      {demo}
    </LiveDemoTemplate>
  );
}