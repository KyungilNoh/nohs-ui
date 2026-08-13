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
// 층이 셋이라는 사실만 남는데, 이렇게 그리면 Label 하나를 다섯 분자가 나눠 쓴다는
// 것이 선다발로 보인다 — 그게 이 시스템에서 실제로 중요한 사실이다.
//
// R3F 대신 three 를 직접 쓴다. @react-three/fiber 9 는 React 19 를 요구하는데 이
// 레포는 18 이고, 데모 하나 때문에 라이브러리의 React 를 올릴 수는 없다.
//
// 데이터는 손으로 적는다 — 이 화면이 할 일은 구조를 보여 주는 것이지 의존성
// 감사가 아니다. 컴포넌트가 늘면 아래 표에 한 줄 더한다.

'use client';

import React from 'react';
import * as THREE from 'three';
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

/* ── 구조 ──────────────────────────────────────────────────── */

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

const READS: Record<string, string[]> = {
  Title: ['ink'],
  Subtitle: ['ink'],
  Paragraph: ['ink'],
  Eyebrow: ['ink', 'brand'],
  Label: ['ink'],
  HelperText: ['ink'],
  ErrorText: ['state'],
  SuccessText: ['state'],
  Tag: ['ink', 'line'],
  Icon: ['ink'],
};

/** 토큰은 낱개가 아니라 갈래로 묶는다 — 마흔 개를 낱개로 그리면 선이 숲이 된다 */
const TOKENS = [
  { id: 'brand', hue: '#E0575F' },
  { id: 'ink', hue: '#3F8F5B' },
  { id: 'line', hue: '#B8792B' },
  { id: 'state', hue: '#6C6FCF' },
];

const MOLECULES = Object.keys(USES);
const ATOMS = Object.keys(READS);

/* ── 배치 ──────────────────────────────────────────────────── */

