'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import PaletteIcon from '@mui/icons-material/Palette';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import DevicesIcon from '@mui/icons-material/Devices';
import { useColorScheme } from '@mui/material/styles';

export default function AppearanceSettings() {
  const { mode, setMode } = useColorScheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <Box>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
        <PaletteIcon color="primary" />
        <Typography variant="h6" fontWeight={700}>Appearance</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Customise how the dashboard looks for you.
      </Typography>

      <Stack spacing={2}>
        {/* Theme */}
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ sm: 'center' }}
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>Colour Theme</Typography>
                <Typography variant="body2" color="text.secondary">
                  Light, dark, or follow your system preference.
                </Typography>
              </Box>
              <ToggleButtonGroup
                value={mounted ? (mode ?? 'system') : undefined}
                exclusive
                onChange={(_, v) => v && setMode(v)}
                size="small"
                sx={{ flexShrink: 0 }}
              >
                <ToggleButton value="light" sx={{ px: 2, gap: 0.75, textTransform: 'none' }}>
                  <LightModeIcon fontSize="small" /> Light
                </ToggleButton>
                <ToggleButton value="dark" sx={{ px: 2, gap: 0.75, textTransform: 'none' }}>
                  <DarkModeIcon fontSize="small" /> Dark
                </ToggleButton>
                <ToggleButton value="system" sx={{ px: 2, gap: 0.75, textTransform: 'none' }}>
                  <DevicesIcon fontSize="small" /> System
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </CardContent>
        </Card>

        {/* Sidebar density hint */}
        <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: 'action.hover' }}>
          <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>Sidebar Layout</Typography>
                <Typography variant="body2" color="text.secondary">
                  Use the menu toggle in the header to collapse or expand the sidebar at any time.
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
