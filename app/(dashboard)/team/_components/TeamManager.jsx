'use client';

/**
 * Store team management (backend: vendor/team_views.py).
 *
 * Every person on the team signs in with their own Negromart account; nobody
 * shares the owner's password. Roles:
 *   Owner → everything, including payouts, billing and closing the store
 *   Admin → products, orders, analytics, store settings, invites staff
 *   Staff → products, orders and analytics only
 *
 * The page only shows controls the signed-in member can use (`me` from the
 * API); the backend enforces the same rules on every call.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  Alert, Avatar, Box, Button, Card, CardContent, Chip, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, IconButton, MenuItem, Select, Skeleton, Stack, TextField,
  Tooltip, Typography,
} from '@mui/material';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import toast from 'react-hot-toast';
import { createAxiosClient } from '@/utils/clientFetch';
import { useDialogs } from '@/hooks/useDialogs/useDialogs';
import { resetVendorAccess } from '@/hooks/useVendorAccess';

const ROLE_INFO = {
  owner: { label: 'Owner', color: 'primary', desc: 'Full access, including payouts, billing, team and closing the store.' },
  admin: { label: 'Admin', color: 'secondary', desc: 'Products, orders, analytics and store settings. Can invite and remove staff.' },
  staff: { label: 'Staff', color: 'default', desc: 'Products, orders and analytics only.' },
};

function apiError(err, fallback = 'Something went wrong. Please try again.') {
  const data = err?.response?.data;
  if (!data) return fallback;
  if (data.detail) return data.detail;
  const first = Object.values(data).flat().find((v) => typeof v === 'string');
  return first || fallback;
}

const fmtDate = (iso) => {
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(iso));
  } catch {
    return '';
  }
};

const initials = (m) => `${m.first_name?.[0] || ''}${m.last_name?.[0] || ''}`.toUpperCase() || '?';

export default function TeamManager() {
  const [team, setTeam] = useState(null);
  const [error, setError] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const dialogs = useDialogs();

  const load = useCallback(async () => {
    try {
      const { data } = await createAxiosClient().get('/api/v1/vendor/team/');
      setTeam(data);
      setError('');
    } catch (err) {
      setError(apiError(err, 'Could not load your team.'));
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (error && !team) return <Alert severity="error">{error}</Alert>;
  if (!team) {
    return (
      <Stack spacing={2}>
        <Skeleton variant="rounded" height={90} />
        <Skeleton variant="rounded" height={240} />
      </Stack>
    );
  }

  const { me, members, invitations, limits } = team;
  const canManage = me.can_invite_roles.length > 0;
  const isOwner = me.role === 'owner';
  const full = limits.used >= limits.max_members;

  const changeRole = async (member, role) => {
    try {
      await createAxiosClient().patch(`/api/v1/vendor/team/members/${member.id}/`, { role });
      toast.success(`${member.first_name} is now ${ROLE_INFO[role].label}.`);
      load();
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  const removeMember = async (member) => {
    const leaving = member.is_you;
    const ok = await dialogs.confirm(
      leaving
        ? 'You will lose access to this store’s seller dashboard straight away. Your Negromart account itself is not affected.'
        : `${member.first_name} ${member.last_name} will lose access to this store immediately.`,
      {
        title: leaving ? 'Leave this team?' : 'Remove team member?',
        severity: 'error',
        okText: leaving ? 'Leave team' : 'Remove',
        cancelText: 'Cancel',
      },
    );
    if (!ok) return;
    try {
      await createAxiosClient().delete(`/api/v1/vendor/team/members/${member.id}/`);
      if (leaving) {
        // Access is already gone server-side; clear the vendor cookies and do
        // a full reload so no dashboard state survives.
        resetVendorAccess();
        await createAxiosClient().post('/api/vendor/logout/').catch(() => {});
        toast.success('You left the team.');
        window.location.href = '/';
        return;
      }
      toast.success('Member removed.');
      load();
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  const resendInvite = async (inv) => {
    try {
      await createAxiosClient().post(`/api/v1/vendor/team/invitations/${inv.id}/resend/`);
      toast.success(`Invitation re-sent to ${inv.email}.`);
      load();
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  const revokeInvite = async (inv) => {
    const ok = await dialogs.confirm(`The link sent to ${inv.email} will stop working.`, {
      title: 'Cancel invitation?', severity: 'warning', okText: 'Cancel invitation', cancelText: 'Keep',
    });
    if (!ok) return;
    try {
      await createAxiosClient().delete(`/api/v1/vendor/team/invitations/${inv.id}/`);
      toast.success('Invitation cancelled.');
      load();
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  return (
    <Stack spacing={3} sx={{ maxWidth: 960 }}>
      {/* Your role */}
      <Card variant="outlined">
        <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: 220 }}>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Your role</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Chip label={ROLE_INFO[me.role]?.label} color={ROLE_INFO[me.role]?.color} size="small" />
              <Typography sx={{ fontSize: 14 }}>{ROLE_INFO[me.role]?.desc}</Typography>
            </Box>
          </Box>
          {canManage && (
            <Tooltip title={full ? `Your team is full (${limits.max_members} people including pending invites).` : ''}>
              <span>
                <Button
                  variant="contained"
                  startIcon={<PersonAddAlt1RoundedIcon />}
                  onClick={() => setInviteOpen(true)}
                  disabled={full}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Invite teammate
                </Button>
              </span>
            </Tooltip>
          )}
        </CardContent>
      </Card>

      {/* Members */}
      <Card variant="outlined">
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
            <Typography sx={{ fontWeight: 700 }}>Members</Typography>
            {canManage && (
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                {limits.used} of {limits.max_members} seats used
              </Typography>
            )}
          </Box>
          <Stack divider={<Divider flexItem />}>
            {members.map((m) => {
              const canEditRole = isOwner && m.role !== 'owner';
              const canRemove = m.role !== 'owner' && (
                m.is_you || isOwner || (me.role === 'admin' && m.role === 'staff')
              );
              return (
                <Box key={m.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.25, flexWrap: 'wrap' }}>
                  <Avatar sx={{ width: 36, height: 36, fontSize: 14, bgcolor: 'primary.main' }}>{initials(m)}</Avatar>
                  <Box sx={{ flex: 1, minWidth: 180 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                      {m.first_name} {m.last_name}{m.is_you ? ' (you)' : ''}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: 'text.secondary', wordBreak: 'break-all' }}>
                      {m.email} · joined {fmtDate(m.created_at)}
                    </Typography>
                  </Box>
                  {canEditRole ? (
                    <Select
                      size="small"
                      value={m.role}
                      onChange={(e) => changeRole(m, e.target.value)}
                      sx={{ minWidth: 110, fontSize: 13 }}
                    >
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="staff">Staff</MenuItem>
                    </Select>
                  ) : (
                    <Chip label={ROLE_INFO[m.role]?.label} color={ROLE_INFO[m.role]?.color} size="small" variant="outlined" />
                  )}
                  {canRemove && (
                    <Tooltip title={m.is_you ? 'Leave team' : 'Remove'}>
                      <IconButton size="small" onClick={() => removeMember(m)} aria-label={m.is_you ? 'Leave team' : 'Remove member'}>
                        {m.is_you ? <LogoutRoundedIcon fontSize="small" /> : <DeleteOutlineRoundedIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              );
            })}
          </Stack>
        </CardContent>
      </Card>

      {/* Pending invitations */}
      {canManage && (
        <Card variant="outlined">
          <CardContent>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>Pending invitations</Typography>
            {invitations.length === 0 ? (
              <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                No pending invitations. Invite someone and they’ll get an email with a link to join.
              </Typography>
            ) : (
              <Stack divider={<Divider flexItem />}>
                {invitations.map((inv) => {
                  const manageable = me.can_invite_roles.includes(inv.role);
                  return (
                    <Box key={inv.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.25, flexWrap: 'wrap' }}>
                      <Box sx={{ flex: 1, minWidth: 180 }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 600, wordBreak: 'break-all' }}>{inv.email}</Typography>
                        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                          {ROLE_INFO[inv.role]?.label} · invited by {inv.invited_by_name || '—'} · expires {fmtDate(inv.expires_at)}
                        </Typography>
                      </Box>
                      {manageable && (
                        <>
                          <Button size="small" startIcon={<SendRoundedIcon fontSize="small" />} onClick={() => resendInvite(inv)} sx={{ textTransform: 'none' }}>
                            Resend
                          </Button>
                          <Button size="small" color="error" onClick={() => revokeInvite(inv)} sx={{ textTransform: 'none' }}>
                            Cancel
                          </Button>
                        </>
                      )}
                    </Box>
                  );
                })}
              </Stack>
            )}
          </CardContent>
        </Card>
      )}

      {/* Role reference */}
      <Card variant="outlined">
        <CardContent>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>What each role can do</Typography>
          <Stack spacing={1}>
            {Object.entries(ROLE_INFO).map(([key, info]) => (
              <Box key={key} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <Chip label={info.label} color={info.color} size="small" sx={{ minWidth: 64 }} />
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{info.desc}</Typography>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <InviteDialog
        open={inviteOpen}
        roles={me.can_invite_roles}
        onClose={() => setInviteOpen(false)}
        onInvited={() => { setInviteOpen(false); load(); }}
      />
    </Stack>
  );
}

function InviteDialog({ open, roles, onClose, onInvited }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('staff');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setEmail('');
      setRole(roles.includes('staff') ? 'staff' : roles[0]);
      setError('');
    }
  }, [open, roles]);

  const submit = async (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await createAxiosClient().post('/api/v1/vendor/team/invitations/', { email: email.trim(), role });
      toast.success(`Invitation sent to ${email.trim()}.`);
      onInvited();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" component="form" onSubmit={submit}>
      <DialogTitle>Invite a teammate</DialogTitle>
      <DialogContent>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 2 }}>
          They’ll get an email with a link to join. They sign in with their own Negromart account,
          or create one in a minute if they don’t have one.
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          fullWidth size="small" autoFocus sx={{ mb: 2 }}
        />
        <Select value={role} onChange={(e) => setRole(e.target.value)} fullWidth size="small">
          {roles.map((r) => (
            <MenuItem key={r} value={r}>
              <Box>
                <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{ROLE_INFO[r].label}</Typography>
                <Typography sx={{ fontSize: 12, color: 'text.secondary', whiteSpace: 'normal' }}>{ROLE_INFO[r].desc}</Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>Cancel</Button>
        <Button type="submit" variant="contained" disabled={busy} sx={{ textTransform: 'none', fontWeight: 600 }}>
          {busy ? <CircularProgress size={20} color="inherit" /> : 'Send invitation'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
