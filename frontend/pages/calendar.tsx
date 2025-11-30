import React, { useState, useEffect } from 'react';
import { calendarAPI } from '@/api';
import { BookingListItem } from '@/types';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, addDays, addMonths, subMonths } from 'date-fns';
import { formatDateIST } from '@/utils/timezone';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type ViewType = 'day' | 'week' | 'month';

export default function Calendar() {
  const [viewType, setViewType] = useState<ViewType>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<BookingListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, [viewType, currentDate]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      if (viewType === 'day') {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        const response = await calendarAPI.getDay(dateStr);
        setBookings(response.bookings);
      } else if (viewType === 'week') {
        const start = startOfWeek(currentDate);
        const end = endOfWeek(currentDate);
        const response = await calendarAPI.getWeek(
          format(start, 'yyyy-MM-dd'),
          format(end, 'yyyy-MM-dd')
        );
        setBookings(response.bookings);
      } else if (viewType === 'month') {
        const response = await calendarAPI.getMonth(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1
        );
        setBookings(response.bookings);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch calendar data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (viewType === 'day') {
      setCurrentDate(addDays(currentDate, -1));
    } else if (viewType === 'week') {
      setCurrentDate(addDays(currentDate, -7));
    } else {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (viewType === 'day') {
      setCurrentDate(addDays(currentDate, 1));
    } else if (viewType === 'week') {
      setCurrentDate(addDays(currentDate, 7));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getDateRangeText = () => {
    if (viewType === 'day') {
      return format(currentDate, 'MMMM dd, yyyy');
    } else if (viewType === 'week') {
      const start = startOfWeek(currentDate);
      const end = endOfWeek(currentDate);
      return `${format(start, 'MMM dd')} - ${format(end, 'MMM dd, yyyy')}`;
    } else {
      return format(currentDate, 'MMMM yyyy');
    }
  };

  const renderDayView = () => {
    return (
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Bookings for {format(currentDate, 'MMMM dd, yyyy')}
        </h2>

        {bookings.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No bookings for this day</p>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="relative group">
                      <p className="font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors">
                        {booking.customer_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {booking.customer_phone}
                      </p>
                      {/* Tooltip */}
                      <div className="invisible group-hover:visible absolute left-0 top-full mt-2 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg w-48 z-10">
                        <p className="font-semibold mb-2">Booking Details (IST)</p>
                        <p className="mb-1"><span className="font-semibold">Date:</span> {formatDateIST(booking.booking_start_date)} to {formatDateIST(booking.booking_end_date)}</p>
                        <p className="mb-1"><span className="font-semibold">Time:</span> {booking.start_time} - {booking.end_time}</p>
                        <p className="mb-1"><span className="font-semibold">Customer:</span> {booking.customer_name}</p>
                        <p className="mb-1"><span className="font-semibold">Mobile:</span> {booking.customer_phone || 'N/A'}</p>
                        {booking.event_purpose && <p><span className="font-semibold">Purpose:</span> {booking.event_purpose}</p>}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{booking.customer_name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {booking.start_time} - {booking.end_time}
                    </p>
                    {booking.event_purpose && (
                      <p className="text-sm text-gray-600 mt-2">{booking.event_purpose}</p>
                    )}
                  </div>
                  <span
                    className={`badge ${
                      booking.status === 'confirmed'
                        ? 'badge-success'
                        : booking.status === 'pending'
                        ? 'badge-warning'
                        : 'badge-danger'
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
    const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

    // Group bookings by date (including multi-day bookings)
    const bookingsByDate: { [key: string]: BookingListItem[] } = {};
    bookings.forEach((booking) => {
      const startDate = parseISO(booking.booking_start_date);
      const endDate = parseISO(booking.booking_end_date);

      // Iterate through each day in the booking range
      const daysInRange = eachDayOfInterval({ start: startDate, end: endDate });
      daysInRange.forEach((day) => {
        const date = format(day, 'yyyy-MM-dd');
        if (!bookingsByDate[date]) {
          bookingsByDate[date] = [];
        }
        bookingsByDate[date].push(booking);
      });
    });

    return (
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Week of {format(weekStart, 'MMMM dd')} - {format(weekEnd, 'MMMM dd, yyyy')}
        </h2>

        <div className="grid grid-cols-7 gap-2">
          {daysInWeek.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayBookings = bookingsByDate[dateKey] || [];

            return (
              <div
                key={dateKey}
                className="border border-gray-200 rounded-lg p-3 min-h-40"
              >
                <p className="font-bold text-gray-900 mb-2">{format(day, 'EEE')}</p>
                <p className="text-sm text-gray-600 mb-3">{format(day, 'MMM dd')}</p>

                {dayBookings.length === 0 ? (
                  <p className="text-xs text-gray-400">No bookings</p>
                ) : (
                  <div className="space-y-2">
                    {dayBookings.map((booking) => (
                      <div key={booking.id} className="relative group text-xs bg-blue-50 p-2 rounded cursor-pointer">
                        <p className="font-semibold text-gray-900 hover:text-blue-600 transition-colors text-xs">{booking.customer_name}</p>
                        <p className="text-gray-600 truncate text-xs">{booking.customer_phone}</p>
                        {/* Tooltip */}
                        <div className="invisible group-hover:visible absolute left-full top-0 ml-2 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg w-48 z-10 whitespace-normal">
                          <p className="font-semibold mb-2">Booking Details (IST)</p>
                          <p className="mb-1"><span className="font-semibold">Date:</span> {formatDateIST(booking.booking_start_date)} to {formatDateIST(booking.booking_end_date)}</p>
                          <p className="mb-1"><span className="font-semibold">Time:</span> {booking.start_time} - {booking.end_time}</p>
                          <p className="mb-1"><span className="font-semibold">Customer:</span> {booking.customer_name}</p>
                          <p className="mb-1"><span className="font-semibold">Mobile:</span> {booking.customer_phone || 'N/A'}</p>
                          {booking.event_purpose && <p><span className="font-semibold">Purpose:</span> {booking.event_purpose}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const daysInCalendar = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    // Group bookings by date (including multi-day bookings)
    const bookingsByDate: { [key: string]: BookingListItem[] } = {};
    bookings.forEach((booking) => {
      const startDate = parseISO(booking.booking_start_date);
      const endDate = parseISO(booking.booking_end_date);

      // Iterate through each day in the booking range
      const daysInRange = eachDayOfInterval({ start: startDate, end: endDate });
      daysInRange.forEach((day) => {
        const date = format(day, 'yyyy-MM-dd');
        if (!bookingsByDate[date]) {
          bookingsByDate[date] = [];
        }
        bookingsByDate[date].push(booking);
      });
    });

    return (
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {format(currentDate, 'MMMM yyyy')}
        </h2>

        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-2 text-center font-bold text-gray-900 bg-gray-100">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {daysInCalendar.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const isCurrentMonth =
              day.getMonth() === currentDate.getMonth() &&
              day.getFullYear() === currentDate.getFullYear();
            const dayBookings = bookingsByDate[dateKey] || [];

            return (
              <div
                key={dateKey}
                className={`border rounded-lg p-2 min-h-24 ${
                  isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <p className={`font-bold text-sm mb-1 ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                  {format(day, 'd')}
                </p>

                <div className="space-y-1">
                  {dayBookings.slice(0, 2).map((booking) => (
                    <div
                      key={booking.id}
                      className="relative group text-xs bg-blue-100 text-blue-900 p-1 rounded cursor-pointer hover:bg-blue-200 transition-colors"
                    >
                      <p className="truncate font-semibold">{booking.customer_name}</p>
                      <p className="truncate text-xs">{booking.customer_phone}</p>
                      {/* Tooltip */}
                      <div className="invisible group-hover:visible absolute left-0 top-full mt-1 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg w-48 z-10 whitespace-normal">
                        <p className="font-semibold mb-2">Booking Details (IST)</p>
                        <p className="mb-1"><span className="font-semibold">Date:</span> {formatDateIST(booking.booking_start_date)} to {formatDateIST(booking.booking_end_date)}</p>
                        <p className="mb-1"><span className="font-semibold">Time:</span> {booking.start_time} - {booking.end_time}</p>
                        <p className="mb-1"><span className="font-semibold">Customer:</span> {booking.customer_name}</p>
                        <p className="mb-1"><span className="font-semibold">Mobile:</span> {booking.customer_phone || 'N/A'}</p>
                        {booking.event_purpose && <p><span className="font-semibold">Purpose:</span> {booking.event_purpose}</p>}
                      </div>
                    </div>
                  ))}
                  {dayBookings.length > 2 && (
                    <p className="text-xs text-gray-500">+{dayBookings.length - 2} more</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Calendar</h1>

        {/* View Controls */}
        <div className="card mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-2">
              {(['day', 'week', 'month'] as ViewType[]).map((view) => (
                <button
                  key={view}
                  onClick={() => setViewType(view)}
                  className={`btn ${
                    viewType === view ? 'btn-primary' : 'btn-secondary'
                  } capitalize`}
                >
                  {view}
                </button>
              ))}
            </div>

            <div className="text-lg font-semibold text-gray-900">{getDateRangeText()}</div>

            <div className="flex gap-2">
              <button
                onClick={handlePrevious}
                className="btn btn-secondary flex items-center gap-2"
              >
                <ChevronLeft size={20} />
              </button>
              <button onClick={handleToday} className="btn btn-secondary">
                Today
              </button>
              <button
                onClick={handleNext}
                className="btn btn-secondary flex items-center gap-2"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center min-h-96">
          <div className="spinner"></div>
        </div>
      ) : (
        <>
          {viewType === 'day' && renderDayView()}
          {viewType === 'week' && renderWeekView()}
          {viewType === 'month' && renderMonthView()}
        </>
      )}
    </div>
  );
}
