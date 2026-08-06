/* 余响 Encore v1.0.0 · 消费记录列表 */
import { store } from '../store.js';
import { fmtAmount, fmtDate } from '../utils.js';

export default {
  name: 'ExpenseList',
  emits: ['add', 'delete'],
  methods: {
    fmtAmount,
    fmtDate
  },
  computed: {
    store() { return store; },
    sorted() {
      return store.expenses.slice().sort((a, b) => {
        if (a.date === b.date) return b.id < a.id ? -1 : 1;
        return b.date < a.date ? -1 : 1;
      });
    }
  },
  methods: {
    typeMeta(type) {
      const map = {
        meet: { label: '见面', badge: 'badge-meet' },
        album: { label: '专辑', badge: 'badge-album' },
        merch: { label: '周边', badge: 'badge-merch' }
      };
      return map[type] || { label: '其他', badge: 'badge-tour' };
    }
  },
  template: `
    <div>
      <div class="exp-list" v-if="sorted.length">
        <div v-for="e in sorted" :key="e.id" class="card exp-item">
          <div class="exp-item-main">
            <span class="badge" :class="typeMeta(e.type).badge">{{ typeMeta(e.type).label }}</span>
            <div class="exp-item-name">{{ e.name }}</div>
            <div class="exp-item-date">{{ fmtDate(e.date) }}</div>
            <div v-if="e.type === 'meet' && (e.location || e.seat)" class="exp-item-meta">
              <i v-if="e.location" class="ico">📍</i><span v-if="e.location">{{ e.location }}</span><template v-if="e.location && e.seat"> · </template><span v-if="e.seat">{{ e.seat }}</span>
            </div>
          </div>
          <div class="exp-item-side">
            <div class="exp-amount">{{ fmtAmount(e.amount) }}</div>
            <button class="btn-icon" :aria-label="'删除' + e.name" @click="$emit('delete', e.id)">✕</button>
          </div>
        </div>
      </div>
      <div v-else class="empty exp-empty">
        <div class="empty-icon">💸</div>
        <div class="empty-title">还没有消费记录</div>
        <div class="empty-text">点击下方按钮，添加你的第一笔记录。</div>
        <div class="empty-cta"><button class="btn btn-primary" @click="$emit('add')">添加消费记录</button></div>
      </div>
    </div>
  `
};
