/* 余响 Encore v2.0.0 · 本命管理（单担/双担/三担） */
import { useStore, setDan, addBias, removeBias } from '../store.jsx';
import Reveal from '../Reveal.jsx';

export default function BiasManager() {
  const s = useStore();
  const bias = s.user.bias || { type: s.curDan, list: [] };
  const show = bias.list.slice(0, bias.type).map((id) => {
    const a = s.artists.find((x) => x.id === id);
    return a ? { id, a } : null;
  }).filter(Boolean);
  const rest = s.artists.filter((a) => !bias.list.includes(a.id));
  const headArtist = bias.list[0] ? s.artists.find((a) => a.id === bias.list[0]) || null : null;
  const since = s.user.since || String(new Date().getFullYear());
  const years = Math.max(0, new Date().getFullYear() - (+since));
  const danName = bias.type === 1 ? '单担' : (bias.type === 2 ? '双担' : '三担');

  function checkinCount(id) {
    return (s.user.checkins || []).filter((c) => c.artistId === id).length;
  }
  function pct(i) {
    const len = show.length;
    return len === 1 ? 100 : Math.round(100 * (len - i) / (len * (len + 1) / 2));
  }

  return (
    <Reveal className="id-card">
      <div className="id-head">
        <div
          className="id-avatar"
          style={headArtist ? {
            background: `linear-gradient(135deg, ${headArtist.color}, ${headArtist.color2})`,
            boxShadow: `0 8px 20px -8px ${headArtist.color}`
          } : {}}
        >{headArtist ? headArtist.initial : '粉'}</div>
        <div>
          <div className="id-name">{headArtist ? headArtist.name : '尚未选择本命'}</div>
          <div className="id-since">SINCE {since} · 粉龄 {years} 年</div>
        </div>
      </div>
      <div className="dan-toggle">
        {[1, 2, 3].map((n) => (
          <button key={n} className={bias.type === n ? 'active' : ''} data-dan={n} onClick={() => setDan(n)}>
            {n === 1 ? '单担' : n === 2 ? '双担' : '三担'}
          </button>
        ))}
      </div>
      <div className="bias-list">
        {show.map((item, i) => (
          <div key={item.id} className="bias-row" data-bias={item.id}>
            <div className="bias-pic" style={{ background: item.a.color + '33', color: item.a.color2, border: '1px solid ' + item.a.color }}>{item.a.initial}</div>
            <div className="bias-info">
              <div className="bias-name">{item.a.name}</div>
              <div className="bias-stat">看 {checkinCount(item.id)} 场 · 出道 {item.a.debut}</div>
              <div className="bias-bar"><div className="bias-bar-fill" style={{ width: pct(i) + '%' }}></div></div>
            </div>
            <button className="bias-remove" data-remove={item.id} aria-label={'移除' + item.a.name} title="移除" onClick={() => removeBias(item.id)}>×</button>
          </div>
        ))}

        {show.length < bias.type ? (
          <div className="bias-add-row">
            <div className="bias-add-label">
              {bias.list.length === 0
                ? `请选择你喜欢的歌手作为本命（当前${danName}，可选 ${bias.type} 位）`
                : `添加本命 · 还差 ${bias.type - show.length} 位`}
            </div>
            <div className="bias-add-chips">
              {rest.map((a) => (
                <button
                  key={a.id}
                  className="bias-add-chip"
                  data-add={a.id}
                  style={{ background: a.color + '22', color: a.color2, border: '1px solid ' + a.color + '66' }}
                  onClick={() => addBias(a.id)}
                >{a.initial} {a.name}</button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </Reveal>
  );
}
