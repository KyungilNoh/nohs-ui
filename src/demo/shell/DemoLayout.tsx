// design-system/src/demo/shell/DemoLayout.tsx
// iframe: app-shell 테마 토글 사용. 단독 실행: 자체 ThemeToggle 표시

import React from 'react';
import { Outlet } from 'react-router-dom';
import DemoNav from './DemoNav';
import { ThemeToggle } from '@ds';

const isStandalone = () => typeof window !== 'undefined' && window.self === window.top;

export default function DemoLayout() {
  const [standalone, setStandalone] = React.useState(false);

  React.useEffect(() => {
    setStandalone(isStandalone());
  }, []);

  return (
    <div className='demoShell'>
      <DemoNav />

      {standalone && (
        <div
          style={{
            position: 'fixed',
            top: 16,
            right: 32,
            zIndex: 2147483647,
            pointerEvents: 'auto',
          }}
        >
          <ThemeToggle storageKey="ds-demo-theme" />
        </div>
      )}

      <main className='demoMain'>
        <Outlet />
      </main>

      <style>{`
        .demoMain {
          margin-left: var(--ds-nav-w, 240px);
          min-height: 100vh;
        }
      `}</style>
    </div>
  );
}