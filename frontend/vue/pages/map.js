/* 余响 Encore v1.0.0 · 场馆地图入口 */
import { createApp } from '../../vendor/vue.esm-browser.prod.js';
import AppShell from '../components/AppShell.js';
import SectionHead from '../components/SectionHead.js';
import ChinaMap from '../components/ChinaMap.js';
import MapProgress from '../components/MapProgress.js';
import ProvinceList from '../components/ProvinceList.js';
import VenueGrid from '../components/VenueGrid.js';
import { reveal } from '../directives.js';
import { initApp } from '../store.js';

const MapPage = {
  name: 'MapPage',
  components: { AppShell, SectionHead, ChinaMap, MapProgress, ProvinceList, VenueGrid },
  template: `
    <app-shell active="map">
      <div class="wrap">
        <section id="map">
          <section-head
            tag="01 / Venue Map"
            title="场馆地图"
            en="Light Up"
            desc="点击场馆卡片即可点亮，以省份集卡，把你的足迹变成一张专属地图。"
          />
          <china-map />
          <map-progress />
          <div class="map-layout" v-reveal>
            <province-list />
            <venue-grid />
          </div>
        </section>
      </div>
    </app-shell>
  `
};

const app = createApp(MapPage);
app.directive('reveal', reveal);
app.mount('#app');
initApp();
