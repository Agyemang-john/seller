'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Box, Typography, Chip, Button, Divider, Tabs, Tab,
  IconButton, Tooltip, CircularProgress, Skeleton,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckIcon from '@mui/icons-material/Check';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { motion, AnimatePresence } from 'framer-motion';
import { createAxiosClient } from '@/utils/clientFetch';
import { getNotifMeta } from '@/utils/notifMeta';
import * as timeago from 'timeago.js';
import Link from 'next/link';
import toast from 'react-hot-toast';

// ── Palette ──────────────────────────────────────────────────────────────────
// Derived from the single design base (theme palette) so it tracks light/dark mode.
function useNotifPalette() {
  const t = useTheme();
  return {
    bg: t.palette.background.default,
    surface: t.palette.background.paper,
    border: t.palette.divider,
    label: t.palette.text.primary,
    body: t.palette.text.secondary,
    muted: t.palette.text.disabled,
    unreadBg: alpha(t.palette.info.main, 0.08),
    hoverRead: t.palette.action.hover,
    hoverUnread: alpha(t.palette.info.main, 0.12),
    danger: t.palette.error.main,
    dangerTint: alpha(t.palette.error.main, 0.12),
    success: t.palette.success.main,
    successTint: alpha(t.palette.success.main, 0.15),
    warning: t.palette.warning.main,
  };
}

// ── Verb category buckets ─────────────────────────────────────────────────────
const CATEGORIES = {
  all: () => true,
  orders: (v) => v.startsWith('vendor_order') || v.startsWith('customer_order') || v === 'vendor_new_order',
  payments: (v) => ['vendor_payout', 'vendor_withdrawal_request', 'vendor_withdrawal_approved', 'customer_refund_processed'].includes(v),
  reviews: (v) => ['vendor_new_review', 'customer_review_reminder'].includes(v),
  system: (v) => ['announcement', 'verification_update', 'subscription_reminder', 'support_reply', 'message'].includes(v),
};

const CAT_LABELS = { all: 'All', orders: 'Orders', payments: 'Payments', reviews: 'Reviews', system: 'System' };

