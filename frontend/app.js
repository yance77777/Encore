/* 余响 Encore · 前端逻辑 v0.3.1
 * 多页面版本：按页面元素按需渲染
 * 数据源：后端 API（优先）→ 静态 JSON 文件（GitHub Pages 回退，只读）
 */

// 后端地址：本地开发留空；GitHub Pages 部署时填 HF Space URL
// 例如：const API_BASE = 'https://andreas777-fresheye.hf.space';
const API_BASE = '';

let VENUES = [], ARTISTS = [], CONCERTS = [], USER = {}, STATS = {};
let curProv = null, curType = 'album', curArtistFilter = 'all', curDan = 1;

// Q版场馆SVG（无生成图的场馆用此占位，保持统一萌系画风）
const venueSVG = {
  nest:'<svg viewBox="0 0 100 100"><g fill="none" stroke="#ff3d8b" stroke-width="2.5" stroke-linecap="round"><path d="M20 35 Q50 20 80 35"/><path d="M18 50 Q50 32 82 50"/><path d="M20 65 Q50 50 80 65"/><ellipse cx="50" cy="78" rx="30" ry="6"/></g><circle cx="50" cy="55" r="3" fill="#f5c45e"/></svg>',
  arena:'<svg viewBox="0 0 100 100"><g fill="none" stroke="#7c5cff" stroke-width="2.5" stroke-linecap="round"><rect x="20" y="35" width="60" height="40" rx="4"/><path d="M20 45 Q50 28 80 45"/><line x1="35" y1="55" x2="65" y2="55"/></g><circle cx="50" cy="30" r="3" fill="#f5c45e"/></svg>',
  dome:'<svg viewBox="0 0 100 100"><g fill="none" stroke="#3ee8d0" stroke-width="2.5" stroke-linecap="round"><path d="M22 60 Q22 30 50 30 Q78 30 78 60"/><line x1="22" y1="60" x2="78" y2="60"/><path d="M35 45 L50 35 L65 45"/></g><circle cx="50" cy="40" r="2.5" fill="#f5c45e"/></svg>',
  bowl:'<svg viewBox="0 0 100 100"><g fill="none" stroke="#ff3d8b" stroke-width="2.5" stroke-linecap="round"><path d="M18 55 Q50 75 82 55"/><path d="M18 55 Q50 35 82 55"/><ellipse cx="50" cy="45" rx="22" ry="5"/></g></svg>',
  lotus:'<svg viewBox="0 0 100 100"><g fill="none" stroke="#f5c45e" stroke-width="2.5" stroke-linecap="round"><path d="M50 35 Q35 50 50 65 Q65 50 50 35Z"/><path d="M50 35 Q30 45 40 60 Q50 50 50 35Z"/><path d="M50 35 Q70 45 60 60 Q50 50 50 35Z"/></g><circle cx="50" cy="48" r="3" fill="#ff3d8b"/></svg>'
};

// 专辑/周边占位SVG
function collSVG(artist){
  const a = ARTISTS.find(x=>x.id===artist.artistId) || {color:'#5b2c8b',initial:'?'};
  return `<svg viewBox="0 0 100 100"><rect x="20" y="20" width="60" height="60" rx="6" fill="${a.color}"/><text x="50" y="58" text-anchor="middle" font-family="serif" font-weight="900" font-size="22" fill="#f5c45e">${a.initial}</text></svg>`;
}

/* ===== 中国省份 SVG path 数据（34 个省级行政区，简化版，按真实地理位置排布）
 * 省份简称 short 与 venues.json 的 provinceShort 字段一一对应 */
/* CHINA_PROVINCES 由 data/china-map.js 提供（真实国土形状） */

/* ===== 数据加载（API 优先，静态 JSON 回退）===== */
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

