/* 余响 Encore v2.0.0 · 收藏展览入口 */
import { createRoot } from 'react-dom/client';
import AppShell from '../components/AppShell.jsx';
import SectionHead from '../components/SectionHead.jsx';
import CollectionRing from '../components/CollectionRing.jsx';
import GalleryShelf from '../components/GalleryShelf.jsx';
import { initApp, useStore } from '../store.jsx';

function GalleryView() {
  const s = useStore();
  return (
    <AppShell active="gallery" loading={!s.loaded} error={!!s.error}>
      <div className="wrap">
        <section id="gallery">
          <SectionHead
            tag="03 / Collection"
            title="收藏展览馆"
            en="Archive"
            desc="拍下你的实体专辑与周边，拼成一面属于你的展览墙。"
          >
            <CollectionRing />
          </SectionHead>
          <GalleryShelf />
        </section>
      </div>
    </AppShell>
  );
}

createRoot(document.getElementById('root')).render(<GalleryView />);
initApp();
