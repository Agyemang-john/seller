'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Main from '@/components/products/Main';

export default function EditProductPage() {
  const { id } = useParams();

  return (
    <>
      <Main id={id} />
    </>
  );
}
