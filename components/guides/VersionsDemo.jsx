'use client';

/**
 * A small working copy of the product page's choice rows, for the selling
 * guide: tap a flavour and watch the packs change. Same rules as the real page
 * (backend product/variations.py selector): rows cascade, switching keeps the
 * shopper's other choices where that version exists.
 */

import { useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';

const VERSIONS = [
  { flavour: 'Original', pack: '12 pack', price: 20, stock: 14 },
  { flavour: 'Barbecue', pack: '12 pack', price: 21, stock: 9 },
  { flavour: 'Barbecue', pack: '24 pack', price: 38, stock: 0 },
  { flavour: 'Sour Cream & Onion', pack: '24 pack', price: 39, stock: 6 },
];
const FLAVOURS = [...new Set(VERSIONS.map((v) => v.flavour))];

function Choice({ label, sub, selected, soldOut, onClick }) {
  return (
    <Box component="button" type="button" onClick={onClick} aria-pressed={selected}
      sx={{ minWidth: 64, minHeight: 40, px: 1.75, py: 0.75, borderRadius: '8px', cursor: 'pointer', font: 'inherit', fontSize: 13.5,
        fontWeight: selected ? 800 : 600, textAlign: 'center',
        border: selected ? '2px solid #212121' : '1.5px solid #E0E0E0', bgcolor: selected ? '#212121' : '#fff',
        color: selected ? '#fff' : soldOut ? '#9E9E9E' : '#212121', '&:hover': { borderColor: '#212121' } }}>
      <span style={{ display: 'block' }}>{label}</span>
      {sub && <span style={{ display: 'block', fontSize: 12, fontWeight: 600, marginTop: 2, color: selected ? 'rgba(255,255,255,.85)' : soldOut ? '#B71C1C' : '#565959' }}>{sub}</span>}
    </Box>
  );
}

export default function VersionsDemo() {
  const [current, setCurrent] = useState(VERSIONS[0]);
  const packs = VERSIONS.filter((v) => v.flavour === current.flavour);

  const pickFlavour = (flavour) => {
    const options = VERSIONS.filter((v) => v.flavour === flavour);
    // Keep the pack if this flavour has it, otherwise the first in stock.
    setCurrent(options.find((v) => v.pack === current.pack) || options.find((v) => v.stock > 0) || options[0]);
  };
  const lowest = (flavour) => Math.min(...VERSIONS.filter((v) => v.flavour === flavour).map((v) => v.price));
  const varies = (flavour) => new Set(VERSIONS.filter((v) => v.flavour === flavour).map((v) => v.price)).size > 1;

  return (
    <Box sx={{ p: { xs: 2, sm: 2.5 }, mb: 2, borderRadius: '16px', border: '1px solid', borderColor: 'divider', bgcolor: '#fff', color: '#111' }}>
      <Typography variant="caption" sx={{ color: '#565959', fontWeight: 700, letterSpacing: 0.5 }}>TRY IT · WHAT SHOPPERS SEE</Typography>
      <Typography sx={{ fontWeight: 700, fontSize: 17, mt: 0.5 }}>Potato Crisps</Typography>
      <Typography sx={{ fontSize: 22, fontWeight: 800, mb: 2 }}>
        ₵{current.price.toFixed(2)}{' '}
        <Typography component="span" sx={{ fontSize: 13, fontWeight: 700, color: current.stock ? '#2E7D32' : '#B71C1C' }}>
          {current.stock ? 'In stock' : 'Out of stock'}
        </Typography>
      </Typography>

      <Typography sx={{ fontSize: 13, color: '#565959', mb: 1 }}>Flavour: <b style={{ color: '#111' }}>{current.flavour}</b></Typography>
      <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', mb: 2 }}>
        {FLAVOURS.map((f) => (
          <Choice key={f} label={f} selected={f === current.flavour} onClick={() => pickFlavour(f)}
            sub={`${varies(f) ? 'from ' : ''}₵${lowest(f).toFixed(2)}`} />
        ))}
      </Stack>

      <Typography sx={{ fontSize: 13, color: '#565959', mb: 1 }}>Pack size: <b style={{ color: '#111' }}>{current.pack}</b></Typography>
      <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
        {packs.map((v) => (
          <Choice key={v.pack} label={v.pack} selected={v === current} soldOut={!v.stock} onClick={() => setCurrent(v)}
            sub={packs.length > 1 ? (v.stock ? `₵${v.price.toFixed(2)}` : 'Out of stock') : null} />
        ))}
      </Stack>
      <Typography variant="caption" sx={{ display: 'block', mt: 2, color: '#565959' }}>
        Tap the flavours: the pack row only shows the packs that flavour comes in.
      </Typography>
    </Box>
  );
}
