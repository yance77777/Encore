/* 余响 Encore v2.0.0 · React 全局响应式 Store
 * 数据源：后端 API（优先）→ 静态 JSON 文件（GitHub Pages 回退）
 * 持久化：localStorage（主题 / 打卡 / 收藏 / 本命 / 见面 / 账单）*/

import { useSyncExternalStore } from 'react';
import {
  API_BASE, FAN_LEVELS, skinNames, venueSVG,
  sumExpenses, todayStr
} from './utils.js';

let state = {
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
};

const listeners = new Set();
function setState(patch) {
  state = { ...state, ...(typeof patch === 'function' ? patch(state) : patch) };
  listeners.forEach((fn) => fn());
}
function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useStore() {
  return useSyncExternalStore(subscribe, () => state);
}
export function getState() {
  return state;
}

let toastTimer;
export function toast(msg, type = 'info') {
  setState({ toast: { show: true, msg, type } });
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => setState({ toast: { ...state.toast, show: false } }), 2400);
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

export function computeStats(st = state) {
  const litVenues = new Set((st.user.checkins || []).map((c) => c.venueId));
  const litProvinces = new Set(
    st.venues.filter((v) => litVenues.has(v.id)).map((v) => v.provinceShort)
  );
  const totalCollections = Object.values(st.user.collections || {}).flat().length;
  return {
    litVenues: litVenues.size,
    totalVenues: st.venues.length,
    litProvinces: litProvinces.size,
    totalProvinces: new Set(st.venues.map((v) => v.provinceShort)).size,
    totalCollections,
    totalConcerts: st.concerts.length
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
    const user = (userRes && userRes.demo) ? userRes.demo : (userRes || {});
    setState({
      venues,
      artists,
      concerts,
      user,
      stats: statsRes || computeStats({ ...state, venues, artists, concerts, user }),
      loaded: true
    });
  } catch (e) {
    console.error('数据加载失败', e);
    setState({ error: e });
    toast('数据加载失败，请确认数据文件可访问', 'error');
  }
}

/* ================= localStorage 持久化 ================= */
function cloneUser(user) {
  return {
    ...user,
    checkins: [...(user.checkins || [])],
    collections: user.collections
      ? {
          album: [...(user.collections.album || [])],
          single: [...(user.collections.single || [])],
          merch: [...(user.collections.merch || [])]
        }
      : { album: [], single: [], merch: [] },
    bias: user.bias ? { ...user.bias, list: [...(user.bias.list || [])] } : { type: 1, list: [] }
  };
}

