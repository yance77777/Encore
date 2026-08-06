/* 余响 Encore v1.0.0 · 粉丝数据统计（滚动数字动画） */
import { store } from '../store.js';
import { sumExpenses, animateValue } from '../utils.js';

export default {
  name: 'FanStats',
  data() {
    return {
      animated: false,
      io: null
    };
  },
  computed: {
    store() { return store; },
    cards() {
      const checkins = store.user.checkins || [];
      const litVenues = new Set(checkins.map((c) => c.venueId));
      const litProvSet = new Set(store.venues.filter((v) => litVenues.has(v.id)).map((v) => v.provinceShort));
      const artistCount = {};
      checkins.forEach((c) => { artistCount[c.artistId] = (artistCount[c.artistId] || 0) + 1; });
      const topEntry = Object.entries(artistCount).sort((a, b) => b[1] - a[1])[0];
      const topArtist = topEntry ? store.artists.find((a) => a.id === topEntry[0]) : null;
      const typeCount = {};
      checkins.forEach((c) => {
        const v = store.venues.find((x) => x.id === c.venueId);
        if (v) typeCount[v.type] = (typeCount[v.type] || 0) + 1;
      });
      const topType = Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0];
      const since = store.user.since ? Math.max(0, new Date().getFullYear() - (+store.user.since)) : 0;
      const totalV = (store.stats && store.stats.totalVenues) || store.venues.length || 31;
      const totalP = (store.stats && store.stats.totalProvinces) || 20;
      const meetCount = ((store.meetDates.lastMeet ? 1 : 0) + (store.meetDates.nextMeet ? 1 : 0));
      return [
        { label: '总观演场次', value: checkins.length, suffix: '场', num: true },
        { label: '点亮场馆', value: litVenues.size, suffix: ' / ' + totalV, num: true },
        { label: '足迹省份', value: litProvSet.size, suffix: ' / ' + totalP, num: true },
        { label: '追星年资', value: since, suffix: '年', num: true },
        { label: '追星支出', value: Math.round(sumExpenses(store.expenses)), suffix: '元', num: true },
        { label: '见面记录', value: meetCount, suffix: '次', num: true },
        { label: '最常看歌手', value: topArtist ? topArtist.name : '-', num: false },
        { label: '最爱场馆类型', value: topType ? topType[0] : '-', num: false }
      ];
    }
  },
  mounted() {
    this.setupObserver();
  },
  beforeUnmount() {
    if (this.io) this.io.disconnect();
  },
  watch: {
    'cards.length'(len) {
      if (len && !this.animated && this.inViewport()) this.runAnimation();
    }
  },
  methods: {
    inViewport() {
      const r = this.$el.getBoundingClientRect();
      return r.top < window.innerHeight && r.bottom > 0;
    },
    runAnimation() {
      this.animated = true;
      this.$nextTick(() => {
        const nums = this.$el.querySelectorAll('.fs-value:not(.text)');
        nums.forEach((el) => animateValue(el, el.dataset.target));
      });
    },
    setupObserver() {
      this.io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.animated && this.cards.length) this.runAnimation();
        });
      }, { threshold: 0.12 });
      this.io.observe(this.$el);
    }
  },
  template: `
    <div class="fan-stats reveal" v-reveal>
      <div
        v-for="c in cards"
        :key="c.label"
        class="fs-card"
      >
        <div class="fs-value" :class="{ text: !c.num }" :data-target="c.num ? c.value : ''">{{ c.num ? 0 : c.value }}<span class="fs-suffix">{{ c.suffix || '' }}</span></div>
        <div class="fs-label">{{ c.label }}</div>
      </div>
    </div>
  `
};
