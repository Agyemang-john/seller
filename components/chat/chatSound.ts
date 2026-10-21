'use client';

/**
 * Incoming-message sounds.
 *
 *   chime  two-note "ding" for a message in a chat you're not looking at
 *   tick   short, quiet blip for a message in the chat that's open and visible
 *
 * The sounds are tiny WAVs synthesised here (no audio file to host) and played
 * with <audio> elements rather than Web Audio: Chrome lets media elements play
 * on sites the person uses regularly even before they click, which Web Audio
 * never allows. Where the browser still blocks sound (fresh page, no click yet),
 * the first click/tap/keypress unlocks it for every later message; that's a
 * browser rule nothing can get around.
 *
 * With several tabs open only one plays each message (a short localStorage
 * claim per message id). Muting is remembered per browser.
 */

const MUTE_KEY = 'negromart-chat-sound-muted';
const MUTE_EVENT = 'negromart-chat-sound-muted';

type Note = { start: number; freq: number; dur: number; peak: number };

const SOUNDS: Record<'chime' | 'tick', { notes: Note[]; length: number }> = {
  chime: {
    notes: [
      { start: 0, freq: 880, dur: 0.18, peak: 0.55 },      // A5
      { start: 0.11, freq: 1318.5, dur: 0.32, peak: 0.45 }, // E6
    ],
    length: 0.48,
  },
  tick: { notes: [{ start: 0, freq: 1046.5, dur: 0.1, peak: 0.3 }], length: 0.14 },
};

/** 16-bit mono PCM WAV of a few sine notes with a soft attack and decay. */
function synthesise({ notes, length }: { notes: Note[]; length: number }) {
  const rate = 22050;
  const n = Math.ceil(length * rate);
  const samples = new Float32Array(n);
  for (const note of notes) {
    const from = Math.floor(note.start * rate);
    const to = Math.min(n, Math.ceil((note.start + note.dur) * rate));
    for (let i = from; i < to; i++) {
      const t = i / rate - note.start;
      const env = t < 0.01 ? t / 0.01 : Math.exp((-4.5 * (t - 0.01)) / note.dur);
      samples[i] += note.peak * env * Math.sin(2 * Math.PI * note.freq * t);
    }
  }
  const buf = new ArrayBuffer(44 + n * 2);
  const v = new DataView(buf);
  const text = (at: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(at + i, s.charCodeAt(i)); };
  text(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); text(8, 'WAVE');
  text(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  text(36, 'data'); v.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, samples[i])) * 0x7fff, true);
  return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }));
}

const players: Partial<Record<'chime' | 'tick', HTMLAudioElement>> = {};

function player(kind: 'chime' | 'tick') {
  if (typeof window === 'undefined' || typeof Audio === 'undefined') return null;
  if (!players[kind]) {
    const el = new Audio(synthesise(SOUNDS[kind]));
    el.preload = 'auto';
    players[kind] = el;
  }
  return players[kind]!;
}

// The first interaction "unlocks" the elements (needed on iOS/Safari, and in
// Chrome on sites without enough prior engagement).
const UNLOCK_EVENTS = ['pointerdown', 'keydown', 'touchend', 'click'] as const;

function listenForUnlock(on: boolean) {
  for (const type of UNLOCK_EVENTS) {
    if (on) window.addEventListener(type, unlock, { passive: true });
    else window.removeEventListener(type, unlock);
  }
}

function unlock() {
  listenForUnlock(false);
  for (const kind of ['chime', 'tick'] as const) {
    const el = player(kind);
    if (!el) continue;
    el.muted = true;
    el.play()
      .then(() => { el.pause(); el.currentTime = 0; el.muted = false; })
      .catch(() => { el.muted = false; listenForUnlock(true); });
  }
}

if (typeof window !== 'undefined') listenForUnlock(true);

export function isChatSoundMuted() {
  try { return localStorage.getItem(MUTE_KEY) === '1'; } catch { return false; }
}

export function setChatSoundMuted(muted: boolean) {
  try { localStorage.setItem(MUTE_KEY, muted ? '1' : '0'); } catch { /* private mode */ }
  window.dispatchEvent(new CustomEvent(MUTE_EVENT, { detail: muted }));
  if (!muted) playMessageSound('chime', -Date.now()); // let them hear it when turning sound on
}

export function onChatSoundMutedChange(listener: (muted: boolean) => void) {
  const handler = (e: Event) => listener(Boolean((e as CustomEvent).detail));
  window.addEventListener(MUTE_EVENT, handler);
  return () => window.removeEventListener(MUTE_EVENT, handler);
}

/** First tab to claim a message plays its sound. */
function claim(messageId: number) {
  const key = `negromart-chat-sound:${messageId}`;
  try {
    if (localStorage.getItem(key)) return false;
    localStorage.setItem(key, '1');
    setTimeout(() => { try { localStorage.removeItem(key); } catch { /* ignore */ } }, 15_000);
  } catch { /* storage blocked: just play */ }
  return true;
}

export function playMessageSound(kind: 'chime' | 'tick', messageId: number) {
  if (isChatSoundMuted() || !claim(messageId)) return;
  const el = player(kind);
  if (!el) return;
  try {
    el.currentTime = 0;
    el.play().catch(() => {
      // Blocked until the person interacts with the page; the next click/tap unlocks later sounds.
      listenForUnlock(true);
    });
  } catch { /* no audio available */ }
}
