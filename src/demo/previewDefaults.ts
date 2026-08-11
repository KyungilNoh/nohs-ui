// nohs-ui/src/demo/previewDefaults.ts
//
// «컴포넌트의 기본 프리뷰» 의 단일 소유자.
//
// 목록 카드와 상세의 Preview 는 같은 것을 보여줘야 한다. 그런데 값을 두 군데에
// 적어두면 반드시 갈린다 — 실제로 Paragraph 는 카드가 sm, 상세가 md 였고
// Checkbox 는 카드에 두 개, 상세에 한 개였다.
//
// 여기 적힌 값을 카드(previews.tsx)와 상세 데모(useState 초기값)가 함께 읽는다.
// 값을 바꾸려면 이 파일만 고치면 두 곳이 같이 바뀐다.

export const D = {
  // ── Atoms ───────────────────────────────────────────────
  Title: { text: 'A heading', align: 'left', weight: 'bold' },
  Subtitle: { text: 'A supporting heading', as: 'h3', align: 'left', weight: 'medium', tone: 'default' },
  Paragraph: {
    text: 'Body copy sized and spaced for reading.',
    size: 'md',
    weight: 'regular',
    align: 'left',
    tone: 'default',
  },
  Eyebrow: { text: 'EYEBROW', align: 'left', tone: 'default' },
  Label: { text: 'Label', as: 'label', variant: 'field', size: 'md', hidden: false },
  HelperText: { text: 'Use at least 8 characters.', size: 'md' },
  ErrorText: { text: 'That is not a valid email.', size: 'md' },
  SuccessText: { text: 'That name is available.', size: 'md' },
  Tag: { text: 'Tag', variant: 'primary', size: 'md' },
  Icon: { name: 'SmartToy', fontSize: 'large' },

  // ── Molecules ───────────────────────────────────────────
  Button: { text: 'Button', variant: 'primary', size: 'md' },
  Input: { label: 'Label', placeholder: 'Placeholder', size: 'md' },

  Textarea: {
    label: 'Message',
    placeholder: 'Write something',
    description: 'Up to 500 characters.',
    size: 'md',
  },
  Select: { label: 'City', description: 'Choose a delivery city.', size: 'md', value: 'seoul' },
  Checkbox: { label: 'Checkbox', size: 'md' },
  Switch: { label: 'Switch', size: 'md', checked: false },
  Card: {
    /** 상세가 max-w-sm 로 담는다 — 카드도 같은 폭이라야 같은 그림이 된다 */
    maxW: 'max-w-sm',
    title: 'Card title',
    body: 'A card is a surface that holds content. Elevation gives it depth.',
    elevation: 'sm',
  },
  SectionHeader: {
    eyebrow: 'SECTION',
    title: 'Section title',
    description: 'One line on what this section covers.',
    align: 'left',
  },
} as const;

/**
 * 프리뷰에 놓이는 폼 컨트롤의 폭.
 *
 * 데모마다 fullWidth 가 제각각이라 Input 190 · Select 678 로 갈려 있었다.
 * 그렇다고 전부 끄면 이번엔 고유 폭이 달라진다(Input 188 · Select 127 —
 * select 는 고른 값 만큼만 넓어진다). 그래서 «같은 폭의 칸을 주고 채우게» 한다.
 */
export const PREVIEW_FULL_WIDTH = true;
export const PREVIEW_FIELD_W = 'w-[320px] max-w-full';

/**
 * as const 로 굳힌다 — align: 'left' 같은 축이 리터럴이라야 useState<TitleAlign>
 * 에 그대로 들어간다. 대신 편집되는 문자열(text·label 등)은 데모 쪽에서
 * useState<string>(...) 으로 받는다. 안 그러면 그 값만 담을 수 있는 상태가 된다.
 */

export const SELECT_OPTIONS = [
  { value: 'seoul', label: 'Seoul' },
  { value: 'busan', label: 'Busan' },
  { value: 'daegu', label: 'Daegu' },
  { value: 'incheon', label: 'Incheon' },
];
