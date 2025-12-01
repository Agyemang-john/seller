// components/NotificationsList.tsx — PURE REALTIME (NO API!)
"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import * as timeago from "timeago.js";
import {
  Card, CardContent, IconButton, Avatar, Badge, Divider
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import DeleteIcon from "@mui/icons-material/Delete";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { createAxiosClient } from "@/utils/clientFetch";
import Link from "next/link";

export default function NotificationsList() {
  const axiosClient = createAxiosClient();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [ws, setWs] = useState(null);

  const WS_BASE = process.env.NEXT_PUBLIC_WS_URL;

  
  useEffect(() => {
    let socket = null;

    const connect = async () => {
      try {
        const res = await axiosClient.get('/api/v1/notification/ws-token/', { withCredentials: true });
        const token = res.data.token;

        // CLOSE OLD SOCKET
        if (socket) socket.close();

        // CONNECT WITH TOKEN
        socket = new WebSocket(`${WS_BASE}/ws/notifications/?token=${token}`);

        socket.onmessage = (e) => {
          const data = JSON.parse(e.data);

          if (data.type === "init_data" || data.type === "refresh_list") {
            setNotifications(data.notifications || []);
            if (data.unread_count !== undefined) {
              setUnreadCount(data.unread_count);
            }
          }

          // Only show toast — NO manual state update!
          if (data.type === "notification") {
            toast.success("New notification!");
          }

          if (data.type === "unread_count") {
            setUnreadCount(data.count);
          }
        };

        socket.onclose = () => {
          setTimeout(connect, 3000); // Auto-reconnect
        };

        setWs(socket);
      } catch (err) {
        console.warn("Failed to get token", err);
        setTimeout(connect, 5000);
      }
    };

    connect();

    return () => {
      if (socket) socket.close();
    };
  }, []);

  const send = (action, id) => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action, id }));
    }
  };

  return (
    <div className="p-4">
      {unreadCount > 0 && (
        <button
          onClick={() => send("mark_all_read")}
          className="mb-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Mark all as read ({unreadCount})
        </button>
      )}

      <Card className="shadow-xl">
        <CardContent className="p-0">
          {notifications.length === 0 ? (
            <div className="text-center py-20">
              <NotificationsIcon className="text-6xl text-gray-400" />
              <p className="text-gray-500 mt-4">No notifications yet</p>
            </div>
          ) : (
            <AnimatePresence>
              {notifications.map((n, i) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ delay: i * 0.05 }}
                  layout
                >
                  {/* CLICKABLE CARD — GOES TO NOTIFICATION DETAIL */}
                  <Link href={`/notifications/${n.id}/detail`} className="block">
                    <div
                      className={`p-6 flex gap-4 cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-gray-400 rounded-lg ${
                        !n.is_read ? "bg-blue-50 dark:bg-blue-900/20" : ""
                      }`}
                    >
                      <Badge color="error" variant="dot" invisible={n.is_read}>
                        <Avatar>
                          <NotificationsIcon />
                        </Avatar>
                      </Badge>

                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-base ${!n.is_read ? "text-blue-900 dark:text-gray-600" : ""}`}>
                          {n.verb_display}
                        </p>
                        {n.data?.message && (
                          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">
                            {n.data.message}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          {timeago.format(n.created_at)}
                        </p>
                      </div>

                      {/* ACTION BUTTONS — STOP PROPAGATION SO CLICK DOESN'T OPEN LINK */}
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        {!n.is_read && (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.preventDefault();
                              send("mark_read", n.id);
                            }}
                            className="hover:bg-green-100"
                          >
                            <CheckIcon className="text-green-600" />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.preventDefault();
                            send("delete", n.id);
                          }}
                          className="hover:bg-red-100"
                        >
                          <DeleteIcon className="text-red-600" />
                        </IconButton>
                      </div>
                    </div>
                  </Link>

                  {i < notifications.length - 1 && <Divider />}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </CardContent>
      </Card>
    </div>
  );
}