'use client';

/**
 * One conversation, WhatsApp style: header with presence/typing, day separators,
 * bubbles with time and ticks (✓ sent, ✓✓ read), older history on scroll-up,
 * and a composer (Enter sends, Shift+Enter new line).
 *
 * Messages are sent over REST with a client_id: the bubble shows at once,
 * a retry can't post twice, and the server's copy replaces it when it lands.
 * A message refused by the off-platform filter (chat/moderation.py) is taken
 * back out and its text returned to the composer with the reason shown.
 *
 * Sizes are px on purpose: the storefront sets html { font-size: 62.9% } and this
 * file is shared with it (frontend/components/chat).
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import {
  Alert, Avatar, Badge, Box, CircularProgress, IconButton, InputBase, Stack, Tooltip, Typography,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import {
  DEFAULT_POLICY, errorOf, getConversation, getMessages, markRead, mediaUrl, newClientId, sendMessage,
  type ChatConversation, type ChatErrorBody, type ChatMessage, type ChatPolicy, type ChatSide,
} from './chatApi';
import { sendTyping, useChatEvents } from './chatSocket';
import { dayLabel, lastSeenLabel, sameDay, timeLabel } from './chatFormat';
import { fieldBg, noticeBg, otherBubble, ownBubble, threadBg } from './chatTheme';

type Props = {
  side: ChatSide;
  conversation: ChatConversation;
  policy?: ChatPolicy;
  /** Mobile "back to chats". */
  onBack?: () => void;
  /** Hide the header (e.g. the storefront drawer has its own). */
  hideHeader?: boolean;
  /** Where the counterpart's name links to (the store page for shoppers). */
  counterpartHref?: string;
  /** Where a product card links to. */
  productHref?: (p: NonNullable<ChatMessage['product']>) => string | undefined;
  /** Tell the chat list about reads / sent messages. */
  onConversationChange?: (patch: Partial<ChatConversation> & { id: number }) => void;
};

const TYPING_SHOWN_MS = 4000;
const TYPING_SEND_EVERY_MS = 2500;

function upsert(list: ChatMessage[], m: ChatMessage) {
  const i = list.findIndex((x) => x.id === m.id || (!!m.client_id && x.client_id === m.client_id));
  const next = i >= 0 ? list.map((x, j) => (j === i ? { ...m, status: undefined } : x)) : [...list, m];
  // Stored messages in id order, still-sending ones after them.
  return next.sort((a, b) => (a.id > 0 ? 0 : 1) - (b.id > 0 ? 0 : 1) || (a.id > 0 ? a.id - b.id : 0));
}

