import * as React from 'react';
import { styled, useTheme, alpha } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiAppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import MenuRoundedIcon     from '@mui/icons-material/MenuRounded';
import MenuOpenRoundedIcon from '@mui/icons-material/MenuOpenRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import Link from 'next/link';
import ThemeSwitcher from './ThemeSwitcher';
import NotificationBell from './NotificationBell';

// ── AppBar ────────────────────────────────────────────────────────────────────
const AppBar = styled(MuiAppBar)(({ theme }) => ({
  borderWidth: 0,
  borderBottomWidth: 1,
  borderStyle: 'solid',
  borderColor: (theme.vars ?? theme).palette.divider,
  boxShadow: 'none',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  backgroundColor: (theme.vars ?? theme).palette.background.paper,
  zIndex: theme.zIndex.drawer + 1,
}));

// ── Props ─────────────────────────────────────────────────────────────────────
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
  const handleMenuOpen = React.useCallback(() => {
    onToggleMenu(!menuOpen);
  }, [menuOpen, onToggleMenu]);

  return (
    <AppBar color="inherit" position="absolute" sx={{ displayPrint: 'none' }}>
      <Toolbar
        sx={{
          minHeight: { xs: 56, sm: 60 },
          px: { xs: 1.5, sm: 2 },
          gap: 1,
        }}
      >
        {/* ── Left: menu toggle + brand ──────────────────────────────────── */}
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0 }}>
          <Tooltip title={menuOpen ? 'Collapse menu' : 'Expand menu'} enterDelay={800} placement="bottom">
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              aria-label={menuOpen ? 'Collapse navigation' : 'Expand navigation'}
              sx={{
                borderRadius: '10px',
                width: 36, height: 36,
                color: 'text.secondary',
                '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
                transition: 'color 0.15s, background-color 0.15s',
              }}
            >
              {menuOpen
                ? <MenuOpenRoundedIcon sx={{ fontSize: 20 }} />
                : <MenuRoundedIcon    sx={{ fontSize: 20 }} />}
            </IconButton>
          </Tooltip>

          <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              {logo && (
                <Box sx={{ height: 36, display: 'flex', alignItems: 'center', '& img': { maxHeight: 36 } }}>
                  {logo}
                </Box>
              )}
              {/* Brand text — hidden on very small screens if there's a logo */}
              <Box sx={{ display: { xs: logo ? 'none' : 'flex', sm: 'flex' }, flexDirection: 'column', lineHeight: 1 }}>
                {title && (
                  <Typography
                    sx={{
                      fontSize: 15, fontWeight: 800, letterSpacing: '-0.5px',
                      color: 'text.primary', lineHeight: 1.1,
                    }}
                  >
                    {title}
                  </Typography>
                )}
                <Typography
                  sx={{
                    fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em',
                    color: 'text.disabled', textTransform: 'uppercase',
                    display: title ? 'block' : 'none',
                  }}
                >
                  Seller Center
                </Typography>
              </Box>
            </Stack>
          </Link>
        </Stack>

        {/* ── Spacer ────────────────────────────────────────────────────── */}
        <Box sx={{ flex: 1 }} />

        {/* ── Right: actions + store pill ───────────────────────────────── */}
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <NotificationBell />
          <ThemeSwitcher />

          {storeName && (
            <>
              <Divider
                orientation="vertical"
                flexItem
                sx={{ mx: 0.5, my: 1, borderColor: 'divider' }}
              />
              <Link href="/profile" style={{ textDecoration: 'none' }}>
                <Tooltip title="Store profile" enterDelay={600} placement="bottom-end">
                  <Box
                    component="div"
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1,
                      pl: 0.75, pr: 1.25, py: 0.5,
                      borderRadius: '50px',
                      border: '1px solid', borderColor: 'divider',
                      bgcolor: 'background.paper',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s, background-color 0.15s, box-shadow 0.15s',
                      '&:hover': {
                        borderColor: 'text.disabled',
                        bgcolor: 'action.hover',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      },
                    }}
                  >
                    {/* Avatar with online dot */}
                    <Box sx={{ position: 'relative', flexShrink: 0 }}>
                      <Avatar
                        src={storeAvatar || undefined}
                        alt={storeName}
                        sx={{
                          width: 27, height: 27, fontSize: 12, fontWeight: 700,
                          bgcolor: 'primary.main', color: 'primary.contrastText',
                        }}
                      >
                        {!storeAvatar ? storeName[0].toUpperCase() : null}
                      </Avatar>
                      <Box sx={{
                        position: 'absolute', bottom: 0, right: -1,
                        width: 8, height: 8, borderRadius: '50%',
                        bgcolor: '#22c55e', border: '1.5px solid', borderColor: 'background.paper',
                      }} />
                    </Box>

                    {/* Store name — hidden on xs */}
                    <Typography
                      sx={{
                        fontSize: 13, fontWeight: 600, color: 'text.primary',
                        maxWidth: { xs: 0, sm: 140 }, overflow: 'hidden',
                        textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        display: { xs: 'none', sm: 'block' },
                      }}
                    >
                      {storeName}
                    </Typography>

                    <KeyboardArrowDownRoundedIcon
                      sx={{ fontSize: 16, color: 'text.disabled', display: { xs: 'none', sm: 'block' } }}
                    />
                  </Box>
                </Tooltip>
              </Link>
            </>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
