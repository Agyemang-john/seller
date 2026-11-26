'use client';

/** Seller guide to the Photo studio (components/studio). Keep labels in sync with PhotoStudio.jsx. */

import Link from 'next/link';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Stack, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

const H = ({ children, id }) => (
  <Typography id={id} component="h2" sx={{ fontFamily: 'var(--font-figtree), system-ui, sans-serif', fontSize: { xs: 22, md: 26 }, fontWeight: 700,
    letterSpacing: '-0.4px', mt: 5, mb: 1.5, scrollMarginTop: 80 }}>{children}</Typography>
);
const P = ({ children }) => <Typography color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.75 }}>{children}</Typography>;

function Rules({ items }) {
  return (
    <Stack spacing={1} sx={{ mb: 2 }}>
      {items.map(([ok, text]) => (
        <Stack key={text} direction="row" spacing={1} alignItems="flex-start">
          {ok ? <CheckCircleOutlineIcon sx={{ color: 'success.main', fontSize: 20, mt: 0.2 }} /> : <HighlightOffIcon sx={{ color: 'error.main', fontSize: 20, mt: 0.2 }} />}
          <Typography variant="body2" sx={{ lineHeight: 1.7 }}>{text}</Typography>
        </Stack>
      ))}
    </Stack>
  );
}

function Tool({ name, items }) {
  return (
    <Box sx={{ p: 2.5, borderRadius: '14px', border: '1px solid', borderColor: 'divider', mb: 1.5 }}>
      <Typography fontWeight={800} sx={{ mb: 1 }}>{name}</Typography>
      <Stack spacing={0.75}>
        {items.map(([label, text]) => (
          <Typography key={label} variant="body2" sx={{ lineHeight: 1.65 }}><strong>{label}</strong>: {text}</Typography>
        ))}
      </Stack>
    </Box>
  );
}

const FAQ = [
  ['Is it free?', 'Yes, on every plan. The studio runs on your own phone or computer, so there is nothing to pay and no limit.'],
  ['Are my photos uploaded?', 'Not by the studio. Photos are only uploaded when you save a product, the same as before.'],
  ['The first time it says "Getting the studio ready".', 'The studio downloads its background-removal model once (about 100 MB) and keeps it in your browser. Use Wi-Fi for that first time; after that it starts in seconds, even offline.'],
  ['How long does a photo take?', 'From under a second to about 6 seconds with graphics acceleration (most recent phones and computers), 10 to 20 seconds without. While you work on one photo, the next one is already being prepared. Framing and light changes are instant.'],
  ['What is "HD edges"?', 'On devices with graphics acceleration, HD edges finds the outline again at twice the detail: worth it for hair, fur, lace, mesh or a see-through bottle. It downloads once (about 115 MB) the first time you use it, then takes a few seconds per photo.'],
  ['Part of my product was removed (or some background was left).', 'Open Touch up. Pink shows what was removed. Choose Restore and paint over the missing part, or Erase and paint over what is left of the background. Undo with Ctrl+Z.'],
  ['The edges look too sharp or show a thin line of the old background.', 'In Background, move Edge position a step towards Tighter, or raise Edge softness by 1 or 2.'],
  ['Can I keep my own background?', 'Yes: turn off Remove background. The studio then crops, straightens and corrects the light only. The background must still be plain and light to be accepted.'],
  ['My photo was refused when adding a product.', 'When a photo doesn\'t pass the checks (background, size), the product form offers "Fix in Photo studio". The studio\'s photos always pass.'],
];

