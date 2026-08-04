/* 余响 Encore · 前端逻辑 v0.5.0（Task 11 深度优化版）
 * 多页面版本：按页面元素按需渲染
 * 数据源：后端 API（优先）→ 静态 JSON 文件（GitHub Pages 回退，只读）
 * V0.4：明暗主题切换 + 场馆点亮/熄灭双向交互 + localStorage 持久化
 * V0.5.0：巡演日期区间格式 + identity 页功能落地 + Task 11 深度优化（冗余 DOM 合并、首屏渲染优化、交互反馈统一、代码结构整理）
 *
 * 保留要点：rAF 合并渲染 / 事件委托 / 局部更新 / formatTourRange / renderIdCard
 *           openIdentityCard / copyIdentityText / sumExpenses / loadLocalMeetDates 等均原样保留
 */

/* ============================================================
   §1  全局常量
   ============================================================ */

// 后端地址：本地开发留空；GitHub Pages 部署时填 HF Space URL
// 例如：const API_BASE = 'https://andreas777-fresheye.hf.space';
const API_BASE = '';

// Q版场馆SVG（无生成图的场馆用此占位，保持统一萌系画风）
const venueSVG = {
  nest:'<svg viewBox="0 0 100 100"><g fill="none" stroke="#ff3d8b" stroke-width="2.5" stroke-linecap="round"><path d="M20 35 Q50 20 80 35"/><path d="M18 50 Q50 32 82 50"/><path d="M20 65 Q50 50 80 65"/><ellipse cx="50" cy="78" rx="30" ry="6"/></g><circle cx="50" cy="55" r="3" fill="#f5c45e"/></svg>',
  arena:'<svg viewBox="0 0 100 100"><g fill="none" stroke="#7c5cff" stroke-width="2.5" stroke-linecap="round"><rect x="20" y="35" width="60" height="40" rx="4"/><path d="M20 45 Q50 28 80 45"/><line x1="35" y1="55" x2="65" y2="55"/></g><circle cx="50" cy="30" r="3" fill="#f5c45e"/></svg>',
  dome:'<svg viewBox="0 0 100 100"><g fill="none" stroke="#3ee8d0" stroke-width="2.5" stroke-linecap="round"><path d="M22 60 Q22 30 50 30 Q78 30 78 60"/><line x1="22" y1="60" x2="78" y2="60"/><path d="M35 45 L50 35 L65 45"/></g><circle cx="50" cy="40" r="2.5" fill="#f5c45e"/></svg>',
  bowl:'<svg viewBox="0 0 100 100"><g fill="none" stroke="#ff3d8b" stroke-width="2.5" stroke-linecap="round"><path d="M18 55 Q50 75 82 55"/><path d="M18 55 Q50 35 82 55"/><ellipse cx="50" cy="45" rx="22" ry="5"/></g></svg>',
  lotus:'<svg viewBox="0 0 100 100"><g fill="none" stroke="#f5c45e" stroke-width="2.5" stroke-linecap="round"><path d="M50 35 Q35 50 50 65 Q65 50 50 35Z"/><path d="M50 35 Q30 45 40 60 Q50 50 50 35Z"/><path d="M50 35 Q70 45 60 60 Q50 50 50 35Z"/></g><circle cx="50" cy="48" r="3" fill="#ff3d8b"/></svg>'
};

// 皮肤中文名映射
const skinNames = {
  jay:'周杰伦 · 魔幻紫', jj:'林俊杰 · 深海蓝', mayday:'五月天 · 玫瑰红', zhangjie:'张杰 · 森林绿',
  joker:'薛之谦 · 暗夜紫', silence:'汪苏泷 · 晴空蓝', zhoushen:'周深 · 星河紫', gem:'邓紫棋 · 玫粉红',
  leehom:'王力宏 · 深蓝海', davidtao:'陶喆 · 暖橙调', vae:'许嵩 · 茶汤绿', lironghao:'李荣浩 · 暗紫调', nic:'谢霆锋 · 烈焰红'
};

// 粉丝等级阶梯
const FAN_LEVELS = [
  {min:0,name:'路人粉',lv:0},
  {min:1,name:'新手粉丝',lv:1},
  {min:4,name:'进阶粉丝',lv:2},
  {min:9,name:'资深粉丝',lv:3},
  {min:16,name:'铁杆粉丝',lv:4},
  {min:26,name:'殿堂级粉丝',lv:5}
];

/* 中国省份 SVG path 数据由 data/china-map.js 提供（真实国土形状） */
/* CHINA_PROVINCES 由 data/china-map.js 提供，按真实地理位置排布 */

/* ============================================================
   §2  全局状态变量
   ============================================================ */

let VENUES = [], ARTISTS = [], CONCERTS = [], USER = {}, STATS = {}, MEET_DATES = [], EXPENSES = [];
let curProv = null, curType = 'all-albums', curArtistFilter = 'all', curDan = 1;

// 场馆网格事件委托只绑定一次的标志位
let _venueGridDelegated = false;
// 中国地图是否已完成首次渲染（避免后续选择切换时全量重建）
let _chinaMapRendered = false;

// rAF 合并渲染所需状态（Task 3 卡顿修复保留）
let _rafScheduled = false;
let _changedVenues = new Set();
let _pendingToast = null;

/* ============================================================
   §3  工具函数
   ============================================================ */

// 延迟执行非关键任务：优先 requestIdleCallback，回退 setTimeout
const deferRender = window.requestIdleCallback
  ? (fn, opts) => window.requestIdleCallback(fn, opts || { timeout: 800 })
  : (fn) => setTimeout(fn, 16);

