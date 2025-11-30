from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from typing import AsyncGenerator
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# PostgreSQL database URL from environment variable
# Format: postgresql+asyncpg://user:password@host:port/database
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/hall_booking"
)

# Convert to async URL format if needed
if SQLALCHEMY_DATABASE_URL.startswith("postgresql://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace(
        "postgresql://", "postgresql+asyncpg://"
    )

# Create async engine for PostgreSQL
engine = create_async_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True,  # Verify connections before using them
    echo=False  # Set to True for SQL query logging
)

# Create AsyncSessionLocal class for database sessions
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

# Base class for models
Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Async dependency function to get database session.
    Ensures proper cleanup after each request.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def seed_gotras():
    """
    Seed the gotras table with master data if it's empty.
    Reads data from data/gotras.json file.
    """
    import json
    from pathlib import Path
    from sqlalchemy import select, func
    from db_models.models import Gotra

    # Load gotra data from JSON file
    data_file = Path(__file__).parent.parent / "data" / "gotras.json"

    if not data_file.exists():
        print(f"Warning: Gotra data file not found at {data_file}")
        return

    try:
        with open(data_file, 'r') as f:
            gotra_data = json.load(f)
    except Exception as e:
        print(f"Error reading gotra data file: {e}")
        return

    async with AsyncSessionLocal() as session:
        try:
            # Check if gotras table has any records
            result = await session.execute(select(func.count(Gotra.id)))
            count = result.scalar()

            if count == 0:
                print("Seeding gotras table with master data...")
                # Create gotra records
                gotras = [Gotra(name=name) for name in gotra_data]
                session.add_all(gotras)
                await session.commit()
                print(f"Successfully seeded {len(gotra_data)} gotras!")
            else:
                print(f"Gotras table already has {count} records. Skipping seeding.")
        except Exception as e:
            print(f"Error seeding gotras: {e}")
            await session.rollback()


async def seed_sevas():
    """
    Seed the sevas table with master data if it's empty.
    Reads data from data/sevas.json file.
    """
    import json
    from pathlib import Path
    from sqlalchemy import select, func
    from db_models.models import Seva

    # Load seva data from JSON file
    data_file = Path(__file__).parent.parent / "data" / "sevas.json"

    if not data_file.exists():
        print(f"Warning: Seva data file not found at {data_file}")
        return

    try:
        with open(data_file, 'r') as f:
            seva_data = json.load(f)
    except Exception as e:
        print(f"Error reading seva data file: {e}")
        return

    async with AsyncSessionLocal() as session:
        try:
            # Check if sevas table has any records
            result = await session.execute(select(func.count(Seva.id)))
            count = result.scalar()

            if count == 0:
                print("Seeding sevas table with master data...")
                # Create seva records
                sevas = [Seva(name=item["name"], amount=item["amount"]) for item in seva_data]
                session.add_all(sevas)
                await session.commit()
                print(f"Successfully seeded {len(seva_data)} sevas!")
            else:
                print(f"Sevas table already has {count} records. Skipping seeding.")
        except Exception as e:
            print(f"Error seeding sevas: {e}")
            await session.rollback()


async def init_db():
    """
    Initialize database: create database if not exists and create all tables.
    """
    from sqlalchemy.ext.asyncio import create_async_engine
    from sqlalchemy import text

    # Parse database URL to extract database name and connection info
    db_url = SQLALCHEMY_DATABASE_URL
    if "postgresql+asyncpg://" in db_url:
        # Extract database name from URL
        parts = db_url.split("/")
        db_name = parts[-1].split("?")[0]  # Get db name, remove query params if any

        # Create URL for postgres database (to check/create target database)
        base_url = "/".join(parts[:-1]) + "/postgres"

        try:
            # Connect to postgres database to check if target database exists
            temp_engine = create_async_engine(base_url, isolation_level="AUTOCOMMIT")

            async with temp_engine.connect() as conn:
                # Check if database exists
                result = await conn.execute(
                    text("SELECT 1 FROM pg_database WHERE datname = :db_name"),
                    {"db_name": db_name}
                )
                exists = result.scalar()

                if not exists:
                    # Create database if it doesn't exist
                    print(f"Database '{db_name}' does not exist. Creating...")
                    await conn.execute(text(f'CREATE DATABASE "{db_name}"'))
                    print(f"Database '{db_name}' created successfully!")
                else:
                    print(f"Database '{db_name}' already exists.")

            await temp_engine.dispose()

        except Exception as e:
            print(f"Error during database initialization: {e}")
            # Continue anyway - the database might already exist or will be created manually

    # Create all tables using the main engine
    try:
        async with engine.begin() as conn:
            # Import all models to ensure they're registered with Base
            from db_models import models  # noqa: F401

            # Create all tables
            await conn.run_sync(Base.metadata.create_all)
            print("All database tables created/verified successfully!")
    except Exception as e:
        print(f"Error creating tables: {e}")
        raise

    # Seed gotras and sevas data
    await seed_gotras()
    await seed_sevas()