export function loadLocalCheckins() {
  setState((st) => {
    const user = cloneUser(st.user);
    try {
      const local = JSON.parse(localStorage.getItem('encore-checkins') || '[]');
      const existing = new Set(user.checkins.map((c) => c.venueId));
      local.forEach((c) => { if (!existing.has(c.venueId)) user.checkins.push(c); });
    } catch (e) {}
    return { user };
  });
}
export function saveLocalCheckins(user) {
  try {
    localStorage.setItem('encore-checkins', JSON.stringify((user.checkins || []).filter((c) => c._local)));
  } catch (e) {}
}
export function loadLocalCollections() {
  setState((st) => {
    const user = cloneUser(st.user);
    try {
      const local = JSON.parse(localStorage.getItem('encore-collections') || 'null');
      if (local) {
        ['album', 'single', 'merch'].forEach((type) => {
          if (local[type]) {
            local[type].forEach((item) => {
              if (!user.collections[type].some((x) => x.artistId === item.artistId && x.name === item.name)) {
                user.collections[type].push(item);
              }
            });
          }
        });
      }
    } catch (e) {}
    return { user };
  });
}
export function loadLocalBias() {
  setState((st) => {
    const user = cloneUser(st.user);
    let curDan = st.curDan;
    try {
      const local = JSON.parse(localStorage.getItem('encore-bias') || 'null');
      if (local && local.type && Array.isArray(local.list)) {
        user.bias = local;
        curDan = local.type;
        return { user, curDan };
      }
    } catch (e) {}
    user.bias = { type: 1, list: [] };
    curDan = 1;
    return { user, curDan };
  });
}
export function saveLocalBias(user) {
  try {
    if (user.bias) localStorage.setItem('encore-bias', JSON.stringify(user.bias));
  } catch (e) {}
}
export function loadMeetDates() {
  try {
    const raw = JSON.parse(localStorage.getItem('encore-meet-dates') || 'null');
    if (raw && typeof raw === 'object') {
      setState({ meetDates: { lastMeet: raw.lastMeet || null, nextMeet: raw.nextMeet || null } });
    }
  } catch (e) {}
}
export function saveMeetDates() {
  try {
    localStorage.setItem('encore-meet-dates', JSON.stringify(state.meetDates));
  } catch (e) {}
}
export function loadExpenses() {
  try {
    const raw = JSON.parse(localStorage.getItem('encore-expenses') || '[]');
    setState({ expenses: Array.isArray(raw) ? raw : [] });
  } catch (e) {
    setState({ expenses: [] });
  }
}
export function saveExpenses() {
  try {
    localStorage.setItem('encore-expenses', JSON.stringify(state.expenses));
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
  const a = state.artists.find((x) => x.id === id);
  if (!a) return;
  document.documentElement.style.setProperty('--theme-main', a.color);
  document.documentElement.style.setProperty('--theme-accent', a.color2);
  if (state.user.skin !== id) {
    setState((st) => ({ user: { ...st.user, skin: id } }));
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
export function getLitVenueIds(user) {
  return new Set((user.checkins || []).map((c) => c.venueId));
}
export function getProvinces(st = state) {
  const map = {};
  st.venues.forEach((v) => {
    if (!map[v.provinceShort]) {
      map[v.provinceShort] = { province: v.province, short: v.provinceShort, region: v.region, total: 0, lit: 0, venues: [] };
    }
    map[v.provinceShort].total++;
    map[v.provinceShort].venues.push(v);
  });
  const lit = getLitVenueIds(st.user);
  st.venues.forEach((v) => { if (lit.has(v.id)) map[v.provinceShort].lit++; });
  return Object.values(map);
}

export function selectProvince(short) {
  setState({ curProv: short });
}
export function setArtistFilter(id) {
  setState({ curArtistId: id });
}
export function setGalleryType(type) {
  setState({ curType: type });
}

export function toggleCheckin(venueId) {
  const venue = state.venues.find((v) => v.id === venueId);
  if (!venue) return null;
  const lit = getLitVenueIds(state.user);
  const user = cloneUser(state.user);
  if (lit.has(venueId)) {
    user.checkins = user.checkins.filter((c) => c.venueId !== venueId);
    saveLocalCheckins(user);
    fetch(API_BASE + '/api/user/checkin/' + venueId, { method: 'DELETE' }).catch(() => {});
  } else {
    const concerts = state.concerts.filter((c) => c.venueId === venueId);
    const artistId = concerts.length ? concerts[0].artistId : ((user.bias && user.bias.list[0]) || 'jay');
    const date = concerts.length ? concerts[0].date : todayStr();
    const note = concerts.length ? concerts[0].tour : '';
    user.checkins.push({ venueId, artistId, date, note, _local: true });
    saveLocalCheckins(user);
    fetch(API_BASE + '/api/user/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ venueId, artistId, date, note })
    }).catch(() => {});
  }
  const next = { ...state, user };
  setState({ user, stats: computeStats(next) });
  return lit.has(venueId) ? 'unlit' : 'lit';
}

/* ================= 收藏 ================= */
export function toggleAlbum(artistId, name, year) {
  const st = state;
  const user = cloneUser(st.user);
  const idx = user.collections.album.findIndex((a) => a.artistId === artistId && a.name === name);
  let msg;
  if (idx >= 0) {
    user.collections.album.splice(idx, 1);
    msg = `已移除「${name}」`;
  } else {
    user.collections.album.push({ artistId, name, year });
    msg = `已收藏「${name}」`;
  }
  try { localStorage.setItem('encore-collections', JSON.stringify(user.collections)); } catch (e) {}
  setState({ user, stats: computeStats({ ...st, user }) });
  toast(msg, idx >= 0 ? 'info' : 'success');
}
export function addCollection() {
  toast('上传功能开发中，敬请期待', 'info');
}

/* ================= 本命（单担/双担/三担） ================= */
export function setDan(type) {
  setState((st) => {
    const user = cloneUser(st.user);
    user.bias = { ...user.bias, type };
    saveLocalBias(user);
    fetch(API_BASE + '/api/user/bias', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, list: user.bias.list })
    }).catch(() => {});
    return { user, curDan: type };
  });
}
export function addBias(id) {
  const st = state;
  if (id && st.user.bias && !st.user.bias.list.includes(id) && st.user.bias.list.length < st.curDan) {
    const user = cloneUser(st.user);
    user.bias.list.push(id);
    saveLocalBias(user);
    fetch(API_BASE + '/api/user/bias', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user.bias)
    }).catch(() => {});
    const a = st.artists.find((x) => x.id === id);
    setState({ user });
    toast(`已添加「${a ? a.name : id}」为本命`, 'success');
  }
}
export function removeBias(id) {
  const st = state;
  if (id && st.user.bias && st.user.bias.list.length > 0) {
    const user = cloneUser(st.user);
    user.bias.list = user.bias.list.filter((x) => x !== id);
    saveLocalBias(user);
    fetch(API_BASE + '/api/user/bias', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user.bias)
    }).catch(() => {});
    const a = st.artists.find((x) => x.id === id);
    setState({ user });
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
export function checkAchievements(st = state) {
  const checkins = st.user.checkins || [];
  const litVenues = new Set(checkins.map((c) => c.venueId));
  const litProvSet = new Set(st.venues.filter((v) => litVenues.has(v.id)).map((v) => v.provinceShort));
  const artistCount = {};
  checkins.forEach((c) => { artistCount[c.artistId] = (artistCount[c.artistId] || 0) + 1; });
  const maxArtist = Math.max(0, ...Object.values(artistCount));
  let skinHistory = [];
  try { skinHistory = JSON.parse(localStorage.getItem('skinHistory') || '[]'); } catch (e) {}
  const biasType = (st.user.bias && st.user.bias.type) || 1;
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

/* ================= 见面 / 账单（store 辅助） ================= */
export function saveMeetRecord(target, obj) {
  const key = target === 'last' ? 'lastMeet' : 'nextMeet';
  setState((st) => ({
    meetDates: {
      ...st.meetDates,
      [key]: obj
    }
  }));
  saveMeetDates();
}
export function clearMeetRecord(target) {
  saveMeetRecord(target, null);
}
export function addExpense(record) {
  setState((st) => ({ expenses: [...st.expenses, record] }));
  saveExpenses();
}
export function deleteExpense(id) {
  setState((st) => ({ expenses: st.expenses.filter((e) => e.id !== id) }));
  saveExpenses();
}
export function clearExpenses() {
  setState({ expenses: [] });
  saveExpenses();
}

/* ================= 初始化 ================= */
function preloadVenueImages() {
  if (!state.venues || !state.venues.length) return;
  state.venues.forEach((v) => {
    if (v.img) { const img = new Image(); img.src = v.img; }
    if (v.imgUnlit) { const imgUnlit = new Image(); imgUnlit.src = v.imgUnlit; }
  });
}

export async function initApp() {
  initTheme();
  await loadData();
  if (state.error) return;
  loadLocalCheckins();
  loadLocalCollections();
  loadLocalBias();
  loadMeetDates();
  loadExpenses();
  setState((st) => ({
    curProv: st.venues[0] ? st.venues[0].provinceShort : null,
    curDan: st.user.bias ? st.user.bias.type : 1
  }));
  preloadVenueImages();
  applySkin(state.user.skin || 'jay', { silent: true });
}

// 保留旧版常量导出
export { skinNames, FAN_LEVELS, venueSVG, sumExpenses };
