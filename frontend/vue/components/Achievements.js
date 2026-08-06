/* 余响 Encore v1.0.0 · 成就徽章 */
import { store, checkAchievements } from '../store.js';

export default {
  name: 'Achievements',
  computed: {
    store() { return store; },
    achs() { return checkAchievements(); },
    got() { return this.achs.filter((a) => a.got).length; }
  },
  template: `
    <div class="ach-section reveal" v-reveal>
      <div class="ach-head">
        <div>
          <div class="tag">Achievements</div>
          <h3>成就徽章 <em>Badges</em></h3>
          <p>点亮足迹，解锁属于你的追星勋章。</p>
        </div>
        <span class="ach-count">{{ got }} / {{ achs.length }} 已解锁</span>
      </div>
      <div class="ach-grid">
        <div v-for="a in achs" :key="a.name" class="ach-badge" :class="{ got: a.got, locked: !a.got }">
          <div class="ach-icon">{{ a.icon }}</div>
          <div class="ach-name">{{ a.name }}</div>
          <div class="ach-desc">{{ a.desc }}</div>
          <div class="ach-state">{{ a.got ? '已解锁' : '未解锁' }}</div>
        </div>
      </div>
    </div>
  `
};
