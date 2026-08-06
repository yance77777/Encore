/* 余响 Encore v1.0.0 · 场馆卡片网格（点亮 / 熄灭 + 按本命 tooltip） */
import { store, toggleCheckin } from '../store.js';
import { venueSVG } from '../utils.js';

export default {
  name: 'VenueGrid',
  data() {
    return {
      animatingId: null,
      tip: { show: false, x: 0, y: 0, html: '' },
      gridRect: null,
      tipRaf: 0,
      currentCard: null
    };
  },
  computed: {
    store() { return store; },
    provs() {
      const map = {};
      store.venues.forEach((v) => {
        if (!map[v.provinceShort]) {
          map[v.provinceShort] = { province: v.province, short: v.provinceShort, region: v.region, total: 0, lit: 0, venues: [] };
        }
        map[v.provinceShort].total++;
        map[v.provinceShort].venues.push(v);
      });
      const lit = new Set((store.user.checkins || []).map((c) => c.venueId));
      store.venues.forEach((v) => { if (lit.has(v.id)) map[v.provinceShort].lit++; });
      return Object.values(map);
    },
    current() {
      return this.provs.find((x) => x.short === store.curProv) || this.provs[0] || null;
    },
    venues() {
      return this.current ? this.current.venues : [];
    },
    litIds() {
      return new Set((store.user.checkins || []).map((c) => c.venueId));
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
    isLit(id) { return this.litIds.has(id); },
    cardClass(id) {
      return {
        'venue-card': true,
        lit: this.isLit(id),
        lighting: this.animatingId === id && this.isLit(id),
        unlighting: this.animatingId === id && !this.isLit(id)
      };
    },
    artHtml(v) {
      if (v._broken) return venueSVG[v.art] || venueSVG.dome;
      const isLit = this.isLit(v.id);
      const src = isLit ? v.img : (v.imgUnlit || v.img);
      if (src) {
        return `<img src="${src}" alt="${v.name}" class="${isLit ? 'lit' : 'unlit'}">`;
      }
      return venueSVG[v.art] || venueSVG.dome;
    },
    onImgError(v) {
      v._broken = true;
    },
    artistOf(id) {
      const c = (store.user.checkins || []).find((x) => x.venueId === id);
      return c ? store.artists.find((a) => a.id === c.artistId) || null : null;
    },
    checkinOf(id) {
      return (store.user.checkins || []).find((x) => x.venueId === id);
    },
    toggle(id) {
      const venue = store.venues.find((v) => v.id === id);
      if (!venue) return;
      const result = toggleCheckin(id);
      if (!result) return;
      this.animatingId = id;
      setTimeout(() => { this.animatingId = null; }, result === 'lit' ? 500 : 400);
    },
    tooltipHtml(venueId) {
      const v = store.venues.find((x) => x.id === venueId);
      if (!v) return '';
      const biasList = (store.user.bias && Array.isArray(store.user.bias.list) && store.user.bias.list.length)
        ? store.user.bias.list : [];
      let header = `<strong>${v.name}${v.alias ? ' · ' + v.alias : ''}</strong>`;
      if (biasList.length === 0) {
        const all = store.concerts.filter((c) => c.venueId === venueId);
        if (all.length === 0) return header + `<span>暂无演唱会记录</span>`;
        const byArtist = {};
        all.forEach((c) => {
          if (!byArtist[c.artistId]) byArtist[c.artistId] = [];
          byArtist[c.artistId].push(c);
        });
        const lines = Object.keys(byArtist).map((aid) => {
          const a = store.artists.find((x) => x.id === aid);
          const recs = byArtist[aid].sort((x, y) => x.date.localeCompare(y.date))
            .map((c) => `${c.date.slice(0, 4)} ${c.tour}`).join(' / ');
          return `<span>${a ? a.name : aid} ${recs}</span>`;
        });
        return header + lines.join('');
      }
      const lines = biasList.map((aid) => {
        const a = store.artists.find((x) => x.id === aid);
        const recs = store.concerts.filter((c) => c.venueId === venueId && c.artistId === aid)
          .sort((x, y) => x.date.localeCompare(y.date));
        if (recs.length === 0) return `<span>该场馆暂无 ${a ? a.name : aid} 演唱会记录</span>`;
        const recap = recs.map((c) => `${c.date.slice(0, 4)} ${c.tour}`).join(' / ');
        return `<span>${a ? a.name : aid} ${recap}</span>`;
      });
      return header + lines.join('');
    },
    onOver(e) {
      const card = e.target.closest('.venue-card');
      if (card === this.currentCard) return;
      this.currentCard = card;
      if (card) {
        this.tip.html = this.tooltipHtml(card.dataset.id);
        this.tip.show = true;
        this.gridRect = this.$refs.grid ? this.$refs.grid.getBoundingClientRect() : null;
      }
    },
    onOut(e) {
      const related = e.relatedTarget;
      if (!related || !this.$refs.grid || !this.$refs.grid.contains(related)) {
        this.tip.show = false;
        if (this.tipRaf) { cancelAnimationFrame(this.tipRaf); this.tipRaf = 0; }
        this.currentCard = null;
      }
    },
    onMove(e) {
      if (this.tipRaf) return;
      const cx = e.clientX;
      const cy = e.clientY;
      this.tipRaf = requestAnimationFrame(() => {
        this.tipRaf = 0;
        const r = this.gridRect;
        if (!r) return;
        this.tip.x = cx - r.left + 14;
        this.tip.y = cy - r.top + 14;
      });
    }
  },
  template: `
    <div class="map-canvas" v-reveal>
      <div class="map-prov-title">
        <h3>{{ current ? current.province : '加载中' }}</h3>
        <span class="lit-badge">{{ current ? current.lit : 0 }} / {{ current ? current.total : 0 }} 已点亮</span>
      </div>
      <div class="map-prov-sub">{{ current ? current.region + ' · ' + (current.lit === current.total && current.total > 0 ? '已集齐' : '巡演城市') : '' }}</div>
      <div class="venue-grid" ref="grid" @mouseover="onOver" @mouseout="onOut" @mousemove="onMove">
        <div
          v-for="v in venues"
          :key="v.id"
          :class="cardClass(v.id)"
          :data-id="v.id"
          @click="toggle(v.id)"
        >
          <div v-if="!isLit(v.id)" class="toggle-hint">点击点亮</div>
          <div class="venue-art" v-html="artHtml(v)"></div>
          <div class="venue-name">{{ v.name }}</div>
          <div class="venue-alias">{{ v.alias }}</div>
          <div class="venue-meta">{{ v.city }} · {{ v.type }}{{ v.capacity ? ' · ' + (v.capacity >= 10000 ? Math.floor(v.capacity / 10000) + '万' : v.capacity) + '座' : '' }}</div>
          <div v-if="isLit(v.id) && artistOf(v.id)" class="lit-info">{{ artistOf(v.id).name }} · {{ checkinOf(v.id).date }}</div>
        </div>
        <div class="cmp-tip venue-tip" :class="{ show: tip.show }" :style="tipStyle" v-html="tip.html"></div>
      </div>
    </div>
  `
};
