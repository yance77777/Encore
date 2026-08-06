/* 余响 Encore v0.9.0 · 账单页入口 */
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import AppShell from '../components/AppShell.jsx';
import SectionHead from '../components/SectionHead.jsx';
import ExpenseSummary from '../components/ExpenseSummary.jsx';
import ExpenseList from '../components/ExpenseList.jsx';
import ExpenseModals from '../components/ExpenseModals.jsx';
import Reveal from '../Reveal.jsx';
import { initApp, useStore } from '../store.jsx';

function ExpenseView() {
  const s = useStore();
  const [mode, setMode] = useState('');
  const [deleteId, setDeleteId] = useState('');
  return (
    <AppShell active="expense" loading={!s.loaded} error={!!s.error}>
      <div className="wrap">
        <section id="expense">
          <SectionHead
            tag="07 / Expense"
            title="消费记录"
            en="Expense"
            desc="记录每一笔追星支出，看见热爱的重量。"
          />
          <Reveal>
            <ExpenseSummary onAdd={() => setMode('add')} onClear={() => setMode('clear')} />
          </Reveal>
          <Reveal style={{ marginTop: 32 }}>
            <ExpenseList onAdd={() => setMode('add')} onDelete={(id) => { setDeleteId(id); setMode('delete'); }} />
          </Reveal>
        </section>
      </div>
      <ExpenseModals mode={mode} deleteId={deleteId} onModeChange={setMode} />
    </AppShell>
  );
}

createRoot(document.getElementById('root')).render(<ExpenseView />);
initApp();
