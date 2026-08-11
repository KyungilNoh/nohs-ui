// nohs-ui/src/demo/blocks/DemoPageHeader.tsx

'use client';

import React from 'react';
import { Title, Paragraph, Icon } from '@ds';

interface DemoPageHeaderProps {
  title: string;
  description?: string;
  /**
   * 이 페이지가 속한 상위 경로. 주어지면 제목 앞에 뒤로 가기가 붙는다.
   * LNB 는 부모가 선택된 채로 남지만, 목록으로 돌아갈 «길» 은 따로 있어야 한다.
   */
  backHref?: string;
  backLabel?: string;
}

export function DemoPageHeader({
  title,
  description,
  backHref,
  backLabel,
}: DemoPageHeaderProps) {
  return (
    <header className='mb-20 flex flex-col gap-1'>
      <div className='flex items-center gap-2'>
        {backHref ? (
          <a
            href={backHref}
            aria-label={backLabel ? `Back to ${backLabel}` : 'Back'}
            title={backLabel ? `Back to ${backLabel}` : 'Back'}
            className='ds-focus-visible-ring -ml-1 flex shrink-0 items-center rounded text-subtle no-underline transition-opacity hover:opacity-60'
          >
            <Icon name='ArrowBack' fontSize='large' />
          </a>
        ) : null}

        <Title className='font-extrabold text-onsurface'>{title}</Title>
      </div>

      {description && (
        <Paragraph size='lg' weight='light' className='max-w-2xl text-onsurface'>
          {description}
        </Paragraph>
      )}
    </header>
  );
}

export default DemoPageHeader;
