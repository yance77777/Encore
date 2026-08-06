/* 余响 Encore v0.9.0 · 中国省份点亮地图（SVG + rAF 节流 tooltip） */
import { useMemo, useRef, useState } from 'react';
import { useStore, selectProvince } from '../store.jsx';
import { getChinaProvinces } from '../utils.js';
import Reveal from '../Reveal.jsx';

export default function ChinaMap() {
  const s = useStore();
  const stageRef = useRef(null);
  const tipRaf = useRef(0);
  const stageRect = useRef(null);
  const [tip, setTip] = useState({ show: false, x: 0, y: 0, html: '' });

  const provinceData = useMemo(() => {
    const map = {};
    s.venues.forEach((v) => {
      if (!map[v.provinceShort]) {
        map[v.provinceShort] = { province: v.province, short: v.provinceShort, region: v.region, total: 0, lit: 0 };
      }
      map[v.provinceShort].total++;
    });
    const lit = new Set((s.user.checkins || []).map((c) => c.venueId));
    s.venues.forEach((v) => { if (lit.has(v.id)) map[v.provinceShort].lit++; });
    return map;
  }, [s.venues, s.user.checkins]);

  const provinces = useMemo(
    () => getChinaProvinces().map((p) => ({ ...p, data: provinceData[p.short] || null })),
    [provinceData]
  );
  const litProvCount = Object.values(provinceData).filter((p) => p.lit > 0).length;
  const totalProvCount = Object.keys(provinceData).length;

  function updateTip(e) {
    const r = stageRect.current;
    if (!r) return;
    setTip((t) => ({ ...t, x: e.clientX - r.left + 14, y: e.clientY - r.top + 14 }));
  }
  function onEnter(p, e) {
    setTip({
      show: true,
      x: 0,
      y: 0,
      html: `<strong>${p.name}</strong><span>${p.data ? `${p.data.lit}/${p.data.total} 座场馆已点亮` : '暂无收录场馆'}</span>`
    });
    stageRect.current = stageRef.current ? stageRef.current.getBoundingClientRect() : null;
    updateTip(e);
  }
  function onMove(e) {
    if (tipRaf.current) return;
    tipRaf.current = requestAnimationFrame(() => {
      tipRaf.current = 0;
      updateTip(e);
    });
  }
  function onLeave() {
    setTip((t) => ({ ...t, show: false }));
    if (tipRaf.current) { cancelAnimationFrame(tipRaf.current); tipRaf.current = 0; }
  }
  function onClick(p) {
    if (p.data) selectProvince(p.short);
  }

  function provClass(p) {
    return [
      'cmp-prov',
      p.data && p.data.lit > 0 ? 'lit' : '',
      p.data ? 'has-venues' : 'no-venues',
      p.short === s.curProv ? 'sel' : ''
    ].filter(Boolean).join(' ');
  }

  return (
    <div id="chinaMap">
      <Reveal className="china-map-wrap">
        <div className="china-map-head">
          <div>
            <div className="tag">Footprint Map</div>
            <h3>足迹版图 <em>Light Up China</em></h3>
          </div>
          <span className="cmp-stats">{litProvCount} / {totalProvCount} 省份已点亮</span>
        </div>
        <div className="china-map-stage" ref={stageRef}>
          <svg className="china-svg" viewBox="0 0 800 620" preserveAspectRatio="xMidYMid meet" role="img" aria-label="中国省份点亮地图">
            <defs>
              <linearGradient id="cmpGoldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f5c45e" />
                <stop offset="100%" stopColor="#c8933a" />
              </linearGradient>
            </defs>
            {provinces.map((p) => (
              <path
                key={p.short}
                d={p.d}
                data-prov={p.short}
                className={provClass(p)}
                role="button"
                tabIndex={p.data ? 0 : -1}
                onMouseEnter={(e) => onEnter(p, e)}
                onMouseMove={onMove}
                onMouseLeave={onLeave}
                onClick={() => onClick(p)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(p); }
                }}
              >
                <title>{p.name}{p.data ? ' · ' + p.data.lit + '/' + p.data.total : ''}</title>
              </path>
            ))}
          </svg>
          <div
            className={'cmp-tip' + (tip.show ? ' show' : '')}
            style={{ transform: `translate3d(${tip.x}px, ${tip.y}px, 0)` }}
            dangerouslySetInnerHTML={{ __html: tip.html }}
          ></div>
        </div>
        <div className="china-map-legend">
          <span className="lg lg-off"><i></i>未点亮</span>
          <span className="lg lg-on"><i></i>已点亮</span>
          <span className="lg lg-na"><i></i>暂无场馆</span>
        </div>
      </Reveal>
    </div>
  );
}
