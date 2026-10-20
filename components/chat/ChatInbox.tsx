'use client';

/**
 * Chats page, WhatsApp style: the chat list on the left (search, All/Unread,
 * last message with ticks, time, unread badge, "typing…") and the open
 * conversation on the right. On phones one pane shows at a time.
 *
 * The open chat is in the URL (?c=<id>) so notification links and refreshes
 * land on it. Live updates come from the shared chat socket; after a
 * reconnect the first page is refetched so nothing is missed.
 *
 * Give it a parent with a fixed height (it fills 100%).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Avatar, Badge, Box, Chip, CircularProgress, InputBase, Stack, Typography, useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import ChatThread from './ChatThread';
import {
  cursorOf, DEFAULT_POLICY, getConversation, listConversations, mediaUrl,
  type ChatConversation, type ChatMessage, type ChatPolicy, type ChatSide,
} from './chatApi';
import { useChatEvents } from './chatSocket';
import { listLabel } from './chatFormat';

type Props = {
  side: ChatSide;
  title?: string;
  emptyHint?: string;
  counterpartHref?: (c: ChatConversation) => string | undefined;
  productHref?: (p: NonNullable<ChatMessage['product']>) => string | undefined;
};

const byRecent = (a: ChatConversation, b: ChatConversation) =>
  (b.last_message_at ?? '').localeCompare(a.last_message_at ?? '') || b.id - a.id;

export default function ChatInbox({ side, title = 'Chats', emptyHint, counterpartHref, productHref }: Props) {
  const theme = useTheme();
  const narrow = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const selectedId = Number(params.get('c')) || null;

  const [items, setItems] = useState<ChatConversation[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [policy, setPolicy] = useState<ChatPolicy>(DEFAULT_POLICY);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [typingIds, setTypingIds] = useState<Set<number>>(new Set());
  const typingTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  // Debounced search.
  useEffect(() => {
    const t = setTimeout(() => setQuery(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  const load = useCallback(async () => {
    const data = await listConversations(side, { q: query, unread: unreadOnly });
    setItems((prev) => {
      // Keep an open chat that isn't on the first page (e.g. opened from a notification).
      const keep = prev.filter((c) => c.id === selectedId && !data.results.some((r) => r.id === c.id));
      return [...data.results, ...keep].sort(byRecent);
    });
    setNext(data.next);
    setPolicy(data.policy ?? DEFAULT_POLICY);
  }, [side, query, unreadOnly, selectedId]);

  useEffect(() => {
    setLoading(true);
    load().catch(() => {}).finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [side, query, unreadOnly]);

  // Deep link to a chat that isn't in the list yet.
  useEffect(() => {
    if (!selectedId || items.some((c) => c.id === selectedId)) return;
    getConversation(side, selectedId)
      .then((c) => setItems((prev) => (prev.some((x) => x.id === c.id) ? prev : [...prev, c].sort(byRecent))))
      .catch(() => select(null));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, side, loading]);

  const loadMore = async () => {
    const cursor = cursorOf(next);
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const data = await listConversations(side, { q: query, unread: unreadOnly, cursor });
      setItems((prev) => [...prev, ...data.results.filter((r) => !prev.some((p) => p.id === r.id))]);
      setNext(data.next);
    } finally {
      setLoadingMore(false);
    }
  };

  const patch = useCallback((p: Partial<ChatConversation> & { id: number }) => {
    setItems((prev) => prev.map((c) => (c.id === p.id ? { ...c, ...p } : c)).sort(byRecent));
  }, []);

  useChatEvents(side, (e) => {
    if (e.type === 'message') {
      const incoming = { ...e.conversation };
      if (incoming.id === selectedId && e.message.side !== side) incoming.unread = 0; // the open thread reads it
      setItems((prev) => [incoming, ...prev.filter((c) => c.id !== incoming.id)].sort(byRecent));
      if (e.message.side !== side) stopTyping(incoming.id);
    } else if (e.type === 'read') {
      setItems((prev) => prev.map((c) => {
        if (c.id !== e.conversation_id) return c;
        return e.side === side ? { ...c, unread: 0 } : { ...c, other_last_read_id: Math.max(c.other_last_read_id, e.last_read_id) };
      }));
    } else if (e.type === 'typing') {
      setTypingIds((s) => new Set(s).add(e.conversation_id));
      clearTimeout(typingTimers.current[e.conversation_id]);
      typingTimers.current[e.conversation_id] = setTimeout(() => stopTyping(e.conversation_id), 4000);
    } else if (e.type === 'connected') {
      load().catch(() => {});
    }
  });

  function stopTyping(id: number) {
    setTypingIds((s) => { if (!s.has(id)) return s; const n = new Set(s); n.delete(id); return n; });
  }

  function select(id: number | null) {
    const sp = new URLSearchParams(params.toString());
    if (id) sp.set('c', String(id)); else sp.delete('c');
    const qs = sp.toString();
    router.replace((qs ? `${pathname}?${qs}` : pathname) as Route, { scroll: false });
  }

  const selected = useMemo(() => items.find((c) => c.id === selectedId) ?? null, [items, selectedId]);
  const showList = !narrow || !selectedId;
  const showThread = !narrow || !!selectedId;

  return (
    <Box sx={{ display: 'flex', height: '100%', minHeight: 0, bgcolor: 'background.paper', overflow: 'hidden' }}>
      {showList && (
        <Box sx={{ width: { xs: '100%', md: 380, lg: 420 }, flexShrink: 0, display: 'flex', flexDirection: 'column',
                   borderRight: { md: 1 }, borderColor: { md: 'divider' }, minHeight: 0 }}>
          <Box sx={{ px: 2, pt: 2, pb: 1 }}>
            <Typography component="h1" sx={{ fontSize: 22, fontWeight: 800, mb: 1.5 }}>{title}</Typography>
            <Stack direction="row" spacing={1} alignItems="center"
                   sx={{ px: 1.5, py: 0.75, borderRadius: 5, bgcolor: theme.palette.mode === 'dark' ? 'action.hover' : 'grey.100' }}>
              <SearchRoundedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
              <InputBase value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search chats" fullWidth
                         inputProps={{ 'aria-label': 'Search chats' }} sx={{ fontSize: 15 }} />
            </Stack>
            <Stack direction="row" spacing={1} sx={{ mt: 1.25 }}>
              <Chip label="All" onClick={() => setUnreadOnly(false)} color={unreadOnly ? 'default' : 'primary'}
                    variant={unreadOnly ? 'outlined' : 'filled'} sx={{ fontSize: 14, fontWeight: 600 }} />
              <Chip label="Unread" onClick={() => setUnreadOnly(true)} color={unreadOnly ? 'primary' : 'default'}
                    variant={unreadOnly ? 'filled' : 'outlined'} sx={{ fontSize: 14, fontWeight: 600 }} />
            </Stack>
          </Box>

          <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0 }}
               onScroll={(e) => {
                 const el = e.currentTarget;
                 if (el.scrollHeight - el.scrollTop - el.clientHeight < 120) loadMore();
               }}>
            {loading ? (
              <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress size={26} /></Box>
            ) : items.length === 0 ? (
              <Box sx={{ textAlign: 'center', px: 3, py: 6 }}>
                <ForumOutlinedIcon sx={{ fontSize: 44, color: 'text.disabled' }} />
                <Typography sx={{ fontSize: 16, fontWeight: 700, mt: 1 }}>
                  {query || unreadOnly ? 'No chats match' : 'No chats yet'}
                </Typography>
                {!query && !unreadOnly && emptyHint && (
                  <Typography sx={{ fontSize: 14, color: 'text.secondary', mt: 0.5 }}>{emptyHint}</Typography>
                )}
              </Box>
            ) : (
              items.map((c) => (
                <ChatRow key={c.id} c={c} side={side} active={c.id === selectedId} typing={typingIds.has(c.id)}
                         onClick={() => select(c.id)} />
              ))
            )}
            {loadingMore && <Box sx={{ textAlign: 'center', py: 2 }}><CircularProgress size={20} /></Box>}
          </Box>
          <Typography sx={{ fontSize: 12, color: 'text.secondary', textAlign: 'center', px: 2, py: 1, borderTop: 1, borderColor: 'divider' }}>
            Chats are deleted after {policy.retention_days} days.
          </Typography>
        </Box>
      )}

      {showThread && (
        <Box sx={{ flex: 1, minWidth: 0, minHeight: 0 }}>
          {selected ? (
            <ChatThread
              key={selected.id}
              side={side}
              conversation={selected}
              policy={policy}
              onBack={narrow ? () => select(null) : undefined}
              counterpartHref={counterpartHref?.(selected)}
              productHref={productHref}
              onConversationChange={patch}
            />
          ) : selectedId ? (
            <Box sx={{ height: '100%', display: 'grid', placeItems: 'center' }}><CircularProgress size={26} /></Box>
          ) : (
            <Box sx={{ height: '100%', display: 'grid', placeItems: 'center', textAlign: 'center', px: 4,
                       bgcolor: theme.palette.mode === 'dark' ? 'background.default' : '#f7f6f3' }}>
              <Box>
                <ForumOutlinedIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
                <Typography sx={{ fontSize: 20, fontWeight: 700, mt: 1 }}>Select a chat</Typography>
                <Typography sx={{ fontSize: 14, color: 'text.secondary', mt: 0.5, maxWidth: 360 }}>
                  Messages arrive here in real time. Keep payments and deliveries on Negromart so every order stays protected.
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

function ChatRow({ c, side, active, typing, onClick }: {
  c: ChatConversation; side: ChatSide; active: boolean; typing: boolean; onClick: () => void;
}) {
  const ownLast = c.last_sender_side === side;
  const read = ownLast && c.other_last_read_id >= c.last_message_id;
  const unread = c.unread > 0;
  return (
    <Box component="button" type="button" onClick={onClick} aria-current={active ? 'true' : undefined}
         sx={{
           display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', textAlign: 'left', border: 0, font: 'inherit',
           color: 'inherit', cursor: 'pointer', px: 2, py: 1.25, bgcolor: active ? 'action.selected' : 'transparent',
           '&:hover': { bgcolor: active ? 'action.selected' : 'action.hover' },
         }}>
      <Badge overlap="circular" variant="dot" color="success" invisible={!c.counterpart.online}
             anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Avatar src={mediaUrl(c.counterpart.avatar)} sx={{ width: 48, height: 48, fontSize: 18, fontWeight: 700 }}>
          {c.counterpart.initials}
        </Avatar>
      </Badge>
      <Box sx={{ flex: 1, minWidth: 0, borderBottom: 1, borderColor: 'divider', pb: 1.25, mb: -1.25 }}>
        <Stack direction="row" alignItems="baseline" spacing={1}>
          <Typography noWrap sx={{ flex: 1, fontSize: 16, fontWeight: unread ? 800 : 600 }}>{c.counterpart.name}</Typography>
          <Typography sx={{ fontSize: 12.5, color: unread ? 'primary.main' : 'text.secondary', fontWeight: unread ? 700 : 400, flexShrink: 0 }}>
            {listLabel(c.last_message_at)}
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.25 }}>
          {typing ? (
            <Typography noWrap sx={{ flex: 1, fontSize: 14, color: 'primary.main', fontWeight: 600 }}>typing…</Typography>
          ) : (
            <>
              {ownLast && (read
                ? <DoneAllRoundedIcon sx={{ fontSize: 17, color: 'info.main', flexShrink: 0 }} />
                : <DoneRoundedIcon sx={{ fontSize: 17, color: 'text.secondary', flexShrink: 0 }} />)}
              <Typography noWrap sx={{ flex: 1, fontSize: 14, color: unread ? 'text.primary' : 'text.secondary', fontWeight: unread ? 600 : 400 }}>
                {c.last_message_preview}
              </Typography>
            </>
          )}
          {unread && (
            <Box sx={{ minWidth: 22, height: 22, px: 0.75, borderRadius: 11, bgcolor: 'primary.main', color: 'primary.contrastText',
                       fontSize: 12, fontWeight: 700, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              {c.unread > 99 ? '99+' : c.unread}
            </Box>
          )}
        </Stack>
      </Box>
    </Box>
  );
}
