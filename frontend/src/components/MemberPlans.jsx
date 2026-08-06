/* 余响 Encore v0.9.0 · 会员套餐 */
import { toast } from '../store.jsx';
import Reveal from '../Reveal.jsx';

const PLANS = [
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
];

export default function MemberPlans() {
  function click(action) {
    if (action === 'trial') toast('当前已是试用版');
    else if (action === 'pro') toast('已为你预留 Pro 会员席位');
    else toast('年费版即将开放');
  }

  return (
    <Reveal className="member-cards">
      {PLANS.map((p) => (
        <div key={p.name} className={'plan' + (p.featured ? ' featured' : '')}>
          <div className="plan-name">{p.name}</div>
          <div className="plan-cn">{p.cn}</div>
          <div className="plan-price"><span className="amt">{p.amt}</span><span className="per">{p.per}</span></div>
          <ul>
            {p.features.map((f, i) => (
              <li key={i} className={f.off ? 'off' : ''}>{f.off ? f.text : f}</li>
            ))}
          </ul>
          <button className="plan-cta" onClick={() => click(p.action)}>{p.cta}</button>
        </div>
      ))}
    </Reveal>
  );
}
