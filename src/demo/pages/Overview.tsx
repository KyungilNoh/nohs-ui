// nohs-ui/src/demo/pages/Overview.tsx

'use client';

import React from 'react';
import LiveDemoTemplate from '../LiveDemoTemplate';
import {
  Button,
  Card,
  Checkbox,
  Eyebrow,
  Icon,
  Input,
  Paragraph,
  SectionHeader,
  Select,
  Switch,
  Tag,
  Textarea,
  Title,
} from '@ds';
import { ATOMS, MOLECULES } from '../catalog';

/**
 * 이 시스템이 무엇으로 서 있는지 보여주는 자리.
 *
 * 화면을 채우는 것은 전부 «이 시스템이 실제로 내는 것» 이다 — 색은 tokens.css 의
 * 값이고 컴포넌트는 진짜 컴포넌트다. 캡처 이미지도 남의 그림도 쓰지 않는다.
 * 디자인 시스템 소개 화면이 남의 자산으로 채워져 있으면 그 자체로 앞뒤가 안 맞는다.
 *
 * 도형은 CSS 만으로 그린다. 이미지가 없으니 테마를 바꾸면 도형 색도 함께 간다.
 */

const TOTAL = MOLECULES.length + ATOMS.length + 1;

/* ─────────────────────────────────────────────────────────────
   기하 도형 — 토큰 색으로 칠하고 hover 에 반응한다
   ───────────────────────────────────────────────────────────── */

type ShapeKind = 'circle' | 'square' | 'quarter' | 'pill' | 'triangle' | 'ring';

const SHAPE_CLASS: Record<ShapeKind, string> = {
  circle: 'rounded-full',
  square: 'rounded-[18%]',
  quarter: 'rounded-tl-[100%]',
  pill: 'rounded-full',
  triangle: '',
  ring: 'rounded-full',
};

function Shape({
  kind,
  varName,
  className = '',
  delay = 0,
}: {
  kind: ShapeKind;
  varName: string;
  className?: string;
  delay?: number;
}) {
  const bg = `rgb(var(${varName}))`;
  const style: React.CSSProperties =
    kind === 'triangle'
      ? { background: bg, clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)', animationDelay: `${delay}ms` }
      : kind === 'ring'
      ? { border: `10px solid ${bg}`, animationDelay: `${delay}ms` }
      : { background: bg, animationDelay: `${delay}ms` };

  return <span aria-hidden className={`dsShape ${SHAPE_CLASS[kind]} ${className}`} style={style} />;
}

