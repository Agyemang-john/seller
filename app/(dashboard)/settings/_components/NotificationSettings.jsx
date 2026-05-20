'use client';

import { useEffect, useRef, useState } from 'react';
import { createAxiosClient } from '@/utils/clientFetch';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import NotificationsIcon from '@mui/icons-material/Notifications';
import toast from 'react-hot-toast';

const GROUPS = [
  {
    heading: 'Order Alerts',
    items: [
      { key: 'new_order',           label: 'New Order',            desc: 'A customer places an order for your product.' },
      { key: 'order_status_change', label: 'Order Status Updates', desc: 'Status changes on your active orders.' },
      { key: 'payment_received',    label: 'Payment Received',     desc: 'When a payout is processed to your account.' },
    ],
  },
  {
    heading: 'Store Activity',
    items: [
      { key: 'new_review', label: 'New Review',      desc: 'A customer leaves a review on one of your products.' },
      { key: 'low_stock',  label: 'Low Stock Alert', desc: "A product's inventory drops below 5 units." },
    ],
  },
  {
    heading: 'Platform',
    items: [
      { key: 'system_alerts', label: 'System Alerts',    desc: 'Important platform-wide announcements.' },
      { key: 'marketing',     label: 'Marketing & Tips', desc: 'Promotions, seller tips, and feature announcements.' },
    ],
  },
];

const DEFAULTS = {
  new_order: true,
  order_status_change: true,
  payment_received: true,
  new_review: true,
  low_stock: true,
  system_alerts: true,
  marketing: false,
};

export default function NotificationSettings() {
  const [prefs, setPrefs] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null); // key being saved

  // Debounce refs so rapid toggling batches into one PATCH
  const pendingRef = useRef({});
  const timerRef   = useRef(null);

  useEffect(() => {
    const axiosClient = createAxiosClient();
    axiosClient.get('/api/v1/vendor/notification-preferences/')
      .then(res => setPrefs(prev => ({ ...prev, ...res.data })))
      .catch(() => toast.error('Could not load notification preferences.'))
      .finally(() => setLoading(false));
  }, []);

  const flush = async () => {
    const updates = { ...pendingRef.current };
    pendingRef.current = {};
    timerRef.current = null;
    if (!Object.keys(updates).length) return;

    try {
      const axiosClient = createAxiosClient();
      const res = await axiosClient.patch('/api/v1/vendor/notification-preferences/', updates);
      setPrefs(prev => ({ ...prev, ...res.data }));
    } catch {
      // Roll back optimistic update
      setPrefs(prev => {
        const rolled = { ...prev };
        for (const k of Object.keys(updates)) rolled[k] = !updates[k];
        return rolled;
      });
      toast.error('Could not save preference. Try again.');
    } finally {
      setSaving(null);
    }
  };

  const toggle = (key) => {
    const next = !prefs[key];
    // Optimistic update
    setPrefs(prev => ({ ...prev, [key]: next }));
    setSaving(key);

    pendingRef.current[key] = next;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(flush, 600);
  };

  return (
    <Box>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
        <NotificationsIcon color="primary" />
        <Typography variant="h6" fontWeight={700}>Notifications</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choose which alerts you want to receive.
      </Typography>

      <Stack spacing={2}>
        {GROUPS.map(group => (
          <Card key={group.heading} variant="outlined" sx={{ borderRadius: 2 }}>
            <Box sx={{ px: { xs: 2, sm: 2.5 }, pt: 2, pb: 1 }}>
              <Typography variant="overline" fontWeight={700} color="text.secondary" fontSize={11} letterSpacing={1}>
                {group.heading}
              </Typography>
            </Box>
            <Divider />
            {group.items.map((item, idx, arr) => (
              <Box key={item.key}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ px: { xs: 2, sm: 2.5 }, py: 1.75 }}
                >
                  <Box sx={{ pr: 2 }}>
                    <Typography variant="body2" fontWeight={500}>{item.label}</Typography>
                    <Typography variant="caption" color="text.secondary">{item.desc}</Typography>
                  </Box>
                  {loading ? (
                    <Skeleton variant="rounded" width={36} height={20} sx={{ flexShrink: 0 }} />
                  ) : (
                    <Box sx={{ position: 'relative', flexShrink: 0 }}>
                      <Switch
                        checked={prefs[item.key] ?? DEFAULTS[item.key]}
                        onChange={() => toggle(item.key)}
                        color="primary"
                        size="small"
                        disabled={saving === item.key}
                      />
                      {saving === item.key && (
                        <CircularProgress
                          size={12}
                          sx={{ position: 'absolute', top: '50%', left: '50%', mt: '-6px', ml: '-6px', pointerEvents: 'none' }}
                        />
                      )}
                    </Box>
                  )}
                </Stack>
                {idx < arr.length - 1 && <Divider />}
              </Box>
            ))}
          </Card>
        ))}
      </Stack>

      <Typography variant="caption" color="text.disabled" sx={{ mt: 1.5, display: 'block' }}>
        Preferences are synced to your account and apply across all devices.
      </Typography>
    </Box>
  );
}
