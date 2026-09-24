'use client';
import { useState } from 'react';
import Link from 'next/link';
import Header from '../../../components/Header';
import Gate from '../../../components/Gate';
import AddExpense from '../../../components/AddExpense';
import { useBook } from '../../../lib/useBook';
import { totals, byCategory } from '../../../lib/store';
import { money, dayOf } from '../../../lib/format';

export default function ExpenseSummary() {
  const { book, error, needsLogin, refresh } = useBook();
  const [adding, setAdding] = useState(false);
  if (!book) return <Gate error={error} needsLogin={needsLogin} />;

  const cur = book.trip.home_currency || 'AUD';
  const t = totals(book);
  const cats = byCategory(book);
  const pct = t.budget > 0 ? Math.min(100, (t.actual / t.budget) * 100) : 0;

  return (
    <div className="sheet">
      <Header kicker="Chapter three &mdash; Expense" title="Money" right={cur} />

      <div className="chips">
        <span className="chip on">Summary</span>
        <Link className="chip" href="/expense/log">By day</Link>
        <Link className="chip" href="/expense/split">Split</Link>
      </div>

      <div className="kpi">
        <div><div className="lbl">Planned</div><b>{money(t.planned, cur)}</b></div>
        <div><div className="lbl">Actual</div><b>{money(t.actual, cur)}</b></div>
        <div><div className="lbl">Remaining</div><b style={{ color: t.remaining < 0 ? '#8C4A3C' : 'var(--blueD)' }}>{money(t.remaining, cur)}</b></div>
      </div>
      <div className="bar"><i style={{ width: pct + '%' }} /></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10.5, color: 'var(--ink2)' }}>
        <span>{Math.round(pct)}% of the budget spent</span>
        <span>Budget {money(t.budget, cur)}</span>
      </div>

      <div className="sect">
        <div className="h"><span className="lbl">By category</span><span className="lbl">Plan &middot; Actual</span></div>
        {cats.length === 0 ? <div className="empty">Nothing logged yet.</div> : cats.map((c) => (
          <div className="crow" key={c.key}>
            <span style={{ textTransform: 'capitalize' }}>{c.key}</span>
            <span className="p">{c.planned ? money(c.planned, cur) : '\u2014'}</span>
            <span className="a">{money(c.actual, cur)}</span>
          </div>
        ))}
      </div>

      <div className="foot">
        <button className="btn blue wide" onClick={() => setAdding(true)}>+ Add actual</button>
      </div>

      {adding ? (
        <AddExpense book={book} day={dayOf(book.trip)} onClose={() => setAdding(false)} onSaved={refresh} />
      ) : null}
    </div>
  );
}
