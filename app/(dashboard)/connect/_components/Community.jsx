'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import CloseIcon from '@mui/icons-material/Close';
import GroupsIcon from '@mui/icons-material/Groups';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import PublicIcon from '@mui/icons-material/Public';

import {
  FaWhatsapp, FaTelegram, FaFacebook, FaInstagram,
  FaYoutube, FaLinkedinIn, FaPinterest,
} from 'react-icons/fa';
import { FaXTwitter, FaTiktok, FaDiscord, FaSnapchat } from 'react-icons/fa6';

import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';

import { brand, brandGradients, socialBrand } from '@/theme/designTokens';

// ── Platform config ────────────────────────────────────────────────────────────
// Brand colours come from the single design base; tinted backgrounds are derived
// with alpha so they read correctly in both light and dark mode.
const platform = (Icon, color, label) => ({ Icon, color, bg: alpha(color, 0.14), label });
const PLATFORM_CONFIG = {
  whatsapp:  platform(FaWhatsapp,   socialBrand.whatsapp,  'WhatsApp'),
  telegram:  platform(FaTelegram,   socialBrand.telegram,  'Telegram'),
  facebook:  platform(FaFacebook,   socialBrand.facebook,  'Facebook'),
  instagram: platform(FaInstagram,  socialBrand.instagram, 'Instagram'),
  twitter:   platform(FaXTwitter,   socialBrand.twitter,   'X / Twitter'),
  youtube:   platform(FaYoutube,    socialBrand.youtube,   'YouTube'),
  linkedin:  platform(FaLinkedinIn, socialBrand.linkedin,  'LinkedIn'),
  tiktok:    platform(FaTiktok,     socialBrand.tiktok,    'TikTok'),
  discord:   platform(FaDiscord,    socialBrand.discord,   'Discord'),
  pinterest: platform(FaPinterest,  socialBrand.pinterest, 'Pinterest'),
  snapchat:  platform(FaSnapchat,   socialBrand.snapchat,  'Snapchat'),
  other:     platform(PublicIcon,   socialBrand.other,     'Platform'),
};

const HOST = process.env.NEXT_PUBLIC_HOST;

// ── QR Dialog ─────────────────────────────────────────────────────────────────
function QRDialog({ open, onClose, link }) {
  if (!link) return null;
  const cfg = PLATFORM_CONFIG[link.platform] || PLATFORM_CONFIG.other;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <cfg.Icon size={20} color={cfg.color} />
          <Typography fontWeight={700} fontSize={15}>{link.label}</Typography>
        </Box>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 2 }}>
          <Box
            sx={{
              p: 2.5, borderRadius: 3, bgcolor: 'common.white',
              border: '3px solid', borderColor: cfg.color,
              boxShadow: `0 0 0 6px ${alpha(cfg.color, 0.1)}`,
            }}
          >
            <QRCodeSVG value={link.url} size={200} fgColor={cfg.color} bgColor="#ffffff" level="M" />
          </Box>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Scan with your phone camera to open
          </Typography>
          <Typography
            variant="caption"
            sx={{
              px: 1.5, py: 0.5, borderRadius: 2,
              bgcolor: 'action.hover', wordBreak: 'break-all', textAlign: 'center',
              color: 'text.secondary', fontFamily: 'monospace', fontSize: 11,
            }}
          >
            {link.url}
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

