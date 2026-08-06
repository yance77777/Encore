/* 余响 Encore v2.0.0 · 首页模块导航卡片 */
import Reveal from '../Reveal.jsx';

const MODULES = [
  { href: 'map.html', tag: '01', name: '场馆地图', en: 'Light Up', desc: '点亮你走过的一座座舞台' },
  { href: 'tours.html', tag: '02', name: '巡演档案', en: 'Archive', desc: '基于真实数据的演唱会场次记录' },
  { href: 'gallery.html', tag: '03', name: '收藏展览', en: 'Collection', desc: '拍下你的实体专辑与周边' },
  { href: 'identity.html', tag: '04', name: '粉丝身份', en: 'Identity', desc: '单担双担三担，定义你是谁' },
  { href: 'member.html', tag: '05', name: '会员体系', en: 'Pro', desc: '解锁全国省份集卡与无限收藏' }
];

export default function ModuleNav() {
  return (
    <Reveal className="member-cards">
      {MODULES.map((m) => (
        <div
          key={m.href}
          className="plan"
          role="button"
          tabIndex={0}
          onClick={() => { window.location.href = m.href; }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.location.href = m.href; }
          }}
        >
          <div className="plan-name">{m.en}</div>
          <div className="plan-cn">{m.name}</div>
          <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginBottom: 20 }}>{m.desc}</p>
          <button className="plan-cta">进入 →</button>
        </div>
      ))}
    </Reveal>
  );
}
