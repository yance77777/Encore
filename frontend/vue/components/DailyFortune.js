/* 余响 Encore v1.0.0 · 今日幸运签（确定性 + 手动重抽，趣味小组件） */
import { store, applySkin } from '../store.js';
import { seedOf, todayStr } from '../utils.js';

export default {
  name: 'DailyFortune',
  data() {
    let nonce = 0;
    try { nonce = parseInt(sessionStorage.getItem('encore-fortune-nonce') || '0', 10) || 0; } catch (e) {}
    return { nonce };
  },
  computed: {
    store() { return store; },
    artist() {
      if (!store.artists.length) return null;
      const seed = seedOf(todayStr() + '-' + this.nonce);
      return store.artists[Math.floor(seed * store.artists.length)];
    },
    venue() {
      if (!store.venues.length) return null;
      const seed = seedOf(todayStr() + '-v' + this.nonce);
      return store.venues[Math.floor(seed * store.venues.length)];
    }
  },
  methods: {
    roll() {
      this.nonce += 1;
      try { sessionStorage.setItem('encore-fortune-nonce', String(this.nonce)); } catch (e) {}
    },
    applyArtist() {
      if (this.artist) applySkin(this.artist.id);
    }
  },
  template: `
    <div class="fortune-card card card-pad-lg" v-reveal v-if="artist && venue">
      <div class="fortune-head">
        <div>
          <div class="tag">Daily Fortune</div>
          <h3>今日幸运签 <em>Fortune</em></h3>
        </div>
        <button class="btn btn-secondary" @click="roll">再抽一次 ✨</button>
      </div>
      <div class="fortune-grid">
        <div class="fortune-item">
          <span class="fortune-label">今日幸运歌手</span>
          <div class="fortune-artist">
            <span class="fortune-initial" :style="{ background: artist.color }">{{ artist.initial }}</span>
            <span>{{ artist.name }}</span>
          </div>
          <button class="fortune-link" @click="applyArtist">应用「{{ artist.name }}」主题</button>
        </div>
        <div class="fortune-divider"></div>
        <div class="fortune-item">
          <span class="fortune-label">今日幸运场馆</span>
          <div class="fortune-venue"><strong>{{ venue.name }}</strong></div>
          <div class="fortune-meta">{{ venue.city }} · {{ venue.type }}{{ venue.capacity ? ' · ' + (venue.capacity >= 10000 ? Math.floor(venue.capacity / 10000) + '万' : venue.capacity) + '座' : '' }}</div>
        </div>
      </div>
    </div>
  `
};
