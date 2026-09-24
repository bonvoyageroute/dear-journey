'use client';
import { useState } from 'react';
import Link from 'next/link';
import Header from '../../../../components/Header';
import Gate from '../../../../components/Gate';
import AddExpense from '../../../../components/AddExpense';
import { useBook } from '../../../../lib/useBook';
import { homeAmount, removeExpense } from '../../../../lib/store';
import { money, dayOf, dateOfDay, shortDate } from '../../../../lib/format';

export default function ExpenseLog() {
  const { book, error, needsLogin, refresh } = useBook();
  const [target, setTarget] = useState(null);
  if (!book) return <Gate error={error} needsLogin={needsLogin} />;

  const cur = book.trip.home_currency || 'AUD';
  const days = Array.from(new Set([...book.stops.map((s) => s.day), ...book.expenses.map((e) => e.day || 1)]))
    .sort((a, b) => b - a);
  const people = Object.fromEntries(book.travellers.map((p) => [p.id, p]));

  return (
    <div className="sheet">
      <Header kicker="Chapter three &mdash; Expense" title="By day" right={cur} />

      <div className="chips">
        <Link className="chip" href="/expense">Summary</Link>
        <span className="chip on">By day</span>
        <Link className="chip" href="/expense/split">Split</Link>
      </div>

      {days.length === 0 ? <div className="empty">Nothing here yet.</div> : days.map((d) => {
        const stops = book.stops.filter((s) => s.day === d);
        const spent = book.expenses.filter((e) => (e.day || 1) === d);
        const planned = stops.reduce((sum, s) => sum + Number(s.planned || 0), 0);
        const actual = spent.reduce((sum, e) => sum + homeAmount(e), 0);
        return (
          <div className="sect" key={d}>
            <div className="h">
              <span className="serif" style={{ fontSize: 18 }}>Day {String(d).padStart(2, '0')}
                <span className="lbl" style={{ marginLeft: 8 }}>{shortDate(dateOfDay(book.trip, d))}</span></span>
              <span className="lbl num">{money(planned, cur)} plan &middot; {money(actual, cur)} actual</span>
            </div>

            {stops.map((s) => {
              const paid = spent.filter((e) => e.stop_id === s.id).reduce((sum, e) => sum + homeAmount(e), 0);
              return (
                <div className="crow" key={s.id}>
                  <span>{s.title}</span>
                  <span className="p">{Number(s.planned) ? money(s.planned, cur) : '\u2014'}</span>
                  <span className="a">
                    {paid > 0 ? money(paid, cur) : (
                      <button className="chip" style={{ minHeight: 32, padding: '0 8px' }} onClick={() => setTarget({ day: d, stop: s })}>+ Add</button>
                    )}
                  </span>
                </div>
              );
            })}

            {spent.filter((e) => !e.stop_id).map((e) => (
              <div className="crow" key={e.id}>
                <span>
                  {e.title}
                  <span className="lbl" style={{ display: 'block', marginTop: 3 }}>
                    {e.category}{e.paid_by && people[e.paid_by] ? ' \u00b7 ' + people[e.paid_by].name : ''}
                    {e.currency !== cur ? ' \u00b7 ' + money(e.amount, e.currency) : ''}
                  </span>
                </span>
                <span className="p">&mdash;</span>
                <span className="a">
                  {money(homeAmount(e), cur)}
                  <button className="lbl" style={{ display: 'block', marginTop: 4, textDecoration: 'underline' }}
                    onClick={async () => { if (confirm('Delete this expense?')) { await removeExpense(book.trip, e.id); refresh(); } }}>delete</button>
                </span>
              </div>
            ))}

            <button className="chip" style={{ marginTop: 10 }} onClick={() => setTarget({ day: d, stop: null })}>+ Something else on day {d}</button>
          </div>
        );
      })}

      <div style={{ height: 90 }} />
      <div className="foot">
        <button className="btn blue wide" onClick={() => setTarget({ day: dayOf(book.trip), stop: null })}>+ Add actual</button>
      </div>

      {target ? (
        <AddExpense book={book} day={target.day} stop={target.stop} onClose={() => setTarget(null)} onSaved={refresh} />
      ) : null}
    </div>
  );
}
