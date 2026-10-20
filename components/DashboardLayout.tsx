"use client";

import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import DashboardHeader from '@/components/DashboardHeader';
import DashboardSidebar from '@/components/DashboardSidebar';
import SitemarkIcon from '@/components/SitemarkIcon';
import MobileBottomNav from '@/components/MobileBottomNav';
import { useVendorProfile } from '@/hooks/useVendorProfile';
import { usePathname } from 'next/navigation';
import { MOBILE_NAV_HEIGHT } from '../constants';

const SIDEBAR_PREF_KEY = 'seller.sidebarExpanded';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const { profile, loading } = useVendorProfile();
  const pathname = usePathname();

  const [isDesktopNavigationExpanded, setIsDesktopNavigationExpanded] =
    React.useState(true);
  const [isMobileNavigationExpanded, setIsMobileNavigationExpanded] =
    React.useState(false);

  const isOverSmViewport = useMediaQuery(theme.breakpoints.up('sm'));
  const isOverMdViewport = useMediaQuery(theme.breakpoints.up('md'));

  // Remember whether the seller collapsed the desktop sidebar.
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(SIDEBAR_PREF_KEY);
      if (saved !== null) setIsDesktopNavigationExpanded(saved === '1');
    } catch {}
  }, []);

  const isNavigationExpanded = isOverMdViewport
    ? isDesktopNavigationExpanded
    : isMobileNavigationExpanded;

  const setIsNavigationExpanded = React.useCallback(
    (newExpanded: boolean) => {
      if (isOverMdViewport) {
        setIsDesktopNavigationExpanded(newExpanded);
        try { localStorage.setItem(SIDEBAR_PREF_KEY, newExpanded ? '1' : '0'); } catch {}
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
  const mainRef = React.useRef<HTMLDivElement>(null);

  // <main> is the scroll container, not the window, so Next.js won't reset it
  // between pages; without this a new page opens wherever the last one was.
  React.useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
    // On phones the menu is an overlay; close it once the seller has moved on.
    if (!isOverSmViewport) setIsMobileNavigationExpanded(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <Box
      ref={layoutRef}
      sx={{
        position: 'relative',
        display: 'flex',
        overflow: 'hidden',
        height: '100dvh',
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
          ref={mainRef}
          component="main"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            minWidth: 0,
            overscrollBehaviorY: 'contain',
            // Keep the last bit of every page clear of the phone bottom bar.
            pb: {
              xs: `calc(${MOBILE_NAV_HEIGHT}px + env(safe-area-inset-bottom))`,
              sm: 'env(safe-area-inset-bottom)',
            },
          }}
        >
          {children}
        </Box>
      </Box>

      <MobileBottomNav
        moreOpen={!isOverMdViewport && isMobileNavigationExpanded}
        onMore={() => setIsMobileNavigationExpanded((open) => !open)}
      />
    </Box>
  );
}
