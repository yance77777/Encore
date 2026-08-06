/* 余响 Encore v2.0.0 · 今日幸运签（确定性 + 手动重抽） */
import { useState } from 'react';
import { useStore, applySkin } from '../store.jsx';
import { seedOf, todayStr } from '../utils.js';
import Reveal from '../Reveal.jsx';

export default function DailyFortune() {
  const s = useStore();
  let initialNonce = 0;
  try { initialNonce = parseInt(sessionStorage.getItem('encore-fortune-nonce') || '0', 10) || 0; } catch (e) {}
  const [nonce, setNonce] = useState(initialNonce);

  if (!s.artists.length || !s.venues.length) return null;
  const artist = s.artists[seedOf(todayStr() + '-' + nonce) % s.artists.length];
  const venue = s.venues[seedOf(todayStr() + '-v' + nonce) % s.venues.length];

  function roll() {
    const next = nonce + 1;
    setNonce(next);
    try { sessionStorage.setItem('encore-fortune-nonce', String(next)); } catch (e) {}
  }
  function applyArtist() {
    applySkin(artist.id);
  }

  return (
    <Reveal className="fortune-card card card-pad-lg">
      <div className="fortune-head">
        <div>
          <div className="tag">Daily Fortune</div>
          <h3>今日幸运签 <em>Fortune</em></h3>
        </div>
        <button className="btn btn-secondary" onClick={roll}>再抽一次 ✨</button>
      </div>
      <div className="fortune-grid">
        <div className="fortune-item">
          <span className="fortune-label">今日幸运歌手</span>
          <div className="fortune-artist">
            <span className="fortune-initial" style={{ background: artist.color }}>{artist.initial}</span>
            <span>{artist.name}</span>
          </div>
          <button className="fortune-link" onClick={applyArtist}>应用「{artist.name}」主题</button>
        </div>
        <div className="fortune-divider"></div>
        <div className="fortune-item">
          <span className="fortune-label">今日幸运场馆</span>
          <div className="fortune-venue"><strong>{venue.name}</strong></div>
          <div className="fortune-meta">{venue.city} · {venue.type}{venue.capacity ? ' · ' + (venue.capacity >= 10000 ? Math.floor(venue.capacity / 10000) + '万' : venue.capacity) + '座' : ''}</div>
        </div>
      </div>
    </Reveal>
  );
}
