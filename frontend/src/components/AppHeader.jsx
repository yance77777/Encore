/* 余响 Encore v0.9.0 · 顶部导航组件 */
import { useEffect, useState } from 'react';
import { toggleTheme, toast } from '../store.jsx';

const NAVS = [
  { key: 'home', name: '首页', href: 'index.html' },
  { key: 'map', name: '场馆地图', href: 'map.html' },
  { key: 'tours', name: '巡演档案', href: 'tours.html' },
  { key: 'gallery', name: '收藏展览', href: 'gallery.html' },
  { key: 'identity', name: '粉丝身份', href: 'identity.html' },
  { key: 'meet', name: '见面', href: 'meet.html' },
  { key: 'expense', name: '账单', href: 'expense.html' },
  { key: 'member', name: '会员', href: 'member.html' }
];

export default function AppHeader({ active = '' }) {
  const [open, setOpen] = useState(false);

  function closeNav() {
    setOpen(false);
    document.body.classList.remove('no-scroll');
  }
  function toggleNav() {
    const next = !open;
    setOpen(next);
    document.body.classList.toggle('no-scroll', next);
  }
  function onMemberClick() {
    if (active === 'member') toast('已为你预留 Pro 会员席位');
  }

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeNav(); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('no-scroll');
    };
  }, []);

  return (
    <header>
      <div className="wrap nav">
        <a href="index.html" className="logo" onClick={closeNav}>
          <img src="assets/icons/app-icon-v2-dust-light.jpg" className="logo-icon light-only" alt="余响" />
          <img src="assets/icons/app-icon-v2-dust.jpg" className="logo-icon dark-only" alt="余响" />
          余响 <span className="logo-en">Encore</span>
        </a>
        <ul className={'nav-links' + (open ? ' open' : '')} id="nav-links">
          {NAVS.map((nav) => (
            <li key={nav.key}>
              <a href={nav.href} className={nav.key === active ? 'active' : ''} aria-current={nav.key === active ? 'page' : undefined} onClick={closeNav}>{nav.name}</a>
            </li>
          ))}
        </ul>
        <button
          className={'nav-toggle' + (open ? ' open' : '')}
          aria-label="菜单"
          aria-expanded={open ? 'true' : 'false'}
          aria-controls="nav-links"
          onClick={toggleNav}
        >
          <span></span><span></span><span></span>
        </button>
        <div className="nav-actions">
          <button className="theme-toggle" aria-label="切换主题" onClick={toggleTheme}>
            <span className="icon-moon">🌙</span><span className="icon-sun">☀</span>
          </button>
          {active !== 'member' ? (
            <a className="member-btn" href="member.html" onClick={closeNav}>开通会员</a>
          ) : (
            <button className="member-btn" onClick={onMemberClick}>开通会员</button>
          )}
        </div>
      </div>
    </header>
  );
}
