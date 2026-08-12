"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

/**
 * nohsJam — 만질 수 있는 판.
 *
 * 조각을 집어 옮기고, 여럿을 골라 함께 키우고 돌리고, 펜으로 긋고, 스티커를
 * 찍고, 쪽지를 붙인다. 되돌리기와 «처음으로» 가 있다. 서버는 관여하지
 * 않는다 — 전부 이 파일 안의 클라이언트 상태고, 새로고침하면 처음 배치로
 * 돌아온다.
 *
 * 좌표계가 하나뿐이라는 점이 중요하다. 조각은 판 좌표(px)로만 살고, 확대·이동은
 * 감싼 레이어의 transform 이 맡는다. 그래서 끌기 계산이 «화면 이동량 / scale»
 * 한 번으로 끝난다 — 확대해도 손끝과 물체가 안 어긋난다.
 *
 * 판 위에 무엇을 얹을지는 소비처가 정한다. 이 파일이 주는 것은 판과, 판 위에서
 * 사는 법(Item)과, 보편적인 조각들(쪽지·스티커·펜)뿐이다. 화면마다 다른 구조
 * 조각(예: 파이프라인 프레임)은 소비처가 Item 을 둘러 직접 만든다.
 */

export interface Point {
  x: number;
  y: number;
}
export interface Size {
  w: number;
  h: number;
}

interface BoardCtx {
  positions: Record<string, Point>;
  sizes: Record<string, Size>;
  selected: Set<string>;
  scale: number;
  isDenied: (id: string) => boolean;
  spinOf: (id: string) => number;
  /** 코너를 끌어 크기 바꾸기 — 반대쪽 모서리를 붙박이로 둔다 */
  beginResize: (id: string, corner: Corner, e: ReactPointerEvent) => void;
  /** 코너 «바깥» 을 끌어 돌리기 */
  beginRotate: (id: string, e: ReactPointerEvent) => void;
  scaleOf: (id: string) => number;
  setScale: (id: string, s: number) => void;
  tool: "select" | "pen" | "sticker";
  reportSize: (id: string, size: Size) => void;
  registerInitial: (id: string, at: Point) => void;
  registerPanel: (id: string, title: string, node: ReactNode) => void;
  /** 판에 미리 그려 두는 펜 획 — 지울 수 있지만 «처음으로» 하면 돌아온다 */
  registerInk: (stroke: Stroke) => void;
  focusPanel: (id: string) => void;
  hasPanel: (id: string) => boolean;
  beginDrag: (id: string, e: ReactPointerEvent, opens?: string) => void;
  isSelected: (id: string) => boolean;
  /** 여럿을 함께 골랐는가 — 그때는 개별 손잡이 대신 흐린 선만 그린다 */
  multi: boolean;
}

const Ctx = createContext<BoardCtx | null>(null);

/*
  돌아가기 링크는 글 묶음(Forge·Flow·Wiki)이 아는 정보다. MDX 는 모르므로
  껍데기(NoteLayout)가 감싸서 알려주고, 막대가 그걸 받아 한 줄에 같이 건다.
*/
const ChromeCtx = createContext<{ backHref?: string; backLabel?: string }>({});

export function BoardChrome({
  backHref,
  backLabel,
  children,
}: {
  backHref?: string;
  backLabel?: string;
  children: ReactNode;
}) {
  const v = useMemo(() => ({ backHref, backLabel }), [backHref, backLabel]);
  return <ChromeCtx.Provider value={v}>{children}</ChromeCtx.Provider>;
}

function useBoard() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("Board 안에서만 쓸 수 있습니다");
  return ctx;
}

/** "40,60" → {x:40,y:60} */
function parseAt(at?: string): Point {
  if (!at) return { x: 0, y: 0 };
  const [x, y] = at.split(",").map((n) => parseFloat(n.trim()));
  return { x: Number.isFinite(x) ? x : 0, y: Number.isFinite(y) ? y : 0 };
}

/* 마커 색 — 판 위에 얹히는 것이라 두 테마 모두에서 같은 색으로 보인다 */
const INKS = [
  "#E4483F",
  "#2C6BE4",
  "#1F9D57",
  "#E0961B",
  "#8B49D6",
  "#2C3038",
] as const;

/** 보는 사람이 얹은 것 — 쪽지(글)와 스티커(그림) 둘 다 같은 규칙으로 다룬다 */
export interface UserPiece {
  id: string;
  kind: "note" | "sticker";
  x: number;
  y: number;
  /** kind === 'note' */
  text?: string;
  color?: string;
  /** kind === 'sticker' */
  glyph?: string;
  /** 붙일 때 정해지는 기울기(도) */
  tilt?: number;
}

export interface Stroke {
  id: string;
  color: string;
  pts: Point[];
}

/**
 * 순번에서 -8°~8° 사이 기울기를 뽑는다.
 *
 * seq 에 상수를 곱해 나머지를 취하면 -7,-5,-3 처럼 규칙적으로 늘어서서
 * «흩어 놓은» 것으로 안 보인다. 곱셈 해시로 한 번 섞는다. 진짜 난수를
 * 쓰지 않는 건 같은 판이 늘 같은 모습이어야 하기 때문이다.
 */
function scatter(seq: number): number {
  let h = Math.imul(seq + 1, 2654435761) >>> 0;
  h ^= h >>> 13;
  return (h % 1700) / 100 - 8.5;
}

/** 점을 부드러운 곡선으로 잇는다 — 꺾인 폴리라인은 «손으로 그린 것» 으로 안 읽힌다 */
function toPath(pts: Point[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i].x + pts[i + 1].x) / 2;
    const my = (pts[i].y + pts[i + 1].y) / 2;
    d += ` Q ${pts[i].x} ${pts[i].y} ${mx} ${my}`;
  }
  const last = pts[pts.length - 1];
  d += ` L ${last.x} ${last.y}`;
  return d;
}

/* 손그림 화살표에 쓰는 마커 색 — 판 위에 얹히므로 두 테마에서 같은 색이다 */
const MARKER = {
  orange: "#F0932B",
  blue: "#3B82F6",
  green: "#22A06B",
  red: "#EF5350",
  violet: "#9B6BEA",
  pink: "#EC4899",
  ink: "#5B6472",
} as const;

/* 글 패널 — 하한보다 조금 넓게 열어 둔다. 이보다 좁으면 본문 표가 무너진다 */
const PANEL_MIN = 380;
/*
  처음에는 «가장 좁게» 연다.

  기본을 하한보다 넓게 잡았더니 캔버스가 그만큼 줄어, 1440 짜리 화면에서
  판이 1배로 안 들어갔다(패널 440 → 캔버스 1000 → 0.95배). 글은 넓히고
  싶으면 손잡이로 넓히면 되지만, 판이 처음부터 줄어 보이는 것은 되돌릴 수 없다.
*/
const PANEL_DEFAULT = PANEL_MIN;

/*
  보는 사람이 붙이는 쪽지의 색. board.tsx 의 TONE 을 가져오면 순환 참조가 되므로
  (board.tsx 가 이 파일을 가져간다) 노란 포스트잇 한 벌만 여기 둔다.
*/
/* 스티커 — FigJam 의 스탬프처럼 «한마디» 를 대신한다 */
const STICKERS = [
  "👍",
  "🔥",
  "✨",
  "❤️",
  "🎯",
  "⚡",
  "💡",
  "❓",
  "✅",
  "⚠️",
  "🙌",
  "😂",
] as const;

const PAPERS = [
  "#FFE9A3",
  "#FFC9DD",
  "#B3DCFF",
  "#B2E5BF",
  "#DCC9FF",
  "#FFD1A8",
] as const;
const PAPER_INK = "#232629";

/* 격자 한 칸과 점 반지름 (판 좌표 기준 — 화면에서는 배율만큼 커진다) */
const GRID = 22;
const GRID_DOT = 1.1;

export type Corner = "nw" | "ne" | "sw" | "se";

/** 되돌리기 한 벌 — 판에서 «바뀌는 것» 전부 */
interface Snapshot {
  positions: Record<string, Point>;
  scales: Record<string, number>;
  spins: Record<string, number>;
  notes: UserPiece[];
  strokes: Stroke[];
}

/*
  변형 커서.

  OS 에는 «돌린다» 를 뜻하는 커서가 없다. 회전만 커스텀하면 크기 조절
  커서와 결이 달라 보이므로 넷 다 직접 그린다. 흰 테두리를 깔고 그 위에
  검은 선을 얹어 어떤 배경에서도 읽히게 했다.
*/
function cursor(body: string): string {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 22 22'>` +
    `<g fill='none' stroke='white' stroke-width='3.6' stroke-linecap='round' stroke-linejoin='round'>${body}</g>` +
    `<g fill='none' stroke='%23111' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'>${body}</g>` +
    `</svg>`;
  return `url("data:image/svg+xml;utf8,${svg}") 11 11, auto`;
}

const CURSOR = {
  /* ↖↘ */
  nwse: cursor(
    "<path d='M5.5 5.5 L16.5 16.5'/><path d='M5.5 10.8 V5.5 H10.8'/><path d='M16.5 11.2 V16.5 H11.2'/>",
  ),
  /* ↗↙ */
  nesw: cursor(
    "<path d='M16.5 5.5 L5.5 16.5'/><path d='M11.2 5.5 H16.5 V10.8'/><path d='M10.8 16.5 H5.5 V11.2'/>",
  ),
  /* 굽은 화살표 */
  spin: cursor(
    "<path d='M4.8 13.4a7 7 0 1 0 1.4-6.2'/><path d='M3.1 4.3 V8.9 H7.7'/>",
  ),
} as const;

/*
  판이 그리는 것은 전부 같은 파랑을 쓴다 — 선택 테두리·손잡이·구조선.

  «이건 판이 그린 것» 이라는 신호를 색 하나로 통일하면, 사람이 남긴 것
  (마커 획 · 포스트잇 · 스티커)과 한눈에 갈린다. 회색으로 두면 조각의
  테두리·그림자와 섞여 무엇이 구조인지 흐려진다.
*/
const SYSTEM = "#2C8CF5";
const LINE = SYSTEM;

/* 스티커 한 변 — 상자와 글리프를 같은 크기로 둔다 */
const STICKER = 46;

const MIN_ZOOM = 0.3;
const MAX_ZOOM = 2.5;
const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

/* ── Board ──────────────────────────────────────────────────── */

export interface BoardProps {
  children: ReactNode;
  /**
   * 오른쪽 글에 입힐 클래스. 판은 서체를 정하지 않는다 — 소비처의 본문
   * 조판을 그대로 쓰라고 통로만 낸다.
   */
  proseClassName?: string;
  /** 아이템이 놓인 영역(px) — 처음 열 때 이 영역이 화면에 들어오도록 맞춘다 */
  width?: string | number;
  height?: string | number;
}

