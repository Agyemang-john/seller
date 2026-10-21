'use client';

/**
 * Sign-in info for a team member (backend: TeamMemberActivityView in
 * vendor/team_views.py). The owner sees everyone, admins see staff, and each
 * person sees themselves; `member.activity` is null for anyone else.
 */

import { useEffect, useState } from 'react';
import {
  Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  Divider, Stack, Typography,
} from '@mui/material';
import ComputerIcon from '@mui/icons-material/Computer';
import DeviceUnknownIcon from '@mui/icons-material/DeviceUnknown';
import KeyIcon from '@mui/icons-material/Key';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import PhonelinkEraseIcon from '@mui/icons-material/PhonelinkErase';
import TabletIcon from '@mui/icons-material/Tablet';
import { createAxiosClient } from '@/utils/clientFetch';

export function fmtDateTime(iso) {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function timeAgo(iso) {
  if (!iso) return '';
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? '' : 's'} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? '' : 's'} ago`;
}

const EVENT_ICONS = {
  sign_in: LoginIcon,
  sign_out: LogoutIcon,
  device_signed_out: PhonelinkEraseIcon,
  others_signed_out: PhonelinkEraseIcon,
  signed_out_everywhere: PhonelinkEraseIcon,
  password_changed: KeyIcon,
};

const DEVICE_ICONS = { desktop: ComputerIcon, mobile: PhoneAndroidIcon, tablet: TabletIcon };

/** One-line status under a member's name: online dot, last active, last sign-in. */
export function ActivityLine({ activity }) {
  if (!activity) return null;
  const { is_online, last_active_at, last_sign_in_at, last_sign_in_device } = activity;
  if (!last_sign_in_at && !last_active_at) {
    return (
      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
        Hasn’t signed in to the seller dashboard yet
      </Typography>
    );
  }
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
      <Box
        component="span"
        sx={{
          width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
          bgcolor: is_online ? 'success.main' : 'text.disabled',
        }}
      />
      <Typography sx={{ fontSize: 12, color: is_online ? 'success.main' : 'text.secondary', fontWeight: is_online ? 600 : 400 }}>
        {is_online ? 'Active now' : `Last active ${timeAgo(last_active_at)}`}
      </Typography>
      {last_sign_in_at && (
        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
          · Signed in {fmtDateTime(last_sign_in_at)}
          {last_sign_in_device ? ` on ${last_sign_in_device}` : ''}
        </Typography>
      )}
    </Box>
  );
}

function Stat({ label, value }) {
  return (
    <Box sx={{ minWidth: 140, flex: 1 }}>
      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{label}</Typography>
      <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{value || '—'}</Typography>
    </Box>
  );
}

export function MemberActivityDialog({ member, onClose }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!member) return;
    let cancelled = false;
    setData(null);
    setError('');
    createAxiosClient()
      .get(`/api/v1/vendor/team/members/${member.id}/activity/`)
      .then(({ data: d }) => { if (!cancelled) setData(d); })
      .catch((err) => {
        if (!cancelled) setError(err?.response?.data?.detail || 'Could not load sign-in activity.');
      });
    return () => { cancelled = true; };
  }, [member]);

  const summary = data?.summary;

  return (
    <Dialog open={Boolean(member)} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {member ? `${member.first_name} ${member.last_name}`.trim() : ''}
        <Typography component="span" sx={{ display: 'block', fontSize: 13, color: 'text.secondary' }}>
          Seller dashboard sign-in activity
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error">{error}</Alert>}
        {!error && !data && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={28} /></Box>
        )}
        {summary && (
          <>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
              <Stat
                label="Status"
                value={summary.is_online ? 'Active now' : summary.last_active_at ? `Active ${timeAgo(summary.last_active_at)}` : 'Never'}
              />
              <Stat label="Last signed in" value={fmtDateTime(summary.last_sign_in_at)} />
              <Stat label="Last signed out" value={fmtDateTime(summary.last_sign_out_at)} />
              <Stat label="Signed-in devices" value={String(summary.active_sessions)} />
            </Box>
            <Divider sx={{ mb: 1 }} />
            {data.events.length === 0 ? (
              <Typography sx={{ fontSize: 13, color: 'text.secondary', py: 2 }}>
                No sign-in activity since they joined the team.
              </Typography>
            ) : (
              <Stack divider={<Divider flexItem />}>
                {data.events.map((e) => {
                  const Icon = EVENT_ICONS[e.event] || LoginIcon;
                  const DevIcon = DEVICE_ICONS[e.device_type] || DeviceUnknownIcon;
                  return (
                    <Box key={e.id} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', py: 1 }}>
                      <Icon fontSize="small" color={e.event === 'sign_in' ? 'primary' : 'action'} sx={{ mt: 0.25 }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                          <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{e.label}</Typography>
                          {e.new_device && <Chip label="New device" size="small" color="warning" variant="outlined" />}
                        </Box>
                        {(e.device_name || e.ip_address) && (
                          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', color: 'text.secondary' }}>
                            <DevIcon sx={{ fontSize: 14 }} />
                            <Typography sx={{ fontSize: 12 }}>
                              {[e.device_name, e.ip_address].filter(Boolean).join(' · ')}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                        <Typography sx={{ fontSize: 12 }}>{fmtDateTime(e.created_at)}</Typography>
                        <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{timeAgo(e.created_at)}</Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
