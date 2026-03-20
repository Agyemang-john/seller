'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog, DialogContent, Box, Typography, TextField,
  Button, Stack, IconButton, Tooltip, InputAdornment,
  CircularProgress,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

// ── Random word pool ──────────────────────────────────────────────────────────
const WORD_POOL = [
  'confirm', 'remove', 'erase', 'delete', 'destroy', 'discard',
  'proceed', 'cancel', 'archive', 'wipe', 'purge', 'clear',
  'vanish', 'revoke', 'drop', 'obliterate', 'exterminate', 'eliminate', 'annihilate', 'extinguish', 
  'abolish', 'eradicate', 'expunge', 'liquidate', 'decimate', 'dismantle', 'disintegrate', 'demolish', 
  'shred', 'burn', 'crush', 'smash', 'dispel', 'quash', 'suppress', 'extirpate', 
  'uproot', 'exile', 'banish', 'eject', 'expel', 'oust', 'deport', 
  'dismiss', 'rescind', 'retract', 'withdraw', 'nullify', 'invalidate', 
  'negate', 'annul', 'void', 'abolish', 'repeal', 'abrogate', 'countermand', 
  'override', 'overturn', 'reverse', 'refute', 'disprove', 'debunk', 'confute', 
  'contradict', 'challenge', 'John', 'apple', 'sunshine', 'guitar', 'ocean', 
  'mountain', 'river', 'forest', 'desert', 'galaxy', 'comet', 'nebula', 
  'star', 'planet', 'moon', 'cloud', 'rainbow', 'thunder', 'lightning',
];

function randomWord() {
  return WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)];
}

/**
 * DeleteConfirmDialog
 *
 * Props:
 *   open       — boolean
 *   productTitle — string shown in the dialog
 *   onConfirm  — async () => void  — called when confirmed; dialog closes on resolve
 *   onClose    — () => void
 */
