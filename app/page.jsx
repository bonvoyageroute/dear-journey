'use client';
import Link from 'next/link';
import { useBook } from '../lib/useBook';
import { shortDate } from '../lib/format';

export default function Cover() {
  const { book, demoMode } = useBook();
  const trip = book?.trip;

  return (
    <div className="cover">
      <div style={{ width: 'min(100%,360px)' }}>
        <div className="coverbook">
          <span className="band" />
          <div className="lbl" style={{ color: 'rgba(247,244,234,.62)' }}>Book N&ordm; 01</div>
          <div className="coverlabel">
            <div className="wm">Dear Journey</div>
            <div className="tg">A little book for every journey.</div>
            <h1>{trip ? trip.title : 'Your first trip'}</h1>
            {trip?.subtitle ? <div className="route">{trip.subtitle}</div> : null}
            {trip?.start_date ? (
              <div className="lbl" style={{ marginTop: 7, letterSpacing: '.6px', textTransform: 'none' }}>
                {shortDate(trip.start_date)}{trip.end_date ? ' \u2013 ' + shortDate(trip.end_date) : ''}
              </div>
            ) : null}
          </div>
          <Link href="/today" className="btn wide" style={{ marginTop: 24, background: '#F7F4EA', color: '#3F3A31' }}>
            Open the book
          </Link>
        </div>

        <div className="triplist">
          <Link href="/plan"><span>Plan</span><span className="lbl">days &amp; stops</span></Link>
          <Link href="/expense"><span>Expense</span><span className="lbl">planned vs actual</span></Link>
          {demoMode ? null : <Link href="/settings"><span>Trip settings</span><span className="lbl">budget, people</span></Link>}
        </div>

        {demoMode ? (
          <div className="ok" style={{ marginTop: 18 }}>
            Demo mode: everything is saved in this browser only. Add your Supabase keys to store it for real.
          </div>
        ) : null}
      </div>
    </div>
  );
}
