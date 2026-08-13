// design-system/src/demo/LiveDemoTemplate.tsx

'use client';

import React, { useMemo, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { backSectionFor, type NavSection } from './navMap';

import {
  DemoPageHeader,
  PropertyTable,
  DemoPreviewBlock,
  DemoImplementationBlock,
  DemoConfigurationBlock,
} from '@dds';

type Property = React.ComponentProps<typeof PropertyTable>['data'][number];

interface ComponentDemoProps {
  /** ✅ Overview 같은 “페이지”는 true */
  pageOnly?: boolean;

  title?: string;
  description?: string;

  /** demo 전용 */
  usageCode?: string;
  properties?: Property[];
  controls?: ReactNode;

  /** demo일 땐 Preview content, pageOnly일 땐 본문 content */
  children: ReactNode;

  propertyTableProps?: Omit<
    React.ComponentProps<typeof PropertyTable>,
    'data'
  >;
}

type TabKey = 'demo' | 'guidelines';

export default function LiveDemoTemplate({
  pageOnly = false,
  title = '컴포넌트 이름',
  description = '컴포넌트에 대한 설명을 여기에 입력하세요.',
  usageCode = '<Component />',
  properties = [],
  controls,
  children,
  propertyTableProps,
}: ComponentDemoProps) {
  /*
    돌아갈 길을 헤더에 붙인다. 페이지마다 손으로 넘기게 두면 언젠가 빠뜨리므로
    경로에서 도출한다.

    다만 Tokens 처럼 «최상위» 인 화면은 속한 목록이 없어 경로만으로는 길이 안
    나온다. 그런 화면도 관계도(Overview)에서 점을 눌러 들어올 수 있으므로, 그때는
    이동하면서 실어 보낸 출발지를 쓴다. LNB 로 직접 들어왔으면 아무것도 안 실려
    오니 화살표도 안 뜬다 — 원래 없던 뎁스를 만들지 않는다.
  */
  const { pathname, state } = useLocation();
  const from = (state as { from?: NavSection } | null)?.from;
  const back = backSectionFor(pathname) ?? from ?? null;
  // ✅ pageOnly면 탭/상태 자체가 필요 없음
  if (pageOnly) {
    return (
      <div className='min-h-screen bg-surface text-onsurface'>
        <div className='mx-auto max-w-6xl px-6 pt-20 py-10'>
          <DemoPageHeader title={title} description={description} backHref={back?.path} backLabel={back?.label} />
          <div className='mt-6'>{children}</div>
        </div>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<TabKey>('demo');

  const tabs = useMemo(
    () => [
      { key: 'demo' as const, label: 'Demo' },
      { key: 'guidelines' as const, label: 'Guidelines' },
    ],
    []
  );

  return (
    <div className='min-h-screen bg-surface text-onsurface'>
      <div className='mx-auto max-w-6xl px-6 pt-20 py-10'>
        <DemoPageHeader title={title} description={description} backHref={back?.path} backLabel={back?.label} />

        {/* Tabs */}
        <div className='border-b border-outline'>
          <div className='flex items-center gap-6'>
            {tabs.map((t) => {
              const isActive = activeTab === t.key;

              return (
                <button
                  key={t.key}
                  type='button'
                  onClick={() => setActiveTab(t.key)}
                  className={[
                    'relative py-3 text-sm transition-colors',
                    'rounded-sm', /*포커스링의 라운드*/
                    'ds-focus-visible-ring',
                    isActive
                      ? 'text-onsurface font-semibold'
                      : 'text-subtle hover:text-onsurface',
                  ].join(' ')}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {t.label}

                  {/* underline */}
                  <span
                    className={[
                      'absolute left-0 right-0 bottom-0 h-0.5 transition-colors',
                      isActive
                        ? 'bg-onsurface'
                        : 'bg-transparent',
                    ].join(' ')}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className='mt-6'>
          {activeTab === 'demo' ? (
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
              {/* Left */}
              <section className='lg:col-span-8 flex flex-col gap-6'>
                <DemoPreviewBlock>{children}</DemoPreviewBlock>
                <DemoImplementationBlock code={usageCode} />
              </section>

              {/* Right */}
              <aside className='lg:col-span-4'>
                <DemoConfigurationBlock>
                  {controls}
                </DemoConfigurationBlock>
              </aside>
            </div>
          ) : (
            <div className='animate-in fade-in slide-in-from-bottom-2 duration-300'>
              <PropertyTable
                data={properties}
                {...(propertyTableProps ?? {})}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
