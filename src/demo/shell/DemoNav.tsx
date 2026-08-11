// design-system/src/demo/shell/DemoNav.tsx

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { DS_NAV_ROUTES, navPathFor } from '../routes';
import '../../styles/index.css';

export default function DemoNav() {
  // 개별 데모(/button 등)에 있어도 그 층(Molecules)이 선택된 채로 남아야 한다 —
  // NavLink 의 isActive 는 자기 경로만 보므로 활성 판정을 직접 한다.
  const { pathname } = useLocation();
  const activePath = navPathFor(pathname);

  return (
    <>
      <style>{`
        .demoNav {
          --ds-nav-w: 240px;

          --ds-bg: rgb(var(--color-surface));
          --ds-border: rgb(var(--color-outline));

          --ds-text: rgb(var(--color-onsurface));
          --ds-text-muted: rgb(var(--color-subtle));

          --ds-hover-layer: rgba(0, 0, 0, 0.05);
          --ds-active-layer: rgba(0, 0, 0, 0.08);

          position: fixed;
          top: 0;
          left: 0;
          width: var(--ds-nav-w);
          height: 100vh;
          background: var(--ds-bg);
          border-right: 1px solid var(--ds-border);
        }

        [data-theme='dark'] .demoNav {
          --ds-hover-layer: rgba(255, 255, 255, 0.06);
          --ds-active-layer: rgba(255, 255, 255, 0.1);
        }

        .demoNavList {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 12px;
        }

        .demoNavItem {
          position: relative;
          height: 40px;
          padding: 0 16px;
          border-radius: 999px;
          display: flex;
          align-items: center;

          color: var(--ds-text-muted);
          text-decoration: none;
          font-size: 14px;
          font-weight: 400;

          transition: background-color 120ms ease, color 120ms ease;
        }

        .demoNavLabel {
          position: relative;
          z-index: 1;
        }

        .demoNavItem:hover {
          background: var(--ds-hover-layer);
          color: var(--ds-text);
        }

        .demoNavGroup {
          padding: 16px 12px 6px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--ds-text-subtle, #94a3b8);
        }
        .demoNavGroup:first-child { padding-top: 6px; }

        .demoNavItem.isActive {
          background: var(--ds-active-layer);
          color: var(--ds-text);
          font-weight: 600;
        }
      `}</style>


      <aside className='demoNav' aria-label='Design System navigation'>
        <nav className='demoNavList'>
          {DS_NAV_ROUTES.map((item) => (
            <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={[
                  'demoNavItem',
                  'ds-focus-visible-ring',
                  activePath === item.to ? 'isActive' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                title={item.tooltip ?? item.label}
              >
                <span className='demoNavLabel'>{item.label}</span>
              </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}