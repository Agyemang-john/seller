'use client';

/**
 * Photo studio: turns a seller's own photo into a marketplace-ready product
 * photo without making it look fake.
 *
 *   Background  remove it (AI, on the device), pick white / soft grey / warm,
 *               a natural floor or soft shadow, edge position and softness
 *   Frame       product size, move (drag), rotate, straighten, mirror
 *   Light       Auto, brightness, contrast, warmth, saturation, sharpness:
 *               photographic ranges, nothing cartoonish
 *   Touch up    tap to remove / keep an object (hands, hanger, mannequin stand:
 *               Segment Anything), erase / restore brush; removed parts tinted
 *
 * Several photos at once: "Save & next", with "Use these settings for the
 * rest". The next photo's background is removed while the seller works on
 * the current one. Everything is undoable (Ctrl+Z). The result is a 1600 px
 * square JPEG under 2 MB: exactly what the product form accepts.
 *
 * Props: items [{ source: File | URL, name }], onDone(files[] — null = kept as
 * it was), onClose(), title.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert, Box, Button, Chip, CircularProgress, Dialog, Divider, IconButton, LinearProgress, Slider, Stack, Switch,
  Tab, Tabs, ToggleButton, ToggleButtonGroup, Tooltip, Typography, useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import CompareIcon from '@mui/icons-material/Compare';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import FlipIcon from '@mui/icons-material/Flip';
import CenterFocusStrongOutlinedIcon from '@mui/icons-material/CenterFocusStrongOutlined';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { prepareSelect, removeBackground, selectObject, subscribe, warmUp } from './engine';
import { BACKGROUNDS, DEFAULTS, StudioDoc, loadPhoto } from './studioDoc';

const PREVIEW_SIZE = 1024;
const MB = (b) => (b / 1024 / 1024).toFixed(0);

// Light settings "Use these settings for the rest" copies (framing stays per photo).
const SHARED = ['removeBg', 'background', 'shadow', 'fill', 'edgeShift', 'edgeSoft',
  'exposure', 'contrast', 'warmth', 'saturation', 'sharpness'];

function autoParams(doc) {
  const a = doc.auto;
  return a ? { exposure: a.exposure, contrast: a.contrast, sharpness: a.sharpness, wb: a.wb } : {};
}

// ── Loading and cutting out one photo (shared between the open photo and the one after) ──

/** The photo, decoded (shown at once). */
function open(item) {
  if (!item._open) {
    item._open = loadPhoto(item.source, item.name || 'photo').then((photo) => {
      const doc = new StudioDoc(photo);
      doc.history = []; doc.future = [];
      return doc;
    });
  }
  return item._open;
}

/** The photo with its background found (or the reason it couldn't be). */
function prepare(item) {
  if (item._prep) return item._prep;
  item._prep = (async () => {
    const doc = await open(item);
    try {
      doc.setCutout(await removeBackground(doc.pixels, doc.w, doc.h));
      Object.assign(doc.params, autoParams(doc));
      doc.autoOn = true;
    } catch (err) {
      doc.cutoutError = err?.message || 'The background could not be removed.';
      doc.params.removeBg = false;
    }
    return doc;
  })();
  return item._prep;
}

// ── Small pieces ─────────────────────────────────────────────────────────────

