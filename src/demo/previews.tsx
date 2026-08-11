// nohs-ui/src/demo/previews.tsx
//
// 기본 프리뷰의 «그림» 을 여기 한 번만 그린다.
//
// 목록 카드가 이걸 그대로 가져다 쓴다. 상세 데모는 같은 값(previewDefaults)으로
// 초기 상태를 잡으므로, 카드에서 본 것이 상세에서 그대로 보인다.
// 카드용 그림을 따로 그리면 반드시 어긋난다 — 그래서 안 그린다.

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
import type { IconName } from '@ds';
import { D, PREVIEW_FIELD_W, PREVIEW_FULL_WIDTH, SELECT_OPTIONS } from './previewDefaults';

/** 컴포넌트 이름 → 기본 상태로 렌더한 모습 */
export const PREVIEWS: Record<string, React.ReactNode> = {
  // ── Atoms ───────────────────────────────────────────────
  Title: (
    <Title align={D.Title.align} weight={D.Title.weight}>
      {D.Title.text}
    </Title>
  ),
  Subtitle: (
    <Subtitle as={D.Subtitle.as} align={D.Subtitle.align} weight={D.Subtitle.weight} tone={D.Subtitle.tone}>
      {D.Subtitle.text}
    </Subtitle>
  ),
  Paragraph: (
    <Paragraph
      size={D.Paragraph.size}
      weight={D.Paragraph.weight}
      align={D.Paragraph.align}
      tone={D.Paragraph.tone}
    >
      {D.Paragraph.text}
    </Paragraph>
  ),
  Eyebrow: (
    <Eyebrow align={D.Eyebrow.align} tone={D.Eyebrow.tone}>
      {D.Eyebrow.text}
    </Eyebrow>
  ),
  Label: (
    <Label as={D.Label.as} variant={D.Label.variant} size={D.Label.size} htmlFor='preview-label'>
      {D.Label.text}
    </Label>
  ),
  HelperText: <HelperText size={D.HelperText.size}>{D.HelperText.text}</HelperText>,
  ErrorText: <ErrorText size={D.ErrorText.size}>{D.ErrorText.text}</ErrorText>,
  SuccessText: <SuccessText size={D.SuccessText.size}>{D.SuccessText.text}</SuccessText>,
  Tag: (
    <Tag variant={D.Tag.variant} size={D.Tag.size}>
      {D.Tag.text}
    </Tag>
  ),
  Icon: <Icon name={D.Icon.name as IconName} fontSize={D.Icon.fontSize} />,

  // ── Molecules ───────────────────────────────────────────
  Button: (
    <Button variant={D.Button.variant} size={D.Button.size}>
      {D.Button.text}
    </Button>
  ),
  Input: (
    <div className={PREVIEW_FIELD_W}>
      <Input label={D.Input.label} placeholder={D.Input.placeholder} size={D.Input.size} fullWidth={PREVIEW_FULL_WIDTH} />
    </div>
  ),
  Textarea: (
    <div className={PREVIEW_FIELD_W}>
    <Textarea
      label={D.Textarea.label}
      placeholder={D.Textarea.placeholder}
      description={D.Textarea.description}
      size={D.Textarea.size}
      fullWidth={PREVIEW_FULL_WIDTH}
    />
    </div>
  ),
  Select: (
    <div className={PREVIEW_FIELD_W}>
    <Select
      label={D.Select.label}
      description={D.Select.description}
      size={D.Select.size}
      defaultValue={D.Select.value}
      options={SELECT_OPTIONS}
      fullWidth={PREVIEW_FULL_WIDTH}
    />
    </div>
  ),
  Checkbox: <Checkbox label={D.Checkbox.label} size={D.Checkbox.size} />,
  Switch: <Switch label={D.Switch.label} size={D.Switch.size} defaultChecked={D.Switch.checked} />,
  Card: (
    <Card elevation={D.Card.elevation} className={D.Card.maxW}>
      <Subtitle as='p'>{D.Card.title}</Subtitle>
      <Paragraph size='sm' tone='muted' className='mt-1'>
        {D.Card.body}
      </Paragraph>
    </Card>
  ),
  SectionHeader: (
    <SectionHeader
      eyebrow={D.SectionHeader.eyebrow}
      title={D.SectionHeader.title}
      description={D.SectionHeader.description}
      align={D.SectionHeader.align}
    />
  ),
};
