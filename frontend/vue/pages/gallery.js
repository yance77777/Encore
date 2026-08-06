/* 余响 Encore v1.0.0 · 收藏展览入口 */
import { createApp } from '../../vendor/vue.esm-browser.prod.js';
import AppShell from '../components/AppShell.js';
import SectionHead from '../components/SectionHead.js';
import CollectionRing from '../components/CollectionRing.js';
import GalleryShelf from '../components/GalleryShelf.js';
import { reveal } from '../directives.js';
import { initApp } from '../store.js';

const GalleryPage = {
  name: 'GalleryPage',
  components: { AppShell, SectionHead, CollectionRing, GalleryShelf },
  template: `
    <app-shell active="gallery">
      <div class="wrap">
        <section id="gallery">
          <section-head
            tag="03 / Collection"
            title="收藏展览馆"
            en="Archive"
            desc="拍下你的实体专辑与周边，拼成一面属于你的展览墙。"
          >
            <collection-ring />
          </section-head>
          <gallery-shelf />
        </section>
      </div>
    </app-shell>
  `
};

const app = createApp(GalleryPage);
app.directive('reveal', reveal);
app.mount('#app');
initApp();
