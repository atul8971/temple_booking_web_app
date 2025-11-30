import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Users, Calendar } from 'lucide-react';
import { hallsAPI } from '@/api';
import { Hall } from '@/types';

export default function HallsList() {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchHalls();
  }, []);

  const fetchHalls = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hallsAPI.getAll(0, 100);
      setHalls(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch halls');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (hallId: number) => {
    if (!window.confirm('Are you sure you want to delete this hall?')) return;

    try {
      setDeleteLoading(hallId);
      await hallsAPI.delete(hallId);
      setHalls(halls.filter((h) => h.id !== hallId));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete hall');
      console.error(err);
    } finally {
      setDeleteLoading(null);
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
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Halls Management</h1>
          <p className="text-gray-600 mt-2">Manage all your function halls and venues</p>
        </div>
        <Link href="/halls/create">
          <button className="btn btn-primary flex items-center gap-2 whitespace-nowrap">
            <Plus size={20} />
            Add New Hall
          </button>
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger">
          <strong>Error:</strong> {error}
        </div>
      )}

      {halls.length === 0 ? (
        <div className="card-modern text-center py-16">
          <div className="mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-red-100 rounded-full flex items-center justify-center mx-auto">
              <Calendar className="text-pink-600" size={40} />
            </div>
          </div>
          <p className="text-gray-600 text-lg mb-6">No halls available yet. Create one to get started!</p>
          <Link href="/halls/create">
            <button className="btn btn-primary">Create First Hall</button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {halls.map((hall) => (
            <div
              key={hall.id}
              className="group card-modern overflow-hidden hover:-translate-y-1 hover:shadow-xl"
            >
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-pink-500 to-red-600 h-24 flex items-center justify-center mb-4">
                <div className="text-white text-center">
                  <Calendar className="mx-auto mb-2" size={32} />
                  <p className="text-xs font-semibold opacity-90">Event Hall</p>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{hall.name}</h3>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users size={16} />
                    <span className="text-sm"><span className="font-semibold">{hall.capacity}</span> people capacity</span>
                  </div>
                </div>

                {/* Facilities */}
                {hall.facilities && hall.facilities.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Facilities</p>
                    <div className="flex flex-wrap gap-2">
                      {hall.facilities.slice(0, 3).map((facility, idx) => (
                        <span key={idx} className="badge badge-primary text-xs">
                          {facility}
                        </span>
                      ))}
                      {hall.facilities.length > 3 && (
                        <span className="badge bg-gray-100 text-gray-700 text-xs">
                          +{hall.facilities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Date */}
                <p className="text-xs text-gray-500">
                  Created on {new Date(hall.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-6 pt-6 border-t border-gray-200">
                <Link href={`/halls/${hall.id}/edit`} className="flex-1">
                  <button className="btn btn-secondary w-full flex items-center justify-center gap-2">
                    <Edit2 size={16} />
                    Edit
                  </button>
                </Link>
                <button
                  onClick={() => handleDelete(hall.id)}
                  disabled={deleteLoading === hall.id}
                  className="btn btn-danger flex-1 flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  {deleteLoading === hall.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
