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
import type {} from '@mui/material/themeCssVarsAugmentation';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import AddCardIcon from '@mui/icons-material/AddCard';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ReviewsIcon from '@mui/icons-material/Reviews';
// import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import HelpCenterIcon from '@mui/icons-material/HelpCenter';
// import HelpRoundedIcon from '@mui/icons-material/HelpRounded';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import DashboardSidebarContext from '@/context/DashboardSidebarContext';
import { DRAWER_WIDTH, MINI_DRAWER_WIDTH } from '../constants';
import {
  getDrawerSxTransitionMixin,
  getDrawerWidthTransitionMixin,
} from '../mixins';

export interface DashboardSidebarProps {
  expanded?: boolean;
  setExpanded: (expanded: boolean) => void;
  disableCollapsibleSidebar?: boolean;
  container?: Element;
}

const mainListItems = [
  { id: 'dashboard', text: 'Dashboard', icon: <HomeRoundedIcon />, path: '/dashboard' },
  { id: 'orders', text: 'Orders', icon: <AssignmentRoundedIcon />, path: '/orders' },
  { id: 'products', text: 'Products', icon: <AnalyticsRoundedIcon />, path: '/products' },
  { id: 'payment', text: 'Payment Method', icon: <AddCardIcon />, path: '/payment' },
  { id: 'payouts', text: 'Payouts', icon: <CreditScoreIcon />, path: '/payouts' },
  { id: 'working-hours', text: 'Working Hours', icon: <AccessTimeIcon />, path: '/working-hours' },
  { id: 'profile', text: 'Profile', icon: <AccountCircleIcon />, path: '/profile' },
  { id: 'reviews', text: 'Reviews', icon: <ReviewsIcon />, path: '/reviews' },
  { id: 'help', text: 'Guide', icon: <HelpCenterIcon />, path: '/help' },
];

const secondaryListItems = [
  // { id: 'settings', text: 'Settings', icon: <SettingsRoundedIcon />, path: '/settings' },
  { id: 'about', text: 'About', icon: <InfoRoundedIcon />, path: '/about' },
  // { id: 'feedback', text: 'Feedback', icon: <HelpRoundedIcon />, path: '/feedback' },
];

