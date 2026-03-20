// app/vendor/products/product/[id]/view/page.jsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PageContainer from '@/components/PageContainer';
import { createAxiosClient } from '@/utils/clientFetch';
import ProductDetailView from './_components/ProductDetailView';
import { ProductDetailSkeleton } from './_components/ProductDetailSkeleton';
import { ProductDetailError } from './_components/ProductDetailError';

export default function ProductViewPage() {
  const { id } = useParams();
  const router = useRouter();

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const client   = createAxiosClient();
      const response = await client.get(`/api/v1/vendor/products/${id}/analytics/`);
      setData(response.data);
    } catch (err) {
      const msg = err?.response?.data?.detail
        || err?.response?.data?.error
        || err?.message
        || 'Could not load product analytics.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const title = data?.title || 'Product Analytics';

  return (
    <PageContainer
      title={''}
      breadcrumbs={[
        { title: 'Home',     path: '/dashboard' },
        { title: 'Products', path: '/products'  },
        { title: title },
      ]}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1.5 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/products')}
          sx={{ borderRadius: '10px', color: 'text.secondary', fontWeight: 600, '&:hover': { bgcolor: 'action.hover', color: 'text.primary' } }}>
          Back to products
        </Button>
        {data && (
          <Button variant="outlined" startIcon={<EditOutlinedIcon />} onClick={() => router.push(`/products/product/${id}`)}
            sx={{ borderRadius: '10px', borderColor: 'divider', color: 'text.secondary', fontWeight: 600, '&:hover': { borderColor: 'text.primary', color: 'text.primary' } }}>
            Edit product
          </Button>
        )}
      </Box>

      {loading              && <ProductDetailSkeleton />}
      {error   && !loading  && <ProductDetailError message={error} onRetry={fetchData} />}
      {!loading && !error && data && <ProductDetailView data={data} />}
    </PageContainer>
  );
}