# 余响 Encore v0.2.0

> 演唱会足迹追踪 App · 前端 GitHub Pages + 后端 HF Space

## 本地启动步骤

### 1. 环境要求
- Node.js 16+（下载：https://nodejs.org）

### 2. 安装依赖
打开命令行（CMD / PowerShell / 终端），进入项目目录：
```bash
cd Z:\追光
npm install
```

### 3. 启动服务
```bash
npm start
```
看到以下输出即成功：
```
  追光 Lightchaser v0.1.0 已启动
  本地访问:  http://localhost:3000
```

### 4. 打开浏览器
访问 http://localhost:3000

## 迁移到服务器

整个项目目录可直接上传到服务器，无需改动代码：
```bash
# 服务器上执行
npm install
npm start
```
如需修改端口：设置环境变量 `PORT=8080 npm start`

## 项目结构
```
追光/
├── server.js              # 后端服务（Express + JSON文件存储）
├── package.json           # 依赖配置
├── data/                  # 数据目录（JSON文件存储）
│   ├── venues.json        # 30座场馆数据
│   ├── artists.json       # 8位歌手 + 专辑数据
│   ├── concerts.json      # 98场演唱会场次
│   └── users.json         # 用户数据（打卡/收藏/担当/皮肤，可读写）
└── public/                # 前端静态资源
    ├── index.html         # 页面
    ├── style.css          # 样式
    ├── app.js             # 前端逻辑（接入API）
    └── venues/            # Q萌场馆图片（Seedream生成）
        ├── niac.jpg       # 鸟巢
        ├── shanghai.jpg   # 上海体育场
        ├── hangzhou.jpg   # 杭州大莲花
        ├── shenzhen.jpg   # 深圳大运中心
        ├── chengdu.jpg    # 成都东安湖
        └── nanjing.jpg    # 南京奥体
```

## 数据说明
- 场馆/歌手/演唱会数据来源：百科、票务平台、媒体公开信息（2023-2026）
- 用户数据存储在 `data/users.json`，本地文件读写，无需数据库
- 如需接入数据库，只需修改 `server.js` 中 `readUsers()` 和 `writeUsers()` 两个函数

## 技术栈
- 后端：Node.js + Express
- 前端：原生 HTML/CSS/JS（无框架依赖）
- 存储：JSON 文件（零配置，可直接迁移）
