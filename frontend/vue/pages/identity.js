/* 余响 Encore v1.0.0 · 粉丝身份入口 */
import { createApp } from '../../vendor/vue.esm-browser.prod.js';
import AppShell from '../components/AppShell.js';
import SectionHead from '../components/SectionHead.js';
import BiasManager from '../components/BiasManager.js';
import SkinPicker from '../components/SkinPicker.js';
import FanLevel from '../components/FanLevel.js';
import FanStats from '../components/FanStats.js';
import Achievements from '../components/Achievements.js';
import IdentityCardModal from '../components/IdentityCardModal.js';
import { reveal } from '../directives.js';
import { store, initApp } from '../store.js';

const IdentityPage = {
  name: 'IdentityPage',
  components: {
    AppShell, SectionHead, BiasManager, SkinPicker,
    FanLevel, FanStats, Achievements, IdentityCardModal
  },
  data() {
    return { modalOpen: false };
  },
  computed: {
    store() { return store; }
  },
  template: `
    <app-shell active="identity" :loading="!store.loaded" :error="!!store.error">
      <div class="wrap">
        <section id="identity" class="identity-section">
          <section-head
            tag="04 / Fan Identity"
            title="粉丝身份"
            en="Identity"
            desc="单担、双担、三担，搭配专属皮肤，定义你是怎样的粉丝。"
          >
            <button class="btn btn-primary" @click="modalOpen = true">生成身份卡</button>
          </section-head>
          <div class="identity-grid">
            <bias-manager />
            <skin-picker />
          </div>
          <fan-level />
          <fan-stats />
          <achievements />
        </section>
      </div>
      <identity-card-modal v-model:open="modalOpen" />
    </app-shell>
  `
};

const app = createApp(IdentityPage);
app.directive('reveal', reveal);
app.mount('#app');
initApp();