function Control({ label, value, min, max, step = 0.01, onChange, onCommit, marks, format, left, right, disabled }) {
  return (
    <Box sx={{ opacity: disabled ? 0.5 : 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="baseline">
        <Typography variant="body2" fontWeight={600}>{label}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {format ? format(value) : value}
        </Typography>
      </Stack>
      <Slider size="small" value={value} min={min} max={max} step={step} marks={marks} disabled={disabled}
        onChange={(_, v) => onChange(v)} onChangeCommitted={() => onCommit?.()}
        sx={{ color: 'text.primary', py: 1.25, '& .MuiSlider-thumb': { width: 16, height: 16 } }} />
      {(left || right) && (
        <Stack direction="row" justifyContent="space-between" sx={{ mt: -0.75 }}>
          <Typography variant="caption" color="text.disabled">{left}</Typography>
          <Typography variant="caption" color="text.disabled">{right}</Typography>
        </Stack>
      )}
    </Box>
  );
}

const signed = (v, unit = '') => `${v > 0 ? '+' : ''}${Math.round(v * 100)}${unit}`;

function EngineStatus({ status, doc, hdBusy }) {
  if (!hdBusy && (doc?.hasCutout || doc?.cutoutError)) return null;
  const hd = hdBusy || status.quality === 'hd';
  if (status.stage === 'download' && status.total) {
    const pct = Math.round((status.loaded / status.total) * 100);
    return (
      <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'action.hover' }}>
        <Typography variant="body2" fontWeight={700}>{hd ? 'Getting HD edges ready' : 'Getting the studio ready'} ({pct} %)</Typography>
        <Typography variant="caption" color="text.secondary">
          First time only: {MB(status.loaded)} of {MB(status.total)} MB. Wi-Fi is best. Your photos stay on your device.
        </Typography>
        <LinearProgress variant="determinate" value={pct} sx={{ mt: 1, height: 6, borderRadius: 3 }} />
      </Box>
    );
  }
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'action.hover' }}>
      <CircularProgress size={18} />
      <Typography variant="body2">
        {status.stage === 'edges' ? 'Cleaning the edges…' : status.stage === 'starting' ? 'Starting the studio…'
          : hd ? 'Finding the finest edges…' : 'Removing the background…'}
        {status.device === 'CPU' && ' This device has no graphics acceleration, so it takes a little longer.'}
      </Typography>
    </Stack>
  );
}

function Checklist({ items }) {
  return (
    <Stack spacing={0.75}>
      {items.map((c) => (
        <Stack key={c.label} direction="row" spacing={1} alignItems="flex-start">
          {c.ok ? <CheckCircleIcon sx={{ fontSize: 18, color: 'success.main', mt: '1px' }} />
            : c.warn ? <InfoOutlinedIcon sx={{ fontSize: 18, color: 'warning.main', mt: '1px' }} />
              : <ErrorOutlineIcon sx={{ fontSize: 18, color: 'error.main', mt: '1px' }} />}
          <Typography variant="body2" sx={{ lineHeight: 1.45 }}>{c.label}</Typography>
        </Stack>
      ))}
    </Stack>
  );
}

// ── The studio ───────────────────────────────────────────────────────────────

