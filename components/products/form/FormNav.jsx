'use client';

/**
 * Getting around the product form on any screen.
 *
 *  - Laptop and up (lg): a sticky side panel with a preview, readiness and
 *    the section list, plus the Save button.
 *  - Phone and tablet: a sticky row of section chips at the top and a sticky
 *    Save bar at the bottom (it sits above the phone's bottom nav because
 *    <main>, the scroll container, reserves that space as padding).
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Box, Button, ButtonBase, CircularProgress, LinearProgress, Stack, Typography,
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';

/** The section currently in view, watching the dashboard's <main> scroll container. */
export function useScrollSpy(ids) {
  const [active, setActive] = useState(ids[0]);
  const key = ids.join(',');
  useEffect(() => {
    const root = document.querySelector('main');
    const visible = new Map();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => visible.set(e.target.id, e.isIntersecting));
      const first = ids.find((id) => visible.get(id));
      if (first) setActive(first);
    }, { root, rootMargin: '-15% 0px -70% 0px' });
    ids.forEach((id) => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return [active, setActive];
}

export const scrollToSection = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const StatusIcon = ({ status, size = 16 }) => {
  if (status === 'error') return <ErrorRoundedIcon sx={{ fontSize: size, color: 'error.main' }} />;
  if (status === 'done') return <CheckCircleRoundedIcon sx={{ fontSize: size, color: 'success.main' }} />;
  return <RadioButtonUncheckedIcon sx={{ fontSize: size, color: 'text.disabled' }} />;
};

