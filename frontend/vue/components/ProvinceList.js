/* 余响 Encore v1.0.0 · 省份列表 */
import { store } from '../store.js';

export default {
  name: 'ProvinceList',
  computed: {
    store() { return store; },
    provinces() {
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
    }
  },
  methods: {
    select(p) {
      store.curProv = p.short;
    }
  },
  template: `
    <div class="province-list" v-reveal>
      <div
        v-for="p in provinces"
        :key="p.short"
        class="prov"
        :class="{ lit: p.lit > 0, active: p.short === store.curProv }"
        :data-prov="p.short"
        @click="select(p)"
      >
        <div class="prov-name"><span class="pin"></span>{{ p.province }}</div>
        <div class="prov-count">{{ p.lit }}/{{ p.total }}</div>
      </div>
    </div>
  `
};
