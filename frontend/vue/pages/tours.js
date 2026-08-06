/* 余响 Encore v1.0.0 · 巡演档案入口 */
import { createApp } from '../../vendor/vue.esm-browser.prod.js';
import AppShell from '../components/AppShell.js';
import TourArchive from '../components/TourArchive.js';
import { reveal } from '../directives.js';
import { store, initApp } from '../store.js';

const ToursPage = {
  name: 'ToursPage',
  components: { AppShell, TourArchive },
  computed: {
    store() { return store; }
  },
  template: `
    <app-shell active="tours" :loading="!store.loaded" :error="!!store.error">
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
