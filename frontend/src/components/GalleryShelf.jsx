/* 余响 Encore v0.9.0 · 收藏展览（全部专辑 / 我的收藏） */
import { useStore, toggleAlbum, addCollection, setGalleryType } from '../store.jsx';
import Reveal from '../Reveal.jsx';

export default function GalleryShelf() {
  const s = useStore();
  const curType = s.curType;
  const collectedSet = new Set(((s.user.collections && s.user.collections.album) || []).map((a) => a.artistId + '-' + a.name));
  const allAlbums = [];
  s.artists.forEach((a) => {
    (a.albums || []).forEach((al) => {
      allAlbums.push({
        ...al,
        artistId: a.id,
        artistName: a.name,
        artistInitial: a.initial,
        artistColor: a.color,
        artistColor2: a.color2,
        collected: collectedSet.has(a.id + '-' + al.name)
      });
    });
  });
  const items = (s.user.collections && s.user.collections[curType]) || [];

  function itemArtist(it) {
    return s.artists.find((a) => a.id === it.artistId);
  }
  function collSvg(it) {
    const a = itemArtist(it) || { color: '#5b2c8b', initial: '?' };
    return `<svg viewBox="0 0 100 100"><rect x="20" y="20" width="60" height="60" rx="6" fill="${a.color}"/><text x="50" y="58" text-anchor="middle" font-family="serif" font-weight="900" font-size="22" fill="#f5c45e">${a.initial}</text></svg>`;
  }
  function albumSvg(al) {
    return `<svg viewBox="0 0 100 100"><rect x="15" y="15" width="70" height="70" rx="6" fill="${al.artistColor}"/><text x="50" y="58" text-anchor="middle" font-family="serif" font-weight="900" font-size="22" fill="${al.artistColor2}">${al.artistInitial}</text></svg>`;
  }

  return (
    <div>
      <Reveal className="gallery-tabs">
        {[
          ['all-albums', '全部专辑'],
          ['album', '我的专辑'],
          ['single', '单曲'],
          ['merch', '周边']
        ].map(([type, label]) => (
          <button
            key={type}
            className={'gtab' + (curType === type ? ' active' : '')}
            data-type={type}
            onClick={() => setGalleryType(type)}
          >{label}</button>
        ))}
      </Reveal>

      {curType === 'all-albums' ? (
        <Reveal className="shelf">
          {allAlbums.map((al) => (
            <div
              key={al.artistId + '-' + al.name}
              className={'album-card' + (al.collected ? ' collected' : '')}
              role="button"
              tabIndex={0}
              onClick={() => toggleAlbum(al.artistId, al.name, al.year)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleAlbum(al.artistId, al.name, al.year); }
              }}
            >
              <div className="album-cover">
                <div dangerouslySetInnerHTML={{ __html: albumSvg(al) }}></div>
                <div className="album-year-badge">{al.year}</div>
                {al.collected ? <div className="album-collected-badge">已收藏</div> : null}
              </div>
              <div className="album-info">
                <div className="album-title">{al.name}</div>
                <div className="album-meta">{al.artistName} · {al.year}</div>
              </div>
            </div>
          ))}
        </Reveal>
      ) : (
        <Reveal className="shelf">
          {items.map((it) => (
            <div key={it.artistId + '-' + it.name} className="item">
              <div className="item-cover" dangerouslySetInnerHTML={{ __html: collSvg(it) }}></div>
              <div className="item-info">
                <div className="item-title">{it.name}</div>
                <div className="item-sub">{itemArtist(it) ? itemArtist(it).name : ''} · {it.year || ''}</div>
              </div>
            </div>
          ))}
          <div
            className="item item-add"
            role="button"
            tabIndex={0}
            onClick={addCollection}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); addCollection(); }
            }}
          >
            <div className="item-cover"><div className="plus">+</div></div>
            <div className="item-info"><div className="item-title">添加</div><div className="item-sub">拍下你的收藏</div></div>
          </div>
        </Reveal>
      )}
    </div>
  );
}
