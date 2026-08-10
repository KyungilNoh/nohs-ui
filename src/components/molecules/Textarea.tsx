import React, {
  forwardRef,
  type TextareaHTMLAttributes,
} from 'react';

import Label from '../atoms/Label';
import { controlLabelToControlGapY, controlCompGap, type ControlSize } from '../_tokens/control';

type TextareaSize = 'sm' | 'md';

const textareaToControlSize: Record<TextareaSize, ControlSize> = {
  sm: 'sm',
  md: 'md',
};

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: string;
  size?: TextareaSize;
  fullWidth?: boolean;
  wrapperClassName?: string;
}

const cx = (...v: Array<string | false | null | undefined>) =>
  v.filter(Boolean).join(' ');

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      description,
      error,
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
    const textareaId = id ?? rest.name ?? undefined;

    const sizeClass: Record<TextareaSize, string> = {
      sm: 'min-h-[80px] p-2 text-xs',
      md: 'min-h-[120px] px-4 py-2.5 text-sm',
    };

    return (
      <div
        className={cx(
          'flex flex-col',
          fullWidth && 'w-full',
          wrapperClassName
        )}
      >
        {label && (
          <Label
            htmlFor={textareaId}
            size={textareaToControlSize[size]}
            variant="field"
          >
            {label}
          </Label>
        )}

        <div className={cx(label ? controlLabelToControlGapY : undefined)}>
          <textarea
          id={textareaId}
          ref={ref}
          disabled={disabled}
          className={cx(
            'block rounded-md border',
            'bg-surface text-onsurface border-outline',
            'placeholder:text-muted',
            'ds-focus-ring',
            error && 'border-error ring-error',
            disabled && 'cursor-not-allowed opacity-60',
            sizeClass[size],
            fullWidth && 'w-full',
            className
          )}
          {...rest}
        />
        </div>

        {/* 컴포넌트 ↔ 디스크립션 간격: controlCompGap (margin-top) */}
        {(description || error) && (
          <div className={controlCompGap}>
            {description && !error && (
              <p className='text-xs text-gray-500'>{description}</p>
            )}
            {error && (
              <p className='text-xs text-red-500'>{error}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
