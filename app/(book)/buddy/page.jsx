'use client';
import Header from '../../../components/Header';
import Gate from '../../../components/Gate';
import { useBook } from '../../../lib/useBook';
import { totals } from '../../../lib/store';
import { money, dayOf } from '../../../lib/format';
import { homeAmount } from '../../../lib/store';

export default function Buddy() {
  const { book, error, needsLogin } = useBook();
  if (!book) return <Gate error={error} needsLogin={needsLogin} />;

  const cur = book.trip.home_currency || 'AUD';
  const t = totals(book);
  const day = dayOf(book.trip);
  const spentToday = book.expenses.filter((e) => (e.day || 1) === day).reduce((s, e) => s + homeAmount(e), 0);
  const daysLeft = book.trip.end_date
    ? Math.max(0, Math.round((new Date(book.trip.end_date) - new Date()) / 86400000))
    : null;
  const perDay = daysLeft && daysLeft > 0 ? t.remaining / daysLeft : null;

  return (
    <div className="sheet">
      <Header kicker="Buddy" title="Quiet help" right="v1" />
      <div className="sect">
        <div className="h"><span className="lbl">Where you are</span><span className="lbl">Day {String(day).padStart(2, '0')}</span></div>
        <div className="row">Today you have spent <b>{money(spentToday, cur)}</b>.</div>
        <div className="row">The whole trip is at <b>{money(t.actual, cur)}</b> against a plan of {money(t.planned, cur)}.</div>
        {perDay !== null ? (
          <div className="row">With {daysLeft} days left that is about <b>{money(perDay, cur)}</b> a day from here.</div>
        ) : null}
      </div>
      <div className="empty">
        The asking-questions part of Buddy comes after the trip data is in. For now it does the sums for you while you are out.
      </div>
    </div>
  );
}
