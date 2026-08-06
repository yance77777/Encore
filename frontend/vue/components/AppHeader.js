/* 余响 Encore v1.0.0 · 顶部导航组件 */
import { toggleTheme, toast } from '../store.js';

export default {
  name: 'AppHeader',
  props: {
    active: { type: String, default: '' }
  },
  data() {
    return {
      open: false,
      navs: [
        { key: 'home', name: '首页', href: 'index.html' },
        { key: 'map', name: '场馆地图', href: 'map.html' },
        { key: 'tours', name: '巡演档案', href: 'tours.html' },
        { key: 'gallery', name: '收藏展览', href: 'gallery.html' },
        { key: 'identity', name: '粉丝身份', href: 'identity.html' },
        { key: 'meet', name: '见面', href: 'meet.html' },
        { key: 'expense', name: '账单', href: 'expense.html' },
        { key: 'member', name: '会员', href: 'member.html' }
      ]
    };
  },
  mounted() {
    this._onKey = (e) => { if (e.key === 'Escape') this.closeNav(); };
    document.addEventListener('keydown', this._onKey);
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this._onKey);
    document.body.classList.remove('no-scroll');
  },
  methods: {
    toggleTheme,
    toggleNav() {
      this.open = !this.open;
      document.body.classList.toggle('no-scroll', this.open);
    },
    closeNav() {
      this.open = false;
      document.body.classList.remove('no-scroll');
    },
    onMemberClick() {
      if (this.active === 'member') {
        toast('已为你预留 Pro 会员席位');
      }
    }
  },
  template: `
    <header>
      <div class="wrap nav">
        <a href="index.html" class="logo" @click="closeNav">
          <img src="assets/icons/app-icon-v2-dust-light.jpg" class="logo-icon light-only" alt="余响">
          <img src="assets/icons/app-icon-v2-dust.jpg" class="logo-icon dark-only" alt="余响">
          余响 <span class="logo-en">Encore</span>
        </a>
        <ul class="nav-links" :class="{ open }">
          <li v-for="nav in navs" :key="nav.key">
            <a :href="nav.href" :class="{ active: nav.key === active }" @click="closeNav">{{ nav.name }}</a>
          </li>
        </ul>
        <button class="nav-toggle" :class="{ open }" aria-label="菜单" @click="toggleNav">
          <span></span><span></span><span></span>
        </button>
        <div class="nav-actions">
          <button class="theme-toggle" aria-label="切换主题" @click="toggleTheme">
            <span class="icon-moon">🌙</span><span class="icon-sun">☀</span>
          </button>
          <a v-if="active !== 'member'" class="member-btn" href="member.html" @click="closeNav">开通会员</a>
          <button v-else class="member-btn" @click="onMemberClick">开通会员</button>
        </div>
      </div>
    </header>
  `
};
