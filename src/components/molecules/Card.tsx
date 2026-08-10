import React, { forwardRef } from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 그림자 단계 (선택 사항) */
  elevation?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { children, className = "", style, elevation = 'sm', ...rest },
  ref
) {
  /** 기본 Tailwind 구조 */
  const base = 'p-4 bg-onprimary text-onsurface rounded-lg font-sans';

  /** elevation 단계별 그림자 */
  const elevationClass =
    elevation === 'none'
      ? 'shadow-none'
      : elevation === 'md'
      ? "shadow-md"
      : elevation === 'lg'
      ? 'shadow-lg'
      : 'shadow-sm'; // 기본값(sm)

  const classes = [base, elevationClass, className].filter(Boolean).join(' ');

  return (
    <div ref={ref} {...rest} className={classes} style={style}>
      {children}
    </div>
  );
});
