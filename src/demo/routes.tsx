// design-system/src/demo/routes.tsx
// LNB item 관리
// 경로 설정

import type { ReactNode } from 'react';

import Overview from './pages/Overview';
import ButtonDemo from './pages/ButtonDemo';
import CheckboxDemo from './pages/CheckboxDemo';
import InputDemo from './pages/InputDemo';
import SwitchDemo from './pages/SwitchDemo';

export type DSRoute = {
  to: string;
  label: string;
  element: ReactNode;
  tooltip?: string;
  end?: boolean;
};

export const DS_ROUTES: DSRoute[] = [
  {
    to: '/',
    label: 'Overview',
    element: <Overview />,
    end: true,
  },
  {
    to: '/button',
    label: 'Button',
    element: <ButtonDemo />,
  },
  {
    to: '/checkbox',
    label: 'Checkbox',
    element: <CheckboxDemo />,
  },
  {
    to: '/input',
    label: 'Input',
    element: <InputDemo />,
  },  
  {
    to: '/switch',
    label: 'Switch',
    element: <SwitchDemo />,
  },
];