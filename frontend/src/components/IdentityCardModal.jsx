/* 余响 Encore v0.9.0 · 粉丝身份卡弹层（可复制分享） */
import { useEffect } from 'react';
import { useStore, getFanLevel, checkAchievements, toast } from '../store.jsx';
import { skinNames } from '../utils.js';

export default function IdentityCardModal({ open, onClose }) {
  const s = useStore();
  const checkins = s.user.checkins || [];
  const litVenuesSet = new Set(checkins.map((c) => c.venueId));
  const litProvSet = new Set(s.venues.filter((v) => litVenuesSet.has(v.id)).map((v) => v.provinceShort));
  const { cur } = getFanLevel(checkins.length);
  const achs = checkAchievements(s);
  const gotAch = achs.filter((a) => a.got).length;
  const since = s.user.since || String(new Date().getFullYear());
  const years = Math.max(0, new Date().getFullYear() - (+since));
  const nickname = s.user.nickname || '追光者';
  const danType = (s.user.bias && s.user.bias.type) || 1;
  const biases = ((s.user.bias && Array.isArray(s.user.bias.list)) ? s.user.bias.list : []).slice(0, danType)
    .map((id) => { const a = s.artists.find((x) => x.id === id); return a ? a.name : id; })
    .join(' / ') || '未设置';
  const skinA = s.artists.find((a) => a.id === s.user.skin);
  const skinName = skinNames[s.user.skin] || (skinA ? skinA.name : '默认');
  const cntMap = {};
  checkins.forEach((c) => { cntMap[c.artistId] = (cntMap[c.artistId] || 0) + 1; });
  const topEntry = Object.entries(cntMap).sort((a, b) => b[1] - a[1])[0];
  const topArtist = topEntry ? s.artists.find((a) => a.id === topEntry[0]) : null;
  const topN = topEntry ? topEntry[1] : 0;
  const idc = {
    checkins,
    litVenues: litVenuesSet.size,
    litProvs: litProvSet.size,
    cur,
    gotAch,
    totalAch: achs.length,
    since,
    years,
    nickname,
    biases,
    skinName,
    topArtist,
    topN,
    collections: (s.stats && s.stats.totalCollections) || 0
  };

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function fallbackCopy(text) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      toast('身份卡文案已复制', 'success');
    } catch (e) {
      toast('复制失败，请手动选择文本', 'error');
    }
  }
  function copyText() {
    const text = `【余响 Encore · 粉丝身份卡】
${idc.nickname} · SINCE ${idc.since} · 粉龄 ${idc.years} 年
等级：Lv.${idc.cur.lv} ${idc.cur.name}
本命：${idc.biases}
观演 ${idc.checkins.length} 场 · 点亮 ${idc.litVenues} 场馆 · 收藏 ${idc.collections} 件
成就 ${idc.gotAch}/${idc.totalAch} 已解锁`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => toast('身份卡文案已复制', 'success')).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }

  return (
    <div className={'modal-backdrop' + (open ? ' open' : '')} aria-hidden={open ? 'false' : 'true'} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="粉丝身份卡">
        <button className="modal-close" aria-label="关闭" onClick={onClose}>×</button>
        <div className="modal-title">粉丝身份卡</div>
        <div className="modal-subtitle">FAN IDENTITY CARD · 可复制分享</div>
        <div className="modal-body">
          <div className="idc-card">
            <div className="idc-top">
              <div className="idc-avatar">{(idc.nickname || '粉').slice(0, 1)}</div>
              <div className="idc-id">
                <div className="idc-nick">{idc.nickname}</div>
                <div className="idc-since">SINCE {idc.since} · 粉龄 {idc.years} 年</div>
              </div>
              <div className="idc-lv">Lv.{idc.cur.lv}</div>
            </div>
            <div className="idc-tier">{idc.cur.name}</div>
            <div className="idc-stats">
              <div><span className="idc-num">{idc.checkins.length}</span><span className="idc-lab">观演</span></div>
              <div><span className="idc-num">{idc.litVenues}</span><span className="idc-lab">场馆</span></div>
              <div><span className="idc-num">{idc.litProvs}</span><span className="idc-lab">省份</span></div>
              <div><span className="idc-num">{idc.collections}</span><span className="idc-lab">收藏</span></div>
              <div><span className="idc-num">{idc.gotAch}/{idc.totalAch}</span><span className="idc-lab">成就</span></div>
            </div>
            <div className="idc-row"><span>本命</span><strong>{idc.biases}</strong></div>
            {idc.topArtist ? <div className="idc-row"><span>最常看</span><strong>{idc.topArtist.name} · {idc.topN} 场</strong></div> : null}
            <div className="idc-row"><span>主题</span><strong>{idc.skinName}</strong></div>
            <div className="idc-foot">余响 Encore · 演唱会足迹追踪</div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>关闭</button>
          <button className="btn btn-primary" onClick={copyText}>复制文案</button>
        </div>
      </div>
    </div>
  );
}
