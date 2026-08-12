"use client";

import type { ReactNode } from 'react';
import { Item } from './JamCanvas';

/**
 * nohsJam 의 보편 조각.
 *
 * 어느 판에나 있을 법한 것만 둔다 — 색 팔레트와 «종이» 한 장. 화면마다 다른
 * 구조 조각(파이프라인 프레임 · 제목 카드 같은 것)은 소비처가 Item 을 둘러
 * 직접 만든다. 여기에 넣기 시작하면 남의 글 사정이 이 라이브러리로 새어 든다.
 */

/*
  종이 색. 두 테마에서 «같은 색» 을 쓴다 — 실물 포스트잇이 조명에 따라 색을
  바꾸지 않는 것과 같다. 글자는 항상 먹색이라 대비도 두 테마에서 같다.
*/
export const JAM_TONE = {
  yellow: { fill: '#FFE9A3', edge: '#E8C355' },
  pink: { fill: '#FFC9DD', edge: '#EE93B8' },
  blue: { fill: '#B3DCFF', edge: '#6FB4EE' },
  green: { fill: '#B2E5BF', edge: '#6DC287' },
  violet: { fill: '#DCC9FF', edge: '#AE8CEE' },
  orange: { fill: '#FFD1A8', edge: '#EFA463' },
  gray: { fill: '#E4E7EC', edge: '#B4BAC4' },
} as const;

export type JamTone = keyof typeof JAM_TONE;

/** 종이 위 글자는 어느 테마에서든 먹색 */
export const JAM_INK = '#232629';

/* ── Sticky ─────────────────────────────────────────────────
   판정·발견을 붙이는 포스트잇. 살짝 기울여 «손으로 붙인» 느낌을 낸다.
   ──────────────────────────────────────────────────────────── */

export interface StickyProps {
  id: string;
  at?: string;
  /** 누르면 열릴 Panel 의 id */
  opens?: string;
  tone?: JamTone;
  /** 도장처럼 위에 얹히는 한 마디 (예: 증명 ①) */
  label?: string;
  /** 기울기(도). 홀짝으로 번갈아 주면 손맛이 난다 */
  tilt?: string | number;
  children: ReactNode;
}

export function Sticky({ id, at, opens, tone = 'yellow', label, tilt = -1.5, children }: StickyProps) {
  const t = JAM_TONE[tone];
  const deg = typeof tilt === 'string' ? parseFloat(tilt) : tilt;

  return (
    <Item
      id={id}
      at={at}
      opens={opens}
      className="w-[208px] rounded-[3px] px-4 py-4"
      style={{
        background: t.fill,
        color: JAM_INK,
        rotate: `${Number.isFinite(deg) ? deg : 0}deg`,
        boxShadow: '0 6px 14px -6px rgb(0 0 0 / 0.35), 0 1px 2px rgb(0 0 0 / 0.15)',
      }}
    >
      {label && (
        <p className="m-0 mb-1.5 text-[11px] font-extrabold uppercase tracking-[0.08em] opacity-60">
          {label}
        </p>
      )}
      <div className="note-sticky-body text-[14px] font-semibold leading-[1.55] [word-break:keep-all]">
        {children}
      </div>
    </Item>
  );
}

/*
  'use client' 모듈에서 «객체» 로 묶어 내보내면 서버 쪽에서는 클라이언트
  참조 하나로 보여 스프레드해도 키가 나오지 않는다. 컴포넌트는 개별로
  내보내고, 묶는 일은 서버 파일(NoteLayout)이 한다.
*/

