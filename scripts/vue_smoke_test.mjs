/* 余响 Encore v1.0.0 · Vue 重构冒烟测试
 * 启动无头 Chrome（CDP），逐页加载并检查：
 * 1) 控制台异常 / 错误日志
 * 2) 关键 DOM 标记是否存在
 * 3) 核心交互是否可用
 * 4) 输出页面截图
 * 用法：node scripts/vue_smoke_test.mjs
 */

import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const CHROME = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = process.env.SMOKE_BASE || 'http://127.0.0.1:3000';
const PORT = Number(process.env.SMOKE_PORT || 9223);
const OUT_DIR = process.env.SMOKE_OUT || 'test-screenshots';

const PAGES = [
  { file: 'index.html', markers: ['.hero h1', '.ticket-card', '.fortune-card', '.member-cards .plan'] },
  { file: 'map.html', markers: ['.cmp-prov', '.venue-card', '.map-progress', '.province-list .prov'] },
  { file: 'tours.html', markers: ['.tour-table tbody tr', '.af-chip', '.tour-summary'] },
  { file: 'gallery.html', markers: ['.album-card', '.gallery-tabs .gtab', '.collection-ring'] },
  { file: 'identity.html', markers: ['.id-card', '.skin-chip', '.fl-card', '.ach-badge', '.fs-card'] },
  { file: 'member.html', markers: ['.plan'] },
  { file: 'meet.html', markers: ['.meet-card', '.meet-grid'] },
  { file: 'expense.html', markers: ['.exp-summary', '.exp-donut', '.exp-list, .exp-empty'] }
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.listeners = new Map();
  }
  static async connect(url) {
    const ws = new WebSocket(url);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });
    const cdp = new CDP(ws);
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id) {
        const p = cdp.pending.get(msg.id);
        if (!p) return;
        cdp.pending.delete(msg.id);
        if (msg.error) p.reject(new Error(JSON.stringify(msg.error)));
        else p.resolve(msg.result);
        return;
      }
      const fns = cdp.listeners.get(msg.method) || [];
      fns.forEach((fn) => fn(msg));
    };
    return cdp;
  }
  send(method, params = {}, sessionId) {
    const id = ++this.id;
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    this.ws.send(JSON.stringify(payload));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }
  on(method, fn) {
    const arr = this.listeners.get(method) || [];
    arr.push(fn);
    this.listeners.set(method, arr);
  }
}

async function getJson(path) {
  const r = await fetch(`http://127.0.0.1:${PORT}${path}`);
  return r.json();
}

function waitForLoad(cdp, sessionId, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const fn = (msg) => {
      if (msg.sessionId === sessionId) {
        clearTimeout(timer);
        const fns = cdp.listeners.get('Page.loadEventFired') || [];
        const idx = fns.indexOf(fn);
        if (idx >= 0) fns.splice(idx, 1);
        resolve();
      }
    };
    const timer = setTimeout(() => {
      const fns = cdp.listeners.get('Page.loadEventFired') || [];
      const idx = fns.indexOf(fn);
      if (idx >= 0) fns.splice(idx, 1);
      reject(new Error('load timeout'));
    }, timeout);
    cdp.on('Page.loadEventFired', fn);
  });
}

async function evalIn(cdp, sessionId, expression) {
  const res = await cdp.send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true
  }, sessionId);
  if (res.exceptionDetails) throw new Error(JSON.stringify(res.exceptionDetails));
  return res.result ? res.result.value : undefined;
}

