/* 余响 Encore v2.0.0 · 页面外壳（导航 + 内容 + 页脚 + Toast） */
import AppHeader from './AppHeader.jsx';
import AppFooter from './AppFooter.jsx';
import AppToast from './AppToast.jsx';

export default function AppShell({ active = '', loading = false, error = false, children }) {
  return (
    <div className="app-shell">
      <AppHeader active={active} />
      {error ? (
        <main>
          <div className="wrap">
            <div className="state-error">
              <div className="ico">!</div>
              <div className="title">数据加载失败</div>
              <div className="desc">请确认数据文件可访问后刷新重试。</div>
            </div>
          </div>
        </main>
      ) : loading ? (
        <main>
          <div className="wrap">
            <div className="loading-wrap">
              <div className="spinner spinner-lg"></div>
              <span>正在加载数据…</span>
            </div>
          </div>
        </main>
      ) : (
        <main>{children}</main>
      )}
      <AppFooter />
      <AppToast />
    </div>
  );
}
