/* 余响 Encore v2.0.0 · 账单弹层（添加 / 删除 / 清空） */
import { useEffect, useState } from 'react';
import { useStore, addExpense, deleteExpense, clearExpenses, toast } from '../store.jsx';
import { genId, todayStr } from '../utils.js';

export default function ExpenseModals({ mode = '', deleteId = '', onModeChange }) {
  const s = useStore();
  const [form, setForm] = useState({ type: 'meet', name: '', amount: '', date: todayStr(), location: '', seat: '' });
  const [errors, setErrors] = useState({});
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  useEffect(() => {
    if (mode === 'add') {
      setForm({ type: 'meet', name: '', amount: '', date: todayStr(), location: '', seat: '' });
      setErrors({});
      setTimeout(() => {
        const el = document.getElementById('fName');
        if (el) el.focus();
      }, 60);
    }
    if (mode === 'delete') setPendingDeleteId(deleteId);
  }, [mode, deleteId]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeAll(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  function closeAll() {
    onModeChange('');
    setPendingDeleteId(null);
  }
  function submit(e) {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = true;
    const amount = parseFloat(form.amount);
    if (form.amount === '' || isNaN(amount) || amount <= 0) errs.amount = true;
    if (!form.date) errs.date = true;
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const record = {
      id: genId(),
      type: form.type,
      name: form.name.trim(),
      amount,
      date: form.date
    };
    if (form.type === 'meet') {
      record.location = form.location.trim();
      record.seat = form.seat.trim();
    }
    addExpense(record);
    closeAll();
    toast('已添加消费记录');
  }
  function confirmDelete() {
    if (!pendingDeleteId) return;
    deleteExpense(pendingDeleteId);
    closeAll();
    toast('已删除记录');
  }
  function confirmClear() {
    if (!s.expenses.length) {
      toast('暂无记录可清空');
      closeAll();
      return;
    }
    clearExpenses();
    closeAll();
    toast('已清空全部记录');
  }
  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <div>
      <div className={'modal-backdrop' + (mode === 'add' ? ' open' : '')} aria-hidden={mode === 'add' ? 'false' : 'true'} onClick={(e) => { if (e.target === e.currentTarget) closeAll(); }}>
        <div className="modal">
          <button className="modal-close" aria-label="关闭" onClick={closeAll}>×</button>
          <div className="modal-title">添加消费记录</div>
          <div className="modal-subtitle">记录你的每一笔追星支出</div>
          <div className="modal-body">
            <form onSubmit={submit} autoComplete="off">
              <div className="form-group">
                <label className="form-label" htmlFor="fType">类型 <span className="req">*</span></label>
                <select className="select" id="fType" value={form.type} onChange={(e) => setField('type', e.target.value)}>
                  <option value="meet">见面</option>
                  <option value="album">实体专辑</option>
                  <option value="merch">周边</option>
                </select>
                <div className="form-error">请选择类型</div>
              </div>
              <div className={'form-group' + (errors.name ? ' has-error' : '')}>
                <label className="form-label" htmlFor="fName">名称 <span className="req">*</span></label>
                <input type="text" className="input" id="fName" placeholder="周杰伦嘉年华北京站" maxLength={60} value={form.name} onChange={(e) => setField('name', e.target.value)} />
                <div className="form-error">请输入名称</div>
              </div>
              <div className="form-row">
                <div className={'form-group' + (errors.amount ? ' has-error' : '')}>
                  <label className="form-label" htmlFor="fAmount">金额（¥）<span className="req">*</span></label>
                  <input type="number" className="input" id="fAmount" min="0.01" step="0.01" placeholder="1280" value={form.amount} onChange={(e) => setField('amount', e.target.value)} />
                  <div className="form-error">金额需为正数</div>
                </div>
                <div className={'form-group' + (errors.date ? ' has-error' : '')}>
                  <label className="form-label" htmlFor="fDate">日期 <span className="req">*</span></label>
                  <input type="date" className="input" id="fDate" value={form.date} onChange={(e) => setField('date', e.target.value)} />
                  <div className="form-error">请选择日期</div>
                </div>
              </div>
              {form.type === 'meet' ? (
                <>
                  <div className="form-group">
                    <label className="form-label" htmlFor="fLocation">地点</label>
                    <input type="text" className="input" id="fLocation" placeholder="国家体育场（鸟巢）" maxLength={60} value={form.location} onChange={(e) => setField('location', e.target.value)} />
                    <div className="form-hint">选填，便于日后回忆</div>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="fSeat">区域座位</label>
                    <input type="text" className="input" id="fSeat" placeholder="看台 A3 区 12 排" maxLength={60} value={form.seat} onChange={(e) => setField('seat', e.target.value)} />
                    <div className="form-hint">选填</div>
                  </div>
                </>
              ) : null}
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={closeAll}>取消</button>
                <button type="submit" className="btn btn-primary">保存</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className={'modal-backdrop' + (mode === 'delete' ? ' open' : '')} aria-hidden={mode === 'delete' ? 'false' : 'true'} onClick={(e) => { if (e.target === e.currentTarget) closeAll(); }}>
        <div className="modal modal-sm">
          <div className="modal-title">删除记录</div>
          <div className="modal-body">确定要删除这条消费记录吗？此操作不可撤销。</div>
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={closeAll}>取消</button>
            <button className="btn btn-primary" onClick={confirmDelete}>删除</button>
          </div>
        </div>
      </div>

      <div className={'modal-backdrop' + (mode === 'clear' ? ' open' : '')} aria-hidden={mode === 'clear' ? 'false' : 'true'} onClick={(e) => { if (e.target === e.currentTarget) closeAll(); }}>
        <div className="modal modal-sm">
          <div className="modal-title">清空全部记录</div>
          <div className="modal-body">确定要清空所有消费记录吗？此操作不可撤销，数据将无法恢复。</div>
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={closeAll}>取消</button>
            <button className="btn btn-primary" onClick={confirmClear}>清空</button>
          </div>
        </div>
      </div>
    </div>
  );
}
