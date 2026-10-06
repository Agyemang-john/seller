'use client';

import { useState } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import CreateAccountFlow from './CreateAccountFlow';
import SignInForm from './SignInForm';

/**
 * "Who are you?" card for people who aren't signed in on the seller site.
 *
 *   New to Negromart        → CreateAccountFlow (account + email/phone codes)
 *   Already shop with us    → SignInForm (existing customer account)
 *
 * Either way the user ends up with ONE Negromart account, which is what the
 * store application (or team invitation) gets attached to.
 *
 * Props: onAuthenticated(), defaultTab ('create' | 'signin'), email, lockEmail
 */
export default function AccountPanel({ onAuthenticated, defaultTab = 'signin', email = '', lockEmail = false }) {
  const [tab, setTab] = useState(defaultTab);
  const [prefill, setPrefill] = useState(email);
  const [notice, setNotice] = useState('');

  return (
    <Box>
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="fullWidth"
        sx={{ mb: 2.5, borderBottom: 1, borderColor: 'divider', '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 } }}
      >
        <Tab value="signin" label="Sign in" />
        <Tab value="create" label="Create an account" />
      </Tabs>

      {tab === 'create' ? (
        <CreateAccountFlow
          defaultEmail={email}
          lockEmail={lockEmail}
          onComplete={onAuthenticated}
          onAccountExists={(existing) => {
            setPrefill(existing);
            setNotice('You already have a Negromart account. Sign in with it to continue.');
            setTab('signin');
          }}
        />
      ) : (
        <SignInForm
          key={prefill}
          defaultIdentifier={prefill}
          notice={notice}
          onSignedIn={onAuthenticated}
          onCreateAccount={() => setTab('create')}
        />
      )}
    </Box>
  );
}
