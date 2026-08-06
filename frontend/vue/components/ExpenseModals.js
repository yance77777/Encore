/* 余响 Encore v1.0.0 · 账单弹层（添加 / 删除 / 清空） */
import { store, saveExpenses, toast } from '../store.js';
import { genId, todayStr } from '../utils.js';

export default {
  name: 'ExpenseModals',
  props: {
    mode: { type: String, default: '' }, // '' | 'add' | 'delete' | 'clear'
    deleteId: { type: String, default: '' }
  },
  emits: ['update:mode'],
  data() {
    return {
      form: { type: 'meet', name: '', amount: '', date: '', location: '', seat: '' },
      errors: {},
      pendingDeleteId: null
    };
  },
  watch: {
    mode(val) {
      if (val === 'add') {
        this.resetForm();
        this.$nextTick(() => {
          const el = document.getElementById('fName');
          if (el) el.focus();
        });
      }
      if (val === 'delete') this.pendingDeleteId = this.deleteId;
    }
  },
  mounted() {
    this._onKey = (e) => { if (e.key === 'Escape') this.closeAll(); };
    document.addEventListener('keydown', this._onKey);
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this._onKey);
  },
  computed: {
    isMeet() { return this.form.type === 'meet'; }
  },
  methods: {
    resetForm() {
      this.form = { type: 'meet', name: '', amount: '', date: todayStr(), location: '', seat: '' };
      this.errors = {};
    },
    setMode(m) {
      this.$emit('update:mode', m);
    },
    closeAll() {
      this.setMode('');
      this.pendingDeleteId = null;
    },
    showError(field) {
      this.errors = { ...this.errors, [field]: true };
    },
    submit() {
      const errors = {};
      if (!this.form.name.trim()) errors.name = true;
      const amount = parseFloat(this.form.amount);
      if (this.form.amount === '' || isNaN(amount) || amount <= 0) errors.amount = true;
      if (!this.form.date) errors.date = true;
      this.errors = errors;
      if (Object.keys(errors).length) return;

      const record = {
        id: genId(),
        type: this.form.type,
        name: this.form.name.trim(),
        amount,
        date: this.form.date
      };
      if (this.form.type === 'meet') {
        record.location = this.form.location.trim();
        record.seat = this.form.seat.trim();
      }
      store.expenses.push(record);
      saveExpenses();
      this.setMode('');
      toast('已添加消费记录');
    },
    confirmDelete() {
      if (!this.pendingDeleteId) return;
      store.expenses = store.expenses.filter((e) => e.id !== this.pendingDeleteId);
      saveExpenses();
      this.setMode('');
      this.pendingDeleteId = null;
      toast('已删除记录');
    },
    confirmClear() {
      if (!store.expenses.length) {
        toast('暂无记录可清空');
        this.setMode('');
        return;
      }
      store.expenses = [];
      saveExpenses();
      this.setMode('');
      toast('已清空全部记录');
    }
  },
  template: `
    <div>
      <!-- 添加消费 -->
      <div class="modal-backdrop" :class="{ open: mode === 'add' }" :aria-hidden="mode === 'add' ? 'false' : 'true'" @click.self="closeAll">
        <div class="modal">
          <button class="modal-close" aria-label="关闭" @click="closeAll">×</button>
          <div class="modal-title">添加消费记录</div>
          <div class="modal-subtitle">记录你的每一笔追星支出</div>
          <div class="modal-body">
            <form @submit.prevent="submit" autocomplete="off">
              <div class="form-group">
                <label class="form-label" for="fType">类型 <span class="req">*</span></label>
                <select class="select" id="fType" v-model="form.type">
                  <option value="meet">见面</option>
                  <option value="album">实体专辑</option>
                  <option value="merch">周边</option>
                </select>
                <div class="form-error">请选择类型</div>
              </div>
              <div class="form-group" :class="{ 'has-error': errors.name }">
                <label class="form-label" for="fName">名称 <span class="req">*</span></label>
                <input type="text" class="input" id="fName" placeholder="周杰伦嘉年华北京站" maxlength="60" v-model="form.name">
                <div class="form-error">请输入名称</div>
              </div>
              <div class="form-row">
                <div class="form-group" :class="{ 'has-error': errors.amount }">
                  <label class="form-label" for="fAmount">金额（¥）<span class="req">*</span></label>
                  <input type="number" class="input" id="fAmount" min="0.01" step="0.01" placeholder="1280" v-model="form.amount">
                  <div class="form-error">金额需为正数</div>
                </div>
                <div class="form-group" :class="{ 'has-error': errors.date }">
                  <label class="form-label" for="fDate">日期 <span class="req">*</span></label>
                  <input type="date" class="input" id="fDate" v-model="form.date">
                  <div class="form-error">请选择日期</div>
                </div>
              </div>
              <template v-if="isMeet">
                <div class="form-group">
                  <label class="form-label" for="fLocation">地点</label>
                  <input type="text" class="input" id="fLocation" placeholder="国家体育场（鸟巢）" maxlength="60" v-model="form.location">
                  <div class="form-hint">选填，便于日后回忆</div>
                </div>
                <div class="form-group">
                  <label class="form-label" for="fSeat">区域座位</label>
                  <input type="text" class="input" id="fSeat" placeholder="看台 A3 区 12 排" maxlength="60" v-model="form.seat">
                  <div class="form-hint">选填</div>
                </div>
              </template>
              <div class="modal-footer">
                <button type="button" class="btn btn-ghost" @click="closeAll">取消</button>
                <button type="submit" class="btn btn-primary">保存</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- 删除单条 -->
      <div class="modal-backdrop" :class="{ open: mode === 'delete' }" :aria-hidden="mode === 'delete' ? 'false' : 'true'" @click.self="closeAll">
        <div class="modal modal-sm">
          <div class="modal-title">删除记录</div>
          <div class="modal-body">确定要删除这条消费记录吗？此操作不可撤销。</div>
          <div class="modal-footer">
            <button class="btn btn-ghost" @click="closeAll">取消</button>
            <button class="btn btn-primary" @click="confirmDelete">删除</button>
          </div>
        </div>
      </div>

      <!-- 清空全部 -->
      <div class="modal-backdrop" :class="{ open: mode === 'clear' }" :aria-hidden="mode === 'clear' ? 'false' : 'true'" @click.self="closeAll">
        <div class="modal modal-sm">
          <div class="modal-title">清空全部记录</div>
          <div class="modal-body">确定要清空所有消费记录吗？此操作不可撤销，数据将无法恢复。</div>
          <div class="modal-footer">
            <button class="btn btn-ghost" @click="closeAll">取消</button>
            <button class="btn btn-primary" @click="confirmClear">清空</button>
          </div>
        </div>
      </div>
    </div>
  `
};
