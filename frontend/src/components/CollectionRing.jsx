/* 余响 Encore v0.9.0 · 专辑收藏进度环 */
import { useStore } from '../store.jsx';
import Reveal from '../Reveal.jsx';

export default function CollectionRing() {
  const s = useStore();
  const collected = (s.user.collections && s.user.collections.album) ? s.user.collections.album.length : 0;
  const total = s.artists.reduce((acc, a) => acc + ((a.albums || []).length), 0);
  const pct = total ? Math.round((collected / total) * 100) : 0;
  const circ = 2 * Math.PI * 48;
  const offset = circ * (1 - pct / 100);

  return (
    <Reveal className="collection-ring">
      <svg viewBox="0 0 120 120" role="img" aria-label="专辑收藏进度">
        <defs>
          <linearGradient id="crGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f5c45e" />
            <stop offset="100%" stopColor="#7c5cff" />
          </linearGradient>
        </defs>
        <circle className="cr-bg" cx="60" cy="60" r="48"></circle>
        <circle className="cr-fg" cx="60" cy="60" r="48" strokeDasharray={circ} strokeDashoffset={offset}></circle>
        <text className="cr-num" x="60" y="58">{collected}</text>
        <text className="cr-lab" x="60" y="74">{pct}%</text>
      </svg>
      <div className="cr-meta">
        <span className="cr-label">专辑收藏进度</span>
        <span className="cr-total">共 {total} 张 · 已收藏 {collected} 张</span>
      </div>
    </Reveal>
  );
}
