'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import Header from '../../../components/Header';
import Gate from '../../../components/Gate';
import { useBook } from '../../../lib/useBook';
import { money, dayOf, dateOfDay, localIso, photoFor } from '../../../lib/format';

const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];   // week starts Monday
const MAX_FEATURED_PHOTOS = 3; // taped photos per visible month — a few highlights, not every day

function iso(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
function monthName(y, m) {
  return new Date(y, m, 1).toLocaleDateString('en-AU', { month: 'long' });
}
function DayThumb({ src }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;
  return <span className="th"><img src={src} alt="" onError={() => setFailed(true)} /></span>;
}

export default function Calendar() {
  const { book, error, needsLogin } = useBook();
  const [offset, setOffset] = useState(0);   // months away from the trip's first month
  const [picked, setPicked] = useState(null); // day number of the trip

  /* one entry per day of the trip: its stops, in time order (hook stays above the guard) */
  const byDay = useMemo(() => {
    const m = new Map();
    (book?.stops || []).forEach((s) => {
      const k = Number(s.day || 1);
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(s);
    });
    m.forEach((list) => list.sort((a, b) => (a.time || '').localeCompare(b.time || '')));
    return m;
  }, [book]);

  if (!book) return <Gate error={error} needsLogin={needsLogin} />;

  const trip = book.trip;
  const cur = trip.home_currency || 'AUD';
  const start = trip.start_date ? new Date(trip.start_date + 'T00:00:00') : new Date();

  /* how many days the book covers: the trip's own dates, or as far as the stops go */
  const lastStopDay = book.stops.reduce((n, s) => Math.max(n, Number(s.day || 1)), 1);
  const endDate = trip.end_date ? new Date(trip.end_date + 'T00:00:00') : null;
  const totalDays = endDate
    ? Math.max(lastStopDay, Math.round((endDate - start) / 86400000) + 1)
    : lastStopDay;

  /* date -> day number, only inside the trip */
  const dayNumberOf = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    const n = Math.round((d - start) / 86400000) + 1;
    return n >= 1 && n <= totalDays ? n : null;
  };

  const view = new Date(start.getFullYear(), start.getMonth() + offset, 1);
  const y = view.getFullYear();
  const mo = view.getMonth();
  const firstDow = (new Date(y, mo, 1).getDay() + 6) % 7;   // Mon=0 .. Sun=6
  const daysInMonth = new Date(y, mo + 1, 0).getDate();
  const todayIso = localIso(new Date());

  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);   // finish the last week

  /* which trip-days get a photo taped in this month — a few picks, not every day with one.
     A stable "random" pick (seeded on the trip + month) so it doesn't reshuffle on every render. */
  const daysWithPhoto = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const n = dayNumberOf(iso(y, mo, d));
    if (n && (byDay.get(n) || []).some((s) => photoFor(s))) daysWithPhoto.push(n);
  }
  const seed = String(trip.id || 'demo') + '-' + y + '-' + mo;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const seededRand = (n) => { const x = Math.sin(h + n * 9973) * 10000; return x - Math.floor(x); };
  const featuredPhotoDays = new Set(
    daysWithPhoto
      .map((n) => ({ n, r: seededRand(n) }))
      .sort((a, b) => a.r - b.r)
      .slice(0, MAX_FEATURED_PHOTOS)
      .map((x) => x.n)
  );

  const todayDay = dayOf(trip);
  const selected = picked ?? (todayDay >= 1 && todayDay <= totalDays ? todayDay : 1);
  const selStops = byDay.get(selected) || [];
  const selPlanned = selStops.reduce((sum, s) => sum + Number(s.planned || 0), 0);
  const selIso = dateOfDay(trip, selected);

  return (
    <div className="sheet">
      <Header kicker="Chapter two &mdash; Calendar" title={monthName(y, mo)} right={String(y)} />

      <div className="calnav">
        <span className="lbl">Tap a day to open its page</span>
        <span className="arrows">
          <button onClick={() => setOffset(offset - 1)} aria-label="Previous month">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 6l-6 6 6 6" /></svg>
          </button>
          <button onClick={() => setOffset(offset + 1)} aria-label="Next month">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M10 6l6 6-6 6" /></svg>
          </button>
        </span>
      </div>

      <div className="callegend">
        <span className="lbl"><i className="k1" />On the trip</span>
        <span className="lbl"><i className="k2" />Today</span>
      </div>

      <div className="dow">{DOW.map((d) => <span key={d}>{d}</span>)}</div>

      <div className="cal">
        {cells.map((d, i) => {
          if (d === null) return <div className="cell out" key={'e' + i}><span className="d">&nbsp;</span></div>;
          const dateStr = iso(y, mo, d);
          const n = dayNumberOf(dateStr);
          const stops = n ? (byDay.get(n) || []) : [];
          const photo = n && featuredPhotoDays.has(n) ? photoFor(stops.find((s) => photoFor(s))) : null;
          const cls = 'cell' + (n ? ' trip' : '') + (n && n === selected ? ' sel' : '');
          const inner = (
            <>
              {dateStr === todayIso ? <span className="ring" /> : null}
              <span className="d num">{d}</span>
              {photo ? (
                <DayThumb src={photo} />
              ) : stops.length ? (
                <span className="pin">{stops.length}&nbsp;stop{stops.length > 1 ? 's' : ''}</span>
              ) : n ? <span className="bar" /> : null}
            </>
          );
          return n ? (
            <button className={cls} key={dateStr} onClick={() => setPicked(n)}
              aria-label={`Day ${n}, ${d} ${monthName(y, mo)}`}>{inner}</button>
          ) : (
            <div className={cls} key={dateStr}>{inner}</div>
          );
        })}
      </div>

      <div className="daycard">
        <div className="top">
          <span className="lbl">Day {String(selected).padStart(2, '0')}</span>
          <span className="lbl num">{selStops.length} stop{selStops.length === 1 ? '' : 's'} &middot; {money(selPlanned, cur)}</span>
        </div>
        <h2>{selIso ? new Date(selIso + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'long' }) : `Day ${selected}`}</h2>
        {selStops.length === 0 ? (
          <div className="quo" style={{ marginTop: 6, fontSize: 15, color: 'var(--ink2)' }}>nothing written on this day yet</div>
        ) : (
          <ul>
            {selStops.slice(0, 4).map((s) => (
              <li key={s.id}>
                <b className="num">{s.time || '--:--'}</b>
                <span>{s.title}{s.note ? <em> &mdash; {s.note}</em> : null}</span>
              </li>
            ))}
          </ul>
        )}
        <Link className="btn sage wide" style={{ marginTop: 14 }} href={`/plan?day=${selected}`}>
          Open day {String(selected).padStart(2, '0')} in plan
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M4 12h14M12 6l6 6-6 6" /></svg>
        </Link>
      </div>

      <div className="slip">Trip days are shaded.<br />A few highlights carry a taped photo &mdash; not every day.</div>
    </div>
  );
}