// toast：type 取值 success / error / info / warning（默认 info）
let toastTimer;
function toast(msg, type){
  type = type || 'info';
  const t = document.getElementById('toast');
  if(!t) return;
  document.getElementById('toastText').textContent = msg;
  t.classList.remove('toast-success','toast-error','toast-info','toast-warning');
  t.classList.add('toast-' + type);
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

// 专辑/周边占位SVG
function collSVG(artist){
  const a = ARTISTS.find(x=>x.id===artist.artistId) || {color:'#5b2c8b',initial:'?'};
  return `<svg viewBox="0 0 100 100"><rect x="20" y="20" width="60" height="60" rx="6" fill="${a.color}"/><text x="50" y="58" text-anchor="middle" font-family="serif" font-weight="900" font-size="22" fill="#f5c45e">${a.initial}</text></svg>`;
}

/* ===== 巡演日期格式化（Task 4 保留）=====
 * "2024-06-26" → "2024.6.26"（去前导零）
 * 区间：同年省略后半段年份 → "2024.6.26 - 8.15"；跨年 → "2023.6.29 - 2025.10.9"
 * 单场（startDate===endDate 或 endDate 缺失）→ "2024.6.26" */
function formatDateDay(d){
  if(!d) return '';
  const parts = d.split('-');
  if(parts.length < 3) return d;
  return `${+parts[0]}.${+parts[1]}.${+parts[2]}`;
}
function formatTourRange(start, end){
  if(!start) return '';
  if(!end || start === end) return formatDateDay(start);
  const s = start.split('-'), e = end.split('-');
  if(s[0] === e[0]){
    return `${+s[0]}.${+s[1]}.${+s[2]} - ${+e[1]}.${+e[2]}`;
  }
  return `${formatDateDay(start)} - ${formatDateDay(end)}`;
}

/* ============================================================
   §4  数据加载（并行 fetch，Promise.all）
   ============================================================ */

async function fetchJSON(apiPath, staticPath){
  try {
    const r = await fetch(API_BASE + apiPath);
    if(!r.ok) throw new Error(r.status);
    return await r.json();
  } catch(e) {
    if(!staticPath) throw e;
    const r2 = await fetch(staticPath);
    return await r2.json();
  }
}

// 并行拉取全部资源：venues / artists / concerts / user / stats 同时发起
async function loadData(){
  const [venues, artists, concerts, userRes, statsRes] = await Promise.all([
    fetchJSON('/api/venues', 'data/venues.json'),
    fetchJSON('/api/artists', 'data/artists.json'),
    fetchJSON('/api/concerts', 'data/concerts.json'),
    fetchJSON('/api/user', 'data/users.json').catch(() => ({})),
    fetch(API_BASE + '/api/stats').then(r => r.ok ? r.json() : null).catch(() => null)
  ]);
  VENUES = venues;
  ARTISTS = artists;
  CONCERTS = concerts;
  // 用户数据：API 返回单用户对象；静态文件为 {demo:{...}}
  USER = (userRes && userRes.demo) ? userRes.demo : (userRes || {});
  // 统计：API 优先，失败则本地计算
  STATS = statsRes || computeStats();
}

function computeStats(){
  const litVenues = new Set((USER.checkins||[]).map(c=>c.venueId));
  const litProvinces = new Set(
    VENUES.filter(v=>litVenues.has(v.id)).map(v=>v.provinceShort)
  );
  const totalCollections = Object.values(USER.collections||{}).flat().length;
  return {
    litVenues: litVenues.size,
    totalVenues: VENUES.length,
    litProvinces: litProvinces.size,
    totalProvinces: new Set(VENUES.map(v=>v.provinceShort)).size,
    totalCollections,
    totalConcerts: CONCERTS.length
  };
}

/* ============================================================
   §5  localStorage 持久化
   ============================================================ */

function loadLocalCheckins(){
  try{
    const local = JSON.parse(localStorage.getItem('encore-checkins') || '[]');
    // 合并本地打卡记录到 USER.checkins（去重）
    if(!USER.checkins) USER.checkins = [];
    const existing = new Set(USER.checkins.map(c=>c.venueId));
    local.forEach(c=>{ if(!existing.has(c.venueId)) USER.checkins.push(c); });
  }catch(e){}
}
function saveLocalCheckins(){
  try{
    // 只保存本地新增的打卡（标记来源）
    const local = (USER.checkins||[]).filter(c=>c._local);
    localStorage.setItem('encore-checkins', JSON.stringify(local));
  }catch(e){}
}
function loadLocalCollections(){
  try{
    const local = JSON.parse(localStorage.getItem('encore-collections') || 'null');
    if(local && USER.collections){
      // 合并本地收藏到 USER.collections
      ['album','single','merch'].forEach(type=>{
        if(local[type]){
          local[type].forEach(item=>{
            if(!USER.collections[type].some(x=>x.artistId===item.artistId && x.name===item.name)){
              USER.collections[type].push(item);
            }
          });
        }
      });
    }
  }catch(e){}
}
function loadLocalBias(){
  try{
    const local = JSON.parse(localStorage.getItem('encore-bias') || 'null');
    if(local && local.type && Array.isArray(local.list) && local.list.length){
      USER.bias = local;
      curDan = local.type;
    }
  }catch(e){}
}
function saveLocalBias(){
  try{
    if(USER.bias) localStorage.setItem('encore-bias', JSON.stringify(USER.bias));
  }catch(e){}
}
// 见面记录（Task 10 identity 保留）
function loadLocalMeetDates(){
  try{
    const local = JSON.parse(localStorage.getItem('encore-meet-dates') || '[]');
    MEET_DATES = Array.isArray(local) ? local : [];
  }catch(e){ MEET_DATES = []; }
}
// 消费记录（Task 10 identity 保留）
function loadLocalExpenses(){
  try{
    const local = JSON.parse(localStorage.getItem('encore-expenses') || '[]');
    EXPENSES = Array.isArray(local) ? local : [];
  }catch(e){ EXPENSES = []; }
}
// 消费求和（兼容多种记录形态，Task 10 identity 保留）
function sumExpenses(){
  return EXPENSES.reduce((s,e)=>{
    if(e == null) return s;
    if(typeof e === 'number') return s + e;
    const v = e.amount != null ? e.amount : (e.total != null ? e.total : (e.price != null ? e.price : 0));
    const n = typeof v === 'number' ? v : parseFloat(v);
    return s + (isNaN(n) ? 0 : n);
  }, 0);
}

/* ============================================================
   §6  主题与皮肤
   ============================================================ */

function initTheme(){
  const saved = localStorage.getItem('encore-theme');
  if(saved === 'dark') document.documentElement.classList.add('dark');
}
function toggleTheme(){
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('encore-theme', isDark ? 'dark' : 'light');
  toast(isDark ? '已切换至暗色模式' : '已切换至亮色模式', 'info');
}

// 皮肤切换记录（变色龙成就）
function trackSkin(id){
  try{
    let hist = JSON.parse(localStorage.getItem('skinHistory')||'[]');
    if(!hist.includes(id)){ hist.push(id); localStorage.setItem('skinHistory',JSON.stringify(hist)); }
  }catch(e){}
}
function applySkin(id){
  const a = ARTISTS.find(x=>x.id===id);
  if(!a) return;
  document.documentElement.style.setProperty('--theme-main',a.color);
  document.documentElement.style.setProperty('--theme-accent',a.color2);
  document.querySelectorAll('.skin-chip').forEach(c=>c.classList.toggle('active',c.dataset.id===id));
  const tp = document.getElementById('themePreview');
  if(tp){
    tp.querySelector('.tp-name').textContent = skinNames[id]||a.name;
    tp.querySelector('.tp-color').textContent = `主色 ${a.color} · 强调 ${a.color2}`;
  }
  if(USER.skin!==id){
    USER.skin = id;
    trackSkin(id);
    fetch(API_BASE+'/api/user/skin',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({skin:id})}).catch(()=>{});
    toast(`已切换至「${a.name}」主题`, 'success');
  }
}
function renderSkinRow(){
  const el = document.getElementById('skinRow');
  el.innerHTML = ARTISTS.map(a=>`<div class="skin-chip ${a.id===(USER.skin||'jay')?'active':''}" data-id="${a.id}" style="background:linear-gradient(160deg,${a.color},${a.color}55)">${a.en.slice(0,6)}</div>`).join('');
  el.querySelectorAll('.skin-chip').forEach(c=>c.onclick=()=>applySkin(c.dataset.id));
}

/* ============================================================
   §7  交互反馈注入（按钮点击态 / 加载骨架）
   ============================================================ */

