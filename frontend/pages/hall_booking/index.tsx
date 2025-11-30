import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, CheckCircle, Clock, XCircle, Calendar } from 'lucide-react';
import { hallBookingAPI } from '@/api';
import { BookingListItem, BookingStatus } from '@/types';
import { formatDateIST } from '@/utils/timezone';

export default function BookingsList() {
  const [bookings, setBookings] = useState<BookingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('');

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hallBookingAPI.getAll(0, 100, statusFilter || undefined);
      // Sort by booking start date descending
      const sorted = data.sort(
        (a, b) =>
          new Date(b.booking_start_date).getTime() -
          new Date(a.booking_start_date).getTime()
      );
      setBookings(sorted);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch bookings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId: number, newStatus: BookingStatus) => {
    try {
      await hallBookingAPI.updateStatus(bookingId, newStatus);
      setBookings(
        bookings.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
      );
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update booking status');
      console.error(err);
    }
  };

  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.CONFIRMED:
        return <CheckCircle className="text-green-600" size={20} />;
      case BookingStatus.PENDING:
        return <Clock className="text-yellow-600" size={20} />;
      case BookingStatus.CANCELLED:
        return <XCircle className="text-red-600" size={20} />;
    }
  };

  const getStatusBadgeClass = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.CONFIRMED:
        return 'badge-success';
      case BookingStatus.PENDING:
        return 'badge-warning';
      case BookingStatus.CANCELLED:
        return 'badge-danger';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600 mt-2">Manage and track all your event bookings</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Link href="/calendar">
            <button className="btn btn-secondary flex items-center gap-2 whitespace-nowrap">
              <Calendar size={20} />
              Calendar
            </button>
          </Link>
          <Link href="/hall_booking/create">
            <button className="btn btn-primary flex items-center gap-2 whitespace-nowrap">
              <Plus size={20} />
              New Booking
            </button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Filter Section */}
      <div className="card-modern">
        <label className="flex items-center gap-3">
          <span className="font-semibold text-gray-700">Filter by Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as BookingStatus | '')}
            className="form-select max-w-xs"
          >
            <option value="">All Bookings</option>
            <option value={BookingStatus.CONFIRMED}>Confirmed</option>
            <option value={BookingStatus.PENDING}>Pending</option>
            <option value={BookingStatus.CANCELLED}>Cancelled</option>
          </select>
        </label>
      </div>

      {bookings.length === 0 ? (
        <div className="card-modern text-center py-16">
          <div className="mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-red-100 rounded-full flex items-center justify-center mx-auto">
              <Plus className="text-pink-600" size={40} />
            </div>
          </div>
          <p className="text-gray-600 text-lg mb-6">No bookings found. Create one to get started!</p>
          <Link href="/hall_booking/create">
            <button className="btn btn-primary">Create Your First Booking</button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="card-modern hover:shadow-xl transition-all"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
                {/* Customer Info */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Customer</p>
                  <p className="text-lg font-bold text-gray-900">{booking.customer_name}</p>
                  <p className="text-sm text-gray-600 mt-1">{booking.customer_phone || 'N/A'}</p>
                </div>

                {/* Hall & Purpose */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Hall & Purpose</p>
                  <div className="relative group">
                    <p className="text-lg font-bold text-gray-900 cursor-help hover:text-pink-600 transition-colors">
                      {booking.hall_name}
                    </p>
                    {/* Tooltip */}
                    <div className="invisible group-hover:visible absolute left-0 top-full mt-2 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg w-48 z-10">
                      <div className="mb-2">
                        <p className="font-semibold mb-1">Booking Details:</p>
                        <p>📅 {formatDateIST(booking.booking_start_date)} to {formatDateIST(booking.booking_end_date)}</p>
                        <p>🕐 {booking.start_time} - {booking.end_time}</p>
                        <p>👤 {booking.customer_name}</p>
                        {booking.event_purpose && <p>📝 {booking.event_purpose}</p>}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 truncate">{booking.event_purpose || 'No purpose specified'}</p>
                </div>

                {/* Dates & Time */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Booking Period (IST)</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatDateIST(booking.booking_start_date)}
                  </p>
                  <p className="text-sm text-gray-600">
                    to {formatDateIST(booking.booking_end_date)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {booking.start_time} - {booking.end_time}
                  </p>
                </div>

                {/* Status & Actions */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Status</p>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(booking.status)}
                      <span className={`badge ${getStatusBadgeClass(booking.status)} capitalize`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {booking.status === BookingStatus.PENDING && (
                      <button
                        onClick={() =>
                          handleStatusChange(booking.id, BookingStatus.CONFIRMED)
                        }
                        className="btn btn-sm btn-success"
                        title="Confirm booking"
                      >
                        Confirm
                      </button>
                    )}
                    {booking.status !== BookingStatus.CANCELLED && (
                      <button
                        onClick={() =>
                          handleStatusChange(booking.id, BookingStatus.CANCELLED)
                        }
                        className="btn btn-sm btn-secondary"
                        title="Cancel booking"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
