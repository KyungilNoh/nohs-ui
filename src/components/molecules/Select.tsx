// design-system/src/components/molecules/Select.tsx

'use client';

import React, { forwardRef, useId } from 'react';

import { Icon } from '../atoms/Icon';
import type { IconName } from '../atoms/Icon';

import Label from '../atoms/Label';
import HelperText from '../atoms/HelperText';
import ErrorText from '../atoms/ErrorText';
import { controlLabelToControlGapY, controlCompGap } from '../_tokens/control';

type SelectSize = 'sm' | 'md' | 'lg';

interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label: React.ReactNode;
  labelHidden?: boolean;

  options: SelectOption[];
  error?: string;
  description?: React.ReactNode;

  size?: SelectSize;

  fullWidth?: boolean;
  wrapperClassName?: string;

  /** (옵션) 오른쪽 아이콘 커스텀 허용 */
  rightIconName?: IconName;
}

const cx = (...v: Array<string | false | null | undefined>) =>
  v.filter(Boolean).join(' ');

const sizeStyles: Record<SelectSize, string> = {
  sm: 'h-8 px-3 text-xs pr-8',
  md: 'h-10 px-4 text-sm pr-10',
  lg: 'h-12 px-5 text-base pr-12',
};

const iconSizeMap: Record<SelectSize, number> = {
  sm: 16,
  md: 20,
  lg: 20,
};

// Label/Helper/Error는 ControlSize(sm/md/lg) 체계라 그대로 매핑
const controlSizeMap: Record<SelectSize, 'sm' | 'md' | 'lg'> = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      labelHidden = false,
      options,
      error,
      description,
      id,
      size = 'md',
      fullWidth = true,
      className,
      wrapperClassName,
      disabled,
      name,
      rightIconName = 'ExpandMore',
      ...rest
    },
    ref
  ) => {
    const reactId = useId();
    const selectId = id ?? name ?? `select-${reactId}`;

    const descriptionId = `${selectId}-desc`;
    const errorId = `${selectId}-err`;

    const hasError = !!error;

    // ✅ labelHidden이면 helper/error도 시각적으로 숨김 + aria-describedby도 제거(정책 통일)
    const showDescription = !!description && !labelHidden && !hasError;
    const showError = !!error && !labelHidden;

    const describedBy = showError ? errorId : showDescription ? descriptionId : undefined;

    // ✅ labelHidden일 때 접근성 이름 보강 (label이 문자열/숫자일 때만 자동 주입)
    const ariaLabel =
      labelHidden && (typeof label === 'string' || typeof label === 'number')
        ? String(label).trim()
        : undefined;

    return (
      <div className={cx('flex flex-col', fullWidth && 'w-full', wrapperClassName)}>
        <Label htmlFor={selectId} hidden={labelHidden} size={controlSizeMap[size]} variant="field">
          {label}
        </Label>

        <div className={cx(!labelHidden && controlLabelToControlGapY, 'relative')}>
          <select
            id={selectId}
            name={name}
            ref={ref}
            disabled={disabled}
            aria-describedby={describedBy}
            aria-invalid={hasError || undefined}
            aria-label={ariaLabel}
            className={cx(
              'block w-full rounded-md border bg-surface text-onsurface',
              'appearance-none',
              'ds-focus-ring',
              'border-outline',
              sizeStyles[size],
              hasError && 'border-error ring-error',
              disabled && 'opacity-60 cursor-not-allowed bg-surface/60',
              className
            )}
            {...rest}
          >
            {options.map((option) => (
              <option key={`${option.value}`} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <Icon
            name={rightIconName}
            fontSize={iconSizeMap[size]}
            className={cx(
              'pointer-events-none absolute right-3 top-1/2 -translate-y-1/2',
              disabled ? 'text-onsurface/30' : 'text-onsurface/50'
            )}
            aria-hidden
          />
        </div>

        {/* 컴포넌트 ↔ 디스크립션 간격: controlCompGap (margin-top) */}
        {(showDescription || showError) && (
          <div className={controlCompGap}>
            {showDescription ? (
              <HelperText id={descriptionId} size={controlSizeMap[size]}>
                {description}
              </HelperText>
            ) : null}
            {showError ? (
              <ErrorText id={errorId} size={controlSizeMap[size]}>
                {error}
              </ErrorText>
            ) : null}
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
