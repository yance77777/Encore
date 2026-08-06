/* 余响 Encore v1.0.0 · 页面外壳（导航 + 内容 + 页脚 + Toast） */
import AppHeader from './AppHeader.js';
import AppFooter from './AppFooter.js';
import AppToast from './AppToast.js';

export default {
  name: 'AppShell',
  components: { AppHeader, AppFooter, AppToast },
  props: {
    active: { type: String, default: '' },
    loading: { type: Boolean, default: false },
    error: { type: Boolean, default: false }
  },
  template: `
    <div class="app-shell">
      <app-header :active="active" />
      <main v-if="error">
        <div class="wrap">
          <div class="state-error">
            <div class="ico">!</div>
            <div class="title">数据加载失败</div>
            <div class="desc">请确认数据文件可访问后刷新重试。</div>
          </div>
        </div>
      </main>
      <main v-else-if="loading">
        <div class="wrap">
          <div class="loading-wrap">
            <div class="spinner spinner-lg"></div>
            <span>正在加载数据…</span>
          </div>
        </div>
      </main>
      <main v-else><slot /></main>
      <app-footer />
      <app-toast />
    </div>
  `
};
