'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Badge, IconButton, Popover, Box, Typography, Divider,
  Button, Chip, Tooltip, CircularProgress,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { createAxiosClient } from '@/utils/clientFetch';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import * as timeago from 'timeago.js';
import { getNotifMeta } from '@/utils/notifMeta';
import toast from 'react-hot-toast';

// ── Palette ──────────────────────────────────────────────────────────────────
const P = {
  bg: '#FAFAFA',
  surface: '#FFFFFF',
  border: '#EEEEEE',
  label: '#212121',
  body: '#424242',
  muted: '#757575',
  unreadBg: '#EFF6FF',
  unreadBorder: '#BFDBFE',
};

export default function NotificationBell() {
  const axiosClient = createAxiosClient();
  const wsRef = useRef(null);
  const anchorRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [wsReady, setWsReady] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  // ── WebSocket connection ──────────────────────────────────────────────────
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
          // Show toast for new notifications (count went up)
          if (msg.trigger_toast) {
            toast.success('You have a new notification', { duration: 3500 });
          }
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

  const handleMarkRead = (id) => {
    // Optimistic
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    sendWs({ action: 'mark_read', id });
  };

  const handleMarkAllRead = () => {
    if (markingAll) return;
    setMarkingAll(true);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    sendWs({ action: 'mark_all_read' });
    setTimeout(() => setMarkingAll(false), 800);
  };

  const latest = notifications.slice(0, 6);

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          ref={anchorRef}
          onClick={() => setOpen((v) => !v)}
          sx={{ ml: 0.5 }}
        >
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorRef.current}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          elevation: 4,
          sx: {
            width: 380,
            maxHeight: 520,
            borderRadius: '14px',
            overflow: 'hidden',
            border: `1px solid ${P.border}`,
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 2.5, py: 1.75,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: `1px solid ${P.border}`,
            background: P.surface,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: P.label }}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={unreadCount}
                size="small"
                sx={{ height: 18, fontSize: 10, fontWeight: 700, background: '#EF4444', color: '#fff', borderRadius: '9px', '& .MuiChip-label': { px: 0.75 } }}
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {unreadCount > 0 && (
              <Button
                size="small"
                startIcon={<DoneAllIcon sx={{ fontSize: '14px !important' }} />}
                onClick={handleMarkAllRead}
                disabled={markingAll}
                sx={{ fontSize: 11, fontWeight: 600, color: P.muted, textTransform: 'none', minWidth: 0, px: 1 }}
              >
                {markingAll ? 'Marking…' : 'Mark all read'}
              </Button>
            )}
          </Box>
        </Box>

        {/* Notification list */}
        <Box sx={{ overflowY: 'auto', maxHeight: 390, background: P.bg }}>
          <AnimatePresence initial={false}>
            {latest.length === 0 ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <NotificationsIcon sx={{ fontSize: 36, color: '#D1D5DB', mb: 1 }} />
                <Typography sx={{ fontSize: 13, color: P.muted }}>No notifications yet</Typography>
              </Box>
            ) : (
              latest.map((n, idx) => {
                const meta = getNotifMeta(n.verb, n.data);
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 40 }}
                    transition={{ duration: 0.18, delay: idx * 0.03 }}
                  >
                    <Box
                      onClick={() => {
                        if (!n.is_read) handleMarkRead(n.id);
                        setOpen(false);
                      }}
                      sx={{
                        px: 2.5, py: 1.5,
                        display: 'flex', gap: 1.5, alignItems: 'flex-start',
                        cursor: 'pointer',
                        background: n.is_read ? 'transparent' : P.unreadBg,
                        borderLeft: n.is_read ? '3px solid transparent' : `3px solid ${meta.color}`,
                        transition: 'background 0.15s',
                        '&:hover': { background: '#F3F4F6' },
                      }}
                    >
                      {/* Icon */}
                      <Box
                        sx={{
                          width: 36, height: 36, borderRadius: '10px',
                          background: `${meta.color}18`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, mt: 0.25,
                        }}
                      >
                        <meta.Icon sx={{ fontSize: 18, color: meta.color }} />
                      </Box>

                      {/* Content */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontSize: 12.5, fontWeight: n.is_read ? 500 : 700,
                            color: P.label, lineHeight: 1.3,
                          }}
                        >
                          {n.data?.title || n.verb_display}
                        </Typography>
                        {n.data?.message && (
                          <Typography
                            sx={{
                              fontSize: 11.5, color: P.body, mt: 0.3,
                              overflow: 'hidden', textOverflow: 'ellipsis',
                              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {n.data.message}
                          </Typography>
                        )}
                        <Typography sx={{ fontSize: 10.5, color: P.muted, mt: 0.4 }}>
                          {timeago.format(n.created_at)}
                        </Typography>
                      </Box>

                      {/* Unread dot */}
                      {!n.is_read && (
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: meta.color, flexShrink: 0, mt: 0.75 }} />
                      )}
                    </Box>
                    {idx < latest.length - 1 && <Divider sx={{ mx: 2.5, borderColor: P.border }} />}
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            px: 2.5, py: 1.25,
            borderTop: `1px solid ${P.border}`,
            background: P.surface,
            textAlign: 'center',
          }}
        >
          <Link href="/notifications" onClick={() => setOpen(false)} style={{ textDecoration: 'none' }}>
            <Typography
              sx={{ fontSize: 12.5, fontWeight: 600, color: '#1565C0', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            >
              View all notifications →
            </Typography>
          </Link>
        </Box>
      </Popover>
    </>
  );
}
