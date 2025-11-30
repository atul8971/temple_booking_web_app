import React from 'react';
import BookingForm from '@/components/BookingForm';

export default function CreateBooking() {
  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <BookingForm />
      </div>
    </div>
  );
}