const TIERS = [
  { y: 120, r: 190 }, // 분자
  { y: 0, r: 250 }, // 원자
  { y: -130, r: 120 }, // 토큰
];

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

  React.useEffect(() => {
    const el = host.current;
    if (!el) return;

    const css = (v: string, fb: string) => {
      const raw = getComputedStyle(document.documentElement).getPropertyValue(v).trim();
      const m = raw.match(/^(\d+)\s+(\d+)\s+(\d+)$/);
      return new THREE.Color(m ? `rgb(${m[1]},${m[2]},${m[3]})` : raw || fb);
    };
    const ink = css('--color-onsurface', '#222');
    const dim = css('--color-outline-strong', '#999');

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 1, 4000);
    const gl = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    gl.setPixelRatio(Math.min(devicePixelRatio, 2));
    el.appendChild(gl.domElement);

    /* 이름표는 DOM 으로 띄운다 — 3D 안에 글자를 넣으면 각도마다 읽히다 만다 */
    const labels = new CSS2DRenderer();
    labels.domElement.style.position = 'absolute';
    labels.domElement.style.inset = '0';
    labels.domElement.style.pointerEvents = 'none';
    el.appendChild(labels.domElement);

    const world = new THREE.Group();
    scene.add(world);

    /* ── 노드 ─────────────────────────────────────────── */
    const seats = new Map<string, THREE.Vector3>();
    const nodes: { id: string; mesh: THREE.Mesh; tag: HTMLDivElement }[] = [];
    const ball = new THREE.SphereGeometry(1, 18, 18);

    const put = (id: string, at: THREE.Vector3, color: THREE.Color, size: number, cls: string) => {
      seats.set(id, at);
      const mesh = new THREE.Mesh(
        ball,
        new THREE.MeshBasicMaterial({ color, transparent: true })
      );
      mesh.scale.setScalar(size);
      mesh.position.copy(at);
      mesh.userData.id = id;
      world.add(mesh);

      const tag = document.createElement('div');
      tag.textContent = id;
      tag.className = cls;
      const obj = new CSS2DObject(tag);
      /*
        이름표는 점의 «자식» 이라 부모 배율을 그대로 먹는다. 로컬 좌표에 그냥
        size+6 을 주면 (size+6)×size 만큼 날아간다 — 배율로 나눠서 상쇄한다.
        결과는 중심에서 size+6 유닛, 즉 표면에서 6 유닛 위다.
      */
      obj.position.set(0, (size + 6) / size, 0);
      mesh.add(obj);

      nodes.push({ id, mesh, tag });
    };

    MOLECULES.forEach((m, i) =>
      put(m, seat(0, i, MOLECULES.length), ink.clone(), 7, 'ds-node ds-node--mol')
    );
    ATOMS.forEach((a, i) =>
      put(a, seat(1, i, ATOMS.length), dim.clone(), 5, 'ds-node ds-node--atom')
    );
    TOKENS.forEach((t, i) =>
      put(t.id, seat(2, i, TOKENS.length), new THREE.Color(t.hue), 10, 'ds-node ds-node--tok')
    );

    /* ── 선 ───────────────────────────────────────────── */
    const edges: { a: string; b: string; line: THREE.Line; base: THREE.Color }[] = [];

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
        new THREE.LineBasicMaterial({ color: color.clone(), transparent: true, opacity: 0.25 })
      );
      world.add(line);
      edges.push({ a, b, line, base: color.clone() });
    };

    for (const [m, atoms] of Object.entries(USES)) for (const a of atoms) tie(m, a, dim);
    for (const [a, toks] of Object.entries(READS))
      for (const t of toks) tie(a, t, new THREE.Color(TOKENS.find((x) => x.id === t)!.hue));

    /* ── 조작 ─────────────────────────────────────────── */
    let rx = 0.22;
    let ry = 0.5;
    let dist = 760;
    let aim = { rx, ry, dist };
    let drag: { x: number; y: number; rx: number; ry: number } | null = null;
    let idle = performance.now();

    const resize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      gl.setSize(w, h, false);
      labels.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();

    const onDown = (e: PointerEvent) => {
      el.setPointerCapture(e.pointerId);
      drag = { x: e.clientX, y: e.clientY, rx: aim.rx, ry: aim.ry };
    };
    const onMove = (e: PointerEvent) => {
      idle = performance.now();
      if (drag) {
        aim.ry = drag.ry + (e.clientX - drag.x) * 0.006;
        aim.rx = Math.max(-0.55, Math.min(1.1, drag.rx + (e.clientY - drag.y) * 0.006));
        return;
      }
      const r = el.getBoundingClientRect();
      ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(nodes.map((n) => n.mesh), false)[0];
      const id = hit ? (hit.object.userData.id as string) : null;
      if (id !== focus.current) setName(id);
    };
    const onUp = () => {
      drag = null;
      idle = performance.now();
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      idle = performance.now();
      aim.dist = Math.max(380, Math.min(1400, aim.dist + e.deltaY * 0.7));
    };

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    el.addEventListener('wheel', onWheel, { passive: false });

    /* 짚은 것에 닿는 이름들 */
    const reach = (id: string) => {
      const s = new Set<string>([id]);
      for (const a of USES[id] ?? []) {
        s.add(a);
        for (const t of READS[a] ?? []) s.add(t);
      }
      for (const t of READS[id] ?? []) s.add(t);
      for (const [m, atoms] of Object.entries(USES)) if (atoms.includes(id)) s.add(m);
      if (TOKENS.some((t) => t.id === id))
        for (const [a, toks] of Object.entries(READS)) {
          if (!toks.includes(id)) continue;
          s.add(a);
          for (const [m, atoms] of Object.entries(USES)) if (atoms.includes(a)) s.add(m);
        }
      return s;
    };

    let raf = 0;
    const tick = () => {
      /* 손을 뗀 지 오래면 스스로 돈다 — 멈춰 있으면 물건이 죽어 보인다 */
      if (!drag && performance.now() - idle > 2400) aim.ry += 0.0014;

      ry += (aim.ry - ry) * 0.08;
      rx += (aim.rx - rx) * 0.08;
      dist += (aim.dist - dist) * 0.08;

      world.rotation.y = ry;
      world.rotation.x = rx;
      camera.position.set(0, 40, dist);
      camera.lookAt(0, 0, 0);

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
        const mat = n.mesh.material as THREE.MeshBasicMaterial;
        const want = !lit || lit.has(n.id) ? 1 : 0.08;
        mat.opacity += (want - mat.opacity) * 0.2;
        n.tag.style.opacity = String(mat.opacity < 0.3 ? 0 : mat.opacity);
        n.tag.dataset.on = String(n.id === f);
      }

      gl.render(scene, camera);
      labels.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
      el.removeEventListener('wheel', onWheel);
      gl.dispose();
      el.removeChild(gl.domElement);
      el.removeChild(labels.domElement);
    };
  }, []);

  return (
    <div className='relative h-screen w-full overflow-hidden bg-surface text-onsurface'>
      <style>{`
        .ds-node {
          font-family: var(--font-mono, ui-monospace, monospace);
          font-size: 10px;
          letter-spacing: .06em;
          white-space: nowrap;
          color: rgb(var(--color-subtle));
          transition: color .15s;
        }
        .ds-node--mol { font-size: 11px; font-weight: 700; color: rgb(var(--color-onsurface)); }
        .ds-node--tok { font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .ds-node[data-on="true"] { color: rgb(var(--color-primary)); }
      `}</style>

      <div ref={host} className='h-full w-full cursor-grab active:cursor-grabbing' />

      <div className='pointer-events-none absolute left-10 top-10 font-mono text-[10.5px] leading-[2] tracking-[0.16em] text-subtle'>
        <div>03 MOLECULES {MOLECULES.length}</div>
        <div>02 ATOMS {ATOMS.length}</div>
        <div>01 TOKENS {TOKENS.length}</div>
      </div>

      <p className='pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.22em] text-subtle opacity-70'>
        DRAG · WHEEL · HOVER
      </p>
    </div>
  );
}
