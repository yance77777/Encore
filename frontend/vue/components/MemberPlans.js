/* 余响 Encore v1.0.0 · 会员套餐 */
import { toast } from '../store.js';

export default {
  name: 'MemberPlans',
  data() {
    return {
      plans: [
        {
          name: 'Trial', cn: '试用版', amt: '¥0', per: '/ 永久', featured: false,
          features: ['本省 + 3 个城市点亮', '收藏 20 张专辑', '基础小卡模板', { off: true, text: '全国省份集卡' }, { off: true, text: '高清导出' }],
          cta: '当前方案', action: 'trial'
        },
        {
          name: 'Pro', cn: '会员版', amt: '¥28', per: '/ 月', featured: true,
          features: ['全国省份无限点亮', '无限收藏展览', '全部小卡模板', '高清足迹导出', '专属皮肤系统'],
          cta: '立即开通', action: 'pro'
        },
        {
          name: 'Annual', cn: '年费版', amt: '¥268', per: '/ 年', featured: false,
          features: ['Pro 全部权益', '年费节省 ¥68', '限定节日皮肤', '优先内测新功能', '专属成就勋章'],
          cta: '即将开放', action: 'annual'
        }
      ]
    };
  },
  methods: {
    click(action) {
      if (action === 'trial') toast('当前已是试用版');
      else if (action === 'pro') toast('已为你预留 Pro 会员席位');
      else toast('年费版即将开放');
    }
  },
  template: `
    <div class="member-cards" v-reveal>
      <div v-for="p in plans" :key="p.name" class="plan" :class="{ featured: p.featured }">
        <div class="plan-name">{{ p.name }}</div>
        <div class="plan-cn">{{ p.cn }}</div>
        <div class="plan-price"><span class="amt">{{ p.amt }}</span><span class="per">{{ p.per }}</span></div>
        <ul>
          <li v-for="(f, i) in p.features" :key="i" :class="{ off: f.off }">{{ f.off ? f.text : f }}</li>
        </ul>
        <button class="plan-cta" @click="click(p.action)">{{ p.cta }}</button>
      </div>
    </div>
  `
};
