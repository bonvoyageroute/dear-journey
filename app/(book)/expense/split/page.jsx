'use client';
import Link from 'next/link';
import Header from '../../../../components/Header';
import Gate from '../../../../components/Gate';
import { useBook } from '../../../../lib/useBook';
import { balances, settleUp } from '../../../../lib/store';
import { money } from '../../../../lib/format';

export default function Split() {
  const { book, error, needsLogin } = useBook();
  if (!book) return <Gate error={error} needsLogin={needsLogin} />;

  const cur = book.trip.home_currency || 'AUD';
  const list = balances(book);
  const settle = settleUp(book);

  return (
    <div className="sheet">
      <Header kicker="Chapter three &mdash; Expense" title="Split" right={cur} />

      <div className="chips">
        <Link className="chip" href="/expense">Summary</Link>
        <Link className="chip" href="/expense/log">By day</Link>
        <span className="chip on">Split</span>
      </div>

      <div className="sect">
        <div className="h"><span className="lbl">Who paid what</span><span className="lbl">{cur}</span></div>
        {list.map((p) => (
          <div className="row" key={p.id}>
            <div className="serif" style={{ fontSize: 20 }}>{p.name}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--ink2)', marginTop: 6 }}>
              <span>Paid</span><span className="num">{money(p.paid, cur)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--ink2)', marginTop: 3 }}>
              <span>Their share</span><span className="num">{money(p.share, cur)}</span></div>
            <div className="num" style={{ marginTop: 8, fontSize: 16, fontWeight: 600, color: p.net >= 0 ? '#3F6B4F' : '#8C4A3C' }}>
              {p.net >= 0 ? '+' : '\u2212'}{money(Math.abs(p.net), cur)} {p.net >= 0 ? 'gets back' : 'owes'}
            </div>
          </div>
        ))}
      </div>

      {settle ? (
        <div className="nextup" style={{ marginTop: 24 }}>
          <span className="lbl" style={{ color: 'var(--blueD)' }}>Settle up</span>
          <h2>{settle.from.name} &rarr; {settle.to.name}</h2>
          <div className="num" style={{ fontSize: 20, fontWeight: 600, marginTop: 8 }}>{money(settle.amount, cur)}</div>
        </div>
      ) : <div className="empty">Everyone is even. Nothing to settle.</div>}
    </div>
  );
}
