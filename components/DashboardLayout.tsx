"use client";

import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import DashboardHeader from '@/components/DashboardHeader';
import DashboardSidebar from '@/components/DashboardSidebar';
import SitemarkIcon from '@/components/SitemarkIcon';
import { useVendorProfile } from '@/hooks/useVendorProfile';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const { profile, loading } = useVendorProfile();

  const [isDesktopNavigationExpanded, setIsDesktopNavigationExpanded] =
    React.useState(true);
  const [isMobileNavigationExpanded, setIsMobileNavigationExpanded] =
    React.useState(false);

  const isOverMdViewport = useMediaQuery(theme.breakpoints.up('md'));

  const isNavigationExpanded = isOverMdViewport
    ? isDesktopNavigationExpanded
    : isMobileNavigationExpanded;

  const setIsNavigationExpanded = React.useCallback(
    (newExpanded: boolean) => {
      if (isOverMdViewport) {
        setIsDesktopNavigationExpanded(newExpanded);
      } else {
        setIsMobileNavigationExpanded(newExpanded);
      }
    },
    [isOverMdViewport],
  );

  const handleToggleHeaderMenu = React.useCallback(
    (isExpanded: boolean) => setIsNavigationExpanded(isExpanded),
    [setIsNavigationExpanded],
  );

  const layoutRef = React.useRef<HTMLDivElement>(null);

  return (
    <Box
      ref={layoutRef}
      sx={{
        position: 'relative',
        display: 'flex',
        overflow: 'hidden',
        height: '100%',
        width: '100%',
      }}
    >
      <DashboardHeader
        logo={<SitemarkIcon />}
        title=""
        menuOpen={isNavigationExpanded}
        onToggleMenu={handleToggleHeaderMenu}
        storeName={profile?.vendor_name}
        storeAvatar={profile?.profile_image}
      />

      <DashboardSidebar
        expanded={isNavigationExpanded}
        setExpanded={setIsNavigationExpanded}
        container={layoutRef?.current ?? undefined}
        storeName={profile?.vendor_name}
        storeAddress={profile?.address}
        storeAvatar={profile?.profile_image}
        storeLoading={loading}
      />

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minWidth: 0,
        }}
      >
        <Toolbar sx={{ displayPrint: 'none' }} />
        <Box
          component="main"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            overflow: 'auto',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
