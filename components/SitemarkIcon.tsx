'use client';

import * as React from 'react';
import Image from 'next/image';

export default function SitemarkIcon() {
  return (
      <Image 
        src='/favicon.png' 
        width={40}
        height={40}
        alt='icon'
        style={{ marginLeft: 4 }}
      />
  );
}
