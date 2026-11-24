'use client';

/**
 * "How to use this tool" card at the top of each tool page (content: guides.js).
 * Open the first time a seller visits the tool; after "Got it" it folds to one
 * line they can reopen. Remembered per tool in this browser only.
 */

import { useState, useSyncExternalStore } from 'react';
import { Box, Button, Collapse, Stack, Typography } from '@mui/material';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import GUIDES from './guides';

const seenKey = (k) => `toolguide:${k}`;
const readSeen = (k) => { try { return localStorage.getItem(seenKey(k)) === '1'; } catch { return false; } };
const noop = () => () => {};

export function GuideSteps({ guide }) {
  return (
    <Box component="ol" sx={{ m: 0, pl: 2.5, '& li': { mb: 0.75, lineHeight: 1.55 } }}>
      {guide.steps.map((s) => <Typography component="li" key={s} variant="body2">{s}</Typography>)}
    </Box>
  );
}

export default function ToolGuide({ toolKey, name }) {
  const guide = GUIDES[toolKey];
  // Read the browser's memory only on the client (server render: folded, no flash of an open card on return visits).
  const seenAtLoad = useSyncExternalStore(noop, () => readSeen(toolKey), () => true);
  const [open, setOpen] = useState(null);           // null: follow what was stored
  if (!guide) return null;
  const isOpen = open ?? !seenAtLoad;
  const close = () => { setOpen(false); try { localStorage.setItem(seenKey(toolKey), '1'); } catch { /* private mode */ } };

  return (
    <Box sx={{ mb: 2.5, borderRadius: '14px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', overflow: 'hidden' }}>
      <Stack component="button" type="button" direction="row" alignItems="center" spacing={1} onClick={() => (isOpen ? close() : setOpen(true))}
        aria-expanded={isOpen}
        sx={{ width: '100%', px: 2, py: 1.25, border: 0, bgcolor: 'transparent', cursor: 'pointer', textAlign: 'left', color: 'text.primary', font: 'inherit' }}>
        <LightbulbOutlinedIcon sx={{ color: 'warning.main', fontSize: 20 }} />
        <Typography sx={{ fontWeight: 700, fontSize: 14.5, flex: 1 }}>How to use {name || 'this tool'}</Typography>
        <ExpandMoreRoundedIcon sx={{ transition: 'transform .2s', transform: isOpen ? 'rotate(180deg)' : 'none', color: 'text.secondary' }} />
      </Stack>
      <Collapse in={isOpen} unmountOnExit>
        <Box sx={{ px: 2, pb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1.25, fontWeight: 600 }}>{guide.goal}</Typography>
          <GuideSteps guide={guide} />
          {guide.tip && (
            <Typography variant="body2" sx={{ mt: 1.25, p: 1.25, borderRadius: '10px', bgcolor: 'action.hover' }}>
              <b>Tip:</b> {guide.tip}
            </Typography>
          )}
          <Button size="small" onClick={close} sx={{ mt: 1.25, fontWeight: 700 }}>Got it</Button>
        </Box>
      </Collapse>
    </Box>
  );
}
