/* 余响 Encore v0.9.0 · 场馆地图入口 */
import { createRoot } from 'react-dom/client';
import AppShell from '../components/AppShell.jsx';
import SectionHead from '../components/SectionHead.jsx';
import ChinaMap from '../components/ChinaMap.jsx';
import MapProgress from '../components/MapProgress.jsx';
import ProvinceList from '../components/ProvinceList.jsx';
import VenueGrid from '../components/VenueGrid.jsx';
import Reveal from '../Reveal.jsx';
import { initApp, useStore } from '../store.jsx';

function MapView() {
  const s = useStore();
  return (
    <AppShell active="map" loading={!s.loaded} error={!!s.error}>
      <div className="wrap">
        <section id="map">
          <SectionHead
            tag="01 / Venue Map"
            title="场馆地图"
            en="Light Up"
            desc="点击场馆卡片即可点亮，以省份集卡，把你的足迹变成一张专属地图。"
          />
          <ChinaMap />
          <MapProgress />
          <Reveal className="map-layout">
            <ProvinceList />
            <VenueGrid />
          </Reveal>
        </section>
      </div>
    </AppShell>
  );
}

createRoot(document.getElementById('root')).render(<MapView />);
initApp();
