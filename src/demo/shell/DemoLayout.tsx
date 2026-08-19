// design-system/src/demo/shell/DemoLayout.tsx
// iframe: app-shell 테마 토글 사용. 단독 실행: 자체 ThemeToggle 표시

import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import DemoNav from './DemoNav';
import { ThemeToggle } from '@ds';

const isStandalone = () => typeof window !== 'undefined' && window.self === window.top;

export default function DemoLayout() {
  const [standalone, setStandalone] = React.useState(false);
  const { pathname } = useLocation();

  React.useEffect(() => {
    setStandalone(isStandalone());
  }, []);

  /* 라우터는 스크롤을 건드리지 않는다. 탭만 갈리고 문서 오프셋은 그대로 남아,
     길게 내려 본 뒤 다른 탭으로 가면 그 페이지 중간부터 보이게 된다. 위에서 시작시킨다. */
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

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