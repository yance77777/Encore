/* 余响 Encore v0.9.0 · 成就徽章 */
import { useStore, checkAchievements } from '../store.jsx';
import Reveal from '../Reveal.jsx';

export default function Achievements() {
  const s = useStore();
  const achs = checkAchievements(s);
  const got = achs.filter((a) => a.got).length;

  return (
    <Reveal className="ach-section reveal">
      <div className="ach-head">
        <div>
          <div className="tag">Achievements</div>
          <h3>成就徽章 <em>Badges</em></h3>
          <p>点亮足迹，解锁属于你的追星勋章。</p>
        </div>
        <span className="ach-count">{got} / {achs.length} 已解锁</span>
      </div>
      <div className="ach-grid">
        {achs.map((a) => (
          <div key={a.name} className={'ach-badge ' + (a.got ? 'got' : 'locked')}>
            <div className="ach-icon">{a.icon}</div>
            <div className="ach-name">{a.name}</div>
            <div className="ach-desc">{a.desc}</div>
            <div className="ach-state">{a.got ? '已解锁' : '未解锁'}</div>
          </div>
        ))}
      </div>
    </Reveal>
  );
}
