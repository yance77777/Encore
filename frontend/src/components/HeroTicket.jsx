/* 余响 Encore v2.0.0 · 首页票卡（含"换一张"趣味交互） */
import { useEffect, useState } from 'react';
import { useStore } from '../store.jsx';
import { randomSeat, randomRow } from '../utils.js';
import Reveal from '../Reveal.jsx';

export default function HeroTicket() {
  const s = useStore();
  const [seat, setSeat] = useState(randomSeat);
  const [row, setRow] = useState(randomRow);
  const [flipping, setFlipping] = useState(false);

  const checkins = s.user.checkins || [];
  const latest = checkins.length ? [...checkins].sort((a, b) => b.date.localeCompare(a.date))[0] : null;
  const latestKey = latest ? `${latest.venueId}-${latest.date}` : 'empty';
  const artist = latest ? (s.artists.find((a) => a.id === latest.artistId) || { name: '-' }) : null;
  const venue = latest ? (s.venues.find((v) => v.id === latest.venueId) || { name: '-', city: '-' }) : null;
  const concert = latest ? s.concerts.find((x) => x.venueId === latest.venueId && x.artistId === latest.artistId) : null;
  const tour = latest ? (concert ? concert.tour : (latest.note || '')) : '';

  useEffect(() => {
    reroll();
  }, [latestKey]);

  function reroll() {
    setSeat(randomSeat());
    setRow(randomRow());
    setFlipping(true);
    setTimeout(() => setFlipping(false), 360);
  }

  return (
    <Reveal className="ticket">
      <div className={'ticket-card' + (flipping ? ' flipping' : '')}>
        <div className="t-stamp">CHECKED IN</div>
        {latest ? (
          <>
            <div className="t-artist">{artist.name}</div>
            <div className="t-tour">{tour}</div>
            <div className="t-venue"><strong>{venue.name}{venue.alias ? ' · ' + venue.alias : ''}</strong></div>
            <div className="t-venue" style={{ color: 'var(--ink-mute)' }}>{venue.city} · {latest.date}</div>
            <div className="t-row"><span>SEAT 区 {seat}</span><span>ROW {row}</span></div>
            <div className="ticket-stub"></div>
          </>
        ) : (
          <>
            <div className="t-artist">尚未点亮</div>
            <div className="t-tour">去场馆地图点亮第一座舞台</div>
            <div className="t-venue"><strong>等待你的第一场</strong></div>
            <div className="t-venue" style={{ color: 'var(--ink-mute)' }}>余响 Encore</div>
            <div className="t-row"><span>SEAT -</span><span>ROW -</span></div>
            <div className="ticket-stub"></div>
          </>
        )}
      </div>
      <div className="ticket-actions">
        <button className="btn btn-secondary" onClick={reroll}>换一张票根 🎟</button>
      </div>
    </Reveal>
  );
}
