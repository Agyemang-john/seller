"use client";

import * as React from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import type {} from '@mui/material/themeCssVarsAugmentation';

import DashboardRoundedIcon      from '@mui/icons-material/DashboardRounded';
import TrendingUpRoundedIcon     from '@mui/icons-material/TrendingUpRounded';
import LocalShippingRoundedIcon  from '@mui/icons-material/LocalShippingRounded';
import Inventory2RoundedIcon     from '@mui/icons-material/Inventory2Rounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import PaymentsRoundedIcon       from '@mui/icons-material/PaymentsRounded';
import ScheduleRoundedIcon       from '@mui/icons-material/ScheduleRounded';
import StoreRoundedIcon          from '@mui/icons-material/StoreRounded';
import StarRoundedIcon           from '@mui/icons-material/StarRounded';
import HelpOutlineRoundedIcon    from '@mui/icons-material/HelpOutlineRounded';
import GroupsRoundedIcon         from '@mui/icons-material/GroupsRounded';
import ReceiptLongRoundedIcon    from '@mui/icons-material/ReceiptLongRounded';
import CardMembershipRoundedIcon from '@mui/icons-material/CardMembershipRounded';
import SettingsRoundedIcon       from '@mui/icons-material/SettingsRounded';
import InfoOutlinedIcon          from '@mui/icons-material/InfoOutlined';
import LogoutRoundedIcon         from '@mui/icons-material/LogoutRounded';
import LocationOnRoundedIcon     from '@mui/icons-material/LocationOnRounded';
import VerifiedRoundedIcon       from '@mui/icons-material/VerifiedRounded';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import DashboardSidebarContext from '@/context/DashboardSidebarContext';
import { DRAWER_WIDTH, MINI_DRAWER_WIDTH } from '../constants';
import { getDrawerSxTransitionMixin, getDrawerWidthTransitionMixin } from '../mixins';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface DashboardSidebarProps {
  expanded?: boolean;
  setExpanded: (expanded: boolean) => void;
  disableCollapsibleSidebar?: boolean;
  container?: Element;
  storeName?: string;
  storeAddress?: string;
  storeAvatar?: string;
  storeLoading?: boolean;
}

interface NavItemDef {
  id: string;
  text: string;
  icon: React.ReactElement;
  path: string;
}

// ── Nav definitions ───────────────────────────────────────────────────────────
const mainListItems: NavItemDef[] = [
  { id: 'dashboard',       text: 'Dashboard',     icon: <DashboardRoundedIcon />,           path: '/dashboard' },
  { id: 'store-analytics', text: 'Store Traffic', icon: <TrendingUpRoundedIcon />,           path: '/store-analytics' },
  { id: 'orders',          text: 'Orders',        icon: <LocalShippingRoundedIcon />,        path: '/orders' },
  { id: 'products',      text: 'Products',      icon: <Inventory2RoundedIcon />,             path: '/products' },
  { id: 'payment',       text: 'Payment',       icon: <AccountBalanceWalletRoundedIcon />,   path: '/payment' },
  { id: 'payouts',       text: 'Payouts',       icon: <PaymentsRoundedIcon />,               path: '/payouts' },
  { id: 'working-hours', text: 'Working Hours', icon: <ScheduleRoundedIcon />,               path: '/working-hours' },
  { id: 'profile',       text: 'Store Profile', icon: <StoreRoundedIcon />,                  path: '/profile' },
  { id: 'reviews',       text: 'Reviews',       icon: <StarRoundedIcon />,                   path: '/reviews' },
  { id: 'help',          text: 'Help & Guide',  icon: <HelpOutlineRoundedIcon />,            path: '/help' },
  { id: 'connect',      text: 'Community',     icon: <GroupsRoundedIcon />,                 path: '/connect' },
];

const subscribeListItems: NavItemDef[] = [
  { id: 'billing',   text: 'Billing',      icon: <ReceiptLongRoundedIcon />,    path: '/billing' },
  { id: 'subscribe', text: 'Subscription', icon: <CardMembershipRoundedIcon />, path: '/subscribe' },
];

const bottomListItems: NavItemDef[] = [
  { id: 'settings', text: 'Settings', icon: <SettingsRoundedIcon />, path: '/settings' },
  { id: 'about',    text: 'About',    icon: <InfoOutlinedIcon />,    path: '/about' },
  { id: 'logout',   text: 'Log out',  icon: <LogoutRoundedIcon />,   path: '/logout' },
];

