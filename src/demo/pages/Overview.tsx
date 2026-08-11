// nohs-ui/src/demo/pages/Overview.tsx

'use client';

import React from 'react';
import LiveDemoTemplate from '../LiveDemoTemplate';
import {
  Button,
  Card,
  Checkbox,
  Eyebrow,
  HelperText,
  Icon,
  Input,
  Paragraph,
  SectionHeader,
  Select,
  Subtitle,
  Switch,
  Tag,
  Textarea,
  Title,
} from '@ds';
import { ATOMS, MOLECULES } from '../catalog';

/**
 * 이 시스템이 무엇으로 서 있는지 보여주는 자리.
 *
 * 화면을 채우는 것은 전부 «이 시스템이 실제로 내는 것» 이다 — 계조는 tokens.css 의
 * 값이고, 컴포넌트는 진짜 컴포넌트다. 캡처 이미지도, 남의 그림도 쓰지 않는다.
 * 디자인 시스템 소개 화면이 남의 자산으로 채워져 있으면 그 자체로 앞뒤가 안 맞는다.
 */

const BRAND_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
/** neutral 은 2씩 51단이다 — 전부 늘어놓으면 읽히지 않아 10단씩 건너뛴다 */
const NEUTRAL_STEPS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

const SEMANTIC = [
  '--color-primary',
  '--color-surface',
  '--color-surface-alt',
  '--color-surface-strong',
  '--color-onsurface',
  '--color-outline',
  '--color-subtle',
  '--color-success',
  '--color-error',
  '--color-disabled',
];

const STATS = [
  { value: `${MOLECULES.length + ATOMS.length + 1}`, label: 'components' },
  { value: '95', label: 'tokens' },
  { value: '3', label: 'products using it' },
];

/** 색 계조 한 줄 */
function Ramp({ label, vars }: { label: string; vars: string[] }) {
  return (
    <div>
      <div className='mb-2 flex items-baseline justify-between'>
        <Eyebrow tone='muted'>{label}</Eyebrow>
        <span className='text-[11px] text-subtle'>{vars.length} steps</span>
      </div>
      <div className='flex h-14 overflow-hidden rounded-lg border border-outline/30'>
        {vars.map((v) => (
          <span key={v} className='flex-1' style={{ background: `rgb(var(${v}))` }} title={v} />
        ))}
      </div>
    </div>
  );
}

interface Layer {
  n: string;
  title: string;
  count: string;
  body: string;
  href: string;
  demo: React.ReactNode;
}