export default function PhotoStudioGuidePage() {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', width: '100%', maxWidth: 860, mx: 'auto', px: { xs: 0, md: 2 }, py: { xs: 1, md: 3 } }}>
      <Button component={Link} href="/products/photo-studio" startIcon={<ArrowBackIcon />} sx={{ justifySelf: 'start', mb: 2, color: 'text.secondary', borderRadius: '8px', fontWeight: 600 }}>
        Back to the Photo studio
      </Button>
      <Typography component="h1" sx={{ fontFamily: 'var(--font-figtree), system-ui, sans-serif', fontSize: { xs: 32, md: 42 }, fontWeight: 700, letterSpacing: '-1px', lineHeight: 1.1, mb: 1 }}>
        Great product photos with the Photo studio
      </Typography>
      <P>The Photo studio turns a photo taken on your phone into a clean product photo: the background removed, the product centred on white and the light corrected, while it still looks like a real photo. It runs on your device and is free.</P>

      <H id="where">Where to find it</H>
      <Rules items={[
        [true, 'Catalog › Photo studio: fix many photos at once, then download them or create a product with them.'],
        [true, 'On the product form and in Bulk upload: the ✨ button on any photo opens it in the studio. "Edit in Photo studio" on the main photo, or "All photos" to do them in one go.'],
        [true, 'When a photo is refused (background not plain, wrong size), choose "Fix in Photo studio".'],
      ]} />

      <H id="take">1. Take a good photo first</H>
      <P>The studio can clean up a photo, but the photo itself matters most.</P>
      <Rules items={[
        [true, 'Daylight from a window, or a bright room. No flash straight at the product.'],
        [true, 'The whole product in the picture, with a little space around it. A plain wall or sheet behind helps the studio find the edges.'],
        [true, 'Hold the phone steady and tap the screen on the product to focus.'],
        [false, 'Don\'t cut off part of the product: the studio can\'t invent what isn\'t in the photo.'],
        [false, 'Avoid busy backgrounds the same colour as the product (a black bag on a black sofa).'],
      ]} />

      <H id="edit">2. Edit in the studio</H>
      <P>When a photo opens, the background is removed and Auto light is applied. Most photos are ready at once; check the &ldquo;Photo check&rdquo; list on the right.</P>
      <Tool name="Background" items={[
        ['Remove background', 'on by default. Turn it off to keep your own (plain, light) background'],
        ['HD edges', 'finer outline for hair, fur, lace or glass (devices with graphics acceleration)'],
        ['Background', 'White is best for listings. Soft grey or Warm for a gentler look'],
        ['Shadow', '"On a surface" adds a soft shadow under the product so it doesn\'t look like it\'s floating; "Soft" a light shadow all around'],
        ['Edge position and softness', 'fine-tune the cut-out edge'],
      ]} />
      <Tool name="Frame" items={[
        ['Product size', 'how much of the square the product fills (about 85 % is ideal)'],
        ['Move', 'drag the photo. On a computer, scroll to resize'],
        ['Left / Right, Straighten, Mirror', 'turn the photo, fix a tilted shot, flip it'],
        ['Centre', 'back to the automatic framing'],
      ]} />
      <Tool name="Light" items={[
        ['Auto', 'evens out light and colour gently (on by default)'],
        ['Brightness, Contrast, Warmth, Colour, Sharpness', 'small corrections. Ranges are kept natural on purpose: the photo must show the real product'],
      ]} />
      <Tool name="Touch up" items={[
        ['Erase / Restore', 'paint over the photo to remove leftover background or bring back part of the product. Pink = removed'],
        ['Brush size', 'smaller for fine edges'],
      ]} />
      <Rules items={[
        [true, 'Hold the compare button (top bar) to see the original.'],
        [true, 'Undo and Redo everything (Ctrl+Z / Ctrl+Shift+Z).'],
        [true, 'Several photos: "Save & next" goes through them one by one, and "Use these settings for the next photos" keeps them consistent.'],
      ]} />

      <H id="result">3. What you get</H>
      <P>Each photo is saved as a 1600 × 1600 px JPEG under 2 MB, product centred on a plain background: exactly what Negromart listings need, and it always passes the photo checks.</P>
      <Rules items={[
        [true, 'Keep colours true to the product. Over-bright or recoloured photos lead to returns.'],
        [false, 'Don\'t add text, logos, watermarks or borders: they aren\'t allowed on product photos.'],
      ]} />

      <H id="faq">Questions</H>
      {FAQ.map(([q, a]) => (
        <Accordion key={q} disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px !important', mb: 1, '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography sx={{ fontWeight: 600 }}>{q}</Typography></AccordionSummary>
          <AccordionDetails><Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75 }}>{a}</Typography></AccordionDetails>
        </Accordion>
      ))}

      <Box sx={{ mt: 4, p: 3, borderRadius: '16px', bgcolor: 'action.hover', textAlign: 'center' }}>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>Ready?</Typography>
        <Button component={Link} href="/products/photo-studio" variant="contained" disableElevation
          sx={{ bgcolor: 'text.primary', color: 'background.paper', borderRadius: '10px', fontWeight: 700 }}>Open the Photo studio</Button>
      </Box>
    </Box>
  );
}
