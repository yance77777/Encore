/* 余响 Encore v1.0.0 · 粉丝身份卡弹层（可复制分享） */
import { store, getFanLevel, checkAchievements, toast } from '../store.js';
import { skinNames } from '../utils.js';

export default {
  name: 'IdentityCardModal',
  props: {
    open: { type: Boolean, default: false }
  },
  emits: ['update:open'],
  computed: {
    store() { return store; },
    idc() {
      const checkins = store.user.checkins || [];
      const litVenuesSet = new Set(checkins.map((c) => c.venueId));
      const litProvSet = new Set(store.venues.filter((v) => litVenuesSet.has(v.id)).map((v) => v.provinceShort));
      const { cur } = getFanLevel(checkins.length);
      const achs = checkAchievements();
      const gotAch = achs.filter((a) => a.got).length;
      const since = store.user.since || new Date().getFullYear().toString();
      const years = Math.max(0, new Date().getFullYear() - (+since));
      const nickname = store.user.nickname || '追光者';
      const danType = (store.user.bias && store.user.bias.type) || 1;
      const biases = ((store.user.bias && Array.isArray(store.user.bias.list)) ? store.user.bias.list : []).slice(0, danType)
        .map((id) => { const a = store.artists.find((x) => x.id === id); return a ? a.name : id; })
        .join(' / ') || '未设置';
      const skinA = store.artists.find((a) => a.id === store.user.skin);
      const skinName = skinNames[store.user.skin] || (skinA ? skinA.name : '默认');
      const cntMap = {};
      checkins.forEach((c) => { cntMap[c.artistId] = (cntMap[c.artistId] || 0) + 1; });
      const topEntry = Object.entries(cntMap).sort((a, b) => b[1] - a[1])[0];
      const topArtist = topEntry ? store.artists.find((a) => a.id === topEntry[0]) : null;
      const topN = topEntry ? topEntry[1] : 0;
      return { checkins, litVenues: litVenuesSet.size, litProvs: litProvSet.size, cur, gotAch, totalAch: achs.length, since, years, nickname, biases, skinName, topArtist, topN, collections: (store.stats && store.stats.totalCollections) || 0 };
    }
  },
  mounted() {
    this._onKey = (e) => { if (e.key === 'Escape') this.close(); };
    document.addEventListener('keydown', this._onKey);
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this._onKey);
  },
  methods: {
    close() {
      this.$emit('update:open', false);
    },
    copyText() {
      const d = this.idc;
      const text = `【余响 Encore · 粉丝身份卡】
${d.nickname} · SINCE ${d.since} · 粉龄 ${d.years} 年
等级：Lv.${d.cur.lv} ${d.cur.name}
本命：${d.biases}
观演 ${d.checkins.length} 场 · 点亮 ${d.litVenues} 场馆 · 收藏 ${d.collections} 件
成就 ${d.gotAch}/${d.totalAch} 已解锁`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => toast('身份卡文案已复制', 'success')).catch(() => this.fallbackCopy(text));
      } else {
        this.fallbackCopy(text);
      }
    },
    fallbackCopy(text) {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        toast('身份卡文案已复制', 'success');
      } catch (e) {
        toast('复制失败，请手动选择文本', 'error');
      }
    }
  },
  template: `
    <div class="modal-backdrop" :class="{ open }" aria-hidden="true" @click.self="close">
      <div class="modal" role="dialog" aria-modal="true" aria-label="粉丝身份卡">
        <button class="modal-close" aria-label="关闭" @click="close">×</button>
        <div class="modal-title">粉丝身份卡</div>
        <div class="modal-subtitle">FAN IDENTITY CARD · 可复制分享</div>
        <div class="modal-body">
          <div class="idc-card">
            <div class="idc-top">
              <div class="idc-avatar">{{ (idc.nickname || '粉').slice(0, 1) }}</div>
              <div class="idc-id">
                <div class="idc-nick">{{ idc.nickname }}</div>
                <div class="idc-since">SINCE {{ idc.since }} · 粉龄 {{ idc.years }} 年</div>
              </div>
              <div class="idc-lv">Lv.{{ idc.cur.lv }}</div>
            </div>
            <div class="idc-tier">{{ idc.cur.name }}</div>
            <div class="idc-stats">
              <div><span class="idc-num">{{ idc.checkins.length }}</span><span class="idc-lab">观演</span></div>
              <div><span class="idc-num">{{ idc.litVenues }}</span><span class="idc-lab">场馆</span></div>
              <div><span class="idc-num">{{ idc.litProvs }}</span><span class="idc-lab">省份</span></div>
              <div><span class="idc-num">{{ idc.collections }}</span><span class="idc-lab">收藏</span></div>
              <div><span class="idc-num">{{ idc.gotAch }}/{{ idc.totalAch }}</span><span class="idc-lab">成就</span></div>
            </div>
            <div class="idc-row"><span>本命</span><strong>{{ idc.biases }}</strong></div>
            <div v-if="idc.topArtist" class="idc-row"><span>最常看</span><strong>{{ idc.topArtist.name }} · {{ idc.topN }} 场</strong></div>
            <div class="idc-row"><span>主题</span><strong>{{ idc.skinName }}</strong></div>
            <div class="idc-foot">余响 Encore · 演唱会足迹追踪</div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="close">关闭</button>
          <button class="btn btn-primary" @click="copyText">复制文案</button>
        </div>
      </div>
    </div>
  `
};
