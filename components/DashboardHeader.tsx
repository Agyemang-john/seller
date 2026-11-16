import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiAppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuRoundedIcon     from '@mui/icons-material/MenuRounded';
import MenuOpenRoundedIcon from '@mui/icons-material/MenuOpenRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import StoreRoundedIcon from '@mui/icons-material/StoreRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import CardMembershipRoundedIcon from '@mui/icons-material/CardMembershipRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import Link from 'next/link';
import ThemeSwitcher from './ThemeSwitcher';
import NotificationBell from './NotificationBell';
import SellerSearch from './SellerSearch';
import useVendorAccess, { CAP } from '@/hooks/useVendorAccess';

// ── AppBar ────────────────────────────────────────────────────────────────────
const AppBar = styled(MuiAppBar)(({ theme }) => ({
  borderWidth: 0,
  borderBottomWidth: 1,
  borderStyle: 'solid',
  borderColor: (theme.vars ?? theme).palette.divider,
  boxShadow: 'none',
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
  /** Public storefront link, when the store has one. */
  storeUrl?: string;
}

// ── Store menu ────────────────────────────────────────────────────────────────
function StoreMenu({ storeName, storeAvatar, storeUrl }: { storeName: string; storeAvatar?: string; storeUrl?: string }) {
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
  const { can, role } = useVendorAccess();
  const close = () => setAnchor(null);

  const items = [
    { href: '/profile',   label: 'Store profile', icon: <StoreRoundedIcon fontSize="small" />,          show: can(CAP.MANAGE_STORE) },
    { href: '/team',      label: 'Team',          icon: <BadgeRoundedIcon fontSize="small" />,          show: true },
    { href: '/subscribe', label: 'Plan',          icon: <CardMembershipRoundedIcon fontSize="small" />, show: can(CAP.VIEW_FINANCE) },
    { href: '/settings',  label: 'Settings',      icon: <SettingsRoundedIcon fontSize="small" />,       show: true },
  ].filter((i) => i.show);

  return (
    <>
      <Box
        component="button"
        type="button"
        onClick={(e: React.MouseEvent<HTMLElement>) => setAnchor(e.currentTarget)}
        aria-haspopup="menu"
        aria-expanded={!!anchor}
        aria-label={`Store menu for ${storeName}`}
        sx={{
          display: 'flex', alignItems: 'center', gap: 1,
          pl: 0.5, pr: { xs: 0.5, sm: 1.25 }, py: 0.5,
          borderRadius: '50px', border: '1px solid', borderColor: 'divider',
          bgcolor: 'background.paper', color: 'inherit', font: 'inherit', cursor: 'pointer',
          transition: 'border-color 0.15s, background-color 0.15s',
          '&:hover': { borderColor: 'text.disabled', bgcolor: 'action.hover' },
        }}
      >
        <Avatar src={storeAvatar || undefined} alt={storeName}
                sx={{ width: 28, height: 28, fontSize: 12, fontWeight: 700, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          {!storeAvatar ? storeName[0].toUpperCase() : null}
        </Avatar>
        <Typography sx={{ fontSize: 13, fontWeight: 600, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: { xs: 'none', md: 'block' } }}>
          {storeName}
        </Typography>
        <KeyboardArrowDownRoundedIcon sx={{ fontSize: 16, color: 'text.disabled', display: { xs: 'none', sm: 'block' } }} />
      </Box>

      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { mt: 1, minWidth: 240, borderRadius: '14px', border: '1px solid', borderColor: 'divider', boxShadow: '0 16px 40px rgba(0,0,0,0.14)' } } }}
      >
        <Box sx={{ px: 2, py: 1.25, display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Avatar src={storeAvatar || undefined} alt={storeName} sx={{ width: 36, height: 36, fontWeight: 700, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            {!storeAvatar ? storeName[0].toUpperCase() : null}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{storeName}</Typography>
            {role && <Typography sx={{ fontSize: 12, color: 'text.secondary', textTransform: 'capitalize' }}>{role}</Typography>}
          </Box>
        </Box>
        <Divider />
        {items.map((i) => (
          <MenuItem key={i.href} component={Link} href={i.href} onClick={close} sx={{ fontSize: 14, py: 1 }}>
            <ListItemIcon>{i.icon}</ListItemIcon>
            {i.label}
          </MenuItem>
        ))}
        {storeUrl && (
          <MenuItem component="a" href={storeUrl} target="_blank" rel="noopener" onClick={close} sx={{ fontSize: 14, py: 1 }}>
            <ListItemIcon><OpenInNewRoundedIcon fontSize="small" /></ListItemIcon>
            View my storefront
          </MenuItem>
        )}
        <Divider />
        <MenuItem component={Link} href="/logout" onClick={close} sx={{ fontSize: 14, py: 1, color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'inherit' }}><LogoutRoundedIcon fontSize="small" /></ListItemIcon>
          Log out
        </MenuItem>
      </Menu>
    </>
  );
}

export default function DashboardHeader({
  logo,
  title,
  menuOpen,
  onToggleMenu,
  storeName,
  storeAvatar,
  storeUrl,
}: DashboardHeaderProps) {
  const handleMenuOpen = React.useCallback(() => {
    onToggleMenu(!menuOpen);
  }, [menuOpen, onToggleMenu]);

  return (
    <AppBar color="inherit" position="absolute" sx={{ displayPrint: 'none' }}>
      <Toolbar sx={{ minHeight: { xs: 56, sm: 60 }, px: { xs: 1.5, sm: 2 }, gap: 1 }}>
        {/* ── Left: menu toggle + brand ──────────────────────────────────── */}
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0 }}>
          <Tooltip title={menuOpen ? 'Collapse menu' : 'Expand menu'} enterDelay={800} placement="bottom">
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              aria-label={menuOpen ? 'Collapse navigation' : 'Expand navigation'}
              sx={{
                borderRadius: '10px', width: 36, height: 36, color: 'text.secondary',
                '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
              }}
            >
              {menuOpen ? <MenuOpenRoundedIcon sx={{ fontSize: 20 }} /> : <MenuRoundedIcon sx={{ fontSize: 20 }} />}
            </IconButton>
          </Tooltip>

          <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              {logo && (
                <Box sx={{ height: 36, display: 'flex', alignItems: 'center', '& img': { maxHeight: 36 } }}>
                  {logo}
                </Box>
              )}
              <Box sx={{ display: { xs: 'none', lg: 'flex' }, flexDirection: 'column', lineHeight: 1 }}>
                {title && (
                  <Typography sx={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.5px', color: 'text.primary', lineHeight: 1.1 }}>
                    {title}
                  </Typography>
                )}
                <Typography sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', color: 'text.secondary', textTransform: 'uppercase' }}>
                  Seller Center
                </Typography>
              </Box>
            </Stack>
          </Link>
        </Stack>

        {/* ── Middle: search (icon only on phones) ──────────────────────── */}
        <Box sx={{ flex: 1, display: 'flex', justifyContent: { xs: 'flex-end', sm: 'center' }, minWidth: 0 }}>
          <SellerSearch />
        </Box>

        {/* ── Right: actions + store menu ───────────────────────────────── */}
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0 }}>
          <Tooltip title="Help & guides" enterDelay={600}>
            <IconButton size="small" component={Link} href="/help" aria-label="Help" sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'inline-flex' } }}>
              <HelpOutlineRoundedIcon />
            </IconButton>
          </Tooltip>
          <NotificationBell />
          <ThemeSwitcher />

          {storeName && (
            <>
              <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 1.25, display: { xs: 'none', sm: 'block' } }} />
              <StoreMenu storeName={storeName} storeAvatar={storeAvatar} storeUrl={storeUrl} />
            </>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