async function screenshot(cdp, sessionId, name) {
  const res = await cdp.send('Page.captureScreenshot', { format: 'png' }, sessionId);
  if (res && res.data) {
    await writeFile(join(OUT_DIR, name + '.png'), Buffer.from(res.data, 'base64'));
  }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const chrome = spawn(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--disable-extensions',
    '--remote-debugging-port=' + PORT,
    '--user-data-dir=' + join(process.env.TEMP, 'encore-cdp-' + Date.now()),
    'about:blank'
  ], { stdio: 'ignore' });

  let version;
  for (let i = 0; i < 30; i++) {
    try {
      version = await getJson('/json/version');
      break;
    } catch (e) {
      await sleep(500);
    }
  }
  if (!version) {
    chrome.kill();
    throw new Error('Chrome CDP 未就绪');
  }

  const cdp = await CDP.connect(version.webSocketDebuggerUrl);
  const summary = [];

  try {
    for (const page of PAGES) {
      const errors = [];
      const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
      const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
      await cdp.send('Page.enable', {}, sessionId);
      await cdp.send('Runtime.enable', {}, sessionId);
      await cdp.send('Log.enable', {}, sessionId);
      await cdp.send('Network.enable', {}, sessionId);

      const onException = (msg) => {
        if (msg.sessionId !== sessionId) return;
        const d = msg.params.exceptionDetails;
        errors.push('exception: ' + (d.exception ? d.exception.description : d.text));
      };
      const onConsole = (msg) => {
        if (msg.sessionId !== sessionId) return;
        const p = msg.params;
        if (p.type === 'error') {
          errors.push('console.error: ' + (p.args || []).map((a) => a.value || a.description || '').join(' '));
        }
      };
      const onLog = (msg) => {
        if (msg.sessionId !== sessionId) return;
        const p = msg.params;
        if (p.entry && p.entry.level === 'error') errors.push('log: ' + p.entry.text);
      };
      const onResponse = (msg) => {
        if (msg.sessionId !== sessionId) return;
        const r = msg.params.response;
        if (r && r.status >= 400) errors.push(`http ${r.status}: ${r.url}`);
      };
      cdp.on('Runtime.exceptionThrown', onException);
      cdp.on('Runtime.consoleAPICalled', onConsole);
      cdp.on('Log.entryAdded', onLog);
      cdp.on('Network.responseReceived', onResponse);

      const loaded = waitForLoad(cdp, sessionId);
      await cdp.send('Page.navigate', { url: `${BASE}/${page.file}` }, sessionId);
      await loaded;
      await sleep(3500);

      const markers = {};
      for (const sel of page.markers) {
        const expr = sel.includes(',')
          ? `Array.from(document.querySelectorAll('${sel}')).length`
          : `document.querySelectorAll('${sel}').length`;
        markers[sel] = await evalIn(cdp, sessionId, expr);
      }
      const appHtml = await evalIn(cdp, sessionId, `document.getElementById('app') ? document.getElementById('app').innerHTML.length : -1`);
      const title = await evalIn(cdp, sessionId, `document.title`);
      const visual = await evalIn(cdp, sessionId, `(function(){
        const cs = getComputedStyle(document.body);
        const root = getComputedStyle(document.documentElement);
        const cards = Array.from(document.querySelectorAll('.card, .venue-card, .album-card, .plan, .id-card')).map(function(el){
          const r = el.getBoundingClientRect();
          return { w: Math.round(r.width), h: Math.round(r.height) };
        }).filter(function(b){ return b.w > 0 && b.h > 0; });
        return {
          bodyBg: cs.backgroundColor,
          gold: root.getPropertyValue('--gold').trim(),
          ink: root.getPropertyValue('--ink').trim(),
          themeMain: root.getPropertyValue('--theme-main').trim(),
          overflowX: document.documentElement.scrollWidth > window.innerWidth,
          visibleCards: cards.length
        };
      })()`);

      let interaction = null;
      try {
        if (page.file === 'index.html') {
          interaction = await evalIn(cdp, sessionId, `(function(){
            document.querySelector('.theme-toggle').click();
            const dark = document.documentElement.classList.contains('dark');
            document.querySelector('.ticket-actions button').click();
            return { dark };
          })()`);
        } else if (page.file === 'map.html') {
          interaction = await evalIn(cdp, sessionId, `(function(){
            const card = document.querySelector('.venue-card');
            const before = document.querySelectorAll('.venue-card.lit').length;
            if (card) card.click();
            return new Promise(function(resolve){
              setTimeout(function(){ resolve({ before, after: document.querySelectorAll('.venue-card.lit').length }); }, 700);
            });
          })()`);
        } else if (page.file === 'tours.html') {
          interaction = await evalIn(cdp, sessionId, `(function(){
            const chips = document.querySelectorAll('.af-chip');
            const before = document.querySelectorAll('.tour-table tbody tr').length;
            if (chips[1]) chips[1].click();
            return new Promise(function(resolve){
              setTimeout(function(){ resolve({ before, after: document.querySelectorAll('.tour-table tbody tr').length }); }, 400);
            });
          })()`);
        } else if (page.file === 'gallery.html') {
          interaction = await evalIn(cdp, sessionId, `(function(){
            const card = document.querySelector('.album-card');
            const before = document.querySelectorAll('.album-card.collected').length;
            if (card) card.click();
            return new Promise(function(resolve){
              setTimeout(function(){ resolve({ before, after: document.querySelectorAll('.album-card.collected').length }); }, 400);
            });
          })()`);
        } else if (page.file === 'identity.html') {
          interaction = await evalIn(cdp, sessionId, `(function(){
            const chip = document.querySelector('.skin-chip');
            if (chip) chip.click();
            const btn = document.querySelector('.sec-head .btn-primary');
            if (btn) btn.click();
            return new Promise(function(resolve){
              setTimeout(function(){ resolve({ modalOpen: document.querySelector('.modal-backdrop.open') !== null }); }, 400);
            });
          })()`);
        } else if (page.file === 'member.html') {
          interaction = await evalIn(cdp, sessionId, `(function(){
            const btn = document.querySelector('.plan-cta');
            if (btn) btn.click();
            return new Promise(function(resolve){
              setTimeout(function(){ resolve({ toastShow: document.querySelector('.toast.show') !== null }); }, 300);
            });
          })()`);
        } else if (page.file === 'meet.html') {
          interaction = await evalIn(cdp, sessionId, `(function(){
            const btn = document.querySelector('.meet-card .btn-primary, .meet-card .btn-secondary');
            if (btn) btn.click();
            return new Promise(function(resolve){
              setTimeout(function(){ resolve({ modalOpen: document.querySelector('.modal-backdrop.open') !== null }); }, 400);
            });
          })()`);
        } else if (page.file === 'expense.html') {
          interaction = await evalIn(cdp, sessionId, `(function(){
            const btn = document.querySelector('.exp-actions .btn-primary');
            if (btn) btn.click();
            return new Promise(function(resolve){
              setTimeout(function(){ resolve({ modalOpen: document.querySelector('.modal-backdrop.open') !== null }); }, 400);
            });
          })()`);
        }
      } catch (e) {
        errors.push('interaction error: ' + e.message);
      }

      await screenshot(cdp, sessionId, page.file.replace('.html', ''));
      summary.push({ page: page.file, title, appHtml, markers, visual, interaction, errors });

      await cdp.send('Target.closeTarget', { targetId });
    }
  } finally {
    chrome.kill();
  }

  console.log(JSON.stringify(summary, null, 2));
  const fail = summary.filter((s) => s.errors.length > 0 || s.appHtml <= 0 || Object.values(s.markers).some((v) => v === 0));
  if (fail.length) {
    console.error(`FAIL: ${fail.length} page(s) failed`);
    process.exit(1);
  }
  console.log('ALL PAGES OK');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
