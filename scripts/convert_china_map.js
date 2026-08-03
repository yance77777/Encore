/* 将 datav 中国 GeoJSON 转换为内嵌 SVG path 数据（简化版）v2
 * 修复：闭合环 RDP 退化、MultiPolygon 多子多边形、海南南海诸岛过滤 */
const fs = require('fs');
const path = require('path');

const geo = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'china_geo_full.json'), 'utf8'));

// 投影参数：中国经纬度范围 → 800x620 画布
const LON_MIN = 73, LON_MAX = 136, LAT_MIN = 17, LAT_MAX = 54;
const W = 800, H = 620;
function proj(lon, lat){
  return [(lon - LON_MIN) / (LON_MAX - LON_MIN) * W, (LAT_MAX - lat) / (LAT_MAX - LAT_MIN) * H];
}

// RDP 简化算法（处理闭合环：先移除重复尾点）
function rdp(points, eps){
  if(points.length < 4) return points;
  let maxD = 0, idx = 0;
  const [sx, sy] = points[0], [ex, ey] = points[points.length - 1];
  const dx = ex - sx, dy = ey - sy;
  const len = Math.hypot(dx, dy) || 1;
  for(let i = 1; i < points.length - 1; i++){
    const [px, py] = points[i];
    const d = Math.abs(dx * (sy - py) - (sx - px) * dy) / len;
    if(d > maxD){ maxD = d; idx = i; }
  }
  if(maxD > eps){
    const left = rdp(points.slice(0, idx + 1), eps);
    const right = rdp(points.slice(idx), eps);
    return left.slice(0, -1).concat(right);
  }
  return [points[0], points[points.length - 1]];
}

// 多边形环简化：RDP 后强制至少 3 点，不足则均匀降采样保底
function simplifyRing(pts, eps){
  let s = rdp(pts, eps);
  if(s.length >= 3) return s;
  const n = Math.min(pts.length, 80);
  const step = pts.length / n;
  const out = [];
  for(let i = 0; i < n; i++) out.push(pts[Math.min(pts.length - 1, Math.round(i * step))]);
  return out;
}

const NAME_MAP = {
  '北京市':'北京','天津市':'天津','上海市':'上海','重庆市':'重庆',
  '河北省':'河北','山西省':'山西','辽宁省':'辽宁','吉林省':'吉林','黑龙江省':'黑龙江',
  '江苏省':'江苏','浙江省':'浙江','安徽省':'安徽','福建省':'福建','江西省':'江西','山东省':'山东',
  '河南省':'河南','湖北省':'湖北','湖南省':'湖南','广东省':'广东','海南省':'海南',
  '四川省':'四川','贵州省':'贵州','云南省':'云南','陕西省':'陕西','甘肃省':'甘肃','青海省':'青海',
  '台湾省':'台湾','内蒙古自治区':'内蒙古','广西壮族自治区':'广西','西藏自治区':'西藏',
  '宁夏回族自治区':'宁夏','新疆维吾尔自治区':'新疆',
  '香港特别行政区':'香港','澳门特别行政区':'澳门'
};

// 过滤南海诸岛：多边形最小纬度 < 16 时剔除
function ringMinLat(ring){
  let min = 90;
  ring.forEach(([lon, lat]) => { if(lat < min) min = lat; });
  return min;
}

function ringToPath(ring){
  if(ringMinLat(ring) < 16) return null; // 剔除南海诸岛
  let pts = ring.map(([lon, lat]) => proj(lon, lat));
  // 去重闭合点
  if(pts.length > 2){
    const f = pts[0], l = pts[pts.length - 1];
    if(Math.abs(f[0]-l[0]) < 1e-6 && Math.abs(f[1]-l[1]) < 1e-6) pts.pop();
  }
  if(pts.length < 3) return null;
  const simplified = simplifyRing(pts, 0.5);
  if(simplified.length < 3) return null;
  return 'M' + simplified.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' L') + ' Z';
}

function polygonToPath(coords){
  return ringToPath(coords[0]); // 只用外环，忽略孔洞
}

function multiToPath(coords){
  const parts = [];
  coords.forEach(poly => {
    const d = polygonToPath(poly);
    if(d) parts.push(d);
  });
  return parts.join(' ');
}

const out = [];
for(const f of geo.features){
  const fullName = f.properties.name;
  const short = NAME_MAP[fullName];
  if(!short) { console.log('SKIP (no map):', fullName); continue; }
  const geom = f.geometry;
  let d = '';
  if(geom.type === 'Polygon') d = polygonToPath(geom.coordinates);
  else if(geom.type === 'MultiPolygon') d = multiToPath(geom.coordinates);
  if(!d){ console.log('WARN empty path:', short); continue; }
  out.push({ short, name: fullName, d });
}

const js = `/* 中国省份地图数据（真实国土形状，datav.al 转换） */
const CHINA_PROVINCES = ${JSON.stringify(out)};
`;
fs.writeFileSync(path.join(__dirname, '..', 'frontend', 'data', 'china-map.js'), js);
console.log('Generated provinces:', out.length);
console.log('File size:', (js.length / 1024).toFixed(1) + 'KB');
const lens = out.map(p => p.short + ':' + p.d.length).join(' ');
console.log('Path lengths:', lens);
