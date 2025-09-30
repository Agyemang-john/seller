// app/vendor/products/page.jsx
import ProductList from '@/components/products/ProductList';
import { createServerAxios } from "@/utils/serverFetch";

export const metadata = {
  title: 'Products',
  description: 'View and manage your store products. Add, update, or delete listings efficiently.',
  keywords: ['negromart', 'dashboard', 'ecommerce', 'seller management'],
  robots: 'noindex, nofollow', 
};

async function getProducts() {
  try {
    const axiosClient = await createServerAxios();
    const response = await axiosClient.get(`/api/v1/vendor/products/`);
    return response.data.products || response.data || [];
  } catch (err) {
    console.error('Error fetching products:', err.message);
    return [];
  }
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
      <ProductList products={products} />
  );
}
