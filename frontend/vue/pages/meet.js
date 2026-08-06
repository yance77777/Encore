/* 余响 Encore v1.0.0 · 见面页入口 */
import { createApp } from '../../vendor/vue.esm-browser.prod.js';
import AppShell from '../components/AppShell.js';
import SectionHead from '../components/SectionHead.js';
import MeetCountdown from '../components/MeetCountdown.js';
import MeetModal from '../components/MeetModal.js';
import { reveal } from '../directives.js';
import { initApp } from '../store.js';

const MeetPage = {
  name: 'MeetPage',
  components: { AppShell, SectionHead, MeetCountdown, MeetModal },
  data() {
    return {
      modalOpen: false,
      target: 'last'
    };
  },
  methods: {
    openModal(target) {
      this.target = target;
      this.modalOpen = true;
    }
  },
  template: `
    <app-shell active="meet">
      <div class="wrap">
        <section id="meet" class="meet-section">
          <section-head
            tag="06 / Meet Countdown"
            title="见面倒计时"
            en="Encore Meet"
            desc="记录每一次相见，期待下一次重逢。灯光暗下，乐声响起，那是属于你的时刻。"
          />
          <meet-countdown @open="openModal" />
        </section>
      </div>
      <meet-modal v-model:open="modalOpen" :target="target" />
    </app-shell>
  `
};

const app = createApp(MeetPage);
app.directive('reveal', reveal);
app.mount('#app');
initApp();
