'use client';
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link'; // Assuming you're using react-router-dom for navigation

const NotVerified = () => {
  // Animation variants for the container
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
        when: 'beforeChildren',
        staggerChildren: 0.2,
      },
    },
  };

  // Animation variants for child elements
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <motion.div
        className="max-w-lg w-full bg-white rounded-2xl p-8 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Icon */}
        <motion.div variants={itemVariants}>
          <div className="mx-auto mb-6 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-3xl font-bold text-gray-800 mb-4"
          variants={itemVariants}
        >
          Vendor Account Not Verified
        </motion.h1>

        {/* Message */}
        <motion.p
          className="text-gray-600 mb-6 leading-relaxed"
          variants={itemVariants}
        >
          Your seller account is currently under review or has not been approved yet. Please ensure all required documents have been submitted and verified. You will be notified once your account is approved.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row justify-center gap-4"
          variants={itemVariants}
        >
          {/* <Link
            href="/"
            className="inline-block bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-300"
          >
            Upload Documents
          </Link> */}
          <Link
            href="/"
            className="inline-block bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors duration-300"
          >
            Contact Support
          </Link>
        </motion.div>

        {/* Additional Info */}
        <motion.p
          className="mt-6 text-sm text-gray-500"
          variants={itemVariants}
        >
          Need help?{' '}
          <Link
            href="/"
            className="text-blue-600 hover:underline"
          >
            support@negromart.com
          </Link>{' '}
          for more information on the verification process.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default NotVerified;