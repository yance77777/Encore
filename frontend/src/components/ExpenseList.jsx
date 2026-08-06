/* 余响 Encore v2.0.0 · 消费记录列表 */
import { useStore } from '../store.jsx';
import { fmtAmount, fmtDate } from '../utils.js';

const TYPE_MAP = {
  meet: { label: '见面', badge: 'badge-meet' },
  album: { label: '专辑', badge: 'badge-album' },
  merch: { label: '周边', badge: 'badge-merch' }
};

export default function ExpenseList({ onAdd, onDelete }) {
  const s = useStore();
  const sorted = s.expenses.slice().sort((a, b) => {
    if (a.date === b.date) return b.id < a.id ? -1 : 1;
    return b.date < a.date ? -1 : 1;
  });

  return (
    <div>
      {sorted.length ? (
        <div className="exp-list">
          {sorted.map((e) => {
            const t = TYPE_MAP[e.type] || { label: '其他', badge: 'badge-tour' };
            return (
              <div key={e.id} className="card exp-item">
                <div className="exp-item-main">
                  <span className={'badge ' + t.badge}>{t.label}</span>
                  <div className="exp-item-name">{e.name}</div>
                  <div className="exp-item-date">{fmtDate(e.date)}</div>
                  {e.type === 'meet' && (e.location || e.seat) ? (
                    <div className="exp-item-meta">
                      {e.location ? <i className="ico">📍</i> : null}
                      {e.location ? <span>{e.location}</span> : null}
                      {e.location && e.seat ? ' · ' : null}
                      {e.seat ? <span>{e.seat}</span> : null}
                    </div>
                  ) : null}
                </div>
                <div className="exp-item-side">
                  <div className="exp-amount">{fmtAmount(e.amount)}</div>
                  <button className="btn-icon" aria-label={'删除' + e.name} onClick={() => onDelete(e.id)}>✕</button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty exp-empty">
          <div className="empty-icon">💸</div>
          <div className="empty-title">还没有消费记录</div>
          <div className="empty-text">点击下方按钮，添加你的第一笔记录。</div>
          <div className="empty-cta"><button className="btn btn-primary" onClick={onAdd}>添加消费记录</button></div>
        </div>
      )}
    </div>
  );
}
