// design-system/src/demo/LiveDemoTemplate.tsx

'use client';

import React, { useMemo, useState, type ReactNode } from 'react';

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
  // ✅ pageOnly면 탭/상태 자체가 필요 없음
  if (pageOnly) {
    return (
      <div className='min-h-screen bg-surface text-onsurface'>
        <div className='mx-auto max-w-6xl px-6 pt-20 py-10'>
          <DemoPageHeader title={title} description={description} />
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
        <DemoPageHeader title={title} description={description} />

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
