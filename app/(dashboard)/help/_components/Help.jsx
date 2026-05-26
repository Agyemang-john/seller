'use client';

import React, { useState } from 'react';
import {
  Box, Typography, Stack, Card, CardActionArea, CardContent,
  Accordion, AccordionSummary, AccordionDetails,
  TextField, InputAdornment, Divider, Chip, Grid,
  List, ListItem, ListItemIcon, ListItemText, Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';

// ── colour tokens ─────────────────────────────────────────────────────────────
const navy  = '#041f41';
const blue  = '#0071ce';
const gold  = '#ffc220';
const light = '#edf2f7';
const mid   = '#4a4a4a';

// ── social links ──────────────────────────────────────────────────────────────
const SOCIALS = [
  {
    label: 'Instagram', color: '#E1306C',
    href: 'https://www.instagram.com/negromart.llc/',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm0 2h10c1.654 0 3 1.346 3 3v10c0 1.654-1.346 3-3 3H7c-1.654 0-3-1.346-3-3V7c0-1.654 1.346-3 3-3zm10.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/></svg>,
  },
  {
    label: 'YouTube', color: '#FF0000',
    href: 'https://www.youtube.com/@NEGROMART',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon fill="#fff" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>,
  },
  {
    label: 'X / Twitter', color: '#000000',
    href: 'https://x.com/Negromart_',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  },
  {
    label: 'Facebook', color: '#1877F2',
    href: 'https://www.facebook.com/profile.php?id=61583673413615',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
  },
  {
    label: 'Pinterest', color: '#E60023',
    href: 'https://www.pinterest.com/negromartt/',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.084 2.438 7.596 5.938 9.156-.082-.777-.156-1.969.031-2.813.172-.75 1.11-4.781 1.11-4.781s-.282-.563-.282-1.406c0-1.313.766-2.297 1.719-2.297.812 0 1.203.609 1.203 1.344 0 .828-.531 2.063-.797 3.203-.234.953.484 1.734 1.422 1.734 1.703 0 3.016-1.797 3.016-4.391 0-2.297-1.641-3.906-4-3.906-2.719 0-4.313 2.047-4.313 4.156 0 .828.313 1.703.719 2.188a.29.29 0 0 1 .063.281c-.078.313-.25.953-.281 1.094-.047.172-.156.219-.344.125-1.281-.594-2.078-2.438-2.078-3.922 0-3.188 2.313-6.109 6.672-6.109 3.5 0 6.219 2.5 6.219 5.844 0 3.484-2.203 6.297-5.25 6.297-1.031 0-2-.531-2.328-1.141l-.641 2.438c-.234.891-.859 2-1.281 2.672.969.297 2 .453 3.078.453 5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>,
  },
];

// ── topic card data ───────────────────────────────────────────────────────────
const TOPICS = [
  { icon: <AddBoxOutlinedIcon sx={{ fontSize: 28, color: blue }} />, label: 'Listing Products',      anchor: 'listing' },
  { icon: <EditOutlinedIcon   sx={{ fontSize: 28, color: blue }} />, label: 'Editing & Managing',    anchor: 'editing' },
  { icon: <ImageOutlinedIcon  sx={{ fontSize: 28, color: blue }} />, label: 'Images & Media',        anchor: 'images'  },
  { icon: <CategoryOutlinedIcon sx={{ fontSize: 28, color: blue }} />, label: 'Variants & Options', anchor: 'variants' },
  { icon: <LocalShippingOutlinedIcon sx={{ fontSize: 28, color: blue }} />, label: 'Delivery & Shipping', anchor: 'delivery' },
  { icon: <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 28, color: blue }} />, label: 'Payments & Payouts', anchor: 'payments' },
  { icon: <BarChartOutlinedIcon sx={{ fontSize: 28, color: blue }} />, label: 'Analytics & Growth',  anchor: 'analytics' },
  { icon: <SecurityOutlinedIcon sx={{ fontSize: 28, color: blue }} />, label: 'Account & Security',  anchor: 'security' },
];

