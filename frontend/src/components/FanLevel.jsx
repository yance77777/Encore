/* 余响 Encore v2.0.0 · 粉丝等级卡片 */
import { useStore, getFanLevel } from '../store.jsx';
import { FAN_LEVELS } from '../utils.js';
import Reveal from '../Reveal.jsx';

export default function FanLevel() {
  const s = useStore();
  const count = (s.user.checkins || []).length;
  const level = getFanLevel(count);
  const pct = level.next
    ? Math.min(100, Math.round((count - level.cur.min) / (level.next.min - level.cur.min) * 100))
    : 100;

  return (
    <Reveal className="fan-level reveal">
      <div className="fl-card">
        <div className={'fl-badge lv-' + level.cur.lv}>
          <div className="fl-lv">Lv.{level.cur.lv}</div>
          <div className="fl-tier">{level.cur.name}</div>
        </div>
        <div className="fl-body">
          <div className="fl-top">
            <span className="fl-label">粉丝等级</span>
            <span className="fl-count">已打卡 {count} 场</span>
          </div>
          <div className="fl-bar"><div className="fl-bar-fill" style={{ width: pct + '%' }}></div></div>
          <div className="fl-hint">{level.next ? `距「${level.next.name}」还需 ${level.next.min - count} 场` : '已达最高等级 · 殿堂级粉丝'}</div>
        </div>
        <div className="fl-dots">
          {FAN_LEVELS.map((l, i) => (
            <span key={l.lv} className={'fl-dot' + (i <= level.idx ? ' on' : '') + (i === level.idx ? ' cur' : '')}></span>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
