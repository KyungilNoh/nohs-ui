// design-system/vite.config.ts

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  server: { 
    port: 5175,
    // 개발 모드 성능 개선
    hmr: {
      overlay: true,
    },
  },
  // 개발 모드 의존성 최적화
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',
    ],
    // 큰 라이브러리 사전 번들링으로 로딩 속도 개선
    esbuildOptions: {
      target: 'esnext',
    },
  },
  resolve: {
    alias: [
      /**
       * =========================
       * DS Core
       * =========================
       */
      // 1) 가장 구체적인 매핑 먼저
      { find: '@ds', replacement: resolve(__dirname, 'src/index.ts') },
      // 2) 하위 경로 매핑
      { find: /^@ds\/(.*)$/, replacement: resolve(__dirname, 'src/$1') },

      /**
       * =========================
       * Demo Blocks
       * =========================
       */
      // 3) demo/blocks entry
      { find: '@dds', replacement: resolve(__dirname, 'src/demo/blocks/index.ts') },
      // 4) demo/blocks 하위 경로
      {
        find: /^@dds\/(.*)$/,
        replacement: resolve(__dirname, 'src/demo/blocks/$1'),
      },
    ],
  },
  build: {
    // 라이브러리 빌드 (npm 패키지용)
    lib: {
      entry: 'src/index.ts',
      name: 'DesignSystem',
      fileName: (format) => `index.${format}.js`,
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    // 프로덕션 빌드 최적화
    minify: 'esbuild',
    sourcemap: false,
    // 청크 크기 경고 임계값 (데모 페이지는 큰 컴포넌트가 많을 수 있음)
    chunkSizeWarningLimit: 1000,
    // 데모 페이지용 빌드 설정 (별도 빌드 필요 시)
    // 데모 페이지는 개발 모드로만 사용하거나, 필요시 별도 빌드 스크립트 추가 가능
  },
});