export default function DeleteConfirmDialog({ open, productTitle, onConfirm, onClose }) {
  const [word,     setWord]     = useState('');
  const [input,    setInput]    = useState('');
  const [copied,   setCopied]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  // New random word each time the dialog opens
  useEffect(() => {
    if (open) {
      setWord(randomWord());
      setInput('');
      setError('');
      setCopied(false);
      setLoading(false);
    }
  }, [open]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(word).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [word]);

  const handleConfirm = useCallback(async () => {
    if (input.trim().toLowerCase() !== word) {
      setError(`Type "${word}" exactly to confirm.`);
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onConfirm();
      // onClose is called by the parent after onConfirm resolves
    } catch {
      // parent handles errors
    } finally {
      setLoading(false);
    }
  }, [input, word, onConfirm]);

  const isMatch = input.trim().toLowerCase() === word;

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 24px 64px rgba(0,0,0,0.12)',
        },
      }}
    >
      <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
        {/* ── Header ─────────────────────────────────────────────────── */}
        <Box
          sx={{
            px: 3, pt: 3, pb: 2.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Stack direction="row" spacing={1.75} alignItems="flex-start">
            <Box>
              <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 700, letterSpacing: '-0.4px', lineHeight: 1.2 }} color="text.primary">
                Delete product?
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5, display: 'block', mt: 0.4 }}>
                This action is permanent and cannot be undone.
              </Typography>
            </Box>
          </Stack>

          {!loading && (
            <IconButton size="small" onClick={onClose} sx={{ flexShrink: 0, borderRadius: '8px', color: 'text.disabled', '&:hover': { bgcolor: 'action.hover', color: 'text.primary' } }}>
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          )}
        </Box>

        {/* ── Body ───────────────────────────────────────────────────── */}
        <Box sx={{ px: 3, pt: 2.5, pb: 3 }}>
          {/* Product name */}
          <Box
            sx={{
              px: 2, py: 1.5, borderRadius: '10px',
              bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider',
              mb: 2.5,
            }}
          >
            <Typography variant="caption" color="text.disabled" sx={{ letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: 10, fontWeight: 600, display: 'block', mb: 0.25 }}>
              Product to delete
            </Typography>
            <Typography variant="body2" fontWeight={600} color="text.primary"
              sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {productTitle}
            </Typography>
          </Box>

          {/* Confirmation word */}
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65, mb: 1.75 }}>
            To confirm, type the word below in the field:
          </Typography>

          {/* Word display + copy */}
          <Box
            sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              px: 2, py: 1.25, borderRadius: '10px',
              bgcolor: 'action.hover', mb: 1.75,
            }}
          >
            <Typography
              sx={{
                fontFamily: 'monospace', fontSize: 16, fontWeight: 700,
                letterSpacing: '0.12em', color: 'action.secondary', userSelect: 'none',
                userSelect: 'none',
              }}
            >
              {word}
            </Typography>

            <Tooltip title={copied ? 'Copied!' : 'Copy word'} placement="top">
              <IconButton
                size="small"
                onClick={handleCopy}
                sx={{
                  color: copied ? '#4ade80' : 'rgba(143, 143, 143, 0.6)',
                  borderRadius: '6px',
                  transition: 'color 0.18s',
                  '&:hover': { bgcolor: 'action.hover', color: 'text.secondary' },
                }}
              >
                {copied
                  ? <CheckIcon sx={{ fontSize: 16 }} />
                  : <ContentCopyIcon sx={{ fontSize: 16 }} />
                }
              </IconButton>
            </Tooltip>
          </Box>

          {/* Input */}
          <TextField
            fullWidth
            size="small"
            placeholder={`Type "${word}" to confirm`}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (error) setError('');
            }}
            onKeyDown={(e) => { if (e.key === 'Enter' && isMatch) handleConfirm(); }}
            error={!!error}
            helperText={error}
            autoComplete="off"
            spellCheck={false}
            InputProps={{
              endAdornment: isMatch ? (
                <InputAdornment position="end">
                  <CheckIcon sx={{ fontSize: 16, color: 'success.main' }} />
                </InputAdornment>
              ) : null,
              sx: {
                fontFamily: 'monospace',
                letterSpacing: '0.08em',
                borderRadius: '10px',
                '& fieldset': {
                  borderColor: isMatch ? 'success.main' : error ? 'error.main' : 'divider',
                  transition: 'border-color 0.18s',
                },
                '&:hover fieldset': {
                  borderColor: isMatch ? 'success.main' : 'text.disabled',
                },
                '&.Mui-focused fieldset': {
                  borderColor: isMatch ? 'success.main' : 'text.primary',
                },
              },
            }}
            sx={{ mb: 2.5 }}
          />

          {/* Action buttons */}
          <Stack direction="row" spacing={1}>
            <Button
              fullWidth
              variant="outlined"
              onClick={onClose}
              disabled={loading}
              sx={{
                borderRadius: '10px', borderColor: 'divider',
                color: 'text.primary', fontWeight: 600,
                '&:hover': { borderColor: 'text.primary', color: 'text.primary' },
              }}
            >
              Cancel
            </Button>

            <Button
              fullWidth
              variant="contained"
              disableElevation
              disabled={!isMatch || loading}
              onClick={handleConfirm}
              startIcon={loading
                ? <CircularProgress size={14} thickness={5} color="inherit" />
                : <DeleteOutlineIcon />
              }
              sx={{
                borderRadius: '10px',
                fontWeight: 600,
                bgcolor: isMatch ? 'error.main' : 'action.disabledBackground',
                color: isMatch ? 'text.primary' : 'text.disabled',
                transition: 'background-color 0.2s',
                '&:hover': { bgcolor: isMatch ? 'error.dark' : undefined },
                '&.Mui-disabled': {
                  bgcolor: 'action.disabledBackground',
                  color: 'text.secondary',
                },
              }}
            >
              {loading ? 'Deleting…' : 'Continue'}
            </Button>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
}