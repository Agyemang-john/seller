'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { createAxiosClient } from '@/utils/clientFetch';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { Box } from '@mui/material';
import PageContainer from '@/components/PageContainer';

export default function ProductList({ products }) {
  const pageTitle = "My Products";
  const axiosClient = createAxiosClient();
  const router = useRouter();
  const [productList, setProductList] = useState(products || []);

  const handleEditClick = (id) => {
    router.push(`/products/product/${id}`);
  };

  const handleDelete = async (productId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You won’t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        await axiosClient.delete(`/api/v1/vendor/products/${productId}/`);
        Swal.fire('Deleted!', 'Your product has been deleted.', 'success');
        setProductList(productList.filter((p) => p.id !== productId));
      } catch (error) {
        Swal.fire(
          'Error!',
          error.response?.data || 'An error occurred while deleting the product.',
          'error'
        );
      }
    }
  };

  return (
    <PageContainer
      title={pageTitle}
      breadcrumbs={[
        { title: 'Home', path: '/dashboard' },
        { title: pageTitle },
      ]}
    >
      <Box className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <button
            onClick={() => router.push('/products/product')}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg shadow-md hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            <Plus size={20} />
            <span className="font-medium">Add New Product</span>
          </button>
        </div>

        {/* No Products */}
        {productList.length === 0 ? (
          <div className="text-center py-16 rounded-xl shadow-sm border border-gray-100">
            <Package size={60} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-700">No products yet</h3>
            <p className="text-gray-500 mt-2">Start by adding a new product to your catalog.</p>
            <button
              onClick={() => router.push('/products/product')}
              className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300"
            >
              <Plus size={18} />
              Add Your First Product
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {productList.map((product) => (
              <div
                key={product.id}
                className="rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col border border-gray-100 hover:border-gray-200"
              >
                {/* Image */}
                <div className="relative aspect-w-4 aspect-h-3">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => (e.target.src = '/logo-1.png')} // Fallback image
                  />
                  <span
                    className={`absolute top-2 left-2 text-xs font-medium px-2.5 py-1 rounded-full ${
                      product.status !== 'published'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-lg font-semibold text-gray-500 line-clamp-2 min-h-[3rem]">
                    {product.title}
                  </h3>
                  <p className="text-base font-medium text-gray-600 mt-2">
                    GHS {product.price}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span
                      className={`font-medium ${
                        product.total_quantity > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {product.total_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                    <span className="text-gray-500">Qty: {product.total_quantity}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-4 py-3 flex justify-between items-center border-t border-gray-100">
                  <button
                    onClick={() => handleEditClick(product.id)}
                    className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium transition-all duration-200 hover:underline"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex items-center gap-1.5 text-red-600 hover:text-red-800 font-medium transition-all duration-200 hover:underline"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Box>
    </PageContainer>
  );
}