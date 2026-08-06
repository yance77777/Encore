/* 余响 Encore v1.0.0 · 粉丝等级卡片 */
import { store, getFanLevel } from '../store.js';
import { FAN_LEVELS } from '../utils.js';

export default {
  name: 'FanLevel',
  computed: {
    store() { return store; },
    levels() { return FAN_LEVELS; },
    count() { return (store.user.checkins || []).length; },
    level() { return getFanLevel(this.count); },
    pct() {
      const { cur, next } = this.level;
      return next ? Math.min(100, Math.round((this.count - cur.min) / (next.min - cur.min) * 100)) : 100;
    }
  },
  template: `
    <div class="fan-level reveal" v-reveal>
      <div class="fl-card">
        <div class="fl-badge" :class="'lv-' + level.cur.lv">
          <div class="fl-lv">Lv.{{ level.cur.lv }}</div>
          <div class="fl-tier">{{ level.cur.name }}</div>
        </div>
        <div class="fl-body">
          <div class="fl-top">
            <span class="fl-label">粉丝等级</span>
            <span class="fl-count">已打卡 {{ count }} 场</span>
          </div>
          <div class="fl-bar"><div class="fl-bar-fill" :style="{ width: pct + '%' }"></div></div>
          <div class="fl-hint">{{ level.next ? '距「' + level.next.name + '」还需 ' + (level.next.min - count) + ' 场' : '已达最高等级 · 殿堂级粉丝' }}</div>
        </div>
        <div class="fl-dots">
          <span
            v-for="(l, i) in levels"
            :key="l.lv"
            class="fl-dot"
            :class="{ on: i <= level.idx, cur: i === level.idx }"
          ></span>
        </div>
      </div>
    </div>
  `
};
