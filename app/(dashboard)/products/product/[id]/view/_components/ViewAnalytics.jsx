'use client';

import { useState } from 'react';
import {
  Box, Grid, Typography, Stack,
  ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { LineChart } from '@mui/x-charts/LineChart';
import { useTheme } from '@mui/material/styles';

const fmt = (n) => (n || 0).toLocaleString();

function ViewTile({ label, data, accent = false }) {
  const unique    = data?.unique    ?? 0;
  const returning = data?.returning ?? 0;
  const bots      = data?.bots      ?? 0;
  const allTime   = data?.total     ?? 0; // all_time only has total

  const headline  = data?.unique !== undefined ? unique : allTime;
  const hasDetail = data?.returning !== undefined;

  return (
    <Box sx={{
      p: '18px 20px',
      borderRadius: '14px',
      border: '1px solid',
      borderColor: accent ? 'text.primary' : 'divider',
      bgcolor:     accent ? 'text.primary' : 'background.paper',
      display: 'flex', flexDirection: 'column', gap: 1,
      height: '100%',
      transition: 'box-shadow 0.18s, transform 0.18s',
      '&:hover': { boxShadow: '0 6px 24px rgba(0,0,0,0.08)', transform: 'translateY(-1px)' },
    }}>
      <Typography variant="caption" sx={{
        display: 'block', fontSize: 10, fontWeight: 600,
        letterSpacing: '0.06em', textTransform: 'uppercase',
        color: accent ? 'rgba(255,255,255,0.5)' : 'text.disabled',
      }}>
        {label}
      </Typography>

      <Typography sx={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 36, fontWeight: 700, lineHeight: 1,
        color: accent ? '#ffffff' : 'text.primary',
      }}>
        {fmt(headline)}
      </Typography>

      {hasDetail && (
        <Typography sx={{ fontSize: 11, lineHeight: 1.6, color: accent ? 'rgba(255,255,255,0.4)' : 'text.disabled' }}>
          {fmt(unique)} unique · {fmt(returning)} returning
          {bots > 0 && (
            <Box component="span" sx={{ opacity: 0.6 }}> · {fmt(bots)} bots</Box>
          )}
        </Typography>
      )}
    </Box>
  );
}

export function ViewAnalytics({ data }) {
  const va    = data?.view_analytics;
  const theme = useTheme();
  const [series, setSeries] = useState('unique');

  if (!va) return null;

  const trend  = va.trend ?? [];
  const xAxis  = trend.map((d) => new Date(d.date));
  const allZero = trend.every((d) => d.unique === 0 && d.total === 0);

  const seriesDef = {
    unique:    { data: trend.map((d) => d.unique),    label: 'Unique views',    color: theme.palette.text.primary },
    returning: { data: trend.map((d) => d.returning), label: 'Returning views', color: theme.palette.primary.main },
    total:     { data: trend.map((d) => d.total),     label: 'Total views',     color: theme.palette.text.secondary },
  };

  return (
    <Box>
      {/* ── Period tiles ──────────────────────────────────────────────── */}
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <ViewTile label="Today"       data={va.today}    accent />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <ViewTile label="Last 7 Days" data={va.week}     />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <ViewTile label="Last 30 Days" data={va.month}   />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <ViewTile label="All Time"    data={va.all_time} />
        </Grid>
      </Grid>

      {/* ── 30-day trend chart ────────────────────────────────────────── */}
      <Box sx={{
        p: { xs: 2.5, md: 3 },
        borderRadius: '20px',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ sm: 'center' }}
          justifyContent="space-between"
          spacing={1.5}
          sx={{ mb: 2.5 }}
        >
          <Stack direction="row" alignItems="baseline" spacing={1}>
            <Typography sx={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px',
            }} color="text.primary">
              View Trend
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{
              letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: 10,
            }}>
              Last 30 days
            </Typography>
          </Stack>

          <ToggleButtonGroup
            value={series}
            exclusive
            onChange={(_, v) => { if (v) setSeries(v); }}
            size="small"
            sx={{
              '& .MuiToggleButton-root': {
                px: 1.5, py: 0.5, fontSize: 11, fontWeight: 600,
                textTransform: 'none', borderRadius: '8px !important',
                border: '1px solid', borderColor: 'divider',
              },
            }}
          >
            <ToggleButton value="unique">Unique</ToggleButton>
            <ToggleButton value="returning">Returning</ToggleButton>
            <ToggleButton value="total">Total</ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        {allZero ? (
          <Box sx={{
            minHeight: 180,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 1,
          }}>
            <VisibilityOutlinedIcon sx={{ fontSize: 28, color: 'text.disabled' }} />
            <Typography variant="body2" color="text.disabled">
              No view data in the last 30 days
            </Typography>
          </Box>
        ) : (
          <LineChart
            xAxis={[{ data: xAxis, scaleType: 'time', tickMinStep: 3600 * 1000 * 24 }]}
            series={[{
              data:     seriesDef[series].data,
              label:    seriesDef[series].label,
              color:    seriesDef[series].color,
              curve:    'monotoneX',
              area:     true,
              showMark: false,
            }]}
            height={260}
            margin={{ top: 16, right: 24, bottom: 48, left: 60 }}
            sx={{
              '& .MuiAreaElement-root':       { opacity: 0.07 },
              '& .MuiLineElement-root':        { strokeWidth: 2 },
              '& .MuiChartsAxis-tickLabel':    { fill: theme.palette.text.secondary, fontSize: 11 },
            }}
          />
        )}
      </Box>
    </Box>
  );
}
