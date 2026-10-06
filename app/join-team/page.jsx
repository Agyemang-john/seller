'use client';

/**
 * /join-team?token=…  (link from the team-invitation email)
 *
 * Public page, outside the dashboard guard: the invitee usually has no seller
 * access yet. Flow:
 *   1. Look up the invite (store name, role, invited email).
 *   2. Make sure they're signed in to a Negromart account with THAT email:
 *        signed out → AccountPanel (create account or sign in, email locked)
 *        wrong account → offer to switch
 *   3. Accept → membership created → go to the seller login.
 * Backend: vendor/team_views.py (lookup / accept).
 */

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { Alert, Box, Button, Chip, CircularProgress, Typography } from '@mui/material';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import AccountPanel from '@/components/account/AccountPanel';
import { errorMessage, fetchCustomer } from '@/components/account/accountApi';
import { createRegisterClient } from '@/utils/registerClient';

const HOST = process.env.NEXT_PUBLIC_HOST;

const ROLE_LABEL = { admin: 'Admin', staff: 'Staff' };
const STATUS_MESSAGE = {
  accepted: 'This invitation has already been used. If it was you, sign in to the seller dashboard.',
  revoked: 'This invitation was cancelled by the store.',
  expired: 'This invitation has expired. Ask the store to send you a new one.',
};

function JoinTeam() {
  const token = useSearchParams().get('token') || '';
  const [invite, setInvite] = useState(null);
  const [inviteError, setInviteError] = useState('');
  const [customer, setCustomer] = useState(undefined); // undefined=checking, null=signed out
  const [accepting, setAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState('');
  const [joined, setJoined] = useState(null);

  useEffect(() => {
    if (!token) {
      setInviteError('This invitation link is incomplete. Open it again from your email.');
      return;
    }
    axios
      .get(`${HOST}/api/v1/vendor/team/invitations/lookup/`, { params: { token } })
      .then((r) => setInvite(r.data))
      .catch((err) => setInviteError(errorMessage(err, 'This invitation link is invalid.')));
  }, [token]);

  const refreshCustomer = useCallback(() => {
    setCustomer(undefined);
    fetchCustomer().then(setCustomer);
  }, []);

  useEffect(() => { refreshCustomer(); }, [refreshCustomer]);

  const signOut = async () => {
    // Customer logout; clears the shared .negromart.com session cookies.
    await axios.post(`${HOST}/api/logout/`, {}, { withCredentials: true }).catch(() => {});
    setCustomer(null);
  };

  const accept = async () => {
    setAccepting(true);
    setAcceptError('');
    try {
      const { data } = await createRegisterClient().post('/api/v1/vendor/team/invitations/accept/', { token });
      setJoined(data);
    } catch (err) {
      setAcceptError(errorMessage(err));
    } finally {
      setAccepting(false);
    }
  };

  const shell = (children) => (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <Header />
      <Box sx={{ maxWidth: 520, mx: 'auto', px: 2, py: { xs: 4, sm: 8 } }}>
        <Box className="nm-reg-account" sx={{ mt: 0 }}>{children}</Box>
      </Box>
      <Footer />
    </div>
  );

  if (inviteError) return shell(<Alert severity="error">{inviteError}</Alert>);
  if (!invite || customer === undefined) {
    return shell(<Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>);
  }

  const heading = (
    <Box sx={{ mb: 2.5 }}>
      <Typography sx={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.secondary' }}>
        Team invitation
      </Typography>
      <Typography sx={{ fontSize: 22, fontWeight: 800, mt: 0.5 }}>Join {invite.store_name}</Typography>
      <Typography sx={{ fontSize: 14, color: 'text.secondary', mt: 0.5 }}>
        {invite.invited_by_name ? `${invite.invited_by_name} invited you` : 'You were invited'} as{' '}
        <Chip label={ROLE_LABEL[invite.role] || invite.role} size="small" sx={{ verticalAlign: 'middle' }} />{' '}
        using <strong>{invite.email}</strong>.
      </Typography>
    </Box>
  );

  if (joined) {
    return shell(
      <>
        {heading}
        <Alert severity="success" sx={{ mb: 2 }}>{joined.detail}</Alert>
        {joined.can_access_dashboard ? (
          <Button component={Link} href="/auth/login" variant="contained" fullWidth sx={{ textTransform: 'none', fontWeight: 600, py: 1.25 }}>
            Sign in to the seller dashboard
          </Button>
        ) : (
          <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
            The store isn’t active right now. You’ll be able to sign in once it is.
          </Typography>
        )}
      </>,
    );
  }

  if (invite.status !== 'pending') {
    return shell(
      <>
        {heading}
        <Alert severity="warning">{STATUS_MESSAGE[invite.status]}</Alert>
      </>,
    );
  }

  const sameAccount = customer && customer.email?.toLowerCase() === invite.email.toLowerCase();

  return shell(
    <>
      {heading}

      {!customer && (
        <>
          <Typography sx={{ fontSize: 14, mb: 2 }}>
            You’ll use your own Negromart account to sign in to the store’s dashboard.
            {invite.account_exists ? ' Sign in to continue.' : ' Create one to continue; it only takes a minute.'}
          </Typography>
          <AccountPanel
            email={invite.email}
            lockEmail
            defaultTab={invite.account_exists ? 'signin' : 'create'}
            onAuthenticated={refreshCustomer}
          />
        </>
      )}

      {customer && !sameAccount && (
        <>
          <Alert severity="warning" sx={{ mb: 2 }}>
            You’re signed in as <strong>{customer.email}</strong>, but this invitation is for{' '}
            <strong>{invite.email}</strong>.
          </Alert>
          <Button onClick={signOut} variant="outlined" fullWidth sx={{ textTransform: 'none' }}>
            Sign out and use {invite.email}
          </Button>
        </>
      )}

      {sameAccount && (
        <>
          {acceptError && <Alert severity="error" sx={{ mb: 2 }}>{acceptError}</Alert>}
          <Button onClick={accept} disabled={accepting} variant="contained" fullWidth sx={{ textTransform: 'none', fontWeight: 600, py: 1.25 }}>
            {accepting ? <CircularProgress size={22} color="inherit" /> : `Accept and join ${invite.store_name}`}
          </Button>
        </>
      )}
    </>,
  );
}

export default function JoinTeamPage() {
  return (
    <Suspense fallback={null}>
      <JoinTeam />
    </Suspense>
  );
}
