/* 余响 Encore v1.0.0 · 见面倒计时卡片 */
import { store } from '../store.js';
import { daysBetween, formatDateCN, todayStr } from '../utils.js';

export default {
  name: 'MeetCountdown',
  emits: ['open'],
  computed: {
    store() { return store; },
    last() { return store.meetDates.lastMeet || null; },
    next() { return store.meetDates.nextMeet || null; },
    lastDays() {
      if (!this.last || !this.last.date) return 0;
      return Math.max(0, daysBetween(this.last.date, todayStr()));
    },
    nextDays() {
      if (!this.next || !this.next.date) return 0;
      return daysBetween(todayStr(), this.next.date);
    }
  },
  methods: {
    formatDateCN,
    open(target) {
      this.$emit('open', target);
    }
  },
  template: `
    <div class="meet-grid" v-reveal>
      <div class="card card-pad-lg meet-card">
        <template v-if="last && last.date">
          <span class="badge badge-meet">Last Meet</span>
          <div class="meet-num"><span class="num">{{ lastDays }}</span><span class="unit">天</span></div>
          <div class="meet-sub">距上次见面</div>
          <div class="meet-date">{{ formatDateCN(last.date) }}</div>
          <div v-if="last.name" class="meet-name">{{ last.name }}</div>
          <div class="meet-card-foot"><button class="btn btn-secondary" @click="open('last')">设置 / 修改</button></div>
        </template>
        <template v-else>
          <div class="empty meet-empty">
            <div class="empty-icon">🎟</div>
            <div class="empty-title">还没有见面记录</div>
            <div class="empty-text">点击下方按钮，设置你的第一次见面时刻。</div>
            <div class="empty-cta"><button class="btn btn-primary" @click="open('last')">设置上次见面</button></div>
          </div>
        </template>
      </div>

      <div class="card card-pad-lg meet-card">
        <template v-if="next && next.date">
          <span class="badge" :class="nextDays < 0 ? 'badge-unlit' : 'badge-tour'">{{ nextDays < 0 ? '已过期' : 'Next Meet' }}</span>
          <div class="meet-num" :class="{ expired: nextDays < 0 }">
            <span class="num">{{ Math.abs(nextDays) }}</span>
            <span class="unit">{{ nextDays < 0 ? '天前' : '天' }}</span>
          </div>
          <div class="meet-sub">{{ nextDays < 0 ? '已见面 · 这场期待已过去' : (nextDays === 0 ? '就是今天 · 享受现场！' : '距下次见面') }}</div>
          <div class="meet-date">{{ formatDateCN(next.date) }}</div>
          <div v-if="next.name" class="meet-name">{{ next.name }}</div>
          <div class="meet-card-foot"><button class="btn btn-secondary" @click="open('next')">设置 / 修改</button></div>
        </template>
        <template v-else>
          <div class="empty meet-empty">
            <div class="empty-icon">✨</div>
            <div class="empty-title">还没有期待中的见面</div>
            <div class="empty-text">点击下方按钮，添加一场即将到来的演唱会。</div>
            <div class="empty-cta"><button class="btn btn-primary" @click="open('next')">添加下次见面</button></div>
          </div>
        </template>
      </div>
    </div>
  `
};
