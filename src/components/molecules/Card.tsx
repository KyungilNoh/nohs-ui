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
  /**
   * bg-surface 다. 이전에는 bg-onprimary 였는데, onprimary 는 «primary 위에 얹는
   * 글자·아이콘 색» 이라 카드 배경으로는 의미가 어긋난다. 게다가 라이트·다크
   * 양쪽에서 neutral-100(흰색)으로 고정이라 다크 테마에서 카드만 하얗게 남았다.
   * surface 는 테마별로 갈리므로(라이트 neutral-100 · 다크 neutral-10) 따라온다.
   */
  const base = 'p-4 bg-surface text-onsurface rounded-lg font-sans';

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
