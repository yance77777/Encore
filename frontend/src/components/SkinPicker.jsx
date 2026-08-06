/* 余响 Encore v2.0.0 · 主题皮肤选择器 */
import { useStore, applySkin } from '../store.jsx';
import { skinNames } from '../utils.js';
import Reveal from '../Reveal.jsx';

export default function SkinPicker() {
  const s = useStore();
  const active = s.user.skin || 'jay';
  const a = s.artists.find((x) => x.id === active);
  const preview = a
    ? { name: skinNames[active] || a.name, color: a.color, color2: a.color2 }
    : { name: '周杰伦 · 魔幻紫', color: '#5b2c8b', color2: '#9d6cff' };

  return (
    <Reveal className="id-card">
      <div className="id-head">
        <div className="id-avatar theme-avatar">皮</div>
        <div>
          <div className="id-name">专属皮肤</div>
          <div className="id-since">SELECT A THEME</div>
        </div>
      </div>
      <p className="skin-desc">选择你本命歌手的主色调，整个App随你而变。</p>
      <div className="skin-row">
        {s.artists.map((artist) => (
          <div
            key={artist.id}
            className={'skin-chip' + (artist.id === active ? ' active' : '')}
            data-id={artist.id}
            style={{ background: `linear-gradient(160deg, ${artist.color}, ${artist.color}55)` }}
            role="button"
            tabIndex={0}
            onClick={() => applySkin(artist.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); applySkin(artist.id); }
            }}
          >{artist.en.slice(0, 6)}</div>
        ))}
      </div>
      <div className="theme-preview">
        <div className="tp-label">CURRENT THEME</div>
        <div className="tp-name">{preview.name}</div>
        <div className="tp-color">主色 {preview.color} · 强调 {preview.color2}</div>
      </div>
    </Reveal>
  );
}