/** 히어로 — 도형이 겹쳐 도는 판 */
function Hero() {
  return (
    <div className='dsHero relative mb-16 overflow-hidden rounded-[28px] bg-surface-alt px-8 py-14 sm:px-12 sm:py-20'>
      {/* 배경 도형 — 커서를 올리면 흩어진다 */}
      <Shape kind='circle' varName='--brand-500' className='dsFloat absolute -right-10 -top-10 h-56 w-56 opacity-90' />
      <Shape kind='quarter' varName='--brand-200' className='dsFloat absolute right-40 -top-6 h-28 w-28' delay={120} />
      <Shape kind='triangle' varName='--color-success' className='dsFloat absolute -bottom-8 right-16 h-32 w-32 opacity-80' delay={240} />
      <Shape kind='ring' varName='--brand-700' className='dsFloat absolute bottom-10 right-64 h-24 w-24' delay={360} />
      <Shape kind='square' varName='--color-error' className='dsFloat absolute -bottom-10 right-[22rem] h-20 w-20 opacity-70' delay={480} />

      <div className='relative max-w-[34rem]'>
        <Eyebrow tone='primary'>DESIGN SYSTEM</Eyebrow>
        <h1 className='dsHeroTitle mt-2 text-[clamp(2.75rem,7vw,5rem)] font-extrabold leading-[0.95] tracking-[-0.03em] text-onsurface'>
          nohs<span style={{ color: 'rgb(var(--color-primary))' }}>-</span>ui
        </h1>
        <Paragraph size='lg' className='mt-5'>
          One kit behind app-shell, folio and prop. {TOTAL} components, 95 tokens, three layers.
        </Paragraph>

        <div className='mt-7 flex flex-wrap items-center gap-2'>
          <a href='/molecules' className='no-underline'>
            <Button variant='primary' size='lg' rightIconName='ArrowForward'>Browse components</Button>
          </a>
          <a href='/tokens' className='no-underline'>
            <Button variant='ghost' size='lg'>See tokens</Button>
          </a>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   층 — 큼직한 타일 3장
   ───────────────────────────────────────────────────────────── */

interface Layer {
  n: string;
  title: string;
  count: string;
  body: string;
  href: string;
  accent: string;
  art: React.ReactNode;
}

const LAYERS: Layer[] = [
  {
    n: '01',
    title: 'Tokens',
    count: '95 values',
    body: 'Names for values. A component never calls #005152 — it calls --color-primary.',
    href: '/tokens',
    accent: '--brand-500',
    art: (
      <div className='grid h-full w-full grid-cols-3 gap-2'>
        {['--brand-300', '--brand-500', '--brand-700', '--color-success', '--color-error', '--color-onsurface'].map(
          (v, i) => (
            <span
              key={v}
              className={`dsTileCell ${i % 2 ? 'rounded-full' : 'rounded-[22%]'}`}
              style={{ background: `rgb(var(${v}))`, transitionDelay: `${i * 40}ms` }}
            />
          )
        )}
      </div>
    ),
  },
  {
    n: '02',
    title: 'Atoms',
    count: `${ATOMS.length} components`,
    body: 'The smallest units. Mostly presentational, holding no state of their own.',
    href: '/atoms',
    accent: '--color-success',
    art: (
      <div className='flex h-full w-full flex-col items-start justify-center gap-2'>
        <Eyebrow tone='primary'>EYEBROW</Eyebrow>
        <Title level={3}>Title</Title>
        <div className='flex flex-wrap gap-1.5'>
          <Tag variant='primary' size='sm'>primary</Tag>
          <Tag variant='success' size='sm'>success</Tag>
          <Tag variant='danger' size='sm'>danger</Tag>
        </div>
      </div>
    ),
  },
  {
    n: '03',
    title: 'Molecules',
    count: `${MOLECULES.length} components`,
    body: 'Built from Atoms to finish one job. They carry interaction and state.',
    href: '/molecules',
    accent: '--brand-700',
    art: (
      <div className='flex h-full w-full flex-col justify-center gap-2'>
        <Input label='Email' placeholder='name@example.com' size='sm' fullWidth />
        <div className='flex gap-2'>
          <Button variant='primary' size='sm'>Send</Button>
          <Button variant='ghost' size='sm'>Cancel</Button>
        </div>
      </div>
    ),
  },
];

export default function OverviewPage() {
  return (
    <LiveDemoTemplate pageOnly title='' description='' usageCode='' properties={[]} controls={null}>
      <style>{`
        /* 도형은 이미지가 아니라 CSS 다 — 테마를 바꾸면 색이 따라온다 */
        .dsShape { display: block; }

        @keyframes dsDrift {
          0%   { transform: translate3d(0,0,0) rotate(0deg); }
          50%  { transform: translate3d(0,-14px,0) rotate(6deg); }
          100% { transform: translate3d(0,0,0) rotate(0deg); }
        }
        .dsFloat {
          animation: dsDrift 9s ease-in-out infinite;
          transition: transform .6s cubic-bezier(.2,.7,.2,1);
        }
        /* 히어로에 커서를 올리면 도형이 바깥으로 흩어진다 */
        .dsHero:hover .dsFloat { animation-play-state: paused; }
        .dsHero:hover .dsFloat:nth-of-type(1) { transform: translate3d(18px,-18px,0) rotate(12deg) scale(1.06); }
        .dsHero:hover .dsFloat:nth-of-type(2) { transform: translate3d(-14px,-22px,0) rotate(-14deg); }
        .dsHero:hover .dsFloat:nth-of-type(3) { transform: translate3d(10px,16px,0) rotate(10deg); }
        .dsHero:hover .dsFloat:nth-of-type(4) { transform: translate3d(-20px,12px,0) scale(1.12); }
        .dsHero:hover .dsFloat:nth-of-type(5) { transform: translate3d(22px,20px,0) rotate(-18deg); }

        .dsHeroTitle { font-feature-settings: 'ss01'; }

        /* 타일 — 올리면 떠오르고, 안의 도형이 시차를 두고 커진다 */
        .dsTile { transition: transform .35s cubic-bezier(.2,.7,.2,1), box-shadow .35s; }
        .dsTile:hover { transform: translateY(-6px); box-shadow: 0 18px 40px rgb(var(--color-onsurface) / .10); }
        .dsTileCell { transition: transform .35s cubic-bezier(.2,.7,.2,1); }
        .dsTile:hover .dsTileCell { transform: scale(1.08); }
        .dsTileBar { transition: width .45s cubic-bezier(.2,.7,.2,1); }
        .dsTile:hover .dsTileBar { width: 100%; }

        @media (prefers-reduced-motion: reduce) {
          .dsFloat, .dsTile, .dsTileCell, .dsTileBar { animation: none !important; transition: none !important; }
        }
      `}</style>

      <Hero />

      {/* ── 층 ─────────────────────────────────────────────── */}
      <div className='mb-16 grid grid-cols-1 gap-4 lg:grid-cols-3'>
        {LAYERS.map((layer) => (
          <a
            key={layer.title}
            href={layer.href}
            className='dsTile group flex flex-col overflow-hidden rounded-3xl bg-surface-alt p-7 no-underline text-inherit'
          >
            <div className='flex items-baseline justify-between'>
              <span className='font-mono text-xs text-subtle'>{layer.n}</span>
              <Eyebrow tone='muted'>{layer.count}</Eyebrow>
            </div>

            <div className='pointer-events-none my-6 flex h-[150px] w-full items-center justify-center rounded-2xl bg-surface/70 p-5'>
              {layer.art}
            </div>

            <Title level={2}>{layer.title}</Title>
            <span
              className='dsTileBar mt-2 block h-1.5 w-12 rounded-full'
              style={{ background: `rgb(var(${layer.accent}))` }}
            />
            <Paragraph size='sm' tone='muted' className='mt-3'>
              {layer.body}
            </Paragraph>

            <span className='mt-4 inline-flex items-center gap-1 text-sm text-onsurface'>
              Explore
              <Icon name='ArrowForward' fontSize='small' />
            </span>
          </a>
        ))}
      </div>

      {/* ── 한자리에 모아 놓기 ─────────────────────────────── */}
      <div>
        <Eyebrow tone='muted'>IN COMPOSITION</Eyebrow>
        <Title level={2} className='mt-1'>
          {TOTAL} parts, one form
        </Title>
        <Paragraph size='sm' tone='muted' className='mb-5 mt-2'>
          Everything below is the real thing — nothing here is a screenshot.
        </Paragraph>

        <Card elevation='md'>
          <SectionHeader eyebrow='ACCOUNT' title='Profile' description='How your name appears to other people.' />

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
