import React from 'react';
import Link from 'next/link';
import { Eye, BarChart3 } from 'lucide-react';
import SevaBookingForm from '../../components/SevaBookingForm';

const SevaBookingsPage: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Buttons */}
      <div className="flex gap-3 justify-end flex-wrap mb-2">
        <Link href="/seva_bookings/view">
          <button className="btn btn-secondary flex items-center gap-2 whitespace-nowrap">
            <Eye size={20} />
            Sevas Booked Today
          </button>
        </Link>
        <Link href="/seva_bookings/reports">
          <button className="btn btn-secondary flex items-center gap-2 whitespace-nowrap">
            <BarChart3 size={20} />
            Tomorrow's Sevas
          </button>
        </Link>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto">
        <SevaBookingForm />
      </div>
    </div>
  );
};

export default SevaBookingsPage;
