'use client';

import { useParams } from 'next/navigation';
import OrderDetailPage from '../../_components/OrderDetail';

export default function Order() {
  const params = useParams(); 
  const { id } = params; // dynamic id (e.g., "2")

  return (
    <div>
        <OrderDetailPage id={id} />
    </div>
  );
}