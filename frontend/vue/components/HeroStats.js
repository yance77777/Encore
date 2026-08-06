/* 余响 Encore v1.0.0 · 首页 Hero 统计 */
import { store } from '../store.js';

export default {
  name: 'HeroStats',
  computed: {
    store() { return store; }
  },
  template: `
    <div class="hero-stats" v-reveal>
      <template v-if="store.stats">
        <div class="stat"><div class="num">{{ store.stats.litVenues }}<span class="unit">座</span></div><div class="label">已点亮场馆</div></div>
        <div class="stat"><div class="num">{{ store.stats.litProvinces }}<span class="unit">省</span></div><div class="label">解锁省份</div></div>
        <div class="stat"><div class="num">{{ store.stats.totalCollections }}<span class="unit">件</span></div><div class="label">收藏总数</div></div>
        <div class="stat"><div class="num">{{ store.stats.totalConcerts }}<span class="unit">场</span></div><div class="label">巡演档案</div></div>
      </template>
      <template v-else>
        <div class="stat"><div class="skeleton" style="height:42px;width:74px;border-radius:6px"></div><div class="skeleton skeleton-text sm" style="width:56px;margin-top:8px"></div></div>
        <div class="stat"><div class="skeleton" style="height:42px;width:74px;border-radius:6px"></div><div class="skeleton skeleton-text sm" style="width:56px;margin-top:8px"></div></div>
        <div class="stat"><div class="skeleton" style="height:42px;width:74px;border-radius:6px"></div><div class="skeleton skeleton-text sm" style="width:56px;margin-top:8px"></div></div>
        <div class="stat"><div class="skeleton" style="height:42px;width:74px;border-radius:6px"></div><div class="skeleton skeleton-text sm" style="width:56px;margin-top:8px"></div></div>
      </template>
    </div>
  `
};
