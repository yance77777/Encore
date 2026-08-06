/* 余响 Encore v1.0.0 · 账单页入口 */
import { createApp } from '../../vendor/vue.esm-browser.prod.js';
import AppShell from '../components/AppShell.js';
import SectionHead from '../components/SectionHead.js';
import ExpenseSummary from '../components/ExpenseSummary.js';
import ExpenseList from '../components/ExpenseList.js';
import ExpenseModals from '../components/ExpenseModals.js';
import { reveal } from '../directives.js';
import { initApp } from '../store.js';

const ExpensePage = {
  name: 'ExpensePage',
  components: { AppShell, SectionHead, ExpenseSummary, ExpenseList, ExpenseModals },
  data() {
    return {
      mode: '',
      deleteId: ''
    };
  },
  methods: {
    openDelete(id) {
      this.deleteId = id;
      this.mode = 'delete';
    }
  },
  template: `
    <app-shell active="expense">
      <div class="wrap">
        <section id="expense">
          <section-head
            tag="07 / Expense"
            title="消费记录"
            en="Expense"
            desc="记录每一笔追星支出，看见热爱的重量。"
          />
          <div class="reveal">
            <expense-summary @add="mode = 'add'" @clear="mode = 'clear'" />
          </div>
          <div class="reveal" style="margin-top:32px">
            <expense-list @add="mode = 'add'" @delete="openDelete" />
          </div>
        </section>
      </div>
      <expense-modals v-model:mode="mode" :delete-id="deleteId" />
    </app-shell>
  `
};

const app = createApp(ExpensePage);
app.directive('reveal', reveal);
app.mount('#app');
initApp();
