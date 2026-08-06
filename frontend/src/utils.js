/* 余响 Encore v2.0.0 · React 通用工具函数 */

// 后端地址：本地开发留空；GitHub Pages 部署时填 HF Space URL
export const API_BASE = '';

// 皮肤中文名映射（与 v1.0 Vue 版保持一致）
export const skinNames = {
  jay: '周杰伦 · 魔幻紫', jj: '林俊杰 · 深海蓝', mayday: '五月天 · 玫瑰红', zhangjie: '张杰 · 森林绿',
  joker: '薛之谦 · 暗夜紫', silence: '汪苏泷 · 晴空蓝', zhoushen: '周深 · 星河紫', gem: '邓紫棋 · 玫粉红',
  leehom: '王力宏 · 深蓝海', davidtao: '陶喆 · 暖橙调', vae: '许嵩 · 茶汤绿', lironghao: '李荣浩 · 暗紫调', nic: '谢霆锋 · 烈焰红'
};

// 粉丝等级阶梯
export const FAN_LEVELS = [
  { min: 0, name: '路人粉', lv: 0 },
  { min: 1, name: '新手粉丝', lv: 1 },
  { min: 4, name: '进阶粉丝', lv: 2 },
  { min: 9, name: '资深粉丝', lv: 3 },
  { min: 16, name: '铁杆粉丝', lv: 4 },
  { min: 26, name: '殿堂级粉丝', lv: 5 }
];

// Q 版场馆 SVG（无生成图的场馆用此占位）
export const venueSVG = {
  nest: '<svg viewBox="0 0 100 100"><g fill="none" stroke="#ff3d8b" stroke-width="2.5" stroke-linecap="round"><path d="M20 35 Q50 20 80 35"/><path d="M18 50 Q50 32 82 50"/><path d="M20 65 Q50 50 80 65"/><ellipse cx="50" cy="78" rx="30" ry="6"/></g><circle cx="50" cy="55" r="3" fill="#f5c45e"/></svg>',
  arena: '<svg viewBox="0 0 100 100"><g fill="none" stroke="#7c5cff" stroke-width="2.5" stroke-linecap="round"><rect x="20" y="35" width="60" height="40" rx="4"/><path d="M20 45 Q50 28 80 45"/><line x1="35" y1="55" x2="65" y2="55"/></g><circle cx="50" cy="30" r="3" fill="#f5c45e"/></svg>',
  dome: '<svg viewBox="0 0 100 100"><g fill="none" stroke="#3ee8d0" stroke-width="2.5" stroke-linecap="round"><path d="M22 60 Q22 30 50 30 Q78 30 78 60"/><line x1="22" y1="60" x2="78" y2="60"/><path d="M35 45 L50 35 L65 45"/></g><circle cx="50" cy="40" r="2.5" fill="#f5c45e"/></svg>',
  bowl: '<svg viewBox="0 0 100 100"><g fill="none" stroke="#ff3d8b" stroke-width="2.5" stroke-linecap="round"><path d="M18 55 Q50 75 82 55"/><path d="M18 55 Q50 35 82 55"/><ellipse cx="50" cy="45" rx="22" ry="5"/></g></svg>',
  lotus: '<svg viewBox="0 0 100 100"><g fill="none" stroke="#f5c45e" stroke-width="2.5" stroke-linecap="round"><path d="M50 35 Q35 50 50 65 Q65 50 50 35Z"/><path d="M50 35 Q30 45 40 60 Q50 50 50 35Z"/><path d="M50 35 Q70 45 60 60 Q50 50 50 35Z"/></g><circle cx="50" cy="48" r="3" fill="#ff3d8b"/></svg>'
};

// "2024-06-26" → "2024.6.26"
export function formatDateDay(d) {
  if (!d) return '';
  const parts = d.split('-');
  if (parts.length < 3) return d;
  return `${+parts[0]}.${+parts[1]}.${+parts[2]}`;
}

// 巡演日期区间格式化
export function formatTourRange(start, end) {
  if (!start) return '';
  if (!end || start === end) return formatDateDay(start);
  const s = start.split('-');
  const e = end.split('-');
  if (s[0] === e[0]) {
    return `${+s[0]}.${+s[1]}.${+s[2]} - ${+e[1]}.${+e[2]}`;
  }
  return `${formatDateDay(start)} - ${formatDateDay(end)}`;
}

export function todayStr() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function daysBetween(fromStr, toStr) {
  const a = new Date(fromStr + 'T00:00:00');
  const b = new Date(toStr + 'T00:00:00');
  return Math.round((b - a) / 86400000);
}

export function formatDateCN(s) {
  if (!s) return '';
  const p = s.split('-');
  if (p.length < 3) return s;
  return `${+p[0]}年${+p[1]}月${+p[2]}日`;
}

export function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function fmtAmount(n) {
  const num = Number(n) || 0;
  return '¥' + num.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export function fmtDate(d) {
  return d ? d.replace(/-/g, '.') : '';
}

export function sumExpenses(list) {
  return (list || []).reduce((s, e) => {
    if (e == null) return s;
    if (typeof e === 'number') return s + e;
    const v = e.amount != null ? e.amount : (e.total != null ? e.total : (e.price != null ? e.price : 0));
    const n = typeof v === 'number' ? v : parseFloat(v);
    return s + (isNaN(n) ? 0 : n);
  }, 0);
}

export function randomSeat() {
  return String.fromCharCode(65 + Math.floor(Math.random() * 6)) + (10 + Math.floor(Math.random() * 15));
}
export function randomRow() {
  return 1 + Math.floor(Math.random() * 20);
}

export function seedOf(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function getChinaProvinces() {
  return typeof CHINA_PROVINCES !== 'undefined' ? CHINA_PROVINCES : [];
}

export function animateValue(el, target) {
  const num = +target;
  if (!num) {
    if (el.firstChild) el.firstChild.textContent = '0';
    return;
  }
  const dur = 1000;
  const start = performance.now();
  function tick(now) {
    const p = Math.min(1, (now - start) / dur);
    if (el.firstChild) el.firstChild.textContent = Math.round(num * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
