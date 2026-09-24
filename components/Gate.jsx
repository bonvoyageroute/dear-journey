'use client';
import Link from 'next/link';

export default function Gate({ error, needsLogin }) {
  if (needsLogin) {
    return (
      <div className="sheet">
        <div className="empty">
          You are signed out. <Link href="/login" style={{ textDecoration: 'underline' }}>Sign in</Link> to open your book.
        </div>
      </div>
    );
  }
  if (error) return <div className="sheet"><div className="err">{error}</div></div>;
  return <div className="sheet"><div className="empty">Opening the book&hellip;</div></div>;
}
