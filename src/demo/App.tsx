// design-system/src/demo/App.tsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DemoLayout from './shell/DemoLayout';
import { DS_ROUTES } from './routes';

// iframe일 때 부모(app-shell) 테마 수신; 단독 실행 시 localStorage + OS 테마
function useThemeFromParent() {
  React.useEffect(() => {
    const stored = localStorage.getItem('ds-demo-theme') as 'light' | 'dark' | null;
    const systemTheme = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initial = stored === 'dark' || stored === 'light' ? stored : systemTheme;
    document.documentElement.setAttribute('data-theme', initial);

    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === 'DS_THEME' && e.data?.theme) {
        document.documentElement.setAttribute('data-theme', e.data.theme);
        localStorage.setItem('ds-demo-theme', e.data.theme);
      }
      if (e.data?.type === 'APP_SHELL_SCROLL_TOP') {
        const isMain = window.location.pathname === '/' || window.location.pathname === '';
        if (isMain) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          window.location.href = '/';
        }
      }
    };
    window.addEventListener('message', onMessage);
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'DS_READY' }, '*');
    }
    return () => window.removeEventListener('message', onMessage);
  }, []);
}

export default function App() {
  useThemeFromParent();

  return (
    <Routes>
      <Route element={<DemoLayout />}>
        {DS_ROUTES.map((r) => (
          <Route key={r.to} path={r.to} element={r.element} />
        ))}
        <Route path='*' element={<Navigate to='/' replace />} />
      </Route>
    </Routes>
  );
}