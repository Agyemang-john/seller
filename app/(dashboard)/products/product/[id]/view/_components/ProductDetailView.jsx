'use client';

import { Box, Grid, Stack, Typography, Divider } from '@mui/material';
import { ProductHero } from './ProductHero';
import { SalesKPIs } from './SalesKPIs';
import { SalesTrendChart } from './SalesTrendChart';
import { StockChart } from './StockChart';
import { OrderStatusChart } from './OrderStatusDonut';
import { EngagementTiles } from './EngagementTiles';
import { RatingDistribution } from './RatingDistribution';
import { DeliveryInfo } from './DeliveryInfo';
import { ProductMeta } from './ProductMeta';

function SectionLabel({ children }) {
  return (
    <Typography variant="caption" sx={{
      display: 'block', fontWeight: 700, letterSpacing: '0.1em',
      textTransform: 'uppercase', color: 'text.disabled', fontSize: 10, mb: 2,
    }}>
      {children}
    </Typography>
  );
}

export default function ProductDetailView({ data }) {
  return (
    <Box sx={{ pb: 10 }}>

      <ProductHero data={data} />

      <Divider sx={{ my: 4 }} />

      <SectionLabel>Negromart Seller Center</SectionLabel>
      <SalesKPIs data={data} />

      <Divider sx={{ my: 4 }} />

      <SectionLabel>Revenue trends</SectionLabel>
      <Grid container spacing={2.5} sx={{ mb: 0 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <SalesTrendChart data={data.sales_trend} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <OrderStatusChart data={data.order_status_breakdown} />
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      <SectionLabel>Stock & inventory</SectionLabel>
      <StockChart
        data={data.stock_by_variant}
        variantType={data.variant}
        totalStock={data.total_stock}
      />

      <Divider sx={{ my: 4 }} />

      <SectionLabel>Customer engagement</SectionLabel>
      <EngagementTiles data={data} />

      <Divider sx={{ my: 4 }} />

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 5 }}>
          <SectionLabel>Rating distribution</SectionLabel>
          <RatingDistribution
            distribution={data.rating_distribution}
            avgRating={data.avg_rating}
            reviewCount={data.review_count}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <SectionLabel>Product info & delivery</SectionLabel>
          <Stack spacing={2}>
            <DeliveryInfo options={data.delivery_options} />
            <ProductMeta data={data} />
          </Stack>
        </Grid>
      </Grid>

    </Box>
  );
}