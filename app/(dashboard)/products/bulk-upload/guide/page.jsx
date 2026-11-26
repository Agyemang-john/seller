'use client';

/**
 * Seller guide to adding products in bulk. The column list comes from the
 * backend (vendor/bulk_upload.py COLUMNS), so it never drifts from what the
 * upload accepts.
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Chip, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { createAxiosClient } from '@/utils/clientFetch';

const H = ({ children, id }) => (
  <Typography id={id} component="h2" sx={{ fontFamily: 'var(--font-figtree), system-ui, sans-serif', fontSize: { xs: 22, md: 26 }, fontWeight: 700,
    letterSpacing: '-0.4px', mt: 5, mb: 1.5, scrollMarginTop: 80 }}>{children}</Typography>
);
const P = ({ children }) => <Typography variant="body1" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.75 }}>{children}</Typography>;

function Steps({ items }) {
  return (
    <Stack spacing={1.5} sx={{ mb: 2 }}>
      {items.map(([title, text], i) => (
        <Stack key={title} direction="row" spacing={1.5}>
          <Box sx={{ width: 28, height: 28, borderRadius: '9px', bgcolor: 'text.primary', color: 'background.paper', fontWeight: 800, fontSize: 13,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</Box>
          <Box>
            <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>{text}</Typography>
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}

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

function Sheet({ headers, rows }) {
  return (
    <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px', mb: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow>{headers.map((h) => <TableCell key={h} sx={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', bgcolor: 'action.hover' }}>{h}</TableCell>)}</TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={i}>{r.map((c, j) => <TableCell key={j} sx={{ fontSize: 13, whiteSpace: 'nowrap', color: c ? 'text.primary' : 'text.disabled' }}>{c || '(empty)'}</TableCell>)}</TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

const FAQ = [
  ['My product was saved as a draft. Why?', 'It has no photo, or its photo could not be used (the report says why). Open it from the report or from My Products, add a photo and save: it then goes to review.'],
  ['The report says a photo link "did not lead to a photo".', 'The link opens a web page instead of the image. Open the photo, right-click it and choose "Copy image address", or use a Google Drive / Dropbox share link set to "Anyone with the link".'],
  ['"You already have a product with this title".', 'Titles must be different within your store. If it is the same item, edit the existing product instead; if it is different, make the title more specific.'],
  ['"N rows have this title".', 'Rows with the same title are treated as versions of one product, so they need option columns (option1_name = Size, option1_value = M...). If they are different products, give each its own title.'],
  ['"Unknown delivery method" or "Unknown country".', 'Use the exact names from the lists on the upload page (Delivery methods, Countries). Or leave the column empty to use the same as your latest product.'],
  ['Some rows were saved and some were not.', 'Every product is checked on its own: the good ones are saved, the others are listed with what to fix. Fix only those rows and upload them again. Don\'t upload the saved ones again: they would be refused as duplicates.'],
  ['My accents or ₵ look wrong after uploading.', 'Save the file as "CSV UTF-8" in Excel. Google Sheets downloads are always fine.'],
  ['Can I update prices or stock of existing products in bulk?', <>Not on this page: it adds new products. Use the <Link href="/tools/bulk-edit">Bulk edit</Link> tool (if your plan includes it) to change many prices and stock levels at once, or edit products one by one from Products.</>],
  ['How many products can I add?', 'Up to 500 per upload, within your plan\'s product limit (shown at the top of the upload page).'],
  ['Is a product added in bulk different from one added on its own?', 'No. It is the same product: same review, same product page, same delivery prices, same filters. You can open and edit it from Products like any other.'],
  ['How do I add a video or "Buy it with" items?', 'Those are added one product at a time: after uploading, open the product from Products › Edit, add the video (up to 15 MB) or the "Buy it with" items, and save.'],
  ['"is not a spec of this category".', 'Specs depend on the category. On the upload page, open "Specs by category", choose the category and copy the names from there. Or leave the specs column empty and add them later.'],
  ['The report says "Add its specs" but the product was saved.', 'The product is saved, but some details shoppers filter by are missing. Open it from Products and fill in the Specs section: it helps shoppers find it.'],
  ['My item comes from abroad. What do I put?', 'Set stock_type to ships_from_abroad and sourcing_days to how long it takes to reach you, e.g. 4-6 weeks. Shoppers see "Ships from abroad" and the extra time before they buy.'],
];

export default function BulkUploadGuidePage() {
  const client = useMemo(() => createAxiosClient(), []);
  const [meta, setMeta] = useState(null);
  useEffect(() => { client.get('/api/v1/vendor/products/bulk-upload/meta/').then((r) => setMeta(r.data)).catch(() => {}); }, [client]);
  const photos = meta?.max_images_per_product;
  const versionPhotos = meta?.max_images_per_variant || 0;

  return (
    // minmax(0, 1fr): wide tables scroll inside their box instead of widening the page on phones.
    <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', width: '100%', maxWidth: 860, mx: 'auto', px: { xs: 0, md: 2 }, py: { xs: 1, md: 3 } }}>
      <Button component={Link} href="/products/bulk-upload" startIcon={<ArrowBackIcon />} sx={{ justifySelf: 'start', mb: 2, color: 'text.secondary', borderRadius: '8px', fontWeight: 600 }}>
        Back to bulk upload
      </Button>
      <Typography component="h1" sx={{ fontFamily: 'var(--font-figtree), system-ui, sans-serif', fontSize: { xs: 32, md: 42 }, fontWeight: 700, letterSpacing: '-1px', lineHeight: 1.1, mb: 1 }}>
        Adding products in bulk
      </Typography>
      <P>Add up to 500 products at once, with their photos and versions (colours, sizes, flavours, pack sizes and more). This guide takes about 5 minutes to read. New to selling here? Start with the <Link href="/help/selling-guide">selling guide</Link>.</P>

      <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', mb: 1 }}>
        {[['two-ways', 'Two ways'], ['same', 'Same as one by one'], ['browser', 'In the browser'], ['spreadsheet', 'Spreadsheet'], ['versions', 'Versions'], ['photos', 'Photos'], ['specs', 'Specs'], ['stock-type', 'Abroad / made to order'], ['after', 'After uploading'], ['columns', 'All columns'], ['faq', 'Questions']].map(([id, label]) => (
          <Chip key={id} label={label} component="a" href={`#${id}`} clickable variant="outlined" sx={{ borderRadius: '10px', fontWeight: 600 }} />
        ))}
      </Stack>

      <H id="two-ways">Two ways to do it</H>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        {[
          ['Add in the browser', 'Best for most sellers and for phones. A card per product: type the details, add photos from your phone or computer, set up versions with a few taps.', 'Up to ~50 products at a time'],
          ['Upload a spreadsheet', 'Best if your catalogue is already in Excel or Google Sheets, or you have hundreds of products. Photos come from links.', 'Up to 500 rows per file'],
        ].map(([t, d, n]) => (
          <Box key={t} sx={{ flex: 1, p: 2.5, borderRadius: '14px', border: '1px solid', borderColor: 'divider' }}>
            <Typography sx={{ fontWeight: 700, mb: 0.5 }}>{t}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, lineHeight: 1.7 }}>{d}</Typography>
            <Chip size="small" label={n} />
          </Box>
        ))}
      </Stack>
      <P>Have ready: the category of each product, the price, how many you have, the <strong>packed weight</strong> in kg (it sets the delivery price) and good photos.</P>

      <H id="same">The same as adding products one by one</H>
      <P>A product added in bulk is exactly the same as one added with <Link href="/products/product">Add product</Link>: it goes through the same review, gets the same product page, delivery prices and search filters, and you edit it the same way afterwards. Everything on the product form can be filled in here too:</P>
      <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px', mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>On the product form</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>In the browser cards</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>In a spreadsheet</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[
              ['Name, category, condition', 'On the card', 'title, category, condition'],
              ['Price, old price, stock, weight', 'On the card / More details', 'price, compare_at_price, stock, weight_kg'],
              ['Your cost per item', 'More details', 'unit_cost'],
              ['Main photo and more photos', 'Photos on the card', 'image_url, more_image_urls'],
              ['Versions (colour, size, flavour…)', 'Comes in versions?', 'option1_name … option3_value, one row per version'],
              ['Photos of each version', 'Photos under each version', 'image_url and more_image_urls on the version\'s row'],
              ['Specs (details shoppers filter by)', 'More details › Specs', 'specs'],
              ['Ships from abroad / made to order', 'More details › Stock type', 'stock_type, sourcing_days, sourced_from'],
              ['Ships to, delivery methods', 'More details (start as your latest product\'s)', 'ships_to, delivery_methods (empty = your latest product\'s)'],
              ['Description, key features', 'More details', 'description, features, specifications, delivery_returns'],
              ['Brand, SKU, barcode, return days', 'More details', 'brand, seller_sku, barcode, return_days'],
            ].map(([a, b, c]) => (
              <TableRow key={a}>
                <TableCell sx={{ fontSize: 13, fontWeight: 600, verticalAlign: 'top' }}>{a}</TableCell>
                <TableCell sx={{ fontSize: 13, verticalAlign: 'top' }}>{b}</TableCell>
                <TableCell sx={{ fontSize: 12.5, fontFamily: 'ui-monospace, monospace', verticalAlign: 'top', wordBreak: 'break-word' }}>{c}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <P>Only two things are added afterwards, one product at a time: a <strong>video</strong> and <strong>&ldquo;Buy it with&rdquo;</strong> items. Open the product from Products › Edit once it is uploaded.</P>

      <H id="browser">Adding in the browser</H>
      <Steps items={[
        ['Open Products › Add in bulk', 'Three empty cards are ready. Add more with “Add product” at the bottom.'],
        ['Fill in the essentials', 'Name, category (type to search), price, stock and packed weight. Pick the condition if it isn\'t new.'],
        ['Add photos', `Tap “Photos” and select several at once, or drag them from your computer onto the card, just like on the product form. The first is the main photo; tap “Make main” on another to swap${photos != null ? ` (a main photo plus ${photos} more on your plan)` : ''}. Photos are squared on a white background and checked automatically. The same works for each version's photos.`],
        ['Versions, if any', `Tap “Comes in versions?”, pick what changes (e.g. Flavour and Size), type the values once and tap “Add versions”. Then set each version's price and stock, and a photo if it looks different${versionPhotos ? ` (up to ${versionPhotos + 1} photos per version on your plan)` : ''}.`],
        ['More details (optional)', 'Old price, your cost, brand, description, key features, SKU, barcode, return days, stock type (in stock, from abroad, made to order) and the category\'s specs. Ships-to countries and delivery methods start as your latest product\'s; change them here if needed.'],
        ['Upload', 'Tap “Upload”. Saved products leave the list; any with problems stay, marked in red, so you can fix them and upload again.'],
      ]} />
      <Alert severity="info" sx={{ borderRadius: '12px', mb: 2 }}>Use <strong>Duplicate</strong> on a card for similar products: everything is copied except the name, SKU and photos.</Alert>

      <H id="spreadsheet">Uploading a spreadsheet</H>
      <Steps items={[
        ['Download the template', 'On the upload page, “Upload a spreadsheet” › Download template. It has every column and example rows; rows whose title starts with # are skipped, so you can leave them while you learn.'],
        ['Fill one row per product', 'Required: title, category, price, stock, weight_kg. Copy category codes and brand names from the lists on the upload page.'],
        ['Save as CSV', 'Excel: File › Save As › “CSV UTF-8 (comma delimited)”. Google Sheets: File › Download › Comma-separated values. Excel (.xlsx) files can\'t be uploaded directly.'],
        ['Upload and read the report', 'We check every row. Good products are saved; the report lists the rows to fix by row number.'],
      ]} />
      <Sheet headers={['title', 'category', 'price', 'stock', 'weight_kg', 'image_url']} rows={[
        ['Cotton Tote Bag', 'bags', '45.00', '30', '0.3', 'https://myshop.com/tote.jpg'],
        ['Leather Wallet', 'wallets', '120.00', '12', '0.2', 'https://drive.google.com/file/d/…/view'],
      ]} />
      <P>Empty <code>ships_to</code> and <code>delivery_methods</code> use the same as your latest product. Descriptions can be plain text: a blank line starts a new paragraph. In <code>features</code>, separate items with <code>;</code> to get a bullet list.</P>

      <H id="versions">Products with versions</H>
      <P>A version is the same product in a different colour, size, flavour, scent, pack size, capacity… You can use up to <strong>3 options</strong> per product, from our list or your own name (e.g. “Roast level”).</P>
      <P>In a spreadsheet, write <strong>one row per version, all with the same title</strong>. Fill the product details (category, description, weight…) on the first row; every row has its own <code>price</code>, <code>stock</code>, <code>seller_sku</code> and <code>image_url</code>, and the option columns:</P>
      <Sheet headers={['title', 'category', 'price', 'stock', 'weight_kg', 'option1_name', 'option1_value', 'option2_name', 'option2_value']} rows={[
        ['Protein Shake', 'sports-nutrition', '120.00', '25', '0.6', 'Flavour', 'Vanilla', 'Size', '500 g'],
        ['Protein Shake', '', '200.00', '10', '', 'Flavour', 'Vanilla', 'Size', '1 kg'],
        ['Protein Shake', '', '120.00', '0', '', 'Flavour', 'Chocolate', 'Size', '500 g'],
      ]} />
      <Rules items={[
        [true, 'Use the same option names on every row of a product (Flavour, Size).'],
        [true, 'Only list versions you sell. Out of stock for now? Keep the row with stock 0.'],
        [true, 'Common names are understood in UK or US spelling: Colour/Color, Flavour/Flavor.'],
        [false, 'Don\'t put the colour or size in the title: shoppers pick them on the product page.'],
        [false, 'Two rows can\'t be the same version (e.g. Vanilla / 500 g twice).'],
      ]} />
      <P>Each version row can also have its own <code>unit_cost</code> (what it costs you) and <code>more_image_urls</code> (more photos of that version{versionPhotos ? `, up to ${versionPhotos} on your plan` : ', on plans that include extra version photos'}). On the first row, <code>more_image_urls</code> are the product&apos;s own extra photos.</P>
      <P>A third option goes in <code>option3_name</code> / <code>option3_value</code>. Put first the option shoppers choose first (usually Flavour, Colour or Scent): on the product page, each next option only shows what exists for the choices above it. Only write the versions you actually sell. The <Link href="/help/selling-guide#versions">selling guide</Link> explains versions with a try-it example.</P>

      <H id="photos">Photos</H>
      <Rules items={[
        [true, 'JPG, PNG or WebP, at least 400 × 400 pixels (1000+ looks best), up to 10 MB.'],
        [true, 'Main photo: the product on a plain white or light background, filling most of the frame.'],
        [true, `In a spreadsheet, put the main photo in image_url and more in more_image_urls, separated by ;${photos != null ? ` (a main photo plus up to ${photos} more on your plan, the same as the product form)` : ''}.`],
        [true, 'Links that work: a direct link to the image file (often ends in .jpg/.png), a Google Drive link shared as “Anyone with the link”, or a Dropbox share link.'],
        [false, 'Links to a web page, a Google Photos album, Instagram or WhatsApp don\'t work: they aren\'t the image itself.'],
        [false, 'No watermarks, phone numbers or text on photos.'],
      ]} />
      <P>When photos come from links, your upload runs in the background: photos are downloaded, checked, resized and stripped of hidden location data. You can leave the page; products appear in My Products as they are added.</P>

      <H id="specs">Specs: the details shoppers filter by</H>
      <P>Many categories have specs, such as Material, Screen size or Waterproof. Shoppers use them to filter and compare, so products with specs are easier to find. They are optional, but fill in as many as you can.</P>
      <Rules items={[
        [true, 'In the browser: choose the category, open “More details” and fill in the Specs box. It shows the same fields as the product form.'],
        [true, 'In a spreadsheet: write them in the specs column as Name: value, separated by ; — for example: Material: Cotton; Capacity: 12 L; Waterproof: no'],
        [true, 'On the upload page, “Specs by category” lists each category\'s spec names and allowed values, with a line you can copy.'],
        [true, 'Choices must be one of the listed values (any capitals). Several values for one spec: separate them with commas. Numbers can include the unit (12 L). Yes/no specs: yes or no.'],
        [false, 'Don\'t use spec names from another category: the row will be refused and the report says which names to use.'],
      ]} />
      <Sheet headers={['title', 'category', 'price', 'stock', 'weight_kg', 'specs']} rows={[
        ['Canvas Backpack', 'backpacks', '180.00', '15', '0.9', 'Material: Canvas; Capacity: 20 L; Waterproof: yes'],
      ]} />

      <H id="stock-type">Items from abroad or made to order</H>
      <P>If you don&apos;t hold the item yet when it sells, say so, the same as on the product form. Shoppers then see the extra time before they buy, and your ship-by date moves with it.</P>
      <Sheet headers={['title', 'stock_type', 'sourcing_days', 'sourced_from']} rows={[
        ['Smart Watch X2', 'ships_from_abroad', '4-6 weeks', 'China'],
        ['Kente Stole', 'made_to_order', '7-14', ''],
        ['Cotton Tote Bag', '', '', ''],
      ]} />
      <Rules items={[
        [true, 'stock_type: in_stock (or empty), ships_from_abroad or made_to_order.'],
        [true, 'sourcing_days: shortest-longest time until the item is in your hands, in days (7-14) or weeks (4-6 weeks). At most 10 weeks.'],
        [true, 'sourced_from: the country you order it from, for ships_from_abroad (optional).'],
        [false, 'Don\'t mark imported items as in stock: shoppers would be promised a delivery date you can\'t meet.'],
      ]} />

      <H id="after">After uploading</H>
      <Rules items={[
        [true, 'With a photo: the product goes to review. You\'re notified when it\'s live.'],
        [true, 'Without a usable photo: it\'s saved as a draft. The report has a “Finish” button for each; add a photo and save to send it to review.'],
        [true, 'With a problem: it isn\'t saved, and the report says what to fix. Fix those rows only and upload them again.'],
        [true, 'With a note (e.g. a photo link that failed, or specs to add): it is saved; the note tells you what to finish from Products.'],
        [true, 'Want a video or “Buy it with” items? Open the product from Products › Edit and add them there.'],
      ]} />

      <H id="columns">All spreadsheet columns</H>
      {meta?.columns ? (
        <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px', mb: 2 }}>
          <Table size="small">
            <TableHead><TableRow><TableCell sx={{ fontWeight: 700 }}>Column</TableCell><TableCell sx={{ fontWeight: 700 }}>What to put</TableCell><TableCell sx={{ fontWeight: 700 }}>Example</TableCell></TableRow></TableHead>
            <TableBody>
              {meta.columns.map((c) => (
                <TableRow key={c.name}>
                  <TableCell sx={{ fontFamily: 'ui-monospace, monospace', fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap', color: c.required ? 'error.main' : 'text.primary', verticalAlign: 'top' }}>
                    {c.name}{c.required ? ' *' : ''}
                  </TableCell>
                  <TableCell sx={{ fontSize: 13, verticalAlign: 'top' }}>{c.help}</TableCell>
                  <TableCell sx={{ fontSize: 12.5, color: 'text.secondary', verticalAlign: 'top', wordBreak: 'break-word' }}>{c.example}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : <P>The column list is on the upload page (“What goes in each column”).</P>}
      <P>Columns marked * are required. Older column names from the first template (sub_category_slug, old_price, total_quantity, product_type, weight, size_names, color_names) still work.</P>

      <H id="faq">Questions</H>
      {FAQ.map(([q, a]) => (
        <Accordion key={q} disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px !important', mb: 1, '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography sx={{ fontWeight: 600 }}>{q}</Typography></AccordionSummary>
          <AccordionDetails><Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75 }}>{a}</Typography></AccordionDetails>
        </Accordion>
      ))}

      <Box sx={{ mt: 4, p: 3, borderRadius: '16px', bgcolor: 'action.hover', textAlign: 'center' }}>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>Ready?</Typography>
        <Button component={Link} href="/products/bulk-upload" variant="contained" disableElevation
          sx={{ bgcolor: 'text.primary', color: 'background.paper', borderRadius: '10px', fontWeight: 700 }}>Add products in bulk</Button>
      </Box>
    </Box>
  );
}
