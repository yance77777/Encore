/* 余响 Encore v2.0.0 · 构建后将 data/ 与 assets/ 复制到 dist（保持静态资源路径不变） */
import { cpSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const frontend = resolve(import.meta.dirname, '..', 'frontend');
const dist = resolve(frontend, 'dist');

for (const dir of ['data', 'assets']) {
  const src = resolve(frontend, dir);
  const dest = resolve(dist, dir);
  if (existsSync(src)) {
    mkdirSync(dest, { recursive: true });
    cpSync(src, dest, { recursive: true });
    console.log(`copied ${dir}/ -> dist/${dir}/`);
  }
}