// 一次性注入：为缺少 :active 反馈的可点击元素补充按压缩放反馈
function injectInteractionStyles(){
  if(document.getElementById('encore-interaction-styles')) return;
  const s = document.createElement('style');
  s.id = 'encore-interaction-styles';
  s.textContent = `
    .venue-card,.prov,.skin-chip,.bias-add-chip,.bias-remove,.plan-cta{cursor:pointer}
    .venue-card{transition:transform .12s ease}
    .venue-card:active{transform:scale(.985)}
    .prov:active{transform:scale(.97)}
    .skin-chip:active{transform:scale(.93)}
    .bias-add-chip:active{transform:scale(.94)}
    .bias-remove:active{transform:scale(.9)}
    .plan-cta:active{transform:scale(.96)}
  `;
  document.head.appendChild(s);
}

// 首屏数据加载前在 heroStats 展示骨架屏，提升感知性能
function showHeroSkeleton(){
  const el = document.getElementById('heroStats');
  if(!el) return;
  const block = '<div class="stat"><div class="skeleton" style="height:42px;width:74px;border-radius:6px"></div><div class="skeleton skeleton-text sm" style="width:56px;margin-top:8px"></div></div>';
  el.innerHTML = block + block + block + block;
}

/* ============================================================
   §8  通用渲染辅助
   ============================================================ */

function getLitVenueIds(){ return new Set((USER.checkins||[]).map(c=>c.venueId)); }

function getProvinces(){
  const map = {};
  VENUES.forEach(v=>{
    if(!map[v.provinceShort]) map[v.provinceShort]={province:v.province,short:v.provinceShort,region:v.region,total:0,lit:0,venues:[]};
    map[v.provinceShort].total++;
    map[v.provinceShort].venues.push(v);
  });
  const lit = getLitVenueIds();
  VENUES.forEach(v=>{ if(lit.has(v.id)) map[v.provinceShort].lit++; });
  return Object.values(map);
}

/* ============================================================
   §9  首页渲染（Hero 统计 / 票卡）
   ============================================================ */

function renderHeroStats(){
  document.getElementById('heroStats').innerHTML = `
    <div class="stat"><div class="num">${STATS.litVenues}<span class="unit">座</span></div><div class="label">已点亮场馆</div></div>
    <div class="stat"><div class="num">${STATS.litProvinces}<span class="unit">省</span></div><div class="label">解锁省份</div></div>
    <div class="stat"><div class="num">${STATS.totalCollections}<span class="unit">件</span></div><div class="label">收藏总数</div></div>
    <div class="stat"><div class="num">${STATS.totalConcerts}<span class="unit">场</span></div><div class="label">巡演档案</div></div>`;
}

// Hero 票卡（动态渲染最近一次打卡）
function renderHeroTicket(){
  const card = document.getElementById('heroTicket');
  if(!card) return;
  const checkins = USER.checkins || [];
  if(checkins.length === 0){
    card.querySelector('.t-artist').textContent = '尚未点亮';
    card.querySelector('.t-tour').textContent = '去场馆地图点亮第一座舞台';
    card.querySelector('.t-venue').innerHTML = '<strong>等待你的第一场</strong>';
    card.querySelector('.t-venue:nth-of-type(4)').textContent = '余响 Encore';
    card.querySelector('.t-row').innerHTML = '<span>SEAT -</span><span>ROW -</span>';
    return;
  }
  // 取最近一次打卡（按日期排序）
  const latest = [...checkins].sort((a,b)=>b.date.localeCompare(a.date))[0];
  const artist = ARTISTS.find(a=>a.id===latest.artistId) || {name:'-'};
  const venue = VENUES.find(v=>v.id===latest.venueId) || {name:'-',city:'-'};
  const concert = CONCERTS.find(c=>c.venueId===latest.venueId && c.artistId===latest.artistId);
  const tour = concert ? concert.tour : (latest.note || '');
  const seat = String.fromCharCode(65 + Math.floor(Math.random()*6)) + (10+Math.floor(Math.random()*15));
  const row = 1 + Math.floor(Math.random()*20);
  card.querySelector('.t-artist').textContent = artist.name;
  card.querySelector('.t-tour').textContent = tour;
  card.querySelector('.t-venue').innerHTML = `<strong>${venue.name}${venue.alias?' · '+venue.alias:''}</strong>`;
  const subLine = card.querySelectorAll('.t-venue')[1];
  if(subLine) subLine.textContent = `${venue.city} · ${latest.date}`;
  card.querySelector('.t-row').innerHTML = `<span>SEAT 区 ${seat}</span><span>ROW ${row}</span>`;
}

/* ============================================================
   §10  场馆地图页（省份列表 / 场馆卡片 / 中国地图）
   ============================================================ */

function renderProvinces(){
  const el = document.getElementById('provList');
  const provs = getProvinces();
  el.innerHTML = provs.map(p=>`
    <div class="prov ${p.lit>0?'lit':''} ${p.short===curProv?'active':''}" data-prov="${p.short}">
      <div class="prov-name"><span class="pin"></span>${p.province}</div>
      <div class="prov-count">${p.lit}/${p.total}</div>
    </div>`).join('');
  el.querySelectorAll('.prov').forEach(n=>n.onclick=()=>{
    curProv = n.dataset.prov;
    renderProvinces();
    renderVenues();
  });
  // 中国地图：首次全量渲染，后续仅切换选中态（避免全量重建 + 重复绑定监听）
  if(document.getElementById('chinaMap') && typeof CHINA_PROVINCES !== 'undefined'){
    if(!_chinaMapRendered){ renderChinaMap(); _chinaMapRendered = true; }
    else updateChinaMapSelection();
  }
}

function renderVenues(){
  const provs = getProvinces();
  const p = provs.find(x=>x.short===curProv) || provs[0];
  document.getElementById('mapProvName').textContent = p.province;
  document.getElementById('mapLitBadge').textContent = `${p.lit} / ${p.total} 已点亮`;
  document.getElementById('mapProvSub').textContent = p.region + ' · ' + (p.lit===p.total&&p.total>0?'已集齐':'巡演城市');
  const lit = getLitVenueIds();
  const g = document.getElementById('venueGrid');
  g.innerHTML = p.venues.map(v=>{
    const isLit = lit.has(v.id);
    const imgSrc = isLit ? v.img : (v.imgUnlit || v.img);
    const art = imgSrc ? `<img src="${imgSrc}" alt="${v.name}" class="${isLit?'lit':'unlit'}" onerror="this.parentNode.innerHTML=venueSVG['${v.art}']||venueSVG.dome">` : (venueSVG[v.art]||venueSVG.dome);
    const checkin = (USER.checkins||[]).find(c=>c.venueId===v.id);
    const artist = checkin ? ARTISTS.find(a=>a.id===checkin.artistId) : null;
    return `<div class="venue-card ${isLit?'lit':''}" data-id="${v.id}">
      ${!isLit?'<div class="toggle-hint">点击点亮</div>':''}
      <div class="venue-art">${art}</div>
      <div class="venue-name">${v.name}</div>
      <div class="venue-alias">${v.alias}</div>
      <div class="venue-meta">${v.city} · ${v.type} · ${v.capacity>=10000?Math.floor(v.capacity/10000)+'万':v.capacity}座</div>
      ${isLit&&artist?`<div class="lit-info">${artist.name} · ${checkin.date}</div>`:''}
    </div>`;
  }).join('');
  ensureVenueDelegation();
}