async function loadData(){
  [VENUES, ARTISTS, CONCERTS] = await Promise.all([
    fetchJSON('/api/venues', 'data/venues.json'),
    fetchJSON('/api/artists', 'data/artists.json'),
    fetchJSON('/api/concerts', 'data/concerts.json')
  ]);
  // 用户数据：API 返回单用户对象；静态文件为 {demo:{...}}
  try {
    const u = await fetchJSON('/api/user', 'data/users.json');
    USER = u.demo ? u.demo : u;
  } catch(e) { USER = {}; }
  // 统计：API 优先，失败则本地计算
  try {
    const r = await fetch(API_BASE + '/api/stats');
    if(!r.ok) throw 0;
    STATS = await r.json();
  } catch(e) {
    STATS = computeStats();
  }
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

/* ===== 初始化（按页面元素按需渲染）===== */
async function init(){
  try{
    await loadData();
  }catch(e){
    console.error('数据加载失败',e);
    toast('数据加载失败，请确认数据文件可访问');
    return;
  }
  curProv = VENUES[0] ? VENUES[0].provinceShort : null;
  curDan = USER.bias ? USER.bias.type : 1;
  if(document.getElementById('heroStats')) renderHeroStats();
  if(document.getElementById('heroTicket')) renderHeroTicket();
  if(document.getElementById('provList')){ renderProvinces(); renderVenues(); }
  if(document.getElementById('artistFilter')){ renderArtistFilter(); renderTours(); }
  if(document.getElementById('shelf')) renderShelf();
  if(document.getElementById('biasList')) renderBias();
  if(document.getElementById('skinRow')) renderSkinRow();
  if(document.getElementById('fanLevel')) renderFanLevel();
  if(document.getElementById('fanStats')) renderFanStats();
  if(document.getElementById('achGrid')) renderAchievements();
  applySkin(USER.skin || 'jay');
  observeReveal();
  initNavToggle();
}

/* ===== Hero 统计 ===== */
function renderHeroStats(){
  document.getElementById('heroStats').innerHTML = `
    <div class="stat"><div class="num">${STATS.litVenues}<span class="unit">座</span></div><div class="label">已点亮场馆</div></div>
    <div class="stat"><div class="num">${STATS.litProvinces}<span class="unit">省</span></div><div class="label">解锁省份</div></div>
    <div class="stat"><div class="num">${STATS.totalCollections}<span class="unit">件</span></div><div class="label">收藏总数</div></div>
    <div class="stat"><div class="num">${STATS.totalConcerts}<span class="unit">场</span></div><div class="label">巡演档案</div></div>`;
}

/* ===== Hero 票卡（动态渲染最近一次打卡）===== */
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

/* ===== 省份列表 ===== */
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
    renderProvinces(); renderVenues();
  });
  if(document.getElementById('chinaMap')) renderChinaMap();
}

/* ===== 场馆卡片 ===== */
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
      <div class="venue-art">${art}</div>
      <div class="venue-name">${v.name}</div>
      <div class="venue-alias">${v.alias}</div>
      <div class="venue-meta">${v.city} · ${v.type} · ${v.capacity>=10000?Math.floor(v.capacity/10000)+'万':v.capacity}座</div>
      ${isLit&&artist?`<div class="lit-info">${artist.name} · ${checkin.date}</div>`:''}
    </div>`;
  }).join('');
  g.querySelectorAll('.venue-card').forEach(c=>c.onclick=()=>toggleCheckin(c.dataset.id));
}

/* ===== 中国省份点亮地图 ===== */
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
        renderProvinces(); renderVenues();
      });
    }
  });
}

async function toggleCheckin(venueId){
  const lit = getLitVenueIds();
  if(lit.has(venueId)){
    toast('该场馆已点亮');
    return;
  }
  const venue = VENUES.find(v=>v.id===venueId);
  const concerts = CONCERTS.filter(c=>c.venueId===venueId);
  const artistId = concerts.length ? concerts[0].artistId : (USER.bias.list[0]||'jay');
  const date = concerts.length ? concerts[0].date : new Date().toISOString().slice(0,10);
  const note = concerts.length ? concerts[0].tour : '';
  try{
    const r = await fetch(API_BASE+'/api/user/checkin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({venueId,artistId,date,note})});
    const d = await r.json();
    if(!r.ok){ toast(d.error||'点亮失败'); return; }
    USER = d.user;
    STATS.litVenues = new Set(USER.checkins.map(c=>c.venueId)).size;
    const provs = getProvinces();
    STATS.litProvinces = provs.filter(x=>x.lit>0).length;
    if(document.getElementById('heroStats')) renderHeroStats();
    if(document.getElementById('heroTicket')) renderHeroTicket();
    renderProvinces(); renderVenues();
    toast(`已点亮「${venue.name}」`);
  }catch(e){ toast('在线写入需后端支持，本地预览仅只读'); }
}

/* ===== 巡演档案 ===== */
function renderArtistFilter(){
  const el = document.getElementById('artistFilter');
  el.innerHTML = `<button class="af-chip ${curArtistFilter==='all'?'active':''}" data-id="all">全部</button>` +
    ARTISTS.map(a=>`<button class="af-chip ${curArtistFilter===a.id?'active':''}" data-id="${a.id}">${a.name}</button>`).join('');
  el.querySelectorAll('.af-chip').forEach(b=>b.onclick=()=>{
    curArtistFilter = b.dataset.id;
    renderArtistFilter(); renderTours();
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
      <td class="date-cell">${c.date}</td>
      <td>${c.note||''}</td>
    </tr>`;
  }).join('');
}

/* ===== 收藏展览 ===== */
function renderShelf(){
  const s = document.getElementById('shelf');
  const items = (USER.collections && USER.collections[curType]) || [];
  s.innerHTML = items.map(it=>{
    const a = ARTISTS.find(x=>x.id===it.artistId);
    return `<div class="item">
      <div class="item-cover">${collSVG({...it})}</div>
      <div class="item-info"><div class="item-title">${it.name}</div><div class="item-sub">${a?a.name:''} · ${it.year||''}</div></div>
    </div>`;
  }).join('') + `<div class="item item-add" onclick="addCollection()"><div class="item-cover"><div class="plus">+</div></div><div class="item-info"><div class="item-title">添加</div><div class="item-sub">拍下你的收藏</div></div></div>`;
}
document.addEventListener('click',e=>{
  if(e.target.classList.contains('gtab')){
    document.querySelectorAll('.gtab').forEach(b=>b.classList.remove('active'));
    e.target.classList.add('active');
    curType = e.target.dataset.type;
    renderShelf();
  }
});
function addCollection(){ toast('上传功能开发中，敬请期待'); }

