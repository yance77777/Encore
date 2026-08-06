/* 余响 Encore v1.0.0 · 巡演档案入口 */
import { createApp } from '../../vendor/vue.esm-browser.prod.js';
import AppShell from '../components/AppShell.js';
import TourArchive from '../components/TourArchive.js';
import { reveal } from '../directives.js';
import { initApp } from '../store.js';

const ToursPage = {
  name: 'ToursPage',
  components: { AppShell, TourArchive },
  template: `
    <app-shell active="tours">
      <div class="wrap">
        <tour-archive />
      </div>
    </app-shell>
  `
};

const app = createApp(ToursPage);
app.directive('reveal', reveal);
app.mount('#app');
initApp();
