"use client";

/**
 * "Search Seller Center" in the header.
 *
 * Type a page name (or what it's for: "payout", "discount", "staff") to jump
 * straight there, or search your orders / products for the text. Ctrl/⌘+K or
 * "/" focuses it from anywhere. On phones it opens as a full-screen sheet.
 */
import * as React from 'react';
import { alpha } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import useMediaQuery from '@mui/material/useMediaQuery';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import NorthEastRoundedIcon from '@mui/icons-material/NorthEastRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import { useRouter } from 'next/navigation';
import useVendorAccess, { CAP } from '@/hooks/useVendorAccess';
import { NAV_GROUPS, flattenNav } from '@/components/navConfig';

interface Result {
  key: string;
  label: string;
  hint: string;
  href: string;
  icon: React.ReactNode;
}

const ALL_PAGES = flattenNav(NAV_GROUPS);
// Shown before the seller types anything.
const SUGGESTED = ['to-ship', 'add-product', 'payouts', 'messages', 'coupons', 'low-stock'];

function score(text: string, q: string) {
  const t = text.toLowerCase();
  if (t.startsWith(q)) return 3;
  if (t.split(/\s+/).some((w) => w.startsWith(q))) return 2;
  return t.includes(q) ? 1 : 0;
}

function useResults(query: string): Result[] {
  const { can } = useVendorAccess();
  return React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const pages = ALL_PAGES.filter((p) => !p.capability || can(p.capability));

    const pageResult = (p: (typeof pages)[number]): Result => ({
      key: `page-${p.id}`, label: p.text, hint: p.group, href: p.path,
      icon: <NorthEastRoundedIcon sx={{ fontSize: 16 }} />,
    });

    if (!q) {
      return SUGGESTED.map((id) => pages.find((p) => p.id === id)).filter(Boolean).map((p) => pageResult(p!));
    }

    const out: Result[] = [];
    // Order numbers and product names are the two things sellers look up most.
    if (can(CAP.MANAGE_ORDERS)) {
      out.push({ key: 'orders', label: `Search orders for “${query.trim()}”`, hint: 'Order number or buyer email', href: `/orders?search=${encodeURIComponent(query.trim())}`, icon: <ReceiptLongRoundedIcon sx={{ fontSize: 16 }} /> });
    }
    if (can(CAP.MANAGE_CATALOG)) {
      out.push({ key: 'products', label: `Search products for “${query.trim()}”`, hint: 'Name or SKU', href: `/products?search=${encodeURIComponent(query.trim())}`, icon: <Inventory2RoundedIcon sx={{ fontSize: 16 }} /> });
    }
    const matched = pages
      .map((p) => ({ p, s: Math.max(score(p.text, q) * 2, score(p.group, q), p.keywords ? score(p.keywords, q) : 0) }))
      .filter((m) => m.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 6)
      .map((m) => pageResult(m.p));
    // A strong page match ("earn" → Earnings) is more likely what they meant.
    return matched.length && score(matched[0].label, q) >= 2 ? [...matched, ...out] : [...out, ...matched];
  }, [query, can]);
}

