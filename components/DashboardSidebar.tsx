"use client";

import * as React from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';
import Badge from '@mui/material/Badge';
import Collapse from '@mui/material/Collapse';
import Popover from '@mui/material/Popover';
import type {} from '@mui/material/themeCssVarsAugmentation';

import LogoutRoundedIcon         from '@mui/icons-material/LogoutRounded';
import LocationOnRoundedIcon     from '@mui/icons-material/LocationOnRounded';
import VerifiedRoundedIcon       from '@mui/icons-material/VerifiedRounded';
import ExpandMoreRoundedIcon     from '@mui/icons-material/ExpandMoreRounded';
import AddRoundedIcon            from '@mui/icons-material/AddRounded';
import useVendorAccess, { CAP } from '@/hooks/useVendorAccess';
import useNavCounts from '@/hooks/useNavCounts';
import { NAV_GROUPS, activeLinkId, isPathActive, type NavGroup, type NavLink } from '@/components/navConfig';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import DashboardSidebarContext from '@/context/DashboardSidebarContext';
import { DRAWER_WIDTH, MINI_DRAWER_WIDTH, MOBILE_NAV_HEIGHT } from '../constants';
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

const OPEN_GROUPS_KEY = 'seller.navOpenGroups';

// ── Small pieces ──────────────────────────────────────────────────────────────
function CountPill({ n }: { n: number }) {
  if (!n) return null;
  return (
    <Box
      component="span"
      aria-label={`${n} waiting`}
      sx={{
        ml: 1, minWidth: 20, height: 20, px: 0.75, borderRadius: 10, flexShrink: 0,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        bgcolor: 'error.main', color: 'error.contrastText', fontSize: 11.5, fontWeight: 700, lineHeight: 1,
      }}
    >
      {n > 99 ? '99+' : n}
    </Box>
  );
}

function UpgradeTag({ text }: { text: string }) {
  return (
    <Box
      component="span"
      sx={{
        ml: 1, px: 0.75, py: 0.25, borderRadius: 1, flexShrink: 0, fontSize: 10.5, fontWeight: 700,
        letterSpacing: '0.02em', textTransform: 'uppercase', lineHeight: 1.4,
        color: 'warning.main', border: 1, borderColor: 'warning.main',
      }}
    >
      {text}
    </Box>
  );
}

const rowSx = {
  borderRadius: '10px',
  transition: 'background-color 0.15s, color 0.15s',
  '&.Mui-selected': {
    bgcolor: (t: Theme) => alpha(t.palette.primary.main, 0.1),
    color: 'primary.main',
    '&:hover': { bgcolor: (t: Theme) => alpha(t.palette.primary.main, 0.16) },
  },
  '&:not(.Mui-selected):hover': { bgcolor: 'action.hover', color: 'text.primary' },
};

