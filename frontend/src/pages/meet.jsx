/* 余响 Encore v2.0.0 · 见面页入口 */
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import AppShell from '../components/AppShell.jsx';
import SectionHead from '../components/SectionHead.jsx';
import MeetCountdown from '../components/MeetCountdown.jsx';
import MeetModal from '../components/MeetModal.jsx';
import { initApp, useStore } from '../store.jsx';

function MeetView() {
  const s = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [target, setTarget] = useState('last');
  return (
    <AppShell active="meet" loading={!s.loaded} error={!!s.error}>
      <div className="wrap">
        <section id="meet" className="meet-section">
          <SectionHead
            tag="06 / Meet Countdown"
            title="见面倒计时"
            en="Encore Meet"
            desc="记录每一次相见，期待下一次重逢。灯光暗下，乐声响起，那是属于你的时刻。"
          />
          <MeetCountdown onOpen={(t) => { setTarget(t); setModalOpen(true); }} />
        </section>
      </div>
      <MeetModal open={modalOpen} target={target} onClose={() => setModalOpen(false)} />
    </AppShell>
  );
}

createRoot(document.getElementById('root')).render(<MeetView />);
initApp();
