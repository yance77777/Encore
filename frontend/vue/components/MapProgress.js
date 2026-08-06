/* 余响 Encore v1.0.0 · 足迹进度条（地图页趣味小组件） */
import { store } from '../store.js';

export default {
  name: 'MapProgress',
  computed: {
    store() { return store; },
    litVenues() { return new Set((store.user.checkins || []).map((c) => c.venueId)).size; },
    totalVenues() { return store.venues.length; },
    litProvs() {
      const lit = new Set((store.user.checkins || []).map((c) => c.venueId));
      return new Set(store.venues.filter((v) => lit.has(v.id)).map((v) => v.provinceShort)).size;
    },
    totalProvs() { return new Set(store.venues.map((v) => v.provinceShort)).size; },
    venuePct() { return this.totalVenues ? Math.round((this.litVenues / this.totalVenues) * 100) : 0; },
    provPct() { return this.totalProvs ? Math.round((this.litProvs / this.totalProvs) * 100) : 0; }
  },
  template: `
    <div class="map-progress" v-reveal>
      <div class="mp-row">
        <span class="mp-label">场馆足迹</span>
        <div class="mp-bar"><div class="mp-fill" :style="{ width: venuePct + '%' }"></div></div>
        <span class="mp-num">{{ litVenues }} / {{ totalVenues }}</span>
      </div>
      <div class="mp-row">
        <span class="mp-label">省份足迹</span>
        <div class="mp-bar"><div class="mp-fill" :style="{ width: provPct + '%' }"></div></div>
        <span class="mp-num">{{ litProvs }} / {{ totalProvs }}</span>
      </div>
    </div>
  `
};
