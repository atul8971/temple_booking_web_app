# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FastAPI-based hall booking management system with PostgreSQL backend, featuring booking conflict prevention, calendar views, and async database operations. Uses Alembic for database migrations and Pydantic for data validation.

## Development Commands

### Running the Application
```bash
# Start development server (preferred)
python main.py

# Alternative using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Database Migrations (Alembic)
```bash
# Apply migrations to database
alembic upgrade head

# Create new migration after modifying models.py
alembic revision --autogenerate -m "Description of changes"

# Rollback one migration
alembic downgrade -1

# View migration history
alembic history

# Check current migration version
alembic current
```

### Database Setup
```bash
# Using Docker Compose (recommended for development)
docker-compose up -d

# Stop database
docker-compose down
```

### Python Environment
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt
```

## Architecture

### Core Design Patterns

**Async Database Operations**: Uses SQLAlchemy async with asyncpg driver. All database operations are async/await. Session management via `get_db()` dependency injection.

**Router-Based API Structure**: API endpoints organized by domain into routers (halls, bookings, calendar). Each router is included in main.py and prefixed with its domain path.

**Schema Validation**: Pydantic schemas in schemas.py provide request/response validation with custom validators (time range checks, email validation, field constraints).

**Conflict Detection**: Booking conflicts detected via time overlap algorithm in routers/bookings.py:13-42. Checks existing non-cancelled bookings for same hall/date before creating new bookings.

### Key Files and Responsibilities

- `main.py`: FastAPI app initialization, CORS middleware, router registration, global exception handling
- `models.py`: SQLAlchemy ORM models (Hall, Booking, BookingStatus enum)
- `schemas.py`: Pydantic validation schemas for requests/responses
- `database.py`: Async database engine setup, session management, `get_db()` dependency
- `routers/halls.py`: Hall CRUD endpoints
- `routers/bookings.py`: Booking CRUD with conflict detection and price calculation
- `routers/calendar.py`: Calendar view endpoints (day, week, month)
- `alembic/`: Database migration files and configuration

### Database Models

**Hall**: Stores venue information with pricing (base_price + price_per_hour), available hours (HH:MM format), facilities (JSON array), and capacity. Has one-to-many relationship with Booking.

**Booking**: Stores reservation details with customer info, event details, booking date/time, status (pending/confirmed/cancelled), and calculated total_price. Foreign key to Hall with cascade delete.

### Important Business Logic

**Price Calculation** (routers/bookings.py:99-122):
```
total_price = base_price + (price_per_hour × duration_in_hours)
```

**Time Overlap Detection** (routers/bookings.py:13-42): Converts HH:MM to minutes for comparison. Returns true if `start1 < end2 AND start2 < end1`.

**Booking Status Workflow**:
- PENDING → CONFIRMED (allowed)
- PENDING → CANCELLED (allowed)
- CONFIRMED → CANCELLED (allowed)
- CANCELLED → * (not allowed, raises 400)
- CONFIRMED → PENDING (not allowed, raises 400)

**Validation Rules**:
- Booking dates cannot be in the past
- Booking times must fall within hall's available_from/available_to hours
- End time must be after start time for all time ranges
- Cancelled bookings excluded from conflict detection
- Confirmed bookings cannot be deleted (must cancel first)

## Environment Configuration

Create `.env` file with:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hall_booking
```

Database URL is automatically converted from `postgresql://` to `postgresql+asyncpg://` in database.py for async operations.

## Data Formats

- **Dates**: ISO 8601 format (YYYY-MM-DD)
- **Times**: 24-hour format (HH:MM) stored as strings
- **Datetime**: SQLAlchemy DateTime stored as UTC via `datetime.utcnow`
- **Facilities**: JSON array stored in PostgreSQL

## Testing & Documentation

- Interactive API docs: http://localhost:8000/docs (Swagger UI)
- Alternative docs: http://localhost:8000/redoc
- Health check: http://localhost:8000/health

## Critical Development Rules

1. **Never use `Base.metadata.create_all()`** - always use Alembic migrations for schema changes
2. **All database operations must be async** - use `await` with database queries
3. **Session management** - always use `get_db()` dependency, never create sessions manually
4. **Time format validation** - enforce HH:MM format with regex in Pydantic schemas
5. **Conflict checking** - always check for booking conflicts before creating/updating bookings
6. **Status transitions** - validate booking status changes per workflow rules
7. **Price calculation** - automatically calculate total_price on booking creation, do not accept from client
8. All backend code should be added to backend folder
