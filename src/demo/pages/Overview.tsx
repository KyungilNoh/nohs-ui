// nohs-ui/src/demo/pages/Overview.tsx

'use client';

import React from 'react';
import LiveDemoTemplate from '../LiveDemoTemplate';
import { OverviewCard } from '@dds';
import { Button, Eyebrow, Icon, Input, Label, Paragraph, Subtitle, Title } from '@ds';
import { ATOMS, LETTERING, MOLECULES } from '../catalog';

/**
 * 이 시스템이 어떤 층으로 서 있는지 설명하는 자리.
 *
 * 컴포넌트 목록은 각 층 페이지가 갖는다 — 여기서 19종을 다시 늘어놓으면
 * «무엇이 있는가» 만 남고 «왜 그렇게 나눴는가» 가 사라진다.
 */

interface Layer {
  eyebrow: string;
  title: string;
  count: string;
  body: string;
  href: string;
  demo: React.ReactNode;
}

const LAYERS: Layer[] = [
  {
    eyebrow: 'LAYER 1',
    title: 'Tokens',
    count: 'Colour · type · focus',
    body:
      'Names for values. A component never calls #005152 — it calls --color-primary. ' +
      'This layer is why swapping themes never means editing components.',
    href: '/tokens',
    demo: (
      <div className='flex items-center gap-2'>
        {['--color-primary', '--color-surface-strong', '--color-error'].map((t) => (
          <span
            key={t}
            className='h-9 w-9 rounded border border-outline/30'
            style={{ background: `rgb(var(${t}))` }}
          />
        ))}
      </div>
    ),
  },
  {
    eyebrow: 'LAYER 2',
    title: 'Atoms',
    count: `${ATOMS.length} components`,
    body:
      'The smallest units. Mostly presentational, holding no state of their own. ' +
      'Type like Title and Paragraph lives here, as do form parts like Label and ErrorText.',
    href: '/atoms',
    demo: (
      <div className='flex flex-col items-start gap-0.5'>
        <Eyebrow tone='primary'>EYEBROW</Eyebrow>
        <Title level={4}>Title</Title>
        <Label htmlFor='ov-atoms'>Label</Label>
      </div>
    ),
  },
  {
    eyebrow: 'LAYER 3',
    title: 'Molecules',
    count: `${MOLECULES.length} components`,
    body:
      'Built from Atoms to finish one job. They carry interaction and state. ' +
      'A single Input binds Label, HelperText and ErrorText inside, accessibility included.',
    href: '/molecules',
    demo: (
      <div className='flex w-full max-w-[220px] flex-col gap-2'>
        <Input label='Email' placeholder='name@example.com' size='sm' fullWidth />
        <Button variant='primary' size='sm'>Send</Button>
      </div>
    ),
  },
];

export default function OverviewPage() {
  return (
    <LiveDemoTemplate
      pageOnly
      title='nohs-ui'
      description='The design system shared by app-shell, folio and prop. It stands in three layers.'
      usageCode=''
      properties={[]}
      controls={null}
    >
      {/* 층 설명 — 아래에서 위로 쌓인다 */}
      <div className='flex flex-col gap-3'>
        {LAYERS.map((layer) => (
          <a
            key={layer.title}
            href={layer.href}
            className='group flex flex-col gap-4 rounded-xl bg-surface-alt p-5 no-underline text-inherit transition-transform duration-200 ease-out hover:-translate-y-0.5 sm:flex-row sm:items-center sm:gap-8'
          >
            <div className='pointer-events-none flex min-h-[88px] w-full shrink-0 items-center justify-center rounded-lg bg-surface/60 px-4 py-3 sm:w-[260px]'>
              {layer.demo}
            </div>

            <div className='min-w-0'>
              <div className='flex items-baseline gap-2'>
                <Eyebrow tone='muted'>{layer.eyebrow}</Eyebrow>
                <span className='text-xs text-subtle'>{layer.count}</span>
              </div>
              <Subtitle as='p' className='mt-1'>
                {layer.title}
              </Subtitle>
              <Paragraph size='sm' tone='muted' className='mt-1'>
                {layer.body}
              </Paragraph>
              <span className='mt-2 inline-flex items-center gap-1 text-sm text-onsurface'>
                Explore
                <Icon name='ArrowForward' fontSize='small' />
              </span>
            </div>
          </a>
        ))}
      </div>

      <div className='mb-3 mt-12'>
        <Eyebrow tone='muted'>PRINCIPLES</Eyebrow>
      </div>
      <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3'>
        {LETTERING.map((c) => (
          <OverviewCard
            key={c.title}
            title={c.title}
            description={c.description}
            href=''
            thumbnailSrc={c.thumbnailSrc}
            thumbnailAlt={`${c.title} lettering`}
          />
        ))}
      </div>
    </LiveDemoTemplate>
  );
}
