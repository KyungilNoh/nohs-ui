'use client';

import React from 'react';
import clsx from 'clsx';

export type TagVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger';
export type TagSize = 'sm' | 'md';

interface TagProps {
  children: React.ReactNode;

  /** 색상 스타일 */
  variant?: TagVariant;

  /** 사이즈 */
  size?: TagSize;

  /** 아이콘 (선택) - MUI 아이콘 ReactNode 그대로 넣으면 됨 */
  icon?: React.ReactNode;

  /** 삭제 버튼 표시 */
  removable?: boolean;

  /** 삭제 이벤트 */
  onRemove?: () => void;

  /** 비활성화 */
  disabled?: boolean;

  /** 추가 클래스 */
  className?: string;
}

export const Tag = ({
  children,
  variant = 'default',
  size = 'md',
  icon,
  removable = false,
  onRemove,
  disabled = false,
  className,
}: TagProps) => {
  return (
    <span
      className={clsx(
        // ✅ hugging 강제(부모 레이아웃 영향 최소화)
        'inline-flex w-fit max-w-fit shrink-0',
        'items-center gap-1 rounded-full font-medium select-none align-middle',
        'transition-colors',
        sizeStyles[size],
        variantStyles[variant],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {icon && (
        <span
          className={clsx(
            'flex items-center',
            // ✅ MUI 아이콘 기본 24px이 너무 커 보일 수 있어서 살짝 normalize
            size === 'sm' ? 'text-[12px]' : 'text-[14px]'
          )}
        >
          {icon}
        </span>
      )}

      <span className='leading-none'>{children}</span>

      {removable && !disabled && (
        <button
          type='button'
          onClick={onRemove}
          className={clsx(
            'ml-1 flex items-center justify-center rounded-full',
            'hover:bg-black/10 focus:outline-none'
          )}
          aria-label='Remove tag'
        >
          {/* ✅ X 아이콘도 MUI 쓰고 싶으면 여기 교체 가능 */}
          <svg
            width='12'
            height='12'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
          >
            <path d='M18 6L6 18M6 6l12 12' />
          </svg>
        </button>
      )}
    </span>
  );
};

/* ---------------- styles ---------------- */

const sizeStyles: Record<TagSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

const variantStyles: Record<TagVariant, string> = {
  default: 'bg-slate-100 text-slate-700',
  primary: 'bg-blue-100 text-blue-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
};

export default Tag;