// ── Single notification row ───────────────────────────────────────────────────
function NotifRow({ n, onMarkRead, onDelete }) {
  const P = useNotifPalette();
  const meta = getNotifMeta(n.verb, n.data);
  const url = n.data?.url || '#';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 60, transition: { duration: 0.15 } }}
      transition={{ duration: 0.2 }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          px: 3,
          py: 2,
          alignItems: 'flex-start',
          background: n.is_read ? P.surface : P.unreadBg,
          borderLeft: `4px solid ${n.is_read ? 'transparent' : meta.color}`,
          transition: 'background 0.2s',
          '&:hover': { background: n.is_read ? P.hoverRead : P.hoverUnread },
        }}
      >
        {/* Icon */}
        <Box
          sx={{
            width: 42, height: 42, borderRadius: '11px', flexShrink: 0, mt: 0.25,
            background: `${meta.color}15`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <meta.Icon sx={{ fontSize: 20, color: meta.color }} />
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography sx={{ fontSize: 13.5, fontWeight: n.is_read ? 500 : 700, color: P.label }}>
              {n.data?.title || n.verb_display}
            </Typography>
            {!n.is_read && (
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
            )}
          </Box>

          {n.data?.message && (
            <Typography sx={{ fontSize: 12.5, color: P.body, mt: 0.35, lineHeight: 1.45 }}>
              {n.data.message}
            </Typography>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.75, flexWrap: 'wrap' }}>
            <Typography sx={{ fontSize: 11, color: P.muted }}>
              {timeago.format(n.created_at)}
            </Typography>
            {n.data?.url && n.data.url !== '#' && (
              <Link href={n.data.url} style={{ textDecoration: 'none' }}>
                <Typography
                  sx={{
                    fontSize: 11, color: meta.color, fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 0.3,
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  View <OpenInNewIcon sx={{ fontSize: 11 }} />
                </Typography>
              </Link>
            )}
          </Box>
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, mt: 0.25 }}>
          {!n.is_read && (
            <Tooltip title="Mark as read">
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); onMarkRead(n.id); }}
                sx={{ color: P.success, '&:hover': { background: P.successTint } }}
              >
                <CheckIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onDelete(n.id); }}
              sx={{ color: P.muted, '&:hover': { background: P.dangerTint, color: P.danger } }}
            >
              <DeleteOutlineIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function NotificationsList() {
  const P = useNotifPalette();
  const axiosClient = createAxiosClient();
  const wsRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [tab, setTab] = useState('all');       // 'all' | 'unread'
  const [category, setCategory] = useState('all');
  const [wsReady, setWsReady] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  // ── WebSocket ─────────────────────────────────────────────────────────────
  const connect = useCallback(async () => {
    try {
      const res = await axiosClient.get('/api/v1/notification/ws-token/');
      const token = res.data?.token;
      if (!token) return;

      const ws = new WebSocket(
        `${process.env.NEXT_PUBLIC_WS_URL}/ws/notifications/?token=${token}`
      );
      wsRef.current = ws;

      ws.onopen = () => setWsReady(true);
      ws.onclose = () => {
        setWsReady(false);
        setTimeout(connect, 4000);
      };
      ws.onerror = () => ws.close();

      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.type === 'refresh_list') {
          setNotifications(msg.notifications || []);
          setUnreadCount(msg.unread_count ?? 0);
        }
        if (msg.type === 'unread_count') {
          setUnreadCount(msg.count ?? 0);
          if (msg.trigger_toast) toast.success('New notification!');
        }
      };
    } catch {
      setTimeout(connect, 5000);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => wsRef.current?.close();
  }, []);

  const sendWs = (payload) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  };

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleMarkRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    sendWs({ action: 'mark_read', id });
  };

  const handleDelete = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    const wasUnread = notifications.find((n) => n.id === id && !n.is_read);
    if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
    sendWs({ action: 'delete', id });
  };

  const handleMarkAllRead = () => {
    if (markingAll) return;
    setMarkingAll(true);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    sendWs({ action: 'mark_all_read' });
    setTimeout(() => setMarkingAll(false), 800);
  };

  // ── Filtering ─────────────────────────────────────────────────────────────
  const visible = notifications.filter((n) => {
    if (tab === 'unread' && n.is_read) return false;
    return CATEGORIES[category]?.(n.verb) ?? true;
  });

  return (
    <Box sx={{ background: P.bg, minHeight: '100vh', pb: 6 }}>
      <Box sx={{ maxWidth: 760, mx: 'auto', px: { xs: 1, md: 3 }, pt: 3 }}>

        {/* ── Page header ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <NotificationsNoneIcon sx={{ fontSize: 24, color: P.muted }} />
            <Typography sx={{ fontSize: 20, fontWeight: 800, color: P.label }}>Notifications</Typography>
            {unreadCount > 0 && (
              <Chip
                label={`${unreadCount} unread`}
                size="small"
                sx={{ bgcolor: 'error.main', color: 'common.white', fontWeight: 700, fontSize: 11, height: 20, borderRadius: '10px' }}
              />
            )}
          </Box>
          {unreadCount > 0 && (
            <Button
              size="small"
              variant="outlined"
              startIcon={markingAll ? <CircularProgress size={12} /> : <DoneAllIcon sx={{ fontSize: '14px !important' }} />}
              onClick={handleMarkAllRead}
              disabled={markingAll}
              sx={{ fontSize: 12, fontWeight: 600, borderRadius: '8px', textTransform: 'none', borderColor: P.border, color: P.body }}
            >
              {markingAll ? 'Marking…' : 'Mark all as read'}
            </Button>
          )}
        </Box>

        {/* ── Tabs: All / Unread ── */}
        <Box sx={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: '12px 12px 0 0', overflow: 'hidden', mb: 0 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{
              px: 2, minHeight: 44,
              '& .MuiTab-root': { fontSize: 12.5, fontWeight: 600, textTransform: 'none', minHeight: 44, color: P.muted },
              '& .Mui-selected': { color: P.label },
              '& .MuiTabs-indicator': { height: 2, borderRadius: 2 },
            }}
          >
            <Tab value="all" label="All" />
            <Tab
              value="unread"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  Unread
                  {unreadCount > 0 && (
                    <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: 'error.main', color: 'common.white', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Box>
                  )}
                </Box>
              }
            />
          </Tabs>

          {/* Category filter chips */}
          <Box sx={{ px: 2, pb: 1.25, display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
            {Object.entries(CAT_LABELS).map(([key, label]) => (
              <Chip
                key={key}
                label={label}
                size="small"
                onClick={() => setCategory(key)}
                sx={{
                  height: 24, fontSize: 11.5, fontWeight: 600, borderRadius: '6px', cursor: 'pointer',
                  background: category === key ? P.label : P.bg,
                  color: category === key ? P.surface : P.muted,
                  border: `1px solid ${category === key ? P.label : P.border}`,
                  '&:hover': { background: category === key ? P.body : P.hoverRead },
                }}
              />
            ))}
          </Box>
        </Box>

        {/* ── Notification list ── */}
        <Box
          sx={{
            background: P.surface,
            border: `1px solid ${P.border}`,
            borderTop: 'none',
            borderRadius: '0 0 12px 12px',
            overflow: 'hidden',
          }}
        >
          {!wsReady && notifications.length === 0 ? (
            // Loading skeleton
            <Box sx={{ px: 3 }}>
              {[...Array(5)].map((_, i) => (
                <Box key={i} sx={{ py: 2, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Skeleton variant="rounded" width={42} height={42} sx={{ borderRadius: '11px', flexShrink: 0 }} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="55%" height={18} />
                    <Skeleton variant="text" width="80%" height={15} sx={{ mt: 0.5 }} />
                    <Skeleton variant="text" width="30%" height={13} sx={{ mt: 0.5 }} />
                  </Box>
                </Box>
              ))}
            </Box>
          ) : visible.length === 0 ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <NotificationsNoneIcon sx={{ fontSize: 44, color: 'text.disabled', mb: 1.5 }} />
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: P.label }}>
                {tab === 'unread' ? 'All caught up!' : 'No notifications'}
              </Typography>
              <Typography sx={{ fontSize: 12.5, color: P.muted, mt: 0.5 }}>
                {tab === 'unread' ? 'You have no unread notifications.' : 'Notifications will appear here when they arrive.'}
              </Typography>
            </Box>
          ) : (
            <AnimatePresence initial={false}>
              {visible.map((n, idx) => (
                <Box key={n.id}>
                  <NotifRow n={n} onMarkRead={handleMarkRead} onDelete={handleDelete} />
                  {idx < visible.length - 1 && <Divider sx={{ borderColor: P.border }} />}
                </Box>
              ))}
            </AnimatePresence>
          )}
        </Box>

        {/* Live indicator */}
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography sx={{ fontSize: 11, color: P.muted }}>
            {wsReady
              ? <><span style={{ color: P.success }}>●</span> Live — updates appear automatically</>
              : <><span style={{ color: P.warning }}>●</span> Reconnecting…</>
            }
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