export default function DashboardSidebar({
  expanded = true,
  setExpanded,
  disableCollapsibleSidebar = false,
  container,
}: DashboardSidebarProps) {
  const theme = useTheme();
  const pathname = usePathname();

  const isOverSmViewport = useMediaQuery(theme.breakpoints.up('sm'));
  const isOverMdViewport = useMediaQuery(theme.breakpoints.up('md'));

  const [isFullyExpanded, setIsFullyExpanded] = React.useState(expanded);
  const [isFullyCollapsed, setIsFullyCollapsed] = React.useState(!expanded);

  React.useEffect(() => {
    if (expanded) {
      const drawerWidthTransitionTimeout = setTimeout(() => {
        setIsFullyExpanded(true);
      }, theme.transitions.duration.enteringScreen);

      return () => clearTimeout(drawerWidthTransitionTimeout);
    }

    setIsFullyExpanded(false);

    return () => {};
  }, [expanded, theme.transitions.duration.enteringScreen]);

  React.useEffect(() => {
    if (!expanded) {
      const drawerWidthTransitionTimeout = setTimeout(() => {
        setIsFullyCollapsed(true);
      }, theme.transitions.duration.leavingScreen);

      return () => clearTimeout(drawerWidthTransitionTimeout);
    }

    setIsFullyCollapsed(false);

    return () => {};
  }, [expanded, theme.transitions.duration.leavingScreen]);

  const mini = !disableCollapsibleSidebar && !expanded;

  const handleSetSidebarExpanded = React.useCallback(
    (newExpanded: boolean) => () => {
      setExpanded(newExpanded);
    },
    [setExpanded],
  );

  const handlePageItemClick = React.useCallback(
    () => {
      if (!isOverSmViewport) {
        setExpanded(false);
      }
    },
    [setExpanded, isOverSmViewport],
  );

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
          <List
            dense
            sx={{
              padding: mini ? 0 : 0.5,
              mb: 4,
              width: mini ? MINI_DRAWER_WIDTH : 'auto',
              flexGrow: 1, // Ensure the list takes available space
            }}
          >
            <Typography
              variant="overline"
              sx={{ px: 2, py: 1, display: 'block', fontWeight: 'bold' }}
            >
              {/* Main items */}
            </Typography>
            {mainListItems.map((item) => {
              const hasExternalHref = item.path.startsWith('http://') || item.path.startsWith('https://');
              const LinkComponent = hasExternalHref ? 'a' : Link;

              return (
                <ListItem key={item.id} disablePadding sx={{ display: 'block' }}>
                  <ListItemButton
                    component={LinkComponent}
                    href={item.path}
                    selected={pathname.startsWith(item.path)}
                    onClick={handlePageItemClick}
                    sx={{ height: mini ? 50 : 'auto' }}
                    {...(hasExternalHref
                      ? {
                          target: '_blank',
                          rel: 'noopener noreferrer',
                        }
                      : {})}
                  >
                    <Box
                      sx={
                        mini
                          ? {
                              position: 'absolute',
                              left: '50%',
                              top: 'calc(50% - 6px)',
                              transform: 'translate(-50%, -50%)',
                            }
                          : {}
                      }
                    >
                      <ListItemIcon
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: mini ? 'center' : 'auto',
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      {mini ? (
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
                      ) : null}
                    </Box>
                    {!mini ? (
                      <ListItemText
                        primary={item.text}
                        sx={{ whiteSpace: 'nowrap', zIndex: 1 }}
                      />
                    ) : null}
                  </ListItemButton>
                </ListItem>
              );
            })}
            <Box sx={{ px: 2, py: 1 }}>
              <hr style={{ borderColor: theme.palette.divider }} />
            </Box>
            <Typography
              variant="overline"
              sx={{ px: 2, py: 1, display: 'block', fontWeight: 'bold' }}
            >
              {/* Example items */}
            </Typography>
            {secondaryListItems.map((item) => {
              const hasExternalHref = item.path.startsWith('http://') || item.path.startsWith('https://');
              const LinkComponent = hasExternalHref ? 'a' : Link;

              return (
                <ListItem key={item.id} disablePadding sx={{ display: 'block' }}>
                  <ListItemButton
                    component={LinkComponent}
                    href={item.path}
                    selected={pathname.startsWith(item.path)}
                    onClick={handlePageItemClick}
                    sx={{ height: mini ? 50 : 'auto' }}
                    {...(hasExternalHref
                      ? {
                          target: '_blank',
                          rel: 'noopener noreferrer',
                        }
                      : {})}
                  >
                    <Box
                      sx={
                        mini
                          ? {
                              position: 'absolute',
                              left: '50%',
                              top: 'calc(50% - 6px)',
                              transform: 'translate(-50%, -50%)',
                            }
                          : {}
                      }
                    >
                      <ListItemIcon
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: mini ? 'center' : 'auto',
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      {mini ? (
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
                      ) : null}
                    </Box>
                    {!mini ? (
                      <ListItemText
                        primary={item.text}
                        sx={{ whiteSpace: 'nowrap', zIndex: 1 }}
                      />
                    ) : null}
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>
      </React.Fragment>
    ),
    [mini, hasDrawerTransitions, isFullyExpanded, pathname, theme.palette.divider],
  );

  const getDrawerSharedSx = React.useCallback(
    (isTemporary: boolean) => {
      const drawerWidth = mini ? MINI_DRAWER_WIDTH : DRAWER_WIDTH;

      return {
        displayPrint: 'none',
        width: drawerWidth,
        flexShrink: 0,
        height: '100%', // Ensure Drawer takes full height
        ...getDrawerWidthTransitionMixin(expanded),
        ...(isTemporary ? { position: 'absolute' } : {}),
        [`& .MuiDrawer-paper`]: {
          position: isTemporary ? 'absolute' : 'fixed',
          width: drawerWidth,
          height: '100%', // Ensure paper takes full height
          boxSizing: 'border-box',
          backgroundImage: 'none',
          ...getDrawerWidthTransitionMixin(expanded),
        },
      };
    },
    [expanded, mini],
  );

  const sidebarContextValue = React.useMemo(() => {
    return {
      mini,
      fullyExpanded: isFullyExpanded,
      fullyCollapsed: isFullyCollapsed,
      hasDrawerTransitions,
      onPageItemClick: handlePageItemClick,
    };
  }, [mini, isFullyExpanded, isFullyCollapsed, hasDrawerTransitions, handlePageItemClick]);

  return (
    <DashboardSidebarContext.Provider value={sidebarContextValue}>
      <Drawer
        container={container}
        variant="temporary"
        open={expanded}
        onClose={handleSetSidebarExpanded(false)}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
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