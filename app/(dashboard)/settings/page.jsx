'use client';

/**
 * Settings is the seller's account hub: who they are, how well the account is
 * protected, and every preference, split into tabs kept in ?tab= so a link
 * (e.g. the new-sign-in email) can open Security directly.
 */

import { Suspense, useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import PageContainer from '@/components/PageContainer';
import useVendorAccess, { CAP } from '@/hooks/useVendorAccess';
import { createAxiosClient } from '@/utils/clientFetch';
import AccountHeader, { securityIssues } from './_components/AccountHeader';
import AccountSettings from './_components/AccountSettings';
import OperationsSettings from './_components/OperationsSettings';
import SecuritySettings from './_components/SecuritySettings';
import NotificationSettings from './_components/NotificationSettings';
import AppearanceSettings from './_components/AppearanceSettings';
import DangerZone from './_components/DangerZone';

const TABS = [
  { value: 'account', label: 'Account' },
  { value: 'security', label: 'Security' },
  { value: 'store', label: 'Store' },
  { value: 'notifications', label: 'Notifications' },
  { value: 'appearance', label: 'Appearance' },
];

function SettingsHub() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const requested = params.get('tab');
  const tab = TABS.some((t) => t.value === requested) ? requested : 'account';
  const { can } = useVendorAccess();

  // One security overview feeds both the header and the Security tab.
  const [overview, setOverview] = useState(null);
  const [overviewError, setOverviewError] = useState(false);
  const loadOverview = useCallback(async () => {
    try {
      const { data } = await createAxiosClient().get('/api/vendor/security/');
      setOverview(data);
      setOverviewError(false);
    } catch {
      setOverviewError(true);
    }
  }, []);
  useEffect(() => { loadOverview(); }, [loadOverview]);

  const openTab = (value) => {
    const q = new URLSearchParams(params.toString());
    if (value === 'account') q.delete('tab'); else q.set('tab', value);
    const qs = q.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const issues = overview ? securityIssues(overview).length : 0;

  return (
    <PageContainer
      title="Settings"
      breadcrumbs={[
        { title: 'Home', path: '/dashboard' },
        { title: 'Settings' },
      ]}
    >
      <Box sx={{ maxWidth: 1000 }}>
        <AccountHeader
          overview={overview}
          error={overviewError}
          onReviewSecurity={() => openTab('security')}
        />

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3, mb: 3 }}>
          <Tabs value={tab} onChange={(_, v) => openTab(v)} aria-label="Settings sections">
            {TABS.map((t) => (
              <Tab
                key={t.value}
                value={t.value}
                label={
                  t.value === 'security' && issues > 0 ? (
                    <Badge color="warning" variant="dot" sx={{ '& .MuiBadge-badge': { right: -6, top: 2 } }}>
                      {t.label}
                    </Badge>
                  ) : t.label
                }
              />
            ))}
          </Tabs>
        </Box>

        {tab === 'account' && (
          <Stack spacing={4} divider={<Divider />}>
            <AccountSettings />
            {can(CAP.CLOSE_STORE) && <DangerZone />}
          </Stack>
        )}
        {tab === 'security' && (
          <SecuritySettings overview={overview} onChanged={loadOverview} />
        )}
        {tab === 'store' && <OperationsSettings />}
        {tab === 'notifications' && <NotificationSettings />}
        {tab === 'appearance' && <AppearanceSettings />}
      </Box>
    </PageContainer>
  );
}

export default function SettingsPage() {
  // useSearchParams needs a Suspense boundary in the app router.
  return (
    <Suspense fallback={null}>
      <SettingsHub />
    </Suspense>
  );
}
