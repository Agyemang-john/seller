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

      <Box className="container w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800"></h2>
          <button
            onClick={() => router.push('/products/product')}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
          >
            <Plus size={18} />
            Add New Product
          </button>
        </div>

        {/* No Products */}
        {productList.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-gray-50">
            <Package size={48} className="mx-auto mb-3 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-600">No products yet</h3>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {productList.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-0 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col"
              >
                {/* Image */}
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full object-cover "
                />

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  <span
                    className={`inline-block text-xs font-medium px-2 py-1 rounded-full mb-2 ${
                      product.status !== 'published'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-green-100 text-green-600'
                    }`}
                  >
                    {product.status}
                  </span>

                  <h3 className="text-base font-semibold text-gray-800 truncate">
                    {product.title}
                  </h3>

                  <p className="text-sm text-gray-600 mt-1">
                    GHS {product.price}
                  </p>

                  {/* Stock + Quantity */}
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span
                      className={`font-medium ${
                        product.total_quantity > 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {product.total_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                    <span className="text-gray-600">
                      Qty: {product.total_quantity}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-4 py-2 flex justify-between">
                  <button
                    onClick={() => handleEditClick(product.id)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition"
                  >
                    <Edit size={16} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-800 transition"
                  >
                    <Trash2 size={16} /> Delete
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
