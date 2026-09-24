export function money(n, currency = 'AUD') {
  const v = Number(n || 0);
  const symbols = { AUD: 'A$', THB: '\u0e3f', USD: '$', EUR: '\u20ac', JPY: '\u00a5', NZD: 'NZ$', GBP: '\u00a3' };
  const s = symbols[currency] || currency + ' ';
  const dec = ['THB', 'JPY'].includes(currency) ? 0 : 2;
  return s + v.toLocaleString('en-AU', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

export function shortDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' });
}

/** day number (1-based) of a date inside the trip */
export function dayOf(trip, date = new Date()) {
  if (!trip?.start_date) return 1;
  const start = new Date(trip.start_date + 'T00:00:00');
  const here = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = Math.round((here - start) / 86400000) + 1;
  return Math.max(1, diff);
}

/** yyyy-mm-dd from a Date, read in local time (never UTC) */
export function localIso(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function dateOfDay(trip, day) {
  if (!trip?.start_date) return null;
  const d = new Date(trip.start_date + 'T00:00:00');
  d.setDate(d.getDate() + (day - 1));
  return localIso(d);
}

export function mapsUrl(q) {
  return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q || '');
}

/**
 * The photo to show for a stop: the one the traveller pasted in, or — if there is
 * none — a real photo of that place fetched automatically (via our own
 * /api/place-photo route, so the Google API key never reaches the browser).
 * Returns null only when there is truly nothing to look up.
 */
export function photoFor(stop) {
  if (!stop) return null;
  if (stop.photo_url) return stop.photo_url;
  const q = stop.maps_query || stop.title;
  return q ? '/api/place-photo?q=' + encodeURIComponent(q) : null;
}
