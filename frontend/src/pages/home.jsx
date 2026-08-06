/* 余响 Encore v2.0.0 · 首页入口 */
import { createRoot } from 'react-dom/client';
import AppShell from '../components/AppShell.jsx';
import HeroStats from '../components/HeroStats.jsx';
import HeroTicket from '../components/HeroTicket.jsx';
import DailyFortune from '../components/DailyFortune.jsx';
import ModuleNav from '../components/ModuleNav.jsx';
import Reveal from '../Reveal.jsx';
import { initApp, useStore } from '../store.jsx';

function HomeView() {
  useStore();
  return (
    <AppShell active="home">
      <div className="wrap">
        <div className="hero">
          <div>
            <div className="hero-eyebrow">v2.0.0 · 演唱会足迹追踪</div>
            <h1>点亮你走过的<br />每一座<span className="accent">舞台</span></h1>
            <p className="lead">记录场馆、收藏专辑、追踪巡演、定制属于你的追星足迹。基于真实巡演数据，从第一场演唱会开始，把每一次心动变成地图上的一束光。</p>
            <HeroStats />
          </div>
          <HeroTicket />
        </div>

        <section style={{ padding: '30px 0 70px' }}>
          <Reveal className="sec-head">
            <div>
              <div className="tag">Explore</div>
              <h2>开启你的 <em>足迹</em></h2>
              <p>从场馆点亮到收藏展览，五个模块拼出你的追星故事。</p>
            </div>
          </Reveal>
          <DailyFortune />
          <ModuleNav />
        </section>
      </div>
    </AppShell>
  );
}

createRoot(document.getElementById('root')).render(<HomeView />);
initApp();