// ── NavItem ───────────────────────────────────────────────────────────────────
interface NavItemProps {
  item: NavItemDef;
  mini: boolean;
  pathname: string;
  onPageItemClick: () => void;
}

function NavItem({ item, mini, pathname, onPageItemClick }: NavItemProps) {
  const isActive  = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path));
  const isLogout  = item.id === 'logout';

  return (
    <ListItem disablePadding sx={{ display: 'block', mb: 0.25 }}>
      <Tooltip title={mini ? item.text : ''} placement="right" arrow>
        <ListItemButton
          component={Link}
          href={item.path}
          selected={isActive}
          onClick={onPageItemClick}
          sx={{
            height: 40,
            borderRadius: '10px',
            px: mini ? 0 : 1.25,
            justifyContent: mini ? 'center' : 'flex-start',
            transition: 'background-color 0.15s, color 0.15s',
            '&.Mui-selected': {
              bgcolor: (t: Theme) => alpha(t.palette.primary.main, 0.1),
              '& .MuiListItemIcon-root': { color: 'primary.main' },
              '& .MuiListItemText-primary': { fontWeight: 700, color: 'primary.main' },
              '&:hover': { bgcolor: (t: Theme) => alpha(t.palette.primary.main, 0.16) },
            },
            '&:not(.Mui-selected):hover': {
              bgcolor: isLogout ? (t: Theme) => alpha(t.palette.error.main, 0.07) : 'action.hover',
              '& .MuiListItemIcon-root': { color: isLogout ? 'error.main' : 'text.primary' },
              '& .MuiListItemText-primary': { color: isLogout ? 'error.main' : 'text.primary' },
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: mini ? 'auto' : 34,
              color: isActive ? 'primary.main' : isLogout ? 'text.disabled' : 'text.secondary',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'color 0.15s',
            }}
          >
            {React.cloneElement(item.icon, { sx: { fontSize: mini ? 22 : 20 } })}
          </ListItemIcon>

          {!mini && (
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontSize: 13.5,
                fontWeight: isActive ? 700 : 500,
                letterSpacing: '-0.01em',
                lineHeight: 1,
              }}
              sx={{ m: 0 }}
            />
          )}
        </ListItemButton>
      </Tooltip>
    </ListItem>
  );
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ label, mini }: { label: string; mini: boolean }) {
  if (mini) {
    return (
      <Box sx={{ px: 1, py: 1 }}>
        <Divider />
      </Box>
    );
  }
  return (
    <Box sx={{ px: 1.25, pt: 2, pb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography
        sx={{
          fontSize: 10, fontWeight: 800, letterSpacing: '0.1em',
          color: 'text.disabled', textTransform: 'uppercase', whiteSpace: 'nowrap',
        }}
      >
        {label}
      </Typography>
      <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
    </Box>
  );
}

// ── Store card ────────────────────────────────────────────────────────────────
interface StoreCardProps {
  mini: boolean;
  storeName?: string;
  storeAddress?: string;
  storeAvatar?: string;
  storeLoading?: boolean;
}

function StoreCard({ mini, storeName, storeAddress, storeAvatar, storeLoading }: StoreCardProps) {
  if (mini) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 1.5, px: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
        {storeLoading ? (
          <Skeleton variant="circular" width={38} height={38} />
        ) : (
          <Tooltip title={storeName || 'Your Store'} placement="right" arrow>
            <Link href="/profile" style={{ textDecoration: 'none' }}>
              <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                <Avatar
                  src={storeAvatar || undefined}
                  sx={{
                    width: 38, height: 38, fontSize: 16, fontWeight: 700,
                    bgcolor: 'primary.main', color: 'primary.contrastText',
                    border: '2px solid', borderColor: 'primary.light',
                    cursor: 'pointer', '&:hover': { opacity: 0.85 },
                  }}
                >
                  {!storeAvatar && storeName ? storeName[0].toUpperCase() : null}
                </Avatar>
                <Box sx={{
                  position: 'absolute', bottom: 1, right: 1,
                  width: 9, height: 9, borderRadius: '50%',
                  bgcolor: '#22c55e', border: '1.5px solid', borderColor: 'background.paper',
                }} />
              </Box>
            </Link>
          </Tooltip>
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
      {storeLoading ? (
        <Box sx={{ px: 2, py: 1.75, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Skeleton variant="circular" width={44} height={44} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="rounded" width="65%" height={15} sx={{ mb: 0.75, borderRadius: '4px' }} />
            <Skeleton variant="rounded" width="45%" height={12} sx={{ borderRadius: '4px' }} />
          </Box>
        </Box>
      ) : storeName ? (
        <Link href="/profile" style={{ textDecoration: 'none' }}>
          <Box
            sx={{
              px: 1.5, py: 1.5, mx: 0.75, my: 0.75,
              borderRadius: '12px', cursor: 'pointer',
              transition: 'background-color 0.15s',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              {/* Avatar with online dot */}
              <Box sx={{ position: 'relative', flexShrink: 0 }}>
                <Avatar
                  src={storeAvatar || undefined}
                  sx={{
                    width: 42, height: 42, fontSize: 17, fontWeight: 700,
                    bgcolor: 'primary.main', color: 'primary.contrastText',
                    border: '2px solid', borderColor: (t: Theme) => alpha(t.palette.primary.main, 0.25),
                  }}
                >
                  {!storeAvatar ? storeName[0].toUpperCase() : null}
                </Avatar>
                <Box sx={{
                  position: 'absolute', bottom: 1, right: 1,
                  width: 10, height: 10, borderRadius: '50%',
                  bgcolor: '#22c55e', border: '2px solid', borderColor: 'background.paper',
                }} />
              </Box>

              {/* Store info */}
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.2 }}>
                  <Typography
                    sx={{ fontSize: 13.5, fontWeight: 700, color: 'text.primary', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {storeName}
                  </Typography>
                  <VerifiedRoundedIcon sx={{ fontSize: 13, color: 'primary.main', flexShrink: 0 }} />
                </Box>
                {storeAddress ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                    <LocationOnRoundedIcon sx={{ fontSize: 11, color: 'text.disabled', flexShrink: 0 }} />
                    <Typography sx={{ fontSize: 11, color: 'text.disabled', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {storeAddress}
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#22c55e', flexShrink: 0 }} />
                    <Typography sx={{ fontSize: 11, color: '#22c55e', fontWeight: 600 }}>Active</Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Link>
      ) : null}
    </Box>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function DashboardSidebar({
  expanded = true,
  setExpanded,
  disableCollapsibleSidebar = false,
  container,
  storeName,
  storeAddress,
  storeAvatar,
  storeLoading,
}: DashboardSidebarProps) {
  const theme = useTheme();
  const pathname = usePathname();

  const isOverSmViewport = useMediaQuery(theme.breakpoints.up('sm'));
  const isOverMdViewport = useMediaQuery(theme.breakpoints.up('md'));

  const [isFullyExpanded,  setIsFullyExpanded]  = React.useState(expanded);
  const [isFullyCollapsed, setIsFullyCollapsed] = React.useState(!expanded);

  React.useEffect(() => {
    if (expanded) {
      const t = setTimeout(() => setIsFullyExpanded(true), theme.transitions.duration.enteringScreen);
      return () => clearTimeout(t);
    }
    setIsFullyExpanded(false);
    return () => {};
  }, [expanded, theme.transitions.duration.enteringScreen]);

  React.useEffect(() => {
    if (!expanded) {
      const t = setTimeout(() => setIsFullyCollapsed(true), theme.transitions.duration.leavingScreen);
      return () => clearTimeout(t);
    }
    setIsFullyCollapsed(false);
    return () => {};
  }, [expanded, theme.transitions.duration.leavingScreen]);

  const mini = !disableCollapsibleSidebar && !expanded;

  const handleSetSidebarExpanded = React.useCallback(
    (newExpanded: boolean) => () => setExpanded(newExpanded),
    [setExpanded],
  );

  const handlePageItemClick = React.useCallback(() => {
    if (!isOverSmViewport) setExpanded(false);
  }, [setExpanded, isOverSmViewport]);

  const hasDrawerTransitions = isOverSmViewport && (!disableCollapsibleSidebar || isOverMdViewport);

  const getDrawerContent = React.useCallback(
    (viewport: 'phone' | 'tablet' | 'desktop') => (
      <Box
        component="nav"
        aria-label={viewport}
        sx={{
          display: 'flex', flexDirection: 'column', height: '100%',
          overflow: 'hidden',
          ...(hasDrawerTransitions ? getDrawerSxTransitionMixin(isFullyExpanded, 'padding') : {}),
        }}
      >
        <Toolbar sx={{ flexShrink: 0 }} />

        {/* Store card */}
        <StoreCard
          mini={mini}
          storeName={storeName}
          storeAddress={storeAddress}
          storeAvatar={storeAvatar}
          storeLoading={storeLoading}
        />

        {/* Scrollable nav area */}
        <Box
          sx={{
            flex: 1, overflowY: 'auto', overflowX: 'hidden',
            px: 0.75, pt: 0.75,
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': { width: 4 },
            '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
            '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: '4px' },
          }}
        >
          <List dense disablePadding>
            {mainListItems.map((item) => (
              <NavItem key={item.id} item={item} mini={mini} pathname={pathname} onPageItemClick={handlePageItemClick} />
            ))}
          </List>

          <SectionLabel label="Subscription" mini={mini} />

          <List dense disablePadding>
            {subscribeListItems.map((item) => (
              <NavItem key={item.id} item={item} mini={mini} pathname={pathname} onPageItemClick={handlePageItemClick} />
            ))}
          </List>
        </Box>

        {/* Pinned bottom items */}
        <Box sx={{ flexShrink: 0, px: 0.75, pb: 0.75, pt: 0.5, borderTop: '1px solid', borderColor: 'divider' }}>
          <List dense disablePadding>
            {bottomListItems.map((item) => (
              <NavItem key={item.id} item={item} mini={mini} pathname={pathname} onPageItemClick={handlePageItemClick} />
            ))}
          </List>
        </Box>
      </Box>
    ),
    [
      mini, hasDrawerTransitions, isFullyExpanded, pathname,
      storeName, storeAddress, storeAvatar, storeLoading, handlePageItemClick,
    ],
  );

  const getDrawerSharedSx = React.useCallback(
    (isTemporary: boolean) => {
      const drawerWidth = mini ? MINI_DRAWER_WIDTH : DRAWER_WIDTH;
      return {
        displayPrint: 'none',
        width: drawerWidth,
        flexShrink: 0,
        height: '100%',
        ...getDrawerWidthTransitionMixin(expanded),
        ...(isTemporary ? { position: 'absolute' } : {}),
        [`& .MuiDrawer-paper`]: {
          position: isTemporary ? 'absolute' : 'fixed',
          width: drawerWidth,
          height: '100%',
          boxSizing: 'border-box',
          backgroundImage: 'none',
          borderRight: '1px solid',
          borderColor: 'divider',
          ...getDrawerWidthTransitionMixin(expanded),
        },
      };
    },
    [expanded, mini],
  );

  const sidebarContextValue = React.useMemo(
    () => ({ mini, fullyExpanded: isFullyExpanded, fullyCollapsed: isFullyCollapsed, hasDrawerTransitions, onPageItemClick: handlePageItemClick }),
    [mini, isFullyExpanded, isFullyCollapsed, hasDrawerTransitions, handlePageItemClick],
  );

  return (
    <DashboardSidebarContext.Provider value={sidebarContextValue}>
      {/* Mobile */}
      <Drawer
        container={container}
        variant="temporary"
        open={expanded}
        onClose={handleSetSidebarExpanded(false)}
        ModalProps={{ keepMounted: true, disableScrollLock: true }}
        sx={{
          display: { xs: 'block', sm: disableCollapsibleSidebar ? 'block' : 'none', md: 'none' },
          ...getDrawerSharedSx(true),
        }}
      >
        {getDrawerContent('phone')}
      </Drawer>

      {/* Tablet */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: disableCollapsibleSidebar ? 'none' : 'block', md: 'none' },
          ...getDrawerSharedSx(false),
        }}
      >
        {getDrawerContent('tablet')}
      </Drawer>

      {/* Desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          ...getDrawerSharedSx(false),
        }}
      >
        {getDrawerContent('desktop')}
      </Drawer>
    </DashboardSidebarContext.Provider>
  );
}