/* ===== 粉丝身份 ===== */
function renderBias(){
  const el = document.getElementById('biasList');
  document.querySelectorAll('#danToggle button').forEach(b=>b.classList.toggle('active',+b.dataset.dan===curDan));
  const list = (USER.bias && USER.bias.list) || ['jay'];
  const show = list.slice(0,curDan);
  el.innerHTML = show.map((id,i)=>{
    const a = ARTISTS.find(x=>x.id===id) || ARTISTS[0];
    const cnt = (USER.checkins||[]).filter(c=>c.artistId===id).length;
    const pct = show.length===1?100:Math.round(100*(show.length-i)/ (show.length*(show.length+1)/2));
    return `<div class="bias-row">
      <div class="bias-pic" style="background:${a.color}33;color:${a.color2};border:1px solid ${a.color}">${a.initial}</div>
      <div class="bias-info">
        <div class="bias-name">${a.name}</div>
        <div class="bias-stat">看 ${cnt} 场 · 出道 ${a.debut}</div>
        <div class="bias-bar"><div class="bias-bar-fill" style="width:${pct}%"></div></div>
      </div>
    </div>`;
  }).join('');
  if(show.length<curDan){
    const rest = ARTISTS.filter(a=>!show.includes(a.id)).slice(0,curDan-show.length);
    rest.forEach(a=>{
      el.insertAdjacentHTML('beforeend',`<div class="bias-row" style="opacity:.5">
        <div class="bias-pic" style="background:${a.color}33;color:${a.color2};border:1px solid ${a.color}">${a.initial}</div>
        <div class="bias-info"><div class="bias-name">${a.name}</div><div class="bias-stat">未关注 · 点击添加</div></div>
      </div>`);
    });
  }
}
document.addEventListener('click',e=>{
  if(e.target.closest('#danToggle')&&e.target.tagName==='BUTTON'){
    curDan = +e.target.dataset.dan;
    renderBias();
    const list = (USER.bias&&USER.bias.list)||['jay'];
    fetch(API_BASE+'/api/user/bias',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:curDan,list:list.slice(0,curDan)})}).catch(()=>{});
  }
});

/* ===== 皮肤 ===== */
const skinNames = {jay:'周杰伦 · 魔幻紫',jj:'林俊杰 · 深海蓝',mayday:'五月天 · 玫瑰红',zhangjie:'张杰 · 森林绿',
  joker:'薛之谦 · 暗夜紫',silence:'汪苏泷 · 晴空蓝',zhoushen:'周深 · 星河紫',gem:'邓紫棋 · 玫粉红',
  leehom:'王力宏 · 深蓝海',davidtao:'陶喆 · 暖橙调',vae:'许嵩 · 茶汤绿',lironghao:'李荣浩 · 暗紫调',nic:'谢霆锋 · 烈焰红'};
function renderSkinRow(){
  const el = document.getElementById('skinRow');
  el.innerHTML = ARTISTS.map(a=>`<div class="skin-chip ${a.id===(USER.skin||'jay')?'active':''}" data-id="${a.id}" style="background:linear-gradient(160deg,${a.color},${a.color}55)">${a.en.slice(0,6)}</div>`).join('');
  el.querySelectorAll('.skin-chip').forEach(c=>c.onclick=()=>applySkin(c.dataset.id));
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
    toast(`已切换至「${a.name}」主题`);
  }
}

/* ===== 粉丝等级 ===== */
const FAN_LEVELS = [
  {min:0,name:'路人粉',lv:0},
  {min:1,name:'新手粉丝',lv:1},
  {min:4,name:'进阶粉丝',lv:2},
  {min:9,name:'资深粉丝',lv:3},
  {min:16,name:'铁杆粉丝',lv:4},
  {min:26,name:'殿堂级粉丝',lv:5}
];
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

/* ===== 粉丝数据统计 ===== */
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

/* ===== 成就徽章 ===== */
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

/* ===== 皮肤切换记录（变色龙成就）===== */
function trackSkin(id){
  try{
    let hist = JSON.parse(localStorage.getItem('skinHistory')||'[]');
    if(!hist.includes(id)){ hist.push(id); localStorage.setItem('skinHistory',JSON.stringify(hist)); }
  }catch(e){}
}

/* ===== 移动端汉堡菜单 ===== */
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

/* ===== 工具 ===== */
let toastTimer;
function toast(msg){
  const t = document.getElementById('toast');
  if(!t) return;
  document.getElementById('toastText').textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>t.classList.remove('show'),2400);
}
function observeReveal(){
  const io = new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('in');
      if(e.target.id==='fanStats' && !e.target.dataset.animated){
        e.target.dataset.animated = '1';
        e.target.querySelectorAll('.fs-value:not(.text)').forEach(animateNum);
      }
    }
  }),{threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
}
window.venueSVG = venueSVG;
init();