/* ===== 场馆点亮/熄灭（Task 3 高性能版保留：rAF 合并 + 局部更新）===== */
function ensureVenueDelegation(){
  if(_venueGridDelegated) return;
  const g = document.getElementById('venueGrid');
  if(!g) return;
  _venueGridDelegated = true;
  g.addEventListener('click', e=>{
    const card = e.target.closest('.venue-card');
    if(!card) return;
    toggleCheckin(card.dataset.id);
  });
}

// 同步切换状态（不等待 fetch），返回 'lit' | 'unlit' | null
function applyCheckinToggle(venueId){
  const venue = VENUES.find(v=>v.id===venueId);
  if(!venue) return null;
  const lit = getLitVenueIds();
  if(lit.has(venueId)){
    USER.checkins = (USER.checkins||[]).filter(c=>c.venueId!==venueId);
    saveLocalCheckins();
    STATS = computeStats();
    fetch(API_BASE+'/api/user/checkin',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({venueId})}).catch(()=>{});
    return 'unlit';
  }
  const concerts = CONCERTS.filter(c=>c.venueId===venueId);
  const artistId = concerts.length ? concerts[0].artistId : ((USER.bias&&USER.bias.list[0])||'jay');
  const date = concerts.length ? concerts[0].date : new Date().toISOString().slice(0,10);
  const note = concerts.length ? concerts[0].tour : '';
  USER.checkins.push({venueId,artistId,date,note,_local:true});
  saveLocalCheckins();
  STATS = computeStats();
  fetch(API_BASE+'/api/user/checkin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({venueId,artistId,date,note})})
    .then(r=>r.ok?r.json():null)
    .then(d=>{ if(d&&d.user) USER=d.user; })
    .catch(()=>{});
  return 'lit';
}

// 单卡片局部更新（不全量重建 grid）
function updateVenueCard(venueId){
  const card = document.querySelector(`.venue-card[data-id="${venueId}"]`);
  if(!card) return;
  const venue = VENUES.find(v=>v.id===venueId);
  if(!venue) return;
  const isLit = getLitVenueIds().has(venueId);
  card.classList.toggle('lit', isLit);
  const artEl = card.querySelector('.venue-art');
  if(artEl){
    const imgSrc = isLit ? venue.img : (venue.imgUnlit || venue.img);
    artEl.innerHTML = imgSrc
      ? `<img src="${imgSrc}" alt="${venue.name}" class="${isLit?'lit':'unlit'}" onerror="this.parentNode.innerHTML=venueSVG['${venue.art}']||venueSVG.dome">`
      : (venueSVG[venue.art]||venueSVG.dome);
  }
  let hint = card.querySelector('.toggle-hint');
  if(isLit){ if(hint) hint.remove(); }
  else if(!hint){
    hint = document.createElement('div');
    hint.className = 'toggle-hint';
    hint.textContent = '点击点亮';
    card.insertBefore(hint, card.firstChild);
  }
  const oldInfo = card.querySelector('.lit-info');
  if(oldInfo) oldInfo.remove();
  if(isLit){
    const checkin = (USER.checkins||[]).find(c=>c.venueId===venueId);
    const artist = checkin ? ARTISTS.find(a=>a.id===checkin.artistId) : null;
    if(artist){
      const info = document.createElement('div');
      info.className = 'lit-info';
      info.textContent = `${artist.name} · ${checkin.date}`;
      card.appendChild(info);
    }
  }
}

// 局部更新省份计数 / badge / 中国地图路径（不全量重建）
function updateProvinceInline(provShort){
  const provs = getProvinces();
  const p = provs.find(x=>x.short===provShort);
  if(!p) return;
  const provEl = document.querySelector(`.prov[data-prov="${provShort}"]`);
  if(provEl){
    provEl.classList.toggle('lit', p.lit>0);
    const cnt = provEl.querySelector('.prov-count');
    if(cnt) cnt.textContent = `${p.lit}/${p.total}`;
  }
  if(provShort === curProv){
    const badge = document.getElementById('mapLitBadge');
    if(badge) badge.textContent = `${p.lit} / ${p.total} 已点亮`;
    const sub = document.getElementById('mapProvSub');
    if(sub) sub.textContent = p.region + ' · ' + (p.lit===p.total&&p.total>0?'已集齐':'巡演城市');
  }
  const path = document.querySelector(`.cmp-prov[data-prov="${provShort}"]`);
  if(path){
    path.classList.toggle('lit', p.lit>0);
    const title = path.querySelector('title');
    if(title) title.textContent = `${p.province} · ${p.lit}/${p.total}`;
  }
  const cmpStats = document.querySelector('.cmp-stats');
  if(cmpStats){
    const litProvCount = provs.filter(x=>x.lit>0).length;
    cmpStats.textContent = `${litProvCount} / ${provs.length} 省份已点亮`;
  }
}

// 仅切换中国地图选中态（替代全量 renderChinaMap，避免重复绑定监听）
function updateChinaMapSelection(){
  const el = document.getElementById('chinaMap');
  if(!el) return;
  el.querySelectorAll('.cmp-prov').forEach(path=>{
    path.classList.toggle('sel', path.dataset.prov === curProv);
  });
}

// 局部更新 Hero 统计数字（仅改文本，不重建结构）
function updateHeroStatsInline(){
  const el = document.getElementById('heroStats');
  if(!el) return;
  const nums = el.querySelectorAll('.stat .num');
  if(nums.length >= 4){
    nums[0].firstChild.textContent = STATS.litVenues;
    nums[1].firstChild.textContent = STATS.litProvinces;
    nums[2].firstChild.textContent = STATS.totalCollections;
    nums[3].firstChild.textContent = STATS.totalConcerts;
  } else {
    renderHeroStats();
  }
}

// rAF 合并：同一帧内多次点击只渲染一次最终状态
function scheduleRender(){
  if(_rafScheduled) return;
  _rafScheduled = true;
  requestAnimationFrame(()=>{
    _rafScheduled = false;
    const changed = _changedVenues;
    _changedVenues = new Set();
    const provsTouched = new Set();
    changed.forEach(id=>{
      updateVenueCard(id);
      const v = VENUES.find(x=>x.id===id);
      if(v) provsTouched.add(v.provinceShort);
    });
    provsTouched.forEach(ps=>updateProvinceInline(ps));
    updateHeroStatsInline();
    if(document.getElementById('heroTicket')) renderHeroTicket();
    if(_pendingToast){ toast(_pendingToast.msg, _pendingToast.type); _pendingToast = null; }
  });
}

