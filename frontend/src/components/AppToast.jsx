/* 余响 Encore v2.0.0 · 全局 Toast 组件 */
import { useStore } from '../store.jsx';

export default function AppToast() {
  const s = useStore();
  const cls = ['toast', s.toast.show ? 'show' : '', 'toast-' + s.toast.type].join(' ');
  return (
    <div className={cls} role="status" aria-live="polite">
      <span className="ico"></span>
      <span>{s.toast.msg}</span>
    </div>
  );
}
