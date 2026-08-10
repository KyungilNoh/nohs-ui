// design-system/src/components/molecules/Switch.tsx

'use client';

import React, { useId, useMemo, useState } from 'react';
import { Switch as HSwitch } from '@headlessui/react';

import Label from '../atoms/Label';
import HelperText from '../atoms/HelperText';
import ErrorText from '../atoms/ErrorText';
import { controlLabelToControlGapX, controlCompGap } from '../_tokens/control';

export type SwitchSize = 'sm' | 'md' | 'lg';

export interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (value: boolean) => void;

  size?: SwitchSize;
  disabled?: boolean;

  label: React.ReactNode;
  labelHidden?: boolean;
  labelPosition?: 'left' | 'right';

  description?: React.ReactNode;
  /** (옵션) Switch도 에러 상태 지원 */
  error?: string;

  className?: string;

  /**
   * labelHidden일 때, 스크린리더용 라벨을 명시적으로 주고 싶다면 사용
   * (label이 ReactNode라 string으로 자동 추출 못할 때)
   */
  ariaLabel?: string;
}

const cx = (...v: Array<string | false | null | undefined>) =>
  v.filter(Boolean).join(' ');

const sizeMap: Record<
  SwitchSize,
  { track: string; knob: string; translateOn: string; translateOff: string; indent: string }
> = {
  sm: {
    track: 'h-5 w-9',
    knob: 'h-4 w-4',
    translateOn: 'translate-x-[17px]',
    translateOff: 'translate-x-[1px]',
    indent: 'ml-12',
  },
  md: {
    track: 'h-6 w-11',
    knob: 'h-5 w-5',
    translateOn: 'translate-x-[21px]',
    translateOff: 'translate-x-[1px]',
    indent: 'ml-14',
  },
  lg: {
    track: 'h-7 w-[52px]',
    knob: 'h-6 w-6',
    translateOn: 'translate-x-[25px]',
    translateOff: 'translate-x-[1px]',
    indent: 'ml-16',
  },
};

export const Switch: React.FC<SwitchProps> = ({
  checked,
  defaultChecked = false,
  onChange,
  size = 'md',
  disabled = false,

  label,
  labelHidden = false,
  labelPosition = 'right',

  description,
  error,

  className,
  ariaLabel,
}) => {
  const isControlled = checked !== undefined;
  const [uncontrolledEnabled, setUncontrolledEnabled] = useState<boolean>(
    !!defaultChecked
  );
  const enabled = isControlled ? !!checked : uncontrolledEnabled;

  const hasError = !!error;

  // 안정적인 DOM id 생성 (useId는 SSR/CSR 안정)
  const reactId = useId();
  const labelId = `switch-${reactId}-label`;
  const descriptionId = `switch-${reactId}-desc`;
  const errorId = `switch-${reactId}-err`;

  const handleChange = (val: boolean) => {
    if (!isControlled) setUncontrolledEnabled(val);
    onChange?.(val);
  };

  const sz = sizeMap[size];

  // labelHidden이면 helper/error도 "시각적으로" 숨김 + aria-describedby 제거(Checkbox/Input과 통일)
  const showDescription = !!description && !labelHidden && !hasError;
  const showError = !!error && !labelHidden;

  const describedBy = showError ? errorId : showDescription ? descriptionId : undefined;

  // labelHidden일 때 aria-label 보험 (label이 string/number면 자동으로 추출)
  const inferredAriaLabel = useMemo(() => {
    if (!labelHidden) return undefined;
    if (ariaLabel) return ariaLabel;
    if (typeof label === 'string') return label;
    if (typeof label === 'number') return String(label);
    return undefined;
  }, [labelHidden, ariaLabel, label]);

  const descIndentClass =
    labelPosition === 'right' ? sz.indent : 'ml-0';

  const labelEl = (
    <Label
      id={labelId}
      size={size}
      hidden={labelHidden}
      variant='control'
      as='div'
    >
      {label}
    </Label>
  );

  return (
    <div
      className={cx(
        'inline-flex flex-col',
        disabled && 'opacity-60 cursor-not-allowed',
        className
      )}
    >
      <div className={cx('flex items-center', controlLabelToControlGapX)}>
        {labelPosition === 'left' && labelEl}

        <HSwitch
          checked={enabled}
          onChange={handleChange}
          disabled={disabled}
          aria-labelledby={!labelHidden ? labelId : undefined}
          aria-label={inferredAriaLabel}
          aria-describedby={describedBy}
          aria-invalid={hasError || undefined}
          className={cx(
            'relative inline-flex shrink-0 items-center rounded-full transition-colors border',
            'ds-focus-visible-ring',
            hasError ? 'ring-error' : 'ring-primary',
            enabled ? 'bg-primary border-primary' : 'bg-surface-strong border-outline',
            hasError && !enabled && 'border-error',
            sz.track
          )}
        >
          <span
            aria-hidden='true'
            className={cx(
              'pointer-events-none inline-block transform rounded-full',
              'bg-surface',
              sz.knob,
              enabled ? sz.translateOn : sz.translateOff
            )}
          />
        </HSwitch>

        {labelPosition === 'right' && labelEl}
      </div>

      {showDescription ? (
        <HelperText
          id={descriptionId}
          size={size}
          className={cx(controlCompGap, descIndentClass)}
        >
          {description}
        </HelperText>
      ) : null}

      {showError ? (
        <ErrorText
          id={errorId}
          size={size}
          className={cx(controlCompGap, descIndentClass)}
        >
          {error}
        </ErrorText>
      ) : null}
    </div>
  );
};

export default Switch;