function toggleCheckin(venueId){
  const venue = VENUES.find(v=>v.id===venueId);
  if(!venue) return;
  const result = applyCheckinToggle(venueId);
  if(!result) return;
  const card = document.querySelector(`.venue-card[data-id="${venueId}"]`);
  if(card){
    card.classList.remove('lighting','unlighting');
    const cls = result==='lit' ? 'lighting' : 'unlighting';
    card.classList.add(cls);
    setTimeout(()=>card.classList.remove(cls), result==='lit'?500:400);
  }
  _pendingToast = {
    msg: result==='lit' ? `已点亮「${venue.name}」` : `已熄灭「${venue.name}」`,
    type: result==='lit' ? 'success' : 'info'
  };
  _changedVenues.add(venueId);
  scheduleRender();
}

/* ===== 中国省份点亮地图（全量渲染仅首次执行）===== */
function renderChinaMap(){
  const el = document.getElementById('chinaMap');
  if(!el || typeof CHINA_PROVINCES === 'undefined') return;
  const lit = getLitVenueIds();
  const litProvs = new Set(VENUES.filter(v=>lit.has(v.id)).map(v=>v.provinceShort));
  const totalProvCount = new Set(VENUES.map(v=>v.provinceShort)).size;
  const provMap = {};
  getProvinces().forEach(p=>provMap[p.short]=p);
  const paths = CHINA_PROVINCES.map(p=>{
    const data = provMap[p.short];
    const isLit = litProvs.has(p.short);
    const hasVenues = !!data;
    const cls = ['cmp-prov', isLit?'lit':'', hasVenues?'has-venues':'no-venues', p.short===curProv?'sel':''].filter(Boolean).join(' ');
    return `<path class="${cls}" d="${p.d}" data-prov="${p.short}"><title>${p.name}${data?` · ${data.lit}/${data.total}`:''}</title></path>`;
  }).join('');
  el.innerHTML = `
    <div class="china-map-wrap">
      <div class="china-map-head">
        <div>
          <div class="tag">Footprint Map</div>
          <h3>足迹版图 <em>Light Up China</em></h3>
        </div>
        <span class="cmp-stats">${litProvs.size} / ${totalProvCount} 省份已点亮</span>
      </div>
      <div class="china-map-stage">
        <svg class="china-svg" viewBox="0 0 800 620" preserveAspectRatio="xMidYMid meet" role="img" aria-label="中国省份点亮地图">
          <defs>
            <linearGradient id="cmpGoldGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#f5c45e"/>
              <stop offset="100%" stop-color="#c8933a"/>
            </linearGradient>
          </defs>
          ${paths}
        </svg>
        <div class="cmp-tip"></div>
      </div>
      <div class="china-map-legend">
        <span class="lg lg-off"><i></i>未点亮</span>
        <span class="lg lg-on"><i></i>已点亮</span>
        <span class="lg lg-na"><i></i>暂无场馆</span>
      </div>
    </div>`;
  const stage = el.querySelector('.china-map-stage');
  const tip = el.querySelector('.cmp-tip');
  el.querySelectorAll('.cmp-prov').forEach(path=>{
    const prov = path.dataset.prov;
    const meta = CHINA_PROVINCES.find(c=>c.short===prov);
    const data = provMap[prov];
    path.addEventListener('mouseenter',()=>{
      tip.innerHTML = `<strong>${meta?meta.name:prov}</strong><span>${data?`${data.lit}/${data.total} 座场馆已点亮`:'暂无收录场馆'}</span>`;
      tip.classList.add('show');
    });
    path.addEventListener('mousemove',e=>{
      const r = stage.getBoundingClientRect();
      tip.style.left = (e.clientX - r.left + 14) + 'px';
      tip.style.top = (e.clientY - r.top + 14) + 'px';
    });
    path.addEventListener('mouseleave',()=>tip.classList.remove('show'));
    if(path.classList.contains('has-venues')){
      path.addEventListener('click',()=>{
        curProv = prov;
        renderProvinces();
        renderVenues();
      });
    }
  });
}

/* ============================================================
   §11  巡演档案页
   ============================================================ */

function renderArtistFilter(){
  const el = document.getElementById('artistFilter');
  el.innerHTML = `<button class="af-chip ${curArtistFilter==='all'?'active':''}" data-id="all">全部</button>` +
    ARTISTS.map(a=>`<button class="af-chip ${curArtistFilter===a.id?'active':''}" data-id="${a.id}">${a.name}</button>`).join('');
  el.querySelectorAll('.af-chip').forEach(b=>b.onclick=()=>{
    curArtistFilter = b.dataset.id;
    renderArtistFilter();
    renderTours();
  });
}
function renderTours(){
  let list = CONCERTS;
  if(curArtistFilter!=='all') list = list.filter(c=>c.artistId===curArtistFilter);
  list = [...list].sort((a,b)=>b.date.localeCompare(a.date));
  const body = document.getElementById('tourBody');
  body.innerHTML = list.map(c=>{
    const a = ARTISTS.find(x=>x.id===c.artistId);
    const v = VENUES.find(x=>x.id===c.venueId);
    return `<tr>
      <td><span class="artist-tag"><span class="artist-dot" style="background:${a?a.color:'#888'}"></span>${a?a.name:'-'}</span></td>
      <td>${c.tour}</td>
      <td>${c.city}</td>
      <td>${v?v.name:c.venueId}</td>
      <td class="date-cell">${formatTourRange(c.startDate || c.date, c.endDate)}</td>
      <td>${c.note||''}</td>
    </tr>`;
  }).join('');
}

/* ============================================================
   §12  收藏展览页
   ============================================================ */

function renderShelf(){
  const s = document.getElementById('shelf');
  if(curType === 'all-albums'){
    // 全部专辑模式：展示所有歌手的全部专辑
    const collected = new Set((USER.collections&&USER.collections.album||[]).map(a=>a.artistId+'-'+a.name));
    const allAlbums = [];
    ARTISTS.forEach(a=>{
      (a.albums||[]).forEach(al=>{
        allAlbums.push({...al, artistId:a.id, artistName:a.name, artistInitial:a.initial, artistColor:a.color, artistColor2:a.color2, collected:collected.has(a.id+'-'+al.name)});
      });
    });
    s.innerHTML = allAlbums.map(al=>`
      <div class="album-card ${al.collected?'collected':''}" onclick="toggleAlbum('${al.artistId}','${al.name.replace(/'/g,"\\'")}',${al.year})">
        <div class="album-cover">
          <svg viewBox="0 0 100 100"><rect x="15" y="15" width="70" height="70" rx="6" fill="${al.artistColor}"/><text x="50" y="58" text-anchor="middle" font-family="serif" font-weight="900" font-size="22" fill="${al.artistColor2}">${al.artistInitial}</text></svg>
          <div class="album-year-badge">${al.year}</div>
          ${al.collected?'<div class="album-collected-badge" style="position:absolute;top:8px;left:8px;font-size:9px;font-family:var(--mono);color:#fff;background:linear-gradient(100deg,var(--gold),var(--neon-2));padding:2px 8px;border-radius:4px;z-index:2">已收藏</div>':''}
        </div>
        <div class="album-info">
          <div class="album-title">${al.name}</div>
          <div class="album-meta">${al.artistName} · ${al.year}</div>
        </div>
      </div>`).join('');
    return;
  }
  // 个人收藏模式
  const items = (USER.collections && USER.collections[curType]) || [];
  s.innerHTML = items.map(it=>{
    const a = ARTISTS.find(x=>x.id===it.artistId);
    return `<div class="item">
      <div class="item-cover">${collSVG({...it})}</div>
      <div class="item-info"><div class="item-title">${it.name}</div><div class="item-sub">${a?a.name:''} · ${it.year||''}</div></div>
    </div>`;
  }).join('') + `<div class="item item-add" onclick="addCollection()"><div class="item-cover"><div class="plus">+</div></div><div class="item-info"><div class="item-title">添加</div><div class="item-sub">拍下你的收藏</div></div></div>`;
}
function toggleAlbum(artistId, name, year){
  if(!USER.collections) USER.collections = {album:[],single:[],merch:[]};
  if(!USER.collections.album) USER.collections.album = [];
  const idx = USER.collections.album.findIndex(a=>a.artistId===artistId && a.name===name);
  if(idx >= 0){
    USER.collections.album.splice(idx, 1);
    toast(`已移除「${name}」`, 'info');
  } else {
    USER.collections.album.push({artistId, name, year});
    toast(`已收藏「${name}」`, 'success');
  }
  // 本地持久化
  try{ localStorage.setItem('encore-collections', JSON.stringify(USER.collections)); }catch(e){}
  STATS = computeStats();
  updateHeroStatsInline();
  renderShelf();
}
function addCollection(){ toast('上传功能开发中，敬请期待', 'info'); }

