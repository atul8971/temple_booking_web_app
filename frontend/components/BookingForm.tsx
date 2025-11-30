import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { hallBookingAPI, hallsAPI } from '@/api';
import { BookingCreateInput, Hall, Booking } from '@/types';
import { format } from 'date-fns';

interface BookingFormProps {
  bookingId?: number;
}

const BookingForm: React.FC<BookingFormProps> = ({ bookingId }) => {
  const router = useRouter();
  const [halls, setHalls] = useState<Hall[]>([]);
  const [formData, setFormData] = useState<BookingCreateInput>({
    hall_id: 0,
    customer_name: '',
    customer_phone: '',
    event_purpose: '',
    booking_start_date: format(new Date(), 'yyyy-MM-dd'),
    booking_end_date: format(new Date(), 'yyyy-MM-dd'),
    start_time: '09:00',
    end_time: '17:00',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(bookingId ? true : false);

  useEffect(() => {
    fetchHalls();
    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  const fetchHalls = async () => {
    try {
      const data = await hallsAPI.getAll(0, 100);
      setHalls(data);
      if (data.length > 0 && !bookingId) {
        setFormData((prev) => ({
          ...prev,
          hall_id: data[0].id,
        }));
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch halls');
      console.error(err);
    }
  };

  const fetchBooking = async () => {
    try {
      setInitialLoading(true);
      const booking = await hallBookingAPI.getById(bookingId!);
      setFormData({
        hall_id: booking.hall_id,
        customer_name: booking.customer_name,
        customer_phone: booking.customer_phone,
        event_purpose: booking.event_purpose || '',
        booking_start_date: booking.booking_start_date.split('T')[0],
        booking_end_date: booking.booking_end_date.split('T')[0],
        start_time: booking.start_time,
        end_time: booking.end_time,
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch booking');
      console.error(err);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'hall_id' ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.customer_name.trim()) {
      setError('Customer name is required');
      return;
    }

    if (!formData.customer_phone.trim()) {
      setError('Customer phone is required');
      return;
    }

    if (formData.customer_phone.length < 10 || formData.customer_phone.length > 15) {
      setError('Phone number must be between 10 and 15 digits');
      return;
    }

    if (!formData.booking_start_date) {
      setError('Start date is required');
      return;
    }

    if (!formData.booking_end_date) {
      setError('End date is required');
      return;
    }

    if (formData.booking_end_date < formData.booking_start_date) {
      setError('End date must be after start date');
      return;
    }

    if (formData.end_time <= formData.start_time) {
      setError('End time must be after start time');
      return;
    }

    try {
      setLoading(true);
      if (bookingId) {
        // For now, we can't update bookings through the API beyond status changes
        // So redirect to bookings page
        router.push('/hall_booking');
      } else {
        await hallBookingAPI.create(formData);
        router.push('/hall_booking');
      }
    } catch (err: any) {
      let errorMessage = 'Failed to save booking.';
      if (err.response) {
        if (err.response.status === 409) {
          errorMessage = err.response.data?.detail || 'Booking conflicts with an existing schedule for this hall.';
        } else {
          errorMessage = err.response.data?.detail || `Request failed with status ${err.response.status}`;
        }
      }
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {error && (
        <div className="alert alert-danger mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Booking</h2>

        <div className="form-group">
          <label htmlFor="hall_id" className="form-label">
            Select Hall *
          </label>
          <select
            id="hall_id"
            name="hall_id"
            value={formData.hall_id}
            onChange={handleInputChange}
            className="form-select"
            required
          >
            <option value="">Choose a hall...</option>
            {halls.map((hall) => (
              <option key={hall.id} value={hall.id}>
                {hall.name} (Capacity: {hall.capacity})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="customer_name" className="form-label">
            Customer Name *
          </label>
          <input
            id="customer_name"
            type="text"
            name="customer_name"
            value={formData.customer_name}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter customer name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="customer_phone" className="form-label">
            Customer Phone *
          </label>
          <input
            id="customer_phone"
            type="tel"
            name="customer_phone"
            value={formData.customer_phone}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter phone number"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="event_purpose" className="form-label">
            Event Purpose
          </label>
          <textarea
            id="event_purpose"
            name="event_purpose"
            value={formData.event_purpose}
            onChange={handleInputChange}
            className="form-textarea"
            placeholder="Enter event purpose or description"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="booking_start_date" className="form-label">
              Start Date *
            </label>
            <input
              id="booking_start_date"
              type="date"
              name="booking_start_date"
              value={formData.booking_start_date}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="booking_end_date" className="form-label">
              End Date *
            </label>
            <input
              id="booking_end_date"
              type="date"
              name="booking_end_date"
              value={formData.booking_end_date}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="start_time" className="form-label">
              Start Time *
            </label>
            <input
              id="start_time"
              type="time"
              name="start_time"
              value={formData.start_time}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="end_time" className="form-label">
              End Time *
            </label>
            <input
              id="end_time"
              type="time"
              name="end_time"
              value={formData.end_time}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button type="submit" disabled={loading} className="btn btn-primary flex-1">
            {loading ? 'Creating...' : 'Create Booking'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/hall_booking')}
            className="btn btn-secondary flex-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
};

export default BookingForm;
