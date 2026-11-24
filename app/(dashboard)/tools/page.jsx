'use client';

import Link from 'next/link';
import { Box, Button, Chip, CircularProgress, LinearProgress, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import QueryStatsOutlinedIcon from '@mui/icons-material/QueryStatsOutlined';
import PriceChangeOutlinedIcon from '@mui/icons-material/PriceChangeOutlined';
import SyncAltOutlinedIcon from '@mui/icons-material/SyncAltOutlined';
import TravelExploreOutlinedIcon from '@mui/icons-material/TravelExploreOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import ForwardToInboxOutlinedIcon from '@mui/icons-material/ForwardToInboxOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import QuickreplyOutlinedIcon from '@mui/icons-material/QuickreplyOutlined';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';
import ApiOutlinedIcon from '@mui/icons-material/ApiOutlined';
import PageContainer from '@/components/PageContainer';
import { useTools } from '@/components/tools/ToolGate';

const ICONS = {
  bulk_edit: EditNoteOutlinedIcon, stock_forecast: Inventory2OutlinedIcon, listing_doctor: AutoAwesomeOutlinedIcon,
  profit_report: QueryStatsOutlinedIcon, price_insights: PriceChangeOutlinedIcon, auto_repricer: SyncAltOutlinedIcon,
  demand_insights: TravelExploreOutlinedIcon, promotions: CampaignOutlinedIcon, broadcasts: ForwardToInboxOutlinedIcon,
  labels: PrintOutlinedIcon, chat_tools: QuickreplyOutlinedIcon, store_link: QrCode2OutlinedIcon, api: ApiOutlinedIcon,
};

export default function ToolsPage() {
  const { tools, loading } = useTools();
  return (
    <PageContainer title="Seller tools" breadcrumbs={[{ title: 'Home', path: '/dashboard' }, { title: 'Seller tools' }]}>
      <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 640 }}>
        Tools that save you time and help you sell more. What&apos;s included depends on your plan. Each tool opens with a short guide showing how to use it.
      </Typography>
      {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress size={28} /></Box> : (
        <Grid container spacing={2}>
          {tools.map((t) => {
            const Icon = ICONS[t.key] || AutoAwesomeOutlinedIcon;
            return (
              <Grid key={t.key} size={{ xs: 12, sm: 6, lg: 4 }}>
                <Box sx={{ height: '100%', p: 2.5, borderRadius: '16px', border: '1px solid', borderColor: 'divider',
                  bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: 'action.selected', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon sx={{ color: 'text.secondary' }} />
                    </Box>
                    {t.included
                      ? <Chip size="small" label="Included" color="success" variant="outlined" sx={{ fontWeight: 700 }} />
                      : <Chip size="small" icon={<LockOutlinedIcon />} label={t.upgrade_plan ? `With ${t.upgrade_plan}` : 'Not in your plan'} variant="outlined" sx={{ fontWeight: 600 }} />}
                  </Stack>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 17, mb: 0.5 }}>{t.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{t.summary}</Typography>
                  </Box>
                  {t.included && t.allowance > 0 && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">{t.key === 'broadcasts' ? 'Messages' : 'AI rewrites'} this month: {t.used} of {t.allowance}</Typography>
                      <LinearProgress variant="determinate" value={Math.min((t.used / t.allowance) * 100, 100)} sx={{ height: 6, borderRadius: 3, mt: 0.5 }} />
                    </Box>
                  )}
                  <Button component={Link} href={t.included ? t.path : '/subscribe'} variant={t.included ? 'contained' : 'outlined'} disableElevation
                    sx={{ borderRadius: '10px', fontWeight: 700, minHeight: 44,
                      ...(t.included && { bgcolor: 'text.primary', color: 'background.paper', '&:hover': { bgcolor: 'text.secondary' } }) }}>
                    {t.included ? 'Open' : 'See plans'}
                  </Button>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      )}
    </PageContainer>
  );
}
