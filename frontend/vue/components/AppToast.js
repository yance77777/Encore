/* 余响 Encore v1.0.0 · 全局 Toast 组件 */
import { store } from '../store.js';

export default {
  name: 'AppToast',
  computed: {
    store() { return store; },
    toastClass() {
      return {
        show: store.toast.show,
        'toast-success': store.toast.type === 'success',
        'toast-error': store.toast.type === 'error',
        'toast-info': store.toast.type === 'info',
        'toast-warning': store.toast.type === 'warning'
      };
    }
  },
  template: `
    <div class="toast" :class="toastClass" role="status" aria-live="polite"><span class="ico"></span><span>{{ store.toast.msg }}</span></div>
  `
};
