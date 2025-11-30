from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload
from db_init.database import get_db
from db_models.models import SevaBooking, Seva, Gotra
from api_schema.schemas import (
    SevaBookingCreate, SevaBookingUpdate, SevaBookingResponse,
    SevaBookingStatusUpdate
)
from db_models.models import SevaBookingStatus
from datetime import date

router = APIRouter(prefix="/api/seva-bookings", tags=["Seva Bookings"])


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=SevaBookingResponse)
async def create_seva_booking(
    booking: SevaBookingCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new seva booking.

    - **seva_id**: ID of the seva
    - **seva_date**: Date when seva will be performed (current or future only)
    - **name**: Name of the person booking
    - **mobile_no**: Mobile number
    - **gotra_id**: Optional gotra ID
    - **address**: Optional address
    - **remarks**: Optional remarks
    """
    # Verify seva exists
    seva_result = await db.execute(select(Seva).where(Seva.id == booking.seva_id))
    if not seva_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Seva not found")

    # Verify gotra exists if provided
    if booking.gotra_id:
        gotra_result = await db.execute(select(Gotra).where(Gotra.id == booking.gotra_id))
        if not gotra_result.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Gotra not found")

    # Create booking
    db_booking = SevaBooking(
        seva_id=booking.seva_id,
        seva_date=booking.seva_date,
        name=booking.name,
        mobile_no=booking.mobile_no,
        gotra_id=booking.gotra_id,
        address=booking.address,
        remarks=booking.remarks
    )

    db.add(db_booking)
    await db.commit()
    await db.refresh(db_booking)

    # Eager load relationships
    query = select(SevaBooking).options(
        selectinload(SevaBooking.seva),
        selectinload(SevaBooking.gotra)
    ).where(SevaBooking.id == db_booking.id)
    result = await db.execute(query)

    return result.scalars().first()


@router.get("/", status_code=status.HTTP_200_OK)
async def get_all_seva_bookings(
    skip: int = 0,
    limit: int = 50,
    mobile_no: str = None,
    seva_date: date = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Get all seva bookings with optional filters.

    - **skip**: Number of records to skip
    - **limit**: Maximum records to return
    - **mobile_no**: Optional filter by mobile number
    - **seva_date**: Optional filter by seva date
    """
    query = select(SevaBooking).options(
        selectinload(SevaBooking.seva),
        selectinload(SevaBooking.gotra)
    ).order_by(SevaBooking.receipt_date.desc())

    # Apply filters
    filters = []
    if mobile_no:
        filters.append(SevaBooking.mobile_no == mobile_no)
    if seva_date:
        filters.append(SevaBooking.seva_date == seva_date)

    if filters:
        query = query.where(and_(*filters))

    # Get total count
    count_result = await db.execute(select(func.count(SevaBooking.id)).select_from(SevaBooking))
    total_count = count_result.scalar() or 0

    # Get paginated results
    result = await db.execute(query.offset(skip).limit(limit))
    bookings = result.scalars().all()

    # Format response
    data = []
    for booking in bookings:
        data.append({
            "id": booking.id,
            "receipt_date": booking.receipt_date,
            "seva_date": booking.seva_date,
            "seva_name": booking.seva.name,
            "seva_amount": booking.seva.amount,
            "name": booking.name,
            "mobile_no": booking.mobile_no,
            "status": booking.status,
            "gotra_name": booking.gotra.name if booking.gotra else None,
            "address": booking.address,
            "remarks": booking.remarks
        })

    return {
        "total_count": total_count,
        "skip": skip,
        "limit": limit,
        "data": data
    }


@router.get("/{booking_id}", status_code=status.HTTP_200_OK, response_model=SevaBookingResponse)
async def get_seva_booking(
    booking_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific seva booking by ID"""
    result = await db.execute(
        select(SevaBooking).options(
            selectinload(SevaBooking.seva),
            selectinload(SevaBooking.gotra)
        ).where(SevaBooking.id == booking_id)
    )
    booking = result.scalar_one_or_none()

    if not booking:
        raise HTTPException(status_code=404, detail="Seva booking not found")

    return booking


@router.put("/{booking_id}", status_code=status.HTTP_200_OK, response_model=SevaBookingResponse)
async def update_seva_booking(
    booking_id: int,
    booking_update: SevaBookingUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update a seva booking"""
    result = await db.execute(
        select(SevaBooking).options(
            selectinload(SevaBooking.seva),
            selectinload(SevaBooking.gotra)
        ).where(SevaBooking.id == booking_id)
    )
    booking = result.scalar_one_or_none()

    if not booking:
        raise HTTPException(status_code=404, detail="Seva booking not found")

    # Verify seva exists if updating
    if booking_update.seva_id:
        seva_result = await db.execute(select(Seva).where(Seva.id == booking_update.seva_id))
        if not seva_result.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Seva not found")

    # Verify gotra exists if updating
    if booking_update.gotra_id:
        gotra_result = await db.execute(select(Gotra).where(Gotra.id == booking_update.gotra_id))
        if not gotra_result.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Gotra not found")

    # Update fields
    update_data = booking_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(booking, field, value)

    await db.commit()
    await db.refresh(booking)

    # Re-fetch with eager loading
    query = select(SevaBooking).options(
        selectinload(SevaBooking.seva),
        selectinload(SevaBooking.gotra)
    ).where(SevaBooking.id == booking.id)
    result = await db.execute(query)

    return result.scalars().first()


@router.patch("/{booking_id}/status", status_code=status.HTTP_200_OK, response_model=SevaBookingResponse)
async def update_seva_booking_status(
    booking_id: int,
    status_update: SevaBookingStatusUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    Update seva booking status.

    - **status**: Can be 'pending', 'confirmed', or 'cancelled'
    """
    result = await db.execute(
        select(SevaBooking).options(
            selectinload(SevaBooking.seva),
            selectinload(SevaBooking.gotra)
        ).where(SevaBooking.id == booking_id)
    )
    booking = result.scalar_one_or_none()

    if not booking:
        raise HTTPException(status_code=404, detail="Seva booking not found")

    booking.status = status_update.status
    await db.commit()
    await db.refresh(booking)

    # Re-fetch with eager loading
    query = select(SevaBooking).options(
        selectinload(SevaBooking.seva),
        selectinload(SevaBooking.gotra)
    ).where(SevaBooking.id == booking.id)
    result = await db.execute(query)

    return result.scalars().first()


@router.get("/aggregation/by-sevaid", status_code=status.HTTP_200_OK)
async def get_aggregation_by_seva_id(
    seva_id: int,
    start_date: date = None,
    end_date: date = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Get aggregation of seva bookings for a specific seva ID.

    - **seva_id**: ID of the seva to aggregate
    - **start_date**: Optional filter from this date
    - **end_date**: Optional filter till this date
    """
    # Verify seva exists
    seva_result = await db.execute(select(Seva).where(Seva.id == seva_id))
    seva = seva_result.scalar_one_or_none()
    if not seva:
        raise HTTPException(status_code=404, detail="Seva not found")

    # Get individual bookings
    bookings_query = select(SevaBooking).options(
        selectinload(SevaBooking.seva),
        selectinload(SevaBooking.gotra)
    ).where(SevaBooking.seva_id == seva_id)

    # Apply date filters
    if start_date:
        bookings_query = bookings_query.where(SevaBooking.seva_date >= start_date)
    if end_date:
        bookings_query = bookings_query.where(SevaBooking.seva_date <= end_date)

    bookings_query = bookings_query.order_by(SevaBooking.receipt_date.desc())
    bookings_result = await db.execute(bookings_query)
    bookings = bookings_result.scalars().all()

    # Build bookings list with customer details
    bookings_list = []
    total_amount = 0
    for booking in bookings:
        bookings_list.append({
            "id": booking.id,
            "receipt_date": booking.receipt_date,
            "seva_date": booking.seva_date,
            "name": booking.name,
            "mobile_no": booking.mobile_no,
            "gotra_name": booking.gotra.name if booking.gotra else None,
            "address": booking.address,
            "remarks": booking.remarks,
            "status": booking.status
        })
        if booking.seva.amount:
            total_amount += booking.seva.amount

    return {
        "seva_id": seva.id,
        "seva_name": seva.name,
        "seva_amount": seva.amount,
        "total_count": len(bookings),
        "total_amount": total_amount,
        "filters": {
            "start_date": start_date,
            "end_date": end_date
        },
        "bookings": bookings_list
    }


@router.get("/aggregation/by-date", status_code=status.HTTP_200_OK)
async def get_aggregation_by_date(
    start_date: date = None,
    end_date: date = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Get aggregation of seva bookings by date.

    - **start_date**: Optional filter from this date
    - **end_date**: Optional filter till this date
    """
    query = select(
        SevaBooking.seva_date,
        func.count(SevaBooking.id).label("total_bookings"),
        func.sum(Seva.amount).label("total_amount")
    ).join(Seva).group_by(SevaBooking.seva_date)

    # Apply date filters
    if start_date:
        query = query.where(SevaBooking.seva_date >= start_date)
    if end_date:
        query = query.where(SevaBooking.seva_date <= end_date)

    query = query.order_by(SevaBooking.seva_date)

    result = await db.execute(query)
    rows = result.all()

    data = []
    for row in rows:
        # Get sevas on this date
        seva_result = await db.execute(
            select(Seva.name, func.count(SevaBooking.id).label("count"))
            .join(SevaBooking)
            .where(SevaBooking.seva_date == row.seva_date)
            .group_by(Seva.id, Seva.name)
        )
        seva_list = [{"seva_name": r[0], "count": r[1]} for r in seva_result.all()]

        # Get bookings with customer details for this date
        bookings_query = select(SevaBooking).options(
            selectinload(SevaBooking.seva),
            selectinload(SevaBooking.gotra)
        ).where(SevaBooking.seva_date == row.seva_date)

        if start_date:
            bookings_query = bookings_query.where(SevaBooking.seva_date >= start_date)
        if end_date:
            bookings_query = bookings_query.where(SevaBooking.seva_date <= end_date)

        bookings_query = bookings_query.order_by(SevaBooking.receipt_date)
        bookings_result = await db.execute(bookings_query)
        bookings = bookings_result.scalars().all()

        bookings_list = []
        for booking in bookings:
            bookings_list.append({
                "id": booking.id,
                "receipt_date": booking.receipt_date,
                "seva_id": booking.seva.id,
                "seva_name": booking.seva.name,
                "seva_amount": booking.seva.amount,
                "name": booking.name,
                "mobile_no": booking.mobile_no,
                "gotra_name": booking.gotra.name if booking.gotra else None,
                "address": booking.address,
                "remarks": booking.remarks,
                "status": booking.status
            })

        data.append({
            "seva_date": row.seva_date,
            "total_bookings": row.total_bookings,
            "total_amount": row.total_amount,
            "seva_list": seva_list,
            "bookings": bookings_list
        })

    return {
        "filters": {
            "start_date": start_date,
            "end_date": end_date
        },
        "data": data
    }


@router.post("/aggregation/multiple", status_code=status.HTTP_200_OK)
async def get_multiple_sevas_aggregation(
    request: dict,
    db: AsyncSession = Depends(get_db)
):
    """
    Get aggregation for multiple selected sevas.

    Request body should contain:
    - **seva_ids**: List of seva IDs to aggregate
    - **start_date**: Optional filter from this date
    - **end_date**: Optional filter till this date
    """
    seva_ids = request.get("seva_ids", [])
    start_date = request.get("start_date")
    end_date = request.get("end_date")

    if not seva_ids:
        raise HTTPException(status_code=400, detail="seva_ids list is required")

    # Base query
    base_query = select(SevaBooking).options(
        selectinload(SevaBooking.seva),
        selectinload(SevaBooking.gotra)
    ).where(SevaBooking.seva_id.in_(seva_ids))

    if start_date:
        base_query = base_query.where(SevaBooking.seva_date >= start_date)
    if end_date:
        base_query = base_query.where(SevaBooking.seva_date <= end_date)

    # Get all bookings for these sevas
    result = await db.execute(base_query)
    bookings = result.scalars().all()

    # Calculate aggregations
    total_bookings = len(bookings)
    total_amount = sum(b.seva.amount for b in bookings if b.seva.amount)

    # Aggregation by seva name
    seva_aggregation = {}
    for booking in bookings:
        seva_key = booking.seva.id
        if seva_key not in seva_aggregation:
            seva_aggregation[seva_key] = {
                "seva_name": booking.seva.name,
                "seva_amount": booking.seva.amount,
                "total_count": 0,
                "total_amount": 0
            }
        seva_aggregation[seva_key]["total_count"] += 1
        if booking.seva.amount:
            seva_aggregation[seva_key]["total_amount"] += booking.seva.amount

    bookings_by_seva = list(seva_aggregation.values())

    # Aggregation by date
    date_aggregation = {}
    for booking in bookings:
        date_key = str(booking.seva_date)
        if date_key not in date_aggregation:
            date_aggregation[date_key] = {
                "seva_date": booking.seva_date,
                "total_bookings": 0,
                "total_amount": 0
            }
        date_aggregation[date_key]["total_bookings"] += 1
        if booking.seva.amount:
            date_aggregation[date_key]["total_amount"] += booking.seva.amount

    bookings_by_date = sorted(date_aggregation.values(), key=lambda x: x["seva_date"])

    # Build bookings list with customer details
    bookings_list = []
    for booking in bookings:
        bookings_list.append({
            "id": booking.id,
            "receipt_date": booking.receipt_date,
            "seva_date": booking.seva_date,
            "seva_id": booking.seva.id,
            "seva_name": booking.seva.name,
            "seva_amount": booking.seva.amount,
            "name": booking.name,
            "mobile_no": booking.mobile_no,
            "gotra_name": booking.gotra.name if booking.gotra else None,
            "address": booking.address,
            "remarks": booking.remarks,
            "status": booking.status
        })

    return {
        "selected_seva_ids": seva_ids,
        "filters": {
            "start_date": start_date,
            "end_date": end_date
        },
        "total_bookings": total_bookings,
        "total_amount": total_amount,
        "bookings_by_seva": bookings_by_seva,
        "bookings_by_date": bookings_by_date,
        "bookings": bookings_list
    }
