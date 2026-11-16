/**
 * The seller dashboard's navigation, in one place.
 *
 * The sidebar, the header search ("Search Seller Center") and the store menu
 * all read from here, so a new page only has to be added once. Grouping mirrors
 * how sellers think about their work (Walmart Seller Center style): orders,
 * catalog, customers, marketing, money, store set-up, help.
 */
import * as React from 'react';
import HomeRoundedIcon              from '@mui/icons-material/HomeRounded';
import LocalShippingRoundedIcon     from '@mui/icons-material/LocalShippingRounded';
import Inventory2RoundedIcon        from '@mui/icons-material/Inventory2Rounded';
import ForumRoundedIcon             from '@mui/icons-material/ForumRounded';
import CampaignRoundedIcon          from '@mui/icons-material/CampaignRounded';
import InsightsRoundedIcon          from '@mui/icons-material/InsightsRounded';
import PaymentsRoundedIcon          from '@mui/icons-material/PaymentsRounded';
import StoreRoundedIcon             from '@mui/icons-material/StoreRounded';
import HelpOutlineRoundedIcon       from '@mui/icons-material/HelpOutlineRounded';
import { CAP } from '@/hooks/useVendorAccess';

export interface NavLink {
  id: string;
  text: string;
  path: string;
  /** Hidden unless the member's team role grants this (see hooks/useVendorAccess). */
  capability?: string;
  /** Extra words the header search should match (e.g. "payout" for Earnings). */
  keywords?: string;
  /** Shown in search results only, not in the sidebar (actions like "Add product"). */
  searchOnly?: boolean;
}

export interface NavGroup {
  id: string;
  text: string;
  icon: React.ReactElement<{ sx?: object }>;
  /** A group with one page and no children renders as a plain link. */
  path?: string;
  capability?: string;
  children?: NavLink[];
}

