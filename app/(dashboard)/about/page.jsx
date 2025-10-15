'use client';

import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { FaShoppingCart, FaUsers, FaRocket, FaHeart } from 'react-icons/fa';
import Link from 'next/link';

const About = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1, ease: 'easeOut', staggerChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const iconHoverVariants = {
    hover: { scale: 1.2, rotate: 10, transition: { duration: 0.3 } },
  };

  return (
      <Container className="py-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          {/* Header Section */}
          <motion.div variants={itemVariants} className="mb-12">
            <Typography
              variant="h1"
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4"
              aria-label="About Negromart"
            >
              Welcome to Negromart
            </Typography>
            <Typography
              variant="h5"
              className="text-lg sm:text-xl md:text-2xl text-center mb-8 max-w-3xl mx-auto"
              
            >
              Empowering Black entrepreneurs to thrive in the global marketplace with a platform built for success and community.
            </Typography>
          </motion.div>

          {/* Mission Section */}
          <motion.div variants={itemVariants} className="mb-16">
            <motion.div
              variants={iconHoverVariants}
              whileHover="hover"
              className="flex justify-center mb-6"
            >
              <FaUsers size={60} className="" aria-hidden="true" />
            </motion.div>
            <Typography
              variant="h4"
              className="text-2xl sm:text-3xl font-semibold mb-4"
            >
              Our Mission
            </Typography>
            <Typography
              variant="body1"
              className="text-base sm:text-lg max-w-4xl mx-auto"
              
            >
              Negromart is dedicated to uplifting Black-owned businesses by connecting sellers with a vibrant community of buyers who celebrate culture, quality, and authenticity. Our tools and insights empower you to grow, succeed, and make a lasting impact.
            </Typography>
          </motion.div>

          {/* Dashboard Features Section */}
          <motion.div variants={itemVariants} className="mb-16">
            <motion.div
              variants={iconHoverVariants}
              whileHover="hover"
              className="flex justify-center mb-6"
            >
              <FaShoppingCart size={60} className="" aria-hidden="true" />
            </motion.div>
            <Typography
              variant="h4"
              className="text-2xl sm:text-3xl font-semibold mb-4"
            >
              Your Seller Dashboard
            </Typography>
            <Typography
              variant="body1"
              className="text-base sm:text-lg max-w-4xl mx-auto"
              
            >
              The Negromart Seller Dashboard is your all-in-one command center. Effortlessly manage products, track sales, analyze performance, and engage with customers. With intuitive tools and real-time analytics, we help you focus on building your brand.
            </Typography>
          </motion.div>

          {/* Why Negromart Section */}
          <motion.div variants={itemVariants} className="mb-16">
            <motion.div
              variants={iconHoverVariants}
              whileHover="hover"
              className="flex justify-center mb-6"
            >
              <FaRocket size={60} className="" aria-hidden="true" />
            </motion.div>
            <Typography
              variant="h4"
              className="text-2xl sm:text-3xl font-semibold mb-4"
            >
              Why Choose Negromart?
            </Typography>
            <Typography
              variant="body1"
              className="text-base sm:text-lg max-w-4xl mx-auto"
              
            >
              Negromart is a movement celebrating Black excellence. Our platform offers a space where your business can shine, supported by streamlined inventory management, marketing tools, and a community that values your vision. Scale and succeed with us.
            </Typography>
          </motion.div>

          {/* Community Commitment Section */}
          <motion.div variants={itemVariants} className="mb-16">
            <motion.div
              variants={iconHoverVariants}
              whileHover="hover"
              className="flex justify-center mb-6"
            >
              <FaHeart size={60} className="" aria-hidden="true" />
            </motion.div>
            <Typography
              variant="h4"
              className="text-2xl sm:text-3xl font-semibold mb-4"
            >
              Our Commitment
            </Typography>
            <Typography
              variant="body1"
              className="text-base sm:text-lg max-w-4xl mx-auto"
              
            >
              We are committed to fostering a thriving ecosystem for Black entrepreneurs. Negromart provides resources, support, and opportunities to help you succeed while celebrating the richness of Black culture and innovation.
            </Typography>
          </motion.div>

          {/* Call to Action */}
          <motion.div variants={itemVariants}>
            <Link href="/dashboard" passHref>
              <Button
                variant="contained"
                className="bg-black text-white hover:bg-gray-900 py-3 px-8 text-lg font-semibold rounded-full shadow-lg"
                aria-label="Explore Your Dashboard"
              >
                Explore Your Dashboard
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Decorative Background Element */}
        <Box
          className="absolute top-0 left-0 w-full h-full -z-20 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle, #000 3px, transparent 3px)',
            backgroundSize: '30px 30px',
          }}
        />
      </Container>
  );
};

export default About;