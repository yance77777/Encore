<div align="center">

# 余响 Encore

**演唱会足迹追踪 · 点亮你的每一站**

[![Version](https://img.shields.io/badge/version-v0.6.0-gold?style=flat-square)](https://yance77777.github.io/Encore/)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](#)
[![Live Demo](https://img.shields.io/badge/Live-GitHub%20Pages-brightgreen?style=flat-square)](https://yance77777.github.io/Encore/)
[![Frontend](https://img.shields.io/badge/frontend-vanilla%20JS-orange?style=flat-square)](#)
[![Backend](https://img.shields.io/badge/backend-Node.js-success?style=flat-square)](#)

🔗 **在线访问**：[https://yance77777.github.io/Encore/](https://yance77777.github.io/Encore/)

</div>

---

> 一款记录演唱会足迹、点亮场馆地图、收藏专辑与周边的粉丝向 App。
> V0.6.0：数据真实性核验 + 亮版 ICON 一致性 + 12 场馆图重生 + 6 港澳台青连新场馆 + 歌手选择重构 + 地图按本命联动 + 性能优化 + footer 规范化。

## ✨ 功能特性

| 模块 | 能力 |
|------|------|
| 🏟️ 场馆地图 | 37 座场馆中国地图可视化 · 点亮/熄灭双向切换 · 省份统计联动 |
| 🎤 巡演档案 | 146 场演唱会记录 · 13 位歌手筛选 · 时间线展示 |
| 💿 收藏展览 | 139 张专辑全展示 · 一键收藏/取消 · localStorage 持久化 |
| 🎭 粉丝身份 | 个人主页 · 偏好歌手 · 主题皮肤（13 种歌手主题色） |
| 👑 会员体系 | 套餐展示 · 权益对比 |
| 🌓 明暗双模 | 一键切换 · 全元素适配 · 双版本 ICON · 持久化记忆 |

## 📊 数据统计

```
🏟️  场馆    31 座（覆盖全国 20+ 省份）
🎤  歌手    13 位（周杰伦 / 林俊杰 / 五月天 / 周深 等）
🎵  演唱会  139 场（2023-2026 公开演出记录）
💿  专辑    139 张（13 位歌手完整专辑目录）
```

## 🚀 快速开始

### 在线访问

直接访问 **[https://yance77777.github.io/Encore/](https://yance77777.github.io/Encore/)**

> 在线版采用 GitHub Pages 静态部署，数据回退到静态 JSON，写入操作通过 localStorage 持久化。

### 本地开发（完整功能）

```bash
cd backend
npm install
npm start
```

启动后访问 **[http://localhost:3000](http://localhost:3000)**，前端从 `frontend/` 目录提供，API 完整可用。

### 前端纯静态预览

直接用浏览器打开 `frontend/index.html` 即可，数据回退到静态 JSON，写入功能不可用。

## 📁 项目结构

```
Encore/
├── frontend/                  # 前端部署目录（GitHub Pages 源）
│   ├── index.html             # 首页（Hero + 模块导航）
│   ├── map.html               # 场馆地图
│   ├── tours.html             # 巡演档案
│   ├── gallery.html           # 收藏展览
│   ├── identity.html          # 粉丝身份
│   ├── member.html            # 会员体系
│   ├── app.js                 # 前端逻辑（按页面按需渲染 + 静态 JSON 回退）
│   ├── style.css              # 样式（舞台灯光设计系统 + 明暗双模）
│   ├── data/                  # JSON 数据（前端只读回退 + 后端共享）
│   │   ├── venues.json        # 场馆数据（37 座）
│   │   ├── artists.json       # 歌手数据（13 位）
│   │   ├── concerts.json      # 演唱会场次（146 场）
│   │   ├── users.json         # 用户数据（打卡/收藏/担当/皮肤）
│   │   └── china-map.js       # 中国地图 SVG 路径数据
│   └── assets/
│       ├── icons/             # 品牌 ICON（明/暗双版本）
│       └── venues/            # 37 张场馆 Q 版图标 + unlit/ 未点亮版本
├── backend/                   # 后端服务（部署到 HF Space 或本地运行）
│   ├── server.js              # Express + JSON 文件存储
│   └── package.json
├── scripts/
│   └── convert_china_map.js   # GeoJSON → SVG path 转换工具
├── .github/workflows/
│   └── deploy.yml             # GitHub Actions 自动部署工作流
├── archive/                   # 归档目录
├── .gitignore
├── README.md
└── V0存档.md                  # 项目档案（版本记录 / 对话总结）
```

## 🌐 部署

### 前端 → GitHub Pages（已部署）

| 配置项 | 值 |
|--------|-----|
| 仓库 | [`yance77777/Encore`](https://github.com/yance77777/Encore) |
| 分支 | `main` |
| Pages Source | GitHub Actions |
| 部署目录 | `frontend/` |
| 访问地址 | **[https://yance77777.github.io/Encore/](https://yance77777.github.io/Encore/)** |

推送到 `main` 分支即自动触发部署，工作流定义见 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)。

### 后端 → HF Space（规划中）

1. 将 `backend/` 内容上传到 HF Space
2. 同步 `frontend/data/` 目录
3. 在 `frontend/app.js` 中将 `API_BASE` 填入 HF Space URL

## 🛠️ 技术栈

| 层 | 技术 | 说明 |
|----|------|------|
| 前端 | 原生 HTML / CSS / JS | 无框架依赖，零构建 |
| 后端 | Node.js + Express | JSON 文件存储，零配置 |
| 数据 | JSON 文件 | 可直接迁移至数据库 |
| 部署 | GitHub Actions → Pages | 前端静态托管 |
| 存储 | localStorage | 主题/打卡/收藏三重持久化 |

## 📝 版本管理（a.b.c 三位数体系）

- **a（主版本）**：重大架构升级 / 跨平台发布 / 品牌变更（如 `v1.0.0`）
- **b（次版本）**：新增功能模块 / 设计改版 / 数据结构调整（如 `v0.5.0` 大版本重构 + 设计系统升级）
- **c（修订版）**：Bug 修复 / 数据校验 / 图标补全 / 文案微调

## 📜 版本历史

| 版本 | 日期 | 核心更新 |
|------|------|----------|
| **v0.6.0** | 2026-08-04 | 数据真实性核验 + 亮版 ICON 一致性 + 12 场馆图重生 + 6 港澳台青连新场馆 + 歌手选择重构 + 地图按本命联动 + 性能优化 + footer 规范化 |
| **v0.5.0** | 2026-08-04 | 大版本重构 · 数据微博核验 · UI 设计系统 · 见面/消费新页面 · 身份页落地 · 62 张场馆双版图标 · 地图 rAF 性能优化 |
| **v0.4** | 2026-08-03 | 明暗双模 UI · 场馆点亮/熄灭交互 · 品牌 ICON · 全专辑展览 · localStorage 持久化 |
| v0.3.1 | 2026-08-02 | 31 座场馆图标全覆盖 · 数据完善 · 杭州大小莲花拆分 |
| v0.3.0 | 2026-08-01 | UI 深度重构 · 舞台灯光暖白设计系统 · 响应式三档断点 |
| v0.2.0 | 2026-08-01 | 多页面拆分 · 按需渲染 + 静态 JSON 回退 · 仓库初始化 |
| v0.1 | 2026-08-01 | 品牌定型：追光 → 余响 Encore · V2 光尘版主 Icon |

> 完整版本记录与开发对话归档见 [`V0存档.md`](V0存档.md)。

## 📌 数据说明

- 场馆 / 歌手 / 演唱会数据来源：百科、票务平台、媒体公开信息（2023-2026）
- 用户数据存储在 `frontend/data/users.json`，本地文件读写，无需数据库
- 如需接入数据库，只需修改 `server.js` 中 `readUsers()` 和 `writeUsers()` 两个函数

---

<div align="center">

**余响 Encore** · 演唱会足迹追踪 · 仅供产品演示

</div>