/* ============================================================
   §13  粉丝身份页（本命 / 身份卡 / 等级 / 统计 / 成就）
   ============================================================ */

function renderBias(){
  const el = document.getElementById('biasList');
  if(!el) return;
  document.querySelectorAll('#danToggle button').forEach(b=>b.classList.toggle('active',+b.dataset.dan===curDan));
  if(!USER.bias) USER.bias = {type:curDan, list:['jay']};
  if(!Array.isArray(USER.bias.list) || USER.bias.list.length===0) USER.bias.list = ['jay'];
  const list = USER.bias.list;
  const show = list.slice(0,curDan);
  el.innerHTML = show.map((id,i)=>{
    const a = ARTISTS.find(x=>x.id===id) || ARTISTS[0];
    if(!a) return '';
    const cnt = (USER.checkins||[]).filter(c=>c.artistId===id).length;
    const pct = show.length===1?100:Math.round(100*(show.length-i)/(show.length*(show.length+1)/2));
    const canRemove = list.length > 1;
    return `<div class="bias-row" data-bias="${id}">
      <div class="bias-pic" style="background:${a.color}33;color:${a.color2};border:1px solid ${a.color}">${a.initial}</div>
      <div class="bias-info">
        <div class="bias-name">${a.name}</div>
        <div class="bias-stat">看 ${cnt} 场 · 出道 ${a.debut}</div>
        <div class="bias-bar"><div class="bias-bar-fill" style="width:${pct}%"></div></div>
      </div>
      ${canRemove?`<button class="bias-remove" data-remove="${id}" aria-label="移除${a.name}" title="移除">×</button>`:''}
    </div>`;
  }).join('');
  // 本命不足 curDan 位时，展示可添加的歌手（真实添加交互）
  if(show.length < curDan){
    const rest = ARTISTS.filter(a=>!show.includes(a.id)).slice(0,8);
    if(rest.length){
      el.insertAdjacentHTML('beforeend',
        `<div class="bias-add-row">
          <div class="bias-add-label">添加本命 · 还差 ${curDan-show.length} 位</div>
          <div class="bias-add-chips">
            ${rest.map(a=>`<button class="bias-add-chip" data-add="${a.id}" style="background:${a.color}22;color:${a.color2};border:1px solid ${a.color}66">${a.initial} ${a.name}</button>`).join('')}
          </div>
        </div>`);
    }
  }
}

function getFanLevel(count){
  let idx = 0;
  for(let i=FAN_LEVELS.length-1;i>=0;i--){ if(count>=FAN_LEVELS[i].min){ idx=i; break; } }
  return { cur:FAN_LEVELS[idx], next:FAN_LEVELS[idx+1], idx };
}
function renderFanLevel(){
  const el = document.getElementById('fanLevel');
  if(!el) return;
  const count = (USER.checkins||[]).length;
  const {cur,next,idx} = getFanLevel(count);
  const pct = next ? Math.min(100,Math.round((count-cur.min)/(next.min-cur.min)*100)) : 100;
  el.innerHTML = `
    <div class="fl-card">
      <div class="fl-badge lv-${cur.lv}">
        <div class="fl-lv">Lv.${cur.lv}</div>
        <div class="fl-tier">${cur.name}</div>
      </div>
      <div class="fl-body">
        <div class="fl-top">
          <span class="fl-label">粉丝等级</span>
          <span class="fl-count">已打卡 ${count} 场</span>
        </div>
        <div class="fl-bar"><div class="fl-bar-fill" style="width:${pct}%"></div></div>
        <div class="fl-hint">${next?`距「${next.name}」还需 ${next.min-count} 场`:'已达最高等级 · 殿堂级粉丝'}</div>
      </div>
      <div class="fl-dots">
        ${FAN_LEVELS.map((l,i)=>`<span class="fl-dot ${i<=idx?'on':''} ${i===idx?'cur':''}"></span>`).join('')}
      </div>
    </div>`;
}

