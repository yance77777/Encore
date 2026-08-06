<div align="center">

# 余响 Encore

**演唱会足迹追踪 · 点亮你的每一站**

[![Version](https://img.shields.io/badge/version-v0.9.0-gold?style=flat-square)](https://encore.yance777.com)
[![Live](https://img.shields.io/badge/在线访问-encore.yance777.com-brightgreen?style=flat-square)](https://encore.yance777.com)
[![Frontend](https://img.shields.io/badge/frontend-React%2019-blue?style=flat-square)](https://encore.yance777.com)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](#license)

🔗 **在线访问**：[https://encore.yance777.com](https://encore.yance777.com)

</div>

---

> 一款为演唱会爱好者打造的足迹追踪 App——在一幅中国地图上点亮你去过的每一座场馆，
> 翻阅巡演档案、收藏专辑周边、记录粉丝身份与每一次见面。

## ✨ 功能特性

| 模块 | 能力 |
|------|------|
| 🏠 首页 | 品牌入口 · 模块导航 · 全局数据一览 · 今日幸运签 / 换票根 |
| 🏟️ 场馆地图 | 195 座场馆中国地图可视化 · 点亮 / 熄灭双向切换 · 省份统计联动 |
| 🎤 巡演档案 | 1006 场演唱会记录 · 13 位歌手筛选 · 时间线展示 |
| 💿 收藏展览 | 147 张专辑全展示 · 一键收藏 / 取消 · localStorage 持久化 |
| 🎭 粉丝身份 | 个人主页 · 偏好歌手 · 主题皮肤（13 种歌手主题色） |
| 👑 会员体系 | 套餐展示 · 权益对比 · 粉丝身份进阶 |
| 🤝 见面 | 见面会记录 · 粉丝互动档案 |
| 💰 账单 | 演唱会消费记账 · 多维度统计 · 消费占比环图 |

## 📊 数据统计

```
🏟️  场馆    204 座（覆盖全国 60+ 座城市含港澳台）
🎤  歌手    13 位（华语主流一线全员收录）
🎵  演唱会  1006 场（2023-2026 公开演出记录）
💿  专辑    147 张（13 位歌手完整专辑目录）
📄  页面    8 个（功能模块齐全）
```

## 🏟️ 场馆覆盖

195 座场馆覆盖全国 7 大地理区域 + 港澳台，60+ 座城市，所有场馆均配 Q 版图标双版本（点亮 / 未点亮）。

## 🎤 收录歌手

13 位华语乐坛代表歌手，每位歌手配备专属主题色与完整专辑目录：

| 歌手 | 出道年份 | 专辑数 | 主题色 |
|------|----------|--------|--------|
| 周杰伦 Jay Chou | 2000 | 16 | 紫罗兰 |
| 林俊杰 JJ Lin | 2003 | 15 | 深海蓝 |
| 五月天 Mayday | 1999 | 9 | 玫瑰红 |
| 张杰 Jason Zhang | 2005 | 14 | 翡翠绿 |
| 薛之谦 Joker Xue | 2006 | 13 | 暗紫 |
| 汪苏泷 Silence Wang | 2010 | 12 | 湖蓝 |
| 周深 Zhou Shen | 2017 | 2 | 靛蓝 |
| 邓紫棋 G.E.M. | 2009 | 9 | 玫红 |
| 王力宏 Wang Leehom | 1995 | 16 | 海军蓝 |
| 陶喆 David Tao | 1997 | 8 | 焦糖 |
| 许嵩 Vae | 2009 | 9 | 苔绿 |
| 李荣浩 Ronghao Li | 2013 | 8 | 深紫 |
| 谢霆锋 Nicholas Tse | 1997 | 16 | 砖红 |

## 🛠️ 技术栈

| 层 | 技术 | 说明 |
|----|------|------|
| 前端 | React 19 + Vite（JSX 组件化） | 多页面构建 · 明暗双模 · 响应式适配 |
| 后端 | Node.js + Express | JSON 文件存储 · 轻量部署 |
| 数据 | JSON 文件 | 静态可读 · 易迁移 |
| 部署 | GitHub Actions → Pages | 推送即上线 |
| 持久化 | localStorage | 主题 / 打卡 / 收藏三重记忆 |
| 主题 | CSS 变量 + 明暗双模 | 13 种歌手主题色 · 全元素适配 |

## 📁 项目结构

```
Encore/
├── frontend/                  # 前端目录
│   ├── index.html             # 首页
│   ├── map.html               # 场馆地图
│   ├── tours.html             # 巡演档案
│   ├── gallery.html           # 收藏展览
│   ├── identity.html          # 粉丝身份
│   ├── member.html            # 会员体系
│   ├── meet.html              # 见面
│   ├── expense.html           # 账单
│   ├── src/                   # React 源码（store / components / pages）
│   ├── dist/                  # 构建产物（本地生成，不入库）
│   ├── style.css              # 样式系统
│   ├── data/                  # JSON 数据
│   │   ├── venues.json        # 场馆（195 座）
│   │   ├── artists.json       # 歌手（13 位）
│   │   ├── concerts.json      # 演唱会（1006 场）
│   │   ├── users.json         # 用户数据
│   │   └── china-map.js       # 中国地图 SVG 路径
│   └── assets/
│       ├── icons/             # 品牌 ICON（明 / 暗）
│       └── venues/            # 场馆 Q 版图标 + unlit/
├── backend/                   # 后端服务
│   └── server.js              # Express + JSON 文件存储
├── scripts/                   # 工具脚本 / 冒烟测试
├── package.json               # React + Vite 依赖与构建脚本
├── vite.config.mjs            # Vite 多页面配置
├── .github/workflows/         # 自动部署工作流
└── README.md
```

## 🚀 本地开发

```bash
npm install       # 安装依赖
npm run dev       # Vite 开发服务器（http://localhost:5173）
npm run build     # 构建到 frontend/dist
npm run preview   # 本地预览构建产物
cd backend && npm start   # 后端服务（优先托管 frontend/dist）
node scripts/react_smoke_test.mjs   # 无头浏览器冒烟测试
```

GitHub Actions 会在推送到 `main` 时自动执行 `npm ci && npm run build` 并将 `frontend/dist` 发布到 Pages。

## 🌐 在线访问

🔗 **https://encore.yance777.com**

## License

MIT
