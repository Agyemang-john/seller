'use client';

import React from 'react';
import {
  Box, Typography, Stack, Card, CardContent, Grid, Divider, Chip,
} from '@mui/material';
import Link from 'next/link';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import TrackChangesOutlinedIcon from '@mui/icons-material/TrackChangesOutlined';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PageContainer from '@/components/PageContainer';
import { alpha } from '@mui/material/styles';
import { brand, brandGradients } from '@/theme/designTokens';

// ── brand tokens (single source: theme/designTokens) ───────────────────────────
const navy  = brand.navy;
const blue  = brand.blue;
const gold  = brand.gold;
const light = 'action.hover';   // theme-aware surface  (sx palette path)
const mid   = 'text.secondary'; // theme-aware muted text (sx palette path)

// ── data ──────────────────────────────────────────────────────────────────────
const PILLARS = [
  {
    icon: <VerifiedUserOutlinedIcon sx={{ fontSize: 26, color: blue }} />,
    title: 'Safe, Verified Trade',
    body: 'Every seller goes through a verification process. Every transaction is mediated by our platform so buyers and sellers never have to risk direct exchange.',
  },
  {
    icon: <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 26, color: blue }} />,
    title: 'Secure Escrow Payments',
    body: 'Buyer funds are held in escrow until the order is confirmed delivered. Neither party touches the money until the deal is done — eliminating fraud on both sides.',
  },
  {
    icon: <LocalShippingOutlinedIcon sx={{ fontSize: 26, color: blue }} />,
    title: 'End-to-End Delivery Tracking',
    body: 'Real-time tracking from the moment an order is placed to the moment it lands at the buyer\'s door. Full transparency, zero guesswork.',
  },
  {
    icon: <BarChartOutlinedIcon sx={{ fontSize: 26, color: blue }} />,
    title: 'Seller Growth Tools',
    body: 'Analytics, product views, conversion data, and region-level insights help you understand what\'s working and where to scale next.',
  },
  {
    icon: <StarBorderOutlinedIcon sx={{ fontSize: 26, color: blue }} />,
    title: 'Transparent Ratings',
    body: 'Buyers leave verified reviews. Your reputation is your currency. High-rated sellers get more visibility — naturally, fairly.',
  },
  {
    icon: <HandshakeOutlinedIcon sx={{ fontSize: 26, color: blue }} />,
    title: 'Dispute Resolution',
    body: 'If something goes wrong, our team steps in. No party is left stranded. We mediate, investigate, and resolve — protecting buyers and sellers equally.',
  },
];

const SELLER_BENEFITS = [
  'Reach thousands of active buyers across multiple regions',
  'Manage your entire catalogue from one clean dashboard',
  'Get paid securely — funds released after delivery confirmation',
  'Real-time analytics on views, clicks, and conversions',
  'Flexible delivery options: set your own rates and regions',
  'Bulk upload tools for sellers with large catalogues',
  'Detailed order and payout history at your fingertips',
];

const BUYER_BENEFITS = [
  'Shop from verified, reviewed sellers with confidence',
  'Money held safely until your order arrives',
  'Full delivery tracking from dispatch to door',
  'Clear returns and refund process on every order',
  'Dispute protection if something goes wrong',
  'Wide range of products across many categories',
  'Secure checkout — no direct transfers, ever',
];

const STATS = [
  { number: '10K+',   label: 'Products listed',         note: 'Across dozens of categories' },
  { number: '5K+',   label: 'Active sellers',           note: 'And growing every month' },
  { number: '100%',  label: 'Escrow-secured payments',  note: 'Every single transaction' },
  { number: '24 h',  label: 'Seller support',           note: 'Mon – Fri, 8 am – 6 pm' },
];

// ── sub-components ────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.8, textTransform: 'uppercase', color: blue, mb: 1 }}>
      {children}
    </Typography>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────
