// design-system/src/components/molecules/Input.tsx

'use client';

import React, { forwardRef, type InputHTMLAttributes, useId } from 'react';

import Label from '../atoms/Label';
import HelperText from '../atoms/HelperText';
import ErrorText from '../atoms/ErrorText';
import SuccessText from '../atoms/SuccessText';
import { controlLabelToControlGapY, controlCompGap } from '../_tokens/control';

type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: React.ReactNode;
  labelHidden?: boolean;
  description?: React.ReactNode;
  error?: string;
  success?: string;
  size?: InputSize;
  fullWidth?: boolean;
  wrapperClassName?: string;
}

const cx = (...v: Array<string | false | null | undefined>) =>
  v.filter(Boolean).join(' ');

const sizeStyles: Record<InputSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
};

const controlSizeMap: Record<InputSize, 'sm' | 'md' | 'lg'> = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      labelHidden = false,
      description,
      error,
      success,
      id,
      size = 'md',
      fullWidth = true,
      className,
      wrapperClassName,
      disabled,
      ...rest
    },
    ref
  ) => {
    const reactId = useId();
    const inputId = id ?? rest.name ?? `input-${reactId}`;

    const descriptionId = `${inputId}-desc`;
    const errorId = `${inputId}-err`;
    const successId = `${inputId}-success`;

    const hasError = !!error;
    const hasSuccess = !!success && !hasError;

    // ✅ labelHidden일 때 접근성 이름 보강 (label이 문자열/숫자일 때만 자동 주입)
    const ariaLabel =
      labelHidden && (typeof label === 'string' || typeof label === 'number')
        ? String(label).trim()
        : undefined;

    // ✅ labelHidden이면 helper/error/success도 "시각적으로" 숨김 + aria-describedby도 제거 (Checkbox/Select와 정책 통일)
    const showDescription = !!description && !labelHidden && !hasError && !hasSuccess;
    const showError = !!error && !labelHidden;
    const showSuccess = !!success && !labelHidden && !hasError;

    const describedBy = showError
      ? errorId
      : showSuccess
        ? successId
        : showDescription
          ? descriptionId
          : undefined;

    return (
      <div
        className={cx(
          'flex flex-col',
          fullWidth && 'w-full',
          wrapperClassName
        )}
      >
        <Label htmlFor={inputId} hidden={labelHidden} size={controlSizeMap[size]} variant="field">
          {label}
        </Label>

        <div className={cx(!labelHidden && controlLabelToControlGapY)}>
          <input
          id={inputId}
          ref={ref}
          disabled={disabled}
          aria-describedby={describedBy}
          aria-invalid={hasError || undefined}
          aria-label={ariaLabel}
          className={cx(
            'block w-full rounded-md border',

            // base
            'bg-surface text-onsurface border-outline',
            'placeholder:text-muted',

            // focus
            'ds-focus-ring',

            sizeStyles[size],

            // states
            hasError && 'border-error ring-error',
            hasSuccess && 'border-success ring-success',
            disabled && 'cursor-not-allowed opacity-60',

            className
          )}
          {...rest}
        />
        </div>

        {/* 컴포넌트 ↔ 디스크립션 간격: controlCompGap (margin-top) */}
        {(showDescription || showSuccess || showError) && (
          <div className={controlCompGap}>
            {showDescription ? (
              <HelperText id={descriptionId} size={controlSizeMap[size]}>
                {description}
              </HelperText>
            ) : null}
            {showSuccess ? (
              <SuccessText id={successId} size={controlSizeMap[size]}>
                {success}
              </SuccessText>
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

Input.displayName = 'Input';
export default Input;
