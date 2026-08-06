/* 余响 Encore v1.0.0 · 章节标题组件 */
export default {
  name: 'SectionHead',
  props: {
    tag: { type: String, default: '' },
    title: { type: String, required: true },
    en: { type: String, default: '' },
    desc: { type: String, default: '' }
  },
  template: `
    <div class="sec-head" v-reveal>
      <div>
        <div class="tag">{{ tag }}</div>
        <h2>{{ title }} <em v-if="en">{{ en }}</em></h2>
        <p v-if="desc">{{ desc }}</p>
      </div>
      <slot />
    </div>
  `
};
