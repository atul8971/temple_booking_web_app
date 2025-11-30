from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import and_, extract, select
from sqlalchemy.orm import selectinload
from datetime import datetime, date, time
from typing import List
from db_init.database import get_db
from db_models.models import Booking, BookingStatus
from api_schema.schemas import (
    CalendarDayResponse,
    CalendarWeekResponse,
    CalendarMonthResponse,
    CalendarBookingItem
)

router = APIRouter(prefix="/calendar", tags=["calendar"])


def booking_to_calendar_item(booking: Booking) -> dict:
    """
    Convert Booking model to CalendarBookingItem dict.

    Args:
        booking: Booking object from database

    Returns:
        Dictionary matching CalendarBookingItem schema
    """
    return {
        "id": booking.id,
        "hall_id": booking.hall_id,
        "hall_name": booking.hall.name,
        "event_purpose": booking.event_purpose,
        "customer_name": booking.customer_name,
        "customer_phone": booking.customer_phone, # Added customer_phone
        "booking_start_date": booking.booking_start_date,
        "booking_end_date": booking.booking_end_date,
        "start_time": booking.start_time,
        "end_time": booking.end_time,
        "status": booking.status
    }


@router.get("/day", response_model=CalendarDayResponse)
async def get_day_view(
    date_param: date = Query(..., alias="date", description="Date to view bookings for"),
    hall_id: int = Query(None, description="Optional hall ID to filter bookings"),
    include_cancelled: bool = Query(False, description="Include cancelled bookings"),
    db: AsyncSession = Depends(get_db)
) -> CalendarDayResponse:
    """
    Get all bookings for a specific day.

    Args:
        date_param: The date to retrieve bookings for
        hall_id: Optional filter by specific hall
        include_cancelled: Whether to include cancelled bookings (default: False)

    Returns:
        Day view with all bookings for the specified date
    """
    # Convert date to datetime for database query
    day_start = datetime.combine(date_param, time.min)
    day_end = datetime.combine(date_param, time.max)

    # Build query - find bookings that overlap with this day
    query = select(Booking).options(selectinload(Booking.hall)).filter(
        and_(
            Booking.booking_start_date <= day_end,
            Booking.booking_end_date >= day_start
        )
    )

    # Apply filters
    if hall_id:
        query = query.filter(Booking.hall_id == hall_id)

    if not include_cancelled:
        query = query.filter(Booking.status != BookingStatus.CANCELLED)

    # Order by start time
    query = query.order_by(Booking.start_time)
    result = await db.execute(query)
    bookings = result.scalars().all()

    # Convert to calendar items
    calendar_items = [booking_to_calendar_item(b) for b in bookings]

    return CalendarDayResponse(
        date=date_param,
        bookings=calendar_items,
        total_bookings=len(calendar_items)
    )


@router.get("/week", response_model=CalendarWeekResponse)
async def get_week_view(
    start_date: date = Query(..., description="Start date of the week"),
    end_date: date = Query(..., description="End date of the week"),
    hall_id: int = Query(None, description="Optional hall ID to filter bookings"),
    include_cancelled: bool = Query(False, description="Include cancelled bookings"),
    db: AsyncSession = Depends(get_db)
) -> CalendarWeekResponse:
    """
    Get all bookings for a specific week or date range.

    Args:
        start_date: Start date of the range
        end_date: End date of the range
        hall_id: Optional filter by specific hall
        include_cancelled: Whether to include cancelled bookings (default: False)

    Returns:
        Week view with all bookings in the date range

    Raises:
        HTTPException 400: If end_date is before start_date or range exceeds 31 days
    """
    from fastapi import HTTPException, status

    # Validate date range
    if end_date < start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="end_date must be on or after start_date"
        )

    if (end_date - start_date).days > 31:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="date range cannot exceed 31 days"
        )

    # Convert dates to datetime for database query
    start_datetime = datetime.combine(start_date, time.min)
    end_datetime = datetime.combine(end_date, time.max)

    # Build query - find bookings that overlap with the date range
    query = select(Booking).options(selectinload(Booking.hall)).filter(
        and_(
            Booking.booking_start_date <= end_datetime,
            Booking.booking_end_date >= start_datetime
        )
    )

    # Apply filters
    if hall_id:
        query = query.filter(Booking.hall_id == hall_id)

    if not include_cancelled:
        query = query.filter(Booking.status != BookingStatus.CANCELLED)

    # Order by date and time
    query = query.order_by(Booking.booking_start_date, Booking.start_time)
    result = await db.execute(query)
    bookings = result.scalars().all()

    # Convert to calendar items
    calendar_items = [booking_to_calendar_item(b) for b in bookings]

    return CalendarWeekResponse(
        start_date=start_date,
        end_date=end_date,
        bookings=calendar_items,
        total_bookings=len(calendar_items)
    )


@router.get("/month", response_model=CalendarMonthResponse)
async def get_month_view(
    year: int = Query(..., ge=2000, le=2100, description="Year to view"),
    month: int = Query(..., ge=1, le=12, description="Month to view (1-12)"),
    hall_id: int = Query(None, description="Optional hall ID to filter bookings"),
    include_cancelled: bool = Query(False, description="Include cancelled bookings"),
    db: AsyncSession = Depends(get_db)
) -> CalendarMonthResponse:
    """
    Get all bookings for a specific month.

    Args:
        year: Year of the month to view
        month: Month to view (1-12)
        hall_id: Optional filter by specific hall
        include_cancelled: Whether to include cancelled bookings (default: False)

    Returns:
        Month view with all bookings in the specified month
    """
    # Build query using extract for year and month
    query = select(Booking).options(selectinload(Booking.hall)).filter(
        and_(
            extract('year', Booking.booking_start_date) == year,
            extract('month', Booking.booking_start_date) == month
        )
    )

    # Apply filters
    if hall_id:
        query = query.filter(Booking.hall_id == hall_id)

    if not include_cancelled:
        query = query.filter(Booking.status != BookingStatus.CANCELLED)

    # Order by date and time
    query = query.order_by(Booking.booking_start_date, Booking.start_time)
    result = await db.execute(query)
    bookings = result.scalars().all()

    # Convert to calendar items
    calendar_items = [booking_to_calendar_item(b) for b in bookings]

    return CalendarMonthResponse(
        year=year,
        month=month,
        bookings=calendar_items,
        total_bookings=len(calendar_items)
    )