function Readiness({ readiness }) {
  const { done, total } = readiness;
  const complete = done === total;
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
          {complete ? 'Ready to save' : 'Required sections'}
        </Typography>
        <Typography variant="caption" sx={{ fontWeight: 700, color: complete ? 'success.main' : 'text.secondary' }}>
          {done}/{total}
        </Typography>
      </Stack>
      <LinearProgress variant="determinate" value={(done / total) * 100}
        sx={{ height: 6, borderRadius: 3, bgcolor: 'action.hover',
          '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: complete ? 'success.main' : 'text.primary' } }} />
    </Box>
  );
}

function SaveButton({ saving, isEdit, onSave, sx }) {
  return (
    <Button type="submit" variant="contained" disableElevation disabled={saving} onClick={onSave}
      startIcon={saving ? <CircularProgress size={16} thickness={5} color="inherit" /> : <SaveOutlinedIcon />}
      sx={{ bgcolor: 'text.primary', color: 'background.paper', borderRadius: '12px', fontWeight: 700, fontSize: 15,
        minHeight: 48, px: 3, '&:hover': { bgcolor: 'text.secondary' }, '&.Mui-disabled': { bgcolor: 'action.disabledBackground' }, ...sx }}>
      {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Save product'}
    </Button>
  );
}

// ── Laptop / desktop ─────────────────────────────────────────────────────────
export function DesktopRail({ sections, statuses, active, readiness, preview, saving, isEdit, onSave, onCancel, dirty }) {
  return (
    // minmax(0, 1fr): a long product title must truncate, not widen the panel.
    <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 2 }}>
      <Stack direction="row" spacing={1.5} alignItems="center"
        sx={{ p: 1.5, borderRadius: '16px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Box sx={{ width: 56, height: 56, borderRadius: '12px', overflow: 'hidden', bgcolor: 'action.hover', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {preview.image
            ? <Box component="img" src={preview.image} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <ImageOutlinedIcon sx={{ color: 'text.disabled' }} />}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" fontWeight={700} noWrap>{preview.title || 'Untitled product'}</Typography>
          <Typography variant="body2" color="text.secondary">{preview.price || 'No price yet'}</Typography>
        </Box>
      </Stack>

      <Box sx={{ p: 2, borderRadius: '16px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Readiness readiness={readiness} />
        <Box component="nav" aria-label="Product form sections" sx={{ mt: 1.5, display: 'grid', gap: 0.25 }}>
          {sections.map((s) => (
            <ButtonBase key={s.id} onClick={() => scrollToSection(s.id)}
              aria-current={active === s.id ? 'true' : undefined}
              sx={{ justifyContent: 'flex-start', gap: 1.25, px: 1.25, py: 1, borderRadius: '10px', textAlign: 'left',
                bgcolor: active === s.id ? 'action.selected' : 'transparent', '&:hover': { bgcolor: 'action.hover' } }}>
              <StatusIcon status={statuses[s.id]} />
              <Typography variant="body2" sx={{ flex: 1, fontWeight: active === s.id ? 700 : 500,
                color: statuses[s.id] === 'error' ? 'error.main' : 'text.primary' }}>
                {s.title}
              </Typography>
              {s.optional && statuses[s.id] !== 'done' && statuses[s.id] !== 'error' && (
                <Typography variant="caption" color="text.disabled">Optional</Typography>
              )}
            </ButtonBase>
          ))}
        </Box>
      </Box>

      <SaveButton saving={saving} isEdit={isEdit} onSave={onSave} sx={{ width: '100%' }} />
      <Button onClick={onCancel} sx={{ borderRadius: '12px', color: 'text.secondary', fontWeight: 600 }}>
        {dirty ? 'Discard changes' : 'Back to products'}
      </Button>
      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', mt: -1 }}>
        {isEdit ? 'Changes go live after review.' : 'New products are reviewed before they go live.'}
      </Typography>
    </Box>
  );
}

// ── Phone / tablet: section chips ────────────────────────────────────────────
export function MobileSectionBar({ sections, statuses, active }) {
  const rowRef = useRef(null);
  useEffect(() => {
    // Keep the active chip in view as the seller scrolls.
    const el = rowRef.current?.querySelector(`[data-section="${active}"]`);
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [active]);

  return (
    <Box sx={{ display: { lg: 'none' }, position: 'sticky', top: 0, zIndex: 5, mx: { xs: -1.5, sm: -3 }, px: { xs: 1.5, sm: 3 }, py: 1,
      bgcolor: 'background.default', borderBottom: '1px solid', borderColor: 'divider', mb: 2 }}>
      <Box ref={rowRef} component="nav" aria-label="Product form sections"
        sx={{ display: 'flex', gap: 1, overflowX: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
        {sections.map((s) => {
          const on = active === s.id;
          const status = statuses[s.id];
          return (
            <ButtonBase key={s.id} data-section={s.id} onClick={() => scrollToSection(s.id)}
              aria-current={on ? 'true' : undefined}
              sx={{ flexShrink: 0, gap: 0.75, px: 1.5, minHeight: 40, borderRadius: '999px', border: '1px solid',
                borderColor: status === 'error' ? 'error.main' : on ? 'text.primary' : 'divider',
                bgcolor: on ? 'text.primary' : 'background.paper', color: on ? 'background.paper' : 'text.primary' }}>
              {status === 'error' ? <ErrorRoundedIcon sx={{ fontSize: 16, color: on ? 'inherit' : 'error.main' }} />
                : status === 'done' ? <CheckCircleRoundedIcon sx={{ fontSize: 16, color: on ? 'inherit' : 'success.main' }} /> : null}
              <Typography sx={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap' }}>{s.title}</Typography>
            </ButtonBase>
          );
        })}
      </Box>
    </Box>
  );
}

// ── Phone / tablet: Save bar ─────────────────────────────────────────────────
export function MobileActionBar({ readiness, saving, isEdit, onSave }) {
  const { done, total } = readiness;
  return (
    <Box sx={{ display: { lg: 'none' }, position: 'sticky', bottom: 0, zIndex: 5, mt: 2, mx: { xs: -1.5, sm: -3 },
      px: { xs: 1.5, sm: 3 }, py: 1.25, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider',
      boxShadow: '0 -4px 16px rgba(0,0,0,0.06)' }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ maxWidth: 900, mx: 'auto' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight={700} color={done === total ? 'success.main' : 'text.primary'}>
            {done === total ? 'Ready to save' : `${done} of ${total} done`}
          </Typography>
          <LinearProgress variant="determinate" value={(done / total) * 100}
            sx={{ mt: 0.5, height: 4, borderRadius: 2, bgcolor: 'action.hover',
              '& .MuiLinearProgress-bar': { bgcolor: done === total ? 'success.main' : 'text.primary' } }} />
        </Box>
        <SaveButton saving={saving} isEdit={isEdit} onSave={onSave} sx={{ flexShrink: 0 }} />
      </Stack>
    </Box>
  );
}
