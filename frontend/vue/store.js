/* 余响 Encore v1.0.0 · Vue 全局响应式 Store
 * 数据源：后端 API（优先）→ 静态 JSON 文件（GitHub Pages 回退，只读）
 * 持久化：localStorage（主题 / 打卡 / 收藏 / 本命 / 见面 / 账单）*/

import { reactive } from '../vendor/vue.esm-browser.prod.js';
import {
  API_BASE, skinNames, FAN_LEVELS, venueSVG,
  sumExpenses, todayStr
} from './utils.js';

export const store = reactive({
  venues: [],
  artists: [],
  concerts: [],
  user: {},
  stats: null,
  curProv: null,
  curDan: 1,
  curType: 'all-albums',
  curArtistId: 'all',
  loaded: false,
  error: null,
  toast: { show: false, msg: '', type: 'info' },
  meetDates: { lastMeet: null, nextMeet: null },
  expenses: []
});

let toastTimer;
export function toast(msg, type = 'info') {
  store.toast.msg = msg;
  store.toast.type = type;
  store.toast.show = true;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { store.toast.show = false; }, 2400);
}

/* ================= 数据加载 ================= */
async function fetchJSON(apiPath, staticPath) {
  try {
    const r = await fetch(API_BASE + apiPath);
    if (!r.ok) throw new Error(r.status);
    return await r.json();
  } catch (e) {
    if (!staticPath) throw e;
    const r2 = await fetch(staticPath);
    return await r2.json();
  }
}

export function computeStats() {
  const litVenues = new Set((store.user.checkins || []).map((c) => c.venueId));
  const litProvinces = new Set(
    store.venues.filter((v) => litVenues.has(v.id)).map((v) => v.provinceShort)
  );
  const totalCollections = Object.values(store.user.collections || {}).flat().length;
  return {
    litVenues: litVenues.size,
    totalVenues: store.venues.length,
    litProvinces: litProvinces.size,
    totalProvinces: new Set(store.venues.map((v) => v.provinceShort)).size,
    totalCollections,
    totalConcerts: store.concerts.length
  };
}

export async function loadData() {
  try {
    const [venues, artists, concerts, userRes, statsRes] = await Promise.all([
      fetchJSON('/api/venues', 'data/venues.json'),
      fetchJSON('/api/artists', 'data/artists.json'),
      fetchJSON('/api/concerts', 'data/concerts.json'),
      fetchJSON('/api/user', 'data/users.json').catch(() => ({})),
      fetch(API_BASE + '/api/stats').then((r) => (r.ok ? r.json() : null)).catch(() => null)
    ]);
    store.venues = venues;
    store.artists = artists;
    store.concerts = concerts;
    store.user = (userRes && userRes.demo) ? userRes.demo : (userRes || {});
    store.stats = statsRes || computeStats();
    store.loaded = true;
  } catch (e) {
    console.error('数据加载失败', e);
    store.error = e;
    toast('数据加载失败，请确认数据文件可访问', 'error');
  }
}

/* ================= localStorage 持久化 ================= */
export function loadLocalCheckins() {
  try {
    const local = JSON.parse(localStorage.getItem('encore-checkins') || '[]');
    if (!store.user.checkins) store.user.checkins = [];
    const existing = new Set(store.user.checkins.map((c) => c.venueId));
    local.forEach((c) => { if (!existing.has(c.venueId)) store.user.checkins.push(c); });
  } catch (e) {}
}
export function saveLocalCheckins() {
  try {
    const local = (store.user.checkins || []).filter((c) => c._local);
    localStorage.setItem('encore-checkins', JSON.stringify(local));
  } catch (e) {}
}
export function loadLocalCollections() {
  try {
    const local = JSON.parse(localStorage.getItem('encore-collections') || 'null');
    if (local && store.user.collections) {
      ['album', 'single', 'merch'].forEach((type) => {
        if (local[type]) {
          local[type].forEach((item) => {
            if (!store.user.collections[type].some((x) => x.artistId === item.artistId && x.name === item.name)) {
              store.user.collections[type].push(item);
            }
          });
        }
      });
    }
  } catch (e) {}
}
export function loadLocalBias() {
  try {
    const local = JSON.parse(localStorage.getItem('encore-bias') || 'null');
    if (local && local.type && Array.isArray(local.list)) {
      store.user.bias = local;
      store.curDan = local.type;
      return;
    }
  } catch (e) {}
  store.user.bias = { type: 1, list: [] };
  store.curDan = 1;
}
export function saveLocalBias() {
  try {
    if (store.user.bias) localStorage.setItem('encore-bias', JSON.stringify(store.user.bias));
  } catch (e) {}
}
export function loadMeetDates() {
  try {
    const raw = JSON.parse(localStorage.getItem('encore-meet-dates') || 'null');
    if (raw && typeof raw === 'object') {
      store.meetDates.lastMeet = raw.lastMeet || null;
      store.meetDates.nextMeet = raw.nextMeet || null;
    }
  } catch (e) {}
}
export function saveMeetDates() {
  try {
    localStorage.setItem('encore-meet-dates', JSON.stringify(store.meetDates));
  } catch (e) {}
}
export function loadExpenses() {
  try {
    const raw = JSON.parse(localStorage.getItem('encore-expenses') || '[]');
    store.expenses = Array.isArray(raw) ? raw : [];
  } catch (e) {
    store.expenses = [];
  }
}
export function saveExpenses() {
  try {
    localStorage.setItem('encore-expenses', JSON.stringify(store.expenses));
  } catch (e) {}
}

