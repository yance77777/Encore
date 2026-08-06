/* 余响 Encore v2.0.0 · 首页 Hero 统计 */
import { useStore } from '../store.jsx';
import Reveal from '../Reveal.jsx';

export default function HeroStats() {
  const s = useStore();
  return (
    <Reveal className="hero-stats">
      {s.stats ? (
        <>
          <div className="stat"><div className="num">{s.stats.litVenues}<span className="unit">座</span></div><div className="label">已点亮场馆</div></div>
          <div className="stat"><div className="num">{s.stats.litProvinces}<span className="unit">省</span></div><div className="label">解锁省份</div></div>
          <div className="stat"><div className="num">{s.stats.totalCollections}<span className="unit">件</span></div><div className="label">收藏总数</div></div>
          <div className="stat"><div className="num">{s.stats.totalConcerts}<span className="unit">场</span></div><div className="label">巡演档案</div></div>
        </>
      ) : (
        <>
          {[0, 1, 2, 3].map((i) => (
            <div className="stat" key={i}>
              <div className="skeleton" style={{ height: 42, width: 74, borderRadius: 6 }}></div>
              <div className="skeleton skeleton-text sm" style={{ width: 56, marginTop: 8 }}></div>
            </div>
          ))}
        </>
      )}
    </Reveal>
  );
}