export default function AboutPage() {
  return (
    <PageContainer
      title="About Negromart"
      breadcrumbs={[{ title: 'Home', path: '/dashboard' }, { title: 'About' }]}
    >
      <Box>

        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <Box
          sx={{
            background: brandGradients.hero,
            borderRadius: 3,
            px: { xs: 3, sm: 5, md: 7 },
            py: { xs: 5, sm: 6.5 },
            mb: 4,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* glow blobs */}
          <Box sx={{ position: 'absolute', top: -100, right: -60, width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,113,206,0.3) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <Box sx={{ position: 'absolute', bottom: -80, left: -60, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,194,32,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <Chip
            label="Built for trust"
            size="small"
            sx={{ bgcolor: 'rgba(255,194,32,0.18)', color: gold, fontWeight: 700, fontSize: 11, letterSpacing: 1, mb: 2.5, border: `1px solid rgba(255,194,32,0.35)` }}
          />

          <Typography
            variant="h4"
            fontWeight={300}
            color="common.white"
            sx={{ lineHeight: 1.2, mb: 2, letterSpacing: -0.5, maxWidth: 620, fontSize: { xs: '1.6rem', sm: '2rem', md: '2.4rem' } }}
          >
            Where sellers and buyers trade{' '}
            <Box component="span" sx={{ fontWeight: 700 }}>safely</Box>
            {' '}and{' '}
            <Box component="span" sx={{ fontWeight: 700 }}>securely</Box>.
          </Typography>

          <Typography
            variant="body1"
            sx={{ color: 'rgba(255,255,255,0.72)', maxWidth: 560, lineHeight: 1.75, mb: 4, fontSize: { xs: 14, sm: 15 } }}
          >
            Negromart is a marketplace platform that connects verified sellers with confident buyers through a system built entirely around trust — verified listings, escrow-protected payments, and transparent delivery from end to end.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Link href="/dashboard" style={{ textDecoration: 'none' }}>
              <Box
                component="span"
                sx={{
                  display: 'inline-flex', alignItems: 'center', gap: 1,
                  px: 3.5, py: 1.4,
                  bgcolor: blue, color: 'common.white',
                  borderRadius: 8, fontWeight: 700, fontSize: 14,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  '&:hover': { bgcolor: brand.blueDark },
                }}
              >
                Go to Dashboard <ArrowForwardIcon sx={{ fontSize: 16 }} />
              </Box>
            </Link>
            <Link href="/help" style={{ textDecoration: 'none' }}>
              <Box
                component="span"
                sx={{
                  display: 'inline-flex', alignItems: 'center', gap: 1,
                  px: 3.5, py: 1.4,
                  border: '1.5px solid rgba(255,255,255,0.35)', color: 'common.white',
                  borderRadius: 8, fontWeight: 600, fontSize: 14,
                  cursor: 'pointer',
                  transition: 'border-color 0.2s, background 0.2s',
                  '&:hover': { borderColor: 'common.white', bgcolor: 'rgba(255,255,255,0.08)' },
                }}
              >
                Help Centre
              </Box>
            </Link>
          </Stack>
        </Box>

        {/* ── Stats bar ──────────────────────────────────────────────────── */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {STATS.map(s => (
            <Grid size={{ xs: 6, sm: 3 }} key={s.label}>
              <Card variant="outlined" sx={{ borderRadius: 2.5, height: '100%' }}>
                <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
                  <Typography sx={{ fontSize: { xs: 28, sm: 34 }, fontWeight: 300, color: blue, letterSpacing: -1, lineHeight: 1 }}>
                    {s.number}
                  </Typography>
                  <Typography variant="body2" fontWeight={700} sx={{ mt: 0.5, mb: 0.25 }}>{s.label}</Typography>
                  <Typography variant="caption" color="text.secondary">{s.note}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* ── Mission & Vision ───────────────────────────────────────────── */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6 , md: 6 }}>
            <Box sx={{ p: { xs: 3, sm: 3.5 }, border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%', borderLeft: `4px solid ${blue}` }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                <TrackChangesOutlinedIcon sx={{ color: blue, fontSize: 22 }} />
                <SectionLabel>Our Mission</SectionLabel>
              </Stack>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5, lineHeight: 1.3, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                Make every trade between a buyer and a seller safe, simple, and fair.
              </Typography>
              <Typography variant="body2" color="text.secondary" lineHeight={1.75}>
                We built Negromart because trust is the single biggest barrier to commerce. Buyers fear losing money. Sellers fear not being paid. Our platform sits between the two — holding payments in escrow, verifying sellers, tracking deliveries, and mediating disputes — so that every transaction can happen with confidence on both sides.
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 , md: 6 }}>
            <Box sx={{ p: { xs: 3, sm: 3.5 }, border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%', borderLeft: `4px solid ${gold}` }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                <RocketLaunchOutlinedIcon sx={{ color: gold, fontSize: 22 }} />
                <SectionLabel>Our Vision</SectionLabel>
              </Stack>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5, lineHeight: 1.3, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                The most trusted marketplace for independent sellers and buyers.
              </Typography>
              <Typography variant="body2" color="text.secondary" lineHeight={1.75}>
                We envision a thriving digital economy where any seller — regardless of size — can build a sustainable business, and any buyer can shop with total confidence. No hidden risks, no payment scams, no delivery mysteries. Just clean, transparent commerce that works for everyone.
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* ── What we do ─────────────────────────────────────────────────── */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3.5 }}>
            <SectionLabel>What we do</SectionLabel>
            <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.25 }}>
              One platform. Two sides. Infinite trust.
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {/* Sellers */}
            <Grid size={{ xs: 12, sm: 6 , md: 6 }}>
              <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
                <CardContent sx={{ p: { xs: 3, sm: 3.5 }, '&:last-child': { pb: { xs: 3, sm: 3.5 } } }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
                    <Box sx={{ p: 1.25, bgcolor: (t) => alpha(t.palette.brand.blue, 0.12), borderRadius: 2 }}>
                      <StorefrontOutlinedIcon sx={{ color: blue, fontSize: 24 }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>For Sellers</Typography>
                      <Typography variant="caption" color="text.secondary">Your complete selling toolkit</Typography>
                    </Box>
                  </Stack>
                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={1}>
                    {SELLER_BENEFITS.map(b => (
                      <Stack key={b} direction="row" spacing={1.25} alignItems="flex-start">
                        <CheckCircleOutlineIcon sx={{ fontSize: 16, color: blue, mt: 0.3, flexShrink: 0 }} />
                        <Typography variant="body2" color="text.secondary" lineHeight={1.6}>{b}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Buyers */}
            <Grid size={{ xs: 12, sm: 6 , md: 6 }}>
              <Card variant="outlined" sx={{ borderRadius: 3, height: '100%' }}>
                <CardContent sx={{ p: { xs: 3, sm: 3.5 }, '&:last-child': { pb: { xs: 3, sm: 3.5 } } }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
                    <Box sx={{ p: 1.25, bgcolor: (t) => alpha(t.palette.brand.blue, 0.12), borderRadius: 2 }}>
                      <ShoppingBagOutlinedIcon sx={{ color: blue, fontSize: 24 }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>For Buyers</Typography>
                      <Typography variant="caption" color="text.secondary">Shop with complete confidence</Typography>
                    </Box>
                  </Stack>
                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={1}>
                    {BUYER_BENEFITS.map(b => (
                      <Stack key={b} direction="row" spacing={1.25} alignItems="flex-start">
                        <CheckCircleOutlineIcon sx={{ fontSize: 16, color: blue, mt: 0.3, flexShrink: 0 }} />
                        <Typography variant="body2" color="text.secondary" lineHeight={1.6}>{b}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* ── Platform pillars ───────────────────────────────────────────── */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3.5 }}>
            <SectionLabel>Platform pillars</SectionLabel>
            <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.25 }}>
              The systems that make trust possible
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 520, mx: 'auto' }}>
              Each pillar was designed to remove a specific friction point that causes commerce to break down between strangers.
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {PILLARS.map(p => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={p.title}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 2.5,
                    height: '100%',
                    transition: 'box-shadow 0.1s, transform 0.1s',
                    '&:hover': { boxShadow: 0, transform: 'translateY(0px)', borderColor: blue },
                  }}
                >
                  <CardContent sx={{ p: { xs: 2.5, sm: 3 }, '&:last-child': { pb: { xs: 2.5, sm: 3 } } }}>
                    <Box sx={{ p: 1.25, bgcolor: (t) => alpha(t.palette.brand.blue, 0.12), borderRadius: 2, display: 'inline-flex', mb: 2 }}>
                      {p.icon}
                    </Box>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.75 }}>{p.title}</Typography>
                    <Typography variant="body2" color="text.secondary" lineHeight={1.7}>{p.body}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* ── Who we are ─────────────────────────────────────────────────── */}
        <Box
          sx={{
            p: { xs: 3, sm: 4, md: 5 },
            borderRadius: 3,
            bgcolor: light,
            border: '1px solid',
            borderColor: 'divider',
            mb: 4,
          }}
        >
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <SectionLabel>Who we are</SectionLabel>
              <Typography variant="h5" fontWeight={700} sx={{ mb: 2, lineHeight: 1.3, fontSize: { xs: '1.2rem', sm: '1.4rem' } }}>
                A team obsessed with making commerce fair.
              </Typography>
              <Typography variant="body2" color="text.secondary" lineHeight={1.8} sx={{ mb: 2 }}>
                Negromart was founded on a simple belief: that the biggest obstacle to online commerce is not logistics or technology — it&apos;s trust. Buyers worry about paying for something that never arrives. Sellers worry about shipping goods before payment clears.
              </Typography>
              <Typography variant="body2" color="text.secondary" lineHeight={1.8}>
                We built every feature — from escrow payments and delivery tracking to seller verification and dispute resolution — to solve that exact problem. We take inspiration from the world&apos;s best marketplaces (Amazon, Walmart, Etsy) but build specifically for our sellers and the communities they serve.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Stack spacing={2}>
                {[
                  { icon: <GroupsOutlinedIcon sx={{ color: blue, fontSize: 20 }} />, title: 'Community-first', body: 'Every policy, feature, and process is reviewed for its impact on real sellers and buyers — not just metrics.' },
                  { icon: <VerifiedUserOutlinedIcon sx={{ color: blue, fontSize: 20 }} />, title: 'Accountability', body: 'We hold ourselves to the same standards we require of sellers: transparent, honest, and responsive.' },
                  { icon: <RocketLaunchOutlinedIcon sx={{ color: blue, fontSize: 20 }} />, title: 'Always improving', body: 'We ship new tools, fix edge cases, and listen to seller feedback every single week.' },
                ].map(v => (
                  <Stack key={v.title} direction="row" spacing={2} alignItems="flex-start">
                    <Box sx={{ p: 1, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1.5, flexShrink: 0, mt: 0.25 }}>
                      {v.icon}
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight={700} sx={{ mb: 0.25 }}>{v.title}</Typography>
                      <Typography variant="body2" color="text.secondary" lineHeight={1.6}>{v.body}</Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Box>

        {/* ── CTA strip ──────────────────────────────────────────────────── */}
        <Box
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            background: brandGradients.hero,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { sm: 'center' },
            justifyContent: 'space-between',
            gap: 3,
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={700} color="common.white" sx={{ mb: 0.5 }}>
              Ready to grow your store?
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)' }}>
              Head to your dashboard and start listing products, tracking orders, and getting paid — securely.
            </Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ flexShrink: 0 }}>
            <Link href="/dashboard" style={{ textDecoration: 'none' }}>
              <Box
                component="span"
                sx={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 1,
                  px: 3.5, py: 1.4,
                  bgcolor: blue, color: 'common.white',
                  borderRadius: 8, fontWeight: 700, fontSize: 14,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'background 0.2s',
                  '&:hover': { bgcolor: brand.blueDark },
                }}
              >
                Go to Dashboard <ArrowForwardIcon sx={{ fontSize: 16 }} />
              </Box>
            </Link>
            <Link href="/help" style={{ textDecoration: 'none' }}>
              <Box
                component="span"
                sx={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  px: 3.5, py: 1.4,
                  border: '1.5px solid rgba(255,255,255,0.35)', color: 'common.white',
                  borderRadius: 8, fontWeight: 600, fontSize: 14,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'border-color 0.2s, background 0.2s',
                  '&:hover': { borderColor: 'common.white', bgcolor: 'rgba(255,255,255,0.08)' },
                }}
              >
                Help Centre
              </Box>
            </Link>
          </Stack>
        </Box>

      </Box>
    </PageContainer>
  );
}
