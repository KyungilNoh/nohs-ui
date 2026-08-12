// nohs-ui/src/demo/pages/JamDemo.tsx
//
// nohsJam 은 «보는» 컴포넌트가 아니라 «만지는» 컴포넌트다. 그래서 이 페이지는
// 캡처나 코드 조각이 아니라 판 자체를 띄운다 — 끌어 보고, 그려 보고, 지워 봐야
// 무엇인지 안다.
//
// 글 패널은 띄우지 않는다. 여기서 보여줄 것은 판이지 글이 아니고, Panel 을 한
// 칸도 등록하지 않으면 판이 알아서 화면을 다 쓴다.

import { Board, Connector, Ink, Item, Sticky } from '../../components/jam';

/**
 * 데모용 구조 조각.
 *
 * 지울 수 없는 조각이 어떤 것인지 보여주려고 하나 만들었다 — 이런 조각은
 * 라이브러리가 아니라 «쓰는 쪽» 이 Item 을 둘러 직접 만든다. 화면마다 필요한
 * 모양이 다르기 때문이다.
 */
function Frame({ id, at, label, items }: { id: string; at: string; label: string; items: string[] }) {
  return (
    <Item id={id} at={at} className="flex w-[200px] flex-col">
      <span className="mb-1.5 w-fit rounded-md bg-onsurface/10 px-2.5 py-1 text-[12px] font-extrabold text-onsurface">
        {label}
      </span>
      <div className="flex flex-col gap-2 rounded-xl border-2 border-dashed border-outline p-3">
        {items.map((t) => (
          <span
            key={t}
            className="rounded-lg bg-onsurface/[0.06] px-3 py-2 text-center text-[13px] font-bold text-onsurface"
          >
            {t}
          </span>
        ))}
      </div>
    </Item>
  );
}

export default function JamDemo() {
  return (
    /*
      판은 감싼 자리를 채운다. 본문 여백을 빼려다 아래에 그만큼 빈 띠가
      남았다 — 이 쇼룸의 본문은 여백이 0 이라 화면 높이를 그대로 쓴다.
    */
    <div className="relative h-screen">
      <Board width={900} height={600}>
        <Item id="head" at="30,26" className="w-[420px]">
          <h1 className="m-0 text-[30px] font-extrabold leading-tight tracking-[-0.03em] text-onsurface">
            nohsJam
          </h1>
          <p className="m-0 mt-2 text-[14px] leading-relaxed text-subtle">
            만질 수 있는 판. 조각을 끌고 고르고 키우고 돌리고, 그 위에 긋고 붙인다.
          </p>
        </Item>

        <Frame id="a" at="30,190" label="INPUT" items={['원본', '규칙']} />
        <Frame id="b" at="330,190" label="ENGINE" items={['해석', '조립', '검증']} />
        <Frame id="c" at="630,190" label="OUTPUT" items={['결과물']} />

        <Connector from="a" to="b" label="읽는다" />
        <Connector from="b" to="c" label="굽는다" />

        <Sticky id="s1" at="30,430" tone="yellow" label="끌어 보세요" tilt="-1.8">
          여럿 고르면 함께 움직입니다. 코너로 키우고, 코너 «바깥» 에서 돌립니다.
        </Sticky>
        <Sticky id="s2" at="266,462" tone="blue" label="펜 · 스티커" tilt="1.4">
          P 로 긋고 S 로 찍습니다. 그은 획도 찍은 스티커도 조각입니다.
        </Sticky>
        <Sticky id="s3" at="510,428" tone="pink" label="지우기" tilt="1.1">
          얹은 것은 지워지고, 판에 있던 구조 조각은 거부합니다. 「처음으로」가 되돌립니다.
        </Sticky>
        <Sticky id="s4" at="700,470" tone="green" label="단축키" tilt="-1.2">
          V 선택 · P 펜 · S 스티커 · Esc 그만두기 · ⌘Z 되돌리기
        </Sticky>

        <Ink id="ink1" at="34,86" shape="underline" w="164" color="orange" />
        <Ink id="ink2" at="470,150" shape="star" w="26" h="26" color="violet" />
      </Board>
    </div>
  );
}
