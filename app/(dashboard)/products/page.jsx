// app/vendor/products/page.jsx
'use client';

import { useEffect, useState } from 'react';
import ProductList from '@/components/products/ProductList';
import Swal from 'sweetalert2';
import { createAxiosClient } from '@/utils/clientFetch';


export default function ProductsPage() {
  const axiosClient = createAxiosClient();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosClient.get('/api/v1/vendor/products/');
        setProducts(response.data.products || response.data || []);
      } catch (err) {
        console.error('Error fetching products:', err.message);
        Swal.fire({
          icon: 'error',
          title: 'Error loading products',
          text: 'Please try again later.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading products...</div>;
  }

  return <ProductList products={products} />;
}
