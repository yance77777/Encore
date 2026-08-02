/* 余响 Encore · 前端逻辑 v0.2.0
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
  if(document.getElementById('provList')){ renderProvinces(); renderVenues(); }
  if(document.getElementById('artistFilter')){ renderArtistFilter(); renderTours(); }
  if(document.getElementById('shelf')) renderShelf();
  if(document.getElementById('biasList')) renderBias();
  if(document.getElementById('skinRow')) renderSkinRow();
  applySkin(USER.skin || 'jay');
  observeReveal();
}

/* ===== Hero 统计 ===== */
function renderHeroStats(){
  document.getElementById('heroStats').innerHTML = `
    <div class="stat"><div class="num">${STATS.litVenues}<span class="unit">座</span></div><div class="label">已点亮场馆</div></div>
    <div class="stat"><div class="num">${STATS.litProvinces}<span class="unit">省</span></div><div class="label">解锁省份</div></div>
    <div class="stat"><div class="num">${STATS.totalCollections}<span class="unit">件</span></div><div class="label">收藏总数</div></div>
    <div class="stat"><div class="num">${STATS.totalConcerts}<span class="unit">场</span></div><div class="label">巡演档案</div></div>`;
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
    const art = v.img ? `<img src="${v.img}" alt="${v.name}" onerror="this.parentNode.innerHTML=venueSVG['${v.art}']||venueSVG.dome">` : (venueSVG[v.art]||venueSVG.dome);
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
  joker:'薛之谦 · 暗夜紫',silence:'汪苏泷 · 晴空蓝',zhoushen:'周深 · 星河紫',gem:'邓紫棋 · 玫粉红'};
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
    fetch(API_BASE+'/api/user/skin',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({skin:id})}).catch(()=>{});
    toast(`已切换至「${a.name}」主题`);
  }
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
  const io = new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')}),{threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
}
window.venueSVG = venueSVG;
init();