// ── accordion sections ────────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: 'listing',
    icon: <AddBoxOutlinedIcon />,
    title: 'Listing Products',
    badge: 'Getting Started',
    items: [
      {
        q: 'How do I create a new product listing?',
        a: (
          <Stack spacing={1.5}>
            <Typography variant="body2" color="text.secondary">
              Go to <strong>Products → Add Product</strong> in the left sidebar. The form is split into four tabs: General, Images, Variants, and Delivery.
            </Typography>
            <StepList steps={[
              'Enter a clear, concise product title in Title Case (e.g. "Sony WH-1000XM4 Wireless Headphones").',
              'Select the correct sub-category so buyers can find your product easily.',
              'Choose a brand, product type (New / Used / Refurbished / Book / Grocery), and variant style.',
              'Set your price, optional old price (must be higher to show a discount), and total available quantity.',
              'Add regions where you will ship the item.',
              'Fill in the Description, Features, and Specifications using the rich-text editor.',
              'Upload your main image and save.',
            ]} />
          </Stack>
        ),
      },
      {
        q: 'What makes a good product title?',
        a: (
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">A strong title follows this pattern: <strong>Brand + Product Name + Key Features</strong></Typography>
            <RuleList rules={[
              { ok: true,  text: 'Use Title Case — capitalise the first letter of each major word.' },
              { ok: true,  text: 'Keep it under 150 characters and descriptive.' },
              { ok: false, text: 'Do not include size, colour, or price in the title.' },
              { ok: false, text: 'No special characters: !, $, ?, {}, #.' },
              { ok: false, text: 'No merchant names or promotional phrases like "Best Deal".' },
            ]} />
          </Stack>
        ),
      },
      {
        q: 'What is the product slug and do I need to set it?',
        a: <Typography variant="body2" color="text.secondary">The slug is a URL-friendly version of your title and is <strong>generated automatically</strong> as you type. You do not need to edit it manually.</Typography>,
      },
    ],
  },
  {
    id: 'editing',
    icon: <EditOutlinedIcon />,
    title: 'Editing & Managing Listings',
    badge: 'Products',
    items: [
      {
        q: 'How do I edit an existing product?',
        a: (
          <StepList steps={[
            'Open the Products page and locate the item you want to change.',
            'Click the edit icon or the product row to open the form.',
            'Make your changes across any of the four tabs.',
            'Click Save. Updates go live immediately for approved products.',
          ]} />
        ),
      },
      {
        q: 'How do I delete a product?',
        a: (
          <Stack spacing={1.5}>
            <Alert severity="warning" sx={{ borderRadius: 2, fontSize: 13 }}>Deletion is permanent and cannot be undone.</Alert>
            <StepList steps={[
              'Find the product on the Products page.',
              'Click the delete (trash) icon.',
              'Confirm the action in the dialog that appears.',
            ]} />
          </Stack>
        ),
      },
      {
        q: 'Can I temporarily hide a product without deleting it?',
        a: <Typography variant="body2" color="text.secondary">Yes. Set the <strong>Total Quantity to 0</strong>. The listing stays in your catalog but will show as out of stock to buyers until you restock it.</Typography>,
      },
    ],
  },
  {
    id: 'images',
    icon: <ImageOutlinedIcon />,
    title: 'Images & Media',
    badge: 'Quality',
    items: [
      {
        q: 'What are the image requirements?',
        a: (
          <Stack spacing={1.5}>
            <RuleList rules={[
              { ok: true,  text: 'Main image must have a plain white or neutral background.' },
              { ok: true,  text: 'Minimum 1,000 px on the longest side; product fills at least 85 % of the frame.' },
              { ok: true,  text: 'Square aspect ratio (1:1). The platform auto-crops on upload.' },
              { ok: true,  text: 'Accepted formats: JPEG, PNG. Maximum file size: 2 MB.' },
              { ok: false, text: 'No text overlays, watermarks, or borders on the main image.' },
              { ok: false, text: 'No blurry, pixelated, or low-light photos.' },
            ]} />
          </Stack>
        ),
      },
      {
        q: 'How many images can I add per product?',
        a: <Typography variant="body2" color="text.secondary">You can add <strong>one main image</strong> plus up to <strong>eight additional images</strong> (nine total). Use extra images to show different angles, in-use shots, or size comparisons. Additional images do not need a white background.</Typography>,
      },
      {
        q: 'Can I add a product video?',
        a: <Typography variant="body2" color="text.secondary">Yes. On the <strong>Images tab</strong>, there is a video upload field. Keep videos under 30 seconds and under 50 MB for best results. Videos autoplay silently on the product page.</Typography>,
      },
    ],
  },
  {
    id: 'variants',
    icon: <TuneOutlinedIcon />,
    title: 'Variants & Options',
    badge: 'Products',
    items: [
      {
        q: 'What variant types are supported?',
        a: (
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">Choose one of the following when creating or editing a product:</Typography>
            <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
              {['None — single version of the product (no variants)', 'Size — e.g. S, M, L, XL, or shoe sizes', 'Color — e.g. Red, Blue, Black', 'Size + Color — a combination grid (e.g. Medium / Red)'].map(t => (
                <Box component="li" key={t} sx={{ fontSize: 13, color: mid, mb: 0.5 }}>{t}</Box>
              ))}
            </Box>
          </Stack>
        ),
      },
      {
        q: 'How do I add variant-specific images?',
        a: (
          <StepList steps={[
            'Select a variant type and save the main product.',
            'Open the Variants tab.',
            'Add each variant (size/colour) and upload a dedicated image for it.',
            'Each variant image should also have a white/neutral background.',
          ]} />
        ),
      },
      {
        q: 'Can each variant have its own price and stock?',
        a: <Typography variant="body2" color="text.secondary">Yes. Each variant can have an independent price and quantity. This lets you charge more for larger sizes or premium colours, and track stock individually.</Typography>,
      },
    ],
  },
  {
    id: 'delivery',
    icon: <LocalShippingOutlinedIcon />,
    title: 'Delivery & Shipping',
    badge: 'Fulfilment',
    items: [
      {
        q: 'How do I set up delivery options?',
        a: (
          <StepList steps={[
            'Go to Delivery Options in the sidebar and create your options (e.g. "Standard", "Express").',
            'For each option set a name, base cost, and minimum / maximum delivery days.',
            'Assign options to a product in the Delivery tab of the product form.',
            'You can mark one option as the default for that product.',
          ]} />
        ),
      },
      {
        q: 'What does "Ships to regions" mean?',
        a: <Typography variant="body2" color="text.secondary">On the General tab you will see a <strong>Ships to</strong> field. Select every region or country you are able to fulfil orders for. Buyers in unselected regions will not see your product in search results.</Typography>,
      },
      {
        q: 'How are delivery costs calculated at checkout?',
        a: <Typography variant="body2" color="text.secondary">The buyer sees the cost you entered for the delivery option they select. You are responsible for setting realistic costs that cover your packaging, handling, and carrier fees. Disputes arising from late or non-delivery can affect your seller rating.</Typography>,
      },
    ],
  },
  {
    id: 'payments',
    icon: <AccountBalanceWalletOutlinedIcon />,
    title: 'Payments & Payouts',
    badge: 'Finance',
    items: [
      {
        q: 'When do I receive payment for an order?',
        a: <Typography variant="body2" color="text.secondary">Funds are held in escrow after a buyer places an order. They are released to your payout balance once the buyer confirms receipt — or automatically after the return window closes if no dispute is raised. This protects both parties.</Typography>,
      },
      {
        q: 'How do I withdraw my earnings?',
        a: (
          <StepList steps={[
            'Go to Payouts in the sidebar.',
            'Ensure your bank or mobile money account is linked under Billing settings.',
            'Click Withdraw and enter the amount (minimum withdrawal limits apply).',
            'Funds typically arrive within 1–3 business days.',
          ]} />
        ),
      },
      {
        q: 'What fees does Negromart charge?',
        a: <Typography variant="body2" color="text.secondary">A small commission is deducted per successful sale. The exact rate depends on your product category and subscription plan. You can view your current rate under <strong>Billing → Subscription</strong>.</Typography>,
      },
    ],
  },
  {
    id: 'analytics',
    icon: <BarChartOutlinedIcon />,
    title: 'Analytics & Growing Sales',
    badge: 'Growth',
    items: [
      {
        q: 'What analytics are available to me?',
        a: (
          <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
            {[
              'Store Analytics — overview of views, conversions, and revenue over time.',
              'Product views — how many shoppers are viewing each listing.',
              'Order trends — peak days, regions, and repeat buyers.',
              'Delivery performance — on-time rates and customer feedback.',
            ].map(t => (
              <Box component="li" key={t} sx={{ fontSize: 13, color: mid, mb: 0.75, lineHeight: 1.6 }}>{t}</Box>
            ))}
          </Box>
        ),
      },
      {
        q: 'How can I improve my product visibility?',
        a: (
          <RuleList rules={[
            { ok: true, text: 'Write detailed, keyword-rich descriptions that match what buyers search for.' },
            { ok: true, text: 'Use high-quality images — listings with clear photos get significantly more clicks.' },
            { ok: true, text: 'Keep your stock updated. Out-of-stock products are deprioritised in search.' },
            { ok: true, text: 'Respond quickly to customer questions and reviews to build a high seller rating.' },
            { ok: true, text: 'Offer competitive pricing and a clear returns policy.' },
          ]} />
        ),
      },
    ],
  },
  {
    id: 'security',
    icon: <SecurityOutlinedIcon />,
    title: 'Account & Security',
    badge: 'Security',
    items: [
      {
        q: 'How do I change my password?',
        a: (
          <StepList steps={[
            'Go to Settings → Security.',
            'Click "Change Password" and enter your current password.',
            'Enter and confirm your new password (minimum 8 characters).',
            'Click Update Password.',
          ]} />
        ),
      },
      {
        q: 'What is the "active sessions" list?',
        a: <Typography variant="body2" color="text.secondary">The Sessions section shows every browser or device currently logged in to your account, including the device type, browser, operating system, IP address, and when it was last active. You can revoke any individual session or log out of all devices at once.</Typography>,
      },
      {
        q: 'What does "Log out from all devices" do?',
        a: <Typography variant="body2" color="text.secondary">It immediately invalidates every active session across all browsers and devices — including the current one. You will be redirected to the login page and will need to sign in again with your OTP. Use this if you suspect unauthorised access.</Typography>,
      },
    ],
  },
];

