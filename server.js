/**
 * 追光 Lightchaser · 本地后端服务 v0.1.0
 * 技术栈：Node.js + Express + JSON 文件存储
 * 数据存储：data/*.json（种子数据只读）+ data/users.json（用户数据读写）
 * 迁移服务器：将整个 lightchaser 目录部署即可，无需改动代码。
 */
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

app.use(express.json());
app.use(express.static(__dirname));

/* ============ 数据读取工具 ============ */
function readJSON(file) {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf-8'));
}
// 种子数据（启动时加载到内存，只读）
let VENUES = readJSON('venues.json');
let ARTISTS = readJSON('artists.json');
let CONCERTS = readJSON('concerts.json');

// 用户数据读写（本地文件存储）
function readUsers() {
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  } catch (e) {
    return {};
  }
}
function writeUsers(data) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}
// 默认用户（演示用，单用户模式，后续可扩展账号系统）
function getDefaultUser() {
  const users = readUsers();
  if (users['demo']) return users['demo'];
  return {
    id: 'demo',
    nickname: '追光者',
    since: '2021',
    bias: { type: 1, list: ['jay'] },
    skin: 'jay',
    checkins: [
      { venueId: 'bj-niaocao', artistId: 'jay', date: '2024-08-10', note: '嘉年华' },
      { venueId: 'sh-stadium', artistId: 'jj', date: '2023-08-19', note: 'JJ20' },
      { venueId: 'hz-lotus', artistId: 'mayday', date: '2025-05-24', note: '#5525' },
      { venueId: 'nj-aoti', artistId: 'jay', date: '2024-09-27', note: '嘉年华' },
      { venueId: 'sz-dayun', artistId: 'zhoushen', date: '2024-06-01', note: '9.29Hz' },
      { venueId: 'cd-donganhu', artistId: 'gem', date: '2024-06-02', note: 'I AM GLORIA' },
      { venueId: 'sh-mercedes', artistId: 'zhoushen', date: '2024-05-18', note: '首站' }
    ],
    collections: {
      album: [
        { artistId: 'jay', name: '范特西', year: 2001 },
        { artistId: 'jay', name: '七里香', year: 2004 },
        { artistId: 'jay', name: '最伟大的作品', year: 2022 },
        { artistId: 'jj', name: '伟大的渺小', year: 2017 },
        { artistId: 'mayday', name: '自传', year: 2016 }
      ],
      single: [],
      merch: [
        { artistId: 'jay', name: '嘉年华应援棒', year: 2024 },
        { artistId: 'mayday', name: '#5525场刊', year: 2025 }
      ]
    }
  };
}
function saveDefaultUser(user) {
  const users = readUsers();
  users['demo'] = user;
  writeUsers(users);
}

/* ============ API 路由 ============ */

// 场馆：按省份分组
app.get('/api/venues', (req, res) => {
  const { province } = req.query;
  let list = VENUES;
  if (province) list = list.filter(v => v.provinceShort === province || v.province === province);
  res.json(list);
});

// 省份列表 + 点亮统计
app.get('/api/provinces', (req, res) => {
  const user = getDefaultUser();
  const litVenueIds = new Set(user.checkins.map(c => c.venueId));
  const map = {};
  VENUES.forEach(v => {
    if (!map[v.provinceShort]) {
      map[v.provinceShort] = { province: v.province, short: v.provinceShort, region: v.region, total: 0, lit: 0, venues: [] };
    }
    map[v.provinceShort].total++;
    if (litVenueIds.has(v.id)) map[v.provinceShort].lit++;
    map[v.provinceShort].venues.push(v.id);
  });
  res.json(Object.values(map));
});

// 歌手
app.get('/api/artists', (req, res) => res.json(ARTISTS));
app.get('/api/artists/:id', (req, res) => {
  const a = ARTISTS.find(x => x.id === req.params.id);
  if (!a) return res.status(404).json({ error: '歌手不存在' });
  res.json(a);
});

// 演唱会场次
app.get('/api/concerts', (req, res) => {
  const { artistId, venueId } = req.query;
  let list = CONCERTS;
  if (artistId) list = list.filter(c => c.artistId === artistId);
  if (venueId) list = list.filter(c => c.venueId === venueId);
  res.json(list);
});

// 用户档案
app.get('/api/user', (req, res) => {
  res.json(getDefaultUser());
});

// 打卡（点亮场馆）
app.post('/api/user/checkin', (req, res) => {
  const { venueId, artistId, date, note } = req.body;
  const user = getDefaultUser();
  if (user.checkins.some(c => c.venueId === venueId)) {
    return res.status(400).json({ error: '该场馆已点亮' });
  }
  user.checkins.push({ venueId, artistId, date, note: note || '' });
  saveDefaultUser(user);
  res.json({ ok: true, user });
});

// 取消打卡
app.delete('/api/user/checkin/:venueId', (req, res) => {
  const user = getDefaultUser();
  user.checkins = user.checkins.filter(c => c.venueId !== req.params.venueId);
  saveDefaultUser(user);
  res.json({ ok: true, user });
});

// 添加收藏
app.post('/api/user/collection', (req, res) => {
  const { type, artistId, name, year } = req.body;
  const user = getDefaultUser();
  if (!user.collections[type]) user.collections[type] = [];
  user.collections[type].push({ artistId, name, year });
  saveDefaultUser(user);
  res.json({ ok: true, user });
});

// 更新担当
app.put('/api/user/bias', (req, res) => {
  const { type, list } = req.body;
  const user = getDefaultUser();
  user.bias = { type, list };
  saveDefaultUser(user);
  res.json({ ok: true, user });
});

// 更新皮肤
app.put('/api/user/skin', (req, res) => {
  const { skin } = req.body;
  const user = getDefaultUser();
  user.skin = skin;
  saveDefaultUser(user);
  res.json({ ok: true, user });
});

// 统计数据
app.get('/api/stats', (req, res) => {
  const user = getDefaultUser();
  const litVenues = new Set(user.checkins.map(c => c.venueId));
  const litProvinces = new Set(
    VENUES.filter(v => litVenues.has(v.id)).map(v => v.provinceShort)
  );
  const totalCollections = Object.values(user.collections).flat().length;
  res.json({
    litVenues: litVenues.size,
    totalVenues: VENUES.length,
    litProvinces: litProvinces.size,
    totalProvinces: new Set(VENUES.map(v => v.provinceShort)).size,
    totalCollections,
    totalConcerts: CONCERTS.length
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  追光 Lightchaser v0.1.0 已启动`);
  console.log(`  本地访问:  http://localhost:${PORT}`);
  console.log(`  数据存储:  ${DATA_DIR}`);
  console.log(`  用户数据:  ${USERS_FILE}\n`);
});
