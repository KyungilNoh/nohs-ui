/**
 * nohsJam — 만질 수 있는 판.
 *
 * 판(Board)과, 판 위에서 사는 법(Item)과, 보편적인 조각(Sticky)을 낸다.
 * 화면마다 다른 구조 조각은 소비처가 Item 을 둘러 직접 만든다 —
 * 그것까지 여기 넣기 시작하면 남의 글 사정이 라이브러리로 새어 든다.
 *
 * 스타일은 `@nohs/ui/src/styles/jam.css` 를 함께 불러야 한다.
 */
export {
  Board,
  BoardChrome,
  Item,
  Panel,
  Connector,
  Ink,
  type BoardProps,
  type Corner,
  type Point,
  type Size,
  type Stroke,
  type UserPiece,
} from './JamCanvas';

export { Sticky, JAM_TONE, JAM_INK, type JamTone, type StickyProps } from './JamPieces';
