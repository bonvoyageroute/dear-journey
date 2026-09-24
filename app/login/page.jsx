'use client';
import { useState } from 'react';
import { signInWithEmail, demoMode } from '../../lib/store';

export default function Login() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setError(null);
    const { error } = await signInWithEmail(email);
    if (error) setError(error.message); else setSent(true);
  }

  return (
    <div className="cover">
      <div style={{ width: 'min(100%,360px)' }}>
        <div className="lbl">Dear Journey</div>
        <h1 className="serif" style={{ fontWeight: 500, fontSize: 28, margin: '6px 0 0' }}>Sign in</h1>
        <div className="rule" style={{ height: 1, background: '#3D4650', marginTop: 12 }} />
        {demoMode ? (
          <div className="ok">No database connected yet, so the book runs in demo mode. No sign in needed.</div>
        ) : sent ? (
          <div className="ok">Check your email for the sign-in link, then come back to this tab.</div>
        ) : (
          <form onSubmit={submit}>
            <label className="field"><span>Email</span>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
            </label>
            {error ? <div className="err">{error}</div> : null}
            <button className="btn blue wide" style={{ marginTop: 18 }} type="submit">Send me a link</button>
          </form>
        )}
      </div>
    </div>
  );
}
