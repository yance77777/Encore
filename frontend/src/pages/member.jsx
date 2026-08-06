/* 余响 Encore v0.9.0 · 会员体系入口 */
import { createRoot } from 'react-dom/client';
import AppShell from '../components/AppShell.jsx';
import SectionHead from '../components/SectionHead.jsx';
import MemberPlans from '../components/MemberPlans.jsx';
import { initApp, useStore } from '../store.jsx';

function MemberView() {
  const s = useStore();
  return (
    <AppShell active="member" loading={!s.loaded} error={!!s.error}>
      <div className="wrap">
        <section id="member" className="member-section">
          <SectionHead
            tag="05 / Membership"
            title="会员体系"
            en="Pro"
            desc="免费试用核心功能，会员解锁全国省份集卡与无限收藏。"
          />
          <MemberPlans />
        </section>
      </div>
    </AppShell>
  );
}

createRoot(document.getElementById('root')).render(<MemberView />);
initApp();
