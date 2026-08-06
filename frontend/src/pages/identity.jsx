/* 余响 Encore v0.9.0 · 粉丝身份入口 */
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import AppShell from '../components/AppShell.jsx';
import SectionHead from '../components/SectionHead.jsx';
import BiasManager from '../components/BiasManager.jsx';
import SkinPicker from '../components/SkinPicker.jsx';
import FanLevel from '../components/FanLevel.jsx';
import FanStats from '../components/FanStats.jsx';
import Achievements from '../components/Achievements.jsx';
import IdentityCardModal from '../components/IdentityCardModal.jsx';
import { initApp, useStore } from '../store.jsx';

function IdentityView() {
  const s = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <AppShell active="identity" loading={!s.loaded} error={!!s.error}>
      <div className="wrap">
        <section id="identity" className="identity-section">
          <SectionHead
            tag="04 / Fan Identity"
            title="粉丝身份"
            en="Identity"
            desc="单担、双担、三担，搭配专属皮肤，定义你是怎样的粉丝。"
          >
            <button className="btn btn-primary" onClick={() => setModalOpen(true)}>生成身份卡</button>
          </SectionHead>
          <div className="identity-grid">
            <BiasManager />
            <SkinPicker />
          </div>
          <FanLevel />
          <FanStats />
          <Achievements />
        </section>
      </div>
      <IdentityCardModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </AppShell>
  );
}

createRoot(document.getElementById('root')).render(<IdentityView />);
initApp();
