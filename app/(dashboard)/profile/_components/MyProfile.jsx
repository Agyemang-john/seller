'use client';

import { useState, useEffect } from 'react';
import { createAxiosClient } from '@/utils/clientFetch';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CircularProgress from '@mui/material/CircularProgress';
import StorefrontIcon from '@mui/icons-material/Storefront';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import BadgeIcon from '@mui/icons-material/Badge';
import StoreInfoTab from './StoreInfoTab';
import BusinessDetailsTab from './BusinessDetailsTab';
import DocumentsTab from './DocumentsTab';
import AccountStatusTab from './AccountStatusTab';

function LoadingPane() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
      <CircularProgress />
    </Box>
  );
}

export default function MyProfile() {
  const [tab, setTab] = useState(0);
  const [account, setAccount] = useState(null);
  const [accountLoading, setAccountLoading] = useState(true);

  const fetchAccount = async () => {
    try {
      const axiosClient = createAxiosClient();
      const res = await axiosClient.get('/api/v1/vendor/account/');
      setAccount(res.data);
    } catch (err) {
      console.error('Failed to load account data:', err);
    } finally {
      setAccountLoading(false);
    }
  };

  useEffect(() => {
    fetchAccount();
  }, []);

  return (
    <Box>
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
      >
        <Tab icon={<StorefrontIcon fontSize="small" />} iconPosition="start" label="Store Info" />
        <Tab icon={<BusinessCenterIcon fontSize="small" />} iconPosition="start" label="Business Details" />
        <Tab icon={<FolderSharedIcon fontSize="small" />} iconPosition="start" label="Documents" />
        <Tab icon={<BadgeIcon fontSize="small" />} iconPosition="start" label="Account Status" />
      </Tabs>

      {tab === 0 && <StoreInfoTab />}
      {tab === 1 && (accountLoading ? <LoadingPane /> : <BusinessDetailsTab account={account} onRefresh={fetchAccount} />)}
      {tab === 2 && (accountLoading ? <LoadingPane /> : <DocumentsTab account={account} onRefresh={fetchAccount} />)}
      {tab === 3 && (accountLoading ? <LoadingPane /> : <AccountStatusTab account={account} />)}
    </Box>
  );
}
