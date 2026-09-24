'use client';
import { useState } from 'react';

export default function Polaroid({ photo, caption, tilt = 'a', big = false }) {
  const [failed, setFailed] = useState(false);
  const show = photo && !failed;
  return (
    <div className={'pol ' + tilt + (big ? ' big' : '')}>
      <span className="tp" />
      {show ? (
        <img src={photo} alt="" onError={() => setFailed(true)} />
      ) : (
        <span className="ph" />
      )}
      <div className="cap">{caption}</div>
    </div>
  );
}
