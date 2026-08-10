// design-system/src/components/molecules/SectionHeader.tsx

import React from 'react';
import { Title } from '../atoms/Title';
import { Eyebrow } from '../atoms/Eyebrow';
import { Paragraph } from '../atoms/Paragraph';

interface SectionHeaderProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  title,
  description,
  className,
  align = 'left',
}) => {
  const alignClass =
    align === 'center'
      ? 'items-center text-center'
      : align === 'right'
      ? 'items-end text-right'
      : 'items-start text-left';

  return (
    <div className={`flex flex-col gap-1 ${alignClass} ${className ?? ''}`}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <Title level={2} align={align}>
        {title}
      </Title>
      {description && (
        <Paragraph
          size='sm'
          align={align}
          className='mt-1 text-onsurface/70'
        >
          {description}
        </Paragraph>
      )}
    </div>
  );
};