/* ================= 主题与皮肤 ================= */
export function initTheme() {
  const saved = localStorage.getItem('encore-theme');
  if (saved === 'dark') document.documentElement.classList.add('dark');
}
export function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('encore-theme', isDark ? 'dark' : 'light');
  toast(isDark ? '已切换至暗色模式' : '已切换至亮色模式', 'info');
}
function trackSkin(id) {
  try {
    let hist = JSON.parse(localStorage.getItem('skinHistory') || '[]');
    if (!hist.includes(id)) {
      hist.push(id);
      localStorage.setItem('skinHistory', JSON.stringify(hist));
    }
  } catch (e) {}
}
export function applySkin(id, opts = {}) {
  const a = store.artists.find((x) => x.id === id);
  if (!a) return;
  document.documentElement.style.setProperty('--theme-main', a.color);
  document.documentElement.style.setProperty('--theme-accent', a.color2);
  if (store.user.skin !== id) {
    store.user.skin = id;
    trackSkin(id);
    fetch(API_BASE + '/api/user/skin', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skin: id })
    }).catch(() => {});
    if (!opts.silent) toast(`已切换至「${a.name}」主题`, 'success');
  }
}

/* ================= 场馆打卡 ================= */
export function getLitVenueIds() {
  return new Set((store.user.checkins || []).map((c) => c.venueId));
}
export function getProvinces() {
  const map = {};
  store.venues.forEach((v) => {
    if (!map[v.provinceShort]) {
      map[v.provinceShort] = { province: v.province, short: v.provinceShort, region: v.region, total: 0, lit: 0, venues: [] };
    }
    map[v.provinceShort].total++;
    map[v.provinceShort].venues.push(v);
  });
  const lit = getLitVenueIds();
  store.venues.forEach((v) => { if (lit.has(v.id)) map[v.provinceShort].lit++; });
  return Object.values(map);
}

export function toggleCheckin(venueId) {
  const venue = store.venues.find((v) => v.id === venueId);
  if (!venue) return null;
  const lit = getLitVenueIds();
  if (lit.has(venueId)) {
    store.user.checkins = (store.user.checkins || []).filter((c) => c.venueId !== venueId);
    saveLocalCheckins();
    fetch(API_BASE + '/api/user/checkin/' + venueId, { method: 'DELETE' }).catch(() => {});
  } else {
    const concerts = store.concerts.filter((c) => c.venueId === venueId);
    const artistId = concerts.length ? concerts[0].artistId : ((store.user.bias && store.user.bias.list[0]) || 'jay');
    const date = concerts.length ? concerts[0].date : todayStr();
    const note = concerts.length ? concerts[0].tour : '';
    store.user.checkins.push({ venueId, artistId, date, note, _local: true });
    saveLocalCheckins();
    fetch(API_BASE + '/api/user/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ venueId, artistId, date, note })
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d && d.user) store.user = d.user; })
      .catch(() => {});
  }
  store.stats = computeStats();
  return lit.has(venueId) ? 'unlit' : 'lit';
}

/* ================= 收藏 ================= */
export function toggleAlbum(artistId, name, year) {
  if (!store.user.collections) store.user.collections = { album: [], single: [], merch: [] };
  if (!store.user.collections.album) store.user.collections.album = [];
  const idx = store.user.collections.album.findIndex((a) => a.artistId === artistId && a.name === name);
  if (idx >= 0) {
    store.user.collections.album.splice(idx, 1);
    toast(`已移除「${name}」`, 'info');
  } else {
    store.user.collections.album.push({ artistId, name, year });
    toast(`已收藏「${name}」`, 'success');
  }
  try { localStorage.setItem('encore-collections', JSON.stringify(store.user.collections)); } catch (e) {}
  store.stats = computeStats();
}
export function addCollection() {
  toast('上传功能开发中，敬请期待', 'info');
}