const LAYERS: Layer[] = [
  {
    n: '01',
    title: 'Tokens',
    count: '95 values',
    body:
      'Names for values. A component never calls #005152 — it calls --color-primary. ' +
      'This layer is why swapping themes never means editing components.',
    href: '/tokens',
    demo: (
      <div className='grid w-full grid-cols-5 gap-1.5'>
        {SEMANTIC.map((v) => (
          <span
            key={v}
            className='aspect-square rounded-md border border-outline/25'
            style={{ background: `rgb(var(${v}))` }}
            title={v}
          />
        ))}
      </div>
    ),
  },
  {
    n: '02',
    title: 'Atoms',
    count: `${ATOMS.length} components`,
    body:
      'The smallest units. Mostly presentational, holding no state of their own. ' +
      'Type like Title and Paragraph lives here, as do form parts like Label and ErrorText.',
    href: '/atoms',
    demo: (
      <div className='flex w-full flex-col items-start gap-2'>
        <Eyebrow tone='primary'>EYEBROW</Eyebrow>
        <Title level={4}>Title</Title>
        <Paragraph size='sm' tone='muted'>
          Paragraph carries the body.
        </Paragraph>
        <div className='flex flex-wrap items-center gap-1.5'>
          <Tag variant='primary' size='sm'>primary</Tag>
          <Tag variant='success' size='sm'>success</Tag>
          <Tag variant='warning' size='sm'>warning</Tag>
          <Tag variant='danger' size='sm'>danger</Tag>
        </div>
      </div>
    ),
  },
  {
    n: '03',
    title: 'Molecules',
    count: `${MOLECULES.length} components`,
    body:
      'Built from Atoms to finish one job. They carry interaction and state. ' +
      'A single Input binds Label, HelperText and ErrorText inside, accessibility included.',
    href: '/molecules',
    demo: (
      <div className='flex w-full flex-col gap-2'>
        <Input label='Email' placeholder='name@example.com' size='sm' fullWidth />
        <div className='flex items-center gap-2'>
          <Button variant='primary' size='sm'>Send</Button>
          <Button variant='ghost' size='sm'>Cancel</Button>
        </div>
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
      {/* ── 숫자 ─────────────────────────────────────────────── */}
      <div className='mb-14 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-outline/25 bg-outline/25'>
        {STATS.map((s) => (
          <div key={s.label} className='bg-surface px-5 py-6'>
            <div className='text-3xl font-extrabold tracking-tight text-onsurface'>{s.value}</div>
            <div className='mt-1 text-xs text-subtle'>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── 계조 ─────────────────────────────────────────────── */}
      <div className='mb-14 flex flex-col gap-6'>
        <Ramp label='BRAND' vars={BRAND_STEPS.map((n) => `--brand-${n}`)} />
        <Ramp label='NEUTRAL' vars={NEUTRAL_STEPS.map((n) => `--neutral-${n}`)} />
      </div>

      {/* ── 층 ───────────────────────────────────────────────── */}
      <div className='mb-14 flex flex-col gap-3'>
        {LAYERS.map((layer) => (
          <a
            key={layer.title}
            href={layer.href}
            className='group flex flex-col gap-5 rounded-xl bg-surface-alt p-6 no-underline text-inherit transition-transform duration-200 ease-out hover:-translate-y-0.5 sm:flex-row sm:items-center sm:gap-8'
          >
            <div className='pointer-events-none flex min-h-[132px] w-full shrink-0 items-center justify-center rounded-lg bg-surface/70 p-5 sm:w-[280px]'>
              {layer.demo}
            </div>

            <div className='min-w-0'>
              <div className='flex items-baseline gap-2'>
                <span className='font-mono text-xs text-subtle'>{layer.n}</span>
                <Eyebrow tone='muted'>{layer.count}</Eyebrow>
              </div>
              <Title level={3} className='mt-1'>
                {layer.title}
              </Title>
              <Paragraph size='sm' tone='muted' className='mt-2'>
                {layer.body}
              </Paragraph>
              <span className='mt-3 inline-flex items-center gap-1 text-sm text-onsurface'>
                Explore
                <Icon name='ArrowForward' fontSize='small' />
              </span>
            </div>
          </a>
        ))}
      </div>

      {/* ── 타이포 견본 ──────────────────────────────────────── */}
      <div className='mb-14'>
        <Eyebrow tone='muted'>TYPE</Eyebrow>
        <div className='mt-3 rounded-xl border border-outline/25 p-6'>
          <Title level={1}>Title level 1</Title>
          <Title level={3} className='mt-3'>Title level 3</Title>
          <Subtitle as='p' className='mt-3'>Subtitle carries the second voice</Subtitle>
          <Paragraph size='lg' className='mt-3'>Paragraph lg — the size you read at length.</Paragraph>
          <Paragraph size='md' className='mt-1'>Paragraph md — the default body size.</Paragraph>
          <Paragraph size='sm' tone='muted' className='mt-1'>Paragraph sm muted — for secondary lines.</Paragraph>
          <HelperText>HelperText sits under a control.</HelperText>
        </div>
      </div>

      {/* ── 한자리에 모아 놓기 ───────────────────────────────── */}
      <div>
        <Eyebrow tone='muted'>IN COMPOSITION</Eyebrow>
        <Paragraph size='sm' tone='muted' className='mb-3 mt-1'>
          Nineteen parts, one form. Everything below is the real thing — nothing is a screenshot.
        </Paragraph>

        <Card elevation='md'>
          <SectionHeader
            eyebrow='ACCOUNT'
            title='Profile'
            description='How your name appears to other people.'
          />

          <div className='mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <Input label='Display name' placeholder='Kyungil Noh' size='md' fullWidth />
            <Select
              label='Language'
              size='md'
              fullWidth
              defaultValue='en'
              options={[
                { value: 'en', label: 'English' },
                { value: 'ko', label: 'Korean' },
              ]}
            />
          </div>

          <div className='mt-4'>
            <Textarea
              label='Bio'
              placeholder='A sentence about what you build'
              description='Up to 500 characters.'
              size='md'
              fullWidth
            />
          </div>

          <div className='mt-5 flex flex-col gap-2'>
            <Checkbox label='Show my email on the profile' size='md' />
            <Switch label='Notify me about replies' defaultChecked size='md' />
          </div>

          <div className='mt-6 flex items-center justify-end gap-2'>
            <Button variant='ghost' size='md'>Cancel</Button>
            <Button variant='primary' size='md' rightIconName='ArrowForward'>Save</Button>
          </div>
        </Card>
      </div>
    </LiveDemoTemplate>
  );
}
