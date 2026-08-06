/* 余响 Encore v1.0.0 · 主题皮肤选择器 */
import { store, applySkin } from '../store.js';
import { skinNames } from '../utils.js';

export default {
  name: 'SkinPicker',
  computed: {
    store() { return store; },
    artists() { return store.artists; },
    active() { return store.user.skin || 'jay'; },
    preview() {
      const a = store.artists.find((x) => x.id === this.active);
      return a ? { name: skinNames[this.active] || a.name, color: a.color, color2: a.color2 } : { name: '周杰伦 · 魔幻紫', color: '#5b2c8b', color2: '#9d6cff' };
    }
  },
  methods: {
    apply(id) { applySkin(id); }
  },
  template: `
    <div class="id-card" v-reveal>
      <div class="id-head">
        <div class="id-avatar theme-avatar">皮</div>
        <div>
          <div class="id-name">专属皮肤</div>
          <div class="id-since">SELECT A THEME</div>
        </div>
      </div>
      <p class="skin-desc">选择你本命歌手的主色调，整个App随你而变。</p>
      <div class="skin-row">
        <div
          v-for="a in artists"
          :key="a.id"
          class="skin-chip"
          :class="{ active: a.id === active }"
          :data-id="a.id"
          :style="{ background: 'linear-gradient(160deg,' + a.color + ',' + a.color + '55)' }"
          role="button"
          tabindex="0"
          @click="apply(a.id)"
          @keydown.enter.prevent="apply(a.id)"
          @keydown.space.prevent="apply(a.id)"
        >{{ a.en.slice(0, 6) }}</div>
      </div>
      <div class="theme-preview">
        <div class="tp-label">CURRENT THEME</div>
        <div class="tp-name">{{ preview.name }}</div>
        <div class="tp-color">主色 {{ preview.color }} · 强调 {{ preview.color2 }}</div>
      </div>
    </div>
  `
};
