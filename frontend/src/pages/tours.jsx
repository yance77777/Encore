/* 余响 Encore v2.0.0 · 巡演档案入口 */
import { createRoot } from 'react-dom/client';
import AppShell from '../components/AppShell.jsx';
import TourArchive from '../components/TourArchive.jsx';
import { initApp, useStore } from '../store.jsx';

function ToursView() {
  const s = useStore();
  return (
    <AppShell active="tours" loading={!s.loaded} error={!!s.error}>
      <div className="wrap">
        <TourArchive />
      </div>
    </AppShell>
  );
}

createRoot(document.getElementById('root')).render(<ToursView />);
initApp();
