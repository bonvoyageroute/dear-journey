'use client';
import { useEffect, useState } from 'react';
import Header from '../../../components/Header';
import Polaroid from '../../../components/Polaroid';
import Gate from '../../../components/Gate';
import { useBook } from '../../../lib/useBook';
import { addStop, removeStop } from '../../../lib/store';
import { money, dayOf, dateOfDay, shortDate, mapsUrl, photoFor } from '../../../lib/format';

export default function Plan() {
  const { book, error, needsLogin, refresh } = useBook();
  const [day, setDay] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ time: '', title: '', note: '', planned: '', travel: '', maps_query: '', photo_url: '' });
  const [busy, setBusy] = useState(false);

  /* the Calendar links here as /plan?day=3 */
  useEffect(() => {
    const q = Number(new URLSearchParams(window.location.search).get('day'));
    if (q >= 1) setDay(q);
  }, []);

  if (!book) return <Gate error={error} needsLogin={needsLogin} />;

  const days = Array.from(new Set(book.stops.map((s) => s.day))).sort((a, b) => a - b);
  const today = dayOf(book.trip);
  const current = day ?? (days.includes(today) ? today : (days[0] || 1));
  const stops = book.stops.filter((s) => s.day === current)
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  const plannedToday = stops.reduce((sum, s) => sum + Number(s.planned || 0), 0);
  const cur = book.trip.home_currency || 'AUD';

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await addStop(book.trip, {
        day: current,
        time: form.time || null,
        title: form.title,
        note: form.note || null,
        planned: Number(form.planned || 0),
        travel: form.travel || null,
        maps_query: form.maps_query || form.title,
        photo_url: form.photo_url || null,
        sort: stops.length + 1,
      });
      setForm({ time: '', title: '', note: '', planned: '', travel: '', maps_query: '', photo_url: '' });
      setOpen(false);
      await refresh();
    } catch (err) { alert(err.message || String(err)); }
    setBusy(false);
  }

  return (
    <div className="sheet">
      <Header kicker="Chapter one &mdash; Plan" title={book.trip.title}
        right={dateOfDay(book.trip, current) ? shortDate(dateOfDay(book.trip, current)) : null} />

      <div className="chips">
        {(days.length ? days : [1]).map((d) => (
          <button key={d} className={'chip' + (d === current ? ' on' : '')} onClick={() => setDay(d)}>Day {String(d).padStart(2, '0')}</button>
        ))}
        <button className="chip" onClick={() => setDay((days[days.length - 1] || 0) + 1)}>+ Day</button>
      </div>

      {stops.length === 0 ? (
        <div className="empty">No stops on this day yet. Tap <b>Add a stop</b> below to start the day.</div>
      ) : (
        <div style={{ marginTop: 14 }}>
          {stops.map((s, i) => (
            <div className="stop" key={s.id}>
              <div className="t">{s.time || '--:--'}<span>{s.duration || ''}</span></div>
              <div>
                <h3>{s.title}</h3>
                {s.note ? <div className="n">{s.note}</div> : null}
                <div className="m">
                  <b>{Number(s.planned) > 0 ? money(s.planned, cur) : 'Free'}</b>
                  {s.travel ? <><span>&middot;</span><span>{s.travel}</span></> : null}
                  <span>&middot;</span>
                  <a href={mapsUrl(s.maps_query || s.title)} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>map</a>
                  <span>&middot;</span>
                  <button style={{ textDecoration: 'underline', color: 'var(--ink2)' }}
                    onClick={async () => { if (confirm('Remove this stop?')) { await removeStop(book.trip, s.id); refresh(); } }}>remove</button>
                </div>
              </div>
              <a href={mapsUrl(s.maps_query || s.title)} target="_blank" rel="noreferrer">
                <Polaroid photo={photoFor(s)} caption={s.title} tilt={i % 2 ? 'b' : 'a'} />
              </a>
            </div>
          ))}
        </div>
      )}

      <div className="slip">Good places.<br />Good people.<br />Good memories.</div>

      <div className="foot">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--ink)', paddingTop: 12 }}>
          <div>
            <div className="lbl">Day {String(current).padStart(2, '0')} &middot; planned</div>
            <div className="serif num" style={{ fontSize: 22 }}>{money(plannedToday, cur)}</div>
          </div>
          <button className="btn blue" onClick={() => setOpen(true)}>Add a stop</button>
        </div>
      </div>

      {open ? (
        <div className="sheetmodal" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <form className="inner" onSubmit={save}>
            <div className="top">
              <div><span className="lbl">Day {String(current).padStart(2, '0')}</span><h2>Add a stop</h2></div>
              <button type="button" className="lbl" onClick={() => setOpen(false)}>Close</button>
            </div>
            <label className="field"><span>Place</span>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Gertrude St coffee" /></label>
            <div className="two">
              <label className="field"><span>Time</span>
                <input value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} placeholder="08:30" /></label>
              <label className="field"><span>Planned cost</span>
                <input inputMode="decimal" value={form.planned} onChange={(e) => setForm({ ...form, planned: e.target.value })} placeholder="18" /></label>
            </div>
            <label className="field"><span>Note</span>
              <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="the flat white everyone talks about" /></label>
            <div className="two">
              <label className="field"><span>Travel</span>
                <input value={form.travel} onChange={(e) => setForm({ ...form, travel: e.target.value })} placeholder="6 min walk" /></label>
              <label className="field"><span>Search on maps</span>
                <input value={form.maps_query} onChange={(e) => setForm({ ...form, maps_query: e.target.value })} placeholder="Gertrude St Fitzroy" /></label>
            </div>
            <label className="field"><span>Your own photo link (optional)</span>
              <input value={form.photo_url} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} placeholder="leave blank &mdash; a photo of the place is found automatically" /></label>
            <button className="btn blue wide" style={{ marginTop: 18 }} disabled={busy} type="submit">{busy ? 'Saving...' : 'Save stop'}</button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
