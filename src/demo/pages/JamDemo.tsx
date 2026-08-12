// nohs-ui/src/demo/pages/JamDemo.tsx
//
// nohsJam 은 «보는» 컴포넌트가 아니라 «만지는» 컴포넌트다. 그래서 이 페이지는
// 캡처나 코드 조각이 아니라 판 자체를 띄운다 — 끌어 보고, 그려 보고, 지워 봐야
// 무엇인지 안다.

import { Board, Connector, Ink, Item, Panel, Sticky } from '../../components/jam';

/**
 * 데모용 구조 조각.
 *
 * 지울 수 없는 조각이 어떤 것인지 보여주려고 하나 만들었다 — 이런 조각은
 * 라이브러리가 아니라 «쓰는 쪽» 이 Item 을 둘러 직접 만든다. 화면마다 필요한
 * 모양이 다르기 때문이다.
 */
function Frame({
  id,
  at,
  opens,
  label,
  items,
}: {
  id: string;
  at: string;
  opens?: string;
  label: string;
  items: string[];
}) {
  return (
    <Item id={id} at={at} opens={opens} className="flex w-[210px] flex-col">
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
    /* 판은 감싼 자리를 채운다 — 높이는 여기서 정한다 */
    <div className="relative h-[min(760px,calc(100vh-96px))] overflow-hidden rounded-xl border border-outline">
      <Board width={880} height={560} proseClassName="jamDemoProse">
        <Frame id="a" at="30,40" opens="p-a" label="INPUT" items={['원본', '규칙']} />
        <Frame id="b" at="330,40" opens="p-b" label="ENGINE" items={['해석', '조립', '검증']} />
        <Frame id="c" at="630,40" opens="p-c" label="OUTPUT" items={['결과물']} />

        <Connector from="a" to="b" label="읽는다" />
        <Connector from="b" to="c" label="굽는다" />

        <Sticky id="s1" at="30,320" opens="p-use" tone="yellow" label="써 보기" tilt="-1.8">
        조각을 끌어 보세요. 여럿 고르면 함께 움직입니다.
      </Sticky>
        <Sticky id="s2" at="266,352" opens="p-use" tone="blue" label="펜" tilt="1.4">
        막대의 펜을 들고 판 위에 그어 보세요. 그은 획도 조각입니다.
      </Sticky>
        <Sticky id="s3" at="520,318" opens="p-use" tone="pink" label="스티커" tilt="1.1">
        스티커를 고르면 커서에 물립니다. Esc 로 손을 텁니다.
      </Sticky>

        <Ink id="ink1" at="34,300" shape="underline" w="180" color="orange" />
        <Ink id="ink2" at="700,300" shape="star" w="28" h="28" color="violet" />

        <Panel id="p-a" title="판은 무엇을 주나">
        <p>
          판(Board)과, 판 위에서 사는 법(Item)과, 보편적인 조각(Sticky·Ink)입니다. 조각을 끌고
          고르고 키우고 돌리는 일, 되돌리기, 화면 이동과 확대는 전부 판이 맡습니다.
        </p>
        </Panel>

        <Panel id="p-b" title="구조 조각은 쓰는 쪽이 만든다">
        <p>
          이 화면의 프레임 같은 조각은 라이브러리에 없습니다. 화면마다 필요한 모양이 다르기
          때문입니다. <code>Item</code> 을 두르면 끌기·선택·크기·회전이 전부 따라옵니다.
        </p>
        </Panel>

        <Panel id="p-c" title="지울 수 있는 것과 없는 것">
        <p>
          판에 미리 놓인 구조 조각은 지울 수 없습니다 — 지우려 하면 붉어지며 고개를 젓습니다.
          보는 사람이 얹은 것(쪽지·스티커·펜 획)은 지울 수 있고, 「처음으로」가 되돌립니다.
        </p>
        </Panel>

        <Panel id="p-use" title="조작">
        <ul>
          <li>조각 끌기 · 누르면 오른쪽 글로</li>
          <li>빈 곳 끌기 = 여러 개 선택 · 스페이스+끌기 = 판 이동</li>
          <li>휠 = 판 이동 · ⌘+휠 = 확대</li>
          <li>빈 곳 더블클릭 = 쪽지</li>
          <li>V 선택 · P 펜 · S 스티커 · Esc 그만두기</li>
          <li>⌘Z 되돌리기 · ⇧⌘Z 다시 하기</li>
        </ul>
        </Panel>
      </Board>
    </div>
  );
}
