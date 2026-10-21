'use client';

/**
 * Shown on Messages to stores on the Free plan: customer chat starts at Basic
 * (backend payments/entitlements.py → MESSAGING_MIN_TIER). Their storefront
 * has no "Message" button until they upgrade.
 *
 * Colours come from theme tokens and chat/chatTheme only, so it reads well in
 * both light and dark mode.
 */

import Link from 'next/link';
import { Box, Button, Stack, Typography } from '@mui/material';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import { otherBubble, ownBubble, threadBg } from '@/components/chat/chatTheme';

const BENEFITS = [
  {
    icon: <StorefrontRoundedIcon />,
    title: 'A Message button on your store',
    text: 'Shoppers tap Message on your store page to ask about sizes, stock, delivery or an order, right when they are deciding.',
  },
  {
    icon: <BoltRoundedIcon />,
    title: 'Real-time, like your favourite chat app',
    text: 'Messages arrive instantly. See when a shopper is typing and know when your reply has been read.',
  },
  {
    icon: <NotificationsActiveRoundedIcon />,
    title: 'Never leave a customer waiting',
    text: 'Unread counters, in-app alerts, and an SMS reminder if a shopper has been waiting 24 hours for an answer.',
  },
  {
    icon: <GroupsRoundedIcon />,
    title: 'One inbox for your whole team',
    text: 'Owners, admins and staff answer from the same inbox, and every reply shows who sent it.',
  },
  {
    icon: <VerifiedUserRoundedIcon />,
    title: 'Every sale stays protected',
    text: 'Orders, payments and deliveries stay on Negromart with tracking and payouts, so buyers trust you and you get paid.',
  },
];

export default function MessagingUpsell({ planName = 'Free', minTier = 'basic' }: { planName?: string; minTier?: string }) {
  const tier = minTier.charAt(0).toUpperCase() + minTier.slice(1);
  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 3, bgcolor: 'background.paper', overflow: 'hidden' }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.15fr 1fr' } }}>
        {/* Pitch */}
        <Box sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
            <ForumRoundedIcon sx={{ color: 'primary.main' }} />
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'primary.main', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Customer messaging
            </Typography>
          </Stack>
          <Typography component="h2" sx={{ fontSize: { xs: 24, sm: 30 }, fontWeight: 800, lineHeight: 1.2, color: 'text.primary' }}>
            Turn questions into sales with real-time chat
          </Typography>
          <Typography sx={{ fontSize: 15.5, color: 'text.secondary', mt: 1.5, lineHeight: 1.6, maxWidth: 560 }}>
            Many shoppers have one question before they buy. Is it in stock? Will it fit? When will it arrive?
            Answer it in seconds and they&apos;re far more likely to order from you. Customer messaging is included
            from the {tier} plan.
          </Typography>

          <Stack spacing={2} sx={{ mt: 3 }}>
            {BENEFITS.map((b) => (
              <Stack key={b.title} direction="row" spacing={1.5} alignItems="flex-start">
                <Box sx={{
                  width: 36, height: 36, borderRadius: 2, flexShrink: 0, display: 'grid', placeItems: 'center',
                  bgcolor: 'action.selected', color: 'primary.main', '& svg': { fontSize: 20 },
                }}>
                  {b.icon}
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 15, fontWeight: 700, color: 'text.primary' }}>{b.title}</Typography>
                  <Typography sx={{ fontSize: 14, color: 'text.secondary', lineHeight: 1.55, mt: 0.25 }}>{b.text}</Typography>
                </Box>
              </Stack>
            ))}
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }} sx={{ mt: 3.5 }}>
            <Button component={Link} href="/subscribe" variant="contained" size="large" disableElevation
                    sx={{ textTransform: 'none', fontWeight: 700, fontSize: 15.5, px: 3, borderRadius: 2 }}>
              Upgrade to {tier}
            </Button>
            <Typography sx={{ fontSize: 13.5, color: 'text.secondary' }}>
              You&apos;re on the {planName} plan. Chat switches on as soon as you upgrade.
            </Typography>
          </Stack>
        </Box>

        {/* Preview of what shoppers and sellers see */}
        <Box aria-hidden sx={[{
          display: { xs: 'none', md: 'flex' }, flexDirection: 'column', justifyContent: 'center', gap: 1.25,
          p: 4, borderLeft: 1, borderColor: 'divider',
        }, threadBg]}>
          <PreviewBubble side="other" text="Hi! Do you have this in size 42?" time="10:02" />
          <PreviewBubble side="own" text="Yes, we do 😊 Black and white are both in stock." time="10:03" read />
          <PreviewBubble side="other" text="Great, can it reach Kumasi by Friday?" time="10:03" />
          <PreviewBubble side="own" text="Order today and it ships tomorrow, arriving Thursday." time="10:04" read />
          <PreviewBubble side="other" text="Perfect, ordering now 🙌" time="10:05" />
        </Box>
      </Box>
    </Box>
  );
}

function PreviewBubble({ side, text, time, read }: { side: 'own' | 'other'; text: string; time: string; read?: boolean }) {
  const own = side === 'own';
  return (
    <Stack alignItems={own ? 'flex-end' : 'flex-start'}>
      <Box sx={[{
        maxWidth: '85%', px: 1.25, pt: 0.75, pb: 0.5, borderRadius: 2, boxShadow: '0 1px 1px rgba(0,0,0,.08)',
        borderTopRightRadius: own ? 4 : 16, borderTopLeftRadius: own ? 16 : 4,
      }, own ? ownBubble : otherBubble]}>
        <Typography sx={{ fontSize: 14, lineHeight: 1.45, color: 'text.primary' }}>{text}</Typography>
        <Stack direction="row" spacing={0.4} alignItems="center" justifyContent="flex-end">
          <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{time}</Typography>
          {read && <DoneAllRoundedIcon sx={{ fontSize: 15, color: 'info.main' }} />}
        </Stack>
      </Box>
    </Stack>
  );
}