export const NAV_GROUPS: NavGroup[] = [
  { id: 'home', text: 'Home', icon: <HomeRoundedIcon />, path: '/dashboard', capability: CAP.VIEW_ANALYTICS },
  {
    id: 'orders', text: 'Orders', icon: <LocalShippingRoundedIcon />,
    children: [
      { id: 'orders',          text: 'All orders',      path: '/orders',          capability: CAP.MANAGE_ORDERS, keywords: 'ship fulfil fulfill pending' },
      { id: 'to-ship',         text: 'Orders to ship',  path: '/orders?filter=to_ship', capability: CAP.MANAGE_ORDERS, searchOnly: true, keywords: 'ship queue' },
      { id: 'imported-orders', text: 'Imported orders', path: '/imported-orders', capability: CAP.MANAGE_ORDERS, keywords: 'abroad sourcing made to order' },
      { id: 'order-returns',   text: 'Returns',         path: '/order-returns',   capability: CAP.MANAGE_ORDERS, keywords: 'refund' },
      { id: 'claims',          text: 'Claims',          path: '/claims',          capability: CAP.MANAGE_ORDERS, keywords: 'dispute' },
    ],
  },
  {
    id: 'catalog', text: 'Catalog', icon: <Inventory2RoundedIcon />,
    children: [
      { id: 'products',      text: 'Products',           path: '/products',             capability: CAP.MANAGE_CATALOG, keywords: 'items listings inventory stock' },
      { id: 'add-product',   text: 'Add a product',      path: '/products/product',     capability: CAP.MANAGE_CATALOG, searchOnly: true, keywords: 'new listing create item' },
      { id: 'sell-existing', text: 'Sell an existing item', path: '/products/sell-existing', capability: CAP.MANAGE_CATALOG, keywords: 'offer catalog match' },
      { id: 'bulk-upload',   text: 'Bulk upload',        path: '/products/bulk-upload', capability: CAP.MANAGE_CATALOG, keywords: 'csv spreadsheet import' },
      { id: 'low-stock',     text: 'Low-stock products', path: '/products?stock=low',   capability: CAP.MANAGE_CATALOG, searchOnly: true, keywords: 'inventory out of stock' },
    ],
  },
  {
    id: 'customers', text: 'Customers', icon: <ForumRoundedIcon />,
    children: [
      { id: 'messages',  text: 'Messages',  path: '/messages',  capability: CAP.MANAGE_MESSAGES, keywords: 'chat inbox' },
      { id: 'reviews',   text: 'Reviews',   path: '/reviews',   capability: CAP.MANAGE_CATALOG, keywords: 'ratings feedback' },
      { id: 'questions', text: 'Questions', path: '/questions', capability: CAP.MANAGE_CATALOG, keywords: 'q&a answers' },
    ],
  },
  {
    id: 'marketing', text: 'Marketing', icon: <CampaignRoundedIcon />,
    children: [
      { id: 'ads',         text: 'Sponsored ads', path: '/ads',         capability: CAP.MANAGE_CATALOG, keywords: 'advertising campaign promote boost' },
      { id: 'flash-sales', text: 'Flash sales',   path: '/flash-sales', capability: CAP.MANAGE_CATALOG, keywords: 'deal discount promotion' },
      { id: 'coupons',     text: 'Coupons',       path: '/coupons',     capability: CAP.MANAGE_CATALOG, keywords: 'discount code promotion voucher' },
    ],
  },
  {
    id: 'analytics', text: 'Analytics', icon: <InsightsRoundedIcon />,
    children: [
      { id: 'dashboard-perf',  text: 'Sales & performance', path: '/dashboard#performance', capability: CAP.VIEW_ANALYTICS, searchOnly: true, keywords: 'revenue report' },
      { id: 'store-analytics', text: 'Store traffic',       path: '/store-analytics',       capability: CAP.VIEW_ANALYTICS, keywords: 'visitors views report devices' },
    ],
  },
  {
    id: 'payments', text: 'Payments', icon: <PaymentsRoundedIcon />,
    children: [
      { id: 'payouts',   text: 'Earnings & payouts', path: '/payouts',   capability: CAP.VIEW_FINANCE, keywords: 'balance withdraw money statement' },
      { id: 'payment',   text: 'Payout method',      path: '/payment',   capability: CAP.VIEW_FINANCE, keywords: 'bank mobile money momo account' },
      { id: 'subscribe', text: 'Plans',              path: '/subscribe', capability: CAP.VIEW_FINANCE, keywords: 'subscription upgrade pro enterprise' },
      { id: 'billing',   text: 'Billing',            path: '/billing',   capability: CAP.VIEW_FINANCE, keywords: 'invoices cards receipts' },
    ],
  },
  {
    id: 'store', text: 'Store', icon: <StoreRoundedIcon />,
    children: [
      { id: 'profile',       text: 'Store profile', path: '/profile',       capability: CAP.MANAGE_STORE, keywords: 'logo banner name address' },
      { id: 'working-hours', text: 'Working hours', path: '/working-hours', capability: CAP.MANAGE_STORE, keywords: 'opening schedule holiday' },
      { id: 'team',          text: 'Team',          path: '/team',          keywords: 'staff members invite roles' },
      { id: 'settings',      text: 'Settings',      path: '/settings',      keywords: 'security password pause shop notifications devices' },
    ],
  },
  {
    id: 'help', text: 'Help', icon: <HelpOutlineRoundedIcon />,
    children: [
      { id: 'help',    text: 'Help & guides', path: '/help',    keywords: 'support faq how to' },
      { id: 'connect', text: 'Community',     path: '/connect', keywords: 'forum sellers' },
      { id: 'about',   text: 'About',         path: '/about' },
    ],
  },
];

/** Path without query/hash, for matching against usePathname(). */
export const basePath = (path: string) => path.split(/[?#]/)[0];

/** Does this nav path own the current page? */
export function isPathActive(path: string, pathname: string) {
  const base = basePath(path);
  if (base === '/dashboard') return pathname === '/dashboard';
  return pathname === base || pathname.startsWith(`${base}/`);
}

/**
 * The single link that best matches the current page. Longest match wins so
 * /products/bulk-upload lights "Bulk upload", not "Products".
 */
export function activeLinkId(pathname: string, links: NavLink[]) {
  let best: NavLink | undefined;
  for (const l of links) {
    if (l.searchOnly || !isPathActive(l.path, pathname)) continue;
    if (!best || basePath(l.path).length > basePath(best.path).length) best = l;
  }
  return best?.id;
}

/** Every reachable page as a flat list (for search). */
export function flattenNav(groups: NavGroup[]) {
  const out: (NavLink & { group: string })[] = [];
  for (const g of groups) {
    if (g.path) out.push({ id: g.id, text: g.text, path: g.path, capability: g.capability, group: g.text });
    for (const c of g.children ?? []) out.push({ ...c, group: g.text });
  }
  return out;
}
