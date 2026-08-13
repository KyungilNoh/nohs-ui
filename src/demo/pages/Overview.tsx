// nohs-ui/src/demo/pages/Overview.tsx
//
// 디자인 시스템의 씬 그래프를 3D 로 세운 관계도.
//
// three.js 구조도에서 개념을 가져왔다 — 위는 트리, 아래는 «여럿이 공유하는 자원»,
// 그 사이를 선이 잇는 그림. 그 도식이 우리 시스템과 같은 모양이다: 여러 Mesh 가
// 같은 Geometry·Material 을 가리키듯, 여러 분자가 같은 원자를 쓰고 여러 원자가
// 같은 토큰을 먹는다.
//
// 층을 위아래로 «쌓지» 않고 «참조 관계» 로 그리는 이유가 여기 있다. 쌓아 두면
// 층이 몇이라는 사실만 남는데, 이렇게 그리면 onsurface 하나를 원자 예닐곱이
// 나눠 쓴다는 것이 선다발로 보인다 — 그게 이 시스템에서 실제로 중요한 사실이다.
//
// 층은 넷이다. 한때 토큰을 한 층으로 뭉치고 갈래 이름도 지어냈는데(brand·ink·
// line·state) 코드 어디에도 없는 말이라, 화면이 없는 어휘를 가르치고 있었다.
// 실제로 토큰은 두 층이다 — 팔레트(원시값)를 시맨틱(의미값)이 가리키고 컴포넌트는
// 시맨틱만 본다. 다크 테마가 갈리는 지점이 정확히 그 사이다.
//
// R3F 대신 three 를 직접 쓴다. @react-three/fiber 9 는 React 19 를 요구하는데 이
// 레포는 18 이고, 데모 하나 때문에 라이브러리의 React 를 올릴 수는 없다.
//
// 데이터는 손으로 적는다 — 이 화면이 할 일은 구조를 보여 주는 것이지 의존성
// 감사가 아니다. 컴포넌트가 늘면 아래 표에 한 줄 더한다.

'use client';

import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { ATOMS as ATOM_ENTRIES, MOLECULES as MOLECULE_ENTRIES } from '../catalog';
import { SECTIONS } from '../navMap';

/* ── 구조 ──────────────────────────────────────────────────── */

/** 분자 → 그것이 쓰는 원자 */
const USES: Record<string, string[]> = {
  SectionHeader: ['Eyebrow', 'Title', 'Paragraph'],
  Input: ['Label', 'HelperText', 'ErrorText', 'SuccessText'],
  Select: ['Label', 'HelperText', 'ErrorText', 'Icon'],
  Checkbox: ['Label', 'HelperText', 'ErrorText', 'Icon'],
  Switch: ['Label', 'HelperText', 'ErrorText'],
  Textarea: ['Label', 'HelperText'],
  Button: ['Icon'],
  Card: [],
};

/**
 * 컴포넌트 → 그것이 쓰는 시맨틱 토큰.
 *
 * 원자만 토큰을 먹는 것이 아니다 — 분자도 제 껍데기(채움·테두리·포커스)를 위해
 * 직접 쓴다. Button·Checkbox·Switch 의 primary 가 그렇다. 원자만 이어 놓으면
 * 브랜드색이 Eyebrow 하나에만 닿는 것처럼 보이는데, 실제로는 버튼·스위치·
 * 체크박스가 전부 물고 있다.
 *
 * Icon 과 Tag 는 색 클래스를 쓰지 않는다 — 부모에게서 물려받는다. 그래서 선이
 * 없는 것이 맞다.
 */
