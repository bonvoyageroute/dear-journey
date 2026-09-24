'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const CHAPTERS = [
  { key: 'plan', label: 'Plan', href: '/plan', cls: 'c1' },
  { key: 'calendar', label: 'Calendar', href: '/calendar', cls: 'c2' },
  { key: 'expense', label: 'Expense', href: '/expense', cls: 'c3' },
  { key: 'moodboard', label: 'Moodboard', href: '/moodboard', cls: 'c4' },
];

function Clock() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" />
    </svg>
  );
}
function Compass() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><path d="M15.6 8.4l-2.1 5.1-5.1 2.1 2.1-5.1z" />
    </svg>
  );
}

export default function Book({ children }) {
  const path = usePathname() || '';
  const active = (href) => path.startsWith(href);

  return (
    <div className="book">
      <div className="stack" />
      <div className="rings"><i /><i /><i /><i /><i /><i /></div>
      <div className="block" />

      <Link href="/today" className={'today-tab' + (active('/today') ? ' on' : '')} aria-label="Today">
        <span className="dot" /><Clock /><span className="t">Today</span>
      </Link>

      <nav className="rail" aria-label="Bookmarks">
        {CHAPTERS.map((c) => (
          <Link key={c.key} href={c.href} className={'tab ' + c.cls + (active(c.href) ? ' on' : '')}>
            <span>{c.label}</span>
          </Link>
        ))}
        <Link href="/buddy" className={'buddy-tab' + (active('/buddy') ? ' on' : '')} aria-label="Buddy">
          <span className="in"><Compass /><span className="t">Buddy</span></span>
        </Link>
      </nav>

      {children}
    </div>
  );
}
