"use client";

import * as React from 'react';
import { useTheme } from '@mui/material/styles';
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
import type {} from '@mui/material/themeCssVarsAugmentation';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import AddCardIcon from '@mui/icons-material/AddCard';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ReviewsIcon from '@mui/icons-material/Reviews';
import LogoutIcon from '@mui/icons-material/Logout';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import HelpCenterIcon from '@mui/icons-material/HelpCenter';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SettingsIcon from '@mui/icons-material/Settings';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import DashboardSidebarContext from '@/context/DashboardSidebarContext';
import { DRAWER_WIDTH, MINI_DRAWER_WIDTH } from '../constants';
import {
  getDrawerSxTransitionMixin,
  getDrawerWidthTransitionMixin,
} from '../mixins';
import { Money } from '@mui/icons-material';
import { ReceiptCent } from 'lucide-react';

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
  icon: React.ReactNode;
  path: string;
}

const mainListItems: NavItemDef[] = [
  { id: 'dashboard', text: 'Dashboard', icon: <HomeRoundedIcon fontSize="small" />, path: '/dashboard' },
  { id: 'orders', text: 'Orders', icon: <AssignmentRoundedIcon fontSize="small" />, path: '/orders' },
  { id: 'products', text: 'Products', icon: <AnalyticsRoundedIcon fontSize="small" />, path: '/products' },
  { id: 'payment', text: 'Payment Method', icon: <AddCardIcon fontSize="small" />, path: '/payment' },
  { id: 'payouts', text: 'Payouts', icon: <CreditScoreIcon fontSize="small" />, path: '/payouts' },
  { id: 'working-hours', text: 'Working Hours', icon: <AccessTimeIcon fontSize="small" />, path: '/working-hours' },
  { id: 'profile', text: 'Profile', icon: <AccountCircleIcon fontSize="small" />, path: '/profile' },
  { id: 'reviews', text: 'Reviews', icon: <ReviewsIcon fontSize="small" />, path: '/reviews' },
  { id: 'help', text: 'Guide', icon: <HelpCenterIcon fontSize="small" />, path: '/help' },
];

const subscribeListItems: NavItemDef[] = [
  { id: 'billing', text: 'Billing', icon: <ReceiptCent size={18} />, path: '/billing' },
  { id: 'subscribe', text: 'Subscription', icon: <Money fontSize="small" />, path: '/subscribe' },
];

const secondaryListItems: NavItemDef[] = [
  { id: 'settings', text: 'Settings', icon: <SettingsIcon fontSize="small" />, path: '/settings' },
  { id: 'about', text: 'About', icon: <InfoRoundedIcon fontSize="small" />, path: '/about' },
  { id: 'logout', text: 'Logout', icon: <LogoutIcon fontSize="small" />, path: '/logout' },
];

interface NavItemProps {
  item: NavItemDef;
  mini: boolean;
  pathname: string;
  onPageItemClick: () => void;
}

function NavItem({ item, mini, pathname, onPageItemClick }: NavItemProps) {
  const hasExternalHref = item.path.startsWith('http://') || item.path.startsWith('https://');
  const LinkComponent = hasExternalHref ? 'a' : Link;
  const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path));

  return (
    <ListItem disablePadding sx={{ display: 'block' }}>
      <ListItemButton
        component={LinkComponent}
        href={item.path}
        selected={isActive}
        onClick={onPageItemClick}
        sx={{
          height: mini ? 50 : 40,
          borderRadius: 1.5,
          mx: mini ? 0 : 0.75,
          mb: 0.25,
          position: 'relative',
          '&.Mui-selected': {
            bgcolor: 'primary.main',
            '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
            '& .MuiListItemText-primary': { color: 'primary.contrastText', fontWeight: 600 },
            '&:hover': { bgcolor: 'primary.dark' },
          },
          '&:not(.Mui-selected):hover': { bgcolor: 'action.hover' },
        }}
        {...(hasExternalHref ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {mini ? (
          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              top: 'calc(50% - 6px)',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <ListItemIcon sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 'auto' }}>
              {item.icon}
            </ListItemIcon>
            <Typography
              variant="caption"
              sx={{
                position: 'absolute',
                bottom: -18,
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: 10,
                fontWeight: 500,
                textAlign: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: MINI_DRAWER_WIDTH - 28,
              }}
            >
              {item.text}
            </Typography>
          </Box>
        ) : (
          <>
            <ListItemIcon sx={{ minWidth: 36, display: 'flex', alignItems: 'center' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{ fontSize: 13.5, fontWeight: isActive ? 600 : 400 }}
              sx={{ whiteSpace: 'nowrap' }}
            />
          </>
        )}
      </ListItemButton>
    </ListItem>
  );
}

