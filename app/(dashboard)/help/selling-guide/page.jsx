'use client';

/**
 * The seller's guide to listing products: setting up, the product form section
 * by section, versions (options) in depth, what happens after saving, keeping
 * listings healthy, and bulk upload. Written for people new to online selling,
 * read on a phone; the labels quoted here are the ones on the product form
 * (components/products/form, components/products/Variant.jsx).
 */

import Link from 'next/link';
import { Box, Button, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  A, Callout, Faq, GuidePage, H, H3, Jump, P, Rules, Sheet, Steps, Title,
} from '@/components/guides/GuideParts';
import VersionsDemo from '@/components/guides/VersionsDemo';

const FAQ = [
  ['How do I know when my product is live?', 'You get a notification when it is approved, or a note saying what to change if it was rejected.'],
  ['My product was rejected. What now?', 'Open it from Products: the reason is shown on it. Fix that and press Save changes: it goes back to review by itself.'],
  ['Does editing a live product take it off sale?', 'No. A live product stays live while you edit it, and your changes show straight away.'],
  ['A version is sold out. Should I delete it?', 'No, set its quantity to 0. Shoppers still see it (crossed out) and know it is coming back. Delete only versions you will never sell again.'],
  ['Why can\'t I pick a third or fourth option?', 'A product can have up to 3 options (for example Flavour, Pack size and Can size). That keeps the page easy for shoppers. If you need more, the items are probably different products.'],
  ['Shoppers see a version I don\'t sell.', 'You probably used "Add several versions at once", which makes every combination. Open the product, delete the versions you don\'t sell, and save.'],
  ['My photo was refused.', 'Photos need a plain light background, at least 400 × 400 pixels, and no text or watermarks. Take it again in front of a white wall or sheet of paper, in daylight.'],
  ['Can I change many prices or stock levels at once?', <>Yes, with the <A href="/tools/bulk-edit">Bulk edit</A> tool, if your plan includes it. Bulk upload only adds new products.</>],
  ['Someone else already sells this exact item.', <>Use <A href="/products/sell-existing">Sell an existing item</A>: you add your price and stock to their listing instead of creating a copy. Shoppers see your offer next to theirs.</>],
];

