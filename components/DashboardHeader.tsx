import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiAppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import Link from 'next/link';
import ThemeSwitcher from './ThemeSwitcher';
import NotificationBell from './NotificationBell';

const AppBar = styled(MuiAppBar)(({ theme }) => ({
  borderWidth: 0,
  borderBottomWidth: 1,
  borderStyle: 'solid',
  borderColor: (theme.vars ?? theme).palette.divider,
  boxShadow: 'none',
  zIndex: theme.zIndex.drawer + 1,
}));

const LogoContainer = styled('div')({
  position: 'relative',
  height: 40,
  display: 'flex',
  alignItems: 'center',
  '& img': { maxHeight: 40 },
});

export interface DashboardHeaderProps {
  logo?: React.ReactNode;
  title?: string;
  menuOpen: boolean;
  onToggleMenu: (open: boolean) => void;
  storeName?: string;
  storeAvatar?: string;
}

export default function DashboardHeader({
  logo,
  title,
  menuOpen,
  onToggleMenu,
  storeName,
  storeAvatar,
}: DashboardHeaderProps) {
  const theme = useTheme();

  const handleMenuOpen = React.useCallback(() => {
    onToggleMenu(!menuOpen);
  }, [menuOpen, onToggleMenu]);

  const getMenuIcon = React.useCallback(
    (isExpanded: boolean) => (
      <Tooltip
        title={`${isExpanded ? 'Collapse' : 'Expand'} menu`}
        enterDelay={1000}
      >
        <div>
          <IconButton
            size="small"
            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} navigation menu`}
            onClick={handleMenuOpen}
          >
            {isExpanded ? <MenuOpenIcon /> : <MenuIcon />}
          </IconButton>
        </div>
      </Tooltip>
    ),
    [handleMenuOpen],
  );

  return (
    <AppBar color="inherit" position="absolute" sx={{ displayPrint: 'none' }}>
      <Toolbar sx={{ backgroundColor: 'inherit', mx: { xs: -0.75, sm: -1 } }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ width: '100%' }}
        >
          {/* Left: toggle + logo */}
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Box>{getMenuIcon(menuOpen)}</Box>
            <Link href="/dashboard" style={{ textDecoration: 'none' }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                {logo ? <LogoContainer>{logo}</LogoContainer> : null}
                {title ? (
                  <Typography
                    variant="h6"
                    sx={{
                      color: (theme.vars ?? theme).palette.primary.main,
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      lineHeight: 1,
                    }}
                  >
                    {title}
                  </Typography>
                ) : null}
              </Stack>
            </Link>
          </Stack>

          {/* Right: store identity, notifications, theme */}
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ ml: 'auto' }}>
            {storeName ? (
              <Link href="/profile" style={{ textDecoration: 'none' }}>
                <Tooltip title="Your store profile" enterDelay={800}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{
                      px: 1.25,
                      py: 0.5,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'action.hover',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s',
                      '&:hover': { bgcolor: 'action.selected' },
                    }}
                  >
                    <Avatar
                      src={storeAvatar || undefined}
                      alt={storeName}
                      sx={{
                        width: 26,
                        height: 26,
                        fontSize: 13,
                        fontWeight: 700,
                        bgcolor: (theme.vars ?? theme).palette.primary.main,
                        color: (theme.vars ?? theme).palette.primary.contrastText,
                      }}
                    >
                      {!storeAvatar ? storeName.charAt(0).toUpperCase() : null}
                    </Avatar>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                        display: { xs: 'none', sm: 'block' },
                        maxWidth: 160,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {storeName}
                    </Typography>
                  </Stack>
                </Tooltip>
              </Link>
            ) : null}

            <NotificationBell />
            <ThemeSwitcher />
          </Stack>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
