/* 余响 Encore v2.0.0 · 省份列表 */
import { useStore, getProvinces, selectProvince } from '../store.jsx';
import Reveal from '../Reveal.jsx';

export default function ProvinceList() {
  const s = useStore();
  const provs = getProvinces(s);

  function select(p) {
    selectProvince(p.short);
  }

  return (
    <Reveal className="province-list">
      {provs.map((p) => (
        <div
          key={p.short}
          className={'prov' + (p.lit > 0 ? ' lit' : '') + (p.short === s.curProv ? ' active' : '')}
          data-prov={p.short}
          role="button"
          tabIndex={0}
          onClick={() => select(p)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(p); }
          }}
        >
          <div className="prov-name"><span className="pin"></span>{p.province}</div>
          <div className="prov-count">{p.lit}/{p.total}</div>
        </div>
      ))}
    </Reveal>
  );
}
