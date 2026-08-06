/* 余响 Encore v0.9.0 · 足迹进度条 */
import { useStore } from '../store.jsx';
import Reveal from '../Reveal.jsx';

export default function MapProgress() {
  const s = useStore();
  const litVenues = new Set((s.user.checkins || []).map((c) => c.venueId)).size;
  const totalVenues = s.venues.length;
  const litSet = new Set((s.user.checkins || []).map((c) => c.venueId));
  const litProvs = new Set(s.venues.filter((v) => litSet.has(v.id)).map((v) => v.provinceShort)).size;
  const totalProvs = new Set(s.venues.map((v) => v.provinceShort)).size;
  const venuePct = totalVenues ? Math.round((litVenues / totalVenues) * 100) : 0;
  const provPct = totalProvs ? Math.round((litProvs / totalProvs) * 100) : 0;

  return (
    <Reveal className="map-progress">
      <div className="mp-row">
        <span className="mp-label">场馆足迹</span>
        <div className="mp-bar"><div className="mp-fill" style={{ width: venuePct + '%' }}></div></div>
        <span className="mp-num">{litVenues} / {totalVenues}</span>
      </div>
      <div className="mp-row">
        <span className="mp-label">省份足迹</span>
        <div className="mp-bar"><div className="mp-fill" style={{ width: provPct + '%' }}></div></div>
        <span className="mp-num">{litProvs} / {totalProvs}</span>
      </div>
    </Reveal>
  );
}
