// design-system/src/components/atoms/Paragraph.tsx

import React from 'react';

type ParagraphSize = 'sm' | 'md' | 'lg';
type ParagraphWeight = 'light' | 'regular' | 'medium';
type ParagraphAlign = 'left' | 'center' | 'right';
type ParagraphTone = 'default' | 'muted' | 'strong';

export interface ParagraphProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: ParagraphSize;
  weight?: ParagraphWeight;
  align?: ParagraphAlign;
  tone?: ParagraphTone;
}

const sizeStyles: Record<ParagraphSize, string> = {
  sm: 'text-xs md:text-sm',
  md: 'text-sm md:text-base',
  lg: 'text-base md:text-lg',
};

const weightStyles: Record<ParagraphWeight, string> = {
  light: 'font-light',
  regular: 'font-normal',
  medium: 'font-medium',
};

const toneStyles: Record<ParagraphTone, string> = {
  default: 'text-onsurface/80',
  muted: 'text-onsurface/60',
  strong: 'text-onsurface',
};

export const Paragraph: React.FC<ParagraphProps> = ({
  size = 'md',
  weight = 'regular',
  tone = 'default',
  align = 'left',
  className,
  children,
  ...rest
}) => {
  const alignClass =
    align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

  const classes = [
    'font-sans leading-relaxed',
    sizeStyles[size],
    weightStyles[weight],
    toneStyles[tone],
    alignClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <p className={classes} {...rest}>
      {children}
    </p>
  );
};

export default Paragraph;