const READS: Record<string, string[]> = {
  /* 원자 */
  Title: ['onsurface'],
  Subtitle: ['onsurface'],
  Paragraph: ['onsurface'],
  Eyebrow: ['onsurface', 'primary'],
  Label: ['onsurface'],
  HelperText: ['helper'],
  ErrorText: ['error'],
  SuccessText: ['success'],
  Icon: [],
  Tag: [],
  /* 분자 */
  Button: ['primary', 'onprimary', 'onsurface', 'surface', 'surface-alt', 'outline', 'error'],
  Card: ['onprimary', 'onsurface', 'surface'],
  Checkbox: ['primary', 'error'],
  Input: ['onsurface', 'surface', 'outline', 'muted', 'success', 'error'],
  SectionHeader: ['onsurface'],
  Select: ['onsurface', 'surface', 'outline', 'error'],
  Switch: ['primary', 'surface', 'surface-strong', 'outline', 'error'],
  Textarea: ['onsurface', 'surface', 'outline', 'muted', 'error'],
};

/**
 * 시맨틱 → 그것이 가리키는 팔레트.
 *
 * tokens.css 의 Semantic 절을 그대로 옮겼다. 이 한 겹이 이 시스템에서 제일
 * 중요한 결정이다 — 다크 테마는 팔레트를 바꾸지 않고 «이 화살표만» 갈아 끼운다.
 * 컴포넌트는 팔레트가 있다는 사실조차 모른다.
 */
const MAPS: Record<string, string> = {
  primary: 'brand',
  onprimary: 'neutral',
  onsurface: 'neutral',
  surface: 'neutral',
  'surface-alt': 'neutral',
  'surface-strong': 'neutral',
  outline: 'neutral',
  muted: 'neutral',
  helper: 'neutral',
  error: 'status',
  success: 'status',
};

const MOLECULES = Object.keys(USES);
const ATOMS = Object.keys(READS).filter((k) => !(k in USES));
const SEMANTIC = Object.keys(MAPS);

/** 팔레트 — 원시값. 시맨틱이 가리키는 곳 */
/**
 * 팔레트 — 원시값. 시맨틱이 가리키는 곳.
 *
 * tokens.css 의 절 이름을 그대로 쓴다(Palette: Brand · Neutral · Status).
 * red·green 을 따로 세우면 토큰 페이지와 두 화면이 같은 것을 다르게 부르게 된다.
 */
const PALETTE = [
  { id: 'brand', hue: '#0A5152' },
  { id: 'neutral', hue: '#8A8D92' },
  { id: 'status', hue: '#DA1E28' },
];

/**
 * 점 → 갈 곳.
 *
 * 경로를 여기 다시 적지 않는다 — 카탈로그가 이미 갖고 있고, 두 벌이 되면 언젠가
 * 어긋난다. 토큰은 낱개 페이지가 없으므로 토큰 페이지로 보낸다.
 */
const HREF: Record<string, string> = {
  ...Object.fromEntries([...MOLECULE_ENTRIES, ...ATOM_ENTRIES].map((e) => [e.title, e.href])),
  ...Object.fromEntries([...SEMANTIC, ...PALETTE.map((p) => p.id)].map((id) => [id, '/tokens'])),
};

/* ── 배치 ──────────────────────────────────────────────────── */

const TIERS = [
  { y: 205, r: 195 }, // 04 분자
  { y: 70, r: 250 }, // 03 원자
  { y: -70, r: 245 }, // 02 시맨틱
  { y: -215, r: 95 }, // 01 팔레트
];

/** 그래프가 퍼진 반지름. 배율 계산의 기준이 된다 */
const GRAPH_R = 250;
/** 처음 보는 거리 */
const START_DIST = 900;
/** 가장 가까이 당길 수 있는 거리 — 여기가 «최대 배율» 이다 */
const REACH_DIST = 520;
/** 가장 멀리 밀 수 있는 거리 */
const AWAY_DIST = 1600;

/** 층마다 원을 그리며 앉는다. 시작 각을 틀어 위아래가 일직선으로 겹치지 않게 */
function seat(tier: number, i: number, total: number) {
  const t = TIERS[tier];
  const a = (i / total) * Math.PI * 2 + tier * 0.45;
  return new THREE.Vector3(Math.cos(a) * t.r, t.y, Math.sin(a) * t.r);
}

