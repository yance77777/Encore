/* 余响 Encore v1.0.0 · 首页模块导航卡片 */
export default {
  name: 'ModuleNav',
  data() {
    return {
      modules: [
        { href: 'map.html', tag: '01', name: '场馆地图', en: 'Light Up', desc: '点亮你走过的一座座舞台' },
        { href: 'tours.html', tag: '02', name: '巡演档案', en: 'Archive', desc: '基于真实数据的演唱会场次记录' },
        { href: 'gallery.html', tag: '03', name: '收藏展览', en: 'Collection', desc: '拍下你的实体专辑与周边' },
        { href: 'identity.html', tag: '04', name: '粉丝身份', en: 'Identity', desc: '单担双担三担，定义你是谁' },
        { href: 'member.html', tag: '05', name: '会员体系', en: 'Pro', desc: '解锁全国省份集卡与无限收藏' }
      ]
    };
  },
  methods: {
    go(href) {
      window.location.href = href;
    }
  },
  template: `
    <div class="member-cards" v-reveal>
      <div v-for="m in modules" :key="m.href" class="plan" role="button" tabindex="0" @click="go(m.href)" @keydown.enter.prevent="go(m.href)" @keydown.space.prevent="go(m.href)">
        <div class="plan-name">{{ m.en }}</div>
        <div class="plan-cn">{{ m.name }}</div>
        <p style="color:var(--ink-soft);font-size:13px;margin-bottom:20px">{{ m.desc }}</p>
        <button class="plan-cta">进入 →</button>
      </div>
    </div>
  `
};
