from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from routers import halls, hall_booking, calendar, gotras, sevas, seva_bookings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for application startup and shutdown.
    Automatically sets up database and creates tables if they don't exist.
    """
    # Startup
    print("Application starting up")

    # Initialize database and create tables
    try:
        from db_init.database import init_db
        await init_db()
    except Exception as e:
        print(f"Warning: Database initialization failed: {e}")
        print("Application will continue, but database operations may fail")

    yield

    # Shutdown: Add any cleanup logic here if needed
    print("Application shutting down")


# Initialize FastAPI application
app = FastAPI(
    title="Hall Booking Management API",
    description="Complete API for managing hall bookings with conflict prevention and calendar views",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(halls.router)
app.include_router(hall_booking.router)
app.include_router(calendar.router)
app.include_router(gotras.router)
app.include_router(sevas.router)
app.include_router(seva_bookings.router)


@app.get("/", status_code=status.HTTP_200_OK)
def read_root() -> dict:
    """
    Root endpoint providing API information.

    Returns:
        API welcome message and basic info
    """
    return {
        "message": "Welcome to Hall Booking Management API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }


@app.get("/health", status_code=status.HTTP_200_OK)
def health_check() -> dict:
    """
    Health check endpoint for monitoring.

    Returns:
        Health status of the application
    """
    return {
        "status": "healthy",
        "service": "hall-booking-api"
    }


# Global exception handler for unexpected errors
@app.exception_handler(Exception)
async def global_exception_handler(request, exc: Exception) -> JSONResponse:
    """
    Global exception handler for catching unexpected errors.

    Args:
        request: The request that caused the exception
        exc: The exception that was raised

    Returns:
        JSON response with error details
    """
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An unexpected error occurred",
            "error": str(exc)
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
