// design-system/src/components/molecules/Checkbox.tsx

'use client';

import React, { forwardRef, useEffect, useId, useRef, useState } from 'react';

import { Icon } from '../atoms/Icon';
import Label from '../atoms/Label';
import HelperText from '../atoms/HelperText';
import ErrorText from '../atoms/ErrorText';

import { type ControlSize, controlLabelToControlGapX, controlCompGap } from '../_tokens/control';

export interface CheckboxProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'size' | 'type' | 'children'
  > {
  label: React.ReactNode;
  labelHidden?: boolean;

  description?: React.ReactNode;
  error?: string;

  size?: ControlSize;
  fullWidth?: boolean;
  wrapperClassName?: string;

  indeterminate?: boolean;
}

const cx = (...v: Array<string | false | null | undefined>) =>
  v.filter(Boolean).join(' ');

const boxPx: Record<ControlSize, number> = { sm: 16, md: 20, lg: 24 };
const iconPx: Record<ControlSize, number> = { sm: 14, md: 16, lg: 18 };

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      labelHidden = false,
      description,
      error,

      size = 'md',
      fullWidth = true,
      wrapperClassName,
      className,

      disabled,
      id,
      name,

      checked,
      defaultChecked,
      onChange,

      indeterminate = false,

      ...rest
    },
    ref
  ) => {
    const reactId = useId();
    const inputId = id ?? name ?? `checkbox-${reactId}`;

    const descriptionId = `${inputId}-desc`;
    const errorId = `${inputId}-err`;

    const hasError = !!error;

    // labelHidden이면 description/error도 "시각적으로" 숨기는 정책 → aria-describedby도 걸지 않음
    const showDescription = !!description && !labelHidden && !hasError;
    const showError = !!error && !labelHidden;

    const describedBy = showError ? errorId : showDescription ? descriptionId : undefined;

    // ✅ labelHidden일 때 접근성 이름 보강 (label이 문자열/숫자일 때만 자동 주입)
    const ariaLabel =
      labelHidden && (typeof label === 'string' || typeof label === 'number')
        ? String(label).trim()
        : undefined;

    // controlled / uncontrolled
    const isControlled = checked !== undefined;
    const [uncontrolledChecked, setUncontrolledChecked] = useState<boolean>(
      !!defaultChecked
    );
    const visualChecked = isControlled ? !!checked : uncontrolledChecked;

    // indeterminate DOM property
    const innerRef = useRef<HTMLInputElement | null>(null);
    const setRefs = (node: HTMLInputElement | null) => {
      innerRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) {
        (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
      }
    };

    useEffect(() => {
      if (innerRef.current) {
        innerRef.current.indeterminate = !!indeterminate && !visualChecked;
      }
    }, [indeterminate, visualChecked]);

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
      if (!isControlled) setUncontrolledChecked(e.target.checked);
      onChange?.(e);
    };

    const px = boxPx[size];
    const iconSize = iconPx[size];

    const isIndeterminate = !!indeterminate && !visualChecked;
    const isOn = visualChecked || isIndeterminate;

    const c = {
      primary: 'rgb(var(--color-primary))',
      onPrimary: 'rgb(var(--color-onprimary))',
      surface: 'rgb(var(--color-surface))',
      outline: 'rgb(var(--color-outline))',
      error: 'rgb(var(--color-error))',
    };

    const boxStyle: React.CSSProperties = {
      backgroundColor: isOn ? c.primary : c.surface,
      borderColor: hasError ? c.error : isOn ? c.primary : c.outline,
      opacity: disabled ? 0.6 : 1,
    };

    return (
      <div
        className={cx(
          'flex flex-col',
          fullWidth && 'w-full',
          wrapperClassName
        )}
      >
        <div className={cx('flex items-start', controlLabelToControlGapX, fullWidth && 'w-full')}>
          {/* box */}
          <div className='relative shrink-0' style={{ width: px, height: px }}>
            <span
              aria-hidden
              style={boxStyle}
              className={cx(
                'absolute inset-0 rounded-md border transition-colors',
                !disabled && !isOn && 'hover:opacity-95'
              )}
            />

            <input
              id={inputId}
              ref={setRefs}
              name={name}
              type='checkbox'
              disabled={disabled}
              checked={isControlled ? checked : undefined}
              defaultChecked={!isControlled ? defaultChecked : undefined}
              onChange={handleChange}
              aria-describedby={describedBy}
              aria-invalid={hasError || undefined}
              aria-label={ariaLabel}
              className={cx(
                'absolute inset-0 h-full w-full appearance-none bg-transparent border-0 rounded-md',
                'focus:outline-none',
                'focus-visible:[outline:var(--focus-ring-w)_solid_var(--focus-ring-color)]',
                'focus-visible:[outline-offset:var(--focus-ring-offset-w)]',
                hasError ? 'ring-error' : 'ring-primary',
                disabled ? 'cursor-not-allowed' : 'cursor-pointer',
                className
              )}
              {...rest}
            />

            {isOn ? (
              <span className='absolute inset-0 grid place-items-center pointer-events-none'>
                {isIndeterminate ? (
                  <span
                    className='block'
                    style={{
                      width: Math.max(8, Math.floor(px * 0.55)),
                      height: 2,
                      borderRadius: 9999,
                      backgroundColor: c.onPrimary,
                    }}
                    aria-hidden
                  />
                ) : (
                  <Icon
                    name='CheckRounded'
                    fontSize={iconSize}
                    style={{ color: c.onPrimary }}
                    aria-hidden
                  />
                )}
              </span>
            ) : null}
          </div>

          {/* text: 라벨 ↔ 디스크립션/에러 간격은 controlCompGap (margin-top) */}
          <div
            className={cx(
              'flex min-w-0 flex-col',
              fullWidth && 'flex-1',
              disabled && 'cursor-not-allowed opacity-60'
            )}
          >
            <Label htmlFor={inputId} hidden={labelHidden} size={size} variant='control'>
              {label}
            </Label>

            {(showDescription || showError) && (
              <div className={controlCompGap}>
                {showDescription ? (
                  <HelperText id={descriptionId} size={size}>
                    {description}
                  </HelperText>
                ) : null}
                {showError ? (
                  <ErrorText id={errorId} size={size}>
                    {error}
                  </ErrorText>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
export default Checkbox;
