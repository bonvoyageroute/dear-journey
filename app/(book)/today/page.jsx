'use client';
import { useState } from 'react';
import Link from 'next/link';
import Header from '../../../components/Header';
import Gate from '../../../components/Gate';
import AddExpense from '../../../components/AddExpense';
import { useBook } from '../../../lib/useBook';
import { homeAmount } from '../../../lib/store';
import { money, dayOf, mapsUrl } from '../../../lib/format';

function nowMinutes() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}
function toMinutes(t) {
  if (!t) return null;
  const [h, m] = t.split(':').map(Number);
  if (Number.isNaN(h)) return null;
  return h * 60 + (m || 0);
}

export default function Today() {
  const { book, error, needsLogin, refresh } = useBook();
  const [adding, setAdding] = useState(null);
  if (!book) return <Gate error={error} needsLogin={needsLogin} />;

  const cur = book.trip.home_currency || 'AUD';
  const day = dayOf(book.trip);
  const stops = book.stops.filter((s) => s.day === day).sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  const mins = nowMinutes();
  const next = stops.find((s) => (toMinutes(s.time) ?? 9999) >= mins) || null;
  const later = stops.filter((s) => s !== next && (toMinutes(s.time) ?? 0) > (toMinutes(next?.time) ?? -1));
  const plannedToday = stops.reduce((sum, s) => sum + Number(s.planned || 0), 0);
  const spentToday = book.expenses.filter((e) => (e.day || 1) === day).reduce((sum, e) => sum + homeAmount(e), 0);
  const pct = plannedToday > 0 ? Math.min(100, (spentToday / plannedToday) * 100) : 0;
  const today = new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'short' });
  const clock = new Date().toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div className="sheet">
      <Header kicker={`Today \u00b7 Day ${String(day).padStart(2, '0')}`} title={today} right={clock} />

      {next ? (
        <div className="nextup">
          <span className="lbl" style={{ color: 'var(--blueD)' }}>Next up</span>
          <h2>{next.title}</h2>
          <div style={{ marginTop: 10, fontSize: 12, fontWeight: 600 }}>
            {next.time || ''}{Number(next.planned) ? ' \u00b7 planned ' + money(next.planned, cur) : ' \u00b7 free'}
          </div>
          {next.travel ? <div style={{ marginTop: 4, fontSize: 11.5, color: 'var(--ink2)' }}>{next.travel}</div> : null}
          {next.note ? <div className="quo" style={{ marginTop: 6, fontSize: 14, color: 'var(--ink2)' }}>{next.note}</div> : null}
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <a className="btn blue" style={{ flex: 1, fontSize: 9.5 }} href={mapsUrl(next.maps_query || next.title)} target="_blank" rel="noreferrer">Directions</a>
            <button className="btn ghost" style={{ flex: 1, fontSize: 9.5 }} onClick={() => setAdding({ day, stop: next })}>Log this</button>
          </div>
        </div>
      ) : (
        <div className="empty">Nothing left on today&rsquo;s page. <Link href="/plan" style={{ textDecoration: 'underline' }}>Open the plan</Link> to add something.</div>
      )}

      {later.length ? (
        <div className="sect">
          <div className="h"><span className="lbl">{next ? 'Later today' : 'Today\u2019s page'}</span><span className="lbl">Planned</span></div>
          {later.map((s) => (
            <div className="crow" key={s.id}>
              <span>
                {s.title}
                <span className="lbl" style={{ display: 'block', marginTop: 3 }}>{s.time || ''}{s.travel ? ' \u00b7 ' + s.travel : ''}</span>
              </span>
              <span className="p" />
              <span className="a">{Number(s.planned) ? money(s.planned, cur) : '\u2014'}</span>
            </div>
          ))}
        </div>
      ) : null}

      <div className="sect">
        <div className="h"><span className="lbl">Spent today</span>
          <span className="num" style={{ fontWeight: 600 }}>{money(spentToday, cur)} <span style={{ color: 'var(--ink3)', fontWeight: 500 }}>/ {money(plannedToday, cur)}</span></span></div>
        <div className="bar"><i style={{ width: pct + '%' }} /></div>
      </div>

      <div className="slip">Collect.<br />Plan.<br />Live.<br />Remember.</div>

      <div className="foot">
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn blue" style={{ flex: 1 }} onClick={() => setAdding({ day, stop: null })}>+ Log actual</button>
          <Link className="btn ghost" style={{ flex: 1 }} href="/expense/log">The ledger</Link>
        </div>
      </div>

      {adding ? <AddExpense book={book} day={adding.day} stop={adding.stop} onClose={() => setAdding(null)} onSaved={refresh} /> : null}
    </div>
  );
}
