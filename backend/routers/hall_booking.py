from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import and_, or_, select
from sqlalchemy.orm import selectinload, joinedload
from typing import List
from datetime import datetime, date, time
from db_init.database import get_db
from db_models.models import Booking, Hall, BookingStatus
from api_schema.schemas import BookingCreate, BookingUpdate, BookingResponse, BookingListResponse

router = APIRouter(prefix="/hall-booking", tags=["hall-booking"])


def check_datetime_overlap(
    start1: datetime,
    end1: datetime,
    start2: datetime,
    end2: datetime
) -> bool:
    """
    Check if two datetime ranges overlap.

    Args:
        start1: Start datetime of first range
        end1: End datetime of first range
        start2: Start datetime of second range
        end2: End datetime of second range

    Returns:
        True if datetime ranges overlap, False otherwise
    """
    # Check for overlap: ranges overlap if start of one is before end of other
    return start1 < end2 and start2 < end1


async def check_booking_conflict(
    db: AsyncSession,
    hall_id: int,
    booking_start_date: date,
    booking_end_date: date,
    start_time: str,  # Assumed format HH:MM
    end_time: str,    # Assumed format HH:MM
    exclude_booking_id: int = None
) -> bool:
    """
    Check if a booking conflicts with existing bookings, considering full datetime range.

    Args:
        db: Database session
        hall_id: ID of the hall
        booking_start_date: Start date of the booking
        booking_end_date: End date of the booking
        start_time: Start time of the booking (HH:MM)
        end_time: End time of the booking (HH:MM)
        exclude_booking_id: Booking ID to exclude from conflict check (for updates)

    Returns:
        True if conflict exists, False otherwise
    """
    # Helper to parse time string (HH:MM) to time object
    def parse_time_str(time_str: str) -> time:
        try:
            h, m = map(int, time_str.split(':'))
            return time(h, m)
        except ValueError:
            # Raise HTTPException for invalid time format
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid time format: {time_str}. Expected HH:MM.")

    # Convert request date/time components to full datetime objects for new booking
    new_booking_start_time = parse_time_str(start_time)
    new_booking_end_time = parse_time_str(end_time)

    # Create the full datetime range for the requested booking
    new_start_dt = datetime.combine(booking_start_date, new_booking_start_time)
    new_end_dt = datetime.combine(booking_end_date, new_booking_end_time)

    # Validate datetime range integrity
    if new_end_dt <= new_start_dt:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking end datetime must be after start datetime"
        )
    
    # --- DB Query Optimization (still using combined date ranges for efficient filtering) ---
    # Query for bookings that potentially overlap (date range check)
    # Use time.min/time.max to ensure the query includes all days between the booking dates for filter optimization.
    # Query for bookings that potentially overlap (date range check)
    query = select(Booking).filter(
        and_(
            Booking.hall_id == hall_id,
            # Check if existing booking date range overlaps with requested date range
            # Booking date columns are now pure Date objects (Date <= date, Date >= date)
            Booking.booking_start_date <= booking_end_date,
            Booking.booking_end_date >= booking_start_date,
            Booking.status == BookingStatus.CONFIRMED
        )
    )

    # Exclude specific booking if provided (for update scenarios)
    if exclude_booking_id:
        query = query.filter(Booking.id != exclude_booking_id)

    result = await db.execute(query)
    existing_bookings = result.scalars().all()

    # Perform precise datetime overlap check using the new function
    for existing_booking in existing_bookings:
        
        # Combine existing booking date and time components into full datetimes
        try:
            existing_start_time = parse_time_str(existing_booking.start_time)
            existing_end_time = parse_time_str(existing_booking.end_time)
        except HTTPException:
            # Should not happen if DB data is valid, but defensively skip malformed data
            continue
            
        existing_start_dt = datetime.combine(existing_booking.booking_start_date, existing_start_time)
        existing_end_dt = datetime.combine(existing_booking.booking_end_date, existing_end_time)
        
        # Check for overlap using full datetimes
        if check_datetime_overlap(
            new_start_dt,
            new_end_dt,
            existing_start_dt,
            existing_end_dt
        ):
            return True

    return False


