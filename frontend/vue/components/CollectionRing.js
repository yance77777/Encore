/* 余响 Encore v1.0.0 · 专辑收藏进度环 */
import { store } from '../store.js';

export default {
  name: 'CollectionRing',
  computed: {
    store() { return store; },
    collected() {
      return (store.user.collections && store.user.collections.album) ? store.user.collections.album.length : 0;
    },
    total() {
      return store.artists.reduce((s, a) => s + ((a.albums || []).length), 0);
    },
    pct() {
      return this.total ? Math.round((this.collected / this.total) * 100) : 0;
    },
    circ() {
      return 2 * Math.PI * 48;
    },
    offset() {
      return this.circ * (1 - this.pct / 100);
    }
  },
  template: `
    <div class="collection-ring" v-reveal>
      <svg viewBox="0 0 120 120" role="img" aria-label="专辑收藏进度">
        <defs>
          <linearGradient id="crGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#f5c45e"/>
            <stop offset="100%" stop-color="#7c5cff"/>
          </linearGradient>
        </defs>
        <circle class="cr-bg" cx="60" cy="60" r="48"/>
        <circle class="cr-fg" cx="60" cy="60" r="48" :stroke-dasharray="circ" :stroke-dashoffset="offset"/>
        <text class="cr-num" x="60" y="58">{{ collected }}</text>
        <text class="cr-lab" x="60" y="74">{{ pct }}%</text>
      </svg>
      <div class="cr-meta">
        <span class="cr-label">专辑收藏进度</span>
        <span class="cr-total">共 {{ total }} 张 · 已收藏 {{ collected }} 张</span>
      </div>
    </div>
  `
};
