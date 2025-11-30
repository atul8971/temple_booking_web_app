import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { hallsAPI } from '@/api';
import { Hall, HallCreateInput, HallUpdateInput } from '@/types';
import { X } from 'lucide-react';

interface HallFormProps {
  hallId?: number;
  onSuccess?: () => void;
}

const HallForm: React.FC<HallFormProps> = ({ hallId, onSuccess }) => {
  const router = useRouter();
  const [formData, setFormData] = useState<HallCreateInput>({
    name: '',
    capacity: 0,
    facilities: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(hallId ? true : false);
  const [facilitiesInput, setFacilitiesInput] = useState('');

  useEffect(() => {
    if (hallId) {
      fetchHall();
    }
  }, [hallId]);

  const fetchHall = async () => {
    try {
      setInitialLoading(true);
      const hall = await hallsAPI.getById(hallId!);
      setFormData({
        name: hall.name,
        capacity: hall.capacity,
        facilities: hall.facilities || [],
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch hall');
      console.error(err);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value, 10) || 0 : value,
    }));
  };

  const addFacility = () => {
    if (facilitiesInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        facilities: [...(prev.facilities || []), facilitiesInput.trim()],
      }));
      setFacilitiesInput('');
    }
  };

  const removeFacility = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      facilities: prev.facilities?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Hall name is required');
      return;
    }

    if (formData.capacity <= 0) {
      setError('Capacity must be greater than 0');
      return;
    }

    try {
      setLoading(true);
      if (hallId) {
        await hallsAPI.update(hallId, formData as HallUpdateInput);
        router.push('/halls');
      } else {
        await hallsAPI.create(formData);
        router.push('/halls');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save hall');
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
    <form onSubmit={handleSubmit} className="max-w-2xl">
      {error && (
        <div className="alert alert-danger mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {hallId ? 'Edit Hall' : 'Create New Hall'}
        </h2>

        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Hall Name *
          </label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter hall name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="capacity" className="form-label">
            Capacity *
          </label>
          <input
            id="capacity"
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter hall capacity"
            min="1"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="facilities" className="form-label">
            Facilities
          </label>
          <div className="flex gap-2">
            <input
              id="facilities"
              type="text"
              value={facilitiesInput}
              onChange={(e) => setFacilitiesInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addFacility();
                }
              }}
              className="form-input flex-1"
              placeholder="Enter facility name and press Enter"
            />
            <button
              type="button"
              onClick={addFacility}
              className="btn btn-secondary px-4"
            >
              Add
            </button>
          </div>

          {formData.facilities && formData.facilities.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {formData.facilities.map((facility, index) => (
                <div
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2"
                >
                  <span>{facility}</span>
                  <button
                    type="button"
                    onClick={() => removeFacility(index)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-4 mt-8">
          <button type="submit" disabled={loading} className="btn btn-primary flex-1">
            {loading ? 'Saving...' : hallId ? 'Update Hall' : 'Create Hall'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/halls')}
            className="btn btn-secondary flex-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
};

export default HallForm;