export default function SellingGuidePage() {
  return (
    <GuidePage>
      <Button component={Link} href="/help" startIcon={<ArrowBackIcon />} sx={{ justifySelf: 'start', mb: 2, color: 'text.secondary', borderRadius: '8px', fontWeight: 600 }}>
        Help & guides
      </Button>
      <Title>The selling guide</Title>
      <P>Everything you need to put your products on Negromart and sell them well: setting up, adding a product, versions like flavours and pack sizes, and adding many products at once. About 10 minutes to read.</P>
      <Jump items={[['start', 'Before you start'], ['ways', 'Three ways to add'], ['add', 'Adding a product'], ['versions', 'Versions'],
        ['after', 'After saving'], ['healthy', 'Keeping it selling'], ['bulk', 'Bulk upload'], ['faq', 'Questions']]} />

      {/* ── 1 ── */}
      <H id="start">1. Before you start</H>
      <Steps items={[
        ['Finish your store profile', <>Add your logo, cover photo, address and a few lines about your store in <A href="/profile">Store profile</A>. Shoppers trust stores that look complete.</>],
        ['Set your working hours', <>In <A href="/working-hours">Working hours</A>. Shoppers see when you are open, and orders are planned around it.</>],
        ['Know your plan\'s limits', <>Your plan sets how many products and photos you can have. See it under <A href="/subscribe">Plans</A>.</>],
      ]} />
      <Callout title="Have this ready for each product" tone="tip">
        Good photos · the category · your selling price · how many you have · the <b>packed weight</b> (with the box or bag, in kg: it sets the delivery price) · for versions, the price and stock of each one.
      </Callout>

      {/* ── 2 ── */}
      <H id="ways">2. Three ways to add products</H>
      <Sheet mono={false} headers={['Way', 'Best for', 'Where']} rows={[
        ['Add a product', 'One product at a time, with every detail.', 'Products › Add product'],
        ['Sell an existing item', 'The same item is already on Negromart (same brand and model). You only add your price and stock.', 'Catalog › Sell an existing item'],
        ['Bulk upload', 'Many products at once, from cards in the browser or a spreadsheet.', 'Catalog › Bulk upload'],
      ]} />

      {/* ── 3 ── */}
      <H id="add">3. Adding a product, section by section</H>
      <P>The product form is one page split into sections. On a laptop, jump between them with the panel on the side; on a phone, with the chips at the top. Sections marked optional can be skipped, but filled ones sell better.</P>

      <H3>Basics</H3>
      <Rules items={[
        [true, <><b>Product title:</b> Brand + what it is + the key detail. e.g. &ldquo;Pringles Original Potato Crisps&rdquo;, &ldquo;Samsung 55-inch 4K Smart TV&rdquo;.</>],
        [true, <><b>Category:</b> type what it is (&ldquo;crisps&rdquo;, &ldquo;sneakers&rdquo;) and pick the closest match. The right category is how shoppers find you.</>],
        [true, <><b>Brand</b> (leave empty if none), <b>Condition</b> (new, used…), <b>Your SKU</b> (your own stock code) and <b>Barcode</b> (the number under the barcode on the box).</>],
        [false, 'Don\'t put the flavour, size, colour or price in the title: shoppers pick versions on the page.'],
        [false, 'No "Best deal", "Cheap!!" or phone numbers in the title.'],
      ]} />

      <H3>Photos & video</H3>
      <Rules items={[
        [true, 'Main photo: the product alone, on a plain white or light background, filling most of the picture. It is squared automatically.'],
        [true, 'Add more photos: other sides, the label, the product in use, the size next to a hand. Four or more sells noticeably better.'],
        [true, 'At least 400 × 400 pixels; phone photos are fine. Take them in daylight.'],
        [false, 'No watermarks, logos, phone numbers or text on photos, and no photos copied from other websites.'],
      ]} />

      <H3>Price & stock</H3>
      <Rules items={[
        [true, <><b>Selling price</b> is what shoppers pay. <b>Was</b> (optional) is shown crossed out to show a saving, so it must be higher.</>],
        [true, <><b>Quantity in stock:</b> how many you can send today. It goes down by itself with each order.</>],
        [true, <><b>Your cost per item</b> (optional, only you see it) powers your profit report.</>],
        [true, <><b>Weight</b> (and volume for big items) is the <b>packed</b> weight. Too low and you pay the difference on delivery.</>],
        [true, <><b>Stock type:</b> &ldquo;I have it in stock&rdquo;, &ldquo;I make it after a sale&rdquo;, or &ldquo;I order it from abroad after a sale&rdquo;. For the last two, say how many days it takes: shoppers see the real delivery date.</>],
      ]} />
      <P>If the product comes in versions, each version has its own price and stock (next section).</P>

      <H3>Variants</H3>
      <P>Only if shoppers choose something: flavour, size, colour, pack size… See <a href="#versions">Versions</a> below: it is worth reading before your first one.</P>

      <H3>Specs (optional)</H3>
      <P>Details for this category, like screen size, material or volume. Shoppers <b>filter</b> by these, so a product without specs disappears when they narrow a search. Fill every one you know.</P>

      <H3>Description</H3>
      <P>What it is, who it is for and why it is worth buying, plus short feature points (one per line) that shoppers scan first. Add anything not covered in Specs: what is in the box, care, ingredients.</P>

      <H3>Shipping</H3>
      <Rules items={[
        [true, <><b>Countries:</b> where you deliver this item. Shoppers elsewhere see that it doesn&apos;t ship to them.</>],
        [true, <><b>Delivery methods:</b> how it gets there, what the shopper pays and how long it takes. Add at least one.</>],
      ]} />

      <H3>More details (optional)</H3>
      <P><b>Return window</b> (how many days shoppers can return it), and for food, cosmetics and medicine the <b>manufacture date</b> and <b>shelf life</b>.</P>

      <H3>Save</H3>
      <P>Press <b>Save product</b>. Anything missing is shown in red and the form jumps to it. A saved product goes to review before it goes live.</P>

      {/* ── 4 ── */}
      <H id="versions">4. Versions (variants), step by step</H>
      <P>A version is the <b>same product</b> in a different flavour, size, colour, scent, pack size, capacity… Shoppers see one product page and pick what they want, instead of finding many separate listings.</P>
      <Callout title="One product with versions, or separate products?">
        Same product, same photos style, shoppers would compare them side by side → <b>versions</b> (Pringles Original / Barbecue; T-shirt S / M / L).
        Different products that happen to be similar → <b>separate products</b> (a phone and its case; Pringles and Lay&apos;s).
      </Callout>

      <H3>Step by step</H3>
      <Steps items={[
        ['Answer "Yes"', 'In the Variants section, answer "Does this item come in different versions?" with Yes.'],
        ['Pick what changes, in order', <>Tap up to <b>3</b> options, e.g. <b>Flavour</b>, then <b>Pack size</b>. Can&apos;t find yours? Type your own name (e.g. &ldquo;Roast level&rdquo;) and tap Add. <b>The order matters:</b> the first option is what shoppers choose first (see below).</>],
        ['Add the versions', <>Either tap <b>Add one version</b> for each one you sell, or <b>Add several versions at once</b>: type the values for each option (press Enter after each) and tap <b>Add N versions</b>.</>],
        ['Delete what you don\'t sell', <>&ldquo;Several at once&rdquo; makes <b>every combination</b>. If not every flavour comes in every pack, remove the ones you don&apos;t sell with the delete (bin) button on that version.</>],
        ['Fill each version', <>Every version has its own <b>Price</b>, <b>Quantity</b>, <b>SKU</b> (optional) and <b>photo</b>. Add a photo whenever the version looks different (another colour, another packet). Your plan may allow extra photos per version too.</>],
        ['Save', 'Press Save product. Shoppers now see one product with choices.'],
      ]} />

      <H3>Example: crisps in flavours and pack sizes</H3>
      <P>You sell Original in a 12 pack, Barbecue in 12 and 24 packs, and Sour Cream & Onion in a 24 pack. Options: <b>1. Flavour</b>, <b>2. Pack size</b>. Your versions:</P>
      <Sheet mono={false} headers={['Flavour', 'Pack size', 'Price', 'Quantity']} rows={[
        ['Original', '12 pack', '₵20.00', '14'],
        ['Barbecue', '12 pack', '₵21.00', '9'],
        ['Barbecue', '24 pack', '₵38.00', '0  (sold out for now)'],
        ['Sour Cream & Onion', '24 pack', '₵39.00', '6'],
      ]} />
      <P>If you used &ldquo;Add several versions at once&rdquo; with 3 flavours and 2 packs, you got 6 versions: delete <b>Original / 24 pack</b> and <b>Sour Cream & Onion / 12 pack</b>, because you don&apos;t sell them.</P>
      <VersionsDemo />

      <H3>How shoppers choose (why the order matters)</H3>
      <Rules items={[
        [true, 'The first option shows every value: all flavours.'],
        [true, 'Each next option only shows what exists for the choices above it: pick Barbecue, see 12 and 24 packs; pick Original, see only the 12 pack.'],
        [true, 'Switching keeps the shopper\'s other choices when that version exists, otherwise opens the closest one in stock.'],
        [true, 'When prices differ, each choice shows its price, so shoppers can compare a 12 pack with a 24 pack at a glance.'],
        [true, <>Put first what shoppers decide first: usually <b>Flavour</b>, <b>Colour</b> or <b>Scent</b>, then <b>Size</b> or <b>Pack size</b>.</>],
      ]} />

      <H3>Three options</H3>
      <P>Up to three work the same way: each row narrows by everything chosen above it. For example <b>Flavour → Pack size → Can size</b>:</P>
      <Sheet mono={false} headers={['Flavour', 'Pack size', 'Can size']} rows={[
        ['Original', '12 pack', '40 g'], ['Original', '12 pack', '158 g'], ['Original', '24 pack', '40 g'],
        ['Barbecue', '12 pack', '158 g'], ['Barbecue', '24 pack', '40 g'], ['Barbecue', '24 pack', '158 g'],
      ]} />
      <P>A shopper on Original + 24 pack only sees 40 g; on Barbecue + 12 pack, only 158 g.</P>

      <H3>Good habits</H3>
      <Rules items={[
        [true, 'Write values the same way every time: "12 pack", not "12pk" on one and "12 Pack" on another.'],
        [true, 'Out of stock for now? Set the quantity to 0 instead of deleting the version.'],
        [true, 'Put the unit in the value: "500 g", "1.5 L", "24 pack".'],
        [false, 'Don\'t make one option hold two things ("Barbecue 24 pack"): use two options.'],
        [false, 'Don\'t create a separate product for each flavour or size.'],
      ]} />

      {/* ── 5 ── */}
      <H id="after">5. After you save</H>
      <Sheet mono={false} headers={['Status', 'What it means', 'What to do']} rows={[
        ['In Review', 'We are checking it.', 'Nothing. You\'ll be notified.'],
        ['Live', 'Shoppers can find and buy it.', 'Keep stock and prices right.'],
        ['Rejected', 'Something needs fixing. The reason is shown on the product.', 'Fix it and press Save changes: it goes back to review.'],
        ['Draft', 'Saved but not sent for review, usually because it has no photo.', 'Add a photo and save.'],
        ['Disabled', 'Hidden from shoppers.', 'Contact support if you didn\'t expect it.'],
      ]} />

      {/* ── 6 ── */}
      <H id="healthy">6. Keeping your products selling</H>
      <Rules items={[
        [true, <>Keep stock right. Low on something? <A href="/products?stock=low">Low-stock products</A> lists them.</>],
        [true, 'Answer shopper questions and messages quickly: fast replies win sales.'],
        [true, <>Paid <A href="/tools">Seller tools</A> help too: Bulk edit (many prices at once), Listing doctor (scores and improves your listings), Stock forecast (what will run out), and more. Each tool opens with its own short guide.</>],
      ]} />

      {/* ── 7 ── */}
      <H id="bulk">7. Adding many products at once (bulk upload)</H>
      <P>If your plan includes it, <A href="/products/bulk-upload">Bulk upload</A> adds up to 500 products at once, two ways:</P>
      <Steps items={[
        ['In the browser', 'A card per product: name, category, price, stock, weight and photos from your phone or computer. Tap "Comes in versions?" for versions, exactly as in the product form. Best for most sellers and on phones.'],
        ['From a spreadsheet', 'Download the template, fill one row per product in Excel or Google Sheets, save as CSV and upload. Photos come from links. Best if your list is already in a spreadsheet.'],
      ]} />
      <H3>Versions in a spreadsheet</H3>
      <P>Write <b>one row per version, all with the same title</b>, and name the options in the option columns. Product details (category, description, weight…) go on the first row; every row has its own price, stock and photo:</P>
      <Sheet headers={['title', 'category', 'price', 'stock', 'weight_kg', 'option1_name', 'option1_value', 'option2_name', 'option2_value']} rows={[
        ['Potato Crisps', 'crisps-snacks', '20.00', '14', '0.9', 'Flavour', 'Original', 'Pack size', '12 pack'],
        ['Potato Crisps', '', '21.00', '9', '', 'Flavour', 'Barbecue', 'Pack size', '12 pack'],
        ['Potato Crisps', '', '38.00', '0', '', 'Flavour', 'Barbecue', 'Pack size', '24 pack'],
        ['Potato Crisps', '', '39.00', '6', '', 'Flavour', 'Sour Cream & Onion', 'Pack size', '24 pack'],
      ]} />
      <P>Only write the versions you sell: there is no &ldquo;every combination&rdquo; in a spreadsheet. A third option goes in <code>option3_name</code> / <code>option3_value</code>. The category code comes from the list on the upload page.</P>
      <Callout tone="tip">
        Read the full <A href="/products/bulk-upload/guide">bulk upload guide</A> before your first upload: photo links that work, every column, and what to do when a row is refused.
      </Callout>

      {/* ── FAQ ── */}
      <H id="faq">Questions</H>
      <Faq items={FAQ} />

      <Box sx={{ mt: 4, p: 3, borderRadius: '16px', bgcolor: 'action.hover', textAlign: 'center' }}>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>Ready to sell?</Typography>
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button component={Link} href="/products/product" variant="contained" disableElevation
            sx={{ bgcolor: 'text.primary', color: 'background.paper', borderRadius: '10px', fontWeight: 700 }}>Add a product</Button>
          <Button component={Link} href="/products/bulk-upload" variant="outlined" sx={{ borderRadius: '10px', fontWeight: 600 }}>Bulk upload</Button>
        </Box>
      </Box>
    </GuidePage>
  );
}
