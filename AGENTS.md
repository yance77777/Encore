# Repository Guidelines

Encore (余响) is a concert-tracking app: React 19 + Vite component-based frontend, Node.js + Express backend, JSON-file storage. Keep changes small and consistent with the existing structure.

## Project Structure & Module Organization

- `frontend/` — React 源码目录：8 个 HTML 入口（`index.html` 等）、`src/`（`store.jsx` / `components/` / `pages/`）、`style.css`、`data/`、`assets/`；`dist/` 为构建产物（本地生成，不入库）。
- `backend/` — Express server (`server.js`) that serves `frontend/dist`（未构建时回退源码目录）、exposes JSON APIs, and reads/writes `frontend/data/users.json`.
- `scripts/` — one-off converters (e.g. `convert_china_map.js`) 与冒烟测试（`react_smoke_test.mjs`）。
- `package.json` / `vite.config.mjs` — React 19 + Vite 多页面构建配置。
- `.github/workflows/deploy.yml` — 推送 `main` 后自动构建并将 `frontend/dist` 发布到 GitHub Pages。
- `archive/` and `V0存档.md` — release history kept locally, not pushed to GitHub; `.trae/specs/<version>/` holds planning specs and checklists (gitignored).

## Build, Test, and Development Commands

- 根目录 `npm install` — 安装 React/Vite 依赖；`cd backend && npm install` — install Express。
- `npm run dev` — Vite 开发服务器（`http://localhost:5173`）。
- `npm run build` — 构建到 `frontend/dist`；`npm run preview` — 本地预览产物。
- `npm start` (or `npm run dev`) — run the server at `http://localhost:3000`; the frontend is served from `frontend/`.
- 冒烟测试：先启动后端或 preview，再运行 `node scripts/react_smoke_test.mjs`（自动调用无头 Chrome/Edge 逐页验证并截图；测试会拦截 `/api/user/*` 写请求，不会污染 `users.json`）。
- 部署：GitHub Actions 执行 `npm ci && npm run build` 后上传 `frontend/dist`。

## Coding Style & Naming Conventions

- 2-space indentation in JS, CSS, and JSON; no inline styles.
- JS/JSX: camelCase functions/variables, UPPER_CASE constants, numbered section banners with Chinese comments (matching `src/store.jsx` 等模块)。
- CSS: reuse the design tokens and class system in `style.css`; do not create a parallel theme.
- Data IDs: lowercase kebab-case venues (`bj-niaocao`), short artist IDs (`jay`, `jj`); image filenames match venue IDs (`assets/venues/<id>.jpg`, `assets/venues/unlit/<id>.jpg`).
- Keep data files valid UTF-8 JSON and sync the version (`v2.0.0`) across `package.json`（根目录与 backend）、`README.md`，以及 header comments when behavior changes.

## Testing Guidelines

No automated test framework exists — testing is manual and checklist-driven. Run the backend and verify pages, map linkage, filters, and themes. After data changes, confirm JSON parses and counts stay consistent. Maintain checklists in `.trae/specs/<version>/checklist.md`; never commit real personal data (`users.json` is a demo set).

## Commit & Pull Request Guidelines

Git history uses version-driven Chinese messages, e.g. `V0.6.0 数据真实性+歌手选择联动+新场馆+性能优化`, with `docs:` or `修复` prefixes for smaller patches. Lead with the version when it changes; otherwise describe the fix concisely.

PRs must state what changed and why, link the relevant spec or issue, include screenshots for visual or asset changes, and pass a local run before opening.

## Data & Asset Updates

Verify concert and venue data against public sources (Weibo, Baidu, ticketing platforms) before committing. New venues need an ID, a lit image, and a matching unlit image. Use `YYYY-MM-DD` dates or explicit ranges for multi-day shows.