function renderFanStats(){
  const el = document.getElementById('fanStats');
  if(!el) return;
  const checkins = USER.checkins || [];
  const litVenues = new Set(checkins.map(c=>c.venueId));
  const litProvSet = new Set(VENUES.filter(v=>litVenues.has(v.id)).map(v=>v.provinceShort));
  const artistCount = {};
  checkins.forEach(c=>artistCount[c.artistId]=(artistCount[c.artistId]||0)+1);
  const topEntry = Object.entries(artistCount).sort((a,b)=>b[1]-a[1])[0];
  const topArtist = topEntry ? ARTISTS.find(a=>a.id===topEntry[0]) : null;
  const typeCount = {};
  checkins.forEach(c=>{ const v=VENUES.find(x=>x.id===c.venueId); if(v) typeCount[v.type]=(typeCount[v.type]||0)+1; });
  const topType = Object.entries(typeCount).sort((a,b)=>b[1]-a[1])[0];
  const since = USER.since ? Math.max(0,new Date().getFullYear()-(+USER.since)) : 0;
  const totalV = STATS.totalVenues||VENUES.length||31;
  const totalP = STATS.totalProvinces||20;
  const cards = [
    {label:'总观演场次', value:checkins.length, suffix:'场', num:true},
    {label:'点亮场馆', value:litVenues.size, suffix:' / '+totalV, num:true},
    {label:'足迹省份', value:litProvSet.size, suffix:' / '+totalP, num:true},
    {label:'追星年资', value:since, suffix:'年', num:true},
    {label:'追星支出', value:Math.round(sumExpenses()), suffix:'元', num:true},
    {label:'见面记录', value:MEET_DATES.length, suffix:'次', num:true},
    {label:'最常看歌手', value:topArtist?topArtist.name:'-', num:false},
    {label:'最爱场馆类型', value:topType?topType[0]:'-', num:false}
  ];
  el.innerHTML = cards.map(c=>`
    <div class="fs-card">
      <div class="fs-value ${c.num?'':'text'}" ${c.num?`data-target="${c.value}"`:''}>${c.num?0:c.value}<span class="fs-suffix">${c.suffix||''}</span></div>
      <div class="fs-label">${c.label}</div>
    </div>`).join('');
}
function animateNum(el){
  const target = +el.dataset.target;
  if(!target){ el.firstChild.textContent = '0'; return; }
  const dur = 1000, start = performance.now();
  function tick(now){
    const p = Math.min(1,(now-start)/dur);
    el.firstChild.textContent = Math.round(target*(1-Math.pow(1-p,3)));
    if(p<1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function checkAchievements(){
  const checkins = USER.checkins || [];
  const litVenues = new Set(checkins.map(c=>c.venueId));
  const litProvSet = new Set(VENUES.filter(v=>litVenues.has(v.id)).map(v=>v.provinceShort));
  const artistCount = {};
  checkins.forEach(c=>artistCount[c.artistId]=(artistCount[c.artistId]||0)+1);
  const maxArtist = Math.max(0,...Object.values(artistCount));
  let skinHistory = [];
  try{ skinHistory = JSON.parse(localStorage.getItem('skinHistory')||'[]'); }catch(e){}
  const biasType = (USER.bias && USER.bias.type) || 1;
  return [
    {name:'初出茅庐', desc:'首次打卡', icon:'★', got:checkins.length>=1},
    {name:'集邮达人', desc:'点亮5座场馆', icon:'◉', got:litVenues.size>=5},
    {name:'半壁江山', desc:'点亮15座场馆', icon:'◈', got:litVenues.size>=15},
    {name:'全国巡礼', desc:'点亮10个不同省份', icon:'◇', got:litProvSet.size>=10},
    {name:'鸟巢打卡', desc:'在鸟巢打卡过', icon:'⬢', got:checkins.some(c=>c.venueId==='bj-niaocao')},
    {name:'连场追逐', desc:'同一歌手看3场以上', icon:'♪', got:maxArtist>=3},
    {name:'多担玩家', desc:'设置双担或三担', icon:'❉', got:biasType>=2},
    {name:'变色龙', desc:'切换过3种以上皮肤', icon:'◐', got:skinHistory.length>=3}
  ];
}
function renderAchievements(){
  const grid = document.getElementById('achGrid');
  if(!grid) return;
  const achs = checkAchievements();
  const got = achs.filter(a=>a.got).length;
  grid.innerHTML = achs.map(a=>`
    <div class="ach-badge ${a.got?'got':'locked'}">
      <div class="ach-icon">${a.icon}</div>
      <div class="ach-name">${a.name}</div>
      <div class="ach-desc">${a.desc}</div>
      <div class="ach-state">${a.got?'已解锁':'未解锁'}</div>
    </div>`).join('');
  const count = document.querySelector('.ach-count');
  if(count) count.textContent = `${got} / ${achs.length} 已解锁`;
}

/* ===== 粉丝身份卡（头部动态 + 分享弹层，Task 10 保留）===== */
function renderIdCard(){
  const avatar = document.getElementById('idAvatar');
  const nameEl = document.getElementById('idName');
  const sinceEl = document.getElementById('idSince');
  if(!avatar && !nameEl && !sinceEl) return;
  const list = (USER.bias && USER.bias.list) || ['jay'];
  const a = ARTISTS.find(x=>x.id===list[0]) || ARTISTS[0];
  const since = USER.since || new Date().getFullYear().toString();
  const years = Math.max(0, new Date().getFullYear() - (+since));
  if(avatar){
    avatar.textContent = a ? a.initial : '粉';
    if(a){
      avatar.style.background = `linear-gradient(135deg, ${a.color}, ${a.color2})`;
      avatar.style.boxShadow = `0 8px 20px -8px ${a.color}`;
    }
  }
  if(nameEl && a) nameEl.textContent = a.name;
  if(sinceEl) sinceEl.textContent = `SINCE ${since} · 粉龄 ${years} 年`;
}
function openIdentityCard(){
  const modal = document.getElementById('idCardModal');
  if(!modal) return;
  renderIdentityCard();
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
}
function closeIdentityCard(){
  const modal = document.getElementById('idCardModal');
  if(!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
}
function renderIdentityCard(){
  const body = document.getElementById('idCardBody');
  if(!body) return;
  const checkins = USER.checkins || [];
  const litVenuesSet = new Set(checkins.map(c=>c.venueId));
  const litProvSet = new Set(VENUES.filter(v=>litVenuesSet.has(v.id)).map(v=>v.provinceShort));
  const {cur} = getFanLevel(checkins.length);
  const achs = checkAchievements();
  const gotAch = achs.filter(a=>a.got).length;
  const since = USER.since || new Date().getFullYear().toString();
  const years = Math.max(0, new Date().getFullYear() - (+since));
  const nickname = USER.nickname || '追光者';
  const danType = (USER.bias && USER.bias.type) || 1;
  const biases = ((USER.bias && USER.bias.list) || ['jay']).slice(0,danType)
    .map(id=>{ const a=ARTISTS.find(x=>x.id===id); return a?a.name:id; })
    .join(' / ') || '-';
  const skinA = ARTISTS.find(a=>a.id===USER.skin);
  const skinName = skinNames[USER.skin] || (skinA?skinA.name:'默认');
  const cntMap = {};
  checkins.forEach(c=>cntMap[c.artistId]=(cntMap[c.artistId]||0)+1);
  const topEntry = Object.entries(cntMap).sort((a,b)=>b[1]-a[1])[0];
  const topArtist = topEntry ? ARTISTS.find(a=>a.id===topEntry[0]) : null;
  const topN = topEntry ? topEntry[1] : 0;
  body.innerHTML = `
    <div class="idc-top">
      <div class="idc-avatar">${(nickname||'粉').slice(0,1)}</div>
      <div class="idc-id">
        <div class="idc-nick">${nickname}</div>
        <div class="idc-since">SINCE ${since} · 粉龄 ${years} 年</div>
      </div>
      <div class="idc-lv">Lv.${cur.lv}</div>
    </div>
    <div class="idc-tier">${cur.name}</div>
    <div class="idc-stats">
      <div><span class="idc-num">${checkins.length}</span><span class="idc-lab">观演</span></div>
      <div><span class="idc-num">${litVenuesSet.size}</span><span class="idc-lab">场馆</span></div>
      <div><span class="idc-num">${litProvSet.size}</span><span class="idc-lab">省份</span></div>
      <div><span class="idc-num">${STATS.totalCollections||0}</span><span class="idc-lab">收藏</span></div>
      <div><span class="idc-num">${gotAch}/${achs.length}</span><span class="idc-lab">成就</span></div>
    </div>
    <div class="idc-row"><span>本命</span><strong>${biases}</strong></div>
    ${topArtist?`<div class="idc-row"><span>最常看</span><strong>${topArtist.name} · ${topN} 场</strong></div>`:''}
    <div class="idc-row"><span>主题</span><strong>${skinName}</strong></div>
    <div class="idc-foot">余响 Encore · 演唱会足迹追踪</div>`;
}
function copyIdentityText(){
  const checkins = USER.checkins || [];
  const litVenues = new Set(checkins.map(c=>c.venueId)).size;
  const {cur} = getFanLevel(checkins.length);
  const achs = checkAchievements();
  const gotAch = achs.filter(a=>a.got).length;
  const since = USER.since || new Date().getFullYear().toString();
  const years = Math.max(0, new Date().getFullYear() - (+since));
  const danType = (USER.bias && USER.bias.type) || 1;
  const biases = ((USER.bias && USER.bias.list) || ['jay']).slice(0,danType)
    .map(id=>{ const a=ARTISTS.find(x=>x.id===id); return a?a.name:id; })
    .join('/') || '-';
  const text = `【余响 Encore · 粉丝身份卡】
${USER.nickname||'追光者'} · SINCE ${since} · 粉龄 ${years} 年
等级：Lv.${cur.lv} ${cur.name}
本命：${biases}
观演 ${checkins.length} 场 · 点亮 ${litVenues} 场馆 · 收藏 ${STATS.totalCollections||0} 件
成就 ${gotAch}/${achs.length} 已解锁`;
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(()=>toast('身份卡文案已复制', 'success')).catch(()=>fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}
function fallbackCopy(text){
  try{
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position='fixed'; ta.style.opacity='0';
    document.body.appendChild(ta); ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    toast('身份卡文案已复制', 'success');
  }catch(e){ toast('复制失败，请手动选择文本', 'error'); }
}

/* ============================================================
   §14  滚动揭示 & 移动端导航
   ============================================================ */

function observeReveal(){
  const io = new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('in');
      // fanStats 数字滚动：仅当内容已渲染时触发，避免延迟渲染导致漏动画
      if(e.target.id==='fanStats' && !e.target.dataset.animated){
        const nums = e.target.querySelectorAll('.fs-value:not(.text)');
        if(nums.length){
          e.target.dataset.animated = '1';
          nums.forEach(animateNum);
        }
      }
    }
  }),{threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
}

function initNavToggle(){
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if(!toggle || !links) return;
  toggle.addEventListener('click',()=>{
    toggle.classList.toggle('open');
    links.classList.toggle('open');
  });
  // 点击导航链接后自动收起
  links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
    toggle.classList.remove('open');
    links.classList.remove('open');
  }));
}

