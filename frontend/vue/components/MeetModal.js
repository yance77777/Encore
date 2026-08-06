/* 余响 Encore v1.0.0 · 见面记录弹层 */
import { store, saveMeetDates, toast } from '../store.js';
import { todayStr } from '../utils.js';

export default {
  name: 'MeetModal',
  props: {
    open: { type: Boolean, default: false },
    target: { type: String, default: 'last' }
  },
  emits: ['update:open'],
  data() {
    return {
      date: '',
      name: '',
      error: false
    };
  },
  watch: {
    open(val) {
      if (val) {
        this.populate();
        this.$nextTick(() => {
          const el = document.getElementById('meetDateInput');
          if (el) el.focus();
        });
      }
    }
  },
  mounted() {
    this._onKey = (e) => { if (e.key === 'Escape') this.close(); };
    document.addEventListener('keydown', this._onKey);
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this._onKey);
  },
  computed: {
    title() { return this.target === 'last' ? '设置上次见面' : '设置下次见面'; },
    sub() { return this.target === 'last' ? '记录已经发生的那一次相见' : '期待即将到来的重逢'; }
  },
  methods: {
    populate() {
      const m = (this.target === 'last' ? store.meetDates.lastMeet : store.meetDates.nextMeet) || {};
      this.date = m.date || todayStr();
      this.name = m.name || '';
      this.error = false;
    },
    close() {
      this.$emit('update:open', false);
    },
    save() {
      if (!this.date) {
        this.error = true;
        return;
      }
      const obj = { date: this.date };
      if (this.name.trim()) obj.name = this.name.trim();
      if (this.target === 'last') store.meetDates.lastMeet = obj;
      else store.meetDates.nextMeet = obj;
      saveMeetDates();
      this.close();
      toast(this.target === 'last' ? '已保存上次见面记录' : '已保存下次见面记录');
    },
    clear() {
      if (this.target === 'last') store.meetDates.lastMeet = null;
      else store.meetDates.nextMeet = null;
      saveMeetDates();
      this.close();
      toast(this.target === 'last' ? '已清除上次见面记录' : '已清除下次见面记录');
    }
  },
  template: `
    <div class="modal-backdrop" :class="{ open }" :aria-hidden="open ? 'false' : 'true'" @click.self="close">
      <div class="modal">
        <button class="modal-close" aria-label="关闭" @click="close">×</button>
        <div class="modal-title">{{ title }}</div>
        <div class="modal-subtitle">{{ sub }}</div>
        <div class="modal-body">
          <div class="form-group" :class="{ 'has-error': error }">
            <label class="form-label" for="meetDateInput">日期 <span class="req">*</span></label>
            <input type="date" class="input" id="meetDateInput" v-model="date">
            <div class="form-error">请选择一个日期</div>
            <div class="form-hint">选择见面的日期</div>
          </div>
          <div class="form-group">
            <label class="form-label" for="meetNameInput">演唱会名称</label>
            <input type="text" class="input" id="meetNameInput" placeholder="如：周杰伦嘉年华北京站" maxlength="40" v-model="name" @keydown.enter="save">
            <div class="form-hint">可选，便于日后回忆</div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="clear">清除记录</button>
          <button class="btn btn-secondary" @click="close">取消</button>
          <button class="btn btn-primary" @click="save">保存</button>
        </div>
      </div>
    </div>
  `
};