export default function ChatThread({
  side, conversation, policy = DEFAULT_POLICY, onBack, hideHeader, counterpartHref, productHref, onConversationChange,
}: Props) {
  const id = conversation.id;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [otherRead, setOtherRead] = useState(conversation.other_last_read_id);
  const [typing, setTyping] = useState(false);
  const [presence, setPresence] = useState({ online: conversation.counterpart.online, last_seen: conversation.counterpart.last_seen });
  const [text, setText] = useState('');
  const [error, setError] = useState<ChatErrorBody | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const restoreFrom = useRef<number | null>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingSent = useRef(0);
  const pendingRead = useRef(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const readNow = useCallback(() => {
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
      pendingRead.current = true;
      return;
    }
    pendingRead.current = false;
    markRead(side, id).then(() => onConversationChange?.({ id, unread: 0 })).catch(() => {});
  }, [side, id, onConversationChange]);

  // ── Load ────────────────────────────────────────────────────────────────
  // After a reconnect: merge in whatever arrived while the socket was down.
  const loadLatest = useCallback(async () => {
    const data = await getMessages(side, id);
    setMessages((prev) => data.results.reduce(upsert, prev));
  }, [side, id]);

  useEffect(() => {
    let alive = true;
    setMessages([]); setHasMore(false); setLoading(true); setError(null); setTyping(false);
    setOtherRead(conversation.other_last_read_id);
    setPresence({ online: conversation.counterpart.online, last_seen: conversation.counterpart.last_seen });
    stick.current = true;
    getMessages(side, id)
      .then((data) => {
        if (!alive) return;
        setMessages(data.results);
        setHasMore(data.has_more);
        if (conversation.unread > 0 || data.results.some((m) => m.side !== side)) readNow();
      })
      .catch(() => alive && setError({ detail: "Couldn't load this chat. Check your connection.", code: 'network' }))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [side, id]);

  // Presence refresh while open.
  useEffect(() => {
    const t = setInterval(() => {
      getConversation(side, id).then((c) => {
        setPresence({ online: c.counterpart.online, last_seen: c.counterpart.last_seen });
        setOtherRead((r) => Math.max(r, c.other_last_read_id));
      }).catch(() => {});
    }, 60_000);
    return () => clearInterval(t);
  }, [side, id]);

  // Mark read when the tab comes back into view.
  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible' && pendingRead.current) readNow(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [readNow]);

  // ── Live ────────────────────────────────────────────────────────────────
  useChatEvents(side, (e) => {
    if (e.type === 'message' && e.message.conversation_id === id) {
      setMessages((prev) => upsert(prev, e.message));
      setOtherRead(e.conversation.other_last_read_id);
      if (e.message.side !== side) {
        setTyping(false);
        setPresence((p) => ({ ...p, online: true }));
        readNow();
      }
    } else if (e.type === 'read' && e.conversation_id === id && e.side !== side) {
      setOtherRead((r) => Math.max(r, e.last_read_id));
    } else if (e.type === 'typing' && e.conversation_id === id) {
      setTyping(true);
      setPresence((p) => ({ ...p, online: true }));
      if (typingTimer.current) clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setTyping(false), TYPING_SHOWN_MS);
    } else if (e.type === 'connected') {
      loadLatest().catch(() => {});
    }
  });

  // ── Scrolling ───────────────────────────────────────────────────────────
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (restoreFrom.current !== null) {
      el.scrollTop = el.scrollHeight - restoreFrom.current;
      restoreFrom.current = null;
    } else if (stick.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, typing]);

  const loadOlder = async () => {
    const first = messages.find((m) => m.id > 0);
    if (!first || loadingOlder || !hasMore) return;
    setLoadingOlder(true);
    try {
      const data = await getMessages(side, id, first.id);
      restoreFrom.current = (scrollRef.current?.scrollHeight ?? 0) - (scrollRef.current?.scrollTop ?? 0);
      setMessages((prev) => data.results.reduce(upsert, prev));
      setHasMore(data.has_more);
    } catch { /* try again on next scroll */ } finally {
      setLoadingOlder(false);
    }
  };

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (el.scrollTop < 60) loadOlder();
  };

  // ── Sending ─────────────────────────────────────────────────────────────
  const deliver = async (body: string, clientId: string) => {
    try {
      const saved = await sendMessage(side, id, body, clientId);
      setMessages((prev) => upsert(prev, saved));
      onConversationChange?.({
        id, last_message_preview: body.slice(0, 160), last_message_at: saved.created_at, last_sender_side: side,
        last_message_id: saved.id, unread: 0,
      });
    } catch (err) {
      const e = errorOf(err);
      if (e.code === 'network') {
        setMessages((prev) => prev.map((m) => (m.client_id === clientId ? { ...m, status: 'failed' } : m)));
        return;
      }
      // Refused (off-platform, muted, too long...): take the bubble back, return the text.
      setMessages((prev) => prev.filter((m) => m.client_id !== clientId));
      setText(body);
      setError(e);
    }
  };

  const send = () => {
    const body = text.trim();
    if (!body || muted) return;
    if (body.length > policy.max_length) {
      setError({ detail: `Messages can be up to ${policy.max_length} characters.`, code: 'too_long' });
      return;
    }
    const clientId = newClientId();
    setMessages((prev) => [...prev, {
      id: -Date.now(), conversation_id: id, side, body, created_at: new Date().toISOString(), client_id: clientId,
      sender_name: '', product: null, status: 'sending',
    }]);
    setText('');
    setError(null);
    stick.current = true;
    deliver(body, clientId);
    inputRef.current?.focus();
  };

  const retry = (m: ChatMessage) => {
    setMessages((prev) => prev.map((x) => (x.client_id === m.client_id ? { ...x, status: 'sending' } : x)));
    deliver(m.body, m.client_id);
  };

  const onChange = (value: string) => {
    setText(value);
    if (error && error.code !== 'muted') setError(null);
    const now = Date.now();
    if (value && now - lastTypingSent.current > TYPING_SEND_EVERY_MS) {
      lastTypingSent.current = now;
      sendTyping(side, id);
    }
  };

  const muted = error?.code === 'muted' && !!error.muted_until && new Date(error.muted_until) > new Date();

  // ── Render ──────────────────────────────────────────────────────────────
  const cp = conversation.counterpart;
  const status = typing ? 'typing…' : lastSeenLabel(presence.online, presence.last_seen);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, bgcolor: 'background.paper' }}>
      {!hideHeader && (
        <Stack direction="row" spacing={1.25} alignItems="center"
               sx={{ px: { xs: 1, sm: 2 }, py: 1.25, borderBottom: 1, borderColor: 'divider', minHeight: 64 }}>
          {onBack && (
            <IconButton onClick={onBack} aria-label="Back to chats" size="small"><ArrowBackRoundedIcon /></IconButton>
          )}
          <Badge overlap="circular" variant="dot" color="success" invisible={!presence.online}
                 anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
            <Avatar src={mediaUrl(cp.avatar)} sx={{ width: 42, height: 42, fontSize: 17, fontWeight: 700 }}>{cp.initials}</Avatar>
          </Badge>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            {counterpartHref ? (
              <Typography component={Link} href={counterpartHref as Route} noWrap
                          sx={{ fontSize: 16, fontWeight: 700, color: 'text.primary', textDecoration: 'none', display: 'block',
                                '&:hover': { textDecoration: 'underline' } }}>
                {cp.name}
              </Typography>
            ) : (
              <Typography noWrap sx={{ fontSize: 16, fontWeight: 700 }}>{cp.name}</Typography>
            )}
            <Typography noWrap sx={{ fontSize: 13, color: typing ? 'primary.main' : 'text.secondary', minHeight: 18 }}>
              {status}
            </Typography>
          </Box>
        </Stack>
      )}

      {/* Messages */}
      <Box ref={scrollRef} onScroll={onScroll}
           sx={[{ flex: 1, minHeight: 0, overflowY: 'auto', px: { xs: 1.25, sm: 3 }, py: 1.5 }, threadBg]}>
        <Stack alignItems="center" sx={{ mb: 1.5 }}>
          <Stack direction="row" spacing={0.75} alignItems="flex-start"
                 sx={[{ maxWidth: 460, px: 1.5, py: 1, borderRadius: 2 }, noticeBg]}>
            <LockRoundedIcon sx={{ fontSize: 15, mt: '2px', color: 'text.secondary' }} />
            <Typography sx={{ fontSize: 12.5, color: 'text.secondary', lineHeight: 1.45 }}>
              Keep chats, payments and deliveries on Negromart so your purchase stays protected. Phone numbers,
              emails and links can&apos;t be shared. Chats are deleted after {policy.retention_days} days.
            </Typography>
          </Stack>
        </Stack>

        {loadingOlder && <Box sx={{ textAlign: 'center', py: 1 }}><CircularProgress size={18} /></Box>}
        {loading && <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress size={24} /></Box>}

        {conversation.product && side === 'vendor' && !loading && (
          <Stack alignItems="center" sx={{ mb: 1.5 }}>
            <ProductCard product={conversation.product} href={productHref?.(conversation.product)} label="Asking about" />
          </Stack>
        )}

        {messages.map((m, i) => {
          const prev = messages[i - 1];
          const own = m.side === side;
          const newDay = !prev || !sameDay(prev.created_at, m.created_at);
          const grouped = !newDay && prev && prev.side === m.side;
          return (
            <Box key={m.client_id || m.id}>
              {newDay && (
                <Stack alignItems="center" sx={{ my: 1.5 }}>
                  <Typography sx={{ fontSize: 12, px: 1.25, py: 0.4, borderRadius: 1.5, bgcolor: 'background.paper',
                                    color: 'text.secondary', boxShadow: '0 1px 1px rgba(0,0,0,.06)' }}>
                    {dayLabel(m.created_at)}
                  </Typography>
                </Stack>
              )}
              <Stack alignItems={own ? 'flex-end' : 'flex-start'} sx={{ mt: grouped ? 0.4 : 1.25 }}>
                <Box sx={[{
                  maxWidth: { xs: '85%', sm: '70%' }, px: 1.25, pt: 0.75, pb: 0.5, borderRadius: 2,
                  borderTopRightRadius: own && !grouped ? 4 : 16, borderTopLeftRadius: !own && !grouped ? 4 : 16,
                  boxShadow: '0 1px 1px rgba(0,0,0,.08)',
                }, own ? ownBubble : otherBubble]}>
                  {m.side === 'vendor' && side === 'vendor' && m.sender_name && !grouped && (
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'primary.main', mb: 0.25 }}>{m.sender_name}</Typography>
                  )}
                  {m.product && <Box sx={{ mb: 0.75 }}><ProductCard product={m.product} href={productHref?.(m.product)} /></Box>}
                  <Typography sx={{ fontSize: 15, lineHeight: 1.45, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {m.body}
                  </Typography>
                  <Stack direction="row" spacing={0.4} alignItems="center" justifyContent="flex-end" sx={{ mt: 0.25 }}>
                    <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>{timeLabel(m.created_at)}</Typography>
                    {own && <Ticks message={m} read={m.id > 0 && m.id <= otherRead} onRetry={() => retry(m)} />}
                  </Stack>
                </Box>
                {m.status === 'failed' && (
                  <Typography component="button" type="button" onClick={() => retry(m)}
                              sx={{ fontSize: 12, color: 'error.main', border: 0, bgcolor: 'transparent', cursor: 'pointer', p: 0, mt: 0.25 }}>
                    Not sent. Tap to retry
                  </Typography>
                )}
              </Stack>
            </Box>
          );
        })}

        {typing && (
          <Stack alignItems="flex-start" sx={{ mt: 1 }}>
            <Box sx={[{ px: 1.5, py: 1, borderRadius: 2, boxShadow: '0 1px 1px rgba(0,0,0,.08)' }, otherBubble]}>
              <TypingDots />
            </Box>
          </Stack>
        )}
      </Box>

      {/* Composer */}
      <Box sx={{ borderTop: 1, borderColor: 'divider', px: { xs: 1, sm: 2 }, py: 1, bgcolor: 'background.paper' }}>
        {error && (
          <Alert severity={error.code === 'off_platform' || error.code === 'muted' ? 'warning' : 'error'}
                 onClose={muted ? undefined : () => setError(null)} sx={{ mb: 1, fontSize: 13.5, '& .MuiAlert-message': { lineHeight: 1.45 } }}>
            {error.detail}
            {muted && error.muted_until && (
              <> You can send messages again after {new Date(error.muted_until).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}.</>
            )}
          </Alert>
        )}
        <Stack direction="row" spacing={1} alignItems="flex-end">
          <Box sx={[{ flex: 1, px: 1.75, py: 1, borderRadius: 3 }, fieldBg]}>
            <InputBase
              inputRef={inputRef}
              value={text}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); }
              }}
              placeholder={muted ? 'Messaging is paused' : 'Type a message'}
              disabled={muted}
              multiline
              maxRows={5}
              fullWidth
              inputProps={{ maxLength: policy.max_length, 'aria-label': 'Message' }}
              sx={{ fontSize: 15 }}
            />
          </Box>
          <Tooltip title="Send">
            <span>
              <IconButton onClick={send} disabled={!text.trim() || muted} aria-label="Send message"
                          sx={{ width: 46, height: 46, bgcolor: 'primary.main', color: 'primary.contrastText',
                                '&:hover': { bgcolor: 'primary.dark' }, '&.Mui-disabled': { bgcolor: 'action.disabledBackground' } }}>
                <SendRoundedIcon sx={{ fontSize: 21 }} />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
        {text.length > policy.max_length * 0.8 && (
          <Typography sx={{ fontSize: 12, color: 'text.secondary', textAlign: 'right', mt: 0.5, pr: 7 }}>
            {text.length} / {policy.max_length}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

function Ticks({ message, read, onRetry }: { message: ChatMessage; read: boolean; onRetry: () => void }) {
  if (message.status === 'sending') return <ScheduleRoundedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />;
  if (message.status === 'failed') {
    return (
      <IconButton size="small" onClick={onRetry} aria-label="Retry sending" sx={{ p: 0 }}>
        <ErrorOutlineRoundedIcon sx={{ fontSize: 15, color: 'error.main' }} />
      </IconButton>
    );
  }
  return read
    ? <DoneAllRoundedIcon titleAccess="Read" sx={{ fontSize: 16, color: 'info.main' }} />
    : <DoneRoundedIcon titleAccess="Sent" sx={{ fontSize: 16, color: 'text.secondary' }} />;
}

function ProductCard({ product, href, label }: { product: NonNullable<ChatMessage['product']>; href?: string; label?: string }) {
  const body = (
    <Stack direction="row" spacing={1} alignItems="center"
           sx={{ p: 0.75, pr: 1.25, borderRadius: 1.5, bgcolor: 'action.hover', maxWidth: 320 }}>
      {product.image && (
        <Box component="img" src={mediaUrl(product.image)} alt="" sx={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 1, bgcolor: '#fff' }} />
      )}
      <Box sx={{ minWidth: 0 }}>
        {label && <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>{label}</Typography>}
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary', display: '-webkit-box', WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.title}
        </Typography>
      </Box>
    </Stack>
  );
  return href ? <Box component="a" href={href} target="_blank" rel="noreferrer" sx={{ textDecoration: 'none' }}>{body}</Box> : body;
}

function TypingDots() {
  return (
    <Stack direction="row" spacing={0.5} aria-label="typing" sx={{
      '& span': { width: 7, height: 7, borderRadius: '50%', bgcolor: 'text.secondary', opacity: 0.4,
                  animation: 'chatDot 1.2s infinite ease-in-out' },
      '& span:nth-of-type(2)': { animationDelay: '0.15s' },
      '& span:nth-of-type(3)': { animationDelay: '0.3s' },
      '@keyframes chatDot': { '0%, 80%, 100%': { opacity: 0.25, transform: 'translateY(0)' },
                              '40%': { opacity: 0.9, transform: 'translateY(-3px)' } },
    }}>
      <span /><span /><span />
    </Stack>
  );
}
