from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from db_init.database import get_db
from db_models.models import Seva

router = APIRouter(prefix="/api/sevas", tags=["Sevas"])


@router.get("/", status_code=status.HTTP_200_OK)
async def get_all_sevas(db: AsyncSession = Depends(get_db)):
    """
    Get all sevas from the master table.

    Returns:
        List of all sevas with their names and amounts
    """
    result = await db.execute(select(Seva).order_by(Seva.name))
    sevas = result.scalars().all()
    return {
        "count": len(sevas),
        "data": [{"id": s.id, "name": s.name, "amount": s.amount} for s in sevas]
    }


@router.get("/{seva_id}", status_code=status.HTTP_200_OK)
async def get_seva(seva_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get a specific seva by ID.

    Args:
        seva_id: The ID of the seva

    Returns:
        Seva details or 404 if not found
    """
    result = await db.execute(select(Seva).where(Seva.id == seva_id))
    seva = result.scalar_one_or_none()

    if not seva:
        return {"error": "Seva not found", "status_code": 404}

    return {"id": seva.id, "name": seva.name, "amount": seva.amount}


@router.get("/search/{query}", status_code=status.HTTP_200_OK)
async def search_sevas(query: str, db: AsyncSession = Depends(get_db)):
    """
    Search sevas by name (case-insensitive).

    Args:
        query: Search query string

    Returns:
        List of matching sevas
    """
    result = await db.execute(
        select(Seva).where(Seva.name.ilike(f"%{query}%")).order_by(Seva.name)
    )
    sevas = result.scalars().all()
    return {
        "count": len(sevas),
        "data": [{"id": s.id, "name": s.name, "amount": s.amount} for s in sevas]
    }
