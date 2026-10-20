/** Date/time labels for chat, WhatsApp style. Plain Intl so both apps share it. */

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
const DAY = 86_400_000;

export function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

/** Chat list: "21:25" today, "Yesterday", "Friday" this week, else a date. */
export function listLabel(iso: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  const days = Math.round((startOfDay(new Date()) - startOfDay(d)) / DAY);
  if (days <= 0) return timeLabel(iso);
  if (days === 1) return 'Yesterday';
  if (days < 7) return d.toLocaleDateString(undefined, { weekday: 'long' });
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: '2-digit' });
}

/** Separator between days in a thread. */
export function dayLabel(iso: string) {
  const d = new Date(iso);
  const days = Math.round((startOfDay(new Date()) - startOfDay(d)) / DAY);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return d.toLocaleDateString(undefined, { weekday: 'long' });
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
}

export function sameDay(a: string, b: string) {
  return startOfDay(new Date(a)) === startOfDay(new Date(b));
}

export function lastSeenLabel(online: boolean, lastSeen: string | null) {
  if (online) return 'Online';
  if (!lastSeen) return '';
  const d = new Date(lastSeen);
  const days = Math.round((startOfDay(new Date()) - startOfDay(d)) / DAY);
  if (days <= 0) return `Last seen today at ${timeLabel(lastSeen)}`;
  if (days === 1) return `Last seen yesterday at ${timeLabel(lastSeen)}`;
  return `Last seen ${d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`;
}
