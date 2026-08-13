// nohs-ui/src/demo/pages/TokensDemo.tsx

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import LiveDemoTemplate from '../LiveDemoTemplate';
import { Eyebrow, Paragraph } from '@ds';
import { collectTokenNames } from '../tokens';

/**
 * 디자인 토큰 목록.
 *
 * 이름을 여기에 적어두지 않는다 — 적어두는 순간 tokens.css 와 어긋나기 시작하고,
 * 어긋난 걸 알아챌 방법이 없다. 실제 스타일시트에서 :root 커스텀 속성을 긁어
 * 현재 계산값과 함께 보여준다. 테마를 바꾸면 이 화면도 따라 바뀐다.
 */

interface Token {
  name: string;
  /** getComputedStyle 로 읽은 현재 값 */
  value: string;
}

/** 색 토큰은 "R G B" 삼중값으로 저장된다 — rgb(var(--x) / alpha) 로 쓰기 위해서다 */
const RGB_TRIPLET = /^\d{1,3}\s+\d{1,3}\s+\d{1,3}$/;

const BRAND_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
/** neutral 은 2씩 51단 — 전부 칠하면 한 줄이 그대로 그라디언트가 된다 */
const NEUTRAL_STEPS = Array.from({ length: 51 }, (_, i) => i * 2);

/**
 * 큰 계조 바. 각 단에 커서를 올리면 그 칸이 솟고 이름·값이 뜬다 —
 * 스와치를 눈으로 훑다가 필요한 순간에만 숫자를 읽게 한다.
 */
