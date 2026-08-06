/* 余响 Encore v1.0.0 · 收藏展览（全部专辑 / 我的收藏） */
import { store, toggleAlbum, addCollection } from '../store.js';

export default {
  name: 'GalleryShelf',
  computed: {
    store() { return store; },
    curType() { return store.curType; },
    collectedSet() {
      return new Set(((store.user.collections && store.user.collections.album) || []).map((a) => a.artistId + '-' + a.name));
    },
    allAlbums() {
      const list = [];
      store.artists.forEach((a) => {
        (a.albums || []).forEach((al) => {
          list.push({
            ...al,
            artistId: a.id,
            artistName: a.name,
            artistInitial: a.initial,
            artistColor: a.color,
            artistColor2: a.color2,
            collected: this.collectedSet.has(a.id + '-' + al.name)
          });
        });
      });
      return list;
    },
    items() {
      return (store.user.collections && store.user.collections[this.curType]) || [];
    }
  },
  methods: {
    setType(type) {
      store.curType = type;
    },
    toggle(artistId, name, year) {
      toggleAlbum(artistId, name, year);
    },
    add() {
      addCollection();
    },
    itemArtist(it) {
      return store.artists.find((a) => a.id === it.artistId);
    },
    collSvg(it) {
      const a = this.itemArtist(it) || { color: '#5b2c8b', initial: '?' };
      return `<svg viewBox="0 0 100 100"><rect x="20" y="20" width="60" height="60" rx="6" fill="${a.color}"/><text x="50" y="58" text-anchor="middle" font-family="serif" font-weight="900" font-size="22" fill="#f5c45e">${a.initial}</text></svg>`;
    },
    albumSvg(al) {
      return `<svg viewBox="0 0 100 100"><rect x="15" y="15" width="70" height="70" rx="6" fill="${al.artistColor}"/><text x="50" y="58" text-anchor="middle" font-family="serif" font-weight="900" font-size="22" fill="${al.artistColor2}">${al.artistInitial}</text></svg>`;
    }
  },
  template: `
    <div>
      <div class="gallery-tabs" v-reveal>
        <button class="gtab" :class="{ active: curType === 'all-albums' }" data-type="all-albums" @click="setType('all-albums')">全部专辑</button>
        <button class="gtab" :class="{ active: curType === 'album' }" data-type="album" @click="setType('album')">我的专辑</button>
        <button class="gtab" :class="{ active: curType === 'single' }" data-type="single" @click="setType('single')">单曲</button>
        <button class="gtab" :class="{ active: curType === 'merch' }" data-type="merch" @click="setType('merch')">周边</button>
      </div>

      <div class="shelf" v-reveal v-if="curType === 'all-albums'">
        <div
          v-for="al in allAlbums"
          :key="al.artistId + '-' + al.name"
          class="album-card"
          :class="{ collected: al.collected }"
          role="button"
          tabindex="0"
          @click="toggle(al.artistId, al.name, al.year)"
          @keydown.enter.prevent="toggle(al.artistId, al.name, al.year)"
          @keydown.space.prevent="toggle(al.artistId, al.name, al.year)"
        >
          <div class="album-cover">
            <div v-html="albumSvg(al)"></div>
            <div class="album-year-badge">{{ al.year }}</div>
            <div v-if="al.collected" class="album-collected-badge">已收藏</div>
          </div>
          <div class="album-info">
            <div class="album-title">{{ al.name }}</div>
            <div class="album-meta">{{ al.artistName }} · {{ al.year }}</div>
          </div>
        </div>
      </div>

      <div class="shelf" v-reveal v-else>
        <div v-for="it in items" :key="it.artistId + '-' + it.name" class="item">
          <div class="item-cover" v-html="collSvg(it)"></div>
          <div class="item-info">
            <div class="item-title">{{ it.name }}</div>
            <div class="item-sub">{{ itemArtist(it) ? itemArtist(it).name : '' }} · {{ it.year || '' }}</div>
          </div>
        </div>
        <div class="item item-add" role="button" tabindex="0" @click="add()" @keydown.enter.prevent="add()" @keydown.space.prevent="add()">
          <div class="item-cover"><div class="plus">+</div></div>
          <div class="item-info"><div class="item-title">添加</div><div class="item-sub">拍下你的收藏</div></div>
        </div>
      </div>
    </div>
  `
};
