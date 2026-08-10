// lds/vite.config.site.ts
//
// 데모 사이트(index.html → src/demo/main.tsx) 를 정적 사이트로 굽는 설정.
//
// vite.config.ts 는 build.lib 이 걸린 «npm 패키지» 빌드다 — 그대로 돌리면
// index.es.js/index.cjs.js 만 나오고 index.html 이 없어 배포할 게 없다.
// 그 설정을 그대로 물려받되 build 만 사이트용으로 갈아끼운다.
// (react 를 external 로 빼지 않는다 — 사이트는 스스로 실행돼야 한다)
//
//   npx vite build --config vite.config.site.ts   → dist-site/

import { defineConfig, type UserConfig } from 'vite';
import baseConfig from './vite.config';

const base = baseConfig as UserConfig;

export default defineConfig({
  ...base,
  build: {
    outDir: 'dist-site',
    emptyOutDir: true,
    minify: 'esbuild',
    target: 'esnext',
  },
});
