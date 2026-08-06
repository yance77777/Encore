/* 余响 Encore v1.0.0 · 本命管理（单担/双担/三担） */
import { store, setDan, addBias, removeBias } from '../store.js';

export default {
  name: 'BiasManager',
  computed: {
    store() { return store; },
    bias() {
      if (!store.user.bias) store.user.bias = { type: store.curDan, list: [] };
      if (!Array.isArray(store.user.bias.list)) store.user.bias.list = [];
      return store.user.bias;
    },
    show() {
      return this.bias.list.slice(0, this.bias.type).map((id) => {
        const a = store.artists.find((x) => x.id === id);
        return a ? { id, a } : null;
      }).filter(Boolean);
    },
    rest() {
      return store.artists.filter((a) => !this.bias.list.includes(a.id));
    },
    headArtist() {
      const first = this.bias.list[0];
      return first ? store.artists.find((a) => a.id === first) || null : null;
    },
    since() {
      return store.user.since || new Date().getFullYear().toString();
    },
    years() {
      return Math.max(0, new Date().getFullYear() - (+this.since));
    },
    danName() {
      return this.bias.type === 1 ? '单担' : (this.bias.type === 2 ? '双担' : '三担');
    }
  },
  methods: {
    setDan(type) { setDan(type); },
    add(id) { addBias(id); },
    remove(id) { removeBias(id); },
    checkinCount(id) {
      return (store.user.checkins || []).filter((c) => c.artistId === id).length;
    },
    pct(i) {
      const len = this.show.length;
      return len === 1 ? 100 : Math.round(100 * (len - i) / (len * (len + 1) / 2));
    }
  },
  template: `
    <div class="id-card" v-reveal>
      <div class="id-head">
        <div class="id-avatar" :style="headArtist ? { background: 'linear-gradient(135deg, ' + headArtist.color + ', ' + headArtist.color2 + ')', boxShadow: '0 8px 20px -8px ' + headArtist.color } : {}">{{ headArtist ? headArtist.initial : '粉' }}</div>
        <div>
          <div class="id-name">{{ headArtist ? headArtist.name : '尚未选择本命' }}</div>
          <div class="id-since">SINCE {{ since }} · 粉龄 {{ years }} 年</div>
        </div>
      </div>
      <div class="dan-toggle">
        <button :class="{ active: bias.type === 1 }" data-dan="1" @click="setDan(1)">单担</button>
        <button :class="{ active: bias.type === 2 }" data-dan="2" @click="setDan(2)">双担</button>
        <button :class="{ active: bias.type === 3 }" data-dan="3" @click="setDan(3)">三担</button>
      </div>
      <div class="bias-list">
        <div v-for="(item, i) in show" :key="item.id" class="bias-row" :data-bias="item.id">
          <div class="bias-pic" :style="{ background: item.a.color + '33', color: item.a.color2, border: '1px solid ' + item.a.color }">{{ item.a.initial }}</div>
          <div class="bias-info">
            <div class="bias-name">{{ item.a.name }}</div>
            <div class="bias-stat">看 {{ checkinCount(item.id) }} 场 · 出道 {{ item.a.debut }}</div>
            <div class="bias-bar"><div class="bias-bar-fill" :style="{ width: pct(i) + '%' }"></div></div>
          </div>
          <button class="bias-remove" :data-remove="item.id" :aria-label="'移除' + item.a.name" title="移除" @click="remove(item.id)">×</button>
        </div>

        <div v-if="show.length < bias.type" class="bias-add-row">
          <div class="bias-add-label">{{ bias.list.length === 0 ? '请选择你喜欢的歌手作为本命（当前' + danName + '，可选 ' + bias.type + ' 位）' : '添加本命 · 还差 ' + (bias.type - show.length) + ' 位' }}</div>
          <div class="bias-add-chips">
            <button
              v-for="a in rest"
              :key="a.id"
              class="bias-add-chip"
              :data-add="a.id"
              :style="{ background: a.color + '22', color: a.color2, border: '1px solid ' + a.color + '66' }"
              @click="add(a.id)"
            >{{ a.initial }} {{ a.name }}</button>
          </div>
        </div>
      </div>
    </div>
  `
};
