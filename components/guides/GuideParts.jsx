'use client';

/** Building blocks shared by the seller guides (selling guide, bulk upload guide). */

import Link from 'next/link';
import {
  Accordion, AccordionDetails, AccordionSummary, Box, Chip, Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

export const GuidePage = ({ children }) => (
  // minmax(0, 1fr): wide tables scroll inside their box instead of widening the page on phones.
  <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', width: '100%', maxWidth: 860, mx: 'auto', px: { xs: 0, md: 2 }, py: { xs: 1, md: 3 } }}>
    {children}
  </Box>
);

export const Title = ({ children }) => (
  <Typography component="h1" sx={{ fontFamily: 'var(--font-figtree), system-ui, sans-serif', fontSize: { xs: 32, md: 42 }, fontWeight: 700,
    letterSpacing: '-1px', lineHeight: 1.1, mb: 1 }}>{children}</Typography>
);

export const H = ({ children, id }) => (
  <Typography id={id} component="h2" sx={{ fontFamily: 'var(--font-figtree), system-ui, sans-serif', fontSize: { xs: 22, md: 26 }, fontWeight: 700,
    letterSpacing: '-0.4px', mt: 5, mb: 1.5, scrollMarginTop: 80 }}>{children}</Typography>
);

export const H3 = ({ children, id }) => (
  <Typography id={id} component="h3" sx={{ fontWeight: 700, fontSize: 17, mt: 3, mb: 1, scrollMarginTop: 80 }}>{children}</Typography>
);

export const P = ({ children }) => <Typography variant="body1" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.75 }}>{children}</Typography>;

export const A = ({ href, children }) => (
  <Box component={Link} href={href} sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>{children}</Box>
);

export function Jump({ items }) {
  return (
    <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', mb: 1 }}>
      {items.map(([id, label]) => (
        <Chip key={id} label={label} component="a" href={`#${id}`} clickable variant="outlined" sx={{ borderRadius: '10px', fontWeight: 600 }} />
      ))}
    </Stack>
  );
}

/** Numbered steps: [title, text] pairs (text may be JSX). */
export function Steps({ items }) {
  return (
    <Stack spacing={1.5} sx={{ mb: 2 }}>
      {items.map(([title, text], i) => (
        <Stack key={title} direction="row" spacing={1.5}>
          <Box sx={{ width: 28, height: 28, borderRadius: '9px', bgcolor: 'text.primary', color: 'background.paper', fontWeight: 800, fontSize: 13,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
            <Typography variant="body2" color="text.secondary" component="div" sx={{ lineHeight: 1.7 }}>{text}</Typography>
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}

/** Do / don't list: [ok, text] pairs. */
export function Rules({ items }) {
  return (
    <Stack spacing={1} sx={{ mb: 2 }}>
      {items.map(([ok, text], i) => (
        <Stack key={i} direction="row" spacing={1} alignItems="flex-start">
          {ok ? <CheckCircleOutlineIcon sx={{ color: 'success.main', fontSize: 20, mt: 0.2 }} /> : <HighlightOffIcon sx={{ color: 'error.main', fontSize: 20, mt: 0.2 }} />}
          <Typography variant="body2" component="div" sx={{ lineHeight: 1.7 }}>{text}</Typography>
        </Stack>
      ))}
    </Stack>
  );
}

/** A small spreadsheet-looking table. */
export function Sheet({ headers, rows, mono = true }) {
  return (
    <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px', mb: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow>{headers.map((h) => (
            <TableCell key={h} sx={{ fontFamily: mono ? 'ui-monospace, monospace' : 'inherit', fontSize: mono ? 12 : 13, fontWeight: 700, whiteSpace: 'nowrap', bgcolor: 'action.hover' }}>{h}</TableCell>
          ))}</TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={i}>{r.map((c, j) => (
              <TableCell key={j} sx={{ fontSize: 13, whiteSpace: mono ? 'nowrap' : 'normal', verticalAlign: 'top', color: c ? 'text.primary' : 'text.disabled' }}>{c || '(empty)'}</TableCell>
            ))}</TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function Callout({ title, children, tone = 'info' }) {
  const colors = { info: ['rgba(25,118,210,0.06)', 'rgba(25,118,210,0.25)'], tip: ['rgba(245,158,11,0.08)', 'rgba(245,158,11,0.35)'] }[tone];
  return (
    <Box sx={{ p: 2, mb: 2, borderRadius: '12px', bgcolor: colors[0], border: '1px solid', borderColor: colors[1] }}>
      {title && <Typography sx={{ fontWeight: 700, mb: 0.5 }}>{title}</Typography>}
      <Typography variant="body2" component="div" sx={{ lineHeight: 1.7 }}>{children}</Typography>
    </Box>
  );
}

export function Faq({ items }) {
  return items.map(([q, a]) => (
    <Accordion key={q} disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px !important', mb: 1, '&:before': { display: 'none' } }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography sx={{ fontWeight: 600 }}>{q}</Typography></AccordionSummary>
      <AccordionDetails><Typography variant="body2" color="text.secondary" component="div" sx={{ lineHeight: 1.75 }}>{a}</Typography></AccordionDetails>
    </Accordion>
  ));
}
