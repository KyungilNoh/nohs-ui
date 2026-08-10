// design-system/src/components/atoms/Title.tsx

import React from 'react';

type TitleLevel = 1 | 2 | 3 | 4;
type TitleAlign = 'left' | 'center' | 'right';
type TitleWeight = 'semibold' | 'bold' | 'extrabold';

export interface TitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: TitleLevel;
  align?: TitleAlign;
  weight?: TitleWeight;
}

const levelStyles: Record<TitleLevel, string> = {
  1: 'text-3xl md:text-4xl',
  2: 'text-2xl md:text-3xl',
  3: 'text-xl md:text-2xl',
  4: 'text-lg md:text-xl',
};

const weightStyles: Record<TitleWeight, string> = {
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
};

export const Title: React.FC<TitleProps> = ({
  level = 1,
  align = 'left',
  weight = 'semibold',
  className,
  children,
  ...rest
}) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  const alignClass =
    align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

  const classes = [
    'font-sans text-onsurface tracking-tight',
    'leading-tight',
    levelStyles[level],
    weightStyles[weight],
    alignClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return React.createElement(Tag, { className: classes, ...rest }, children);
};

export default Title;
