// design-system/src/demo/blocks/OverviewCard.tsx

'use client';

import React from 'react';

export interface OverviewCardProps {
  title: string;
  description?: string;
  href: string;

  /** 썸네일 */
  thumbnailSrc?: string;
  thumbnailAlt?: string;

  rightMeta?: React.ReactNode;
}

export function OverviewCard({
  title,
  description,
  href,
  thumbnailSrc,
  thumbnailAlt,
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
      <div className='aspect-[16/9] w-full bg-surface/60 overflow-hidden'>
        {thumbnailSrc ? (
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