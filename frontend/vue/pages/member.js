/* 余响 Encore v1.0.0 · 会员体系入口 */
import { createApp } from '../../vendor/vue.esm-browser.prod.js';
import AppShell from '../components/AppShell.js';
import SectionHead from '../components/SectionHead.js';
import MemberPlans from '../components/MemberPlans.js';
import { reveal } from '../directives.js';
import { initApp } from '../store.js';

const MemberPage = {
  name: 'MemberPage',
  components: { AppShell, SectionHead, MemberPlans },
  template: `
    <app-shell active="member">
      <div class="wrap">
        <section id="member" class="member-section">
          <section-head
            tag="05 / Membership"
            title="会员体系"
            en="Pro"
            desc="免费试用核心功能，会员解锁全国省份集卡与无限收藏。"
          />
          <member-plans />
        </section>
      </div>
    </app-shell>
  `
};

const app = createApp(MemberPage);
app.directive('reveal', reveal);
app.mount('#app');
initApp();