export function Board({
  children,
  proseClassName = "",
  width = 1200,
  height = 900,
}: BoardProps) {
  const baseW = typeof width === "string" ? parseFloat(width) : width;
  const baseH = typeof height === "string" ? parseFloat(height) : height;

  const [positions, setPositions] = useState<Record<string, Point>>({});
  const [sizes, setSizes] = useState<Record<string, Size>>({});
  /* 조각마다의 확대 배율 — 판의 조각이든 얹은 조각이든 똑같이 키운다 */
  const [scales, setScales] = useState<Record<string, number>>({});
  /* 조각마다의 회전각(도) — 기울기는 --tilt(원래 각), 여기는 손으로 돌린 각 */
  const [spins, setSpins] = useState<Record<string, number>>({});
  /* 지울 수 없는 조각에 삭제를 시도했을 때 «안 된다» 를 몸으로 알려 줄 대상 */
  const [denied, setDenied] = useState<Set<string>>(new Set());
  const denyTimer = useRef(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const stampRef = useRef<string | null>(null);
  const stampFnRef = useRef<((x: number, y: number) => void) | null>(null);
  const [view, setView] = useState({ x: 0, y: 0, z: 1 });
  const [marquee, setMarquee] = useState<{ a: Point; b: Point } | null>(null);
  const [panels, setPanels] = useState<
    { id: string; title: string; node: ReactNode }[]
  >([]);
  const [active, setActive] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const touchedRef = useRef(false);
  const [grabbing, setGrabbing] = useState(false);
  /* 오른쪽 글 패널 폭 — 400 이 하한이다. 그보다 좁으면 표가 무너진다 */
  const [panelW, setPanelW] = useState(PANEL_DEFAULT);
  const [wide, setWide] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [tool, setTool] = useState<"select" | "pen" | "sticker">("select");
  /* 손에 쥔 스탬프 — 고르면 커서에 물리고, 누르는 자리마다 계속 찍힌다 */
  const [stamp, setStamp] = useState<string | null>(null);
  const [stampAt, setStampAt] = useState<Point | null>(null);
  /* 막대 위에 손이 올라가 있는 동안은 쥔 스탬프를 잠깐 감춘다 */
  const [overChrome, setOverChrome] = useState(false);

  /*
    도구 바꾸기는 한 곳에서만.

    setTool 을 곳곳에서 직접 부르면 «스탬프를 쥔 채 화살표 도구로 갔는데
    여전히 찍히는» 일이 생긴다. 손에 쥔 것을 내려놓는 일까지 여기서 함께
    한다 — Esc 로만 벗어나지는 건 도구 막대를 못 믿게 만든다.
  */
  const chooseTool = useCallback((t: "select" | "pen" | "sticker") => {
    setTool(t);
    if (t !== "sticker") {
      setStamp(null);
      setStampAt(null);
    }
  }, []);
  const [inkColor, setInkColor] = useState<string>(INKS[0]);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [live, setLive] = useState<Stroke | null>(null);
  /* 보는 사람이 직접 붙인 쪽지. 저장하지 않는다 — 펜 낙서와 같은 급이다 */
  const [notes, setNotes] = useState<UserPiece[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  /*
    편집 확정. blur 하나에만 기대면 위험하다 — 창이 포커스를 잃은 상태 등
    blur 가 오지 않는 경우가 있고, 그러면 쪽지가 편집 상태로 갇힌다.
    글자는 칠 때마다 상태에 넣어 두고, 여기서는 «끝났다» 만 처리한다.
  */
  const editingRef = useRef<string | null>(null);
  const finishEditing = useCallback(() => {
    const cur = editingRef.current;
    if (!cur) return;
    editingRef.current = null;
    setEditing(null);
    /* 빈 채로 둔 쪽지는 «붙이지 않은 것» 으로 본다 */
    setNotes((all) => all.filter((x) => x.id !== cur || (x.text ?? "").trim()));
  }, []);
  const noteSeq = useRef(0);
  const inkSeq = useRef(0);

  const initial = useRef<Record<string, Point>>({});
  const viewport = useRef<HTMLDivElement>(null);
  const panelScroll = useRef<HTMLElement>(null);
  const home = useRef({ x: 0, y: 0, z: 1 });
  /* 리사이즈 비율을 재려면 «직전 폭» 이 필요하다 */
  const prevW = useRef(0);
  /* 손으로 배율을 만졌는지 — 만졌으면 리사이즈가 1 을 넘겨 키워도 된다 */
  const zoomedByHand = useRef(false);
  const markTouched = () => {
    touchedRef.current = true;
    setTouched(true);
  };
  const viewRef = useRef(view);
  viewRef.current = view;
  /* 쥔 스탬프를 커서에 붙여 따라다니게 한다 — 무엇을 찍는지 보여야 한다 */
  useEffect(() => {
    if (!stamp) return;
    const move = (e: PointerEvent) => {
      setStampAt({ x: e.clientX, y: e.clientY });
      /*
        막대 위에서는 쥔 스탬프를 감춘다 — 커서 자리에 이모지가 떠 있으면
        버튼을 겨냥하기 어렵다. React 의 enter/leave 대신 «지금 커서 밑에
        무엇이 있나» 로 판정한다. 조각 위를 지날 때도 정확하고, 이벤트가
        어디서 시작됐는지에 좌우되지 않는다.
      */
      const under = document.elementFromPoint(e.clientX, e.clientY);
      setOverChrome(Boolean(under?.closest("[data-board-chrome]")));
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [stamp]);

  /* 좌우로 나뉘는 폭에서만 패널 크기를 조절한다 — 위아래로 쌓이면 폭이 곧 화면이다 */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const beginPanelResize = (e: ReactPointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const sx = e.clientX;
    const start = panelW;
    const max = Math.min(920, window.innerWidth * 0.62);
    const onMove = (ev: PointerEvent) =>
      setPanelW(Math.max(PANEL_MIN, Math.min(max, start - (ev.clientX - sx))));
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      document.body.style.cursor = "";
      setResizing(false);
    };
    setResizing(true);
    document.body.style.cursor = "col-resize";
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  /* 스페이스를 누르고 있는 동안만 «판 끌기» 로 바뀐다 (피그마·피그잼과 같게) */
  const spaceDown = useRef(false);
  const [panMode, setPanMode] = useState(false);

  /*
    처음 열 때 판이 화면 폭에 들어오게 맞춘다.

    «폭» 만 맞춘다. 높이까지 맞추려 들면 조각을 잘게 줄이거나 겹쳐 놓게
    되는데, 그러면 판이 판이 아니게 된다. 세로로 넘치는 만큼은 밀어서 본다 —
    화이트보드는 원래 화면보다 큰 물건이다.
  */
  const fitNow = useCallback(
    (el: HTMLElement) => {
      const pad = 24;
      /* 막대가 좌상단에 떠 있다 — 판이 그 아래에서 시작해야 제목을 가리지 않는다 */
      const padTop = 118;
      const z = clampZoom(Math.min((el.clientWidth - pad * 2) / baseW, 1));
      return { z, x: (el.clientWidth - baseW * z) / 2, y: padTop };
    },
    [baseW],
  );

  /*
    스탬프. 고른 스티커가 커서에 물려 다니고, 누를 때마다 그 자리에 찍힌다.
    한 장 찍고 도구가 풀리면 여러 장 붙일 때 팔레트를 매번 다시 열어야 한다 —
    피그잼이 그렇듯 Esc 로 손을 털 때까지 계속 쥐고 있는다.
  */
  const stampSticker = (cx: number, cy: number) => {
    const el = viewport.current;
    if (!el || !stamp) return;
    const rect = el.getBoundingClientRect();
    const v = viewRef.current;
    mark();
    const seq = noteSeq.current++;
    setNotes((n) => [
      ...n,
      {
        id: `sticker-${seq + 1}`,
        kind: "sticker" as const,
        glyph: stamp,
        /*
          반듯하게만 찍히면 «붙인 것» 이 아니라 «놓인 것» 처럼 보인다.
          순번에서 뽑아 -7°~7° 사이로 흩어 놓는다 — 진짜 난수를 쓰지 않는 건
          같은 판이 늘 같은 모습이어야 하기 때문이다.
        */
        tilt: scatter(seq),
        x: Math.round((cx - rect.left - v.x) / v.z - STICKER / 2),
        y: Math.round((cy - rect.top - v.y) / v.z - STICKER / 2),
      },
    ]);
    markTouched();
  };

  stampFnRef.current = stampSticker;

  /* 빈 곳을 두 번 누르면 그 자리에 쪽지가 붙는다 — 막대에 버튼을 늘리지 않는다 */
  const onCanvasDoubleClick = (e: ReactMouseEvent) => {
    if (tool !== "select") return;
    /*
      조각을 두 번 누른 것까지 «빈 곳» 으로 볼 수는 없다. dblclick 은
      아이템의 pointerdown 이 막아도 그대로 올라오므로 여기서 걸러낸다.
      뭔가 골라 둔 상태에서도 만들지 않는다 — 다루던 것이 있다는 뜻이다.
    */
    if (selectedRef.current.size > 0) return;
    if ((e.target as HTMLElement)?.closest("[data-board-item]")) return;
    const el = viewport.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    /* 첫 장은 노랑에서 시작한다 — 번호를 올리기 «전» 값이 곧 색 순번이다 */
    mark();
    const seq = noteSeq.current++;
    const id = `note-${seq + 1}`;
    setNotes((n) => [
      ...n,
      {
        id,
        kind: "note" as const,
        /* 누른 지점이 쪽지의 «가운데» 로 오게 반 칸 당긴다 */
        x: Math.round(
          (e.clientX - rect.left - viewRef.current.x) / viewRef.current.z - 100,
        ),
        y: Math.round(
          (e.clientY - rect.top - viewRef.current.y) / viewRef.current.z - 44,
        ),
        text: "",
        /* 붙일 때마다 색이 한 칸씩 넘어간다 — 여러 장 붙여도 구분된다 */
        color: PAPERS[seq % PAPERS.length],
      },
    ]);
    editingRef.current = id;
    setEditing(id);
  };

  /*
    캔버스 폭이 바뀔 때 판을 어떻게 다룰지 — 한 곳에서만 정한다.

    첫 호출이면 화면에 맞춘다. 그 뒤로는 폭이 변한 «비율만큼» 배율과 위치를
    함께 곱한다. 배율을 그대로 두면 판이 잘려 나가고, 매번 새로 맞추면
    사용자가 잡아 놓은 배율이 날아간다 — 비율로 곱하면 둘 다 산다.

    (x 를 비율로 곱하면 가운데 정렬이 저절로 유지된다:
     가운데일 때 x = (W - bw·z)/2 이므로 W·r 에서는 r·x 가 곧 가운데다.)
  */
  const applyWidth = useCallback(() => {
    const el = viewport.current;
    if (!el) return;
    const w = el.clientWidth;
    if (!w) return;

    if (!prevW.current) {
      prevW.current = w;
      const first = fitNow(el);
      home.current = first;
      setView(first);
      return;
    }

    const prev = prevW.current;
    if (w === prev) return;
    prevW.current = w;

    /*
      아직 판을 만지지 않았으면 «다시 맞춘다».

      비율로만 따라가면 첫 배치가 흔들린다 — 글 패널은 Panel 이 등록된 뒤에야
      붙는데, 그때 캔버스가 좁아지는 것을 «사용자가 폭을 줄였다» 로 읽어
      배율을 그만큼 깎았다(2560 → 2120 이 그대로 0.83 이 됐다).

      손을 댄 뒤에는 비율로 따라간다 — 잡아 놓은 배율을 지키면서도 반응해야
      하기 때문이다.
    */
    if (!touchedRef.current) {
      const fresh = fitNow(el);
      home.current = fresh;
      setView(fresh);
      return;
    }

    const ratio = w / prev;

    setView((v) => {
      /* 손으로 배율을 만진 적이 없으면 1 을 넘겨 키우지 않는다 */
      const cap = zoomedByHand.current ? MAX_ZOOM : 1;
      return {
        z: Math.min(cap, clampZoom(v.z * ratio)),
        x: v.x * ratio,
        y: v.y,
      };
    });
    home.current = fitNow(el);
  }, [fitNow]);

  /*
    첫 맞춤은 한 박자 뒤에 한다. 레이아웃 이펙트 시점에는 패널 폭이 아직
    확정되지 않아 캔버스가 실제보다 좁게 잡히고, 그 값으로 맞추면 판이
    하한(30%)까지 쪼그라든 채로 열린다 — 실제로 그렇게 열렸다.
  */
  useLayoutEffect(() => {
    const t = window.setTimeout(applyWidth, 0);
    return () => window.clearTimeout(t);
  }, [applyWidth]);

  /*
    패널을 끌어 넓히는 것은 «우리가 아는 사건» 이다 — 관찰자에 맡기지 않고
    바로 반영한다. ResizeObserver 는 창 크기 변경처럼 밖에서 오는 변화만
    맡는다 (숨은 탭에서는 관찰자 콜백이 오지 않기도 한다).
  */
  useEffect(() => {
    applyWidth();
  }, [panelW, wide, applyWidth]);

  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const ro = new ResizeObserver(() => applyWidth());
    ro.observe(el);
    return () => ro.disconnect();
  }, [applyWidth]);

  const registerInitial = useCallback((id: string, at: Point) => {
    if (initial.current[id]) return;
    initial.current[id] = at;
    setPositions((p) => (p[id] ? p : { ...p, [id]: at }));
  }, []);

  const reportSize = useCallback((id: string, size: Size) => {
    setSizes((s) =>
      s[id] && s[id].w === size.w && s[id].h === size.h
        ? s
        : { ...s, [id]: size },
    );
  }, []);

  /* 문서에 적은 순서대로 쌓인다 — MDX 의 Panel 순서가 곧 읽는 순서다 */
  /*
    미리 그려 둔 낙서.

    판을 처음 열었을 때 아무 손자국도 없으면 «만질 수 있다» 가 안 보인다.
    밑줄 하나, 동그라미 하나가 그걸 대신 말해 준다. 다만 «판이 그린 구조» 가
    아니라 «사람이 그은 획» 이므로 지울 수 있어야 한다 — 초기 배치의 일부라
    처음으로 를 누르면 돌아온다.
  */
  const seedInk = useRef<Record<string, Stroke>>({});
  const registerInk = useCallback((stroke: Stroke) => {
    if (seedInk.current[stroke.id]) return;
    seedInk.current[stroke.id] = stroke;
    setStrokes((prev) =>
      prev.some((x) => x.id === stroke.id) ? prev : [...prev, stroke],
    );
  }, []);

  const registerPanel = useCallback(
    (id: string, title: string, node: ReactNode) => {
      setPanels((p) =>
        p.some((x) => x.id === id) ? p : [...p, { id, title, node }],
      );
    },
    [],
  );

  /*
    조각을 누르면 오른쪽 글에서 그 대목으로 데려간다.

    누른 «순간» 에 스크롤을 걸면 같은 렌더 안에서 상태가 바뀌며 씹힌다 —
    표시만 해두고 실제 이동은 그려진 뒤에 한다. 같은 조각을 다시 눌러도
    한 번 더 데려가야 하므로 횟수(n)를 함께 센다.
  */
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [focus, setFocus] = useState<{ id: string; n: number } | null>(null);
  const focusPanel = useCallback((id: string) => {
    setActive(id);
    setFocus((f) => ({ id, n: (f?.n ?? 0) + 1 }));
  }, []);

  const scrollAnim = useRef(0);
  useEffect(() => {
    if (!focus) return;
    const el = sectionRefs.current[focus.id];
    const box = panelScroll.current;
    if (!el || !box) return;

    const from = box.scrollTop;
    const to = Math.max(
      0,
      Math.min(
        box.scrollHeight - box.clientHeight,
        el.getBoundingClientRect().top -
          box.getBoundingClientRect().top +
          from -
          12,
      ),
    );
    if (Math.abs(to - from) < 2) return;

    /*
      직접 굴린다. 애니메이션 id 는 ref 에 둔다 — effect 정리 함수로 취소하면
      리렌더 한 번에 스크롤이 멈춰 «눌러도 안 간다» 가 된다(그렇게 한참 헤맸다).
      거리에 비례하되 상한을 둔다.
    */
    cancelAnimationFrame(scrollAnim.current);
    const dur = Math.min(560, 200 + Math.abs(to - from) * 0.22);
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    let t0 = 0;
    let started = false;
    const step = (now: number) => {
      started = true;
      if (!t0) t0 = now;
      const t = Math.min(1, (now - t0) / dur);
      box.scrollTop = from + (to - from) * ease(t);
      if (t < 1) scrollAnim.current = requestAnimationFrame(step);
    };
    scrollAnim.current = requestAnimationFrame(step);

    /*
      숨은 탭에서는 rAF 가 아예 돌지 않는다 — 그러면 «눌렀는데 안 갔다» 가 된다.
      한 박자 뒤에도 시작이 안 됐으면 그냥 목적지로 옮긴다. 보고 있지 않은
      화면에서 굳이 굴릴 이유도 없다.
    */
    const guard = window.setTimeout(() => {
      if (!started) box.scrollTop = to;
    }, 220);
    return () => window.clearTimeout(guard);
  }, [focus]);

  stampRef.current = stamp;
  const notesRef = useRef(notes);
  notesRef.current = notes;
  const strokesRef = useRef(strokes);
  strokesRef.current = strokes;
  const positionsRef = useRef(positions);
  positionsRef.current = positions;
  const scalesRef = useRef(scales);
  scalesRef.current = scales;
  const spinsRef = useRef(spins);
  spinsRef.current = spins;

  /*
    되돌리기.

    판의 «바뀌는 것» 은 다섯 가지(자리·배율·각도·쪽지·획)뿐이라, 손을 대기
    «직전» 에 그 다섯 벌을 통째로 찍어 두는 편이 각 동작마다 역연산을
    적어 두는 것보다 짧고 틀릴 데가 없다. 판이 크지 않아 비용도 눈에 안 띈다.
  */
  const snapshot = useCallback(
    (): Snapshot => ({
      positions: { ...positionsRef.current },
      scales: { ...scalesRef.current },
      spins: { ...spinsRef.current },
      notes: [...notesRef.current],
      strokes: [...strokesRef.current],
    }),
    [],
  );

  const apply = useCallback((snap: Snapshot) => {
    setPositions(snap.positions);
    setScales(snap.scales);
    setSpins(snap.spins);
    setNotes(snap.notes);
    setStrokes(snap.strokes);
    setSelected(new Set());
    setEditing(null);
    editingRef.current = null;
  }, []);

  const [past, setPast] = useState<Snapshot[]>([]);
  const [future, setFuture] = useState<Snapshot[]>([]);
  const pastRef = useRef(past);
  pastRef.current = past;
  const futureRef = useRef(future);
  futureRef.current = future;

  /** 무언가 바꾸기 «직전» 에 부른다 */
  const mark = useCallback(() => {
    const snap = snapshot();
    /* 40 벌이면 충분하다 — 판을 어지르는 손짓이 그보다 길게 이어지지 않는다 */
    setPast((p) => [...p, snap].slice(-40));
    setFuture([]);
    /*
      여기서 markTouched() 를 부르지 않는다. 그 플래그는 «화면을 밀거나
      확대했는가» 만 센다 — 내용 변경까지 섞으면 되돌리기로 처음 모습에
      돌아와도 «처음으로» 가 계속 켜져 있게 된다.
    */
  }, [snapshot]);

  /*
    스냅샷은 «지금» 찍어서 넘긴다.

    setFuture((f) => [snapshot(), ...f]) 처럼 업데이터 «안» 에서 찍으면 그
    함수는 다음 렌더에 실행되는데, 그때 ref 는 이미 apply() 가 되돌려 놓은
    상태를 가리킨다 — 되돌리기 직전 모습이 아니라 되돌린 뒤 모습이 쌓여
    «다시 하기» 가 제자리걸음을 했다.
  */
  const undo = useCallback(() => {
    const p = pastRef.current;
    if (!p.length) return;
    const now = snapshot();
    setFuture((f) => [now, ...f]);
    setPast(p.slice(0, -1));
    apply(p[p.length - 1]);
  }, [snapshot, apply]);

  const redo = useCallback(() => {
    const f = futureRef.current;
    if (!f.length) return;
    const now = snapshot();
    setPast((p) => [...p, now]);
    setFuture(f.slice(1));
    apply(f[0]);
  }, [snapshot, apply]);

  const scaleOf = useCallback((id: string) => scales[id] ?? 1, [scales]);
  const setScale = useCallback((id: string, v: number) => {
    setScales((m) => ({ ...m, [id]: v }));
    markTouched();
  }, []);

  const spinOf = useCallback((id: string) => spins[id] ?? 0, [spins]);
  const setSpin = useCallback((id: string, v: number) => {
    setSpins((m) => ({ ...m, [id]: v }));
    markTouched();
  }, []);

  /*
    변형(크기·회전)은 판이 맡는다. 조각 하나가 스스로 처리하면 여럿을 함께
    잡았을 때 각자 제 가운데를 축으로 삼아 뿔뿔이 흩어진다 — 축은 «고른 것
    전체» 에서 나와야 한다.
  */
  const boxesOf = useCallback(
    (ids: string[]) =>
      ids
        .map((id) => {
          const p = positions[id];
          const sz = sizes[id];
          if (!p || !sz) return null;
          const k = scales[id] ?? 1;
          /*
            변형 기준점은 «가운데» 다(회전이 제자리에서 돌아야 하므로).
            그래서 배율 k 인 조각의 «보이는» 왼쪽 위는 좌표 그대로가 아니라
            가운데를 붙잡은 채 양옆으로 퍼진 자리다.
          */
          return {
            id,
            x: p.x - (sz.w * (k - 1)) / 2,
            y: p.y - (sz.h * (k - 1)) / 2,
            w: sz.w * k,
            h: sz.h * k,
            lw: sz.w,
            lh: sz.h,
            k,
            spin: spins[id] ?? 0,
          };
        })
        .filter(Boolean) as {
        id: string;
        x: number;
        y: number;
        w: number;
        h: number;
        lw: number;
        lh: number;
        k: number;
        spin: number;
      }[],
    [positions, sizes, scales, spins],
  );

  const targetsOf = useCallback(
    (id: string) =>
      selectedRef.current.has(id) ? [...selectedRef.current] : [id],
    [],
  );

  const beginResize = useCallback(
    (id: string, corner: Corner, e: ReactPointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      mark();
      const boxes = boxesOf(targetsOf(id));
      if (!boxes.length) return;

      /* 고른 것 전체를 감싸는 상자 — 붙박이는 «끄는 코너의 반대편» 이다 */
      const x0 = Math.min(...boxes.map((b) => b.x));
      const y0 = Math.min(...boxes.map((b) => b.y));
      const x1 = Math.max(...boxes.map((b) => b.x + b.w));
      const y1 = Math.max(...boxes.map((b) => b.y + b.h));
      const anchor = {
        x: corner === "nw" || corner === "sw" ? x1 : x0,
        y: corner === "nw" || corner === "ne" ? y1 : y0,
      };

      const el = viewport.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const toCanvas = (cx: number, cy: number) => ({
        x: (cx - rect.left - viewRef.current.x) / viewRef.current.z,
        y: (cy - rect.top - viewRef.current.y) / viewRef.current.z,
      });
      const start = toCanvas(e.clientX, e.clientY);
      const d0 = Math.hypot(start.x - anchor.x, start.y - anchor.y) || 1;
      /* 원래 크기가 하한 — 어느 하나라도 1 밑으로 내려가면 거기서 멈춘다 */
      const fMin = Math.max(...boxes.map((b) => 1 / b.k));
      const fMax = Math.min(...boxes.map((b) => 3 / b.k));

      const onMove = (ev: PointerEvent) => {
        const p = toCanvas(ev.clientX, ev.clientY);
        const f = Math.min(
          fMax,
          Math.max(fMin, Math.hypot(p.x - anchor.x, p.y - anchor.y) / d0),
        );
        setScales((m) => {
          const next = { ...m };
          for (const b of boxes) next[b.id] = Math.round(b.k * f * 1000) / 1000;
          return next;
        });
        setPositions((m) => {
          const next = { ...m };
          for (const b of boxes) {
            const k2 = b.k * f;
            /* 보이는 자리를 정한 뒤, 가운데 기준점을 감안해 좌표로 되돌린다 */
            next[b.id] = {
              x: Math.round(
                anchor.x + (b.x - anchor.x) * f + (b.lw * (k2 - 1)) / 2,
              ),
              y: Math.round(
                anchor.y + (b.y - anchor.y) * f + (b.lh * (k2 - 1)) / 2,
              ),
            };
          }
          return next;
        });
        markTouched();
      };
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [boxesOf, targetsOf, mark],
  );

  const beginRotate = useCallback(
    (id: string, e: ReactPointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      mark();
      const boxes = boxesOf(targetsOf(id));
      if (!boxes.length) return;

      const x0 = Math.min(...boxes.map((b) => b.x));
      const y0 = Math.min(...boxes.map((b) => b.y));
      const x1 = Math.max(...boxes.map((b) => b.x + b.w));
      const y1 = Math.max(...boxes.map((b) => b.y + b.h));
      const pivot = { x: (x0 + x1) / 2, y: (y0 + y1) / 2 };

      const el = viewport.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const angle = (cx: number, cy: number) => {
        const x = (cx - rect.left - viewRef.current.x) / viewRef.current.z;
        const y = (cy - rect.top - viewRef.current.y) / viewRef.current.z;
        return (Math.atan2(y - pivot.y, x - pivot.x) * 180) / Math.PI;
      };
      const a0 = angle(e.clientX, e.clientY);

      const onMove = (ev: PointerEvent) => {
        let d = angle(ev.clientX, ev.clientY) - a0;
        /* 15° 눈금에 3° 안쪽이면 붙잡아 준다 — 반듯하게 맞추려는 손을 돕는다 */
        const snapped = Math.round(d / 15) * 15;
        if (Math.abs(d - snapped) < 3) d = snapped;
        const rad = (d * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        setSpins((m) => {
          const next = { ...m };
          for (const b of boxes)
            next[b.id] = Math.round((b.spin + d) * 10) / 10;
          return next;
        });
        /* 여럿이면 각자 제자리에서만 도는 게 아니라 «무리째» 돌아야 한다 */
        if (boxes.length > 1) {
          setPositions((m) => {
            const next = { ...m };
            for (const b of boxes) {
              /* 기준점이 가운데라 «보이는 가운데» 는 좌표 + 원래 크기의 절반이다 */
              const cx = b.x + b.w / 2 - pivot.x;
              const cy = b.y + b.h / 2 - pivot.y;
              next[b.id] = {
                x: Math.round(pivot.x + cx * cos - cy * sin - b.lw / 2),
                y: Math.round(pivot.y + cx * sin + cy * cos - b.lh / 2),
              };
            }
            return next;
          });
        }
        markTouched();
      };
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [boxesOf, targetsOf, mark],
  );

  const isSelected = useCallback((id: string) => selected.has(id), [selected]);
  const isDenied = useCallback((id: string) => denied.has(id), [denied]);
  const hasPanel = useCallback(
    (id: string) => panels.some((p) => p.id === id),
    [panels],
  );

  /* ── 조각 끌기 · 누르기 ──
     3px 안에서 손을 떼면 «누른 것» 으로 본다 — 서랍이 열린다.
     그보다 움직였으면 «옮긴 것» 이라 서랍을 열지 않는다. */
  const beginDrag = useCallback(
    (id: string, e: ReactPointerEvent, opens?: string) => {
      e.stopPropagation();
      /* 스탬프를 쥐고 있으면 조각 위에서도 «찍기» 가 먼저다 */
      if (stampRef.current) {
        stampFnRef.current?.(e.clientX, e.clientY);
        return;
      }
      /*
        무엇을 함께 끌지 «지금» 정한다.

        전에는 setSelected 의 업데이터 안에서 그룹을 계산했다. 그 함수는 다음
        렌더에 실행되는데 끌기는 그 전에 시작되므로, 여럿을 골라 놓고 끌어도
        누른 조각 하나만 움직였다. 선택 계산은 부르는 자리에서 끝낸다.

        규칙은 여느 편집기와 같다.
          이미 고른 것을 누르면   선택을 그대로 두고 «다 같이» 끈다
          안 고른 것을 누르면     그것만 골라 그것만 끈다
          shift·⌘ 로 누르면       선택에 넣고 빼기만 한다 (끌지 않는다)
      */
      const additive = e.shiftKey || e.metaKey;
      const prev = selectedRef.current;
      let group: string[];

      if (additive) {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelected(next);
        /* 넣고 빼는 동작이라 여기서 끌기까지 시작하지 않는다 */
        return;
      }

      const next = prev.has(id) ? new Set(prev) : new Set<string>([id]);
      group = [...next];
      setSelected(next);

      const sx = e.clientX;
      const sy = e.clientY;
      const origin = { ...positions };
      let moved = false;

      const onMove = (ev: PointerEvent) => {
        if (!moved && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 3) return;
        if (!moved) mark();
        moved = true;
        const dx = (ev.clientX - sx) / viewRef.current.z;
        const dy = (ev.clientY - sy) / viewRef.current.z;
        setPositions((p) => {
          const next = { ...p };
          for (const key of group) {
            const o = origin[key];
            if (o)
              next[key] = { x: Math.round(o.x + dx), y: Math.round(o.y + dy) };
          }
          return next;
        });
      };
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        if (!moved && opens) focusPanel(opens);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [positions, focusPanel, mark],
  );

  /* ── 빈 곳을 끌면 올가미 선택, 스페이스를 누른 채 끌면 판이 움직인다 ── */
  const onCanvasPointerDown = (e: ReactPointerEvent) => {
    finishEditing();
    if (stamp) {
      stampSticker(e.clientX, e.clientY);
      return;
    }
    const el = viewport.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const toCanvasPt = (cx: number, cy: number) => ({
      x: (cx - rect.left - viewRef.current.x) / viewRef.current.z,
      y: (cy - rect.top - viewRef.current.y) / viewRef.current.z,
    });

    /* 펜 — 판 좌표로 점을 모은다. 확대해도 선 굵기가 판에 붙어 있게 된다 */
    if (tool === "pen" && !spaceDown.current) {
      mark();
      const pts: Point[] = [toCanvasPt(e.clientX, e.clientY)];
      const color = inkColor;
      const id = `ink-${++inkSeq.current}`;
      setLive({ id, color, pts });
      markTouched();
      const onMove = (ev: PointerEvent) => {
        const p = toCanvasPt(ev.clientX, ev.clientY);
        const last = pts[pts.length - 1];
        /* 2px 안쪽 점은 버린다 — 손 떨림까지 담으면 선이 지저분해진다 */
        if (Math.hypot(p.x - last.x, p.y - last.y) < 2) return;
        pts.push(p);
        setLive({ id, color, pts: [...pts] });
      };
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        setLive(null);
        if (pts.length > 1) setStrokes((s) => [...s, { id, color, pts }]);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      return;
    }

    if (!spaceDown.current) {
      const toCanvas = (cx: number, cy: number) => ({
        x: (cx - rect.left - viewRef.current.x) / viewRef.current.z,
        y: (cy - rect.top - viewRef.current.y) / viewRef.current.z,
      });
      const a = toCanvas(e.clientX, e.clientY);
      /* shift 를 누르면 기존 선택에 더한다 */
      const keep = e.shiftKey ? new Set(selected) : new Set<string>();
      setSelected(keep);
      setMarquee({ a, b: a });

      const onMove = (ev: PointerEvent) => {
        const b = toCanvas(ev.clientX, ev.clientY);
        setMarquee({ a, b });
        const x1 = Math.min(a.x, b.x);
        const x2 = Math.max(a.x, b.x);
        const y1 = Math.min(a.y, b.y);
        const y2 = Math.max(a.y, b.y);
        const hit = new Set<string>(keep);
        for (const [id, p] of Object.entries(positions)) {
          const s = sizes[id];
          if (!s) continue;
          if (p.x < x2 && p.x + s.w > x1 && p.y < y2 && p.y + s.h > y1)
            hit.add(id);
        }
        setSelected(hit);
      };
      const onUp = () => {
        setMarquee(null);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      return;
    }

    setGrabbing(true);
    const sx = e.clientX;
    const sy = e.clientY;
    const o = { ...viewRef.current };
    const onMove = (ev: PointerEvent) => {
      markTouched();
      setView({ ...o, x: o.x + (ev.clientX - sx), y: o.y + (ev.clientY - sy) });
    };
    const onUp = () => {
      setGrabbing(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  /* 피그마와 같게 — 휠은 판을 밀고, ⌘/ctrl + 휠은 커서 밑을 중심으로 확대한다.
     페이지가 스크롤하지 않으므로 휠을 통째로 가져와도 갇히지 않는다. */
  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      markTouched();
      if (e.ctrlKey || e.metaKey) zoomedByHand.current = true;
      const rect = el.getBoundingClientRect();
      setView((v) => {
        if (e.ctrlKey || e.metaKey) {
          const z = clampZoom(v.z * Math.exp(-e.deltaY / 320));
          const cx = e.clientX - rect.left;
          const cy = e.clientY - rect.top;
          /* 커서 밑 지점이 제자리에 남도록 이동량을 보정한다 */
          return {
            z,
            x: cx - ((cx - v.x) / v.z) * z,
            y: cy - ((cy - v.y) / v.z) * z,
          };
        }
        return { ...v, x: v.x - e.deltaX, y: v.y - e.deltaY };
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    const kd = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        /* 스페이스가 페이지를 스크롤하거나 버튼을 누르지 않게 막는다 */
        if ((e.target as HTMLElement)?.tagName !== "BUTTON") e.preventDefault();
        spaceDown.current = true;
        setPanMode(true);
      }
      if (e.key === "Escape") {
        /*
          Esc 는 «하던 걸 그만둔다» 하나만 뜻해야 한다. 쥔 스탬프가 있을 때만
          도구가 풀리게 해뒀더니, 스티커를 안 고른 채 스티커 모드에 있거나
          펜을 든 상태에서는 Esc 를 눌러도 아무 일이 없었다 — 빠져나갈 길이
          막대뿐이면 갇힌 느낌이 든다.
        */
        setSelected(new Set());
        finishEditing();
        chooseTool("select");
      }
      /* 글자를 치는 중에는 단축키를 잡지 않는다 */
      if ((e.target as HTMLElement)?.isContentEditable) return;
      if (e.key === "Backspace" || e.key === "Delete") {
        /*
          지울 대상을 «지금» 붙잡는다. setNotes 의 업데이터는 다음 렌더 때
          실행되는데, 그 렌더에서 selectedRef 는 바로 아래 setSelected 로
          이미 비워진 뒤다 — ref 를 업데이터 «안» 에서 읽으면 늘 빈 집합이라
          아무것도 지워지지 않는다.
        */
        const picked = new Set(selectedRef.current);
        if (!picked.size) return;
        mark();
        /* 판에 원래 있던 조각은 지울 수 없다 — 글의 뼈대이기 때문이다 */
        const mine = new Set([
          ...notesRef.current.map((x) => x.id),
          ...strokesRef.current.map((x) => x.id),
        ]);
        const doomed = [...picked].filter((id) => mine.has(id));
        const locked = [...picked].filter((id) => !mine.has(id));

        if (doomed.length) {
          setNotes((n) => n.filter((x) => !doomed.includes(x.id)));
          setStrokes((n) => n.filter((x) => !doomed.includes(x.id)));
        }
        if (locked.length) {
          /* 안내 문구 대신 몸으로 알려 준다 — 붉어지며 잠깐 떤다 */
          window.clearTimeout(denyTimer.current);
          setDenied(new Set(locked));
          denyTimer.current = window.setTimeout(
            () => setDenied(new Set()),
            520,
          );
        }
        /*
          잠긴 조각은 «고른 채» 로 둔다 — 여기서 선택을 풀면 테두리가 같이
          사라져서 붉어졌다 돌아오는 것이 보이지 않는다.
        */
        setSelected(new Set(locked));
      }
      /* 입력 중에는 단축키를 잡지 않는다 */
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "v" || e.key === "V") chooseTool("select");
      if (e.key === "p" || e.key === "P") chooseTool("pen");
      if (e.key === "s" || e.key === "S") chooseTool("sticker");
      if ((e.metaKey || e.ctrlKey) && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
    };
    const ku = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        spaceDown.current = false;
        setPanMode(false);
      }
    };
    /* 탭 전환 등으로 keyup 을 놓치면 손 모양에 갇힌다 */
    const blur = () => {
      spaceDown.current = false;
      setPanMode(false);
    };
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      window.removeEventListener("blur", blur);
    };
  }, [chooseTool, finishEditing, undo, redo]);

  /*
    «처음으로» 를 켤지 판단.

    touched 하나로 보면 한 번 건드린 뒤로는 영원히 켜져 있다 — 되돌리기로
    처음 모습까지 돌아와도 여전히 «되돌릴 게 있다» 고 말하는 셈이다.
    그래서 판의 내용이 실제로 처음과 같은지 보고, 화면을 밀거나 확대한 것은
    따로 센다(그건 되돌리기 이력에 안 들어간다).
  */
  const seedIds = Object.keys(seedInk.current);
  const atInitial =
    notes.length === 0 &&
    strokes.length === seedIds.length &&
    strokes.every((x) => seedInk.current[x.id]) &&
    Object.values(scales).every((v) => v === 1) &&
    Object.values(spins).every((v) => v === 0) &&
    Object.entries(positions).every(
      ([id, p]) =>
        initial.current[id]?.x === p.x && initial.current[id]?.y === p.y,
    );

  const reset = () => {
    mark();
    setPositions({ ...initial.current });
    setScales({});
    setSpins({});
    setSelected(new Set());
    setStrokes(Object.values(seedInk.current));
    setNotes([]);
    editingRef.current = null;
    setEditing(null);
    setView(home.current);
    prevW.current = viewport.current?.clientWidth ?? prevW.current;
    zoomedByHand.current = false;
    touchedRef.current = false;
    setTouched(false);
  };

  const ctx = useMemo<BoardCtx>(
    () => ({
      positions,
      sizes,
      selected,
      scale: view.z,
      isDenied,
      spinOf,
      beginResize,
      beginRotate,
      scaleOf,
      setScale,
      tool,
      reportSize,
      registerInitial,
      registerPanel,
      registerInk,
      focusPanel,
      hasPanel,
      beginDrag,
      isSelected,
      multi: selected.size > 1,
    }),
    [
      positions,
      sizes,
      selected,
      view.z,
      isDenied,
      spinOf,
      beginResize,
      beginRotate,
      scaleOf,
      setScale,
      tool,
      reportSize,
      registerInitial,
      registerPanel,
      registerInk,
      focusPanel,
      hasPanel,
      beginDrag,
      isSelected,
    ],
  );

  /*
    글이 한 칸도 없으면 패널을 아예 그리지 않는다. 빈 칸을 띄워 두면 판이
    거기까지 못 쓰는데 정작 그 자리에는 아무것도 없다 — 판만 쓰는 화면도 있다.
  */
  const hasPanels = panels.length > 0;

  return (
    /*
      좁으면 위아래로, 넓으면 좌우로 나눈다. 판과 글이 «동시에» 보여야
      조각을 누른 결과가 어디에 나타나는지 알 수 있다.

      화면을 통째로 덮지 않는다 — 감싼 자리를 채운다. 그래야 글 한 편에
      전면으로도 쓰고, 쇼룸 안 한 칸으로도 쓴다. 크기는 부모가 정한다.
    */
    <div className="absolute inset-0 flex flex-col lg:flex-row">
      <div
        ref={viewport}
        onPointerDown={onCanvasPointerDown}
        onDoubleClick={onCanvasDoubleClick}
        className="jam-canvas relative min-h-0 flex-1 select-none overflow-hidden"
        style={{
          cursor: grabbing
            ? "grabbing"
            : panMode
              ? "grab"
              : stamp
                ? "none"
                : tool === "pen"
                  ? "crosshair"
                  : "default",
          touchAction: "none",
          /* 격자를 판에 붙인다 — 간격도 점도 같이 커지고, 밀면 같이 흐른다 */
          backgroundImage: `radial-gradient(circle, rgb(var(--color-onsurface) / 0.16) ${(
            GRID_DOT * view.z
          ).toFixed(2)}px, transparent ${(GRID_DOT * view.z).toFixed(2)}px)`,
          backgroundSize: `${GRID * view.z}px ${GRID * view.z}px`,
          backgroundPosition: `${view.x}px ${view.y}px`,
        }}
      >
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{
            width: baseW,
            height: baseH,
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.z})`,
          }}
        >
          <Ctx.Provider value={ctx}>
            {children}
            {selected.size > 1 && (
              <GroupFrame
                boxes={boxesOf([...selected])}
                zoom={view.z}
                onResize={(corner, e) =>
                  beginResize([...selected][0], corner, e)
                }
                onRotate={(e) => beginRotate([...selected][0], e)}
              />
            )}
            {strokes.map((st) => (
              <InkStroke key={st.id} stroke={st} />
            ))}
            {notes.map((n) => (
              <UserSticky
                key={n.id}
                note={n}
                editing={editing === n.id}
                onEdit={() => {
                  editingRef.current = n.id;
                  setEditing(n.id);
                }}
                onText={(text: string) =>
                  setNotes((all) =>
                    all.map((x) => (x.id === n.id ? { ...x, text } : x)),
                  )
                }
                onDone={finishEditing}
              />
            ))}
          </Ctx.Provider>

          <svg
            className="pointer-events-none absolute left-0 top-0"
            style={{
              width: baseW,
              height: baseH,
              zIndex: 40,
              overflow: "visible",
            }}
            aria-hidden
          >
            {live && (
              <path
                d={toPath(live.pts)}
                fill="none"
                stroke={live.color}
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </svg>

          {marquee && (
            <div
              className="pointer-events-none absolute rounded-[2px] border-2 border-sky-500/70 bg-sky-400/15"
              style={{
                left: Math.min(marquee.a.x, marquee.b.x),
                top: Math.min(marquee.a.y, marquee.b.y),
                width: Math.abs(marquee.b.x - marquee.a.x),
                height: Math.abs(marquee.b.y - marquee.a.y),
              }}
            />
          )}
        </div>

        <Toolbar
          canUndo={past.length > 0}
          canRedo={future.length > 0}
          onUndo={undo}
          onRedo={redo}
          touched={!atInitial || touched}
          tool={tool}
          inkColor={inkColor}
          onTool={chooseTool}
          stamp={stamp}
          onSticker={(g: string) => setStamp((cur) => (cur === g ? null : g))}
          onInk={setInkColor}
          onReset={reset}
        />

        {/* 쥔 스탬프가 커서를 따라다닌다 — 무엇을 찍는지 보여야 찍는다 */}
        {stamp && stampAt && !overChrome && (
          <span
            aria-hidden
            className="pointer-events-none fixed z-[70] -translate-x-1/2 -translate-y-1/2 text-[42px] leading-none drop-shadow-md"
            style={{ left: stampAt.x, top: stampAt.y }}
          >
            {stamp}
          </span>
        )}
      </div>

      {hasPanels && (
        <div
          className="relative flex h-[46%] w-full shrink-0 flex-col lg:h-full"
          style={wide ? { width: panelW } : undefined}
        >
          {/*
          폭 조절 손잡이.

          선은 «하나» 여야 한다 — aside 의 border-l 과 손잡이의 선이 겹치면
          둘 다 흐릿해 보인다. 그래서 경계선은 여기서만 그린다.
          잡는 영역은 12px, 보이는 선은 1px — 눈에 거슬리지 않으면서 잡기는
          쉬워야 한다.
        */}
          {wide && (
            <div
              onPointerDown={beginPanelResize}
              className="group absolute -left-1.5 top-0 z-20 flex h-full w-3 cursor-col-resize touch-none items-center justify-center"
              role="separator"
              aria-orientation="vertical"
              aria-label="글 영역 너비 조절"
            >
              <span
                className={`absolute inset-y-0 left-1/2 -translate-x-1/2 transition-all ${
                  resizing
                    ? "w-[2px] bg-sky-500"
                    : "w-px bg-outline/60 group-hover:w-[2px] group-hover:bg-sky-500"
                }`}
              />
              <span
                className={`relative rounded-full transition-all ${
                  resizing
                    ? "h-14 w-[5px] bg-sky-500"
                    : "h-10 w-[4px] bg-onsurface/25 group-hover:h-14 group-hover:w-[5px] group-hover:bg-sky-500"
                }`}
              />
            </div>
          )}

          <aside
            ref={panelScroll}
            /*
            소비처의 본문 조판을 패널 «전체» 에 걸면 그 규칙(h2 여백·윗줄 따위)이
            이 목록의 절 제목까지 잡아먹어 정체 모를 빈 띠가 생긴다.
            조판은 글 «안쪽» 에만 건다.
          */
            className="jam-panel min-h-0 flex-1 overflow-y-auto border-t border-outline/25 bg-surface px-5 pb-24 pt-6 lg:border-t-0 lg:px-6"
          >
            {panels.map(({ id, title, node }) => (
              <section
                key={id}
                ref={(el) => {
                  sectionRefs.current[id] = el;
                }}
                className={`scroll-mt-4 border-t border-outline/20 pb-7 pt-7 first:border-t-0 first:pt-0 ${
                  active === id ? "jam-panel-on" : ""
                }`}
              >
                <h2 className="m-0 mb-3.5 text-[18px] font-bold leading-snug tracking-[-0.02em] [word-break:keep-all]">
                  {title}
                </h2>
                <div className={proseClassName}>{node}</div>
              </section>
            ))}
          </aside>
        </div>
      )}
    </div>
  );
}

/* ── 도구 막대 ───────────────────────────────────────────────
   «만질 수 있다» 를 알려주는 것이 첫 임무다. 포트폴리오를 여는 사람은
   판을 끌어볼 생각을 하지 않는다.
   ──────────────────────────────────────────────────────────── */

/* 16px 선 아이콘 — 글리프(⬚ ✎)는 폰트마다 크기·정렬이 달라 막대가 지저분해진다 */
function Icon({
  name,
}: {
  name: "cursor" | "pen" | "undo" | "redo" | "reset" | "sticker";
}) {
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (name === "cursor")
    return (
      <svg {...common} aria-hidden>
        <path d="M3 2.2l9.2 5.3-4 .9-1.6 3.9z" />
      </svg>
    );
  if (name === "pen")
    return (
      <svg {...common} aria-hidden>
        <path d="M11.6 2.6l1.8 1.8-7.7 7.7-2.5.7.7-2.5z" />
        <path d="M10.3 3.9l1.8 1.8" />
      </svg>
    );
  if (name === "sticker")
    return (
      <svg {...common} aria-hidden>
        <path d="M13.4 8A5.4 5.4 0 118 2.6" />
        <path d="M13.4 8H10a2 2 0 00-2 2v3.4" />
        <path d="M10.6 2.9v2.5h2.5" />
      </svg>
    );
  if (name === "undo")
    return (
      <svg {...common} aria-hidden>
        <path d="M3 7.2h6.3a3.4 3.4 0 010 6.8H6.5" />
        <path d="M5.4 4.4L2.6 7.2l2.8 2.8" />
      </svg>
    );
  if (name === "redo")
    return (
      <svg {...common} aria-hidden>
        <path d="M13 7.2H6.7a3.4 3.4 0 100 6.8h2.8" />
        <path d="M10.6 4.4l2.8 2.8-2.8 2.8" />
      </svg>
    );
  return (
    /* 처음으로 = 판을 화면에 다시 담는다 — 모서리 네 개로 «맞춤» 을 그린다 */
    <svg {...common} aria-hidden>
      <path d="M2.4 5.6V2.6h3M13.6 5.6V2.6h-3M2.4 10.4v3h3M13.6 10.4v3h-3" />
      <rect x="6" y="6" width="4" height="4" rx="0.8" />
    </svg>
  );
}

function Toolbar({
  touched,
  tool,
  inkColor,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onTool,
  stamp,
  onSticker,
  onInk,
  onReset,
}: {
  touched: boolean;
  tool: "select" | "pen" | "sticker";
  inkColor: string;
  canUndo: boolean;
  canRedo: boolean;
  onRedo: () => void;
  onTool: (t: "select" | "pen" | "sticker") => void;
  /* 지금 쥐고 있는 스탬프 */
  stamp: string | null;
  onSticker: (glyph: string) => void;
  onInk: (c: string) => void;
  onUndo: () => void;
  onReset: () => void;
}) {
  const { backHref, backLabel } = useContext(ChromeCtx);

  const ghost =
    "grid h-8 w-8 place-items-center rounded-lg text-onsurface/60 transition-colors hover:bg-onsurface/10 hover:text-onsurface disabled:opacity-30 disabled:hover:bg-transparent";
  const tab = (on: boolean) =>
    `grid h-8 w-8 place-items-center rounded-lg transition-colors ${
      on
        ? "bg-onsurface text-surface"
        : "text-onsurface/60 hover:bg-onsurface/10 hover:text-onsurface"
    }`;
  const bar = "mx-1 h-5 w-px shrink-0 bg-outline/35";

  return (
    <div
      className="absolute left-4 top-4 z-40 flex items-center gap-0.5 rounded-2xl border border-outline/25 bg-surface/95 p-1.5 shadow-[0_4px_16px_-6px_rgb(0_0_0/0.25)] backdrop-blur"
      onPointerDown={(e) => e.stopPropagation()}
      data-board-chrome=""
      /*
        스탬프를 쥐면 캔버스 커서를 감추는데(그 자리에 이모지가 떠 있으므로),
        막대 위에서까지 커서가 없으면 버튼을 겨냥하기 어렵다. 여기서는 되살린다.
      */
      style={{ cursor: "default" }}
    >
      {backHref && (
        <>
          <a
            href={backHref}
            className="rounded-lg px-2.5 py-1.5 text-[13px] font-semibold text-onsurface/65 no-underline transition-colors hover:bg-onsurface/10 hover:text-onsurface"
          >
            ← {backLabel}
          </a>
          <span className={bar} />
        </>
      )}

      <button
        type="button"
        className={tab(tool === "select")}
        onClick={() => onTool("select")}
        title="선택 (V)"
      >
        <Icon name="cursor" />
      </button>
      <button
        type="button"
        className={tab(tool === "pen")}
        onClick={() => onTool("pen")}
        title="펜 (P)"
      >
        <Icon name="pen" />
      </button>
      <button
        type="button"
        className={tab(tool === "sticker")}
        onClick={() => onTool(tool === "sticker" ? "select" : "sticker")}
        title="스티커 (S)"
      >
        <Icon name="sticker" />
      </button>

      {tool === "sticker" && (
        <>
          <span className={bar} />
          {STICKERS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => onSticker(g)}
              title={`${g} 붙이기`}
              className={`grid h-8 w-8 place-items-center rounded-lg text-[17px] leading-none transition-transform hover:scale-125 ${
                stamp === g ? "scale-125 bg-onsurface/10" : ""
              }`}
            >
              {g}
            </button>
          ))}
        </>
      )}

      {tool === "pen" && (
        <>
          <span className={bar} />
          {INKS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onInk(c)}
              title={`색 ${c}`}
              className="grid h-8 w-6 place-items-center"
            >
              <span
                className={`block rounded-full transition-all ${
                  inkColor === c
                    ? "h-[18px] w-[18px] ring-2 ring-onsurface/40 ring-offset-2 ring-offset-surface"
                    : "h-[15px] w-[15px]"
                }`}
                style={{ background: c }}
              />
            </button>
          ))}
        </>
      )}

      <span className={bar} />
      <button
        type="button"
        className={ghost}
        onClick={onUndo}
        disabled={!canUndo}
        title="되돌리기 (⌘Z)"
      >
        <Icon name="undo" />
      </button>
      <button
        type="button"
        className={ghost}
        onClick={onRedo}
        disabled={!canRedo}
        title="다시 하기 (⇧⌘Z)"
      >
        <Icon name="redo" />
      </button>
      <button
        type="button"
        className={ghost}
        onClick={onReset}
        disabled={!touched}
        title="처음 배치로"
      >
        <Icon name="reset" />
      </button>
    </div>
  );
}

/* ── Panel ───────────────────────────────────────────────────
   글 한 토막. 판 위에는 그리지 않고 서랍에만 산다.
   ──────────────────────────────────────────────────────────── */

export function Panel({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  const { registerPanel } = useBoard();
  useEffect(() => {
    registerPanel(id, title, children);
  }, [id, title, children, registerPanel]);
  return null;
}

/* ── Item ────────────────────────────────────────────────────
   자리를 갖고 끌리는 것 전부의 껍데기.
   ──────────────────────────────────────────────────────────── */

export function Item({
  id,
  at,
  z,
  opens,
  className,
  style,
  children,
}: {
  id: string;
  at?: string;
  z?: number;
  /** 누르면 열릴 Panel 의 id */
  opens?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const {
    positions,
    registerInitial,
    reportSize,
    beginDrag,
    isSelected,
    isDenied,
    multi,
    hasPanel,
    spinOf,
    beginResize,
    beginRotate,
    tool,
    scaleOf,
    setScale,
  } = useBoard();
  const ref = useRef<HTMLDivElement>(null);
  const start = useMemo(() => parseAt(at), [at]);

  /*
    useLayoutEffect 로 등록하면 «하이드레이션 도중» 에 좌표가 들어와 부모가
    다시 그려진다. 그러면 서버엔 없던 연결선 <svg> 가 형제 사이에 끼어들어
    React 가 «server HTML 과 다르다» 며 루트를 통째로 클라이언트 렌더로
    돌려버린다. 등록은 하이드레이션이 끝난 뒤(useEffect)에 한다 —
    한 프레임 늦게 선이 그려질 뿐, 조각은 처음부터 제자리에 있다.
  */
  useEffect(() => {
    registerInitial(id, start);
  }, [id, start, registerInitial]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () =>
      reportSize(id, { w: el.offsetWidth, h: el.offsetHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [id, reportSize]);

  const p = positions[id] ?? start;
  const on = isSelected(id);
  const nope = isDenied(id);
  const readable = Boolean(opens) && hasPanel(opens!);
  /* 펜을 들면 조각은 비켜선다 — 그리다가 조각이 딸려오면 낙서가 안 된다 */
  const pen = tool === "pen";

  const sc = scaleOf(id);
  const spin = spinOf(id);
  /* 표시자는 조각과 «같이» 커지면 안 된다 — 배율을 그대로 되돌려 준다 */
  const inv = 1 / sc;

  /*
    테두리는 상자에서 6px 바깥에 그린다. box-sizing 이 border-box 라 2px 선은
    그 상자 «안쪽» 에 그려지므로, 선의 «중심» 은 -6 이 아니라 -5 다.
    손잡이 가운데를 -6 에 두면 선보다 1px 바깥으로 밀려 보인다.
  */
  const RING = 6;
  const EDGE = 2;
  const KNOB = 14;
  const off = -(RING - EDGE / 2 + KNOB / 2);
  const HANDLES = [
    {
      k: "nw" as const,
      at: { left: off * inv, top: off * inv },
      cursor: CURSOR.nwse,
    },
    {
      k: "ne" as const,
      at: { right: off * inv, top: off * inv },
      cursor: CURSOR.nesw,
    },
    {
      k: "sw" as const,
      at: { left: off * inv, bottom: off * inv },
      cursor: CURSOR.nesw,
    },
    {
      k: "se" as const,
      at: { right: off * inv, bottom: off * inv },
      cursor: CURSOR.nwse,
    },
  ];

  /*
    회전은 «코너 바깥» 이 맡는다. 예전엔 위쪽에 막대 달린 손잡이를 세웠는데
    조각마다 모자를 쓴 꼴이라 판이 지저분했다. 피그마처럼 모서리 조금 밖에
    보이지 않는 구역을 두고, 거기서 커서를 회전 모양으로 바꾼다.
  */
  const SPIN_PAD = 26;
  const spinOff = -(RING + SPIN_PAD / 2 + 1);

  return (
    <div
      ref={ref}
      onPointerDown={(e) => beginDrag(id, e, readable ? opens : undefined)}
      data-board-item=""
      className={`group absolute ${readable ? "cursor-pointer" : "cursor-grab"} active:cursor-grabbing ${className ?? ""}`}
      style={{
        left: p.x,
        top: p.y,
        zIndex: on ? 30 : (z ?? 10),
        touchAction: "none",
        ...(sc !== 1 ? { scale: String(sc) } : null),
        /* 원래 기울기와 손으로 돌린 각을 «더해서» 쓴다 — 흔들림 애니메이션도 같은 식을 쓴다 */
        ["--spin" as string]: `${spin}deg`,
        rotate: "calc(var(--tilt, 0deg) + var(--spin, 0deg))",
        ...(nope ? { animation: "jam-deny 0.5s ease-in-out" } : null),
        pointerEvents: pen ? "none" : undefined,
        ...style,
      }}
    >
      {children}
      {on && multi && (
        /* 무리에 속했다는 표시만 — 손잡이는 무리 상자가 하나만 갖는다 */
        <span
          aria-hidden
          className="pointer-events-none absolute border-[#2C8CF5]/45"
          style={{ inset: -3 * inv, borderWidth: 1 * inv }}
        />
      )}
      {on && !multi && (
        <>
          <span
            aria-hidden
            className={`pointer-events-none absolute ${nope ? "border-[#E4483F]" : "border-[#2C8CF5]"}`}
            style={{
              inset: -RING * inv,
              borderWidth: EDGE * inv,
              /* 각진 모서리여야 손잡이 가운데가 모서리에 «맞아» 보인다 */
              borderRadius: 2 * inv,
            }}
          />
          {/* 코너 «바깥» — 여기서 끌면 돌아간다. 크기 손잡이보다 아래에 깔린다 */}
          {HANDLES.map((h) => (
            <span
              key={`spin-${h.k}`}
              onPointerDown={(e) => beginRotate(id, e)}
              className="pointer-events-auto absolute"
              style={{
                ...(h.at.left !== undefined
                  ? { left: spinOff * inv }
                  : { right: spinOff * inv }),
                ...(h.at.top !== undefined
                  ? { top: spinOff * inv }
                  : { bottom: spinOff * inv }),
                width: SPIN_PAD * inv,
                height: SPIN_PAD * inv,
                cursor: CURSOR.spin,
              }}
            />
          ))}
          {HANDLES.map((h) => (
            <span
              key={h.k}
              onPointerDown={(e) => beginResize(id, h.k, e)}
              className={`pointer-events-auto absolute bg-surface shadow-sm ${nope ? "border-[#E4483F]" : "border-[#2C8CF5]"}`}
              style={{
                ...h.at,
                cursor: h.cursor,
                width: KNOB * inv,
                height: KNOB * inv,
                borderWidth: EDGE * inv,
                borderRadius: 3 * inv,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}

/* ── UserSticky ───────────────────────────────────────────────
   보는 사람이 붙인 쪽지. 판의 조각들과 같은 Item 을 두르므로 끌기·선택·
   확대가 전부 공짜로 따라온다. 붙이자마자 글자를 칠 수 있어야 하므로
   contentEditable 로 두고, 편집 중에는 끌기를 막는다.
   ──────────────────────────────────────────────────────────── */

function UserSticky({
  note,
  editing,
  onEdit,
  onText,
  onDone,
}: {
  note: UserPiece;
  editing: boolean;
  onEdit: () => void;
  onText: (text: string) => void;
  onDone: () => void;
}) {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editing) return;
    const el = box.current;
    if (!el) return;
    el.textContent = note.text ?? "";
    el.focus();
    /* 커서를 글 끝에 둔다 — 빈 쪽지면 그냥 처음이다 */
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
    /* eslint-disable-next-line react-hooks/exhaustive-deps -- 편집이 시작될 때만 */
  }, [editing]);

  if (note.kind === "sticker") {
    return (
      <Item
        id={note.id}
        at={`${note.x},${note.y}`}
        z={26}
        /* 상자를 글리프 크기에 맞춘다 — 64px 상자에 44px 그림을 담으면 테두리가 붕 뜬다 */
        className="grid place-items-center"
        style={{
          width: STICKER,
          height: STICKER,
          fontSize: STICKER,
          lineHeight: 1,
          ["--tilt" as string]: `${note.tilt ?? 0}deg`,
          filter: "drop-shadow(0 4px 6px rgb(0 0 0 / 0.25))",
        }}
      >
        <span className="select-none">{note.glyph}</span>
      </Item>
    );
  }

  return (
    <Item
      id={note.id}
      at={`${note.x},${note.y}`}
      z={25}
      className="w-[200px] rounded-[3px] px-4 py-4"
      style={{
        background: note.color,
        color: PAPER_INK,
        /* 원래 기울기는 변수로만 알려 준다 — 손으로 돌린 각과 합치는 일은 Item 이 한다 */
        ["--tilt" as string]: "-1deg",
        boxShadow:
          "0 6px 14px -6px rgb(0 0 0 / 0.35), 0 1px 2px rgb(0 0 0 / 0.15)",
      }}
    >
      <div
        ref={box}
        contentEditable={editing}
        suppressContentEditableWarning
        onDoubleClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        /* 편집 중에는 Item 의 끌기 시작을 막는다 — 글자를 고르려다 쪽지가 밀린다 */
        onPointerDown={(e) => {
          if (editing) e.stopPropagation();
        }}
        onInput={(e) => onText(e.currentTarget.textContent ?? "")}
        onBlur={onDone}
        onKeyDown={(e) => {
          if (e.key === "Escape" || (e.key === "Enter" && !e.shiftKey)) {
            e.preventDefault();
            onDone();
          }
          e.stopPropagation();
        }}
        className="jam-paper-body min-h-[42px] text-[14px] font-semibold leading-[1.55] outline-none [word-break:keep-all]"
        data-placeholder="여기에 적어보세요"
      >
        {editing ? null : note.text}
      </div>
    </Item>
  );
}

/* ── GroupFrame ───────────────────────────────────────────────
   여럿을 함께 골랐을 때 전체를 감싸는 하나의 상자.

   조각마다 손잡이를 달면 무엇을 끌어야 «다 같이» 움직이는지 알 수 없다.
   상자는 하나, 손잡이도 하나 벌 — 개별 조각은 흐린 선으로 «여기 포함됐다»
   만 알린다.
   ──────────────────────────────────────────────────────────── */

function GroupFrame({
  boxes,
  zoom,
  onResize,
  onRotate,
}: {
  boxes: { x: number; y: number; w: number; h: number }[];
  zoom: number;
  onResize: (corner: Corner, e: ReactPointerEvent) => void;
  onRotate: (e: ReactPointerEvent) => void;
}) {
  if (boxes.length < 2) return null;
  const x0 = Math.min(...boxes.map((b) => b.x));
  const y0 = Math.min(...boxes.map((b) => b.y));
  const x1 = Math.max(...boxes.map((b) => b.x + b.w));
  const y1 = Math.max(...boxes.map((b) => b.y + b.h));

  /* 판을 확대·축소해도 테두리와 손잡이는 늘 같은 굵기로 보여야 한다 */
  const inv = 1 / zoom;
  const RING = 6;
  const EDGE = 2;
  const KNOB = 14;
  const off = -(RING - EDGE / 2 + KNOB / 2);
  const SPIN_PAD = 26;
  const spinOff = -(RING + SPIN_PAD / 2 + 1);
  const corners = [
    {
      k: "nw" as const,
      x: "left" as const,
      y: "top" as const,
      cursor: CURSOR.nwse,
    },
    {
      k: "ne" as const,
      x: "right" as const,
      y: "top" as const,
      cursor: CURSOR.nesw,
    },
    {
      k: "sw" as const,
      x: "left" as const,
      y: "bottom" as const,
      cursor: CURSOR.nesw,
    },
    {
      k: "se" as const,
      x: "right" as const,
      y: "bottom" as const,
      cursor: CURSOR.nwse,
    },
  ];

  return (
    <div
      className="absolute"
      style={{ left: x0, top: y0, width: x1 - x0, height: y1 - y0, zIndex: 40 }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute border-[#2C8CF5]"
        style={{ inset: -RING * inv, borderWidth: EDGE * inv }}
      />
      {corners.map((c) => (
        <span
          key={`spin-${c.k}`}
          onPointerDown={(e) => onRotate(e)}
          className="absolute"
          style={{
            [c.x]: spinOff * inv,
            [c.y]: spinOff * inv,
            width: SPIN_PAD * inv,
            height: SPIN_PAD * inv,
            cursor: CURSOR.spin,
          }}
        />
      ))}
      {corners.map((c) => (
        <span
          key={c.k}
          onPointerDown={(e) => onResize(c.k, e)}
          className="absolute border-[#2C8CF5] bg-surface shadow-sm"
          style={{
            [c.x]: off * inv,
            [c.y]: off * inv,
            width: KNOB * inv,
            height: KNOB * inv,
            borderWidth: EDGE * inv,
            borderRadius: 3 * inv,
            cursor: c.cursor,
          }}
        />
      ))}
    </div>
  );
}

/* ── Ink ─────────────────────────────────────────────────────
   판에 미리 그려 두는 손자국. 글에서 자리와 모양만 적으면 된다.

     <Ink id="u1" at="40,120" shape="underline" w="180" color="red" />

   점을 손으로 찍지 않고 모양 이름으로 부르는 이유: 좌표 뭉치를 글에 적어
   두면 나중에 배치를 조금만 옮겨도 손댈 수 없게 된다.
   ──────────────────────────────────────────────────────────── */

/** 이름에서 «항상 같은» 흔들림을 뽑는다 — 손그림처럼 보이되 매번 같아야 한다 */
function wobble(seed: string, i: number, amp: number): number {
  let h = Math.imul(seed.length + i * 31 + 7, 2654435761) >>> 0;
  for (let k = 0; k < seed.length; k++)
    h = Math.imul(h ^ seed.charCodeAt(k), 16777619) >>> 0;
  return ((h % 200) / 100 - 1) * amp;
}

const SHAPES: Record<string, (w: number, h: number, seed: string) => Point[]> =
  {
    /* 강조 밑줄 — 한 번에 그은 듯 끝이 살짝 올라간다 */
    underline: (w, h, seed) =>
      Array.from({ length: 14 }, (_, i) => {
        const t = i / 13;
        return {
          x: t * w,
          y: h / 2 + Math.sin(t * Math.PI) * -h * 0.28 + wobble(seed, i, 1.6),
        };
      }),
    /* 동그라미 — 한 바퀴를 조금 넘겨 겹치게 그린다 */
    circle: (w, h, seed) =>
      Array.from({ length: 30 }, (_, i) => {
        const t = (i / 29) * Math.PI * 2.15 - Math.PI * 0.55;
        return {
          x: w / 2 + Math.cos(t) * (w / 2) + wobble(seed, i, 2.2),
          y: h / 2 + Math.sin(t) * (h / 2) + wobble(seed, i + 40, 2.2),
        };
      }),
    /*
    별 — 다섯 꼭짓점을 «건너뛰며» 한 붓으로 잇는다.
    이웃한 순서(0,1,2,3,4)로 이으면 그냥 오각형이 된다. 두 칸씩 건너야
    별이 된다.
  */
    star: (w, h, seed) =>
      Array.from({ length: 6 }, (_, i) => {
        const t = ((i * 2) % 5) * ((Math.PI * 2) / 5) - Math.PI / 2;
        return {
          x: w / 2 + Math.cos(t) * (w / 2) + wobble(seed, i, 1.2),
          y: h / 2 + Math.sin(t) * (h / 2) + wobble(seed, i + 9, 1.2),
        };
      }),
    /* 체크 */
    check: (w, h, seed) =>
      [
        { x: 0, y: h * 0.55 },
        { x: w * 0.34, y: h },
        { x: w, y: 0 },
      ].map((p, i) => ({
        x: p.x + wobble(seed, i, 1.4),
        y: p.y + wobble(seed, i + 5, 1.4),
      })),
  };

export function Ink({
  id,
  at,
  shape = "underline",
  w = "160",
  h,
  color = "red",
}: {
  id: string;
  at: string;
  shape?: keyof typeof SHAPES;
  /** 가로 크기(px) */
  w?: string | number;
  /** 세로 크기(px). 생략하면 모양별 기본값 */
  h?: string | number;
  color?: keyof typeof MARKER;
}) {
  const { registerInk } = useBoard();
  const stroke = useMemo(() => {
    const [ox, oy] = at.split(",").map((n) => parseFloat(n.trim()));
    const width = Number(w);
    const height =
      h !== undefined ? Number(h) : shape === "underline" ? 12 : width * 0.62;
    const pts = (SHAPES[shape] ?? SHAPES.underline)(width, height, id).map(
      (p) => ({
        x: Math.round((ox + p.x) * 10) / 10,
        y: Math.round((oy + p.y) * 10) / 10,
      }),
    );
    return { id, color: MARKER[color] ?? MARKER.red, pts };
  }, [id, at, shape, w, h, color]);

  useEffect(() => {
    registerInk(stroke);
  }, [stroke, registerInk]);

  return null;
}

/* ── InkStroke ────────────────────────────────────────────────
   펜으로 그은 선 한 획. 다른 조각과 똑같이 고르고 옮기고 지운다.

   상자 전체를 잡히게 두면 대각선 한 획이 넓은 사각형을 차지해 아래 조각을
   덮어 버린다. 그래서 상자는 포인터를 통과시키고, «선 근처» 에서만 잡히도록
   보이지 않는 굵은 획을 하나 더 깐다.
   ──────────────────────────────────────────────────────────── */

function InkStroke({ stroke }: { stroke: Stroke }) {
  /*
    상자는 «그려진 선» 에 바짝 붙인다. 여유를 크게 두면 선택 테두리가
    포스트잇보다 헐렁해 보여서, 같은 판의 조각인데 규칙이 다른 것처럼 읽힌다.
    선 굵기의 절반과 둥근 마감만큼만 남긴다.
  */
  const PAD = 4;
  const xs = stroke.pts.map((p) => p.x);
  const ys = stroke.pts.map((p) => p.y);
  const x0 = Math.min(...xs) - PAD;
  const y0 = Math.min(...ys) - PAD;
  const w = Math.max(...xs) - Math.min(...xs) + PAD * 2;
  const h = Math.max(...ys) - Math.min(...ys) + PAD * 2;
  const local = stroke.pts.map((p) => ({ x: p.x - x0, y: p.y - y0 }));
  const d = toPath(local);

  return (
    <Item
      id={stroke.id}
      at={`${x0},${y0}`}
      z={28}
      style={{ pointerEvents: "none" }}
    >
      <svg
        width={w}
        height={h}
        style={{ display: "block", overflow: "visible" }}
        aria-hidden
      >
        {/* 잡기용 — 보이지 않지만 손이 닿는다 */}
        <path
          d={d}
          fill="none"
          stroke="transparent"
          strokeWidth={14}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ pointerEvents: "stroke", cursor: "grab" }}
        />
        <path
          d={d}
          fill="none"
          stroke={stroke.color}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ pointerEvents: "none" }}
        />
      </svg>
    </Item>
  );
}

/* ── Connector ───────────────────────────────────────────────
   두 조각을 잇는 «구조선». 한쪽을 끌면 따라온다.

   전에는 펜으로 그은 획과 같은 모습이었다 — 굵은 마커에 손그림 촉. 그런데
   펜 획은 고르고 지울 수 있고 이건 못 하니, 같은 생김새인데 다르게 구는
   예외가 됐다. 생김새로 규칙을 말하게 한다:

     알록달록하고 손맛 나는 선 = 사람이 그은 것 (고르고 · 옮기고 · 지운다)
     무채색의 반듯한 S 커브     = 판이 그린 구조 (조각을 따라다닐 뿐이다)

   상자에서 «수평으로» 빠져나와 «수평으로» 들어간다. 두 점을 곧장 잇는
   사선은 어느 면에서 나왔는지가 흐려서, 조각이 늘어설수록 어지럽다.
   ──────────────────────────────────────────────────────────── */

export function Connector({
  from,
  to,
  label,
}: {
  from: string;
  to: string;
  label?: string;
}) {
  const { positions, sizes, scaleOf } = useBoard();
  const a = positions[from];
  const b = positions[to];
  const sa = sizes[from];
  const sb = sizes[to];
  if (!a || !b || !sa || !sb) return null;

  /* 조각이 커졌으면 그만큼 넓어진 «보이는» 상자를 기준으로 잇는다 */
  const box = (p: Point, sz: Size, k: number) => ({
    cx: p.x + sz.w / 2,
    cy: p.y + sz.h / 2,
    hw: (sz.w * k) / 2,
    hh: (sz.h * k) / 2,
  });
  const A = box(a, sa, scaleOf(from));
  const B = box(b, sb, scaleOf(to));

  const dx = B.cx - A.cx;
  const dy = B.cy - A.cy;
  /* 가로로 더 멀면 좌우 면에서, 세로로 더 멀면 위아래 면에서 드나든다 */
  const horiz = Math.abs(dx) >= Math.abs(dy);
  const GAP = 8;

  const p1 = horiz
    ? { x: A.cx + Math.sign(dx) * (A.hw + GAP), y: A.cy }
    : { x: A.cx, y: A.cy + Math.sign(dy) * (A.hh + GAP) };
  const p2 = horiz
    ? { x: B.cx - Math.sign(dx) * (B.hw + GAP), y: B.cy }
    : { x: B.cx, y: B.cy - Math.sign(dy) * (B.hh + GAP) };

  /* 빠져나오는 방향으로 손잡이를 뻗어 S 를 만든다 — 거리에 비례하되 상한을 둔다 */
  const reach = Math.min(
    160,
    Math.max(48, Math.abs(horiz ? p2.x - p1.x : p2.y - p1.y) * 0.55),
  );
  const c1 = horiz
    ? { x: p1.x + Math.sign(dx) * reach, y: p1.y }
    : { x: p1.x, y: p1.y + Math.sign(dy) * reach };
  const c2 = horiz
    ? { x: p2.x - Math.sign(dx) * reach, y: p2.y }
    : { x: p2.x, y: p2.y - Math.sign(dy) * reach };

  /* 촉은 도착 «직전의 방향» 을 따른다 — S 라서 직선 각도와 다르다 */
  const ang = Math.atan2(p2.y - c2.y, p2.x - c2.x);
  const head = 10;
  const spread = 0.42;

  /*
    선을 촉 «뿌리» 에서 끊는다. 끝점까지 그으면 둥근 마감이 촉 밖으로
    비어져 나와 화살표 끝이 뭉툭해 보인다.
  */
  const stop = {
    x: p2.x - Math.cos(ang) * head * 0.82,
    y: p2.y - Math.sin(ang) * head * 0.82,
  };
  const d = `M ${p1.x} ${p1.y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${stop.x} ${stop.y}`;
  const tip = (sign: number) =>
    `${p2.x - head * Math.cos(ang + sign * spread)} ${p2.y - head * Math.sin(ang + sign * spread)}`;

  /* 베지에의 한가운데 — 라벨 태그가 앉을 자리다 */
  const mid = {
    x: 0.125 * p1.x + 0.375 * c1.x + 0.375 * c2.x + 0.125 * p2.x,
    y: 0.125 * p1.y + 0.375 * c1.y + 0.375 * c2.y + 0.125 * p2.y,
  };

  return (
    <>
      <svg
        className="pointer-events-none absolute left-0 top-0 h-full w-full"
        style={{ zIndex: 4, overflow: "visible", color: LINE }}
        aria-hidden
      >
        <path
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.9}
          strokeLinecap="round"
        />
        {/* 촉은 채운 삼각형 — 두 획으로 치면 손그림이 된다 */}
        <path
          d={`M ${p2.x} ${p2.y} L ${tip(-1)} L ${tip(1)} Z`}
          fill="currentColor"
          stroke="none"
        />
      </svg>
      {label && (
        /* 선 «위» 에 앉는 태그. 바탕이 있어 선이 글자를 뚫고 지나가지 않는다 */
        <span
          /* 태그는 읽을 «말» 이라 선 색을 따라가지 않는다 — 파랗게 칠하면 선의 일부로 보인다 */
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-outline/50 bg-surface px-2.5 py-[3px] text-[11.5px] font-semibold text-onsurface/75"
          style={{ left: mid.x, top: mid.y, zIndex: 6 }}
        >
          {label}
        </span>
      )}
    </>
  );
}
