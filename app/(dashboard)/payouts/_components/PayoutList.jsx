'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BanknotesIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { createAxiosClient } from '@/utils/clientFetch';

const PayoutList = () => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const axiosClient = createAxiosClient();

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/api/v1/vendor/payouts/');
      setPayouts(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load payouts. Please try again later.');
      console.error('Error fetching payouts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  const getStatusStyles = (status) => {
    switch (status) {
      case 'success':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          icon: <CheckCircleIcon className="h-5 w-5 text-green-600" />,
        };
      case 'failed':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          icon: <ExclamationCircleIcon className="h-5 w-5 text-red-600" />,
        };
      default:
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          icon: <ClockIcon className="h-5 w-5 text-yellow-600" />,
        };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>{error}</p>
        <button
          onClick={fetchPayouts}
          className="mt-2 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="py-8 px-0 sm:px-0 lg:px-0 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-xl p-6 sm:p-8"
      >
        <div className="flex items-center mb-6">
          <BanknotesIcon className="h-8 w-8 text-indigo-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Your Payouts</h2>
        </div>

        {payouts.length === 0 ? (
          <p className="text-gray-500 text-center">No payouts available.</p>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-sm font-medium text-gray-500">
                    <th className="py-2 px-4">Date</th>
                    <th className="py-2 px-4">Amount</th>
                    <th className="py-2 px-4">Product Total</th>
                    <th className="py-2 px-4">Delivery Fee</th>
                    <th className="py-2 px-4">Status</th>
                    <th className="py-2 px-4">Transaction ID</th>
                    <th className="py-2 px-4">Orders</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {payouts?.map((payout) => {
                      const styles = getStatusStyles(payout.status);
                      return (
                        <motion.tr
                          key={payout.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="rounded-lg"
                        >
                          <td className="py-4 px-4 text-sm">
                            {new Date(payout.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4 text-sm">
                            {payout.currency} {payout.amount}
                          </td>
                          <td className="py-4 px-4 text-sm">
                            {payout.currency} {payout.product_total}
                          </td>
                          <td className="py-4 px-4 text-sm">
                            {payout.currency} {payout.delivery_fee}
                          </td>
                          <td className="py-4 px-4 text-sm">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles.bg} ${styles.text}`}
                            >
                              {styles.icon}
                              <span className="ml-1">{payout.status_display}</span>
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm">
                            {payout.transaction_id || 'N/A'}
                          </td>
                          <td className="py-4 px-4 text-sm">
                            {payout.order?.map((order) => order.order_number).join(', ')}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="md:hidden space-y-4">
              <AnimatePresence>
                {payouts?.map((payout) => {
                  const styles = getStatusStyles(payout.status);
                  return (
                    <motion.div
                      key={payout.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="bg-gray-50 rounded-lg p-4 shadow-sm"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(payout.created_at).toLocaleDateString()}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles.bg} ${styles.text}`}
                        >
                          {styles.icon}
                          <span className="ml-1">{payout.status_display}</span>
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Amount:</span>
                          <p>{payout.currency} {payout.amount}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Product Total:</span>
                          <p>{payout.currency} {payout.product_total}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Delivery Fee:</span>
                          <p>{payout.currency} {payout.delivery_fee}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Transaction ID:</span>
                          <p>{payout.transaction_id || 'N/A'}</p>
                        </div>
                        <div className="col-span-2">
                          <span className="font-medium text-gray-600">Orders:</span>
                          <p>{payout.orders?.map((order) => order.order_number).join(', ')}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default PayoutList;