export default function PhotoStudio({ items: initialItems, onDone, onClose, title = 'Photo studio' }) {
  const theme = useTheme();
  const phone = useMediaQuery(theme.breakpoints.down('md'));
  const items = useMemo(() => initialItems.map((it) => ({ ...it })), [initialItems]);
  const [index, setIndex] = useState(0);
  const [doc, setDoc] = useState(null);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);
  const [tab, setTab] = useState('background');
  const [comparing, setComparing] = useState(false);
  const [status, setStatus] = useState({ stage: 'idle' });
  const [brush, setBrush] = useState({ mode: 'remove', size: 40 });   // remove | keep (tap) · erase | restore (brush)
  const [selecting, setSelecting] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [saving, setSaving] = useState(false);
  const [applied, setApplied] = useState(false);
  const [hdBusy, setHdBusy] = useState(false);
  const results = useRef(new Array(items.length).fill(null));
  const canvasRef = useRef(null);
  const drag = useRef(null);
  const frame = useRef(0);
  const bump = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => subscribe(setStatus), []);
  useEffect(() => { warmUp(); }, []);

  // Open photo `index`; start on the next one in the background.
  useEffect(() => {
    let alive = true;
    setDoc(null); setError('');
    const item = items[index];
    const fail = (err) => { if (alive) setError(err?.message || 'This photo could not be opened.'); };
    // The photo appears at once; its cut-out follows when ready.
    open(item).then((d) => { if (alive) { setDoc(d); bump(); } }).catch(fail);
    prepare(item).then(() => {
      if (!alive) return;
      bump();
      // Then the next photo, while the seller works on this one.
      if (items[index + 1]) prepare(items[index + 1]).catch(() => {});
    }).catch(fail);
    return () => { alive = false; };
  }, [index, items, bump]);

  // Stop polling once the cut-out (or its failure) is in.
  const ready = !!doc && (doc.hasCutout || !!doc.cutoutError);

  // Draw (once per frame at most).
  const view = comparing ? 'original' : tab === 'touchup' && doc?.hasCutout && doc.params.removeBg ? 'touchup' : 'final';
  useEffect(() => {
    if (!doc || !canvasRef.current) return undefined;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      try { doc.render(canvasRef.current, { kind: 'preview', view }); } catch (e) { console.error(e); }
    });
    return () => cancelAnimationFrame(frame.current);
  }, [doc, version, view, ready]);

  const checks = useMemo(() => {
    if (!doc) return [];
    try { return doc.checks(); } catch { return []; }
  }, [doc, version, ready]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Changing settings, with undo ──
  const remember = useCallback(() => {
    if (!doc) return;
    doc.history.push(doc.snapshot());
    if (doc.history.length > 60) doc.history.shift();
    doc.future = [];
  }, [doc]);

  /** Live change (slider moving): remember the state before the first move only. */
  const live = useCallback((patch) => {
    if (!doc) return;
    if (!doc.pending) { doc.pending = doc.snapshot(); }
    Object.assign(doc.params, patch);
    bump();
  }, [doc, bump]);
  const commit = useCallback(() => {
    if (!doc?.pending) return;
    doc.history.push(doc.pending);
    doc.pending = null;
    doc.future = [];
  }, [doc]);
  const change = useCallback((patch) => { if (!doc) return; remember(); Object.assign(doc.params, patch); bump(); }, [doc, remember, bump]);

  const undo = useCallback(() => {
    if (!doc?.history.length) return;
    doc.future.push(doc.snapshot());
    doc.restore(doc.history.pop());
    bump();
  }, [doc, bump]);
  const redo = useCallback(() => {
    if (!doc?.future.length) return;
    doc.history.push(doc.snapshot());
    doc.restore(doc.future.pop());
    bump();
  }, [doc, bump]);

  useEffect(() => {
    const onKey = (e) => {
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'z') return;
      e.preventDefault();
      if (e.shiftKey) redo(); else undo();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo]);

  // ── Tap to select (hands, hanger, mannequin stand...) ──
  const tapTool = brush.mode === 'remove' || brush.mode === 'keep';
  const tapSelect = async ([x, y]) => {
    if (!doc || selecting) return;
    if (x < 0 || y < 0 || x >= doc.w || y >= doc.h) return;
    setSelecting(true); setError('');
    try {
      const { mask } = await selectObject(doc.key, doc.pixels, doc.w, doc.h, [[x, y, 1]]);
      remember();
      doc.addRegion(brush.mode, mask, { x, y });
      bump();
    } catch (err) {
      setError(err?.message || 'That could not be selected. Try tapping again, or use the brush.');
    } finally {
      setSelecting(false);
    }
  };
  // Get the photo ready for tapping as soon as Touch up opens.
  useEffect(() => {
    if (tab === 'touchup' && doc?.hasCutout && tapTool) prepareSelect(doc.key, doc.pixels, doc.w, doc.h).catch(() => {});
  }, [tab, doc, ready, tapTool]);

  // ── Pointer: move the photo (Frame) or paint (Touch up) ──
  const toCanvas = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return [((e.clientX - rect.left) / rect.width) * PREVIEW_SIZE, ((e.clientY - rect.top) / rect.height) * PREVIEW_SIZE, rect];
  };

  const onPointerDown = (e) => {
    if (!doc || comparing) return;
    const [x, y, rect] = toCanvas(e);
    e.currentTarget.setPointerCapture?.(e.pointerId);
    if (view === 'touchup') {
      const src = doc.toSource(x, y);
      if (!src) return;
      if (brush.mode === 'remove' || brush.mode === 'keep') { tapSelect(src); return; }
      remember();
      const size = doc.toSourceSize(brush.size);
      doc.strokes = [...doc.strokes, { mode: brush.mode, size, points: [src[0], src[1]] }];
      doc.strokeVersion = (doc.strokeVersion || 0) + 1;
      drag.current = { kind: 'paint' };
      bump();
    } else {
      // Remembered for undo only once the photo actually moves.
      drag.current = { kind: 'move', x: e.clientX, y: e.clientY, panX: doc.params.panX, panY: doc.params.panY, width: rect.width, snap: doc.snapshot() };
    }
  };

  const onPointerMove = (e) => {
    if (!doc) return;
    if (view === 'touchup' && !tapTool) {
      const rect = canvasRef.current.getBoundingClientRect();
      setCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top, d: (brush.size / PREVIEW_SIZE) * rect.width });
    }
    const d = drag.current;
    if (!d) return;
    if (d.kind === 'paint') {
      const [x, y] = toCanvas(e);
      const src = doc.toSource(x, y);
      const stroke = doc.strokes[doc.strokes.length - 1];
      if (!src || !stroke) return;
      const pts = stroke.points;
      const last = [pts[pts.length - 2], pts[pts.length - 1]];
      if (Math.hypot(src[0] - last[0], src[1] - last[1]) < stroke.size * 0.15) return;
      stroke.points = [...pts, src[0], src[1]];
      doc.strokeVersion += 1;
      bump();
    } else if (d.kind === 'move') {
      if (d.snap) { doc.history.push(d.snap); doc.future = []; d.snap = null; }
      doc.params.panX = Math.max(-0.5, Math.min(0.5, d.panX + (e.clientX - d.x) / d.width));
      doc.params.panY = Math.max(-0.5, Math.min(0.5, d.panY + (e.clientY - d.y) / d.width));
      bump();
    }
  };
  const onPointerUp = () => { drag.current = null; };

  const onWheel = (e) => {
    if (!doc || view === 'touchup') return;
    const p = doc.params;
    if (p.removeBg && doc.hasCutout) live({ fill: Math.max(0.5, Math.min(0.98, p.fill - e.deltaY * 0.0005)) });
    else live({ zoom: Math.max(1, Math.min(3, p.zoom - e.deltaY * 0.001)) });
    clearTimeout(drag.wheel);
    drag.wheel = setTimeout(commit, 300);
  };

  // ── Saving ──
  const goTo = (i) => { if (i >= 0 && i < items.length) setIndex(i); };

  const save = async () => {
    if (!doc || saving) return;
    setSaving(true);
    try {
      results.current[index] = await doc.export();
      if (index < items.length - 1) setIndex(index + 1);
      else onDone(results.current.slice());
    } catch (err) {
      setError(err?.message || 'The photo could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  /** Re-find the edges with the 1024 px model (GPU only). Settings and touch-ups are kept. */
  const hdEdges = async () => {
    if (!doc || hdBusy) return;
    setHdBusy(true); setError('');
    try {
      const cut = await removeBackground(doc.pixels, doc.w, doc.h, { quality: 'hd' });
      doc.setCutout(cut);
      doc.hd = true;
      bump();
    } catch (err) {
      setError(err?.message || 'HD edges could not be made.');
    } finally {
      setHdBusy(false);
    }
  };

  const applyToRest = async () => {
    if (!doc) return;
    const shared = Object.fromEntries(SHARED.map((k) => [k, doc.params[k]]));
    const auto = !!doc.autoOn;
    for (let i = index + 1; i < items.length; i += 1) {
      prepare(items[i]).then((d) => {
        Object.assign(d.params, shared, { removeBg: shared.removeBg && d.hasCutout });
        // Auto is worked out per photo (each has its own light); manual light is copied as is.
        if (auto) { Object.assign(d.params, autoParams(d)); d.autoOn = true; } else { d.params.wb = [...doc.params.wb]; d.autoOn = false; }
      }).catch(() => {});
    }
    setApplied(true);
  };

  const p = doc?.params || DEFAULTS;
  const cut = !!doc?.hasCutout && p.removeBg;
  const last = index === items.length - 1;

  // ── Panels ──
  const panels = {
    background: (
      <Stack spacing={2.25}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography fontWeight={700}>Remove background</Typography>
            <Typography variant="caption" color="text.secondary">
              {doc?.cutoutError ? doc.cutoutError : 'Done on your device with AI. Edges stay natural.'}
            </Typography>
          </Box>
          <Switch checked={cut} disabled={!doc?.hasCutout} onChange={(e) => change({ removeBg: e.target.checked })} />
        </Stack>
        {cut && status.hd && (
          <Button size="small" variant="outlined" disabled={hdBusy || doc?.hd} onClick={hdEdges}
            startIcon={hdBusy ? <CircularProgress size={14} /> : <AutoFixHighOutlinedIcon />}
            sx={{ alignSelf: 'flex-start', borderRadius: '10px', fontWeight: 700 }}>
            {doc?.hd ? 'HD edges ✓' : hdBusy ? 'Making HD edges…' : 'HD edges (hair, fur, lace)'}
          </Button>
        )}
        <Box sx={{ opacity: cut ? 1 : 0.5, pointerEvents: cut ? 'auto' : 'none' }}>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Background</Typography>
          <Stack direction="row" spacing={1}>
            {BACKGROUNDS.map((b) => (
              <Tooltip key={b.value} title={b.hint ? `${b.label} (${b.hint})` : b.label}>
                <Box component="button" type="button" aria-label={b.label} onClick={() => change({ background: b.value })}
                  sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: b.value, cursor: 'pointer',
                    border: '2px solid', borderColor: p.background === b.value ? 'text.primary' : 'divider' }} />
              </Tooltip>
            ))}
          </Stack>
          <Typography variant="body2" fontWeight={600} sx={{ mt: 2, mb: 1 }}>Shadow</Typography>
          <ToggleButtonGroup exclusive size="small" fullWidth value={p.shadow} onChange={(_, v) => v && change({ shadow: v })}>
            <ToggleButton value="none">None</ToggleButton>
            <ToggleButton value="floor">On a surface</ToggleButton>
            <ToggleButton value="soft">Soft</ToggleButton>
          </ToggleButtonGroup>
          <Box sx={{ mt: 2 }}>
            <Control label="Edge position" value={p.edgeShift} min={-4} max={4} step={1} onChange={(v) => live({ edgeShift: v })} onCommit={commit}
              format={(v) => (v === 0 ? 'As found' : `${v > 0 ? '+' : ''}${v} px`)} left="Tighter" right="Looser" />
            <Control label="Edge softness" value={p.edgeSoft} min={0} max={6} step={1} onChange={(v) => live({ edgeSoft: v })} onCommit={commit}
              format={(v) => `${v} px`} left="Crisp" right="Soft" />
          </Box>
        </Box>
      </Stack>
    ),
    frame: (
      <Stack spacing={2}>
        {cut ? (
          <Control label="Product size" value={p.fill} min={0.5} max={0.98} step={0.01} onChange={(v) => live({ fill: v })} onCommit={commit}
            format={(v) => `${Math.round(v * 100)} %`} left="Smaller" right="Bigger" />
        ) : (
          <Control label="Zoom" value={p.zoom} min={1} max={3} step={0.01} onChange={(v) => live({ zoom: v })} onCommit={commit}
            format={(v) => `${v.toFixed(2)}×`} />
        )}
        {cut && (
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="body2" fontWeight={600}>Cut-off edges against the frame</Typography>
              <Typography variant="caption" color="text.secondary">When the product runs off the photo, it sits against that edge.</Typography>
            </Box>
            <Switch checked={!!p.anchor} onChange={(e) => change({ anchor: e.target.checked })} />
          </Stack>
        )}
        <Control label="Straighten" value={p.straighten} min={-15} max={15} step={0.5} onChange={(v) => live({ straighten: v })} onCommit={commit}
          format={(v) => `${v > 0 ? '+' : ''}${v}°`} />
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
          <Button size="small" variant="outlined" startIcon={<RotateLeftIcon />} onClick={() => change({ quarter: p.quarter - 1 })}>Left</Button>
          <Button size="small" variant="outlined" startIcon={<RotateRightIcon />} onClick={() => change({ quarter: p.quarter + 1 })}>Right</Button>
          <Button size="small" variant="outlined" startIcon={<FlipIcon />} onClick={() => change({ flip: !p.flip })}>Mirror</Button>
          <Button size="small" variant="outlined" startIcon={<CenterFocusStrongOutlinedIcon />}
            onClick={() => change({ panX: 0, panY: 0, zoom: 1, straighten: 0, ...(cut ? { fill: DEFAULTS.fill } : {}) })}>Centre</Button>
        </Stack>
        <Typography variant="caption" color="text.secondary">Drag the photo to move it{phone ? '' : '; scroll to resize'}. Most marketplaces like the product filling about 85 % of the square.</Typography>
      </Stack>
    ),
    light: (
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1}>
          <Button size="small" variant={doc?.autoOn ? 'contained' : 'outlined'} disableElevation startIcon={<AutoFixHighOutlinedIcon />}
            disabled={!doc?.auto && !doc}
            onClick={() => {
              if (!doc) return;
              remember();
              const a = doc.auto || {};
              Object.assign(doc.params, { exposure: a.exposure || 0, contrast: a.contrast || 0, sharpness: a.sharpness || 0, wb: a.wb || [1, 1, 1], warmth: 0, saturation: 0 });
              doc.autoOn = true; bump();
            }}
            sx={{ borderRadius: '10px', ...(doc?.autoOn && { bgcolor: 'text.primary', color: 'background.paper' }) }}>
            Auto
          </Button>
          <Button size="small" onClick={() => { if (!doc) return; change({ exposure: 0, contrast: 0, warmth: 0, saturation: 0, sharpness: 0, wb: [1, 1, 1] }); doc.autoOn = false; }}>
            Reset
          </Button>
        </Stack>
        {[
          ['exposure', 'Brightness', -1, 1, (v) => `${v > 0 ? '+' : ''}${v.toFixed(2)} EV`],
          ['contrast', 'Contrast', -1, 1, signed],
          ['warmth', 'Warmth', -1, 1, signed, 'Cooler', 'Warmer'],
          ['saturation', 'Colour', -1, 1, signed, 'Softer', 'Richer'],
          ['sharpness', 'Sharpness', 0, 1, (v) => `${Math.round(v * 100)}`],
        ].map(([key, label, min, max, format, left, right]) => (
          <Control key={key} label={label} value={p[key]} min={min} max={max} step={0.01} format={format} left={left} right={right}
            onChange={(v) => { if (doc) doc.autoOn = false; live({ [key]: v }); }} onCommit={commit} />
        ))}
        <Typography variant="caption" color="text.secondary">
          Keep colours true to the real product: shoppers return items that look different from the photo.
        </Typography>
      </Stack>
    ),
    touchup: (
      <Stack spacing={2}>
        {!cut ? (
          <Alert severity="info" sx={{ borderRadius: '10px' }}>Turn on Remove background to touch up the cut-out.</Alert>
        ) : (
          <>
            <Box>
              <Typography variant="body2" fontWeight={700} sx={{ mb: 0.75 }}>Tap an object</Typography>
              <ToggleButtonGroup exclusive size="small" fullWidth value={tapTool ? brush.mode : null} onChange={(_, v) => v && setBrush((b) => ({ ...b, mode: v }))}>
                <ToggleButton value="remove">Tap to remove</ToggleButton>
                <ToggleButton value="keep">Tap to keep</ToggleButton>
              </ToggleButtonGroup>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                {selecting ? 'Finding it…' : 'Tap the hands, the hanger, a mannequin\'s head or stand, or anything else that isn\'t the product. Tap to keep brings back a part that was left out.'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" fontWeight={700} sx={{ mb: 0.75 }}>Brush, for fine edges</Typography>
              <ToggleButtonGroup exclusive size="small" fullWidth value={tapTool ? null : brush.mode} onChange={(_, v) => v && setBrush((b) => ({ ...b, mode: v }))}>
                <ToggleButton value="erase">Erase</ToggleButton>
                <ToggleButton value="restore">Restore</ToggleButton>
              </ToggleButtonGroup>
              {!tapTool && (
                <Control label="Brush size" value={brush.size} min={8} max={160} step={1} onChange={(v) => setBrush((b) => ({ ...b, size: v }))}
                  format={(v) => `${v}`} />
              )}
            </Box>
            <Typography variant="caption" color="text.secondary">
              Pink shows what is removed. Undo any step with the arrow at the top.
            </Typography>
            <Button size="small" disabled={!doc?.strokes.length && !doc?.regions.length}
              onClick={() => { remember(); doc.strokes = []; doc.regions = []; doc.strokeVersion += 1; bump(); }}>
              Clear touch-ups
            </Button>
          </>
        )}
      </Stack>
    ),
  };

  return (
    <Dialog open fullScreen={phone} maxWidth={false} onClose={saving ? undefined : onClose}
      PaperProps={{ sx: { width: { md: 'min(1180px, 96vw)' }, height: { md: 'min(820px, 94vh)' }, borderRadius: { md: '18px' }, overflow: 'hidden' } }}>
      {/* Top bar */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ px: { xs: 1, md: 2 }, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
        <IconButton aria-label="Close" onClick={onClose} disabled={saving}><CloseIcon /></IconButton>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography fontWeight={800} noWrap>{title}</Typography>
          {items.length > 1 && <Typography variant="caption" color="text.secondary">Photo {index + 1} of {items.length}</Typography>}
        </Box>
        <Tooltip title="Undo (Ctrl+Z)"><span><IconButton aria-label="Undo" onClick={undo} disabled={!doc?.history.length}><UndoIcon /></IconButton></span></Tooltip>
        <Tooltip title="Redo (Ctrl+Shift+Z)"><span><IconButton aria-label="Redo" onClick={redo} disabled={!doc?.future.length}><RedoIcon /></IconButton></span></Tooltip>
        <Tooltip title="Hold to see the original">
          <span>
            <IconButton aria-label="Hold to compare with the original" disabled={!doc}
              onPointerDown={() => setComparing(true)} onPointerUp={() => setComparing(false)} onPointerLeave={() => setComparing(false)}
              onKeyDown={(e) => e.key === ' ' && setComparing(true)} onKeyUp={() => setComparing(false)}>
              <CompareIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Button variant="contained" disableElevation onClick={save} disabled={!ready || saving || hdBusy}
          sx={{ fontWeight: 700, borderRadius: '10px', bgcolor: 'text.primary', color: 'background.paper', '&:hover': { bgcolor: 'text.secondary' }, whiteSpace: 'nowrap' }}>
          {saving ? 'Saving…' : !last ? 'Save & next' : items.length > 1 ? 'Done' : 'Use photo'}
        </Button>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 360px' }, gridTemplateRows: { xs: 'auto minmax(0, 1fr)', md: '1fr' },
        height: { xs: 'calc(100% - 57px)', md: 'calc(100% - 57px)' }, minHeight: 0 }}>
        {/* Photo */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: { xs: 1.5, md: 3 }, minHeight: 0,
          bgcolor: 'action.hover', backgroundImage: 'radial-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)', backgroundSize: '14px 14px' }}>
          <Box sx={{ position: 'relative', width: { xs: 'min(100%, 46vh)', md: 'min(100%, calc(94vh - 200px), 640px)' }, aspectRatio: '1',
            boxShadow: '0 10px 40px rgba(0,0,0,0.12)', borderRadius: '6px', overflow: 'hidden', bgcolor: '#fff', touchAction: 'none',
            cursor: view === 'touchup' ? (tapTool ? (selecting ? 'progress' : 'crosshair') : 'none') : doc ? 'grab' : 'default' }}
            onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
            onPointerLeave={() => setCursor(null)} onWheel={onWheel}>
            <canvas ref={canvasRef} width={PREVIEW_SIZE} height={PREVIEW_SIZE} style={{ width: '100%', height: '100%', display: 'block' }} aria-label="Photo being edited" />
            {!doc && !error && (
              <Stack alignItems="center" justifyContent="center" sx={{ position: 'absolute', inset: 0 }}><CircularProgress /></Stack>
            )}
            {comparing && <Chip label="Original" size="small" sx={{ position: 'absolute', top: 10, left: 10, bgcolor: 'rgba(0,0,0,0.65)', color: '#fff' }} />}
            {cursor && view === 'touchup' && !tapTool && (
              <Box sx={{ position: 'absolute', left: cursor.x - cursor.d / 2, top: cursor.y - cursor.d / 2, width: cursor.d, height: cursor.d,
                borderRadius: '50%', border: '2px solid #fff', boxShadow: '0 0 0 1px rgba(0,0,0,0.6)', pointerEvents: 'none' }} />
            )}
          </Box>
          {items.length > 1 && (
            <Stack direction="row" spacing={1} sx={{ mt: 1.5, overflowX: 'auto', maxWidth: '100%', pb: 0.5 }}>
              {items.map((it, i) => (
                <Chip key={i} size="small" label={`${i + 1}${results.current[i] ? ' ✓' : ''}`} onClick={() => goTo(i)}
                  variant={i === index ? 'filled' : 'outlined'} sx={{ fontWeight: 700 }} />
              ))}
            </Stack>
          )}
        </Box>

        {/* Controls */}
        <Box sx={{ borderLeft: { md: '1px solid' }, borderTop: { xs: '1px solid', md: 0 }, borderColor: 'divider', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth" sx={{ minHeight: 44, '& .MuiTab-root': { minHeight: 44, fontWeight: 700, textTransform: 'none', px: 0.5, minWidth: 0 } }}>
            <Tab value="background" label="Background" />
            <Tab value="frame" label="Frame" />
            <Tab value="light" label="Light" />
            <Tab value="touchup" label="Touch up" />
          </Tabs>
          <Divider />
          <Box sx={{ p: 2, overflowY: 'auto', flex: 1, minHeight: 0 }}>
            <Stack spacing={2}>
              {error && <Alert severity="error" sx={{ borderRadius: '10px' }}>{error}</Alert>}
              <EngineStatus status={status} doc={doc} hdBusy={hdBusy} />
              {panels[tab]}
              {doc && (
                <>
                  <Divider />
                  <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary' }}>Photo check</Typography>
                  <Checklist items={checks} />
                </>
              )}
              {items.length > 1 && index < items.length - 1 && doc && (
                <Button size="small" variant="outlined" onClick={applyToRest} sx={{ borderRadius: '10px' }}>
                  {applied ? 'Settings copied ✓ (copy again)' : `Use these settings for the next ${items.length - 1 - index} photo${items.length - 1 - index === 1 ? '' : 's'}`}
                </Button>
              )}
              {items.length > 1 && (
                <Button size="small" color="inherit" onClick={() => { results.current[index] = null; if (last) onDone(results.current.slice()); else setIndex(index + 1); }}>
                  Skip this photo (keep it as it is)
                </Button>
              )}
            </Stack>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
}
