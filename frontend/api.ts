import axios, { AxiosInstance, isAxiosError } from 'axios';
import {
  Hall,
  HallCreateInput,
  HallUpdateInput,
  Booking,
  BookingCreateInput,
  BookingUpdateInput,
  BookingListItem,
  CalendarDayResponse,
  CalendarWeekResponse,
  CalendarMonthResponse,
  BookingStatus,
  Seva,
  Gotra,
  SevaBooking,
  SevaBookingCreateInput,
  SevaBookingUpdateInput,
  SevaBookingListItem,
  SevaBookingByDateResponse,
  SevaBookingBySevaIdResponse,
  SevaBookingStatus,
} from './types';

// Dynamically determine API base URL based on environment
const getApiBaseUrl = () => {
  // First check environment variable
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }

  // In browser, use current hostname if not localhost
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // If accessing from EC2 public IP or domain, use that same host for API
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `http://${hostname}:8000`;
    }
  }

  // Default to localhost for local development
  return 'http://localhost:8000';
};

const API_BASE_URL = getApiBaseUrl();

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Error handling interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      console.error('Unauthorized access');
    }
    return Promise.reject(error);
  }
);

// ============== HALLS API ==============

export const hallsAPI = {
  // Get all halls
  getAll: async (skip: number = 0, limit: number = 100): Promise<Hall[]> => {
    try {
      const response = await apiClient.get<Hall[]>('/halls', {
        params: { skip, limit },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching halls:', error);
      throw error;
    }
  },

  // Get single hall
  getById: async (hallId: number): Promise<Hall> => {
    try {
      const response = await apiClient.get<Hall>(`/halls/${hallId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching hall ${hallId}:`, error);
      throw error;
    }
  },

  // Create hall
  create: async (hallData: HallCreateInput): Promise<Hall> => {
    try {
      const response = await apiClient.post<Hall>('/halls', hallData);
      return response.data;
    } catch (error) {
      console.error('Error creating hall:', error);
      throw error;
    }
  },

  // Update hall
  update: async (hallId: number, hallData: HallUpdateInput): Promise<Hall> => {
    try {
      const response = await apiClient.put<Hall>(`/halls/${hallId}`, hallData);
      return response.data;
    } catch (error) {
      console.error(`Error updating hall ${hallId}:`, error);
      throw error;
    }
  },

  // Delete hall
  delete: async (hallId: number): Promise<void> => {
    try {
      await apiClient.delete(`/halls/${hallId}`);
    } catch (error) {
      console.error(`Error deleting hall ${hallId}:`, error);
      throw error;
    }
  },
};

// ============== HALL BOOKINGS API ==============

export const hallBookingAPI = {
  // Get all hall bookings with optional filters
  getAll: async (
    skip: number = 0,
    limit: number = 100,
    statusFilter?: BookingStatus,
    hallId?: number
  ): Promise<BookingListItem[]> => {
    try {
      const params: any = { skip, limit };
      if (statusFilter) params.status_filter = statusFilter;
      if (hallId) params.hall_id = hallId;

      const response = await apiClient.get<BookingListItem[]>('/hall-booking', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching hall bookings:', error);
      throw error;
    }
  },

  // Get single hall booking
  getById: async (bookingId: number): Promise<Booking> => {
    try {
      const response = await apiClient.get<Booking>(`/hall-booking/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching hall booking ${bookingId}:`, error);
      throw error;
    }
  },

  // Create hall booking
  create: async (bookingData: BookingCreateInput): Promise<Booking> => {
    try {
      const response = await apiClient.post<Booking>('/hall-booking', bookingData);
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        console.error('Error creating hall booking:', error.response?.status, error.response?.data);
      } else {
        console.error('Error creating hall booking:', error);
      }
      throw error;
    }
  },

  // Update hall booking status
  updateStatus: async (bookingId: number, status: BookingStatus): Promise<Booking> => {
    try {
      const response = await apiClient.patch<Booking>(`/hall-booking/${bookingId}`, { status });
      return response.data;
    } catch (error) {
      console.error(`Error updating hall booking ${bookingId}:`, error);
      throw error;
    }
  },

  // Delete hall booking
  delete: async (bookingId: number): Promise<void> => {
    try {
      await apiClient.delete(`/hall-booking/${bookingId}`);
    } catch (error) {
      console.error(`Error deleting hall booking ${bookingId}:`, error);
      throw error;
    }
  },
};

// ============== CALENDAR API ==============

export const calendarAPI = {
  // Get bookings for a specific day
  getDay: async (date: string): Promise<CalendarDayResponse> => {
    try {
      const response = await apiClient.get<CalendarDayResponse>('/calendar/day', {
        params: { date },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching day calendar:`, error);
      throw error;
    }
  },

  // Get bookings for a week
  getWeek: async (startDate: string, endDate: string): Promise<CalendarWeekResponse> => {
    try {
      const response = await apiClient.get<CalendarWeekResponse>('/calendar/week', {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching week calendar:`, error);
      throw error;
    }
  },

  // Get bookings for a month
  getMonth: async (year: number, month: number): Promise<CalendarMonthResponse> => {
    try {
      const response = await apiClient.get<CalendarMonthResponse>('/calendar/month', {
        params: { year, month },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching month calendar:`, error);
      throw error;
    }
  },
};

// ============== SEVA API ==============

export const sevaAPI = {
  // Get all sevas
  getAll: async (skip: number = 0, limit: number = 100): Promise<Seva[]> => {
    try {
      const response = await apiClient.get<{ count: number; data: Seva[] }>('/api/sevas', {
        params: { skip, limit },
      });
      return response.data.data; // Extract the data array
    } catch (error) {
      console.error('Error fetching sevas:', error);
      throw error;
    }
  },

  // Get single seva
  getById: async (sevaId: number): Promise<Seva> => {
    try {
      const response = await apiClient.get<Seva>(`/api/sevas/${sevaId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching seva ${sevaId}:`, error);
      throw error;
    }
  },
};

// ============== GOTRA API ==============

export const gotraAPI = {
  // Get all gotras
  getAll: async (skip: number = 0, limit: number = 200): Promise<Gotra[]> => {
    try {
      const response = await apiClient.get<{ count: number; data: Gotra[] }>('/api/gotras', {
        params: { skip, limit },
      });
      return response.data.data; // Extract the data array
    } catch (error) {
      console.error('Error fetching gotras:', error);
      throw error;
    }
  },
};

// ============== SEVA BOOKINGS API ==============

export const sevaBookingAPI = {
  // Get all seva bookings with optional filters
  getAll: async (
    skip: number = 0,
    limit: number = 50,
    mobile_no?: string,
    seva_date?: string
  ): Promise<{ total_count: number; skip: number; limit: number; data: SevaBookingListItem[] }> => {
    try {
      const params: any = { skip, limit };
      if (mobile_no) params.mobile_no = mobile_no;
      if (seva_date) params.seva_date = seva_date;

      const response = await apiClient.get('/api/seva-bookings', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching seva bookings:', error);
      throw error;
    }
  },

  // Get single seva booking
  getById: async (bookingId: number): Promise<SevaBooking> => {
    try {
      const response = await apiClient.get<SevaBooking>(`/api/seva-bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching seva booking ${bookingId}:`, error);
      throw error;
    }
  },

  // Create seva booking
  create: async (bookingData: SevaBookingCreateInput): Promise<SevaBooking> => {
    try {
      const response = await apiClient.post<SevaBooking>('/api/seva-bookings', bookingData);
      return response.data;
    } catch (error) {
      if (isAxiosError(error)) {
        console.error('Error creating seva booking:', error.response?.status, error.response?.data);
      } else {
        console.error('Error creating seva booking:', error);
      }
      throw error;
    }
  },

  // Update seva booking
  update: async (bookingId: number, bookingData: SevaBookingUpdateInput): Promise<SevaBooking> => {
    try {
      const response = await apiClient.put<SevaBooking>(`/api/seva-bookings/${bookingId}`, bookingData);
      return response.data;
    } catch (error) {
      console.error(`Error updating seva booking ${bookingId}:`, error);
      throw error;
    }
  },

  // Update seva booking status
  updateStatus: async (bookingId: number, status: SevaBookingStatus): Promise<SevaBooking> => {
    try {
      const response = await apiClient.patch<SevaBooking>(`/api/seva-bookings/${bookingId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Error updating seva booking status ${bookingId}:`, error);
      throw error;
    }
  },

  // Get aggregation by seva ID
  getAggregationBySevaId: async (
    seva_id: number,
    start_date?: string,
    end_date?: string
  ): Promise<SevaBookingBySevaIdResponse> => {
    try {
      const params: any = { seva_id };
      if (start_date) params.start_date = start_date;
      if (end_date) params.end_date = end_date;

      const response = await apiClient.get<SevaBookingBySevaIdResponse>('/api/seva-bookings/aggregation/by-sevaid', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching seva aggregation by seva ID:', error);
      throw error;
    }
  },

  // Get aggregation by date
  getAggregationByDate: async (
    start_date?: string,
    end_date?: string
  ): Promise<SevaBookingByDateResponse> => {
    try {
      const params: any = {};
      if (start_date) params.start_date = start_date;
      if (end_date) params.end_date = end_date;

      const response = await apiClient.get<SevaBookingByDateResponse>('/api/seva-bookings/aggregation/by-date', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching seva aggregation by date:', error);
      throw error;
    }
  },
};

export default apiClient;
