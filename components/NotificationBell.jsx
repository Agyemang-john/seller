'use client';
import { useEffect, useState } from 'react';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import { createAxiosClient } from '@/utils/clientFetch';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function NotificationBell() {
  const axiosClient = createAxiosClient();
  const [unreadCount, setUnreadCount] = useState(0);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    let socket = null;
    const connectWebSocket = async () => {
      try {
        const res = await axiosClient.get('/api/v1/notification/ws-token/', { withCredentials: true });
        const token = res.data.token;
        socket = new WebSocket(`ws://localhost:8000/ws/notifications/count/?token=${token}`);
        
        socket.onopen = () => {
          console.log('Bell WebSocket connected');
          setWs(socket);
        };

        socket.onmessage = (e) => {
          const data = JSON.parse(e.data);

          if (data.type === "unread_count") {
            setUnreadCount(data.count);

            if (data.trigger_toast) {
              toast.success("New notification!", {
                duration: 4000,
              });
            }
          }

          if (data.type === "count_updated") {
            setUnreadCount(data.count);
          }
        };

        socket.onclose = () => {
          console.log('Bell WebSocket closed → reconnecting...');
          setTimeout(connectWebSocket, 3000);
        };

        socket.onerror = (err) => console.error('Bell WS error', err);
      } catch (err) {
        console.log('Failed to connect bell WS', err);
        setTimeout(connectWebSocket, 5000);
      }
    };

    connectWebSocket();
    return () => socket?.close();
  }, []);

  return (
    <Link href="/notifications">
      <IconButton sx={{ ml: 1 }} title="Notifications">
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon fontSize="medium" />
        </Badge>
      </IconButton>
    </Link>
  );
}