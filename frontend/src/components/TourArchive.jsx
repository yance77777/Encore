/* 余响 Encore v0.9.0 · 巡演档案（歌手筛选 + 表格 + 统计摘要） */
import { useStore, setArtistFilter } from '../store.jsx';
import { formatTourRange } from '../utils.js';
import Reveal from '../Reveal.jsx';

export default function TourArchive() {
  const s = useStore();
  const activeId = s.artists.some((a) => a.id === s.curArtistId)
    ? s.curArtistId
    : (s.artists.length ? s.artists[0].id : 'all');
  const filtered = s.concerts
    .filter((c) => c.artistId === activeId)
    .sort((a, b) => b.date.localeCompare(a.date));
  const cityCount = new Set(filtered.map((c) => c.city)).size;
  const years = filtered.map((c) => +(c.startDate || c.date).slice(0, 4));
  const yearSpan = filtered.length
    ? (Math.min(...years) === Math.max(...years) ? `${Math.min(...years)}` : `${Math.min(...years)} - ${Math.max(...years)}`)
    : '-';

  function artistOf(c) {
    return s.artists.find((x) => x.id === c.artistId);
  }
  function venueOf(c) {
    return s.venues.find((x) => x.id === c.venueId);
  }

  return (
    <section id="tours">
      <div className="sec-head">
        <div>
          <div className="tag">02 / Tour Archive</div>
          <h2>巡演档案 <em>Archive</em></h2>
          <p>基于真实数据整理的演唱会场次记录，选择歌手查看其巡演足迹。</p>
        </div>
        <div className="artist-filter">
          {s.artists.map((a) => (
            <button
              key={a.id}
              className={'af-chip' + (a.id === activeId ? ' active' : '')}
              data-id={a.id}
              onClick={() => setArtistFilter(a.id)}
            >{a.name}</button>
          ))}
        </div>
      </div>

      {s.loaded ? (
        <Reveal className="tour-summary">
          <span className="ts-chip">共 {filtered.length} 场</span>
          <span className="ts-chip">覆盖 {cityCount} 座城市</span>
          <span className="ts-chip">跨度 {yearSpan}</span>
        </Reveal>
      ) : null}

      <Reveal className="tour-table-wrap">
        <table className="tour-table">
          <thead>
            <tr><th>歌手</th><th>巡演</th><th>城市</th><th>场馆</th><th>日期</th><th>备注</th></tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.artistId + '-' + c.venueId + '-' + (c.startDate || c.date)}>
                <td>
                  <span className="artist-tag">
                    <span className="artist-dot" style={{ background: artistOf(c) ? artistOf(c).color : '#888' }}></span>
                    {artistOf(c) ? artistOf(c).name : '-'}
                  </span>
                </td>
                <td>{c.tour}</td>
                <td>{c.city}</td>
                <td>{venueOf(c) ? venueOf(c).name : c.venueId}</td>
                <td className="date-cell">{formatTourRange(c.startDate || c.date, c.endDate)}</td>
                <td>{c.note || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>
    </section>
  );
}
