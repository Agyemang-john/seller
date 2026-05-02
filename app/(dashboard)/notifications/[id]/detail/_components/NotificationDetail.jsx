'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createAxiosClient } from '@/utils/clientFetch';
import {
  Box, Typography, Chip, Divider, Skeleton, Button,
} from '@mui/material';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { getNotifMeta } from '@/utils/notifMeta';
import * as timeago from 'timeago.js';
import Link from 'next/link';

const P = {
  bg: '#F5F5F5',
  surface: '#FFFFFF',
  border: '#E0E0E0',
  label: '#212121',
  body: '#424242',
  muted: '#757575',
};

export default function NotificationDetail() {
  const { id } = useParams();
  const router = useRouter();
  const axiosClient = createAxiosClient();
  const wsRef = useRef(null);

  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Mark as read via WebSocket on open
  useEffect(() => {
    let mounted = true;
    const connect = async () => {
      try {
        const res = await axiosClient.get('/api/v1/notification/ws-token/');
        const token = res.data?.token;
        if (!token || !mounted) return;
        const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/ws/notifications/?token=${token}`);
        wsRef.current = ws;
        ws.onopen = () => {
          ws.send(JSON.stringify({ action: 'view_detail', id: parseInt(id) }));
        };
        ws.onclose = () => setTimeout(connect, 4000);
      } catch { setTimeout(connect, 5000); }
    };
    connect();
    return () => { mounted = false; wsRef.current?.close(); };
  }, [id]);

  // Fetch notification detail
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(false);
    axiosClient.get(`/api/v1/notification/${id}/`)
      .then((res) => setNotification(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  const meta = notification ? getNotifMeta(notification.verb, notification.data) : null;

  return (
    <Box sx={{ background: P.bg, minHeight: '100vh', pb: 6 }}>
      <Box sx={{ maxWidth: 640, mx: 'auto', px: { xs: 1.5, md: 3 }, pt: 3 }}>

        {/* Back button */}
        <Button
          startIcon={<ArrowBackIcon sx={{ fontSize: '16px !important' }} />}
          onClick={() => router.back()}
          sx={{ fontSize: 12.5, fontWeight: 600, color: P.muted, textTransform: 'none', mb: 2, pl: 0 }}
        >
          Back to notifications
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Box sx={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: '14px', overflow: 'hidden' }}>

            {loading ? (
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 2 }}>
                  <Skeleton variant="rounded" width={52} height={52} sx={{ borderRadius: '13px', flexShrink: 0 }} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="60%" height={24} />
                    <Skeleton variant="text" width="35%" height={16} sx={{ mt: 0.5 }} />
                  </Box>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Skeleton variant="rounded" width="100%" height={80} sx={{ borderRadius: '8px' }} />
                <Skeleton variant="rounded" width="50%" height={36} sx={{ borderRadius: '8px', mt: 2 }} />
              </Box>
            ) : error || !notification ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <ErrorOutlineIcon sx={{ fontSize: 44, color: '#EF4444', mb: 1.5 }} />
                <Typography sx={{ fontSize: 15, fontWeight: 700, color: P.label }}>Notification not found</Typography>
                <Typography sx={{ fontSize: 13, color: P.muted, mt: 0.5 }}>It may have been deleted.</Typography>
                <Button onClick={() => router.push('/notifications')} sx={{ mt: 2, textTransform: 'none', fontWeight: 600 }}>
                  Go back
                </Button>
              </Box>
            ) : (
              <>
                {/* Color accent bar */}
                <Box sx={{ height: 4, background: meta.color }} />

                <Box sx={{ p: 3 }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 2.5 }}>
                    <Box
                      sx={{
                        width: 52, height: 52, borderRadius: '13px', flexShrink: 0,
                        background: `${meta.color}15`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <meta.Icon sx={{ fontSize: 26, color: meta.color }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: 16, fontWeight: 800, color: P.label, lineHeight: 1.2 }}>
                        {notification.data?.title || notification.verb_display}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: P.muted, mt: 0.4 }}>
                        {timeago.format(notification.created_at)}
                        {' · '}
                        {new Date(notification.created_at).toLocaleString('en-GB', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </Typography>
                    </Box>
                    <Chip
                      label={notification.is_read ? 'Read' : 'Unread'}
                      size="small"
                      icon={notification.is_read ? <CheckCircleIcon /> : undefined}
                      sx={{
                        fontSize: 11, fontWeight: 700, height: 22, borderRadius: '6px', flexShrink: 0,
                        background: notification.is_read ? '#E8F5E9' : '#EFF6FF',
                        color: notification.is_read ? '#2E7D32' : '#1565C0',
                        '& .MuiChip-icon': { fontSize: 13 },
                      }}
                    />
                  </Box>

                  <Divider sx={{ borderColor: P.border, mb: 2.5 }} />

                  {/* Message body */}
                  {notification.data?.message && (
                    <Box sx={{ background: '#FAFAFA', border: `1px solid ${P.border}`, borderRadius: '10px', p: 2.5, mb: 2.5 }}>
                      <Typography sx={{ fontSize: 14, color: P.body, lineHeight: 1.7 }}>
                        {notification.data.message}
                      </Typography>
                    </Box>
                  )}

                  {/* Metadata chips */}
                  {(notification.data?.order_number || notification.data?.vendor_name || notification.data?.total_amount) && (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2.5 }}>
                      {notification.data?.order_number && (
                        <Chip label={`Order #${notification.data.order_number}`} size="small" sx={{ fontSize: 11, fontWeight: 700, background: `${meta.color}12`, color: meta.color, borderRadius: '6px' }} />
                      )}
                      {notification.data?.vendor_name && (
                        <Chip label={notification.data.vendor_name} size="small" sx={{ fontSize: 11, background: '#F5F5F5', color: P.muted, borderRadius: '6px' }} />
                      )}
                      {notification.data?.total_amount && (
                        <Chip label={notification.data.total_amount} size="small" sx={{ fontSize: 11, fontWeight: 700, background: '#E8F5E9', color: '#2E7D32', borderRadius: '6px' }} />
                      )}
                    </Box>
                  )}

                  {/* CTA */}
                  {notification.data?.url && notification.data.url !== '#' && (
                    <Link href={notification.data.url} style={{ textDecoration: 'none' }}>
                      <Button
                        variant="contained"
                        disableElevation
                        endIcon={<OpenInNewIcon sx={{ fontSize: '14px !important' }} />}
                        sx={{
                          background: meta.color, color: '#fff',
                          borderRadius: '9px', textTransform: 'none',
                          fontSize: 13, fontWeight: 600, px: 2.5,
                          '&:hover': { filter: 'brightness(0.88)' },
                        }}
                      >
                        View Details
                      </Button>
                    </Link>
                  )}
                </Box>
              </>
            )}
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
}
