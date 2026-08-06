/* 余响 Encore v2.0.0 · 见面记录弹层 */
import { useEffect, useState } from 'react';
import { useStore, saveMeetRecord, clearMeetRecord, toast } from '../store.jsx';
import { todayStr } from '../utils.js';

export default function MeetModal({ open, target = 'last', onClose }) {
  const s = useStore();
  const [date, setDate] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (open) {
      const m = (target === 'last' ? s.meetDates.lastMeet : s.meetDates.nextMeet) || {};
      setDate(m.date || todayStr());
      setName(m.name || '');
      setError(false);
      setTimeout(() => {
        const el = document.getElementById('meetDateInput');
        if (el) el.focus();
      }, 60);
    }
  }, [open, target]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function save() {
    if (!date) {
      setError(true);
      return;
    }
    const obj = { date };
    if (name.trim()) obj.name = name.trim();
    saveMeetRecord(target, obj);
    onClose();
    toast(target === 'last' ? '已保存上次见面记录' : '已保存下次见面记录');
  }
  function clear() {
    clearMeetRecord(target);
    onClose();
    toast(target === 'last' ? '已清除上次见面记录' : '已清除下次见面记录');
  }

  return (
    <div className={'modal-backdrop' + (open ? ' open' : '')} aria-hidden={open ? 'false' : 'true'} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <button className="modal-close" aria-label="关闭" onClick={onClose}>×</button>
        <div className="modal-title">{target === 'last' ? '设置上次见面' : '设置下次见面'}</div>
        <div className="modal-subtitle">{target === 'last' ? '记录已经发生的那一次相见' : '期待即将到来的重逢'}</div>
        <div className="modal-body">
          <div className={'form-group' + (error ? ' has-error' : '')}>
            <label className="form-label" htmlFor="meetDateInput">日期 <span className="req">*</span></label>
            <input type="date" className="input" id="meetDateInput" value={date} onChange={(e) => setDate(e.target.value)} />
            <div className="form-error">请选择一个日期</div>
            <div className="form-hint">选择见面的日期</div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="meetNameInput">演唱会名称</label>
            <input
              type="text"
              className="input"
              id="meetNameInput"
              placeholder="如：周杰伦嘉年华北京站"
              maxLength={40}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') save(); }}
            />
            <div className="form-hint">可选，便于日后回忆</div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={clear}>清除记录</button>
          <button className="btn btn-secondary" onClick={onClose}>取消</button>
          <button className="btn btn-primary" onClick={save}>保存</button>
        </div>
      </div>
    </div>
  );
}
