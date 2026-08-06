/* 余响 Encore v1.0.0 · 首页入口 */
import { createApp } from '../../vendor/vue.esm-browser.prod.js';
import AppShell from '../components/AppShell.js';
import HeroStats from '../components/HeroStats.js';
import HeroTicket from '../components/HeroTicket.js';
import DailyFortune from '../components/DailyFortune.js';
import ModuleNav from '../components/ModuleNav.js';
import { reveal } from '../directives.js';
import { initApp } from '../store.js';

const HomePage = {
  name: 'HomePage',
  components: { AppShell, HeroStats, HeroTicket, DailyFortune, ModuleNav },
  template: `
    <app-shell active="home">
      <div class="wrap">
        <div class="hero">
          <div>
            <div class="hero-eyebrow">v1.0.0 · 演唱会足迹追踪</div>
            <h1>点亮你走过的<br>每一座<span class="accent">舞台</span></h1>
            <p class="lead">记录场馆、收藏专辑、追踪巡演、定制属于你的追星足迹。基于真实巡演数据，从第一场演唱会开始，把每一次心动变成地图上的一束光。</p>
            <hero-stats />
          </div>
          <hero-ticket />
        </div>

        <section style="padding:30px 0 70px">
          <div class="sec-head" v-reveal>
            <div>
              <div class="tag">Explore</div>
              <h2>开启你的 <em>足迹</em></h2>
              <p>从场馆点亮到收藏展览，五个模块拼出你的追星故事。</p>
            </div>
          </div>
          <daily-fortune />
          <module-nav />
        </section>
      </div>
    </app-shell>
  `
};

const app = createApp(HomePage);
app.directive('reveal', reveal);
app.mount('#app');
initApp();
