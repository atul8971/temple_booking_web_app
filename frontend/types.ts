export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

export interface Hall {
  id: number;
  name: string;
  capacity: number;
  facilities: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface HallCreateInput {
  name: string;
  capacity: number;
  facilities: string[] | null;
}

export interface HallUpdateInput {
  name?: string;
  capacity?: number;
  facilities?: string[] | null;
}

export interface Booking {
  id: number;
  hall_id: number;
  customer_name: string;
  customer_phone: string;
  event_purpose?: string;
  booking_start_date: string;
  booking_end_date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
  hall: Hall;
}

export interface BookingCreateInput {
  hall_id: number;
  customer_name: string;
  customer_phone: string;
  event_purpose?: string;
  booking_start_date: string;
  booking_end_date: string;
  start_time: string;
  end_time: string;
}

export interface BookingUpdateInput {
  status: BookingStatus;
}

export interface BookingListItem {
  id: number;
  hall_id: number;
  hall_name: string;
  customer_name: string;
  customer_phone: string;
  event_purpose?: string;
  booking_start_date: string;
  booking_end_date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  created_at: string;
}

export interface CalendarDayResponse {
  date: string;
  bookings: BookingListItem[];
  total_bookings: number;
}

export interface CalendarWeekResponse {
  start_date: string;
  end_date: string;
  bookings: BookingListItem[];
  total_bookings: number;
}

export interface CalendarMonthResponse {
  year: number;
  month: number;
  bookings: BookingListItem[];
  total_bookings: number;
}


export interface ApiError {
  detail: string;
  error?: string;
}

// ============== SEVA BOOKING TYPES ==============

export enum SevaBookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

export interface Gotra {
  id: number;
  name: string;
}

export interface Seva {
  id: number;
  name: string;
  amount: number | null;
}

export interface SevaBooking {
  id: number;
  receipt_date: string;
  seva_id: number;
  seva_date: string;
  name: string;
  mobile_no: string;
  gotra_id?: number | null;
  address?: string | null;
  remarks?: string | null;
  status: SevaBookingStatus;
  seva: Seva;
  gotra?: Gotra | null;
  created_at: string;
  updated_at: string;
}

export interface SevaBookingCreateInput {
  seva_id: number;
  seva_date: string;
  name: string;
  mobile_no: string;
  gotra_id?: number | null;
  address?: string | null;
  remarks?: string | null;
}

export interface SevaBookingUpdateInput {
  seva_id?: number;
  seva_date?: string;
  name?: string;
  mobile_no?: string;
  gotra_id?: number | null;
  address?: string | null;
  remarks?: string | null;
}

export interface SevaBookingListItem {
  id: number;
  receipt_date: string;
  seva_date: string;
  seva_name: string;
  seva_amount: number | null;
  name: string;
  mobile_no: string;
  status: SevaBookingStatus;
  gotra_name?: string | null;
  address?: string | null;
  remarks?: string | null;
}

export interface SevaBookingByDateResponse {
  filters: {
    start_date: string | null;
    end_date: string | null;
  };
  data: Array<{
    seva_date: string;
    total_bookings: number;
    total_amount: number | null;
    seva_list: Array<{
      seva_name: string;
      count: number;
    }>;
    bookings: SevaBookingListItem[];
  }>;
}

export interface SevaBookingBySevaIdResponse {
  seva_id: number;
  seva_name: string;
  seva_amount: number | null;
  total_count: number;
  total_amount: number;
  filters: {
    start_date: string | null;
    end_date: string | null;
  };
  bookings: SevaBookingListItem[];
}
