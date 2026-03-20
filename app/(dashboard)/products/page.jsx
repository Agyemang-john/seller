// app/vendor/products/page.jsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Box } from '@mui/material';
import PageContainer from '@/components/PageContainer';
import ProductList from '@/components/products/ProductList';
import ProductListSkeleton from '@/components/products/Productlistskeleton';
import ProductListError from '@/components/products/Productlisterror';
import { createAxiosClient } from '@/utils/clientFetch';

const PAGE_TITLE = 'My Products';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const client   = createAxiosClient();
      const response = await client.get('/api/v1/vendor/products/');
      setProducts(response.data.products || response.data || []);
    } catch (err) {
      const msg = err?.response?.data?.detail
        || err?.response?.data?.error
        || err?.message
        || 'Could not load your products. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleProductDeleted = useCallback((id) => {
    setProducts((prev) => prev.filter((p) => (p.product?.id ?? p.id) !== id));
  }, []);

  return (
    <PageContainer
      title={''}
      breadcrumbs={[{ title: 'Home', path: '/dashboard' }, { title: PAGE_TITLE }]}
    >
      <Box sx={{ pb: 8 }}>
        {loading  && <ProductListSkeleton />}
        {error    && !loading && <ProductListError message={error} onRetry={fetchProducts} />}
        {!loading && !error   && <ProductList products={products} onProductDeleted={handleProductDeleted} />}
      </Box>
    </PageContainer>
  );
}