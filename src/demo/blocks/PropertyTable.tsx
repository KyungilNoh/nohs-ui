// design-system/src/components/PropertyTable.tsx

'use client';

import React from 'react';

type BlurColumnKey = 'name' | 'description' | 'type';

interface Property {
  name: string;
  type: string;
  default?: string;
  description: string;

  blur?: boolean;
  blurColumns?: BlurColumnKey[];
}

interface PropertyTableProps {
  data: Property[];
  blurRowIndex?: number;
  blurColumns?: BlurColumnKey[];

  /**
   * ✅ 하단 페이드 효과
   * - 테이블을 침범하지 않는 순수 시각적 페이드
   */
  fadeBottom?: boolean;

  /** (선택) 페이드 높이 */
  fadeHeightPx?: number;
}

const HEADER_H = 54;

export const PropertyTable = ({
  data,
  blurRowIndex,
  blurColumns,
  fadeBottom = true,
  fadeHeightPx = 96,
}: PropertyTableProps) => {
  if (!data || !Array.isArray(data)) {
    return (
      <div className='p-4 rounded-xl border border-outline bg-surface-alt text-onsurface'>
        <span className='text-sm text-muted'>표시할 데이터가 없습니다.</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className='p-8 text-center rounded-xl border border-dashed border-outline bg-surface-alt'>
        <span className='text-sm text-muted'>정의된 API 속성이 없습니다.</span>
      </div>
    );
  }

  const defaultCols: BlurColumnKey[] = ['name', 'description', 'type'];
  const tableCols: BlurColumnKey[] = blurColumns ?? defaultCols;
  const blurClass = 'blur-[2px] opacity-60';

  // ✅ border-b 대신 inset shadow로 라인 (레이아웃 영향 0)
  // 토큰 기반으로 변경
  const headerLine = 'shadow-[inset_0_-1px_0_0_rgb(var(--color-outline))]';

  return (
    <div className='relative overflow-hidden rounded-xl border border-outline bg-surface shadow-sm'>
      <div className='overflow-x-auto'>
        <table className='w-full text-left text-sm border-collapse min-w-[640px]'>
          <thead>
            <tr className={['bg-surface', headerLine].join(' ')}>
              <th
                className={[
                  'box-border px-6 py-0 align-middle',
                  `h-[${HEADER_H}px]`,
                  'font-medium tracking-wider text-[12px] leading-none w-[20%]',
                  'text-onsurface',
                ].join(' ')}
              >
                Property
              </th>

              <th
                className={[
                  'box-border px-6 py-0 align-middle',
                  `h-[${HEADER_H}px]`,
                  'font-medium tracking-wider text-[12px] leading-none w-[50%]',
                  'text-onsurface',
                ].join(' ')}
              >
                Description
              </th>

              <th
                className={[
                  'box-border px-6 py-0 align-middle',
                  `h-[${HEADER_H}px]`,
                  'font-medium tracking-wider text-[12px] leading-none w-[30%]',
                  'text-onsurface',
                ].join(' ')}
              >
                Type
              </th>
            </tr>
          </thead>

          <tbody className='divide-y divide-outline'>
            {data.map((prop, idx) => {
              const shouldBlurRow =
                typeof blurRowIndex === 'number'
                  ? idx === blurRowIndex
                  : prop.blur === true;

              const rowCols: BlurColumnKey[] = prop.blurColumns ?? tableCols;
              const isBlur = (k: BlurColumnKey) =>
                shouldBlurRow && rowCols.includes(k);

              return (
                <tr
                  key={`${prop.name}-${idx}`}
                  className='hover:bg-[rgb(var(--color-primary)/0.03)] transition-colors'
                >
                  <td className='px-6 py-4 font-mono font-semibold text-[13px] align-top text-onsurface'>
                    <span className={isBlur('name') ? blurClass : ''}>
                      {prop.name}
                    </span>
                  </td>

                  <td className='px-6 py-4 font-normal text-[13px] align-top text-onsurface'>
                    <span className={isBlur('description') ? blurClass : ''}>
                      {prop.description}
                    </span>
                  </td>

                  <td className='px-6 py-4 align-top max-w-[30%]'>
                    <code
                      className={[
                        'font-mono text-[13px] break-words block',
                        // DS에 code 토큰이 없으면 우선 primary로 통일
                        'text-primary',
                        isBlur('type') ? blurClass : '',
                      ].join(' ')}
                    >
                      {prop.type.split('\n').map((line, i) => (
                        <div key={i}>{line.trimStart()}</div>
                      ))}
                    </code>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ✅ 페이드는 border를 침범하지 않게 "안쪽(1px)"에서만 */}
      {fadeBottom && (
        <div
          className='pointer-events-none absolute inset-[1px] rounded-[11px] overflow-hidden'
          aria-hidden='true'
        >
          <div
            className='absolute inset-x-0 bottom-0'
            style={{
              height: `${fadeHeightPx}px`,
              background:
                'linear-gradient(to bottom, rgb(var(--color-surface) / 0) 0%, rgb(var(--color-surface) / 0.7) 40%, rgb(var(--color-surface) / 1) 100%)',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default PropertyTable;
