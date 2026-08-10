// design-system/src/components/shell/ThemeToggle.tsx
// app-shell, design-system 데모 등에서 공유하는 테마 토글

import React from 'react';

type Theme = 'light' | 'dark';

export interface ThemeToggleProps {
  /** localStorage 저장 키 (앱별로 분리) */
  storageKey?: string;
}

const DEFAULT_STORAGE_KEY = 'theme';

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeToggle({ storageKey = DEFAULT_STORAGE_KEY }: ThemeToggleProps) {
  const [theme, setTheme] = React.useState<Theme>(() => {
    const stored =
      typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;
    return (stored === 'dark' || stored === 'light' ? stored : null) ?? getSystemTheme();
  });

  const [hovered, setHovered] = React.useState(false);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const icon = hovered ? '🌈' : theme === 'light' ? '🌞' : '🌝';

  return (
    <>
      <div
        className="themeToggleWrap-inner"
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Theme"
          title="Theme"
          className="themeToggle"
        >
          <span className="themeToggle__icon">{icon}</span>
        </button>
      </div>

      <style>{`
        .themeToggleWrap-inner {
          width: 48px;
          height: 48px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          pointer-events: auto;
          cursor: pointer;
        }
        .themeToggle {
          all: unset;
          cursor: pointer;
          width: 36px;
          height: 36px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          position: relative;
          border-radius: 999px;
          isolation: isolate;
        }
        .themeToggle__icon {
          font-size: 20px;
          z-index: 5;
          position: relative;
        }
        .themeToggle::before,
        .themeToggle::after {
          content: '';
          position: absolute;
          inset: -10px;
          border-radius: 999px;
          pointer-events: none;
          opacity: 0;
          transform: scale(0.92);
          filter: blur(14px) saturate(1.05);
          will-change: transform, filter, opacity, border-radius;
          transition:
            opacity 700ms cubic-bezier(0.16, 1, 0.3, 1),
            transform 700ms cubic-bezier(0.16, 1, 0.3, 1),
            filter 700ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .themeToggle::before {
          z-index: 1;
          background:
            radial-gradient(45% 55% at 30% 38%, rgb(255 200 120 / 0.42), transparent 72%),
            radial-gradient(38% 46% at 72% 44%, rgb(255 120 180 / 0.36), transparent 74%);
        }
        .themeToggle::after {
          z-index: 2;
          background:
            radial-gradient(42% 50% at 60% 72%, rgb(120 190 255 / 0.34), transparent 74%),
            radial-gradient(36% 44% at 36% 66%, rgb(190 140 255 / 0.32), transparent 76%);
        }
        .themeToggle:hover::before,
        .themeToggle:focus-visible::before {
          opacity: 0.9;
          transform: scale(1);
          filter: blur(11px) saturate(1.18);
          animation:
            blobSpinA 9s linear infinite,
            blobDriftA 10s ease-in-out infinite,
            blobMorphA 7.2s ease-in-out infinite,
            blobHueA 13s linear infinite;
        }
        .themeToggle:hover::after,
        .themeToggle:focus-visible::after {
          opacity: 0.75;
          transform: scale(1);
          filter: blur(10px) saturate(1.16);
          animation:
            blobSpinB 11s linear infinite reverse,
            blobDriftB 12s ease-in-out infinite,
            blobMorphB 8.6s ease-in-out infinite,
            blobHueB 15s linear infinite;
        }
        :root:not([data-theme='dark']) .themeToggle:hover::before,
        :root:not([data-theme='dark']) .themeToggle:focus-visible::before {
          filter: blur(11px) saturate(1.28);
        }
        :root:not([data-theme='dark']) .themeToggle:hover::after,
        :root:not([data-theme='dark']) .themeToggle:focus-visible::after {
          filter: blur(10px) saturate(1.22);
        }
        :root[data-theme='dark'] .themeToggle::before,
        :root[data-theme='dark'] .themeToggle::after {
          mix-blend-mode: screen;
        }
        :root[data-theme='dark'] .themeToggle:hover::before,
        :root[data-theme='dark'] .themeToggle:focus-visible::before {
          filter: blur(11px) saturate(1.16);
        }
        :root[data-theme='dark'] .themeToggle:hover::after,
        :root[data-theme='dark'] .themeToggle:focus-visible::after {
          filter: blur(10px) saturate(1.14);
        }
        @keyframes blobSpinA {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes blobSpinB {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes blobDriftA {
          0% { translate: 0px 0px; scale: 1; }
          35% { translate: -2px 1.8px; scale: 1.15; }
          70% { translate: 2.2px -1.2px; scale: 0.96; }
          100% { translate: 0px 0px; scale: 1; }
        }
        @keyframes blobMorphA {
          0%, 100% { border-radius: 44% 56% 60% 40% / 48% 48% 52% 52%; }
          50% { border-radius: 70% 30% 46% 54% / 34% 66% 38% 62%; }
        }
        @keyframes blobHueA {
          from { filter: hue-rotate(0deg); }
          to { filter: hue-rotate(140deg); }
        }
        @keyframes blobDriftB {
          0% { translate: 0px 0px; scale: 0.96; }
          45% { translate: 2.6px 1.2px; scale: 1.10; }
          80% { translate: -2.4px -1.8px; scale: 1.02; }
          100% { translate: 0px 0px; scale: 0.96; }
        }
        @keyframes blobMorphB {
          0%, 100% { border-radius: 52% 48% 62% 38% / 60% 40% 60% 40%; }
          55% { border-radius: 28% 72% 48% 52% / 54% 46% 36% 64%; }
        }
        @keyframes blobHueB {
          from { filter: hue-rotate(40deg); }
          to { filter: hue-rotate(220deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .themeToggle::before,
          .themeToggle::after {
            animation: none !important;
            transition: none;
          }
        }
      `}</style>
    </>
  );
}

ThemeToggle.displayName = 'ThemeToggle';
export default ThemeToggle;