function SectionLabel({ label, mini }: { label: string; mini: boolean }) {
  if (mini) return <Box sx={{ px: 2, py: 0.5 }}><Box sx={{ borderTop: 1, borderColor: 'divider' }} /></Box>;
  return (
    <Typography
      variant="overline"
      sx={{
        px: 2,
        pt: 1.5,
        pb: 0.5,
        display: 'block',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 1,
        color: 'text.secondary',
      }}
    >
      {label}
    </Typography>
  );
}

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

  const [isFullyExpanded, setIsFullyExpanded] = React.useState(expanded);
  const [isFullyCollapsed, setIsFullyCollapsed] = React.useState(!expanded);

  React.useEffect(() => {
    if (expanded) {
      const t = setTimeout(
        () => setIsFullyExpanded(true),
        theme.transitions.duration.enteringScreen,
      );
      return () => clearTimeout(t);
    }
    setIsFullyExpanded(false);
    return () => {};
  }, [expanded, theme.transitions.duration.enteringScreen]);

  React.useEffect(() => {
    if (!expanded) {
      const t = setTimeout(
        () => setIsFullyCollapsed(true),
        theme.transitions.duration.leavingScreen,
      );
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

  const hasDrawerTransitions =
    isOverSmViewport && (!disableCollapsibleSidebar || isOverMdViewport);

  const getDrawerContent = React.useCallback(
    (viewport: 'phone' | 'tablet' | 'desktop') => (
      <React.Fragment>
        <Toolbar />
        <Box
          component="nav"
          aria-label={`${viewport.charAt(0).toUpperCase()}${viewport.slice(1)}`}
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'auto',
            scrollbarGutter: mini ? 'stable' : 'auto',
            overflowX: 'hidden',
            pt: !mini ? 0 : 2,
            ...(hasDrawerTransitions
              ? getDrawerSxTransitionMixin(isFullyExpanded, 'padding')
              : {}),
          }}
        >
          {/* Store identity card */}
          {mini ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', pb: 1, borderBottom: 1, borderColor: 'divider', mb: 0.5 }}>
              {storeLoading ? (
                <Skeleton variant="circular" width={38} height={38} />
              ) : (
                <Tooltip title={storeName || 'Your Store'} placement="right">
                  <Link href="/profile" style={{ textDecoration: 'none' }}>
                    <Avatar
                      src={storeAvatar || undefined}
                      alt={storeName}
                      sx={{
                        width: 38,
                        height: 38,
                        fontSize: 16,
                        fontWeight: 700,
                        bgcolor: (theme.vars ?? theme).palette.primary.main,
                        color: (theme.vars ?? theme).palette.primary.contrastText,
                        cursor: 'pointer',
                        border: '2px solid',
                        borderColor: 'divider',
                        '&:hover': { opacity: 0.85 },
                      }}
                    >
                      {!storeAvatar && storeName ? storeName.charAt(0).toUpperCase() : null}
                    </Avatar>
                  </Link>
                </Tooltip>
              )}
            </Box>
          ) : (
            <Box
              sx={{
                px: 2,
                py: 1.5,
                borderBottom: 1,
                borderColor: 'divider',
                mb: 0.5,
              }}
            >
              {storeLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Skeleton variant="circular" width={44} height={44} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="70%" height={18} />
                    <Skeleton variant="text" width="50%" height={14} />
                  </Box>
                </Box>
              ) : storeName ? (
                <Link href="/profile" style={{ textDecoration: 'none' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      borderRadius: 2,
                      p: 0.75,
                      mx: -0.75,
                      cursor: 'pointer',
                      transition: 'background-color 0.15s',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <Avatar
                      src={storeAvatar || undefined}
                      alt={storeName}
                      sx={{
                        width: 44,
                        height: 44,
                        fontSize: 18,
                        fontWeight: 700,
                        bgcolor: (theme.vars ?? theme).palette.primary.main,
                        color: (theme.vars ?? theme).palette.primary.contrastText,
                        border: '2px solid',
                        borderColor: 'divider',
                        flexShrink: 0,
                      }}
                    >
                      {!storeAvatar ? storeName.charAt(0).toUpperCase() : null}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="subtitle2"
                        fontWeight={700}
                        noWrap
                        sx={{ color: 'text.primary', lineHeight: 1.3 }}
                      >
                        {storeName}
                      </Typography>
                      {storeAddress ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, mt: 0.25 }}>
                          <LocationOnIcon sx={{ fontSize: 11, color: 'text.secondary', flexShrink: 0 }} />
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                            sx={{ fontSize: 11 }}
                          >
                            {storeAddress}
                          </Typography>
                        </Box>
                      ) : null}
                    </Box>
                  </Box>
                </Link>
              ) : null}
            </Box>
          )}

          {/* Navigation items */}
          <List
            dense
            sx={{
              padding: mini ? 0 : 0.5,
              mb: 4,
              width: mini ? MINI_DRAWER_WIDTH : 'auto',
              flexGrow: 1,
            }}
          >
            {mainListItems.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                mini={mini}
                pathname={pathname}
                onPageItemClick={handlePageItemClick}
              />
            ))}

            <SectionLabel label="Subscription" mini={mini} />

            {subscribeListItems.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                mini={mini}
                pathname={pathname}
                onPageItemClick={handlePageItemClick}
              />
            ))}

            <SectionLabel label="More" mini={mini} />

            {secondaryListItems.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                mini={mini}
                pathname={pathname}
                onPageItemClick={handlePageItemClick}
              />
            ))}
          </List>
        </Box>
      </React.Fragment>
    ),
    [
      mini,
      hasDrawerTransitions,
      isFullyExpanded,
      pathname,
      theme,
      storeName,
      storeAddress,
      storeAvatar,
      storeLoading,
      handlePageItemClick,
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
          ...getDrawerWidthTransitionMixin(expanded),
        },
      };
    },
    [expanded, mini],
  );

  const sidebarContextValue = React.useMemo(
    () => ({
      mini,
      fullyExpanded: isFullyExpanded,
      fullyCollapsed: isFullyCollapsed,
      hasDrawerTransitions,
      onPageItemClick: handlePageItemClick,
    }),
    [mini, isFullyExpanded, isFullyCollapsed, hasDrawerTransitions, handlePageItemClick],
  );

  return (
    <DashboardSidebarContext.Provider value={sidebarContextValue}>
      {/* Mobile (temporary) */}
      <Drawer
        container={container}
        variant="temporary"
        open={expanded}
        onClose={handleSetSidebarExpanded(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: {
            xs: 'block',
            sm: disableCollapsibleSidebar ? 'block' : 'none',
            md: 'none',
          },
          ...getDrawerSharedSx(true),
        }}
      >
        {getDrawerContent('phone')}
      </Drawer>

      {/* Tablet (permanent, collapsible) */}
      <Drawer
        variant="permanent"
        sx={{
          display: {
            xs: 'none',
            sm: disableCollapsibleSidebar ? 'none' : 'block',
            md: 'none',
          },
          ...getDrawerSharedSx(false),
        }}
      >
        {getDrawerContent('tablet')}
      </Drawer>

      {/* Desktop (permanent) */}
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
