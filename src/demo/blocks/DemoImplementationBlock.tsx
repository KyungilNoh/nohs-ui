// design-system/src/demo/blocks/DemoImplementationBlock.tsx

'use client';

import React, { useState, type ReactNode } from 'react';
import { Button } from '@ds';
import DemoCard from './DemoCard';
import DemoSectionHeader from './DemoSectionHeader';

interface DemoImplementationBlockProps {
  title?: string;
  code: string;
  right?: ReactNode;
}

export default function DemoImplementationBlock({
  title = 'Implementation',
  code,
  right,
}: DemoImplementationBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    // 1) modern clipboard
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
        return;
      }
    } catch (err) {
      // fallback으로 진행
      console.error('clipboard.writeText 실패:', err);
    }

    // 2) fallback
    const textarea = document.createElement('textarea');
    textarea.value = code;
    textarea.setAttribute('readonly', 'true');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';

    document.body.appendChild(textarea);
    textarea.select();

    try {
      const ok = document.execCommand('copy');
      if (ok) {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
      }
    } catch (err) {
      console.error('복사 실패:', err);
    } finally {
      document.body.removeChild(textarea);
    }
  };

  return (
    // ✅ 이 블록만 항상 다크 (전역 테마 무관)
    <div data-theme='dark'>
      <DemoCard className='p-0'>
        <DemoSectionHeader
          title={title}
          right={
            right ?? (
              <Button
                variant='ghost'
                size='sm'
                onClick={handleCopy}
                leftIconName={copied ? 'Check' : 'ContentCopy'}
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
            )
          }
        />

        {/* ✅ 헤더 아래 바디 영역 래퍼: 위 라운드 0 / 아래만 라운드 + focus-within 링 */}
        <div className='rounded-t-none rounded-b-xl overflow-hidden ds-focus-inset-ring'>
          <pre
            tabIndex={0}
            className='overflow-x-auto p-6 text-[13px] leading-relaxed text-onsurface'
            style={{ colorScheme: 'dark' }}
          >
            <code className='font-mono'>{code}</code>
          </pre>
        </div>
      </DemoCard>
    </div>
  );
}