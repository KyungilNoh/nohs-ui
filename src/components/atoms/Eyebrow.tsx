// design-system/src/components/atoms/Eyebrow.tsx

import React from 'react';

type EyebrowAlign = 'left' | 'center' | 'right';
type EyebrowTone = 'default' | 'muted' | 'primary';

export interface EyebrowProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: EyebrowAlign;
  tone?: EyebrowTone;
}

const toneStyles: Record<EyebrowTone, string> = {
  default: 'text-onsurface/70',
  muted: 'text-onsurface/50',
  primary: 'text-primary/80',
};

export const Eyebrow: React.FC<EyebrowProps> = ({
  align = 'left',
  tone = 'primary',
  className,
  children,
  ...rest
}) => {
  const alignClass =
    align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

  const classes = [
    'font-sans text-[11px] md:text-xs font-semibold',
    'uppercase tracking-wider',
    toneStyles[tone],
    alignClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
};

export default Eyebrow;
