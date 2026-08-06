/* 余响 Encore v0.9.0 · 账单汇总（总额 + 分类 + 占比环图） */
import { useStore } from '../store.jsx';
import { fmtAmount } from '../utils.js';
import Reveal from '../Reveal.jsx';

export default function ExpenseSummary({ onAdd, onClear }) {
  const s = useStore();
  const byType = { meet: 0, album: 0, merch: 0 };
  let total = 0;
  s.expenses.forEach((e) => {
    const amt = Number(e.amount) || 0;
    total += amt;
    if (Object.prototype.hasOwnProperty.call(byType, e.type)) byType[e.type] += amt;
  });
  const C = 2 * Math.PI * 42;
  const types = [
    { key: 'meet', label: '见面', color: 'var(--neon)' },
    { key: 'album', label: '专辑', color: 'var(--neon-2)' },
    { key: 'merch', label: '周边', color: 'var(--teal)' }
  ];
  let acc = 0;
  const segments = types.map((t) => {
    const value = byType[t.key] || 0;
    const len = total ? (value / total) * C : 0;
    const seg = {
      ...t,
      value,
      dash: `${len} ${C - len}`,
      offset: -acc,
      pct: total ? Math.round((value / total) * 100) : 0
    };
    acc += len;
    return seg;
  });

  return (
    <Reveal className="card card-pad-lg exp-summary">
      <div className="exp-total-wrap">
        <div className="exp-total-label">总消费</div>
        <div className="exp-total">¥<span>{total.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span></div>
      </div>
      <div className="exp-donut-wrap">
        <div className="exp-donut">
          <svg viewBox="0 0 100 100" role="img" aria-label="消费占比">
            <circle className="dn-bg" cx="50" cy="50" r="42"></circle>
            {segments.map((sg) => (
              <circle
                key={sg.key}
                className="dn-seg"
                cx="50"
                cy="50"
                r="42"
                stroke={sg.color}
                strokeDasharray={sg.dash}
                strokeDashoffset={sg.offset}
              ></circle>
            ))}
            <text className="dn-num" x="50" y="47">{segments.reduce((a, sg) => a + sg.value, 0).toLocaleString()}</text>
            <text className="dn-lab" x="50" y="62">总支出</text>
          </svg>
          <div className="exp-donut-legend">
            {segments.map((sg) => (
              <div key={sg.key} className="dn-legend-item">
                <i style={{ background: sg.color }}></i>
                <span>{sg.label}</span>
                <b>{fmtAmount(sg.value)} · {sg.pct}%</b>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="exp-subtotals">
        <div className="stat"><div className="num">{fmtAmount(byType.meet)}</div><div className="label">见面</div></div>
        <div className="stat"><div className="num">{fmtAmount(byType.album)}</div><div className="label">实体专辑</div></div>
        <div className="stat"><div className="num">{fmtAmount(byType.merch)}</div><div className="label">周边</div></div>
      </div>
      <div className="exp-actions">
        <button className="btn btn-primary" onClick={onAdd}>添加消费记录</button>
        <button className="btn btn-secondary" onClick={onClear}>清空全部记录</button>
      </div>
    </Reveal>
  );
}
