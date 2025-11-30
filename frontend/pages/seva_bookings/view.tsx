import React, { useState, useEffect } from 'react';
import { Printer } from 'lucide-react';
import { sevaBookingAPI } from '../../api';
import { SevaBookingListItem } from '../../types';

const ViewSevaBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<SevaBookingListItem[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<SevaBookingListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [receiptDate, setReceiptDate] = useState<string>('');

  useEffect(() => {
    // Set today's date as default receipt date
    const today = new Date().toISOString().split('T')[0];
    setReceiptDate(today);
    loadBookings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [receiptDate, bookings]);

  const loadBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await sevaBookingAPI.getAll(0, 100);
      setBookings(response.data);
      setFilteredBookings(response.data);
    } catch (err: any) {
      console.error('Error loading bookings:', err);
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...bookings];

    if (receiptDate) {
      filtered = filtered.filter(booking => booking.receipt_date === receiptDate);
    }

    setFilteredBookings(filtered);
  };

  const clearFilters = () => {
    const today = new Date().toISOString().split('T')[0];
    setReceiptDate(today);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  // Group bookings by seva name
  const groupedBookings = filteredBookings.reduce((acc, booking) => {
    const sevaName = booking.seva_name;
    if (!acc[sevaName]) {
      acc[sevaName] = [];
    }
    acc[sevaName].push(booking);
    return acc;
  }, {} as Record<string, SevaBookingListItem[]>);

  const calculateSevaTotal = (bookings: SevaBookingListItem[]) => {
    return bookings.reduce((sum, b) => sum + (b.seva_amount || 0), 0);
  };

  return (
    <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center print:block">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 print:text-center">Sevas Booked Today</h1>
            <p className="text-gray-600 mt-2 print:text-center">
              {receiptDate ? `Bookings for ${formatDate(receiptDate)}` : 'View and search seva bookings by date'}
            </p>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-3 px-12 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold text-xl print:hidden"
          >
            <Printer size={24} />
            Print
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-12 print:hidden">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Receipt Date
              </label>
              <input
                type="date"
                value={receiptDate}
                onChange={(e) => setReceiptDate(e.target.value)}
                className="w-full px-6 py-4 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Loading bookings...</p>
          </div>
        )}

        {/* Grouped Bookings by Seva */}
        {!loading && filteredBookings.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center text-gray-500">
            No bookings found for the selected date
          </div>
        )}

        {!loading && filteredBookings.length > 0 && (
          <div className="space-y-6">
            {Object.entries(groupedBookings).map(([sevaName, bookings]) => (
              <div key={sevaName} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 page-break-inside-avoid">
                <div className="bg-gradient-to-r from-blue-800 to-blue-900 px-6 py-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">{sevaName}</h2>
                    <span className="text-white font-semibold">{bookings.length} booking{bookings.length > 1 ? 's' : ''}</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full table-fixed">
                    <colgroup>
                      <col style={{ width: '12%' }} />
                      <col style={{ width: '12%' }} />
                      <col style={{ width: '20%' }} />
                      <col style={{ width: '15%' }} />
                      <col style={{ width: '15%' }} />
                      <col style={{ width: '12%' }} />
                    </colgroup>
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Receipt Date
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Seva Date
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Mobile
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Gotra
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {bookings.map((booking, index) => (
                        <tr key={booking.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-200`}>
                          <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium text-gray-900">
                            {formatDate(booking.receipt_date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-left text-sm text-gray-900">
                            {formatDate(booking.seva_date)}
                          </td>
                          <td className="px-6 py-4 text-left text-sm text-gray-900">
                            {booking.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-left text-sm text-gray-900">
                            {booking.mobile_no}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-left text-sm text-gray-600">
                            {booking.gotra_name || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                            {booking.seva_amount ? `₹${booking.seva_amount}` : '-'}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gradient-to-r from-blue-100 to-blue-200 font-bold border-t-2 border-blue-300">
                        <td colSpan={5} className="px-6 py-4 text-right text-gray-800 uppercase tracking-wider">
                          Subtotal for {sevaName}
                        </td>
                        <td className="px-6 py-4 text-right text-blue-800 text-lg">
                          ₹{calculateSevaTotal(bookings).toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            {/* Grand Total */}
            <div className="bg-gradient-to-r from-blue-800 to-blue-900 rounded-xl shadow-lg p-6 page-break-inside-avoid">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider">Grand Total</h3>
                  <p className="text-blue-100 text-sm font-semibold mt-1">Total Bookings: {filteredBookings.length}</p>
                  <p className="text-blue-100 text-sm font-semibold">Sevas: {Object.keys(groupedBookings).length}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    ₹{filteredBookings.reduce((sum, b) => sum + (b.seva_amount || 0), 0).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Print Styles */}
        <style jsx global>{`
          @media print {
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            .print\\:hidden {
              display: none !important;
            }
            .print\\:text-center {
              text-align: center;
            }
            .print\\:block {
              display: block;
            }
            .page-break-inside-avoid {
              page-break-inside: avoid;
            }
            @page {
              margin: 1cm;
            }
          }
        `}</style>
      </div>
  );
};

export default ViewSevaBookingsPage;
