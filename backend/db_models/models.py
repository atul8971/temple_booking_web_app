from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, JSON, Date
from sqlalchemy.orm import relationship
from datetime import datetime, timezone, timedelta
import enum
from db_init.database import Base

# IST timezone (UTC+5:30)
IST = timezone(timedelta(hours=5, minutes=30))

def get_ist_now():
    """Get current datetime in IST timezone"""
    return datetime.now(IST)


class BookingStatus(str, enum.Enum):
    """Enum for booking status types"""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"


class Hall(Base):
    """Hall model for storing hall information"""
    __tablename__ = "halls"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False, index=True)
    capacity = Column(Integer, nullable=False)
    facilities = Column(JSON, nullable=True)  # Store as JSON array
    created_at = Column(DateTime(timezone=True), default=get_ist_now)
    updated_at = Column(DateTime(timezone=True), default=get_ist_now, onupdate=get_ist_now)

    # Relationship with bookings
    bookings = relationship("Booking", back_populates="hall", cascade="all, delete-orphan")


class Booking(Base):
    """Booking model for storing booking information"""
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    hall_id = Column(Integer, ForeignKey("halls.id"), nullable=False, index=True)
    customer_name = Column(String, nullable=False)
    customer_phone = Column(String, nullable=False)
    event_purpose = Column(String, nullable=True)
    booking_start_date = Column(Date, nullable=False, index=True)
    booking_end_date = Column(Date, nullable=False, index=True)
    start_time = Column(String, nullable=False)  # Format: "HH:MM"
    end_time = Column(String, nullable=False)    # Format: "HH:MM"
    status = Column(Enum(BookingStatus), default="confirmed", nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=get_ist_now)
    updated_at = Column(DateTime(timezone=True), default=get_ist_now, onupdate=get_ist_now)

    # Relationship with hall
    hall = relationship("Hall", back_populates="bookings")


class Gotra(Base):
    """Gotra master table for storing Hindu caste/lineage information"""
    __tablename__ = "gotras"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=get_ist_now)


class Seva(Base):
    """Seva master table for storing temple service/donation information"""
    __tablename__ = "sevas"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False, index=True)
    amount = Column(Float, nullable=True)  # Amount is nullable for sevas like "G K NIDHI", "MADHWA NAVAMI KANIKE"
    created_at = Column(DateTime(timezone=True), default=get_ist_now)


class SevaBookingStatus(str, enum.Enum):
    """Enum for seva booking status types"""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"


class SevaBooking(Base):
    """SevaBooking model for storing seva booking records"""
    __tablename__ = "seva_bookings"

    id = Column(Integer, primary_key=True, index=True)
    receipt_date = Column(Date, default=lambda: get_ist_now().date(), nullable=False)
    seva_id = Column(Integer, ForeignKey("sevas.id"), nullable=False, index=True)
    seva_date = Column(Date, nullable=False, index=True)
    name = Column(String, nullable=False)
    mobile_no = Column(String, nullable=False, index=True)
    gotra_id = Column(Integer, ForeignKey("gotras.id"), nullable=True, index=True)
    status = Column(Enum(SevaBookingStatus), default="confirmed", nullable=False, index=True)
    address = Column(String, nullable=True)
    remarks = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_ist_now)
    updated_at = Column(DateTime(timezone=True), default=get_ist_now, onupdate=get_ist_now)

    # Relationships
    seva = relationship("Seva")
    gotra = relationship("Gotra")