export default function OverviewPage() {
  const host = React.useRef<HTMLDivElement>(null);
  const [name, setName] = React.useState<string | null>(null);
  const focus = React.useRef<string | null>(null);
  focus.current = name;

  const navigate = useNavigate();
  /* 콜백을 씬에 굳히지 않는다 — effect 는 한 번만 돌므로 ref 로 최신 것을 본다 */
  const go = React.useRef(navigate);
  go.current = navigate;

  React.useEffect(() => {
    const el = host.current;
    if (!el) return;

    const css = (v: string, fb: string) => {
      const raw = getComputedStyle(document.documentElement).getPropertyValue(v).trim();
      const m = raw.match(/^(\d+)\s+(\d+)\s+(\d+)$/);
      return new THREE.Color(m ? `rgb(${m[1]},${m[2]},${m[3]})` : raw || fb);
    };
    /*
      테마 색은 «그 자리에서» 고쳐 쓴다.

      머티리얼과 유니폼이 이 Color 객체를 그대로 물고 있으므로, set 만 해 주면
      씬 전체가 따라온다. 새 객체를 만들면 참조가 끊겨 갱신이 안 먹는다.
    */
    const ink = css('--color-onsurface', '#222');
    const dim = css('--color-outline-strong', '#999');
    const dimTag = css('--color-subtle', '#777');
    /** 테마가 바뀌면 다시 읽어야 하는 색들 — 색 객체와 토큰 이름을 짝지어 둔다 */
    const themed: Array<[THREE.Color, string, string]> = [
      [ink, '--color-onsurface', '#222'],
      [dim, '--color-outline-strong', '#999'],
      [dimTag, '--color-subtle', '#777'],
    ];

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 1, 4000);
    const gl = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    gl.setPixelRatio(Math.min(devicePixelRatio, 2));
    el.appendChild(gl.domElement);

    const world = new THREE.Group();
    scene.add(world);

    /*
      이름표를 «캔버스에 구워» 스프라이트로 띄운다.

      DOM(CSS2DRenderer)으로 두면 아무리 뒤에 있는 이름표도 캔버스 «위» 에 그려져
      앞의 점을 덮는다 — 깊이 버퍼에 참여하지 않기 때문이다. 스프라이트는 늘
      카메라를 보므로 글자는 그대로 읽히면서, 앞의 것에 제대로 가린다.

      글자는 흰색으로 굽고 색은 material.color 로 입힌다. 색이 바뀔 때마다 다시
      구우면 프레임마다 캔버스를 만들게 된다.

      최대 배율에서 안 깨지도록 «필요한 만큼» 굽는다.

      배율 하한(REACH)까지 당기면 가장 앞쪽 점은 카메라에서 REACH - GRAPH_R 까지
      붙는다. 기준 거리(START) 대비 그만큼 커지므로, 텍스처도 그 배수만큼 크게
      떠야 늘어나며 뭉개지지 않는다. 눈대중으로 «×4» 를 박아 두면 상수를 만질
      때마다 다시 깨진다.
    */
    const zoomGain = START_DIST / (REACH_DIST - GRAPH_R);
    const DPR = Math.min(devicePixelRatio, 2) * Math.ceil(zoomGain);
    const maxAniso = gl.capabilities.getMaxAnisotropy();

    /*
      점은 «셰이더로» 그린다.

      한때 512px 원판 텍스처를 썼는데, 기본 화면에서는 지름이 47px 이라 열한 배로
      줄어든다. 그 축소를 밉맵이 받아 내면서 가장자리가 뭉갰다. 텍스처를 키워도
      메모리만 늘고 축소비는 그대로다 — 애초에 «그림» 으로 풀 문제가 아니다.

      원은 «중심에서의 거리» 로 정의된다. 픽셀마다 그 거리를 재고 fwidth 로 화면상
      한 픽셀만큼만 부드럽게 끊으면, 배율이 얼마든 딱 한 픽셀짜리 안티에일리어싱이
      나온다. 텍스처 샘플링도 밉맵도 없으니 더 빠르고 메모리도 안 든다.
    */
    const discGeo = new THREE.PlaneGeometry(1, 1);
    const discShader = {
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform vec3 uColor;
        uniform float uOpacity;
        void main() {
          float d = length(vUv - 0.5);
          /* 화면에서 한 픽셀이 이 도형에서 얼마인지 — 배율이 변해도 테두리가 일정하다 */
          float w = fwidth(d);
          float a = 1.0 - smoothstep(0.5 - w, 0.5, d);
          if (a <= 0.001) discard;
          gl_FragColor = vec4(uColor, a * uOpacity);
          /*
            ShaderMaterial 은 색공간 변환을 자동으로 안 붙인다. 이게 없으면 sRGB
            값이 선형값으로 취급돼 전부 어두워진다 — 브랜드색이 검게 보였다.
          */
          #include <colorspace_fragment>
        }
      `,
    };

    /* 굵기는 층마다 다르게 하지 않는다 — 층은 자리와 크기로 이미 갈린다 */
    function bakeLabel(text: string, px: number) {
      const cv = document.createElement('canvas');
      const ctx = cv.getContext('2d')!;
      const font = `400 ${px * DPR}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.font = font;
      /* 여백을 넉넉히 — 텍스처 가장자리에 글자가 닿으면 필터링이 물어뜯는다 */
      const pad = Math.ceil(px * DPR * 0.5);
      const w = Math.ceil(ctx.measureText(text).width) + pad * 2;
      const h = Math.ceil(px * DPR * 1.8);
      cv.width = w;
      cv.height = h;
      /* 크기를 바꾸면 컨텍스트가 초기화된다 — 폰트를 다시 건다 */
      ctx.font = font;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff';
      ctx.fillText(text, w / 2, h / 2);

      const tex = new THREE.CanvasTexture(cv);
      /*
        minFilter 를 LinearFilter 로 두면 밉맵이 안 만들어진다. 그러면 글자가
        작게 보일 때 텍셀이 씹혀 지글거린다 — 기본값(밉맵 씀)을 그대로 두고,
        비스듬히 볼 때를 위해 이방성 필터를 최대로 건다.
      */
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = maxAniso;
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
      const sp = new THREE.Sprite(mat);
      /* 화면에서 대략 px 만큼 보이도록 — 기준 거리에서 1px ≈ 0.71 유닛 */
      const unit = 0.71;
      sp.scale.set((w / DPR) * unit, (h / DPR) * unit, 1);
      return sp;
    }

    /* ── 노드 ─────────────────────────────────────────── */
    const seats = new Map<string, THREE.Vector3>();
    const nodes: { id: string; mesh: THREE.Mesh; tag: THREE.Sprite; tier: number }[] = [];

    const put = (id: string, at: THREE.Vector3, color: THREE.Color, size: number, tier: number) => {
      seats.set(id, at);
      const mesh = new THREE.Mesh(
        discGeo,
        new THREE.ShaderMaterial({
          ...discShader,
          uniforms: { uColor: { value: color }, uOpacity: { value: 1 } },
          transparent: true,
        })
      );
      mesh.scale.set(size * 2, size * 2, 1);
      mesh.position.copy(at);
      mesh.userData.id = id;
      world.add(mesh);

      /*
        이름표는 world 에 직접 단다. 점의 자식으로 달면 점의 배율(size)을 그대로
        먹어서 글자가 층마다 다른 크기가 된다.
      */
      const tag = bakeLabel(id, 10.5);
      tag.position.copy(at).add(new THREE.Vector3(0, size + 11, 0));
      world.add(tag);

      nodes.push({ id, mesh, tag, tier });
    };

    MOLECULES.forEach((m, i) => put(m, seat(0, i, MOLECULES.length), ink, 7, 0));
    ATOMS.forEach((a, i) => put(a, seat(1, i, ATOMS.length), dim, 5, 1));
    SEMANTIC.forEach((t, i) => {
      const c = css(`--color-${t}`, '#888');
      themed.push([c, `--color-${t}`, '#888']);
      put(t, seat(2, i, SEMANTIC.length), c, 6.5, 2);
    });
    PALETTE.forEach((p, i) => put(p.id, seat(3, i, PALETTE.length), new THREE.Color(p.hue), 10, 3));

    /* ── 선 ───────────────────────────────────────────── */
    const edges: { a: string; b: string; line: THREE.Line }[] = [];

    const tie = (a: string, b: string, color: THREE.Color) => {
      const p = seats.get(a);
      const q = seats.get(b);
      if (!p || !q) return;
      /* 곧게 이으면 다발이 뭉친다 — 가운데를 축 쪽으로 당겨 살짝 휜다 */
      const mid = p.clone().add(q).multiplyScalar(0.5);
      mid.x *= 0.55;
      mid.z *= 0.55;
      const pts = new THREE.QuadraticBezierCurve3(p, mid, q).getPoints(28);
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        /* clone 하지 않는다 — 테마가 바뀔 때 이 색을 그 자리에서 고쳐 쓴다 */
        new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.25 })
      );
      world.add(line);
      edges.push({ a, b, line });
    };

    for (const [m, atoms] of Object.entries(USES)) for (const a of atoms) tie(m, a, dim);
    for (const [a, toks] of Object.entries(READS))
      for (const t of toks) {
        const c = css(`--color-${t}`, '#888');
        themed.push([c, `--color-${t}`, '#888']);
        tie(a, t, c);
      }
    for (const [semantic, pal] of Object.entries(MAPS))
      tie(semantic, pal, new THREE.Color(PALETTE.find((p) => p.id === pal)!.hue));

    /* ── 조작 ─────────────────────────────────────────── */
    let rx = 0.22;
    let ry = 0.5;
    let dist = START_DIST;
    const aim = { rx, ry, dist };
    let drag: { x: number; y: number; rx: number; ry: number } | null = null;
    /*
      지금 짚고 있는 점. state(focus)는 렌더 뒤에야 갱신되므로 프레임 안에서는
      못 믿는다 — 여기서 동기로 들고 있는다.
    */
    let hovered: string | null = null;

    const resize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      /*
        updateStyle 을 끄면 canvas 의 CSS 크기가 안 잡힌다 — 버퍼 크기(픽셀비만큼
        곱해진 값)가 그대로 레이아웃 크기가 되어 화면 밖으로 커진다.
      */
      gl.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();

    /** 그 자리에 어떤 점이 있나 */
    const pick = (cx: number, cy: number) => {
      const r = el.getBoundingClientRect();
      ndc.x = ((cx - r.left) / r.width) * 2 - 1;
      ndc.y = -((cy - r.top) / r.height) * 2 + 1;
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(
        nodes.map((n) => n.mesh),
        false
      )[0];
      return hit ? (hit.object.userData.id as string) : null;
    };

    /* 누른 자리에서 얼마나 움직였나 — 끈 것과 누른 것을 가른다 */
    let moved = 0;

    const onDown = (e: PointerEvent) => {
      el.setPointerCapture(e.pointerId);
      drag = { x: e.clientX, y: e.clientY, rx: aim.rx, ry: aim.ry };
      moved = 0;
    };
    const onMove = (e: PointerEvent) => {
      if (drag) {
        moved = Math.max(moved, Math.hypot(e.clientX - drag.x, e.clientY - drag.y));
        aim.ry = drag.ry + (e.clientX - drag.x) * 0.006;
        aim.rx = Math.max(-0.55, Math.min(1.1, drag.rx + (e.clientY - drag.y) * 0.006));
        return;
      }
      const id = pick(e.clientX, e.clientY);
      hovered = id;
      el.style.cursor = id ? 'pointer' : '';
      if (id !== focus.current) setName(id);
    };
    const onUp = (e: PointerEvent) => {
      /*
        4px 넘게 움직였으면 «돌린 것» 이지 «누른 것» 이 아니다.

        무엇을 눌렀는지는 state 로 알 수 없다 — focus 는 렌더 뒤에 갱신되는데
        pointerup 은 그보다 먼저 온다. 뗀 자리를 여기서 다시 쏜다.
      */
      if (drag && moved < 4) {
        const id = pick(e.clientX, e.clientY);
        const to = id ? HREF[id] : undefined;
        /*
          어디서 왔는지를 실어 보낸다. Tokens 는 최상위라 «속한 목록» 이 없어서
          경로만으로는 돌아갈 길을 못 만든다 — 관계도에서 들어온 경우에만
          화살표를 띄우려면 이 표시가 필요하다.
        */
        if (to) go.current(to, { state: { from: SECTIONS[0] } });
      }
      drag = null;
    };
    /*
      포인터가 판을 벗어나면 짚은 것을 놓는다. 안 그러면 마지막에 짚었던 점이
      그대로 남아 영영 멈춰 선다 — 화면 밖으로 나갔을 뿐인데.
    */
    const onLeave = () => {
      hovered = null;
      el.style.cursor = '';
      if (focus.current !== null) setName(null);
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      /* 당기고 미는 것은 «보는 거리» 를 바꾸는 일이라, 회전을 멈출 이유가 없다 */
      aim.dist = Math.max(REACH_DIST, Math.min(AWAY_DIST, aim.dist + e.deltaY * 0.7));
    };

    /* 테마가 바뀌면 색을 다시 읽는다 — 안 그러면 다크에서 씬만 라이트로 남는다 */
    const reread = () => {
      for (const [c, name, fb] of themed) c.copy(css(name, fb));
    };
    const themeWatch = new MutationObserver(reread);
    themeWatch.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    el.addEventListener('pointerleave', onLeave);
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    el.addEventListener('wheel', onWheel, { passive: false });

    /**
     * 짚은 것에 닿는 이름들.
     *
     * 층이 넷이 되면서 «한 칸 이웃» 만으로는 부족해졌다 — Input 을 짚으면 그것이
     * 쓰는 원자와, 그 원자가 먹는 시맨틱과, 그 시맨틱이 가리키는 팔레트까지
     * 끝까지 따라가야 한 줄기로 읽힌다.
     */
    const reach = (id: string) => {
      const s = new Set<string>([id]);
      const down = (n: string) => {
        for (const x of [...(USES[n] ?? []), ...(READS[n] ?? [])])
          if (!s.has(x)) {
            s.add(x);
            down(x);
          }
        const p = MAPS[n];
        if (p) s.add(p);
      };
      const up = (n: string) => {
        const parents = [
          ...Object.entries(USES).filter(([, v]) => v.includes(n)),
          ...Object.entries(READS).filter(([, v]) => v.includes(n)),
          ...Object.entries(MAPS).filter(([, v]) => v === n),
        ].map(([k]) => k);
        for (const p of parents)
          if (!s.has(p)) {
            s.add(p);
            up(p);
          }
      };
      down(id);
      up(id);
      return s;
    };

    /* 깊이 계산·빌보드에 재사용할 그릇 — 프레임마다 새로 만들지 않는다 */
    const probe = new THREE.Vector3();
    const faceCam = new THREE.Quaternion();
    const worldInv = new THREE.Quaternion();

    let raf = 0;
    const tick = () => {
      /*
        돌리는 것을 멈추는 때는 둘뿐이다 — 손으로 끌고 있거나, 점을 짚어 관계를
        들여다보고 있거나. 시간으로 판단하면 빈 곳에 마우스만 스쳐도 멈춰서,
        화면을 보고만 있어도 자꾸 굳는다.
      */
      if (!drag && !hovered) aim.ry += 0.0014;

      ry += (aim.ry - ry) * 0.08;
      rx += (aim.rx - rx) * 0.08;
      dist += (aim.dist - dist) * 0.08;

      world.rotation.y = ry;
      world.rotation.x = rx;
      camera.position.set(0, 40, dist);
      camera.lookAt(0, 0, 0);

      /* 부모 회전을 되돌린 «정면 보기» 자세. 점 스물여덟이 같은 값을 쓴다 */
      worldInv.copy(world.quaternion).invert();
      faceCam.copy(worldInv).multiply(camera.quaternion);

      const f = focus.current;
      const lit = f ? reach(f) : null;

      for (const e of edges) {
        /* 선은 «양 끝이 모두» 켜져야 켜진다 — 한쪽만 보면 상관없는 선까지 산다 */
        const live = !lit || (lit.has(e.a) && lit.has(e.b));
        const mat = e.line.material as THREE.LineBasicMaterial;
        const want = lit ? (live ? 0.95 : 0.03) : 0.25;
        mat.opacity += (want - mat.opacity) * 0.2;
      }
      for (const n of nodes) {
        const u = (n.mesh.material as THREE.ShaderMaterial).uniforms.uOpacity;
        const want = !lit || lit.has(n.id) ? 1 : 0.08;
        u.value += (want - u.value) * 0.2;

        /*
          평면이라 스스로 카메라를 봐야 한다 — 스프라이트가 대신해 주던 일이다.
          부모(world)가 돌고 있으므로 카메라 방향을 그대로 넣으면 부모 회전이
          한 번 더 얹혀 원이 타원으로 눌린다. 부모 회전을 먼저 되돌린다.
        */
        n.mesh.quaternion.copy(faceCam);

        /*
          멀수록 옅게. 앞의 점에 가려지는 것은 깊이 버퍼가 알아서 하고, 여기서는
          «공기» 만 더한다. world 는 회전만 하므로 자리에 회전만 먹여 거리를 잰다.
        */
        probe.copy(seats.get(n.id)!).applyEuler(world.rotation);
        const far = THREE.MathUtils.clamp(
          (camera.position.distanceTo(probe) - (dist - 360)) / 720,
          0,
          1
        );
        const tagMat = n.tag.material as THREE.SpriteMaterial;
        tagMat.opacity = u.value * (1 - far * 0.7);
        /*
          글자는 흰색으로 구워 뒀다 — 색은 여기서 입힌다.
          짚었다고 브랜드색을 입히지 않는다. 짚은 것이 무엇인지는 «그 길만 살고
          나머지가 죽는» 것으로 이미 말한다 — 거기에 색까지 바꾸면 신호가 겹친다.
        */
        tagMat.color.lerp(n.tier === 0 ? ink : dimTag, 0.25);
      }

      gl.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      themeWatch.disconnect();
      el.removeEventListener('pointerleave', onLeave);
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
      el.removeEventListener('wheel', onWheel);
      gl.dispose();
      el.removeChild(gl.domElement);
    };
  }, []);

  return (
    <div className='relative h-screen w-full overflow-hidden bg-surface text-onsurface'>
      <div ref={host} className='h-full w-full cursor-grab active:cursor-grabbing' />

      {/*
        팔레트와 시맨틱은 «토큰» 한 갈래다 — 색값과 그 색에 붙인 이름. 줄을 따로
        쓰면 서로 남남인 층으로 읽힌다. 한 줄에 붙여 둘이 짝이라는 것을 보인다.
      */}
      {/*
        층 표기와 조작 안내를 한자리에 둔다. 안내가 화면 아래 가운데 혼자 떠 있으면
        판을 보다가 시선을 옮겨야 읽히는데, 그 자리는 원래 아무것도 없는 자리다.
      */}
      <div className='pointer-events-none absolute left-10 top-10 font-mono text-[10.5px] leading-[2] tracking-[0.16em] text-subtle'>
        <div>03 MOLECULES {MOLECULES.length}</div>
        <div>02 ATOMS {ATOMS.length}</div>
        <div>
          01 PALETTE {PALETTE.length} · SEMANTIC {SEMANTIC.length}
        </div>
        <div className='mt-5 opacity-70'>DRAG · WHEEL · HOVER · CLICK</div>
      </div>
    </div>
  );
}
