// nohs-ui/src/demo/catalog.tsx
//
// 컴포넌트 목록의 단일 소유자. Molecules · Atoms 페이지와 Overview 가 함께 읽는다.
// 썸네일은 캡처 이미지가 아니라 «실물» 이다 — 컴포넌트가 바뀌면 목록도 같이 바뀐다.
// 이미지로 두면 어긋나는 순간부터 거짓말이 되고, 어긋난 걸 알아챌 방법도 없다.

'use client';

import React from 'react';
import {
  Button,
  Card,
  Checkbox,
  ErrorText,
  Eyebrow,
  HelperText,
  Icon,
  Input,
  Label,
  Paragraph,
  SectionHeader,
  Select,
  Subtitle,
  SuccessText,
  Switch,
  Tag,
  Textarea,
  Title,
} from '@ds';

export interface Entry {
  title: string;
  description: string;
  href: string;
  preview: React.ReactNode;
}

export const MOLECULES: Entry[] = [
  {
    title: 'Button',
    description: 'Triggers an action. 4 variants · 3 sizes · left/right icons · icon-only.',
    href: '/button',
    preview: (
      <div className='flex items-center gap-2'>
        <Button variant='primary' size='sm'>Primary</Button>
        <Button variant='secondary' size='sm'>Secondary</Button>
        <Button variant='ghost' size='sm'>Ghost</Button>
      </div>
    ),
  },
  {
    title: 'Input',
    description: 'Single-line input. Bundles label, description, error and success into one accessible unit.',
    href: '/input',
    preview: <Input label='Email' placeholder='name@example.com' size='sm' fullWidth />,
  },
  {
    title: 'Textarea',
    description: 'Multi-line input. Follows the same label / description / error contract as Input.',
    href: '/textarea',
    preview: <Textarea label='Message' placeholder='Write something' size='sm' fullWidth />,
  },
  {
    title: 'Select',
    description: 'Pick one from a list. Items are passed as an options array.',
    href: '/select',
    preview: (
      <Select
        label='Theme'
        size='sm'
        fullWidth
        defaultValue='light'
        options={[
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
        ]}
      />
    ),
  },
  {
    title: 'Checkbox',
    description: 'Pick many from many. Supports the indeterminate state.',
    href: '/checkbox',
    preview: (
      <div className='flex flex-col gap-1.5'>
        <Checkbox label='Checked' defaultChecked size='sm' />
        <Checkbox label='Indeterminate' indeterminate size='sm' />
      </div>
    ),
  },
  {
    title: 'Switch',
    description: 'On/off that applies immediately — no save button in between.',
    href: '/switch',
    preview: (
      <div className='flex flex-col gap-1.5'>
        <Switch label='Notifications' defaultChecked size='sm' />
        <Switch label='Autosave' size='sm' />
      </div>
    ),
  },
  {
    title: 'Card',
    description: 'A surface that holds content. Four elevation steps give it depth.',
    href: '/card',
    preview: (
      <Card elevation='md'>
        <div className='px-4 py-3'>
          <Subtitle as='p'>Card</Subtitle>
          <Paragraph size='sm' tone='muted'>elevation=md</Paragraph>
        </div>
      </Card>
    ),
  },
  {
    title: 'SectionHeader',
    description: 'Eyebrow, Title and Paragraph bound into one section head.',
    href: '/section-header',
    preview: (
      <SectionHeader eyebrow='Section' title='Section title' description='A short line about what this section covers.' />
    ),
  },
];

export const ATOMS: Entry[] = [
  {
    title: 'Title',
    description: 'Document heading. Choose h1–h6 with level, then weight and align.',
    href: '/title',
    preview: <Title level={3}>A heading</Title>,
  },
  {
    title: 'Subtitle',
    description: 'Supporting heading under a Title. Renders as h2, h3 or p.',
    href: '/subtitle',
    preview: <Subtitle as='p'>A supporting heading</Subtitle>,
  },
  {
    title: 'Paragraph',
    description: 'Body text. 3 sizes · 3 weights · 3 tones.',
    href: '/paragraph',
    preview: <Paragraph size='sm'>Body copy sized and spaced for reading.</Paragraph>,
  },
  {
    title: 'Eyebrow',
    description: 'A small label above a heading. Names the section before you read it.',
    href: '/eyebrow',
    preview: <Eyebrow tone='primary'>EYEBROW</Eyebrow>,
  },
  {
    title: 'Label',
    description: 'Names a form control. htmlFor binds it so clicks and screen readers both work.',
    href: '/label',
    preview: <Label htmlFor='ov-label' size='md'>Label</Label>,
  },
  {
    title: 'HelperText',
    description: 'Guidance under an input. Says what to type before you get it wrong.',
    href: '/helper-text',
    preview: <HelperText>Use at least 8 characters.</HelperText>,
  },
  {
    title: 'ErrorText',
    description: 'Error message under an input. Says what went wrong.',
    href: '/error-text',
    preview: <ErrorText>That is not a valid email.</ErrorText>,
  },
  {
    title: 'SuccessText',
    description: 'Success message under an input. Confirms it passed, in place.',
    href: '/success-text',
    preview: <SuccessText>That name is available.</SuccessText>,
  },
  {
    title: 'Tag',
    description: 'A chip for status or category. 5 variants, optional icon and remove button.',
    href: '/tag',
    preview: (
      <div className='flex items-center gap-1.5'>
        <Tag variant='primary' size='sm'>primary</Tag>
        <Tag variant='success' size='sm'>success</Tag>
        <Tag variant='danger' size='sm'>danger</Tag>
      </div>
    ),
  },
  {
    title: 'Icon',
    description: 'MUI icon wrapper. Call it by name; size and colour come from tokens.',
    href: '/icon',
    preview: (
      <div className='flex items-center gap-3'>
        <Icon name='SmartToy' fontSize='large' />
        <Icon name='Check' fontSize='large' />
        <Icon name='ArrowForward' fontSize='large' />
      </div>
    ),
  },
];
