'use client';

/**
 * Open the photo studio from anywhere and get the finished photos back:
 *
 *   const studio = usePhotoStudio();
 *   const files = await studio.open([{ source: file, name: file.name }]);
 *   // files[i]: the edited File, or null when the seller kept photo i as it was;
 *   // files itself is null when the studio was closed.
 *   ...
 *   return <>{studio.element}…</>;
 *
 * The studio's code (and its AI engine) only loads when it is first opened.
 */

import { useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import { studioSupported } from './engine';

const PhotoStudio = dynamic(() => import('./PhotoStudio'), { ssr: false });

let sessionId = 0;

export function usePhotoStudio() {
  const [session, setSession] = useState(null);

  const open = useCallback((items, options = {}) => new Promise((resolve) => {
    const list = (items || []).filter((it) => it?.source);
    if (!list.length || !studioSupported()) { resolve(null); return; }
    sessionId += 1;
    setSession({ id: sessionId, items: list, options, resolve });
  }), []);

  const finish = (value) => {
    session?.resolve(value);
    setSession(null);
  };

  const element = session ? (
    <PhotoStudio key={session.id} items={session.items} title={session.options.title}
      onDone={(files) => finish(files)} onClose={() => finish(null)} />
  ) : null;

  return { open, element };
}

/** Name for a photo's source: a File's name, or the end of a URL. */
export function photoName(source, fallback = 'photo') {
  if (source && typeof source === 'object' && source.name) return source.name;
  if (typeof source === 'string' && !source.startsWith('data:')) {
    return decodeURIComponent(source.split('?')[0].split('/').pop() || fallback);
  }
  return fallback;
}
