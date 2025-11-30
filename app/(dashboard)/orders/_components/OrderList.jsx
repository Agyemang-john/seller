"use client";

import { useState, useEffect, useCallback } from 'react';
import { createAxiosClient } from '@/utils/clientFetch';
import { useRouter, useSearchParams } from 'next/navigation';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';

const INITIAL_PAGE_SIZE = 10;

export default function OrderList() {
  const axiosClient = createAxiosClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL query parameters, with fallback for prerendering
  const [page, setPage] = useState(() => {
    if (!searchParams) return 0; // Fallback for prerendering
    const pageParam = parseInt(searchParams.get('page'), 10);
    return isNaN(pageParam) ? 0 : pageParam - 1; // Convert to 0-based index
  });
  const [pageSize, setPageSize] = useState(() => {
    if (!searchParams) return INITIAL_PAGE_SIZE; // Fallback for prerendering
    const sizeParam = parseInt(searchParams.get('page_size'), 10);
    return isNaN(sizeParam) ? INITIAL_PAGE_SIZE : sizeParam;
  });
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: (page + 1).toString(), // Backend expects 1-based page index
        page_size: pageSize.toString(),
      });

      const response = await axiosClient.get('/api/v1/vendor/orders/', { params });
      const responseData = response.data;

      setData(responseData.results || responseData.items || []);
      setTotalCount(responseData.count || 0);
    } catch (error) {
      console.error(`Failed to load orders: ${error.response?.data?.detail || error.message}`);
      setData([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize]);

  // Update URL and load data when page or pageSize changes
  useEffect(() => {
    // Skip URL updates during prerendering (when router is not fully available)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams({
        page: (page + 1).toString(), // 1-based for URL
        page_size: pageSize.toString(),
      });
      router.push(`?${params.toString()}`, { scroll: false });
    }
    loadData();
  }, [page, pageSize, router]);

  const handleRefresh = useCallback(() => {
    if (!isLoading) {
      loadData();
    }
  }, [isLoading]);

  const handleRowClick = useCallback((orderId) => {
    router.push(`/orders/${orderId}/detail`);
  }, [router]);

  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  const handleChangePageSize = (event) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when page size changes
  };

  return (
    <div className="container px-0 sm:px-6 lg:px-0 py-6 max-w-7xl">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-600">Order List</h2>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed ${isLoading ? 'animate-pulse' : ''}`}
        >
          <RefreshIcon className="mr-2" />
          Refresh
        </button>
      </div>

      {/* Loading State */}
      {isLoading && data.length === 0 && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
        </div>
      )}

      {/* Table */}
      {!isLoading && data.length > 0 && (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="">
              <tr>
                {['ID', 'Order Number', 'Ordered On', 'Amount (GHS)', 'Payment Method', 'Customer', 'Status', 'Delivery Status', 'Actions'].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider sm:px-6"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => handleRowClick(row.id)}
                  className="hover:bg-gray-50 cursor-pointer transition"
                >
                  <td className="px-4 py-4 sm:px-6 text-sm text-gray-600">{row.id}</td>
                  <td className="px-4 py-4 sm:px-6 text-sm text-gray-600">{row.order_number}</td>
                  <td className="px-4 py-4 sm:px-6 text-sm text-gray-600">
                    {row.date_created ? new Date(row.date_created).toLocaleDateString() : ''}
                  </td>
                  <td className="px-4 py-4 sm:px-6 text-sm text-gray-600">{row.grand_total}</td>
                  <td className="px-4 py-4 sm:px-6 text-sm text-gray-600">{row.payment_method}</td>
                  <td className="px-4 py-4 sm:px-6 text-sm text-gray-600">{row.user_email}</td>
                  <td className="px-4 py-4 sm:px-6 text-sm text-gray-600">{row.status}</td>
                  <td className="px-4 py-4 sm:px-6 text-sm text-gray-600">{row.vendor_delivery_status}</td>
                  <td className="px-4 py-4 sm:px-6 text-sm text-gray-600">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/orders/${row.id}/detail`);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <EditIcon fontSize="small" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 sm:px-6 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">
                Showing {page * pageSize + 1} to{' '}
                {Math.min((page + 1) * pageSize, totalCount)} of {totalCount} orders
              </span>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={pageSize}
                onChange={handleChangePageSize}
                className="border border-gray-300 rounded-md text-sm px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[5, 10, 25].map((size) => (
                  <option key={size} value={size}>
                    {size} per page
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  onClick={() => handleChangePage(page - 1)}
                  disabled={page === 0}
                  className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handleChangePage(page + 1)}
                  disabled={page >= Math.ceil(totalCount / pageSize) - 1}
                  className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {data.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center h-64 rounded-lg">
          <p className="text-lg font-medium text-gray-500">No orders found</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Try Refreshing
          </button>
        </div>
      )}
    </div>
  );
}