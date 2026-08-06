/* 余响 Encore v1.0.0 · 页面外壳（导航 + 内容 + 页脚 + Toast） */
import AppHeader from './AppHeader.js';
import AppFooter from './AppFooter.js';
import AppToast from './AppToast.js';

export default {
  name: 'AppShell',
  components: { AppHeader, AppFooter, AppToast },
  props: {
    active: { type: String, default: '' }
  },
  template: `
    <div class="app-shell">
      <app-header :active="active" />
      <main><slot /></main>
      <app-footer />
      <app-toast />
    </div>
  `
};
