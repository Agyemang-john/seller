'use client';
import { useEffect, useState } from 'react';
import { createAxiosClient } from '@/utils/clientFetch';
import toast from 'react-hot-toast';
import * as timeago from 'timeago.js';

export function useNotifications() {
  const axiosClient = createAxiosClient();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    let ws = null;

    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const res = await axiosClient.get('/api/v1/notification/list/');
        setNotifications(res.data);
        setUnreadCount(res.data.filter(n => !n.is_read).length);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const connectWS = async () => {
      try {
        const res = await axiosClient.get('/api/v1/notification/ws-token/', { withCredentials: true });
        const token = res.data.token;

        ws = new WebSocket(`ws://localhost:8000/ws/notifications/?token=${token}`);
        setSocket(ws);

        ws.onopen = () => console.log('WebSocket connected');

        ws.onmessage = (e) => {
          const data = JSON.parse(e.data);

          if (data.type === 'notification') {
            toast.success(data.notification.data?.message || 'New notification!');
            setNotifications(prev => [data.notification, ...prev]);
            setUnreadCount(prev => prev + 1);
          }

          if (data.type === 'unread_count') {
            setUnreadCount(data.count);
          }
        };

        ws.onclose = () => console.log('WebSocket closed');
        ws.onerror = (err) => console.error(err);
      } catch (err) {
        console.error('WS error', err);
      }
    };

    fetchNotifications();
    connectWS();

    return () => ws?.close();
  }, []);

  const markAsRead = (id) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ action: 'mark_read', notification_id: id }));
      // Optimistic UI update
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(prev - 1, 0));
    }
  };

  const markAllAsRead = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ action: 'mark_all_read' }));
      // Optimistic UI update
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
  };

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead };
}
