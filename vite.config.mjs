/* 余响 Encore v2.0.0 · Vite 多页面配置（8 个 HTML 入口保持原 URL） */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

const entry = (name) => resolve(import.meta.dirname, 'frontend', name + '.html');

export default defineConfig({
  root: 'frontend',
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: entry('index'),
        map: entry('map'),
        tours: entry('tours'),
        gallery: entry('gallery'),
        identity: entry('identity'),
        member: entry('member'),
        meet: entry('meet'),
        expense: entry('expense')
      }
    }
  },
  server: {
    port: 5173,
    open: false
  }
});