@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
    booking_data: BookingCreate,
    db: AsyncSession = Depends(get_db)
) -> Booking:
    """
    Create a new booking request.

    Returns:
        Created booking object with all details

    Raises:
        HTTPException 404: If hall not found
        HTTPException 400: If booking date is in the past or invalid date range
        HTTPException 409: If booking conflicts with existing bookings
    """
    # Verify hall exists
    result = await db.execute(select(Hall).filter(Hall.id == booking_data.hall_id))
    hall = result.scalars().first()
    if not hall:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hall with ID {booking_data.hall_id} not found"
        )

    # Validate date range
    if booking_data.booking_end_date < booking_data.booking_start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking end date must be on or after start date"
        )

    # Check if booking start date is in the past
    if booking_data.booking_start_date < date.today():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot create booking for past dates"
        )

    # Check for booking conflicts
    if await check_booking_conflict(
        db,
        booking_data.hall_id,
        booking_data.booking_start_date,
        booking_data.booking_end_date,
        booking_data.start_time,
        booking_data.end_time
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Booking conflicts with an existing booking for this hall and time slot"
        )

    # Create booking
    booking_dict = booking_data.model_dump()
    new_booking = Booking(**booking_dict)
    db.add(new_booking)
    await db.commit()
    
    # Re-fetch the newly created object with eager loading for serialization
    query = select(Booking).options(selectinload(Booking.hall)).filter(Booking.id == new_booking.id)
    result = await db.execute(query)
    
    return result.scalars().first()


@router.get("/", response_model=List[BookingListResponse])
async def get_all_bookings(
    skip: int = 0,
    limit: int = 100,
    status_filter: BookingStatus = None,
    hall_id: int = None,
    db: AsyncSession = Depends(get_db)
) -> List[dict]:
    """
    Retrieve all bookings with optional filters.

    Args:
        skip: Number of records to skip (default: 0)
        limit: Maximum number of records to return (default: 100)
        status_filter: Filter by booking status (optional)
        hall_id: Filter by hall ID (optional)

    Returns:
        List of bookings
    """
    query = select(Booking).options(selectinload(Booking.hall))

    # Apply filters
    if status_filter:
        query = query.filter(Booking.status == status_filter)
    if hall_id:
        query = query.filter(Booking.hall_id == hall_id)

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    bookings = result.scalars().all()

    # Transform to list response format
    response = []
    for booking in bookings:
        response.append({
            "id": booking.id,
            "hall_id": booking.hall_id,
            "hall_name": booking.hall.name,
            "customer_name": booking.customer_name,
            "customer_phone": booking.customer_phone,
            "event_purpose": booking.event_purpose,
            "booking_start_date": booking.booking_start_date,
            "booking_end_date": booking.booking_end_date,
            "start_time": booking.start_time,
            "end_time": booking.end_time,
            "status": booking.status,
            "created_at": booking.created_at
        })

    return response


@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking(booking_id: int, db: AsyncSession = Depends(get_db)) -> Booking:
    """
    Retrieve a specific booking by ID.

    Args:
        booking_id: ID of the booking to retrieve

    Returns:
        Booking object with all details including hall information

    Raises:
        HTTPException 404: If booking not found
    """
    result = await db.execute(
        select(Booking)
        .options(selectinload(Booking.hall))
        .filter(Booking.id == booking_id)
    )
    booking = result.scalars().first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Booking with ID {booking_id} not found"
        )

    return booking


@router.patch("/{booking_id}", response_model=BookingResponse)
async def update_booking_status(
    booking_id: int,
    booking_update: BookingUpdate,
    db: AsyncSession = Depends(get_db)
) -> Booking:
    """
    Update booking status (confirm or cancel).

    Args:
        booking_id: ID of the booking to update
        booking_update: New status for the booking

    Returns:
        Updated booking object

    Raises:
        HTTPException 404: If booking not found
        HTTPException 400: If status transition is invalid
    """
    result = await db.execute(
        select(Booking)
        .options(selectinload(Booking.hall))
        .filter(Booking.id == booking_id)
    )
    booking = result.scalars().first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Booking with ID {booking_id} not found"
        )

    # Validate status transitions
    if booking.status == BookingStatus.CANCELLED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify a cancelled booking"
        )

    if booking.status == BookingStatus.CONFIRMED and booking_update.status == BookingStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change confirmed booking back to pending"
        )

    # Update status
    booking.status = booking_update.status
    await db.commit()
    await db.refresh(booking)

    return booking


