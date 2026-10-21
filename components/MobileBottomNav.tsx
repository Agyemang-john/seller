"use client";

import * as React from 'react';
import { alpha } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Badge from '@mui/material/Badge';
import DashboardRoundedIcon     from '@mui/icons-material/DashboardRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import Inventory2RoundedIcon    from '@mui/icons-material/Inventory2Rounded';
import PaymentsRoundedIcon      from '@mui/icons-material/PaymentsRounded';
import MenuRoundedIcon          from '@mui/icons-material/MenuRounded';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import useVendorAccess, { CAP } from '@/hooks/useVendorAccess';
import { createAxiosClient } from '@/utils/clientFetch';
import { MOBILE_NAV_HEIGHT } from '../constants';
import useUnreadChats from '@/components/chat/useUnreadChats';
import useMessagingPlan from '@/components/chat/useMessagingPlan';

interface TabDef {
  id: string;
  label: string;
  icon: React.ReactElement;
  path: string;
  capability?: string;
}

// The four things sellers do most from a phone; everything else lives behind "More".
const tabs: TabDef[] = [
  { id: 'dashboard', label: 'Home',     icon: <DashboardRoundedIcon />,     path: '/dashboard', capability: CAP.VIEW_ANALYTICS },
  { id: 'orders',    label: 'Orders',   icon: <LocalShippingRoundedIcon />, path: '/orders',    capability: CAP.MANAGE_ORDERS },
  { id: 'products',  label: 'Products', icon: <Inventory2RoundedIcon />,    path: '/products',  capability: CAP.MANAGE_CATALOG },
  { id: 'payouts',   label: 'Earnings', icon: <PaymentsRoundedIcon />,      path: '/payouts',   capability: CAP.VIEW_FINANCE },
];

// "To ship" is the queue a seller has to act on, so that's what the badge counts.
const toShipFetcher = (url: string) =>
  createAxiosClient().get(url).then((res) => res.data?.count ?? 0);

export interface MobileBottomNavProps {
  moreOpen: boolean;
  onMore: () => void;
}

export default function MobileBottomNav({ moreOpen, onMore }: MobileBottomNavProps) {
  const pathname = usePathname();
  const { can, capabilities } = useVendorAccess();

  const visibleTabs = React.useMemo(
    () => tabs.filter((t) => !t.capability || can(t.capability)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [capabilities],
  );

  // Messages lives under "More" on phones; show unread chats there.
  const messagingPlan = useMessagingPlan();
  const unreadChats = useUnreadChats('vendor', can(CAP.MANAGE_MESSAGES) && messagingPlan.allowed);

  const { data: toShip } = useSWR(
    can(CAP.MANAGE_ORDERS) ? '/api/v1/vendor/orders/?filter=to_ship&page_size=1' : null,
    toShipFetcher,
    { refreshInterval: 60_000, revalidateOnFocus: true, shouldRetryOnError: false },
  );

  const active = moreOpen
    ? 'more'
    : visibleTabs.find((t) => pathname === t.path || pathname.startsWith(`${t.path}/`))?.id ?? false;

  return (
    <Paper
      component="nav"
      aria-label="Primary"
      elevation={0}
      sx={{
        display: { xs: 'block', sm: 'none' },
        displayPrint: 'none',
        position: 'fixed',
        left: 0, right: 0, bottom: 0,
        zIndex: (t: Theme) => t.zIndex.drawer + 2,
        borderTop: '1px solid',
        borderColor: 'divider',
        borderRadius: 0,
        pb: 'env(safe-area-inset-bottom)',
        bgcolor: 'background.paper',
      }}
    >
      <BottomNavigation
        value={active}
        showLabels
        sx={{
          height: MOBILE_NAV_HEIGHT,
          bgcolor: 'transparent',
          '& .MuiBottomNavigationAction-root': {
            minWidth: 0,
            px: 0.5,
            color: 'text.secondary',
            '&.Mui-selected': { color: 'primary.main' },
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: 11,
            fontWeight: 600,
            mt: 0.25,
            '&.Mui-selected': { fontSize: 11, fontWeight: 700 },
          },
          '& .Mui-selected .MuiSvgIcon-root': {
            bgcolor: (t: Theme) => alpha(t.palette.primary.main, 0.12),
          },
          '& .MuiSvgIcon-root': {
            fontSize: 22,
            width: 48,
            height: 28,
            px: 1.5,
            py: 0.5,
            borderRadius: '14px',
            boxSizing: 'border-box',
            transition: 'background-color 0.15s',
          },
        }}
      >
        {visibleTabs.map((t) => (
          <BottomNavigationAction
            key={t.id}
            value={t.id}
            label={t.label}
            component={Link}
            href={t.path}
            icon={
              t.id === 'orders' && toShip ? (
                <Badge
                  badgeContent={toShip}
                  color="error"
                  max={99}
                  sx={{ '& .MuiBadge-badge': { top: 4, right: 8, fontSize: 10, height: 16, minWidth: 16 } }}
                >
                  {t.icon}
                </Badge>
              ) : (
                t.icon
              )
            }
          />
        ))}
        <BottomNavigationAction
          value="more"
          label="More"
          icon={
            <Badge badgeContent={unreadChats} color="error" max={99}
                   sx={{ '& .MuiBadge-badge': { top: 4, right: 8, fontSize: 10, height: 16, minWidth: 16 } }}>
              <MenuRoundedIcon />
            </Badge>
          }
          onClick={onMore}
        />
      </BottomNavigation>
    </Paper>
  );
}
