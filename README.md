# 余响 Encore v0.4

> 演唱会足迹追踪 App · 前端 GitHub Pages + 后端本地/HF Space
> V0.4：明暗双模UI + 场馆点亮/熄灭交互 + localStorage持久化 + 品牌ICON + 全专辑展览

## 项目结构

```
追光/
├── frontend/                 # 前端部署目录（GitHub Pages 源）
│   ├── index.html            # 首页（Hero + 模块导航）
│   ├── map.html              # 场馆地图
│   ├── tours.html            # 巡演档案
│   ├── gallery.html          # 收藏展览
│   ├── identity.html         # 粉丝身份
│   ├── member.html           # 会员体系
│   ├── app.js                # 前端逻辑（按页面按需渲染 + 静态 JSON 回退）
│   ├── style.css             # 样式（舞台灯光设计系统）
│   ├── data/                 # 数据目录（前端只读回退 + 后端共享）
│   │   ├── venues.json       # 场馆数据（31座）
│   │   ├── artists.json      # 歌手数据（13位）
│   │   ├── concerts.json     # 演唱会场次（139场）
│   │   └── users.json        # 用户数据（打卡/收藏/担当/皮肤）
│   └── assets/               # 静态资源
│       ├── icons/            # App 主图标（V2 光尘版）
│       └── venues/           # 31 张场馆 Q 版图标（Seedream 生成）
├── backend/                  # 后端服务（部署到 HF Space 或本地运行）
│   ├── server.js             # Express + JSON 文件存储
│   ├── package.json
│   └── package-lock.json
├── .github/workflows/        # GitHub Actions 自动部署工作流
├── archive/                  # 归档目录
├── .gitignore
├── README.md
└── V0存档.md                 # 项目档案（版本记录/对话总结/敏感信息）
```

## 版本号管理（a.b.c 三位数体系）
- **c（修订版）**：Bug修复、数据校验、图标补全
- **b（次版本）**：新增功能模块、设计改版、数据结构调整（如 v0.4 明暗双模+交互升级）
- **a（主版本）**：重大架构升级、跨平台发布、品牌变更（如 v1.0.0）

## 本地启动

### 前后端联调（完整功能）
```bash
cd backend
npm install
npm start
```
访问 http://localhost:3000 （前端从 frontend/ 目录提供，API 完整可用）

### 前端纯静态预览（只读模式）
直接用浏览器打开 `frontend/index.html`，数据回退到静态 JSON，写入功能不可用。

## 部署

### 前端 → GitHub Pages
1. 推送到 `https://github.com/yance77777/Encore` main 分支
2. GitHub Actions 自动将 `frontend/` 部署到 Pages
3. 仓库 Settings → Pages → Source 选择 "GitHub Actions"

### 后端 → HF Space（未来）
1. 将 `backend/` 内容上传到 HF Space
2. 同步 `frontend/data/` 目录
3. 在 `frontend/app.js` 中将 `API_BASE` 填入 HF Space URL

## 数据说明
- 场馆/歌手/演唱会数据来源：百科、票务平台、媒体公开信息（2023-2026）
- 用户数据存储在 `frontend/data/users.json`，本地文件读写，无需数据库
- 如需接入数据库，只需修改 `server.js` 中 `readUsers()` 和 `writeUsers()` 两个函数

## 技术栈
- 后端：Node.js + Express
- 前端：原生 HTML/CSS/JS（无框架依赖）
- 存储：JSON 文件（零配置，可直接迁移）
- 部署：GitHub Pages（前端）+ HF Space / 本地（后端）
