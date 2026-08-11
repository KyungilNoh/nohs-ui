// design-system/src/demo/blocks/OverviewCard.tsx

'use client';

import React from 'react';
import { PREVIEW_SURFACE } from './previewSurface';

export interface OverviewCardProps {
  title: string;
  description?: string;
  href: string;

  /** 썸네일 */
  thumbnailSrc?: string;
  thumbnailAlt?: string;

  /**
   * 썸네일 자리에 «실물 컴포넌트» 를 그린다. thumbnailSrc 보다 우선한다.
   * 캡처 이미지는 실제와 어긋나기 시작하는 순간부터 거짓말이 된다 —
   * 컴포넌트를 직접 그리면 어긋날 수가 없다.
   */
  preview?: React.ReactNode;

  rightMeta?: React.ReactNode;
}

export function OverviewCard({
  title,
  description,
  href,
  thumbnailSrc,
  thumbnailAlt,
  preview,
  rightMeta,
}: OverviewCardProps) {
  return (
    <a
      href={href}
      className={[
        'group block overflow-hidden rounded-xl',
        'bg-surface-alt',
        'transition-transform duration-200 ease-out',
        'hover:-translate-y-0.5',
        'ds-focus-visible-ring',
      ].join(' ')}
    >
      {/* Thumbnail (항상 꽉 채우기) */}
      <div
        className='aspect-[16/9] w-full overflow-hidden'
        style={preview ? PREVIEW_SURFACE : undefined}
      >
        {preview ? (
          // 상세의 Preview 와 같은 바닥·같은 정렬 — 카드에서 본 그대로가 상세에 있다.
          // pointer-events-none: 카드 전체가 링크다. 안의 컨트롤이 클릭을 가로채면 안 된다
          <div className='pointer-events-none flex h-full w-full items-center justify-center px-6 py-6'>
            {preview}
          </div>
        ) : thumbnailSrc ? (
          <img
            src={thumbnailSrc}
            alt={thumbnailAlt ?? `${title} thumbnail`}
            className={[
              'h-full w-full object-cover',
              'transition-transform duration-200 ease-out',
              'group-hover:scale-[1.02]',
            ].join(' ')}
            loading='lazy'
          />
        ) : (
          <div className='h-full w-full bg-gradient-to-br from-slate-50 to-slate-100' />
        )}
      </div>

      {/* Content */}
      <div className='p-4'>
        <div className='flex items-start justify-between gap-3'>
          <div className='min-w-0'>
            <h3 className='text-xl font-semibold text-onsurface truncate'>
              {title}
            </h3>

            {description ? (
              <p className='mt-0 text-r text-gray-500 leading-relaxed line-clamp-2'>
                {description}
              </p>
            ) : null}
          </div>

          {rightMeta ? <div className='shrink-0'>{rightMeta}</div> : null}
        </div>
      </div>
    </a>
  );
}

export default OverviewCard;