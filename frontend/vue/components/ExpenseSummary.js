/* 余响 Encore v1.0.0 · 账单汇总（总额 + 分类 + 占比环图） */
import { store } from '../store.js';
import { fmtAmount } from '../utils.js';

export default {
  name: 'ExpenseSummary',
  emits: ['add', 'clear'],
  methods: {
    fmtAmount
  },
  computed: {
    store() { return store; },
    totals() {
      const byType = { meet: 0, album: 0, merch: 0 };
      let total = 0;
      store.expenses.forEach((e) => {
        const amt = Number(e.amount) || 0;
        total += amt;
        if (Object.prototype.hasOwnProperty.call(byType, e.type)) byType[e.type] += amt;
      });
      return { total, ...byType };
    },
    segments() {
      const C = 2 * Math.PI * 42;
      const types = [
        { key: 'meet', label: '见面', color: 'var(--neon)' },
        { key: 'album', label: '专辑', color: 'var(--neon-2)' },
        { key: 'merch', label: '周边', color: 'var(--teal)' }
      ];
      const total = this.totals.total || 0;
      let acc = 0;
      return types.map((t) => {
        const value = this.totals[t.key] || 0;
        const len = total ? (value / total) * C : 0;
        const seg = {
          ...t,
          value,
          dash: `${len} ${C - len}`,
          offset: -acc,
          pct: total ? Math.round((value / total) * 100) : 0
        };
        acc += len;
        return seg;
      });
    }
  },
  template: `
    <div class="card card-pad-lg exp-summary" v-reveal>
      <div class="exp-total-wrap">
        <div class="exp-total-label">总消费</div>
        <div class="exp-total">¥<span>{{ totals.total.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) }}</span></div>
      </div>
      <div class="exp-donut-wrap">
        <div class="exp-donut">
          <svg viewBox="0 0 100 100" role="img" aria-label="消费占比">
            <circle class="dn-bg" cx="50" cy="50" r="42"></circle>
            <circle
              v-for="s in segments"
              :key="s.key"
              class="dn-seg"
              cx="50" cy="50" r="42"
              :stroke="s.color"
              :stroke-dasharray="s.dash"
              :stroke-dashoffset="s.offset"
            ></circle>
            <text class="dn-num" x="50" y="47">{{ segments.reduce((a, s) => a + s.value, 0).toLocaleString() }}</text>
            <text class="dn-lab" x="50" y="62">总支出</text>
          </svg>
          <div class="exp-donut-legend">
            <div v-for="s in segments" :key="s.key" class="dn-legend-item">
              <i :style="{ background: s.color }"></i>
              <span>{{ s.label }}</span>
              <b>{{ fmtAmount(s.value) }} · {{ s.pct }}%</b>
            </div>
          </div>
        </div>
      </div>
      <div class="exp-subtotals">
        <div class="stat"><div class="num">{{ fmtAmount(totals.meet) }}</div><div class="label">见面</div></div>
        <div class="stat"><div class="num">{{ fmtAmount(totals.album) }}</div><div class="label">实体专辑</div></div>
        <div class="stat"><div class="num">{{ fmtAmount(totals.merch) }}</div><div class="label">周边</div></div>
      </div>
      <div class="exp-actions">
        <button class="btn btn-primary" @click="$emit('add')">添加消费记录</button>
        <button class="btn btn-secondary" @click="$emit('clear')">清空全部记录</button>
      </div>
    </div>
  `
};
