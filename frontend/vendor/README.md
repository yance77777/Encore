# Vue 3 本地运行时

本目录存放 GitHub Pages 部署使用的 Vue 3 浏览器版 ESM 运行时，避免依赖外部 CDN。

- `vue.esm-browser.prod.js` — Vue 3.5.41（生产构建，ES Modules）
- `LICENSE.vue.txt` — Vue 官方 MIT 许可证副本

升级方式：替换 `vue.esm-browser.prod.js` 与 `LICENSE.vue.txt` 后，运行 `node scripts/vue_smoke_test.mjs` 回归验证。
