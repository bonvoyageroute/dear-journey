'use client';
import Header from '../../../components/Header';
import Polaroid from '../../../components/Polaroid';
import Gate from '../../../components/Gate';
import { useBook } from '../../../lib/useBook';
import { mapsUrl } from '../../../lib/format';

export default function Moodboard() {
  const { book, error, needsLogin } = useBook();
  if (!book) return <Gate error={error} needsLogin={needsLogin} />;

  const withPhotos = book.stops.filter((s) => s.photo_url);

  return (
    <div className="sheet">
      <Header kicker="Chapter four &mdash; Moodboard" title="The vibe" right={`${withPhotos.length} saved`} />
      {withPhotos.length === 0 ? (
        <div className="empty">
          Add a photo link to any stop in Plan and it lands here as a polaroid. Keeping links instead of uploads keeps the book light.
        </div>
      ) : (
        <div className="polrow">
          {withPhotos.map((s, i) => (
            <a key={s.id} href={mapsUrl(s.maps_query || s.title)} target="_blank" rel="noreferrer">
              <Polaroid photo={s.photo_url} caption={s.title} tilt={['a', 'b', 'a'][i % 3]} big />
            </a>
          ))}
        </div>
      )}
      <div className="slip" style={{ marginTop: 26 }}>The vibe, collected.</div>
    </div>
  );
}
