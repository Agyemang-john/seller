'use client';

import React, { useCallback } from 'react';
import { Box, Button, Stack } from '@mui/material';
import { useParams } from 'next/navigation';
import Main from '@/components/products/Main';
import PageContainer from '@/components/PageContainer';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const pageTitle = id ? "Edit Product" : "Add New Product";

  const handleBack = useCallback(() => {
      router.back();
    }, [router]);

  return (
    <PageContainer
          title={pageTitle}
          breadcrumbs={[
            { title: 'Home', path: '/dashboard' },
            { title: pageTitle },
          ]}
        >
      <Main id={id} />
      <Stack direction="row" spacing={2} justifyContent="space-between">
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Back
        </Button>
      </Stack>
    </PageContainer>
  );
}
