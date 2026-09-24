/**
 * GET /api/place-photo?q=<place name or search text>
 *
 * Looks the place up with the Places API (New) and streams back a real
 * photo of it. The Google API key lives only in this server route
 * (GOOGLE_PLACES_API_KEY) — it is never sent to the browser, unlike a
 * plain client-side lookup would.
 *
 * Two Places API calls happen the first time a place is looked up
 * (Text Search, then Place Photo media); after that the response is
 * cached by the browser/CDN for 30 days, so the same stop does not
 * re-query Google every time its page is opened.
 */
export const runtime = 'nodejs';

const PLACEHOLDER = new Response(null, { status: 204 }); // "no photo" — the Polaroid falls back to its blank card

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();
  if (!q) return new Response('Missing q', { status: 400 });

  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return PLACEHOLDER; // not set up yet — fail quietly, never break the page

  try {
    const searchRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': 'places.photos',
      },
      body: JSON.stringify({ textQuery: q }),
    });
    if (!searchRes.ok) return PLACEHOLDER;
    const data = await searchRes.json();
    const photoName = data?.places?.[0]?.photos?.[0]?.name; // "places/XXXX/photos/YYYY"
    if (!photoName) return PLACEHOLDER;

    const mediaUrl = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=480&key=${key}`;
    const photoRes = await fetch(mediaUrl);
    if (!photoRes.ok) return PLACEHOLDER;

    const buf = await photoRes.arrayBuffer();
    return new Response(buf, {
      headers: {
        'Content-Type': photoRes.headers.get('content-type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=2592000, immutable',
      },
    });
  } catch (e) {
    return PLACEHOLDER;
  }
}
