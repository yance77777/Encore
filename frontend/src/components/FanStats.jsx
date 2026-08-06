/* 余响 Encore v2.0.0 · 粉丝数据统计（滚动数字动画） */
import { useEffect, useRef } from 'react';
import { useStore } from '../store.jsx';
import { sumExpenses, animateValue } from '../utils.js';

export default function FanStats() {
  const s = useStore();
  const rootRef = useRef(null);
  const animatedRef = useRef(false);

  const checkins = s.user.checkins || [];
  const litVenues = new Set(checkins.map((c) => c.venueId));
  const litProvSet = new Set(s.venues.filter((v) => litVenues.has(v.id)).map((v) => v.provinceShort));
  const artistCount = {};
  checkins.forEach((c) => { artistCount[c.artistId] = (artistCount[c.artistId] || 0) + 1; });
  const topEntry = Object.entries(artistCount).sort((a, b) => b[1] - a[1])[0];
  const topArtist = topEntry ? s.artists.find((a) => a.id === topEntry[0]) : null;
  const typeCount = {};
  checkins.forEach((c) => {
    const v = s.venues.find((x) => x.id === c.venueId);
    if (v) typeCount[v.type] = (typeCount[v.type] || 0) + 1;
  });
  const topType = Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0];
  const since = s.user.since ? Math.max(0, new Date().getFullYear() - (+s.user.since)) : 0;
  const totalV = (s.stats && s.stats.totalVenues) || s.venues.length || 31;
  const totalP = (s.stats && s.stats.totalProvinces) || 20;
  const meetCount = ((s.meetDates.lastMeet ? 1 : 0) + (s.meetDates.nextMeet ? 1 : 0));
  const cards = [
    { label: '总观演场次', value: checkins.length, suffix: '场', num: true },
    { label: '点亮场馆', value: litVenues.size, suffix: ' / ' + totalV, num: true },
    { label: '足迹省份', value: litProvSet.size, suffix: ' / ' + totalP, num: true },
    { label: '追星年资', value: since, suffix: '年', num: true },
    { label: '追星支出', value: Math.round(sumExpenses(s.expenses)), suffix: '元', num: true },
    { label: '见面记录', value: meetCount, suffix: '次', num: true },
    { label: '最常看歌手', value: topArtist ? topArtist.name : '-', num: false },
    { label: '最爱场馆类型', value: topType ? topType[0] : '-', num: false }
  ];

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    el.classList.add('reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          el.classList.add('in');
          if (!animatedRef.current && cards.length) {
            animatedRef.current = true;
            requestAnimationFrame(() => {
              el.querySelectorAll('.fs-value:not(.text)').forEach((n) => animateValue(n, n.dataset.target));
            });
          }
        }
      });
    }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, [cards.length]);

  return (
    <div className="fan-stats reveal" ref={rootRef}>
      {cards.map((c) => (
        <div key={c.label} className="fs-card">
          <div className={'fs-value' + (c.num ? '' : ' text')} data-target={c.num ? c.value : ''}>
            {c.num ? 0 : c.value}<span className="fs-suffix">{c.suffix || ''}</span>
          </div>
          <div className="fs-label">{c.label}</div>
        </div>
      ))}
    </div>
  );
}
