/**
 * How-to guides for the paid seller tools, shown at the top of each tool page
 * (ToolGuide) and on the locked page as "what you get". Plain words, short
 * steps: most sellers read these on a phone between customers.
 *
 * Keys match backend tools/registry.py.
 */

const GUIDES = {
  bulk_edit: {
    goal: 'Change prices, stock and costs of many products in minutes instead of one by one.',
    steps: [
      'Search or filter to the products you want, then edit the numbers right in the table.',
      'For big changes, tick products and use an action like "Change price by %" (e.g. -10 for a 10% sale).',
      'Prefer a spreadsheet? Download the CSV, edit it in Excel or Google Sheets, and upload it back.',
      'Press Save. Rows with a mistake are shown in red and nothing else is affected.',
    ],
    tip: 'Fill in "Cost" for each product once: the Profit report uses it to show what you really earn.',
  },
  stock_forecast: {
    goal: 'Know what will run out before it does, so you never lose sales to "out of stock".',
    steps: [
      'Each product shows how many days of stock are left at your current sales pace.',
      'Set how long your supplier takes to deliver (restock days) so the reorder list is right.',
      'Open "Reorder now" for the list of what to buy and how many.',
    ],
    tip: 'You also get one alert each morning when something will run out before a restock could arrive.',
  },
  listing_doctor: {
    goal: 'Better listings get found and bought more. This scores each listing and fixes the weak ones.',
    steps: [
      'Start with the lowest scores: the list shows what is missing (photos, details, a clear title…).',
      'Press "Improve with AI" to get a better title and description written for you.',
      'Read it, change anything you like, then press Apply. Nothing changes until you apply.',
    ],
    tip: 'Add at least 4 clear photos and fill every detail field: that alone lifts most scores a lot.',
  },
  profit_report: {
    goal: 'See your real profit, after Negromart fees, refunds, ads and what the goods cost you.',
    steps: [
      'Pick a month to see sales, fees, refunds and profit side by side.',
      'Sort products by profit to find your winners, and the ones losing you money.',
      'Products without a cost show a warning: add the cost in Bulk edit for exact numbers.',
    ],
    tip: 'A product with high sales but low profit may just need a small price rise.',
  },
  price_insights: {
    goal: 'See what other sellers charge for the same items, and keep your price competitive automatically.',
    steps: [
      'Each product shows the lowest, typical and highest price on Negromart, and whether you win the buy box.',
      'Turn on the auto-repricer for a product and set your lowest and highest price.',
      'Every 15 minutes it beats or matches the cheapest offer, never going below your minimum.',
    ],
    tip: 'Set your minimum above your cost plus fees, so a price war never costs you money.',
  },
  auto_repricer: {
    goal: 'Keep prices competitive automatically, within limits you set.',
    steps: [
      'Open Price insights and switch on the repricer for a product.',
      'Set the lowest and highest price you accept, and whether to beat or match the cheapest offer.',
      'Every price change is listed under "Price changes" so you can check it.',
    ],
    tip: 'You get a notice if a product sits at your minimum price: time to look at your cost.',
  },
  demand_insights: {
    goal: 'Stock what shoppers are already looking for.',
    steps: [
      'See the most searched words in your categories over the last 4 weeks.',
      '"Nothing found" lists searches that found no products at all: easy sales nobody is taking yet.',
      'Add products that match, using the shopper’s own words in your titles.',
    ],
    tip: 'Check it every Monday: new searches show up as seasons and trends change.',
  },
  promotions: {
    goal: 'Bring customers back and sell more, without having to remember to do it.',
    steps: [
      'Win-back: sends a personal coupon to customers who haven’t bought from you in a while.',
      'Thank-you: gives first-time buyers a coupon for their next order after delivery.',
      'Weekly sale: picks a day and time and puts up to 5 products on sale every week.',
      'Switch each one on, set the discount, and it runs by itself. Results show on each card.',
    ],
    tip: 'Start with 10% on win-back: it usually pays for itself with the first returning order.',
  },
  broadcasts: {
    goal: 'Tell your followers and past buyers about new arrivals and sales.',
    steps: [
      'Choose who gets it: followers, past buyers, or both.',
      'Write a short subject and message, and add up to 4 products to show as cards.',
      'Press "Send me a preview" to see exactly what shoppers will get (free, and only you get it).',
      'Press Send. It arrives in the Negromart app, by email, and by SMS if your plan has texts and you tick it.',
    ],
    tip: 'Ask happy customers to follow your store: every follower can hear about your next sale. Your own team never gets your messages, so test with a preview.',
  },
  labels: {
    goal: 'Print everything for today’s orders in one go.',
    steps: [
      'Tick the orders you are packing (or "Select all").',
      'Pick a document: labels (thermal 4×6 or A4), packing slips, or a pick list.',
      'Press Print. A PDF opens, ready for your printer.',
    ],
    tip: 'Print the pick list first, collect everything off the shelves, then print labels while you pack.',
  },
  chat_tools: {
    goal: 'Answer shoppers faster: fast replies win more sales.',
    steps: [
      'Save answers to questions you get often (delivery times, sizes, returns).',
      'In a chat, tap the quick-reply button next to the message box and pick one.',
      'Set an away message for when you are closed or on holiday, so shoppers aren’t left waiting.',
    ],
    tip: 'Watch "Typical first reply" at the top: aim for under an hour.',
  },
  store_link: {
    goal: 'Bring your own customers to your Negromart store, and make the page feel like yours.',
    steps: [
      'Choose a short link name, e.g. negromart.com/s/your-shop, and share it on WhatsApp and social media.',
      'Download the QR code and put it on flyers, packaging and your shop counter.',
      'Pick a colour, a tagline, an announcement and up to 8 featured products for your store page.',
    ],
    tip: 'Put the QR code inside every parcel: buyers scan it to order again.',
  },
  api: {
    goal: 'Connect your own systems (a POS, a stock sheet, another shop) so stock and orders stay in sync.',
    steps: [
      'Create an API key and give it to whoever builds or runs your system. Keep it secret.',
      'Their system updates stock and prices by SKU and reads your new orders.',
      'Add a webhook so your system hears about new orders the moment they come in.',
    ],
    tip: 'Give each system its own key, and revoke a key the day you stop using that system.',
  },
};

export default GUIDES;
