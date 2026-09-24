'use client';
import { useCallback, useEffect, useState } from 'react';
import { loadBook, getSession, demoMode } from './store';

export function useBook() {
  const [book, setBook] = useState(null);
  const [error, setError] = useState(null);
  const [needsLogin, setNeedsLogin] = useState(false);

  const refresh = useCallback(async () => {
    try {
      if (!demoMode) {
        const session = await getSession();
        if (!session) { setNeedsLogin(true); setBook(null); return; }
      }
      setNeedsLogin(false);
      setBook(await loadBook());
      setError(null);
    } catch (e) {
      setError(e.message || String(e));
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { book, error, needsLogin, refresh, demoMode };
}
