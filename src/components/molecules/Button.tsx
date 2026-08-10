// design-system/src/components/molecules/Button.tsx

'use client';

import React, { ElementType, forwardRef } from 'react';

import { Icon } from '../atoms/Icon';
import type { IconName } from '../atoms/Icon';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  as?: ElementType;

  variant?: ButtonVariant;
  size?: ButtonSize;

  fullWidth?: boolean;

  leftIconName?: IconName;
  rightIconName?: IconName;

  iconOnlyDefaultIconName?: IconName;
  iconSize?: number;
}

const cx = (...v: Array<string | false | null | undefined>) =>
  v.filter(Boolean).join(' ');

export const Button = forwardRef<HTMLElement, ButtonProps>(
  (
    {
      as,
      variant = 'secondary',
      size = 'md',
      fullWidth = false,

      leftIconName,
      rightIconName,
      iconOnlyDefaultIconName = 'SmartToy',
      iconSize = 16,

      className,
      disabled,
      children,
      type,
      ...rest
    },
    ref
  ) => {
    const Component = (as || 'button') as ElementType;

    const hasText = React.Children.toArray(children).some((c) => {
      if (typeof c === 'string') return c.trim().length > 0;
      if (typeof c === 'number') return true;
      return false;
    });

    const isIconOnly = !hasText;

    const hasAnyIcon =
      !!leftIconName ||
      !!rightIconName ||
      (isIconOnly && !!iconOnlyDefaultIconName);

    const base = cx(
      'inline-flex items-center justify-center',
      'rounded-md font-medium',
      'transition-colors',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      disabled && Component !== 'button' && 'pointer-events-none opacity-50',

      // ✅ 클릭 포커스는 제거
      'focus:outline-none',

      // ✅ 키보드(Tab) 포커스에서만 표시 (:focus-visible)
      'focus-visible:[outline:var(--focus-ring-w)_solid_var(--focus-ring-color)]',
      'focus-visible:[outline-offset:var(--focus-ring-offset-w)]'
    );

    const variantClass: Record<ButtonVariant, string> = {
      primary: cx('bg-primary text-onprimary', 'hover:opacity-90'),
      secondary: cx(
        'bg-surface text-onsurface border border-outline',
        'hover:opacity-90'
      ),
      ghost: cx(
        'bg-transparent text-onsurface border border-transparent',
        'hover:bg-surface-alt'
      ),
      destructive: cx('bg-error text-onprimary', 'hover:opacity-90'),
    };

    const sizeBaseClass: Record<ButtonSize, string> = {
      sm: 'h-8 text-xs',
      md: 'h-10 text-sm',
      lg: 'h-12 text-base',
    };

    const sizePaddingClass: Record<ButtonSize, string> = {
      sm: 'px-3',
      md: 'px-4',
      lg: 'px-5',
    };

    const iconOnlySquareClass: Record<ButtonSize, string> = {
      sm: 'w-8',
      md: 'w-10',
      lg: 'w-12',
    };

    const widthClass = fullWidth && !isIconOnly ? 'w-full' : '';
    const gapClass = hasText && hasAnyIcon ? 'gap-2' : 'gap-0';

    const classes = cx(
      base,
      variantClass[variant],
      sizeBaseClass[size],
      isIconOnly ? iconOnlySquareClass[size] : sizePaddingClass[size],
      widthClass,
      gapClass,
      className
    );

    const resolvedLeftIconName: IconName | undefined = isIconOnly
      ? leftIconName ?? iconOnlyDefaultIconName
      : leftIconName;

    const LeftIconEl = resolvedLeftIconName ? (
      <Icon name={resolvedLeftIconName} fontSize={iconSize} className='shrink-0' />
    ) : null;

    const RightIconEl = rightIconName ? (
      <Icon name={rightIconName} fontSize={iconSize} className='shrink-0' />
    ) : null;

    const ariaDisabled =
      disabled && Component !== 'button' ? { 'aria-disabled': true } : {};

    return (
      <Component
        ref={ref as any}
        className={classes}
        disabled={Component === 'button' ? disabled : undefined}
        type={Component === 'button' ? (type ?? 'button') : undefined}
        {...ariaDisabled}
        {...rest}
      >
        {LeftIconEl ? <span className='inline-flex shrink-0'>{LeftIconEl}</span> : null}
        {hasText ? <span className='min-w-0'>{children}</span> : null}
        {!isIconOnly && RightIconEl ? (
          <span className='inline-flex shrink-0'>{RightIconEl}</span>
        ) : null}
      </Component>
    );
  }
);

Button.displayName = 'Button';
export default Button;
