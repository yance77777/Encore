/* 余响 Encore v0.9.0 · 场馆卡片网格（点亮 / 熄灭 + 按本命 tooltip） */
import { useMemo, useRef, useState } from 'react';
import { useStore, getProvinces, toggleCheckin } from '../store.jsx';
import { venueSVG } from '../utils.js';
import Reveal from '../Reveal.jsx';

export default function VenueGrid() {
  const s = useStore();
  const gridRef = useRef(null);
  const tipRaf = useRef(0);
  const gridRect = useRef(null);
  const currentCard = useRef(null);
  const [animatingId, setAnimatingId] = useState(null);
  const [broken, setBroken] = useState(new Set());
  const [tip, setTip] = useState({ show: false, x: 0, y: 0, html: '' });

  const provs = useMemo(() => getProvinces(s), [s.venues, s.user.checkins]);
  const current = provs.find((x) => x.short === s.curProv) || provs[0] || null;
  const venues = current ? current.venues : [];
  const litIds = useMemo(() => new Set((s.user.checkins || []).map((c) => c.venueId)), [s.user.checkins]);

  function isLit(id) { return litIds.has(id); }
  function cardClass(id) {
    return [
      'venue-card',
      isLit(id) ? 'lit' : '',
      animatingId === id && isLit(id) ? 'lighting' : '',
      animatingId === id && !isLit(id) ? 'unlighting' : ''
    ].filter(Boolean).join(' ');
  }
  function imgFor(v) {
    if (broken.has(v.id)) return '';
    return isLit(v.id) ? v.img : (v.imgUnlit || v.img);
  }
  function svgFor(v) {
    return venueSVG[v.art] || venueSVG.dome;
  }
  function onImgError(v) {
    setBroken((prev) => new Set(prev).add(v.id));
  }
  function artistOf(id) {
    const c = (s.user.checkins || []).find((x) => x.venueId === id);
    return c ? s.artists.find((a) => a.id === c.artistId) || null : null;
  }
  function checkinOf(id) {
    return (s.user.checkins || []).find((x) => x.venueId === id);
  }
  function toggle(id) {
    const venue = s.venues.find((v) => v.id === id);
    if (!venue) return;
    const result = toggleCheckin(id);
    if (!result) return;
    setAnimatingId(id);
    setTimeout(() => setAnimatingId(null), result === 'lit' ? 500 : 400);
  }
  function tooltipHtml(venueId) {
    const v = s.venues.find((x) => x.id === venueId);
    if (!v) return '';
    const biasList = (s.user.bias && Array.isArray(s.user.bias.list) && s.user.bias.list.length)
      ? s.user.bias.list : [];
    let header = `<strong>${v.name}${v.alias ? ' · ' + v.alias : ''}</strong>`;
    if (biasList.length === 0) {
      const all = s.concerts.filter((c) => c.venueId === venueId);
      if (all.length === 0) return header + `<span>暂无演唱会记录</span>`;
      const byArtist = {};
      all.forEach((c) => {
        if (!byArtist[c.artistId]) byArtist[c.artistId] = [];
        byArtist[c.artistId].push(c);
      });
      const lines = Object.keys(byArtist).map((aid) => {
        const a = s.artists.find((x) => x.id === aid);
        const recs = byArtist[aid].sort((x, y) => x.date.localeCompare(y.date))
          .map((c) => `${c.date.slice(0, 4)} ${c.tour}`).join(' / ');
        return `<span>${a ? a.name : aid} ${recs}</span>`;
      });
      return header + lines.join('');
    }
    const lines = biasList.map((aid) => {
      const a = s.artists.find((x) => x.id === aid);
      const recs = s.concerts.filter((c) => c.venueId === venueId && c.artistId === aid)
        .sort((x, y) => x.date.localeCompare(y.date));
      if (recs.length === 0) return `<span>该场馆暂无 ${a ? a.name : aid} 演唱会记录</span>`;
      const recap = recs.map((c) => `${c.date.slice(0, 4)} ${c.tour}`).join(' / ');
      return `<span>${a ? a.name : aid} ${recap}</span>`;
    });
    return header + lines.join('');
  }
  function onOver(e) {
    const card = e.target.closest('.venue-card');
    if (card === currentCard.current) return;
    currentCard.current = card;
    if (card) {
      setTip({ show: true, x: 0, y: 0, html: tooltipHtml(card.dataset.id) });
      gridRect.current = gridRef.current ? gridRef.current.getBoundingClientRect() : null;
    }
  }
  function onOut(e) {
    const related = e.relatedTarget;
    if (!related || !gridRef.current || !gridRef.current.contains(related)) {
      setTip((t) => ({ ...t, show: false }));
      if (tipRaf.current) { cancelAnimationFrame(tipRaf.current); tipRaf.current = 0; }
      currentCard.current = null;
    }
  }
  function onMove(e) {
    if (tipRaf.current) return;
    const cx = e.clientX;
    const cy = e.clientY;
    tipRaf.current = requestAnimationFrame(() => {
      tipRaf.current = 0;
      const r = gridRect.current;
      if (!r) return;
      setTip((t) => ({ ...t, x: cx - r.left + 14, y: cy - r.top + 14 }));
    });
  }

  return (
    <Reveal className="map-canvas">
      <div className="map-prov-title">
        <h3>{current ? current.province : '加载中'}</h3>
        <span className="lit-badge">{current ? current.lit : 0} / {current ? current.total : 0} 已点亮</span>
      </div>
      <div className="map-prov-sub">{current ? current.region + ' · ' + (current.lit === current.total && current.total > 0 ? '已集齐' : '巡演城市') : ''}</div>
      <div className="venue-grid" ref={gridRef} onMouseOver={onOver} onMouseOut={onOut} onMouseMove={onMove}>
        {venues.map((v) => (
          <div
            key={v.id}
            className={cardClass(v.id)}
            data-id={v.id}
            role="button"
            tabIndex={0}
            onClick={() => toggle(v.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(v.id); }
            }}
          >
            {!isLit(v.id) ? <div className="toggle-hint">点击点亮</div> : null}
            <div className="venue-art">
              {imgFor(v) ? (
                <img src={imgFor(v)} alt={v.name} className={isLit(v.id) ? 'lit' : 'unlit'} onError={() => onImgError(v)} />
              ) : (
                <div dangerouslySetInnerHTML={{ __html: svgFor(v) }}></div>
              )}
            </div>
            <div className="venue-name">{v.name}</div>
            <div className="venue-alias">{v.alias}</div>
            <div className="venue-meta">{v.city} · {v.type}{v.capacity ? ' · ' + (v.capacity >= 10000 ? Math.floor(v.capacity / 10000) + '万' : v.capacity) + '座' : ''}</div>
            {isLit(v.id) && artistOf(v.id) ? <div className="lit-info">{artistOf(v.id).name} · {checkinOf(v.id).date}</div> : null}
          </div>
        ))}
        <div
          className={'cmp-tip venue-tip' + (tip.show ? ' show' : '')}
          style={{ transform: `translate3d(${tip.x}px, ${tip.y}px, 0)` }}
          dangerouslySetInnerHTML={{ __html: tip.html }}
        ></div>
      </div>
    </Reveal>
  );
}
