'use client';

import React, { Suspense } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

import ClientProviders from '@/hooks/ClientProviders';


// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state: { hasError: boolean; error: Error | null } = { hasError: false, error: null };

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error: (error as Error) ?? new Error(String(error)) };
  }

  render() {
    if (this.state.hasError) {
      const message = this.state.error ? this.state.error.message ?? String(this.state.error) : 'Unknown error';
      return (
        <Box p={4} textAlign="center">
          <Typography color="error" variant="h6">
            Error loading dashboard: {message}
          </Typography>
          <Typography>Please try refreshing the page or contact support.</Typography>
        </Box>
      );
    }
    return this.props.children;
  }
}


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <CircularProgress />
          <Typography ml={2}>Loading...</Typography>
        </Box>
      }
    >
      <ErrorBoundary>
        <ClientProviders>{children}</ClientProviders>
      </ErrorBoundary>
    </Suspense>
  );
}