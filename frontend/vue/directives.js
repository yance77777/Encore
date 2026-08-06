/* 余响 Encore v1.0.0 · 自定义指令 */

// v-reveal：滚动进入视口后添加 .in（复用 style.css §18 滚动显现动效）
export const reveal = {
  mounted(el) {
    el.classList.add('reveal');
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('in');
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    el._revealIO = io;
    io.observe(el);
  },
  unmounted(el) {
    if (el._revealIO) {
      el._revealIO.disconnect();
      el._revealIO = null;
    }
  }
};