// ── helper sub-components ─────────────────────────────────────────────────────

function StepList({ steps }) {
  return (
    <List dense disablePadding>
      {steps.map((s, i) => (
        <ListItem key={i} disableGutters sx={{ alignItems: 'flex-start', py: 0.4 }}>
          <ListItemIcon sx={{ minWidth: 32, mt: 0.3 }}>
            <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: blue, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{i + 1}</Typography>
            </Box>
          </ListItemIcon>
          <ListItemText primary={s} primaryTypographyProps={{ variant: 'body2', color: 'text.secondary', lineHeight: 1.6 }} />
        </ListItem>
      ))}
    </List>
  );
}

function RuleList({ rules }) {
  return (
    <List dense disablePadding>
      {rules.map((r, i) => (
        <ListItem key={i} disableGutters sx={{ alignItems: 'flex-start', py: 0.3 }}>
          <ListItemIcon sx={{ minWidth: 28, mt: 0.2 }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 17, color: r.ok ? 'success.main' : 'error.main' }} />
          </ListItemIcon>
          <ListItemText primary={r.text} primaryTypographyProps={{ variant: 'body2', color: 'text.secondary', lineHeight: 1.6 }} />
        </ListItem>
      ))}
    </List>
  );
}

// ── main component ────────────────────────────────────────────────────────────
export default function Help() {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(false);

  const q = search.trim().toLowerCase();

  const filteredSections = q
    ? SECTIONS.map(s => ({
        ...s,
        items: s.items.filter(item => item.q.toLowerCase().includes(q)),
      })).filter(s => s.items.length > 0)
    : SECTIONS;

  return (
    <Box>
      {/* ── Hero banner ─────────────────────────────────────────────────── */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${navy} 0%, #0a3466 100%)`,
          borderRadius: 3,
          px: { xs: 3, sm: 5 },
          py: { xs: 4, sm: 5.5 },
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* decorative glow */}
        <Box sx={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,113,206,0.35) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
          <SupportAgentOutlinedIcon sx={{ color: gold, fontSize: 22 }} />
          <Typography sx={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: gold }}>
            Seller Help Centre
          </Typography>
        </Stack>

        <Typography variant="h5" fontWeight={700} color="#fff" sx={{ mb: 0.75, lineHeight: 1.2 }}>
          How can we help you today?
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.68)', mb: 3, maxWidth: 500 }}>
          Browse topics or search for step-by-step guides on listing products, managing orders, getting paid, and more.
        </Typography>

        <TextField
          fullWidth
          placeholder="Search help topics… (e.g. &ldquo;upload images&rdquo;, &ldquo;set delivery&rdquo;)"
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.disabled' }} /></InputAdornment>,
            sx: {
              bgcolor: '#fff',
              borderRadius: 2,
              maxWidth: 560,
              '& fieldset': { border: 'none' },
              fontSize: 14,
            },
          }}
        />
      </Box>

      {/* ── Quick topic cards ────────────────────────────────────────────── */}
      {!q && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', fontSize: 11, letterSpacing: 1 }}>
            Browse by topic
          </Typography>
          <Grid container spacing={1.5}>
            {TOPICS.map(t => (
              <Grid size={{ xs: 6, sm: 4, md: 3 }} key={t.label}>
                <Card
                  variant="outlined"
                  sx={{ borderRadius: 2, transition: 'box-shadow 0.2s, transform 0.2s', '&:hover': { boxShadow: 4, transform: 'translateY(-2px)', borderColor: blue } }}
                >
                  <CardActionArea
                    onClick={() => {
                      document.getElementById(t.anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      setExpanded(t.anchor);
                    }}
                    sx={{ p: { xs: 1.25, sm: 2 } }}
                  >
                    <Stack direction={{ xs: 'row', sm: 'column' }} spacing={{ xs: 1.25, sm: 1 }} alignItems={{ xs: 'center', sm: 'flex-start' }}>
                      <Box sx={{ p: { xs: 0.75, sm: 1 }, bgcolor: '#eef4ff', borderRadius: 1.5, flexShrink: 0, '& .MuiSvgIcon-root': { fontSize: { xs: 20, sm: 28 } } }}>
                        {t.icon}
                      </Box>
                      <Typography variant="body2" fontWeight={600} lineHeight={1.3} sx={{ fontSize: { xs: 12, sm: 14 } }}>
                        {t.label}
                      </Typography>
                    </Stack>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* ── Sections ─────────────────────────────────────────────────────── */}
      {filteredSections.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <InfoOutlinedIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary">No results for &ldquo;{search}&rdquo;. Try different keywords or browse the topics above.</Typography>
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {filteredSections.map(section => (
            <Box key={section.id} id={section.id}>
              {/* Section header */}
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                <Box sx={{ color: blue }}>{section.icon}</Box>
                <Typography variant="subtitle1" fontWeight={700}>{section.title}</Typography>
                <Chip label={section.badge} size="small" sx={{ fontSize: 10, height: 20, bgcolor: light, color: mid, fontWeight: 700 }} />
              </Stack>

              {section.items.map((item, idx) => (
                <Accordion
                  key={idx}
                  expanded={expanded === `${section.id}-${idx}`}
                  onChange={(_, open) => setExpanded(open ? `${section.id}-${idx}` : false)}
                  disableGutters
                  elevation={0}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '10px !important',
                    mb: 1,
                    '&:before': { display: 'none' },
                    '&.Mui-expanded': { borderColor: blue },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ fontSize: 20, color: 'text.secondary' }} />}
                    sx={{ px: 2.5, py: 0.5, '& .MuiAccordionSummary-content': { my: 1.25 } }}
                  >
                    <Typography variant="body2" fontWeight={600}>{item.q}</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
                    <Divider sx={{ mb: 2 }} />
                    {item.a}
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          ))}
        </Stack>
      )}

      {/* ── Community & Social ──────────────────────────────────────────── */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 2, textTransform: 'uppercase', fontSize: 11, letterSpacing: 1 }}>
          Community &amp; Social
        </Typography>
        <Grid container spacing={1.5}>
          {SOCIALS.map(s => (
            <Grid size={{ xs: 6, sm: 4, md: 2 }} key={s.label}>
              <Card
                variant="outlined"
                component="a"
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  borderRadius: 2,
                  textDecoration: 'none',
                  display: 'block',
                  transition: 'box-shadow 0.2s, transform 0.2s, border-color 0.2s',
                  '&:hover': { boxShadow: 3, transform: 'translateY(-2px)', borderColor: s.color },
                }}
              >
                <CardActionArea sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: s.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: s.color }}>
                      {s.icon}
                    </Box>
                    <Typography variant="body2" fontWeight={600} sx={{ fontSize: { xs: 12, sm: 13 }, color: 'text.primary' }}>
                      {s.label}
                    </Typography>
                  </Stack>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ── Contact / support card ───────────────────────────────────────── */}
      <Box
        sx={{
          mt: 5,
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          bgcolor: light,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ sm: 'center' }} justifyContent="space-between">
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ p: 1.5, bgcolor: '#fff', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <MailOutlineIcon sx={{ color: blue, fontSize: 26 }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={700}>Still need help?</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
                Our seller support team is available Monday – Friday, 8 am – 6 pm. Reach us at{' '}
                <Box component="a" href="mailto:support@negromart.com" sx={{ color: blue, fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                  support@negromart.com
                </Box>
              </Typography>
            </Box>
          </Stack>
          <Stack spacing={0.75} sx={{ flexShrink: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <CheckCircleOutlineIcon sx={{ fontSize: 15, color: 'success.main' }} />
              <Typography variant="caption" color="text.secondary">Typical reply within 24 hours</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <CheckCircleOutlineIcon sx={{ fontSize: 15, color: 'success.main' }} />
              <Typography variant="caption" color="text.secondary">Dedicated seller account support</Typography>
            </Stack>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