// ── Link card ─────────────────────────────────────────────────────────────────
function LinkCard({ link, onQROpen }) {
  const cfg = PLATFORM_CONFIG[link.platform] || PLATFORM_CONFIG.other;
  const isJoin = link.category === 'community';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(link.url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        borderRadius: 2,
        borderColor: 'divider',
        borderLeft: '2px solid',
        borderLeftColor: cfg.color,
        transition: 'box-shadow 0.2s, transform 0.2s',
        '&:hover': {
          boxShadow: `0 4px 20px ${alpha(cfg.color, 0.15)}`,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }}}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          {/* Icon */}
          <Box
            sx={{
              width: 48, height: 48, borderRadius: 2,
              bgcolor: cfg.bg, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <cfg.Icon size={26} color={cfg.color} />
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.4 }}>
              <Typography fontWeight={700} fontSize={15} lineHeight={1.2} noWrap>
                {link.label}
              </Typography>
              {link.member_count && (
                <Chip
                  label={link.member_count}
                  size="small"
                  sx={{
                    height: 20, fontSize: 11, fontWeight: 600,
                    bgcolor: alpha(cfg.color, 0.1), color: cfg.color,
                    border: 'none',
                  }}
                />
              )}
            </Box>
            {link.description && (
              <Typography variant="body2" color="text.secondary" fontSize={13} sx={{ mb: 1.5 }}>
                {link.description}
              </Typography>
            )}

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              <Button
                variant="contained"
                size="small"
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                endIcon={<OpenInNewIcon sx={{ fontSize: '14px !important' }} />}
                sx={{
                  bgcolor: cfg.color,
                  '&:hover': { bgcolor: cfg.color, filter: 'brightness(0.9)' },
                  textTransform: 'none',
                  fontSize: 12.5,
                  fontWeight: 600,
                  px: 1.75,
                  py: 0.6,
                  borderRadius: 2,
                  boxShadow: 'none',
                }}
              >
                {isJoin ? 'Join Now' : 'Follow'}
              </Button>

              <Tooltip title={copied ? 'Copied!' : 'Copy link'}>
                <IconButton
                  size="small"
                  onClick={handleCopy}
                  sx={{
                    border: '1px solid', borderColor: 'divider',
                    borderRadius: 1.5, width: 30, height: 30,
                    color: copied ? 'success.main' : 'text.secondary',
                  }}
                >
                  <ContentCopyIcon sx={{ fontSize: 15 }} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Show QR code">
                <IconButton
                  size="small"
                  onClick={() => onQROpen(link)}
                  sx={{
                    border: '1px solid', borderColor: 'divider',
                    borderRadius: 1.5, width: 30, height: 30,
                    color: 'text.secondary',
                  }}
                >
                  <QrCode2Icon sx={{ fontSize: 15 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Inline QR — desktop only */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              flexShrink: 0,
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <Box
              sx={{
                p: 1, borderRadius: 2, bgcolor: 'common.white',
                border: '1.5px solid', borderColor: alpha(cfg.color, 0.3),
              }}
            >
              <QRCodeSVG value={link.url} size={72} fgColor={cfg.color} bgColor="#ffffff" level="M" />
            </Box>
            <Typography variant="caption" color="text.disabled" fontSize={10} fontWeight={600} textTransform="uppercase" letterSpacing="0.05em">
              Scan
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

// ── Section skeleton ───────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3, borderLeft: '4px solid', borderLeftColor: 'divider' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Skeleton variant="rounded" width={48} height={48} sx={{ borderRadius: 2, flexShrink: 0 }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="55%" height={22} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="80%" height={16} sx={{ mb: 1 }} />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Skeleton variant="rounded" width={80} height={28} sx={{ borderRadius: 2 }} />
              <Skeleton variant="rounded" width={30} height={28} sx={{ borderRadius: 1.5 }} />
              <Skeleton variant="rounded" width={30} height={28} sx={{ borderRadius: 1.5 }} />
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

// ── Section header ─────────────────────────────────────────────────────────────
function SectionHeader({ icon, title, subtitle, count }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
        <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
        <Typography variant="h6" fontWeight={800} fontSize={18}>
          {title}
        </Typography>
        {count > 0 && (
          <Chip label={count} size="small" color="primary" sx={{ height: 20, fontSize: 11, fontWeight: 700 }} />
        )}
      </Box>
      <Typography variant="body2" color="text.secondary" fontSize={13.5}>
        {subtitle}
      </Typography>
    </Box>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────────
function EmptySection({ label }) {
  return (
    <Box
      sx={{
        textAlign: 'center', py: 5, px: 3,
        borderRadius: 2, border: '2px dashed', borderColor: 'divider',
        color: 'text.disabled',
      }}
    >
      <PublicIcon sx={{ fontSize: 40, mb: 1, opacity: 0.3 }} />
      <Typography fontSize={14}>{label}</Typography>
    </Box>
  );
}

// ── Stats bar ──────────────────────────────────────────────────────────────────
function StatsBar({ communityLinks, socialLinks }) {
  const stats = [
    {
      icon: <GroupsIcon fontSize="small" />,
      value: communityLinks.length,
      label: 'Community Groups',
      color: socialBrand.whatsapp,
    },
    {
      icon: <ThumbUpAltOutlinedIcon fontSize="small" />,
      value: socialLinks.length,
      label: 'Social Platforms',
      color: socialBrand.facebook,
    },
    {
      icon: <PeopleAltOutlinedIcon fontSize="small" />,
      value: communityLinks.length + socialLinks.length,
      label: 'Total Channels',
      color: brand.blue,
    },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        gap: { xs: 1, sm: 2 },
        mb: 4,
        flexWrap: 'wrap',
      }}
    >
      {stats.map((s) => (
        <Box
          key={s.label}
          sx={{
            flex: { xs: '1 1 calc(50% - 8px)', sm: '1 1 0' },
            minWidth: { xs: 0, sm: 120 },
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 2,
            py: 1.5,
            borderRadius: 2,
            bgcolor: alpha(s.color, 0.07),
            border: '1px solid',
            borderColor: alpha(s.color, 0.15),
          }}
        >
          <Box sx={{ color: s.color }}>{s.icon}</Box>
          <Box>
            <Typography fontWeight={800} fontSize={20} lineHeight={1} color={s.color}>
              {s.value}
            </Typography>
            <Typography fontSize={11.5} color="text.secondary" fontWeight={500} mt={0.2}>
              {s.label}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function Community() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrLink, setQRLink] = useState(null);
  const [snack, setSnack] = useState('');

  useEffect(() => {
    axios
      .get(`${HOST}/api/community/links/`)
      .then((res) => setLinks(res.data))
      .catch(() => setLinks([]))
      .finally(() => setLoading(false));
  }, []);

  const communityLinks = links.filter((l) => l.category === 'community');
  const socialLinks    = links.filter((l) => l.category === 'social');

  const handleQROpen  = useCallback((link) => setQRLink(link), []);
  const handleQRClose = useCallback(() => setQRLink(null), []);

  return (
    <Box>
      {/* Hero ── */}
      <Box
        sx={{
          borderRadius: 4,
          mb: 4,
          px: { xs: 3, sm: 5 },
          py: { xs: 4, sm: 5 },
          background: brandGradients.heroWide,
          color: 'common.white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <Box sx={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -60, right: 80, width: 160, height: 160, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />

        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          <Box
            sx={{
              width: 52, height: 52, borderRadius: 3,
              bgcolor: 'rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <GroupsIcon sx={{ fontSize: 28, color: brand.gold }} />
          </Box>
          <Box>
            <Typography
              variant="h4"
              fontWeight={800}
              fontSize={{ xs: 22, sm: 28 }}
              lineHeight={1.2}
              mb={0.5}
            >
              Our Community
            </Typography>
            <Typography fontSize={{ xs: 13.5, sm: 15 }} sx={{ opacity: 0.8, maxWidth: 500 }}>
              Join thousands of sellers and stay connected — get tips, deals, announcements,
              and support directly from the NegroMart team.
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2.5 }}>
          <Chip
            icon={<GroupsIcon sx={{ fontSize: '14px !important', color: `${brand.gold} !important` }} />}
            label="Community Groups"
            size="small"
            sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: 'common.white', fontWeight: 600, fontSize: 12 }}
          />
          <Chip
            icon={<ThumbUpAltOutlinedIcon sx={{ fontSize: '14px !important', color: `${brand.gold} !important` }} />}
            label="Social Media"
            size="small"
            sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: 'common.white', fontWeight: 600, fontSize: 12 }}
          />
          <Chip
            icon={<QrCode2Icon sx={{ fontSize: '14px !important', color: `${brand.gold} !important` }} />}
            label="QR Codes"
            size="small"
            sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: 'common.white', fontWeight: 600, fontSize: 12 }}
          />
        </Box>
      </Box>

      {/* Stats ── */}
      {!loading && (
        <StatsBar communityLinks={communityLinks} socialLinks={socialLinks} />
      )}

      {/* Community Groups ── */}
      <Box sx={{ mb: 5 }}>
        <SectionHeader
          icon={<GroupsIcon />}
          title="Join Our Community"
          subtitle="Interactive groups where you can ask questions, share tips, and get real-time support."
          count={!loading ? communityLinks.length : 0}
        />

        {loading ? (
          <Grid container spacing={2}>
            {[0, 1, 2].map((i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                <CardSkeleton />
              </Grid>
            ))}
          </Grid>
        ) : communityLinks.length === 0 ? (
          <EmptySection label="No community groups added yet — check back soon!" />
        ) : (
          <Grid container spacing={1}>
            {communityLinks.map((link) => (
              <Grid size={{ xs: 12, sm: 6, md: 6 }} key={link.id}>
                <LinkCard link={link} onQROpen={handleQROpen} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <Divider sx={{ mb: 5 }} />

      {/* Social Media ── */}
      <Box sx={{ mb: 5 }}>
        <SectionHeader
          icon={<ThumbUpAltOutlinedIcon />}
          title="Follow Us on Social Media"
          subtitle="Stay updated with the latest news, product highlights, and seller spotlights across our platforms."
          count={!loading ? socialLinks.length : 0}
        />

        {loading ? (
          <Grid container spacing={2}>
            {[0, 1, 2, 3].map((i) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                <CardSkeleton />
              </Grid>
            ))}
          </Grid>
        ) : socialLinks.length === 0 ? (
          <EmptySection label="No social media links added yet — check back soon!" />
        ) : (
          <Grid container spacing={2}>
            {socialLinks.map((link) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={link.id}>
                <LinkCard link={link} onQROpen={handleQROpen} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Bottom CTA ── */}
      {!loading && (
        <Box
          sx={{
            borderRadius: 3,
            p: 3,
            bgcolor: 'action.hover',
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography fontWeight={700} fontSize={14.5} mb={0.3}>
              Missing a platform?
            </Typography>
            <Typography variant="body2" color="text.secondary" fontSize={13}>
              Let us know which platforms you&apos;d like to see and we&apos;ll add them.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            size="small"
            href="mailto:support@negromart.com?subject=Community Platform Request"
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, whiteSpace: 'nowrap' }}
          >
            Send Suggestion
          </Button>
        </Box>
      )}

      {/* QR Dialog ── */}
      <QRDialog open={!!qrLink} onClose={handleQRClose} link={qrLink} />

      {/* Copy snack ── */}
      <Snackbar
        open={!!snack}
        autoHideDuration={2000}
        onClose={() => setSnack('')}
        message={snack}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
