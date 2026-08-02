# 余响 Encore v0.2.0

> 演唱会足迹追踪 App · 前端 GitHub Pages + 后端 HF Space

## 项目结构

```
追光/
├── assets/                    # 静态资源
│   ├── icons/                # App 图标
│   │   └── app-icon-v2-dust.jpg   # 主 ICON（V2 光尘版）
│   └── venues/               # 场馆图片（Q萌画风，Seedream 生成）
│       ├── niac.jpg          # 鸟巢
│       ├── shanghai.jpg      # 上海体育场
│       ├── hangzhou.jpg      # 杭州大莲花
│       ├── shenzhen.jpg      # 深圳大运中心
│       ├── chengdu.jpg       # 成都东安湖
│       └── nanjing.jpg       # 南京奥体
├── backend/                  # 后端服务
│   ├── server.js             # Express + JSON 文件存储
│   ├── package.json          # 依赖配置
│   └── package-lock.json
├── data/                     # 数据目录（前端只读 + 后端读写）
│   ├── venues.json           # 场馆数据
│   ├── artists.json          # 歌手数据
│   ├── concerts.json         # 演唱会场次
│   └── users.json            # 用户数据（打卡/收藏/担当/皮肤）
├── archive/                  # 归档目录（设计草稿等）
├── index.html                # 前端页面（根目录，GitHub Pages 兼容）
├── map.html                  # 场馆地图页
├── tours.html                # 巡演档案页
├── gallery.html              # 收藏展览页
├── identity.html             # 粉丝身份页
├── member.html               # 会员体系页
├── app.js                    # 前端逻辑（按页面按需渲染 + 静态 JSON 回退）
├── style.css                 # 样式
├── .gitignore
├── README.md
└── 上下文存档.md              # 对话上下文存档
```

## 本地启动

### 前端（纯静态预览）
直接用浏览器打开 `index.html`，或用任意静态服务器：
```bash
npx serve .
```

### 前后端联调（完整功能）
```bash
cd backend
npm install
npm start
```
访问 http://localhost:3000

## 部署

### 前端 → GitHub Pages
1. 推送到 `https://github.com/yance77777/Encore`
2. 仓库 Settings → Pages → Source: `main` 分支根目录

### 后端 → HF Space
1. 将 `backend/` 内容上传到 HF Space（`andreas777/fresheye`）
2. 同步 `data/` 目录
3. 在 `app.js` 中将 `API_BASE` 填入 HF Space URL

## 数据说明
- 场馆/歌手/演唱会数据来源：百科、票务平台、媒体公开信息（2023-2026）
- 用户数据存储在 `data/users.json`，本地文件读写，无需数据库
- 如需接入数据库，只需修改 `server.js` 中 `readUsers()` 和 `writeUsers()` 两个函数

## 技术栈
- 后端：Node.js + Express
- 前端：原生 HTML/CSS/JS（无框架依赖）
- 存储：JSON 文件（零配置，可直接迁移）
