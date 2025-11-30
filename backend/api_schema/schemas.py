from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import datetime, date
from typing import Optional, List
from db_models.models import BookingStatus, SevaBookingStatus


# ==================== Hall Schemas ====================

class HallBase(BaseModel):
    """Base schema for Hall with common fields"""
    name: str = Field(..., min_length=1, max_length=200)
    capacity: int = Field(..., gt=0)
    facilities: Optional[List[str]] = None


class HallCreate(HallBase):
    """Schema for creating a new hall"""
    pass


class HallUpdate(BaseModel):
    """Schema for updating hall (all fields optional)"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    capacity: Optional[int] = Field(None, gt=0)
    facilities: Optional[List[str]] = None


class HallResponse(HallBase):
    """Schema for hall response"""
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ==================== Booking Schemas ====================

class BookingBase(BaseModel):
    """Base schema for Booking with common fields"""
    hall_id: int = Field(..., gt=0)
    customer_name: str = Field(..., min_length=1, max_length=200)
    customer_phone: str = Field(..., min_length=10, max_length=15)
    event_purpose: Optional[str] = Field(None, max_length=500)
    booking_start_date: date
    booking_end_date: date
    start_time: str = Field(..., pattern=r"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$")
    end_time: str = Field(..., pattern=r"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$")


class BookingCreate(BookingBase):
    """Schema for creating a new booking"""
    pass


class BookingUpdate(BaseModel):
    """Schema for updating booking status"""
    status: BookingStatus


class BookingResponse(BookingBase):
    """Schema for booking response"""
    id: int
    status: BookingStatus
    created_at: datetime
    updated_at: datetime
    hall: HallResponse

    model_config = {"from_attributes": True}


class BookingListResponse(BaseModel):
    """Schema for simplified booking list (without full hall details)"""
    id: int
    hall_id: int
    hall_name: str
    customer_name: str
    customer_phone: str
    event_purpose: Optional[str]
    booking_start_date: date
    booking_end_date: date
    start_time: str
    end_time: str
    status: BookingStatus
    created_at: datetime

    model_config = {"from_attributes": True}


# ==================== Calendar Schemas ====================

class CalendarDayRequest(BaseModel):
    """Schema for day view request"""
    date: date


class CalendarWeekRequest(BaseModel):
    """Schema for week view request"""
    start_date: date
    end_date: date

    @field_validator("end_date")
    @classmethod
    def validate_date_range(cls, v: date, info) -> date:
        """Ensure end_date is after start_date"""
        if "start_date" in info.data:
            start = info.data["start_date"]
            if v < start:
                raise ValueError("end_date must be on or after start_date")
            # Limit to reasonable range (e.g., 31 days)
            if (v - start).days > 31:
                raise ValueError("date range cannot exceed 31 days")
        return v


class CalendarMonthRequest(BaseModel):
    """Schema for month view request"""
    year: int = Field(..., ge=2000, le=2100)
    month: int = Field(..., ge=1, le=12)


class CalendarBookingItem(BaseModel):
    """Simplified booking item for calendar views"""
    id: int
    hall_id: int
    hall_name: str
    event_purpose: Optional[str]
    customer_name: str
    customer_phone: str # Added mobile number for calendar view
    booking_start_date: datetime
    booking_end_date: datetime
    start_time: str
    end_time: str
    status: BookingStatus

    model_config = {"from_attributes": True}


class CalendarDayResponse(BaseModel):
    """Response schema for day view"""
    date: date
    bookings: List[CalendarBookingItem]
    total_bookings: int


class CalendarWeekResponse(BaseModel):
    """Response schema for week view"""
    start_date: date
    end_date: date
    bookings: List[CalendarBookingItem]
    total_bookings: int


class CalendarMonthResponse(BaseModel):
    """Response schema for month view"""
    year: int
    month: int
    bookings: List[CalendarBookingItem]
    total_bookings: int


# ==================== Seva Booking Schemas ====================

class SevaBookingBase(BaseModel):
    """Base schema for SevaBooking with common fields"""
    seva_id: int = Field(..., gt=0)
    seva_date: date = Field(..., description="Date when seva will be performed (current or future)")
    name: str = Field(..., min_length=1, max_length=200)
    mobile_no: str = Field(..., min_length=10, max_length=15)
    gotra_id: Optional[int] = Field(None, gt=0)
    address: Optional[str] = Field(None, max_length=500)
    remarks: Optional[str] = Field(None, max_length=500)

    @field_validator("seva_date")
    @classmethod
    def validate_seva_date(cls, v: date) -> date:
        """Ensure seva_date is current or future date"""
        if v < date.today():
            raise ValueError("seva_date must be today or a future date")
        return v


class SevaBookingCreate(SevaBookingBase):
    """Schema for creating a new seva booking"""
    pass


class SevaBookingUpdate(BaseModel):
    """Schema for updating seva booking"""
    seva_id: Optional[int] = Field(None, gt=0)
    seva_date: Optional[date] = None
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    mobile_no: Optional[str] = Field(None, min_length=10, max_length=15)
    gotra_id: Optional[int] = Field(None, gt=0)
    address: Optional[str] = Field(None, max_length=500)
    remarks: Optional[str] = Field(None, max_length=500)

    @field_validator("seva_date")
    @classmethod
    def validate_seva_date(cls, v: Optional[date]) -> Optional[date]:
        """Ensure seva_date is current or future date"""
        if v and v < date.today():
            raise ValueError("seva_date must be today or a future date")
        return v


class SevaResponse(BaseModel):
    """Schema for Seva response"""
    id: int
    name: str
    amount: Optional[float]

    model_config = {"from_attributes": True}


class GotraResponse(BaseModel):
    """Schema for Gotra response"""
    id: int
    name: str

    model_config = {"from_attributes": True}


class SevaBookingResponse(SevaBookingBase):
    """Schema for seva booking response"""
    id: int
    receipt_date: date
    status: SevaBookingStatus
    seva: SevaResponse
    gotra: Optional[GotraResponse]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class SevaBookingListResponse(BaseModel):
    """Schema for simplified seva booking list"""
    id: int
    receipt_date: date
    seva_date: date
    seva_name: str
    seva_amount: Optional[float]
    name: str
    mobile_no: str
    status: SevaBookingStatus
    gotra_name: Optional[str]
    address: Optional[str]
    remarks: Optional[str]

    model_config = {"from_attributes": True}


class SevaBookingStatusUpdate(BaseModel):
    """Schema for updating seva booking status"""
    status: SevaBookingStatus


# ==================== Seva Aggregation Schemas ====================

class SevaAggregationByName(BaseModel):
    """Schema for seva aggregation by name"""
    seva_name: str
    seva_amount: Optional[float]
    total_count: int
    total_amount: Optional[float]


class SevaAggregationByDate(BaseModel):
    """Schema for seva aggregation by date"""
    seva_date: date
    total_bookings: int
    total_amount: Optional[float]
    seva_list: List[dict]  # List of sevas on that date


class MultipleSevaSummary(BaseModel):
    """Schema for aggregation of multiple selected sevas"""
    selected_seva_ids: List[int]
    total_bookings: int
    total_amount: Optional[float]
    bookings_by_seva: List[SevaAggregationByName]
    bookings_by_date: List[dict]
