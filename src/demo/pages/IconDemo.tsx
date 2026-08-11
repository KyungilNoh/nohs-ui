// nohs-ui/src/demo/pages/IconDemo.tsx

'use client';

import React, { useMemo, useState } from 'react';
import LiveDemoTemplate from '../LiveDemoTemplate';
import { D } from '../previewDefaults';

import { Icon, Input, Select } from '@ds';
import type { IconName } from '@ds';
import { PropertyTable } from '@dds';

type FontSize = 'small' | 'medium' | 'large';

/** IconName 은 MUI 아이콘 전체 키라 후보가 수천 개다 — 자주 쓰는 것만 목록으로 두고, 나머지는 직접 입력 */
const COMMON: IconName[] = [
  'SmartToy', 'Check', 'Close', 'Add', 'Remove', 'Search',
  'ArrowBack', 'ArrowForward', 'ExpandMore', 'Settings', 'Person', 'Delete',
] as IconName[];

export default function IconDemoPage() {
  const [name, setName] = useState<IconName>(D.Icon.name as IconName);
  const [custom, setCustom] = useState('');
  const [fontSize, setFontSize] = useState<FontSize>(D.Icon.fontSize);

  const active = (custom.trim() || name) as IconName;

  // 프리뷰는 «지금 고른 것» 하나만 보여준다 — 옆에 다른 아이콘을 늘어놓으면
  // 무엇이 선택된 것인지 흐려지고, 컨트롤을 바꿔도 변화가 눈에 안 들어온다.
  const demo = <Icon name={active} fontSize={fontSize} />;

  const controls = useMemo(
    () => (
      <>
        <Select label='Name' value={name} onChange={(e) => setName(e.target.value as IconName)}
          options={COMMON.map((n) => ({ value: n as string, label: n as string }))} fullWidth
          disabled={!!custom.trim()} />
        <Input label='Name (type one)' value={custom} onChange={(e) => setCustom(e.target.value)}
          placeholder='e.g. FavoriteBorder' fullWidth
          description='Any MUI icon name. Leave empty to use the list above.' />
        <Select label='Font size' value={fontSize} onChange={(e) => setFontSize(e.target.value as FontSize)}
          options={[{ value: 'small', label: 'small' }, { value: 'medium', label: 'medium' }, { value: 'large', label: 'large' }]}
          fullWidth />
      </>
    ),
    [name, custom, fontSize]
  );

  const usageCode = useMemo(
    () => `<Icon name='${active}'${fontSize !== 'medium' ? ` fontSize='${fontSize}'` : ''} />`,
    [active, fontSize]
  );

  const properties = useMemo<React.ComponentProps<typeof PropertyTable>['data']>(
    () => [
      { name: 'name', description: 'MUI icon name. The type covers every key, so typos fail at compile time.', type: 'IconName' },
      { name: 'fontSize', description: 'Size. Also accepts a number or a px / rem / em string.', type: `'small' | 'medium' | 'large' | number | \`\${number}px\`` },
      { name: 'color', description: 'Colour. Accepts a MUI colour token or any CSS colour.', type: `SvgIconProps['color'] | string` },
      { name: 'className', description: 'Extra classes.', type: 'string' },
    ],
    []
  );

  return (
    <LiveDemoTemplate title='Icon'
      description='MUI icon wrapper. Call it by name; size and colour come from tokens.'
      usageCode={usageCode} properties={properties} controls={controls}>
      {demo}
    </LiveDemoTemplate>
  );
}
