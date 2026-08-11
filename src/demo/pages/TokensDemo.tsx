// nohs-ui/src/demo/pages/TokensDemo.tsx

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import LiveDemoTemplate from '../LiveDemoTemplate';
import { Eyebrow, Paragraph } from '@ds';

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

function collectTokenNames(): string[] {
  const names = new Set<string>();
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules; // 교차 출처 스타일시트는 접근 시 던진다
    } catch {
      continue;
    }
    for (const rule of Array.from(rules)) {
      if (!(rule instanceof CSSStyleRule)) continue;
      if (!/:root|\[data-theme/.test(rule.selectorText)) continue;
      for (const prop of Array.from(rule.style)) {
        if (prop.startsWith('--')) names.add(prop);
      }
    }
  }
  return [...names].sort();
}

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

/** 접두어로 갈래를 나눈다. 순서가 곧 화면 순서 */
const GROUPS: Array<{ key: string; label: string; match: (n: string) => boolean }> = [
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

function Swatch({ token }: { token: Token }) {
  const isColor = RGB_TRIPLET.test(token.value);
  return (
    <div className='flex items-center gap-3 rounded-md border border-outline/25 px-3 py-2'>
      {isColor ? (
        <span
          aria-hidden
          className='h-8 w-8 shrink-0 rounded border border-outline/30'
          style={{ background: `rgb(${token.value})` }}
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
    const rest = new Set(tokens.map((t) => t.name));
    const out = GROUPS.map((g) => {
      const items = tokens.filter((t) => g.match(t.name));
      items.forEach((t) => rest.delete(t.name));
      return { ...g, items };
    }).filter((g) => g.items.length > 0);

    const leftovers = tokens.filter((t) => rest.has(t.name));
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
            label='BRAND'
            vars={BRAND_STEPS.map((n) => `--brand-${n}`)}
            values={valueOf}
            showLabels
          />
          <Ramp label='NEUTRAL' vars={NEUTRAL_STEPS.map((n) => `--neutral-${n}`)} values={valueOf} />
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
