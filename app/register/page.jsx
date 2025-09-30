"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Container, Typography, Button, Box } from "@mui/material";
import { motion } from "framer-motion";


export default function SellerRegisterPage() {
  const router = useRouter();

  const handleContinue = () => {
    router.push("/register/step-1");
  };

  return (
    <main className="min-h-screen">
      {/* CTA Section */}
      <Box className="py-12 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <Container className="text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Typography
              variant="h3"
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Ready to Grow Your Business?
            </Typography>
            <Typography className="text-lg mb-6">
              Sign up today and start selling on Negromart’s trusted marketplace.
            </Typography>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={handleContinue}
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-full text-lg font-semibold"
              >
                Start Selling Now
              </Button>
            </motion.div>
          </motion.div>
        </Container>
      </Box>
    </main>
  );
}