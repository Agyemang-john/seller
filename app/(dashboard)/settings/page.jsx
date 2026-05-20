'use client';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import PageContainer from '@/components/PageContainer';
import AccountSettings from './_components/AccountSettings';
import SecuritySettings from './_components/SecuritySettings';
import NotificationSettings from './_components/NotificationSettings';
import AppearanceSettings from './_components/AppearanceSettings';
import DangerZone from './_components/DangerZone';

export default function SettingsPage() {
  return (
    <PageContainer
      title="Settings"
      breadcrumbs={[
        { title: 'Home', path: '/dashboard' },
        { title: 'Settings' },
      ]}
    >
      <Box sx={{ maxWidth: 1200 }}>
        <Stack spacing={4} divider={<Divider />}>
          <AccountSettings />
          <SecuritySettings />
          <NotificationSettings />
          <AppearanceSettings />
          <DangerZone />
        </Stack>
      </Box>
    </PageContainer>
  );
}
