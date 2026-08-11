// nohs-ui/src/demo/navMap.ts
//
// 경로 사이의 «소속» 만 담는다. 컴포넌트를 import 하지 않는 게 이 파일의 요점이다 —
// routes.tsx 는 페이지를 import 하므로, LiveDemoTemplate 이 routes 를 부르면
// 순환이 생긴다. 지도만 떼어 두면 양쪽이 같은 사실을 보면서도 엮이지 않는다.

export interface NavSection {
  path: string;
  label: string;
}

export const SECTIONS: NavSection[] = [
  { path: '/', label: 'Overview' },
  { path: '/tokens', label: 'Tokens' },
  { path: '/atoms', label: 'Atoms' },
  { path: '/molecules', label: 'Molecules' },
];

/** 개별 데모 경로 → 속한 섹션 */
export const PARENT_OF: Record<string, string> = {
  '/button': '/molecules',
  '/input': '/molecules',
  '/textarea': '/molecules',
  '/select': '/molecules',
  '/checkbox': '/molecules',
  '/switch': '/molecules',
  '/card': '/molecules',
  '/section-header': '/molecules',

  '/title': '/atoms',
  '/subtitle': '/atoms',
  '/paragraph': '/atoms',
  '/eyebrow': '/atoms',
  '/label': '/atoms',
  '/helper-text': '/atoms',
  '/error-text': '/atoms',
  '/success-text': '/atoms',
  '/tag': '/atoms',
  '/icon': '/atoms',
};

/** 현재 경로가 어느 섹션에 속하는지. 섹션 자신이면 자기 자신 */
export function sectionPathFor(pathname: string): string {
  return PARENT_OF[pathname] ?? pathname;
}

/** 개별 데모라면 돌아갈 섹션, 섹션 자신이면 null */
export function backSectionFor(pathname: string): NavSection | null {
  const parent = PARENT_OF[pathname];
  if (!parent) return null;
  return SECTIONS.find((s) => s.path === parent) ?? null;
}
