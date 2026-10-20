'use client';

import { useEffect, useRef, useState } from 'react';
import { getUnread, type ChatSide } from './chatApi';
import { useChatEvents } from './chatSocket';

/** Number of chats with unread messages, kept live for nav badges. */
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

  useChatEvents(side, (e) => { if (e.type !== 'typing') refresh(); }, enabled);
  return count;
}
