# Repository Guidelines

Encore (余响) is a concert-tracking app: Vue 3 component-based frontend, Node.js + Express backend, JSON-file storage. Keep changes small and consistent with the existing structure.

## Project Structure & Module Organization

- `frontend/` — the static app deployed to GitHub Pages: 8 个 HTML 入口（`index.html` 等）、`vue/`（`store.js` / `components/` / `pages/`）、`vendor/`（本地 Vue 3 ESM 运行时）、`style.css`、`data/`（`artists.json`、`venues.json`、`concerts.json`、`users.json`、`china-map.js`），以及 `assets/`（`icons/`、`venues/`、`venues/unlit/`）。
- `backend/` — Express server (`server.js`) that serves the frontend, exposes JSON APIs, and reads/writes `frontend/data/users.json`.
- `scripts/` — one-off converters (e.g. `convert_china_map.js`) 与冒烟测试（`vue_smoke_test.mjs`）。
- `.github/workflows/deploy.yml` — publishes `frontend/` to GitHub Pages on pushes to `main`.
- `archive/` and `V0存档.md` — release history kept locally, not pushed to GitHub; `.trae/specs/<version>/` holds planning specs and checklists (gitignored).

## Build, Test, and Development Commands

- `cd backend && npm install` — install Express.
- `npm start` (or `npm run dev`) — run the server at `http://localhost:3000`; the frontend is served from `frontend/`.
- Vue 模块为原生 ES Modules，无构建步骤；页面需通过后端或任意 HTTP 服务访问。
- 冒烟测试：先启动后端，再运行 `node scripts/vue_smoke_test.mjs`（自动调用无头 Chrome 逐页验证并截图）。
- No build step: pushing to `main` triggers the Pages workflow.

## Coding Style & Naming Conventions

- 2-space indentation in JS, CSS, and JSON; no inline styles.
- JS: camelCase functions/variables, UPPER_CASE constants, numbered section banners with Chinese comments (matching `vue/store.js` 等模块)。
- CSS: reuse the design tokens and class system in `style.css`; do not create a parallel theme.
- Data IDs: lowercase kebab-case venues (`bj-niaocao`), short artist IDs (`jay`, `jj`); image filenames match venue IDs (`assets/venues/<id>.jpg`, `assets/venues/unlit/<id>.jpg`).
- Keep data files valid UTF-8 JSON and sync the version (`v1.0.0`) across `package.json`, `README.md`, and header comments when behavior changes.

## Testing Guidelines

No automated test framework exists — testing is manual and checklist-driven. Run the backend and verify pages, map linkage, filters, and themes. After data changes, confirm JSON parses and counts stay consistent. Maintain checklists in `.trae/specs/<version>/checklist.md`; never commit real personal data (`users.json` is a demo set).

## Commit & Pull Request Guidelines

Git history uses version-driven Chinese messages, e.g. `V0.6.0 数据真实性+歌手选择联动+新场馆+性能优化`, with `docs:` or `修复` prefixes for smaller patches. Lead with the version when it changes; otherwise describe the fix concisely.

PRs must state what changed and why, link the relevant spec or issue, include screenshots for visual or asset changes, and pass a local run before opening.

## Data & Asset Updates

Verify concert and venue data against public sources (Weibo, Baidu, ticketing platforms) before committing. New venues need an ID, a lit image, and a matching unlit image. Use `YYYY-MM-DD` dates or explicit ranges for multi-day shows.
