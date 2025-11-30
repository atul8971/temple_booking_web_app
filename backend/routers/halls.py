from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
from db_init.database import get_db
from db_models.models import Hall
from api_schema.schemas import HallCreate, HallUpdate, HallResponse

router = APIRouter(prefix="/halls", tags=["halls"])


@router.post("/", response_model=HallResponse, status_code=status.HTTP_201_CREATED)
async def create_hall(hall_data: HallCreate, db: AsyncSession = Depends(get_db)) -> Hall:
    """
    Create a new hall with the provided information.

    Returns:
        Created hall object with all details

    Raises:
        HTTPException 409: If hall with the same name already exists
    """
    # Check if hall with same name exists
    result = await db.execute(select(Hall).filter(Hall.name == hall_data.name))
    existing_hall = result.scalars().first()
    if existing_hall:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Hall with name '{hall_data.name}' already exists"
        )

    # Create new hall
    new_hall = Hall(**hall_data.model_dump())
    db.add(new_hall)
    await db.commit()
    await db.refresh(new_hall)

    return new_hall


@router.get("/", response_model=List[HallResponse])
async def get_all_halls(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
) -> List[Hall]:
    """
    Retrieve all halls with pagination support.

    Args:
        skip: Number of records to skip (default: 0)
        limit: Maximum number of records to return (default: 100)

    Returns:
        List of all halls
    """
    result = await db.execute(select(Hall).offset(skip).limit(limit))
    halls = result.scalars().all()
    return halls


@router.get("/{hall_id}", response_model=HallResponse)
async def get_hall(hall_id: int, db: AsyncSession = Depends(get_db)) -> Hall:
    """
    Retrieve a specific hall by ID.

    Args:
        hall_id: ID of the hall to retrieve

    Returns:
        Hall object with all details

    Raises:
        HTTPException 404: If hall not found
    """
    result = await db.execute(select(Hall).filter(Hall.id == hall_id))
    hall = result.scalars().first()
    if not hall:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hall with ID {hall_id} not found"
        )

    return hall


@router.put("/{hall_id}", response_model=HallResponse)
async def update_hall(
    hall_id: int,
    hall_data: HallUpdate,
    db: AsyncSession = Depends(get_db)
) -> Hall:
    """
    Update an existing hall's information.

    Args:
        hall_id: ID of the hall to update
        hall_data: Updated hall information (only provided fields will be updated)

    Returns:
        Updated hall object

    Raises:
        HTTPException 404: If hall not found
        HTTPException 409: If updating name to one that already exists
    """
    result = await db.execute(select(Hall).filter(Hall.id == hall_id))
    hall = result.scalars().first()
    if not hall:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hall with ID {hall_id} not found"
        )

    # Get only fields that were actually provided (exclude None values)
    update_data = hall_data.model_dump(exclude_unset=True)

    # Check if name is being updated and if it conflicts
    if "name" in update_data and update_data["name"] != hall.name:
        result = await db.execute(select(Hall).filter(Hall.name == update_data["name"]))
        existing_hall = result.scalars().first()
        if existing_hall:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Hall with name '{update_data['name']}' already exists"
            )

    # Validate time range if both times are provided
    if "available_from" in update_data and "available_to" in update_data:
        if update_data["available_to"] <= update_data["available_from"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="available_to must be after available_from"
            )

    # Update hall attributes
    for field, value in update_data.items():
        setattr(hall, field, value)

    await db.commit()
    await db.refresh(hall)

    return hall


@router.delete("/{hall_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_hall(hall_id: int, db: AsyncSession = Depends(get_db)) -> None:
    """
    Delete a hall by ID.

    Args:
        hall_id: ID of the hall to delete

    Raises:
        HTTPException 404: If hall not found
        HTTPException 409: If hall has existing bookings
    """
    result = await db.execute(
        select(Hall)
        .filter(Hall.id == hall_id)
        .options(selectinload(Hall.bookings))
    )
    hall = result.scalars().first()
    if not hall:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hall with ID {hall_id} not found"
        )

    # Check if hall has any bookings
    if hall.bookings:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot delete hall with existing bookings. Hall has {len(hall.bookings)} booking(s)."
        )

    await db.delete(hall)
    await db.commit()
