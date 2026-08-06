/* 余响 Encore v1.0.0 · 中国省份点亮地图（SVG + rAF 节流 tooltip） */
import { store } from '../store.js';
import { getChinaProvinces } from '../utils.js';

export default {
  name: 'ChinaMap',
  data() {
    return {
      tip: { show: false, x: 0, y: 0, html: '' },
      stageRect: null,
      tipRaf: 0
    };
  },
  computed: {
    store() { return store; },
    provinceData() {
      const map = {};
      store.venues.forEach((v) => {
        if (!map[v.provinceShort]) {
          map[v.provinceShort] = { province: v.province, short: v.provinceShort, region: v.region, total: 0, lit: 0 };
        }
        map[v.provinceShort].total++;
      });
      const lit = new Set((store.user.checkins || []).map((c) => c.venueId));
      store.venues.forEach((v) => { if (lit.has(v.id)) map[v.provinceShort].lit++; });
      return map;
    },
    provinces() {
      return getChinaProvinces().map((p) => ({
        ...p,
        data: this.provinceData[p.short] || null
      }));
    },
    litProvCount() {
      return Object.values(this.provinceData).filter((p) => p.lit > 0).length;
    },
    totalProvCount() {
      return Object.keys(this.provinceData).length;
    },
    tipStyle() {
      return {
        transform: `translate3d(${this.tip.x}px, ${this.tip.y}px, 0)`
      };
    }
  },
  beforeUnmount() {
    if (this.tipRaf) cancelAnimationFrame(this.tipRaf);
  },
  methods: {
    provClass(p) {
      return {
        'cmp-prov': true,
        lit: !!(p.data && p.data.lit > 0),
        'has-venues': !!p.data,
        'no-venues': !p.data,
        sel: p.short === store.curProv
      };
    },
    onEnter(p, e) {
      this.tip.html = `<strong>${p.name}</strong><span>${p.data ? `${p.data.lit}/${p.data.total} 座场馆已点亮` : '暂无收录场馆'}</span>`;
      this.tip.show = true;
      this.stageRect = this.$refs.stage ? this.$refs.stage.getBoundingClientRect() : null;
      this.updateTip(e);
    },
    onMove(e) {
      if (this.tipRaf) return;
      this.tipRaf = requestAnimationFrame(() => {
        this.tipRaf = 0;
        this.updateTip(e);
      });
    },
    updateTip(e) {
      const r = this.stageRect;
      if (!r) return;
      this.tip.x = e.clientX - r.left + 14;
      this.tip.y = e.clientY - r.top + 14;
    },
    onLeave() {
      this.tip.show = false;
      if (this.tipRaf) { cancelAnimationFrame(this.tipRaf); this.tipRaf = 0; }
    },
    onClick(p) {
      if (p.data) store.curProv = p.short;
    }
  },
  template: `
    <div id="chinaMap">
      <div class="china-map-wrap" v-reveal>
        <div class="china-map-head">
          <div>
            <div class="tag">Footprint Map</div>
            <h3>足迹版图 <em>Light Up China</em></h3>
          </div>
          <span class="cmp-stats">{{ litProvCount }} / {{ totalProvCount }} 省份已点亮</span>
        </div>
        <div class="china-map-stage" ref="stage">
          <svg class="china-svg" viewBox="0 0 800 620" preserveAspectRatio="xMidYMid meet" role="img" aria-label="中国省份点亮地图">
            <defs>
              <linearGradient id="cmpGoldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#f5c45e"/>
                <stop offset="100%" stop-color="#c8933a"/>
              </linearGradient>
            </defs>
            <path
              v-for="p in provinces"
              :key="p.short"
              :d="p.d"
              :data-prov="p.short"
              :class="provClass(p)"
              @mouseenter="onEnter(p, $event)"
              @mousemove="onMove"
              @mouseleave="onLeave"
              @click="onClick(p)"
            >
              <title>{{ p.name }}{{ p.data ? ' · ' + p.data.lit + '/' + p.data.total : '' }}</title>
            </path>
          </svg>
          <div class="cmp-tip" :class="{ show: tip.show }" :style="tipStyle" v-html="tip.html"></div>
        </div>
        <div class="china-map-legend">
          <span class="lg lg-off"><i></i>未点亮</span>
          <span class="lg lg-on"><i></i>已点亮</span>
          <span class="lg lg-na"><i></i>暂无场馆</span>
        </div>
      </div>
    </div>
  `
};
