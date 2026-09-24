'use client';
import { useEffect, useState } from 'react';
import Header from '../../../components/Header';
import Gate from '../../../components/Gate';
import { useBook } from '../../../lib/useBook';
import { saveTrip, signOut, demoMode } from '../../../lib/store';

export default function Settings() {
  const { book, error, needsLogin, refresh } = useBook();
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (book && !form) {
      setForm({
        title: book.trip.title || '', subtitle: book.trip.subtitle || '',
        start_date: book.trip.start_date || '', end_date: book.trip.end_date || '',
        home_currency: book.trip.home_currency || 'AUD', budget: book.trip.budget || 0,
      });
    }
  }, [book, form]);

  if (!book || !form) return <Gate error={error} needsLogin={needsLogin} />;

  async function submit(e) {
    e.preventDefault();
    await saveTrip(book.trip, {
      title: form.title, subtitle: form.subtitle,
      start_date: form.start_date || null, end_date: form.end_date || null,
      home_currency: form.home_currency, budget: Number(form.budget || 0),
    });
    setSaved(true);
    refresh();
  }

  return (
    <div className="sheet">
      <Header kicker="The book" title="Trip settings" />
      <form onSubmit={submit}>
        <label className="field"><span>Trip title</span>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
        <label className="field"><span>Route</span>
          <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="Melbourne \u00b7 Thailand \u00b7 Brisbane" /></label>
        <div className="two">
          <label className="field"><span>Starts</span>
            <input type="date" value={form.start_date || ''} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></label>
          <label className="field"><span>Ends</span>
            <input type="date" value={form.end_date || ''} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></label>
        </div>
        <div className="two">
          <label className="field"><span>Home currency</span>
            <input value={form.home_currency} onChange={(e) => setForm({ ...form, home_currency: e.target.value.toUpperCase() })} /></label>
          <label className="field"><span>Budget</span>
            <input inputMode="decimal" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} /></label>
        </div>
        {saved ? <div className="ok">Saved.</div> : null}
        <button className="btn blue wide" style={{ marginTop: 18 }} type="submit">Save</button>
      </form>

      {!demoMode ? (
        <button className="btn ghost wide" style={{ marginTop: 14 }} onClick={async () => { await signOut(); location.href = '/login'; }}>Sign out</button>
      ) : null}
      <div style={{ height: 60 }} />
    </div>
  );
}
