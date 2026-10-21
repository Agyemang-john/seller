'use client';

import { useEffect, useRef, useState } from 'react';
import { getUnread, type ChatSide } from './chatApi';
import { isViewing, useChatEvents } from './chatSocket';

/**
 * Number of chats with unread messages, kept live for nav badges.
 * A message arriving in the chat that's open on screen isn't "missed" (the
 * thread marks it read at once), so it doesn't bump the count.
 */
export default function useUnreadChats(side: ChatSide, enabled = true) {
  const [count, setCount] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { getUnread(side).then(setCount).catch(() => {}); }, 400);
  };

  useEffect(() => {
    if (!enabled) { setCount(0); return; }
    getUnread(side).then(setCount).catch(() => {});
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [side, enabled]);

  useChatEvents(side, (e) => {
    if (e.type === 'typing') return;
    if (e.type === 'message' && e.message.side !== side && isViewing(side, e.message.conversation_id)) return;
    refresh();
  }, enabled);
  return count;
}
