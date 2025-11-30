import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { sevaAPI, gotraAPI, sevaBookingAPI } from '../api';
import { Seva, Gotra, SevaBookingCreateInput } from '../types';

interface SevaBookingFormProps {
  onSuccess?: () => void;
}

const SevaBookingForm: React.FC<SevaBookingFormProps> = ({ onSuccess }) => {
  const router = useRouter();
  const [sevas, setSevas] = useState<Seva[]>([]);
  const [gotras, setGotras] = useState<Gotra[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<SevaBookingCreateInput>({
    seva_id: 0,
    seva_date: '',
    name: '',
    mobile_no: '',
    gotra_id: null,
    address: '',
    remarks: '',
  });

  useEffect(() => {
    loadSevasAndGotras();
  }, []);

  const loadSevasAndGotras = async () => {
    try {
      const [sevasData, gotrasData] = await Promise.all([
        sevaAPI.getAll(),
        gotraAPI.getAll(),
      ]);
      // Ensure we have arrays
      setSevas(Array.isArray(sevasData) ? sevasData : []);
      setGotras(Array.isArray(gotrasData) ? gotrasData : []);
    } catch (err) {
      console.error('Error loading sevas and gotras:', err);
      setError('Failed to load form data');
      setSevas([]);
      setGotras([]);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'seva_id' || name === 'gotra_id'
        ? (value === '' ? null : Number(value))
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await sevaBookingAPI.create(formData);
      setSuccess('Seva booking created successfully!');

      // Reset form
      setFormData({
        seva_id: 0,
        seva_date: '',
        name: '',
        mobile_no: '',
        gotra_id: null,
        address: '',
        remarks: '',
      });

      // Auto-dismiss success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Error creating seva booking:', err);
      setError(err.response?.data?.detail || 'Failed to create seva booking');
    } finally {
      setLoading(false);
    }
  };

  return (
      <form onSubmit={handleSubmit} className="w-full">
        {error && (
          <div className="alert alert-danger mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success mb-6">
            <strong>Success:</strong> {success}
          </div>
        )}

        <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Book Seva</h2>

        {/* Seva Selection */}
        <div className="form-group">
          <label htmlFor="seva_id" className="form-label">
            Seva Name *
          </label>
          <select
            id="seva_id"
            name="seva_id"
            value={formData.seva_id}
            onChange={handleChange}
            className="form-select"
            required
          >
            <option value="">Select Seva</option>
            {Array.isArray(sevas) && sevas.map((seva) => (
              <option key={seva.id} value={seva.id}>
                {seva.name} {seva.amount && `- ₹${seva.amount}`}
              </option>
            ))}
          </select>
        </div>

        {/* Seva Date */}
        <div className="form-group">
          <label htmlFor="seva_date" className="form-label">
            Seva Date *
          </label>
          <input
            id="seva_date"
            type="date"
            name="seva_date"
            value={formData.seva_date}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            className="form-input"
            required
          />
        </div>

        {/* Name */}
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Name *
          </label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter your name"
            required
          />
        </div>

        {/* Mobile Number */}
        <div className="form-group">
          <label htmlFor="mobile_no" className="form-label">
            Mobile Number *
          </label>
          <input
            id="mobile_no"
            type="tel"
            name="mobile_no"
            value={formData.mobile_no}
            onChange={handleChange}
            pattern="[0-9]{10,15}"
            className="form-input"
            placeholder="Enter mobile number"
            required
          />
        </div>

        {/* Gotra */}
        <div className="form-group">
          <label htmlFor="gotra_id" className="form-label">
            Gotra
          </label>
          <select
            id="gotra_id"
            name="gotra_id"
            value={formData.gotra_id || ''}
            onChange={handleChange}
            className="form-select"
          >
            <option value="">Select Gotra (Optional)</option>
            {Array.isArray(gotras) && gotras.map((gotra) => (
              <option key={gotra.id} value={gotra.id}>
                {gotra.name}
              </option>
            ))}
          </select>
        </div>

        {/* Address */}
        <div className="form-group">
          <label htmlFor="address" className="form-label">
            Address
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address || ''}
            onChange={handleChange}
            rows={3}
            className="form-textarea"
            placeholder="Enter your address"
          />
        </div>

        {/* Remarks */}
        <div className="form-group">
          <label htmlFor="remarks" className="form-label">
            Remarks
          </label>
          <textarea
            id="remarks"
            name="remarks"
            value={formData.remarks || ''}
            onChange={handleChange}
            rows={2}
            className="form-textarea"
            placeholder="Any special instructions or remarks"
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-4 mt-8">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary flex-1"
          >
            {loading ? 'Booking...' : 'Book Seva'}
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData({
                seva_id: 0,
                seva_date: '',
                name: '',
                mobile_no: '',
                gotra_id: null,
                address: '',
                remarks: '',
              });
              setError(null);
              setSuccess(null);
            }}
            className="btn btn-secondary flex-1"
          >
            Reset Form
          </button>
        </div>
      </div>
    </form>
  );
};

export default SevaBookingForm;
