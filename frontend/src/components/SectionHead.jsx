/* 余响 Encore v0.9.0 · 章节标题组件 */
import Reveal from '../Reveal.jsx';

export default function SectionHead({ tag = '', title, en = '', desc = '', children }) {
  return (
    <Reveal className="sec-head">
      <div>
        <div className="tag">{tag}</div>
        <h2>{title} {en ? <em>{en}</em> : null}</h2>
        {desc ? <p>{desc}</p> : null}
      </div>
      {children}
    </Reveal>
  );
}
