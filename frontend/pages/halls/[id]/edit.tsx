import React from 'react';
import { useRouter } from 'next/router';
import HallForm from '@/components/HallForm';

export default function EditHall() {
  const router = useRouter();
  const { id } = router.query;

  if (!id) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Edit Hall</h1>
      <HallForm hallId={parseInt(id as string, 10)} />
    </div>
  );
}
