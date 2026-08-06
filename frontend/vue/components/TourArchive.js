/* 余响 Encore v1.0.0 · 巡演档案（歌手筛选 + 表格 + 统计摘要） */
import { store } from '../store.js';
import { formatTourRange } from '../utils.js';

export default {
  name: 'TourArchive',
  computed: {
    store() { return store; },
    artists() { return store.artists; },
    activeId() {
      if (store.artists.some((a) => a.id === store.curArtistId)) return store.curArtistId;
      return store.artists.length ? store.artists[0].id : 'all';
    },
    filtered() {
      const list = store.concerts.filter((c) => c.artistId === this.activeId);
      return [...list].sort((a, b) => b.date.localeCompare(a.date));
    },
    cityCount() {
      return new Set(this.filtered.map((c) => c.city)).size;
    },
    yearSpan() {
      if (!this.filtered.length) return '-';
      const years = this.filtered.map((c) => +(c.startDate || c.date).slice(0, 4));
      const min = Math.min(...years);
      const max = Math.max(...years);
      return min === max ? `${min}` : `${min} - ${max}`;
    }
  },
  methods: {
    formatTourRange,
    select(id) {
      store.curArtistId = id;
    },
    artistOf(c) {
      return store.artists.find((x) => x.id === c.artistId);
    },
    venueOf(c) {
      return store.venues.find((x) => x.id === c.venueId);
    }
  },
  template: `
    <section id="tours">
      <div class="sec-head">
        <div>
          <div class="tag">02 / Tour Archive</div>
          <h2>巡演档案 <em>Archive</em></h2>
          <p>基于真实数据整理的演唱会场次记录，选择歌手查看其巡演足迹。</p>
        </div>
        <div class="artist-filter">
          <button
            v-for="a in artists"
            :key="a.id"
            class="af-chip"
            :class="{ active: a.id === activeId }"
            :data-id="a.id"
            @click="select(a.id)"
          >{{ a.name }}</button>
        </div>
      </div>

      <div class="tour-summary" v-reveal v-if="store.loaded">
        <span class="ts-chip">共 {{ filtered.length }} 场</span>
        <span class="ts-chip">覆盖 {{ cityCount }} 座城市</span>
        <span class="ts-chip">跨度 {{ yearSpan }}</span>
      </div>

      <div class="tour-table-wrap" v-reveal>
        <table class="tour-table">
          <thead>
            <tr><th>歌手</th><th>巡演</th><th>城市</th><th>场馆</th><th>日期</th><th>备注</th></tr>
          </thead>
          <tbody>
            <tr v-for="c in filtered" :key="c.artistId + '-' + c.venueId + '-' + (c.startDate || c.date)">
              <td>
                <span class="artist-tag">
                  <span class="artist-dot" :style="{ background: artistOf(c) ? artistOf(c).color : '#888' }"></span>
                  {{ artistOf(c) ? artistOf(c).name : '-' }}
                </span>
              </td>
              <td>{{ c.tour }}</td>
              <td>{{ c.city }}</td>
              <td>{{ venueOf(c) ? venueOf(c).name : c.venueId }}</td>
              <td class="date-cell">{{ formatTourRange(c.startDate || c.date, c.endDate) }}</td>
              <td>{{ c.note || '' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `
};
