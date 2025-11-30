import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, TrendingUp, MapPin, BookOpen, HandHeart, IndianRupee } from 'lucide-react';
import { hallsAPI, hallBookingAPI, sevaBookingAPI } from '@/api';
import { Hall, BookingListItem, SevaBookingListItem } from '@/types';

export default function Dashboard() {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [hallBookings, setHallBookings] = useState<BookingListItem[]>([]);
  const [sevaBookings, setSevaBookings] = useState<SevaBookingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [hallsData, hallBookingsData, sevaBookingsData] = await Promise.all([
          hallsAPI.getAll(0, 100),
          hallBookingAPI.getAll(0, 100),
          sevaBookingAPI.getAll(0, 100),
        ]);
        setHalls(hallsData);
        setHallBookings(hallBookingsData);
        setSevaBookings(sevaBookingsData.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to fetch data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Hall booking stats
  const totalHallBookings = hallBookings.length;
  const confirmedHallBookings = hallBookings.filter((b) => b.status === 'confirmed').length;

  // Seva booking stats
  const totalSevaBookings = sevaBookings.length;
  const totalSevaAmount = sevaBookings.reduce((sum, b) => sum + (b.seva_amount || 0), 0);

  // Get today's date for filtering
  const today = new Date().toISOString().split('T')[0];
  const sevasBookedToday = sevaBookings.filter(b => b.receipt_date === today).length;

  // Get tomorrow's date for filtering
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const sevasScheduledTomorrow = sevaBookings.filter(b => b.seva_date === tomorrowStr).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {error && (
        <div className="alert alert-danger">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Main Action Buttons */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Function Hall Booking Button */}
          <Link href="/hall_booking">
            <div className="group cursor-pointer bg-gradient-to-br from-blue-800 to-blue-900 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-4 border-blue-700">
              <div className="flex flex-col items-center text-center">
                <div className="p-5 bg-white rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="text-blue-800" size={48} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Function Hall Bookings</h3>
                <p className="text-blue-100 text-base">Manage hall reservations and bookings</p>
              </div>
            </div>
          </Link>

          {/* Seva Booking Button */}
          <Link href="/seva_bookings">
            <div className="group cursor-pointer bg-gradient-to-br from-orange-600 to-red-700 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-4 border-orange-500">
              <div className="flex flex-col items-center text-center">
                <div className="p-5 bg-white rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                  <HandHeart className="text-orange-600" size={48} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Seva Bookings</h3>
                <p className="text-orange-100 text-base">Book and manage seva services</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Seva Booking Stats */}
      <div>
        <br></br>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Seva Booking Stats</h2>
        <br></br>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Seva Bookings"
            value={totalSevaBookings}
            icon={<HandHeart className="text-orange-500" size={32} />}
            gradient="from-orange-50 to-red-50"
          />
          <StatCard
            title="Sevas Booked Today"
            value={sevasBookedToday}
            icon={<Calendar className="text-purple-500" size={32} />}
            gradient="from-purple-50 to-pink-50"
          />
          <StatCard
            title="Sevas Scheduled Tomorrow"
            value={sevasScheduledTomorrow}
            icon={<TrendingUp className="text-teal-500" size={32} />}
            gradient="from-teal-50 to-cyan-50"
          />
          <StatCard
            title="Total Revenue"
            value={`₹${totalSevaAmount.toFixed(2)}`}
            valueAsString={true}
            icon={<IndianRupee className="text-green-500" size={32} />}
            gradient="from-green-50 to-lime-50"
          />
        </div>
      </div>

      {/* Hall Booking Stats */}
      <div>
        <br></br>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Function Hall Stats</h2>
        <br></br>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Halls"
            value={halls.length}
            icon={<MapPin className="text-blue-500" size={32} />}
            gradient="from-blue-50 to-cyan-50"
          />
          <StatCard
            title="Total Bookings"
            value={totalHallBookings}
            icon={<Calendar className="text-indigo-500" size={32} />}
            gradient="from-indigo-50 to-purple-50"
          />
          <StatCard
            title="Confirmed Bookings"
            value={confirmedHallBookings}
            icon={<TrendingUp className="text-green-500" size={32} />}
            gradient="from-green-50 to-emerald-50"
          />
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  gradient: string;
  valueAsString?: boolean;
}

function StatCard({ title, value, icon, gradient, valueAsString = false }: StatCardProps) {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-4xl font-bold text-gray-900">
            {valueAsString ? value : value}
          </p>
        </div>
        <div className="p-3 bg-white rounded-lg">{icon}</div>
      </div>
    </div>
  );
}