/* ================= 本命（单担/双担/三担） ================= */
export function setDan(type) {
  store.curDan = type;
  if (!store.user.bias) store.user.bias = { type, list: [] };
  store.user.bias.type = type;
  saveLocalBias();
  fetch(API_BASE + '/api/user/bias', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, list: store.user.bias.list })
  }).catch(() => {});
}
export function addBias(id) {
  if (id && store.user.bias && !store.user.bias.list.includes(id) && store.user.bias.list.length < store.curDan) {
    store.user.bias.list.push(id);
    saveLocalBias();
    fetch(API_BASE + '/api/user/bias', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(store.user.bias)
    }).catch(() => {});
    const a = store.artists.find((x) => x.id === id);
    toast(`已添加「${a ? a.name : id}」为本命`, 'success');
  }
}
export function removeBias(id) {
  if (id && store.user.bias && store.user.bias.list.length > 0) {
    store.user.bias.list = store.user.bias.list.filter((x) => x !== id);
    saveLocalBias();
    fetch(API_BASE + '/api/user/bias', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(store.user.bias)
    }).catch(() => {});
    const a = store.artists.find((x) => x.id === id);
    toast(`已移除「${a ? a.name : id}」`, 'info');
  }
}

/* ================= 成就 / 等级 ================= */
export function getFanLevel(count) {
  let idx = 0;
  for (let i = FAN_LEVELS.length - 1; i >= 0; i--) {
    if (count >= FAN_LEVELS[i].min) { idx = i; break; }
  }
  return { cur: FAN_LEVELS[idx], next: FAN_LEVELS[idx + 1], idx };
}
export function checkAchievements() {
  const checkins = store.user.checkins || [];
  const litVenues = new Set(checkins.map((c) => c.venueId));
  const litProvSet = new Set(store.venues.filter((v) => litVenues.has(v.id)).map((v) => v.provinceShort));
  const artistCount = {};
  checkins.forEach((c) => { artistCount[c.artistId] = (artistCount[c.artistId] || 0) + 1; });
  const maxArtist = Math.max(0, ...Object.values(artistCount));
  let skinHistory = [];
  try { skinHistory = JSON.parse(localStorage.getItem('skinHistory') || '[]'); } catch (e) {}
  const biasType = (store.user.bias && store.user.bias.type) || 1;
  return [
    { name: '初出茅庐', desc: '首次打卡', icon: '★', got: checkins.length >= 1 },
    { name: '集邮达人', desc: '点亮5座场馆', icon: '◉', got: litVenues.size >= 5 },
    { name: '半壁江山', desc: '点亮15座场馆', icon: '◈', got: litVenues.size >= 15 },
    { name: '全国巡礼', desc: '点亮10个不同省份', icon: '◇', got: litProvSet.size >= 10 },
    { name: '鸟巢打卡', desc: '在鸟巢打卡过', icon: '⬢', got: checkins.some((c) => c.venueId === 'bj-niaocao') },
    { name: '连场追逐', desc: '同一歌手看3场以上', icon: '♪', got: maxArtist >= 3 },
    { name: '多担玩家', desc: '设置双担或三担', icon: '❉', got: biasType >= 2 },
    { name: '变色龙', desc: '切换过3种以上皮肤', icon: '◐', got: skinHistory.length >= 3 }
  ];
}

/* ================= 初始化 ================= */
function preloadVenueImages() {
  if (!store.venues || !store.venues.length) return;
  store.venues.forEach((v) => {
    if (v.img) { const img = new Image(); img.src = v.img; }
    if (v.imgUnlit) { const imgUnlit = new Image(); imgUnlit.src = v.imgUnlit; }
  });
}

export async function initApp() {
  initTheme();
  await loadData();
  if (store.error) return;
  loadLocalCheckins();
  loadLocalCollections();
  loadLocalBias();
  loadMeetDates();
  loadExpenses();
  store.curProv = store.venues[0] ? store.venues[0].provinceShort : null;
  store.curDan = store.user.bias ? store.user.bias.type : 1;
  preloadVenueImages();
  applySkin(store.user.skin || 'jay', { silent: true });
}

// 保留旧版常量导出，供个别组件沿用
export { skinNames, FAN_LEVELS, venueSVG, sumExpenses };