function Ramp({
  label,
  vars,
  values,
  showLabels,
}: {
  label: string;
  vars: string[];
  values: Record<string, string>;
  showLabels?: boolean;
}) {
  return (
    <section className='mb-[72px]'>
      <div className='mb-3 flex items-baseline justify-between'>
        <Eyebrow tone='muted'>{label}</Eyebrow>
        <span className='text-[11px] text-subtle'>{vars.length} steps</span>
      </div>

      <div className='dsRamp flex h-32 overflow-hidden rounded-2xl border border-outline/25'>
        {vars.map((v) => (
          <button
            key={v}
            type='button'
            title={`${v} — ${values[v] ?? ''}`}
            onClick={() => navigator.clipboard?.writeText(v)}
            className='dsRampCell group relative flex-1 cursor-pointer border-0 p-0'
            style={{ background: `rgb(var(${v}))` }}
          >
            <span className='dsRampTip pointer-events-none absolute inset-x-0 bottom-2 px-1 text-center opacity-0'>
              <code className='block truncate text-[10px] font-semibold text-onprimary mix-blend-difference'>
                {showLabels ? v.replace(/^--\w+-/, '') : ''}
              </code>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

/**
 * 접두어로 갈래를 나눈다. 순서가 곧 화면 순서.
 *
 * tokens.css 의 절 이름을 그대로 따른다 — Palette(Brand·Status·Neutral) ·
 * Typography · Semantic. 파일이 이미 그렇게 갈라 놓았는데 화면만 다르게 묶고
 * 있었다.
 *
 * Palette 는 «색값» 이고 Semantic 은 그 색에 «어디에 쓰는 색인지» 이름을 붙인
 * 것이다 — --neutral-10 은 그냥 어두운 회색이고, --color-onsurface 는 «바탕 위
 * 글자색» 이다. 다크 테마가 갈리는 지점도 정확히 그 사이다(팔레트는 그대로,
 * 이름만 다시 건다).
 */
const RAMPED = /^--(brand|neutral)-\d+$/;
/* tokens.css 의 «Palette: Status» — 상태를 나타내는 원시색 */
const STATUS_HUE = /^--(red|green|blue|yellow|orange)-\d+$/;

const GROUPS: Array<{ key: string; label: string; match: (n: string) => boolean }> = [
  {
    key: 'status',
    label: 'Palette / Status',
    match: (n) => STATUS_HUE.test(n),
  },
  {
    key: 'semantic',
    label: 'Semantic',
    match: (n) => n.startsWith('--color-'),
  },
  {
    key: 'focus',
    label: 'Focus ring',
    match: (n) => n.startsWith('--focus-ring'),
  },
  {
    key: 'font',
    label: 'Typography',
    match: (n) => n.startsWith('--font-'),
  },
];

/**
 * 이 값이 색인가. 색이면 그릴 수 있는 형태로 돌려준다.
 *
 * 맨 숫자 세 개만 보면 안 된다 — 팔레트·시맨틱은 `12 34 56` 꼴이지만
 * --focus-ring-color 는 계산값이 `rgb(21 89 67)` 이라 그 판별을 통과하지 못한다.
 * 그래서 색인데도 abc 로 떨어져 있었다. 브라우저에게 직접 물어본다.
 */
function asColor(value: string): string | null {
  if (!value) return null;
  if (RGB_TRIPLET.test(value)) return `rgb(${value})`;
  return CSS?.supports?.('color', value) ? value : null;
}

function Swatch({ token }: { token: Token }) {
  const color = asColor(token.value);
  return (
    <div className='flex items-center gap-3 rounded-md border border-outline/25 px-3 py-2'>
      {color ? (
        <span
          aria-hidden
          className='h-8 w-8 shrink-0 rounded border border-outline/30'
          style={{ background: color }}
        />
      ) : (
        <span
          aria-hidden
          className='flex h-8 w-8 shrink-0 items-center justify-center rounded border border-outline/30 text-[10px] text-subtle'
        >
          abc
        </span>
      )}
      <div className='min-w-0'>
        <code className='block truncate text-[12px] text-onsurface'>{token.name}</code>
        <code className='block truncate text-[11px] text-subtle'>{token.value}</code>
      </div>
    </div>
  );
}

export default function TokensDemoPage() {
  const [tokens, setTokens] = useState<Token[]>([]);

  useEffect(() => {
    const read = () => {
      const style = getComputedStyle(document.documentElement);
      setTokens(
        collectTokenNames().map((name) => ({
          name,
          value: style.getPropertyValue(name).trim(),
        }))
      );
    };
    read();

    // 테마가 바뀌면 계산값도 바뀐다 — 화면이 따라가야 «현재» 를 보여주는 것이 된다
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const valueOf = useMemo(
    () => Object.fromEntries(tokens.map((t) => [t.name, t.value])) as Record<string, string>,
    [tokens]
  );

  const grouped = useMemo(() => {
    /* 계조 바가 이미 보여준 단계들만 뺀다 — 같은 것을 두 번 읽히지 않는다 */
    const listed = tokens.filter((t) => !RAMPED.test(t.name));
    const rest = new Set(listed.map((t) => t.name));
    const out = GROUPS.map((g) => {
      const items = listed.filter((t) => g.match(t.name));
      items.forEach((t) => rest.delete(t.name));
      return { ...g, items };
    }).filter((g) => g.items.length > 0);

    const leftovers = listed.filter((t) => rest.has(t.name));
    if (leftovers.length) {
      out.push({
        key: 'etc',
        label: 'Etc',
        match: () => false,
        items: leftovers,
      });
    }
    return out;
  }, [tokens]);

  return (
    <LiveDemoTemplate
      pageOnly
      title='Tokens'
      description={`${tokens.length} tokens — read from the stylesheet, not a list typed by hand. Switch themes and this page follows.`}
      usageCode=''
      properties={[]}
      controls={null}
    >
      <style>{`
        .dsRampCell { transition: flex-grow .3s cubic-bezier(.2,.7,.2,1), transform .3s; }
        .dsRamp:hover .dsRampCell { flex-grow: .85; }
        .dsRampCell:hover { flex-grow: 2.6; }
        .dsRampTip { transition: opacity .2s; }
        .dsRampCell:hover .dsRampTip { opacity: 1; }
        @media (prefers-reduced-motion: reduce) {
          .dsRampCell, .dsRampTip { transition: none !important; }
        }
      `}</style>

      {tokens.length > 0 && (
        <>
          <Ramp
            label='Palette / Brand'
            vars={BRAND_STEPS.map((n) => `--brand-${n}`)}
            values={valueOf}
            showLabels
          />
          <Ramp
            label='Palette / Neutral'
            vars={NEUTRAL_STEPS.map((n) => `--neutral-${n}`)}
            values={valueOf}
          />
        </>
      )}

      {tokens.length === 0 ? (
        <Paragraph size='sm' tone='muted'>
          Could not read tokens. Cross-origin stylesheets are not accessible.
        </Paragraph>
      ) : (
        grouped.map((g) => (
          // 머리글은 위 계조 바와 같은 꼴로 — 이름 왼쪽, 개수 오른쪽 한 줄.
          // 큰 숫자와 설명 문단을 끼우면 스와치보다 머리글이 무거워진다.
          <section key={g.key} className='mb-[72px]'>
            <div className='mb-3 flex items-baseline justify-between'>
              <Eyebrow tone='muted'>{g.label}</Eyebrow>
              <span className='text-[11px] text-subtle'>{g.items.length} tokens</span>
            </div>
            <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3'>
              {g.items.map((t) => (
                <Swatch key={t.name} token={t} />
              ))}
            </div>
          </section>
        ))
      )}
    </LiveDemoTemplate>
  );
}
