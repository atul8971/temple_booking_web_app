from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from db_init.database import get_db
from db_models.models import Gotra

router = APIRouter(prefix="/api/gotras", tags=["Gotras"])


@router.get("/", status_code=status.HTTP_200_OK)
async def get_all_gotras(db: AsyncSession = Depends(get_db)):
    """
    Get all gotras from the master table.

    Returns:
        List of all gotra names
    """
    result = await db.execute(select(Gotra).order_by(Gotra.name))
    gotras = result.scalars().all()
    return {
        "count": len(gotras),
        "data": [{"id": g.id, "name": g.name} for g in gotras]
    }


@router.get("/{gotra_id}", status_code=status.HTTP_200_OK)
async def get_gotra(gotra_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get a specific gotra by ID.

    Args:
        gotra_id: The ID of the gotra

    Returns:
        Gotra details or 404 if not found
    """
    result = await db.execute(select(Gotra).where(Gotra.id == gotra_id))
    gotra = result.scalar_one_or_none()

    if not gotra:
        return {"error": "Gotra not found", "status_code": 404}

    return {"id": gotra.id, "name": gotra.name}


@router.get("/search/{query}", status_code=status.HTTP_200_OK)
async def search_gotras(query: str, db: AsyncSession = Depends(get_db)):
    """
    Search gotras by name (case-insensitive).

    Args:
        query: Search query string

    Returns:
        List of matching gotras
    """
    result = await db.execute(
        select(Gotra).where(Gotra.name.ilike(f"%{query}%")).order_by(Gotra.name)
    )
    gotras = result.scalars().all()
    return {
        "count": len(gotras),
        "data": [{"id": g.id, "name": g.name} for g in gotras]
    }