function ResultList({ results, active, query, onPick, onHover }: {
  results: Result[]; active: number; query: string; onPick: (r: Result) => void; onHover: (i: number) => void;
}) {
  return (
    <Box role="listbox" sx={{ py: 0.75 }}>
      {!query.trim() && (
        <Typography sx={{ px: 2, pt: 0.5, pb: 0.75, fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.disabled' }}>
          Shortcuts
        </Typography>
      )}
      {results.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 1.5 }}>No matching pages.</Typography>
      )}
      {results.map((r, i) => (
        <Box
          key={r.key}
          role="option"
          aria-selected={i === active}
          onMouseEnter={() => onHover(i)}
          onMouseDown={(e) => e.preventDefault()} // keep focus in the input
          onClick={() => onPick(r)}
          sx={{
            display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1, cursor: 'pointer',
            bgcolor: i === active ? 'action.hover' : 'transparent',
          }}
        >
          <Box sx={{ width: 28, height: 28, borderRadius: '8px', bgcolor: 'action.selected', color: 'text.secondary', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {r.icon}
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label}</Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{r.hint}</Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}

export default function SellerSearch() {
  const router = useRouter();
  const isPhone = useMediaQuery((t: Theme) => t.breakpoints.down('sm'));
  const [query, setQuery] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  // State (not a ref) so the dropdown re-renders once the box is mounted.
  const [anchorEl, setAnchorEl] = React.useState<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const results = useResults(query);

  React.useEffect(() => setActive(0), [query]);

  // Ctrl/⌘+K anywhere, or "/" when not already typing somewhere.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.closest?.('input, textarea, [contenteditable="true"]');
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault();
        setOpen(true);
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const close = () => { setOpen(false); inputRef.current?.blur(); };
  const pick = (r: Result) => {
    router.push(r.href);
    setQuery('');
    close();
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter' && results[active]) { e.preventDefault(); pick(results[active]); }
    else if (e.key === 'Escape') close();
  };

  const input = (autoFocus = false) => (
    <InputBase
      inputRef={inputRef}
      autoFocus={autoFocus}
      value={query}
      onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
      onFocus={() => setOpen(true)}
      onKeyDown={onKeyDown}
      placeholder="Search orders, products or pages"
      inputProps={{ 'aria-label': 'Search Seller Center', role: 'combobox', 'aria-expanded': open }}
      sx={{ flex: 1, fontSize: 14, '& input': { py: 0, fontSize: { xs: 16, sm: 14 } } }}
    />
  );

  if (isPhone) {
    return (
      <>
        <IconButton size="small" aria-label="Search" onClick={() => setOpen(true)} sx={{ color: 'text.secondary' }}>
          <SearchRoundedIcon />
        </IconButton>
        <Dialog fullScreen open={open} onClose={close}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, height: 56, borderBottom: '1px solid', borderColor: 'divider' }}>
            <IconButton aria-label="Close search" onClick={close}><ArrowBackRoundedIcon /></IconButton>
            {input(true)}
          </Box>
          <ResultList results={results} active={active} query={query} onPick={pick} onHover={setActive} />
        </Dialog>
      </>
    );
  }

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box sx={{ flex: 1, maxWidth: 560, mx: { sm: 2, md: 4 } }}>
        <Box
          ref={setAnchorEl}
          onClick={() => inputRef.current?.focus()}
          sx={{
            display: 'flex', alignItems: 'center', gap: 1, height: 40, px: 1.5,
            borderRadius: '20px', border: '1px solid', cursor: 'text',
            borderColor: open ? 'primary.main' : 'divider',
            bgcolor: open ? 'background.paper' : 'action.hover',
            boxShadow: open ? (t: Theme) => `0 0 0 3px ${alpha(t.palette.primary.main, 0.15)}` : 'none',
            transition: 'border-color 0.15s, box-shadow 0.15s, background-color 0.15s',
          }}
        >
          <SearchRoundedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
          {input()}
          {!open && (
            <Box component="kbd" sx={{ display: { xs: 'none', md: 'block' }, fontSize: 11, fontFamily: 'inherit', fontWeight: 600, color: 'text.disabled', border: '1px solid', borderColor: 'divider', borderRadius: '6px', px: 0.75, py: 0.1 }}>
              Ctrl K
            </Box>
          )}
        </Box>
        <Popper open={open} anchorEl={anchorEl} placement="bottom-start" sx={{ zIndex: (t) => t.zIndex.modal, width: anchorEl?.offsetWidth }}>
          <Paper sx={{ mt: 0.75, borderRadius: '14px', border: '1px solid', borderColor: 'divider', boxShadow: '0 16px 40px rgba(0,0,0,0.14)', overflow: 'hidden' }}>
            <ResultList results={results} active={active} query={query} onPick={pick} onHover={setActive} />
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
}
