/* 余响 Encore v1.0.0 · 首页票卡（含"换一张"趣味交互） */
import { store } from '../store.js';
import { randomSeat, randomRow } from '../utils.js';

export default {
  name: 'HeroTicket',
  data() {
    return {
      seat: randomSeat(),
      row: randomRow(),
      flipping: false
    };
  },
  computed: {
    store() { return store; },
    latest() {
      const checkins = store.user.checkins || [];
      if (!checkins.length) return null;
      return [...checkins].sort((a, b) => b.date.localeCompare(a.date))[0];
    },
    latestKey() {
      return this.latest ? `${this.latest.venueId}-${this.latest.date}` : 'empty';
    },
    artist() {
      const c = this.latest;
      if (!c) return null;
      return store.artists.find((a) => a.id === c.artistId) || { name: '-' };
    },
    venue() {
      const c = this.latest;
      if (!c) return null;
      return store.venues.find((v) => v.id === c.venueId) || { name: '-', city: '-' };
    },
    concert() {
      const c = this.latest;
      if (!c) return null;
      return store.concerts.find((x) => x.venueId === c.venueId && x.artistId === c.artistId);
    },
    tour() {
      if (!this.latest) return '';
      return this.concert ? this.concert.tour : (this.latest.note || '');
    }
  },
  watch: {
    latestKey() { this.reroll(); }
  },
  methods: {
    reroll() {
      this.seat = randomSeat();
      this.row = randomRow();
      this.flipping = true;
      setTimeout(() => { this.flipping = false; }, 360);
    }
  },
  template: `
    <div class="ticket" v-reveal>
      <div class="ticket-card" :class="{ flipping }">
        <div class="t-stamp">CHECKED IN</div>
        <template v-if="latest">
          <div class="t-artist">{{ artist.name }}</div>
          <div class="t-tour">{{ tour }}</div>
          <div class="t-venue"><strong>{{ venue.name }}{{ venue.alias ? ' · ' + venue.alias : '' }}</strong></div>
          <div class="t-venue" style="color:var(--ink-mute)">{{ venue.city }} · {{ latest.date }}</div>
          <div class="t-row"><span>SEAT 区 {{ seat }}</span><span>ROW {{ row }}</span></div>
          <div class="ticket-stub"></div>
        </template>
        <template v-else>
          <div class="t-artist">尚未点亮</div>
          <div class="t-tour">去场馆地图点亮第一座舞台</div>
          <div class="t-venue"><strong>等待你的第一场</strong></div>
          <div class="t-venue" style="color:var(--ink-mute)">余响 Encore</div>
          <div class="t-row"><span>SEAT -</span><span>ROW -</span></div>
          <div class="ticket-stub"></div>
        </template>
      </div>
      <div class="ticket-actions">
        <button class="btn btn-secondary" @click="reroll">换一张票根 🎟</button>
      </div>
    </div>
  `
};
