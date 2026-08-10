// design-system/src/components/atoms/Subtitle.tsx

import React from 'react';

type SubtitleAs = 'h2' | 'h3' | 'p';
type SubtitleAlign = 'left' | 'center' | 'right';
type SubtitleWeight = 'regular' | 'medium' | 'semibold';
type SubtitleTone = 'default' | 'muted';

export interface SubtitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: SubtitleAs;
  align?: SubtitleAlign;
  weight?: SubtitleWeight;
  tone?: SubtitleTone;
}

const weightStyles: Record<SubtitleWeight, string> = {
  regular: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
};

const toneStyles: Record<SubtitleTone, string> = {
  default: 'text-onsurface',
  muted: 'text-onsurface/70',
};

export const Subtitle: React.FC<SubtitleProps> = ({
  as = 'h2',
  align = 'left',
  weight = 'medium',
  tone = 'default',
  className,
  children,
  ...rest
}) => {
  const Tag = as as keyof JSX.IntrinsicElements;

  const alignClass =
    align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

  const classes = [
    'font-sans tracking-tight',
    'text-lg md:text-xl',
    'leading-snug',
    weightStyles[weight],
    toneStyles[tone],
    alignClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return React.createElement(Tag, { className: classes, ...rest }, children);
};

export default Subtitle;
