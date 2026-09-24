'use client';
import { supabase, isConfigured } from './supabase';
import { demoBook } from './demo';
import { localIso } from './format';

const LS = 'dear-journey-demo-v1';

/* ---------------- demo (no Supabase yet) ---------------- */
function readLocal() {
  if (typeof window === 'undefined') return structuredClone(demoBook);
  try {
    const raw = window.localStorage.getItem(LS);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  const seed = structuredClone(demoBook);
  writeLocal(seed);
  return seed;
}
function writeLocal(book) {
  try { window.localStorage.setItem(LS, JSON.stringify(book)); } catch (e) { /* ignore */ }
  return book;
}
const uid = () => Math.random().toString(36).slice(2, 10);

/* ---------------- public API ---------------- */
export const demoMode = !isConfigured;

export async function getSession() {
  if (demoMode) return { user: { id: 'demo', email: 'demo@dearjourney' } };
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function signInWithEmail(email) {
  if (demoMode) return { error: null };
  return supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined },
  });
}

export async function signOut() {
  if (demoMode) return;
  await supabase.auth.signOut();
}

export async function loadBook() {
  if (demoMode) return readLocal();

  const { data: trips, error } = await supabase.from('trips').select('*').order('created_at').limit(1);
  if (error) throw error;

  let trip = trips && trips[0];
  if (!trip) {
    const { data: created, error: e2 } = await supabase.from('trips').insert({
      title: 'My first trip', subtitle: '', home_currency: 'AUD', budget: 0,
      start_date: localIso(new Date()),
    }).select().single();
    if (e2) throw e2;
    trip = created;
    await supabase.from('travellers').insert([
      { trip_id: trip.id, name: 'You', initial: 'Y' },
      { trip_id: trip.id, name: 'Travel buddy', initial: 'B' },
    ]);
  }

  const [travellers, stops, expenses] = await Promise.all([
    supabase.from('travellers').select('*').eq('trip_id', trip.id).order('name'),
    supabase.from('stops').select('*').eq('trip_id', trip.id).order('day').order('sort'),
    supabase.from('expenses').select('*').eq('trip_id', trip.id).order('occurred_at', { ascending: false }),
  ]);

  return {
    trip,
    travellers: travellers.data || [],
    stops: stops.data || [],
    expenses: expenses.data || [],
  };
}

export async function saveTrip(trip, patch) {
  if (demoMode) {
    const book = readLocal();
    book.trip = { ...book.trip, ...patch };
    writeLocal(book);
    return book.trip;
  }
  const { data, error } = await supabase.from('trips').update(patch).eq('id', trip.id).select().single();
  if (error) throw error;
  return data;
}

export async function addStop(trip, stop) {
  if (demoMode) {
    const book = readLocal();
    book.stops.push({ id: uid(), sort: book.stops.length + 1, ...stop });
    book.stops.sort((a, b) => (a.day - b.day) || (a.time || '').localeCompare(b.time || ''));
    writeLocal(book);
    return book.stops;
  }
  const { error } = await supabase.from('stops').insert({ trip_id: trip.id, ...stop });
  if (error) throw error;
}

export async function removeStop(trip, id) {
  if (demoMode) {
    const book = readLocal();
    book.stops = book.stops.filter((s) => s.id !== id);
    writeLocal(book);
    return;
  }
  const { error } = await supabase.from('stops').delete().eq('id', id);
  if (error) throw error;
}

export async function addExpense(trip, expense) {
  if (demoMode) {
    const book = readLocal();
    book.expenses.unshift({ id: uid(), occurred_at: new Date().toISOString(), ...expense });
    writeLocal(book);
    return book.expenses;
  }
  const { error } = await supabase.from('expenses').insert({ trip_id: trip.id, ...expense });
  if (error) throw error;
}

export async function removeExpense(trip, id) {
  if (demoMode) {
    const book = readLocal();
    book.expenses = book.expenses.filter((e) => e.id !== id);
    writeLocal(book);
    return;
  }
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) throw error;
}

/* ---------------- derived numbers ---------------- */
export function homeAmount(e) {
  return Number(e.amount || 0) * Number(e.rate || 1);
}

export function totals(book) {
  const planned = book.stops.reduce((sum, s) => sum + Number(s.planned || 0), 0);
  const actual = book.expenses.reduce((sum, e) => sum + homeAmount(e), 0);
  const budget = Number(book.trip?.budget || 0);
  return { planned, actual, budget, remaining: budget - actual };
}

export function byCategory(book) {
  const plan = {};
  const act = {};
  book.stops.forEach((s) => { const k = s.category || 'other'; plan[k] = (plan[k] || 0) + Number(s.planned || 0); });
  book.expenses.forEach((e) => { const k = e.category || 'other'; act[k] = (act[k] || 0) + homeAmount(e); });
  const keys = Array.from(new Set([...Object.keys(plan), ...Object.keys(act)]));
  return keys.map((k) => ({ key: k, planned: plan[k] || 0, actual: act[k] || 0 })).sort((a, b) => b.actual - a.actual);
}

export function balances(book) {
  const people = book.travellers;
  if (!people.length) return [];
  const paid = {}; const share = {};
  people.forEach((p) => { paid[p.id] = 0; share[p.id] = 0; });
  book.expenses.forEach((e) => {
    const amount = homeAmount(e);
    if (e.paid_by && paid[e.paid_by] !== undefined) paid[e.paid_by] += amount;
    if (e.split === 'me' && e.paid_by && share[e.paid_by] !== undefined) {
      share[e.paid_by] += amount;
    } else {
      const each = amount / people.length;
      people.forEach((p) => { share[p.id] += each; });
    }
  });
  return people.map((p) => ({ ...p, paid: paid[p.id], share: share[p.id], net: paid[p.id] - share[p.id] }));
}

export function settleUp(book) {
  const list = balances(book).slice().sort((a, b) => a.net - b.net);
  if (list.length < 2) return null;
  const debtor = list[0]; const creditor = list[list.length - 1];
  const amount = Math.min(Math.abs(debtor.net), creditor.net);
  if (amount < 0.5) return null;
  return { from: debtor, to: creditor, amount };
}
