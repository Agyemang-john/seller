'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createAxiosClient } from '@/utils/clientFetch';
import {
  Card, CardContent, Typography, Avatar, Divider, Chip, Stack, Skeleton
} from '@mui/material';
import { motion } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import * as timeago from 'timeago.js';

const axiosClient = createAxiosClient();

const VERB_ICONS = {
  vendor_new_order: <CheckCircleIcon className="text-blue-500" />,
  vendor_order_shipped: <CheckCircleIcon className="text-green-500" />,
  vendor_order_cancelled: <CloseIcon className="text-red-500" />,
  message: <InfoIcon className="text-gray-500" />,
  announcement: <InfoIcon className="text-indigo-500" />,
  support_reply: <InfoIcon className="text-emerald-500" />,
};

const VERB_COLORS = {
  vendor_new_order: 'blue',
  vendor_order_shipped: 'green',
  vendor_order_cancelled: 'red',
  message: 'gray',
  announcement: 'indigo',
  support_reply: 'emerald',
};

export default function NotificationDetail() {
  const { id } = useParams();
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ws, setWs] = useState(null);
  const WS_BASE = process.env.NEXT_PUBLIC_WS_URL;


  // WebSocket connection (reconnectable)
  useEffect(() => {
    let socket = null;

    const connect = async () => {
      try {
        const res = await axiosClient.get('/api/v1/notification/ws-token/', { withCredentials: true });
        const token = res.data.token;
        socket = new WebSocket(`${WS_BASE}/ws/notifications/?token=${token}`);

        socket.onopen = () => {
          setWs(socket);

          // AS SOON AS SOCKET IS OPEN → SEND MARK AS READ
          if (id) {
            socket.send(JSON.stringify({
              action: "view_detail",
              id: parseInt(id)
            }));
          }
        };

        socket.onclose = () => setTimeout(connect, 3000);
      } catch (err) {
        setTimeout(connect, 5000);
      }
    };

    connect();

    return () => socket?.close();
  }, [id]);


  useEffect(() => {
    if (!id) return;

    const fetchNotification = async () => {
      setLoading(true);
      setError(false);

      try {
        const res = await axiosClient.get(`/api/v1/notification/${id}/`);
        setNotification(res.data);
      } catch (err) {
        console.error("Failed to load notification", err);
        setError(true);
        toast.error("Notification not found or failed to load");
      } finally {
        setLoading(false);
      }
    };

    fetchNotification();
  }, [id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-8 p-4"
    >
      <Card className="rounded-2xl shadow-2xl dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
        <CardContent className="p-8">
          {loading ? (
            // FULL SKELETON LOADING STATE
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Skeleton variant="circular" width={56} height={56} />
                <div className="flex-1">
                  <Skeleton variant="text" width="70%" height={32} />
                  <Skeleton variant="text" width="40%" height={20} className="mt-2" />
                </div>
              </div>
              <Divider />
              <Skeleton variant="rectangular" width="100%" height={80} className="rounded-lg" />
              <Skeleton variant="rectangular" width="60%" height={40} className="rounded-lg mt-4" />
              <Skeleton variant="rectangular" width="50%" height={32} className="rounded-lg mt-4" />
            </div>
          ) : error || !notification ? (
            // Proper error UI instead of crashing
            <div className="text-center py-12">
              <InfoIcon className="text-6xl text-red-400 mx-auto mb-4" />
              <Typography variant="h6" color="error">
                Notification not found
              </Typography>
              <Typography variant="body2" className="text-gray-500 mt-2">
                It may have been deleted or the link is invalid.
              </Typography>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Refresh Page
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-start gap-5 mb-6">
                <Avatar sx={{ width: 64, height: 64 }} className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center shadow-lg">
                  {VERB_ICONS[notification.verb] || <CheckCircleIcon fontSize="large" />}
                </Avatar>
                <div className="flex-1">
                  <Typography variant="h5" className="font-bold">
                    {notification.verb_display}
                  </Typography>
                  <Typography variant="body2" className="text-gray-500 dark:text-gray-400 mt-1">
                    {timeago.format(notification.created_at)}
                  </Typography>
                </div>
              </div>

              <Divider className="mb-6" />

              {/* Message */}
              {notification.data?.message && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-600">
                  <Typography className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed">
                    {notification.data.message}
                  </Typography>
                </div>
              )}

              {/* Actor */}
              {notification.actor && (
                <Stack direction="row" spacing={2} alignItems="center" className="mb-4">
                  <Avatar className="ring-4 ring-blue-100 dark:ring-blue-900/50">
                    {notification.actor.name?.[0] || notification.actor.username?.[0] || "?"}
                  </Avatar>
                  <Typography variant="body1" className="text-gray-600 dark:text-gray-300">
                    From: <span className="font-semibold">{notification.actor.name || notification.actor.username}</span>
                  </Typography>
                </Stack>
              )}

              {/* Target + Action Link */}
              {notification.target && (
                <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                  <Chip
                    label={notification.target.name || notification.target.title || "View Details"}
                    color={VERB_COLORS[notification.verb] || "primary"}
                    icon={<OpenInNewIcon fontSize="small" />}
                    className="font-medium"
                  />
                  {notification.data?.url && (
                    <a
                      href={notification.data.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-1"
                    >
                      Open in new tab
                      <OpenInNewIcon fontSize="small" />
                    </a>
                  )}
                </div>
              )}

              {/* Success badge if read */}
              {notification.is_read && (
                <div className="mt-6 text-center">
                  <Chip
                    label="Read"
                    color="success"
                    size="small"
                    icon={<CheckCircleIcon />}
                    className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}