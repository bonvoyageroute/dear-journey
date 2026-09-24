'use client';
import { useState } from 'react';
import { addExpense } from '../lib/store';
import { money } from '../lib/format';

const CATEGORIES = ['food', 'cafe', 'transport', 'stay', 'activity', 'shopping', 'other'];

export default function AddExpense({ book, day, stop, onClose, onSaved }) {
  const home = book.trip.home_currency || 'AUD';
  const [form, setForm] = useState({
    title: stop?.title || '',
    amount: '',
    currency: home,
    rate: '1',
    category: stop ? 'other' : 'food',
    paid_by: book.travellers[0]?.id || null,
    split: 'even',
    method: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const converted = Number(form.amount || 0) * Number(form.rate || 1);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      await addExpense(book.trip, {
        stop_id: stop?.id || null,
        day,
        title: form.title,
        amount: Number(form.amount || 0),
        currency: form.currency,
        rate: Number(form.rate || 1),
        category: form.category,
        paid_by: form.paid_by,
        split: form.split,
        method: form.method || null,
        occurred_at: new Date().toISOString(),
      });
      onSaved && (await onSaved());
      onClose();
    } catch (err) {
      setError(err.message || String(err));
    }
    setBusy(false);
  }

  return (
    <div className="sheetmodal" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <form className="inner" onSubmit={submit}>
        <div className="top">
          <div>
            <span className="lbl">Day {String(day).padStart(2, '0')}{stop ? ' \u00b7 from the plan' : ''}</span>
            <h2>Add actual</h2>
          </div>
          <button type="button" className="lbl" onClick={onClose}>Close</button>
        </div>

        {stop ? <div className="ok">{stop.title} &middot; planned {money(stop.planned, home)}</div> : null}

        <label className="field"><span>What / where</span>
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Night market dinner" /></label>

        <div className="two">
          <label className="field"><span>Amount</span>
            <input required inputMode="decimal" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="18.50" /></label>
          <label className="field"><span>Currency</span>
            <input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} placeholder={home} /></label>
        </div>

        {form.currency !== home ? (
          <div className="two">
            <label className="field"><span>Rate to {home}</span>
              <input inputMode="decimal" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} placeholder="0.044" /></label>
            <div className="field"><span>= in {home}</span>
              <div style={{ minHeight: 46, display: 'flex', alignItems: 'center', fontWeight: 600 }}>{money(converted, home)}</div></div>
          </div>
        ) : null}

        <div className="field"><span>Category</span>
          <div className="chips">
            {CATEGORIES.map((c) => (
              <button type="button" key={c} className={'chip' + (form.category === c ? ' on' : '')}
                onClick={() => setForm({ ...form, category: c })}>{c}</button>
            ))}
          </div>
        </div>

        <div className="field"><span>Paid by</span>
          <div className="chips">
            {book.travellers.map((p) => (
              <button type="button" key={p.id} className={'chip' + (form.paid_by === p.id ? ' on' : '')}
                onClick={() => setForm({ ...form, paid_by: p.id })}>{p.name}</button>
            ))}
          </div>
        </div>

        <div className="field"><span>Split</span>
          <div className="chips">
            <button type="button" className={'chip' + (form.split === 'even' ? ' on' : '')} onClick={() => setForm({ ...form, split: 'even' })}>Even</button>
            <button type="button" className={'chip' + (form.split === 'me' ? ' on' : '')} onClick={() => setForm({ ...form, split: 'me' })}>Just the payer</button>
          </div>
        </div>

        <label className="field"><span>Paid with (optional)</span>
          <input value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} placeholder="card, cash, wise" /></label>

        {error ? <div className="err">{error}</div> : null}
        <button className="btn blue wide" style={{ marginTop: 18 }} disabled={busy} type="submit">{busy ? 'Saving...' : 'Save actual'}</button>
      </form>
    </div>
  );
}