/* ============================================================
   §15  事件委托（统一 document click 处理）
   ============================================================ */

// 合并原有多处 document click 监听：收藏分类切换 + 本命切换/添加/移除
document.addEventListener('click', e=>{
  const target = e.target;
  // 收藏展览分类切换（gtab）
  const gtab = target.closest('.gtab');
  if(gtab){
    document.querySelectorAll('.gtab').forEach(b=>b.classList.remove('active'));
    gtab.classList.add('active');
    curType = gtab.dataset.type;
    renderShelf();
    return;
  }
  // 单担/双担/三担切换
  const danBtn = target.closest('#danToggle button');
  if(danBtn){
    curDan = +danBtn.dataset.dan;
    if(!USER.bias) USER.bias = {type:curDan, list:['jay']};
    USER.bias.type = curDan;
    saveLocalBias();
    renderBias();
    renderIdCard();
    fetch(API_BASE+'/api/user/bias',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:curDan,list:USER.bias.list})}).catch(()=>{});
    return;
  }
  // 添加本命
  const addBtn = target.closest('.bias-add-chip');
  if(addBtn){
    const id = addBtn.dataset.add;
    if(id && USER.bias && !USER.bias.list.includes(id) && USER.bias.list.length < curDan){
      USER.bias.list.push(id);
      saveLocalBias();
      fetch(API_BASE+'/api/user/bias',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(USER.bias)}).catch(()=>{});
      const a = ARTISTS.find(x=>x.id===id);
      toast(`已添加「${a?a.name:id}」为本命`, 'success');
      renderBias();
      renderIdCard();
    }
    return;
  }
  // 移除本命
  const removeBtn = target.closest('.bias-remove');
  if(removeBtn){
    const id = removeBtn.dataset.remove;
    if(id && USER.bias && USER.bias.list.length > 1){
      USER.bias.list = USER.bias.list.filter(x=>x!==id);
      saveLocalBias();
      fetch(API_BASE+'/api/user/bias',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(USER.bias)}).catch(()=>{});
      const a = ARTISTS.find(x=>x.id===id);
      toast(`已移除「${a?a.name:id}」`, 'info');
      renderBias();
      renderIdCard();
    }
    return;
  }
});

// Esc 关闭身份卡弹层
document.addEventListener('keydown', e=>{
  if(e.key==='Escape'){
    const m = document.getElementById('idCardModal');
    if(m && m.classList.contains('open')) closeIdentityCard();
  }
});

/* ============================================================
   §16  初始化（首屏关键路径优先，非关键延迟渲染）
   ============================================================ */

async function init(){
  initTheme();
  injectInteractionStyles();
  showHeroSkeleton();
  try{
    await loadData();
  }catch(e){
    console.error('数据加载失败',e);
    toast('数据加载失败，请确认数据文件可访问', 'error');
    return;
  }
  // 本地持久化数据合并
  loadLocalCheckins();
  loadLocalCollections();
  loadLocalBias();
  loadLocalMeetDates();
  loadLocalExpenses();
  curProv = VENUES[0] ? VENUES[0].provinceShort : null;
  curDan = USER.bias ? USER.bias.type : 1;

  // —— 首屏关键路径（同步渲染：header / hero / 当前页主体）——
  if(document.getElementById('heroStats')) renderHeroStats();
  if(document.getElementById('heroTicket')) renderHeroTicket();
  if(document.getElementById('provList')){ renderProvinces(); renderVenues(); }
  if(document.getElementById('artistFilter')){ renderArtistFilter(); renderTours(); }
  if(document.getElementById('shelf')) renderShelf();
  if(document.getElementById('biasList')) renderBias();
  if(document.getElementById('idAvatar')) renderIdCard();
  if(document.getElementById('skinRow')) renderSkinRow();
  if(document.getElementById('fanStats')) renderFanStats();
  applySkin(USER.skin || 'jay');
  observeReveal();
  initNavToggle();

  // —— 非关键模块延迟渲染（首屏可视区域之外，避免动画依赖问题）——
  deferRender(()=>{
    if(document.getElementById('fanLevel')) renderFanLevel();
    if(document.getElementById('achGrid')) renderAchievements();
  });
}

/* ===== 全局导出（供 HTML 内联调用）===== */
window.venueSVG = venueSVG;
window.toggleTheme = toggleTheme;
window.toggleAlbum = toggleAlbum;
window.addCollection = addCollection;
window.openIdentityCard = openIdentityCard;
window.closeIdentityCard = closeIdentityCard;
window.copyIdentityText = copyIdentityText;

init();