// ── Child link (inside an expanded group) ─────────────────────────────────────
function ChildRow({ link, active, badge, tag, onClick }: {
  link: NavLink; active: boolean; badge: number; tag?: string; onClick: () => void;
}) {
  return (
    <ListItemButton
      component={Link}
      href={link.path}
      selected={active}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      sx={{
        ...rowSx,
        position: 'relative',
        height: { xs: 40, sm: 34 },
        pl: '44px', pr: 1.25, mb: 0.25,
        color: active ? 'primary.main' : 'text.secondary',
        // Thin rail that ties a group's links together; the active one lights up.
        '&::before': {
          content: '""', position: 'absolute', left: 21, top: 0, bottom: 0, width: '2px',
          bgcolor: active ? 'primary.main' : 'divider', borderRadius: 1,
        },
      }}
    >
      <Typography sx={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: active ? 700 : 500, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {link.text}
      </Typography>
      <CountPill n={badge} />
      {!badge && tag ? <UpgradeTag text={tag} /> : null}
    </ListItemButton>
  );
}

// ── Group header (expanded sidebar) ───────────────────────────────────────────
function GroupRow({ group, open, active, badge, onToggle, onNavigate }: {
  group: NavGroup; open: boolean; active: boolean; badge: number;
  onToggle: () => void; onNavigate: () => void;
}) {
  const isLink = !!group.path;
  const linkProps = isLink ? { component: Link, href: group.path, onClick: onNavigate } : { onClick: onToggle };
  return (
    <ListItemButton
      {...(linkProps as object)}
      selected={isLink && active}
      aria-expanded={isLink ? undefined : open}
      sx={{
        ...rowSx,
        height: { xs: 44, sm: 40 }, px: 1.25, mb: 0.25,
        color: active ? (isLink ? 'primary.main' : 'text.primary') : 'text.secondary',
      }}
    >
      <Box sx={{ width: 34, display: 'flex', alignItems: 'center', color: active ? 'primary.main' : 'inherit', flexShrink: 0 }}>
        {React.cloneElement(group.icon, { sx: { fontSize: 20 } })}
      </Box>
      <Typography sx={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: active ? 700 : 600, letterSpacing: '-0.01em', color: active ? 'text.primary' : 'inherit', ...(isLink && active ? { color: 'primary.main' } : {}) }}>
        {group.text}
      </Typography>
      {/* A closed group still tells you something inside needs you. */}
      {!isLink && !open && <CountPill n={badge} />}
      {!isLink && (
        <ExpandMoreRoundedIcon sx={{ fontSize: 18, ml: 0.5, color: 'text.disabled', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      )}
    </ListItemButton>
  );
}

// ── Group in the collapsed rail: icon + flyout menu ───────────────────────────
function MiniGroup({ group, links, active, badge, badges, tags, pathname, onNavigate }: {
  group: NavGroup; links: NavLink[]; active: boolean; badge: number;
  badges: Record<string, number>; tags: Record<string, string>; pathname: string; onNavigate: () => void;
}) {
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
  const activeId = activeLinkId(pathname, links);
  const isLink = !!group.path;
  const close = () => setAnchor(null);

  const button = (
    <ListItemButton
      {...((isLink
        ? { component: Link, href: group.path, onClick: onNavigate }
        : { onClick: (e: React.MouseEvent<HTMLElement>) => setAnchor(e.currentTarget) }) as object)}
      selected={active}
      aria-haspopup={isLink ? undefined : 'menu'}
      sx={{
        ...rowSx,
        flexDirection: 'column', justifyContent: 'center', gap: 0.25,
        height: 56, px: 0.5, mb: 0.5,
        color: active ? 'primary.main' : 'text.secondary',
      }}
    >
      <Badge badgeContent={badge} color="error" max={99}
             sx={{ '& .MuiBadge-badge': { fontSize: 10, height: 16, minWidth: 16, px: 0.5 } }}>
        {React.cloneElement(group.icon, { sx: { fontSize: 22 } })}
      </Badge>
      <Typography sx={{ fontSize: 10.5, fontWeight: active ? 700 : 600, lineHeight: 1.1 }}>{group.text}</Typography>
    </ListItemButton>
  );

  return (
    <>
      {isLink ? <Tooltip title={group.text} placement="right" arrow>{button}</Tooltip> : button}
      {!isLink && (
        <Popover
          open={!!anchor}
          anchorEl={anchor}
          onClose={close}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          slotProps={{ paper: { sx: { ml: 1, minWidth: 220, borderRadius: '12px', p: 0.75, border: '1px solid', borderColor: 'divider', boxShadow: '0 12px 32px rgba(0,0,0,0.12)' } } }}
        >
          <Typography sx={{ px: 1.25, pt: 0.75, pb: 0.5, fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.disabled' }}>
            {group.text}
          </Typography>
          <List dense disablePadding role="menu">
            {links.map((l) => (
              <ListItemButton
                key={l.id}
                component={Link}
                href={l.path}
                role="menuitem"
                selected={l.id === activeId}
                onClick={() => { close(); onNavigate(); }}
                sx={{ ...rowSx, height: 36, px: 1.25 }}
              >
                <Typography sx={{ flex: 1, fontSize: 13.5, fontWeight: l.id === activeId ? 700 : 500 }}>{l.text}</Typography>
                <CountPill n={badges[l.id] ?? 0} />
                {!badges[l.id] && tags[l.id] ? <UpgradeTag text={tags[l.id]} /> : null}
              </ListItemButton>
            ))}
          </List>
        </Popover>
      )}
    </>
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

function StoreAvatar({ name, src, size }: { name?: string; src?: string; size: number }) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
      <Avatar
        src={src || undefined}
        alt={name}
        sx={{
          width: size, height: size, fontSize: size * 0.4, fontWeight: 700,
          bgcolor: 'primary.main', color: 'primary.contrastText',
          border: '2px solid', borderColor: (t: Theme) => alpha(t.palette.primary.main, 0.25),
        }}
      >
        {!src && name ? name[0].toUpperCase() : null}
      </Avatar>
      <Box sx={{
        position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: '50%',
        bgcolor: 'success.main', border: '2px solid', borderColor: 'background.paper',
      }} />
    </Box>
  );
}

function StoreCard({ mini, storeName, storeAddress, storeAvatar, storeLoading }: StoreCardProps) {
  if (mini) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 1.5, px: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
        {storeLoading ? (
          <Skeleton variant="circular" width={38} height={38} />
        ) : (
          <Tooltip title={storeName || 'Your store'} placement="right" arrow>
            <Link href="/profile" style={{ textDecoration: 'none' }}>
              <StoreAvatar name={storeName} src={storeAvatar} size={38} />
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
          <Skeleton variant="circular" width={42} height={42} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="rounded" width="65%" height={15} sx={{ mb: 0.75, borderRadius: '4px' }} />
            <Skeleton variant="rounded" width="45%" height={12} sx={{ borderRadius: '4px' }} />
          </Box>
        </Box>
      ) : storeName ? (
        <Link href="/profile" style={{ textDecoration: 'none' }}>
          <Box sx={{ px: 1.5, py: 1.25, mx: 0.75, my: 0.75, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 1.25, '&:hover': { bgcolor: 'action.hover' } }}>
            <StoreAvatar name={storeName} src={storeAvatar} size={40} />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.2 }}>
                <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: 'text.primary', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                <Typography sx={{ fontSize: 11, color: 'success.main', fontWeight: 600 }}>Active</Typography>
              )}
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

  // Team members only see sections their role can use. The API enforces the
  // same rules, so this is purely to avoid dead ends in the nav.
  const { can, capabilities } = useVendorAccess();
  const visibleGroups = React.useMemo(
    () => NAV_GROUPS
      .map((g) => ({ ...g, children: g.children?.filter((c) => !c.searchOnly && (!c.capability || can(c.capability))) }))
      .filter((g) => (g.path ? !g.capability || can(g.capability) : (g.children?.length ?? 0) > 0)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [capabilities],
  );
  const { badges, tags } = useNavCounts();

  // Which groups are open: remembered per browser, and the group holding the
  // current page is always opened so the seller can see where they are.
  const [openGroups, setOpenGroups] = React.useState<string[]>([]);
  React.useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(OPEN_GROUPS_KEY) || 'null');
      if (Array.isArray(saved)) setOpenGroups(saved);
      else setOpenGroups(['orders', 'catalog']); // first visit: the day-to-day work
    } catch { setOpenGroups(['orders', 'catalog']); }
  }, []);
  const activeGroupId = React.useMemo(
    () => visibleGroups.find((g) => (g.path ? isPathActive(g.path, pathname) : g.children?.some((c) => isPathActive(c.path, pathname))))?.id,
    [visibleGroups, pathname],
  );
  React.useEffect(() => {
    if (activeGroupId) setOpenGroups((prev) => (prev.includes(activeGroupId) ? prev : [...prev, activeGroupId]));
  }, [activeGroupId]);
  const toggleGroup = React.useCallback((id: string) => {
    setOpenGroups((prev) => {
      const next = prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id];
      try { localStorage.setItem(OPEN_GROUPS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const canAddProduct = can(CAP.MANAGE_CATALOG);

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
        <Toolbar sx={{ flexShrink: 0, minHeight: { xs: 56, sm: 60 } }} />

        <StoreCard mini={mini} storeName={storeName} storeAddress={storeAddress} storeAvatar={storeAvatar} storeLoading={storeLoading} />

        {/* The most common job gets a real button, like Seller Center's "Add items". */}
        {canAddProduct && (
          <Box sx={{ px: mini ? 1 : 1.5, pt: 1.25, pb: 0.5 }}>
            <Tooltip title={mini ? 'Add a product' : ''} placement="right" arrow>
              <ListItemButton
                component={Link}
                href="/products/product"
                onClick={handlePageItemClick}
                sx={{
                  height: 40, borderRadius: '10px', justifyContent: 'center', gap: 0.75,
                  bgcolor: 'primary.main', color: 'primary.contrastText',
                  '&:hover': { bgcolor: 'primary.dark' },
                }}
              >
                <AddRoundedIcon sx={{ fontSize: 20 }} />
                {!mini && <Typography sx={{ fontSize: 13.5, fontWeight: 700 }}>Add a product</Typography>}
              </ListItemButton>
            </Tooltip>
          </Box>
        )}

        {/* Scrollable nav area */}
        <Box
          sx={{
            flex: 1, overflowY: 'auto', overflowX: 'hidden',
            px: 0.75, pt: 0.75, pb: 1,
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': { width: 4 },
            '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
            '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: '4px' },
          }}
        >
          <List dense disablePadding>
            {visibleGroups.map((g) => {
              const links = g.children ?? [];
              const groupBadge = links.reduce((n, l) => n + (badges[l.id] ?? 0), 0);
              const active = g.id === activeGroupId;
              if (mini) {
                return (
                  <MiniGroup key={g.id} group={g} links={links} active={active} badge={groupBadge}
                             badges={badges} tags={tags} pathname={pathname} onNavigate={handlePageItemClick} />
                );
              }
              const open = openGroups.includes(g.id);
              const activeId = active ? activeLinkId(pathname, links) : undefined;
              return (
                <Box key={g.id}>
                  <GroupRow group={g} open={open} active={active} badge={groupBadge}
                            onToggle={() => toggleGroup(g.id)} onNavigate={handlePageItemClick} />
                  {links.length > 0 && (
                    <Collapse in={open} timeout={180} unmountOnExit>
                      <List dense disablePadding sx={{ pb: 0.5 }}>
                        {links.map((l) => (
                          <ChildRow key={l.id} link={l} active={l.id === activeId} badge={badges[l.id] ?? 0}
                                    tag={tags[l.id]} onClick={handlePageItemClick} />
                        ))}
                      </List>
                    </Collapse>
                  )}
                </Box>
              );
            })}
          </List>
        </Box>

        {/* Pinned bottom: log out */}
        <Box
          sx={{
            flexShrink: 0, px: 0.75, pt: 0.5, borderTop: '1px solid', borderColor: 'divider',
            // On phones the bottom bar sits over the drawer; keep Log out reachable.
            pb: viewport === 'phone' ? `calc(${MOBILE_NAV_HEIGHT}px + env(safe-area-inset-bottom) + 6px)` : 0.75,
          }}
        >
          <Tooltip title={mini ? 'Log out' : ''} placement="right" arrow>
            <ListItemButton
              component={Link}
              href="/logout"
              onClick={handlePageItemClick}
              sx={{
                height: 40, borderRadius: '10px', px: mini ? 0 : 1.25, justifyContent: mini ? 'center' : 'flex-start',
                color: 'text.secondary',
                '&:hover': { bgcolor: (t: Theme) => alpha(t.palette.error.main, 0.07), color: 'error.main' },
              }}
            >
              <LogoutRoundedIcon sx={{ fontSize: 20, mr: mini ? 0 : 1.75 }} />
              {!mini && <Typography sx={{ fontSize: 13.5, fontWeight: 500 }}>Log out</Typography>}
            </ListItemButton>
          </Tooltip>
        </Box>
      </Box>
    ),
    [
      mini, hasDrawerTransitions, isFullyExpanded, pathname,
      storeName, storeAddress, storeAvatar, storeLoading, handlePageItemClick,
      visibleGroups, badges, tags, openGroups, activeGroupId, toggleGroup, canAddProduct,
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
