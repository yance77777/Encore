/* 余响 Encore v2.0.0 · 见面倒计时卡片 */
import { useStore } from '../store.jsx';
import { daysBetween, formatDateCN, todayStr } from '../utils.js';
import Reveal from '../Reveal.jsx';

export default function MeetCountdown({ onOpen }) {
  const s = useStore();
  const last = s.meetDates.lastMeet || null;
  const next = s.meetDates.nextMeet || null;
  const lastDays = last && last.date ? Math.max(0, daysBetween(last.date, todayStr())) : 0;
  const nextDays = next && next.date ? daysBetween(todayStr(), next.date) : 0;

  return (
    <Reveal className="meet-grid">
      <div className="card card-pad-lg meet-card">
        {last && last.date ? (
          <>
            <span className="badge badge-meet">Last Meet</span>
            <div className="meet-num"><span className="num">{lastDays}</span><span className="unit">天</span></div>
            <div className="meet-sub">距上次见面</div>
            <div className="meet-date">{formatDateCN(last.date)}</div>
            {last.name ? <div className="meet-name">{last.name}</div> : null}
            <div className="meet-card-foot"><button className="btn btn-secondary" onClick={() => onOpen('last')}>设置 / 修改</button></div>
          </>
        ) : (
          <div className="empty meet-empty">
            <div className="empty-icon">🎟</div>
            <div className="empty-title">还没有见面记录</div>
            <div className="empty-text">点击下方按钮，设置你的第一次见面时刻。</div>
            <div className="empty-cta"><button className="btn btn-primary" onClick={() => onOpen('last')}>设置上次见面</button></div>
          </div>
        )}
      </div>

      <div className="card card-pad-lg meet-card">
        {next && next.date ? (
          <>
            <span className={'badge ' + (nextDays < 0 ? 'badge-unlit' : 'badge-tour')}>{nextDays < 0 ? '已过期' : 'Next Meet'}</span>
            <div className={'meet-num' + (nextDays < 0 ? ' expired' : '')}>
              <span className="num">{Math.abs(nextDays)}</span>
              <span className="unit">{nextDays < 0 ? '天前' : '天'}</span>
            </div>
            <div className="meet-sub">{nextDays < 0 ? '已见面 · 这场期待已过去' : (nextDays === 0 ? '就是今天 · 享受现场！' : '距下次见面')}</div>
            <div className="meet-date">{formatDateCN(next.date)}</div>
            {next.name ? <div className="meet-name">{next.name}</div> : null}
            <div className="meet-card-foot"><button className="btn btn-secondary" onClick={() => onOpen('next')}>设置 / 修改</button></div>
          </>
        ) : (
          <div className="empty meet-empty">
            <div className="empty-icon">✨</div>
            <div className="empty-title">还没有期待中的见面</div>
            <div className="empty-text">点击下方按钮，添加一场即将到来的演唱会。</div>
            <div className="empty-cta"><button className="btn btn-primary" onClick={() => onOpen('next')}>添加下次见面</button></div>
          </div>
        )}
      </div>
    </Reveal>
  );
}
