// nohs-ui/src/demo/blocks/DemoPageHeader.tsx

'use client';

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Title, Paragraph, Icon } from '@ds';

interface DemoPageHeaderProps {
  title: string;
  description?: string;
  /**
   * 이 페이지가 속한 상위 경로.
   *
   * 실제로 «돌아갈» 곳은 아니다 — 온 길이 있으면 그리로 가고, 이것은 온 길이
   * 없을 때(주소를 직접 치고 들어왔을 때) 쓰는 자리다.
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
  const navigate = useNavigate();

  /*
    온 길이 있으면 그리로 되돌린다.

    예전엔 «이 컴포넌트가 속한 목록» 으로 고정돼 있었다. Overview 의 관계도에서
    점을 눌러 들어와도 Molecules 목록으로 뱉어 내니, 보던 자리를 잃는다.
    react-router 는 자기가 만든 방문에 history.state.idx 를 매긴다 — 그 값이
    0 보다 크면 앱 안에서 온 것이므로 한 칸 되돌리면 된다.

    그리고 <a href> 로 두면 SPA 인데도 페이지가 통째로 다시 뜬다. 링크는 남기되
    (가운데 클릭·새 탭을 위해) 실제 이동은 라우터가 한다.
  */
  const step = (window.history.state?.idx ?? 0) as number;
  const canGoBack = step > 0;
  const hint = canGoBack ? 'Back' : backLabel ? `Back to ${backLabel}` : 'Back';

  return (
    <header className='mb-20 flex flex-col gap-1'>
      <div className='flex items-center gap-2'>
        {backHref ? (
          <a
            href={backHref}
            aria-label={hint}
            title={hint}
            onClick={(e) => {
              /* 새 탭·새 창으로 열려는 것은 그대로 둔다 */
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
              e.preventDefault();
              if (canGoBack) navigate(-1);
              else navigate(backHref);
            }}
            className='ds-focus-visible-ring -ml-1 flex shrink-0 items-center rounded text-subtle no-underline transition-opacity hover:opacity-60'
          >
            <Icon name='ArrowBack' fontSize='large' />
          </a>
        ) : null}

        <Title className='font-extrabold text-onsurface'>{title}</Title>
      </div>

      {/*
        읽기 폭은 «글자 수» 로 잰다. max-w-2xl 은 672px 고정이라 글자 크기와
        무관하게 잘렸다 — 한 줄이면 될 문장이 121px 모자라 두 줄로 접혔다.
        78ch 는 읽기 좋은 범위(60~75자)의 위쪽이라 잃는 것 없이 한 줄에 든다.
      */}
      {description && (
        <Paragraph size='lg' weight='light' className='max-w-[78ch] text-onsurface'>
          {description}
        </Paragraph>
      )}
    </header>
  );
}

export default DemoPageHeader;
