# Hall Booking Management System - Complete Setup Guide

A full-stack application for managing hall bookings with a FastAPI backend and Next.js frontend.

## 📋 Overview

This is a complete hall booking management system with the following features:

### Backend (FastAPI)
- REST API for halls and bookings management
- Conflict detection for overlapping bookings
- Calendar views (day, week, month)
- SQLAlchemy ORM with async support
- CORS enabled for frontend integration

### Frontend (Next.js)
- Modern, responsive UI
- Hall management (CRUD operations)
- Booking management with status tracking
- Interactive calendar views
- Real-time error handling and validation

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- pip (Python package manager)
- npm (Node package manager)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the backend server:**
   ```bash
   python main.py
   ```

   The backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env.local` file:**
   ```bash
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:3000`

## 📁 Project Structure

```
booking_app/
├── backend/
│   ├── routers/
│   │   ├── halls.py           # Halls API endpoints
│   │   ├── bookings.py        # Bookings API endpoints
│   │   └── calendar.py        # Calendar API endpoints
│   ├── db_models/
│   │   └── models.py          # Database models
│   ├── db_init/
│   │   └── database.py        # Database configuration
│   ├── api_schema/
│   │   └── schemas.py         # Pydantic schemas
│   ├── main.py                # FastAPI application
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── pages/
│   │   ├── index.tsx          # Dashboard
│   │   ├── halls/             # Hall management pages
│   │   ├── bookings/          # Booking management pages
│   │   └── calendar.tsx       # Calendar views
│   ├── components/
│   │   ├── Layout.tsx         # Main layout with navigation
│   │   ├── HallForm.tsx       # Hall form component
│   │   └── BookingForm.tsx    # Booking form component
│   ├── styles/
│   │   └── globals.css        # Global styles
│   ├── api.ts                 # API client
│   ├── types.ts               # TypeScript types
│   ├── package.json
│   └── README.md
└── SETUP.md                   # This file

```

## 🔌 API Endpoints

### Halls
- `GET /halls` - Get all halls (with pagination)
- `GET /halls/{hall_id}` - Get specific hall
- `POST /halls` - Create new hall
- `PUT /halls/{hall_id}` - Update hall
- `DELETE /halls/{hall_id}` - Delete hall

### Bookings
- `GET /bookings` - Get all bookings (with filters for status and hall)
- `GET /bookings/{booking_id}` - Get specific booking
- `POST /bookings` - Create new booking
- `PATCH /bookings/{booking_id}` - Update booking status
- `DELETE /bookings/{booking_id}` - Delete booking

### Calendar
- `POST /calendar/day` - Get bookings for a specific day
- `POST /calendar/week` - Get bookings for a week
- `POST /calendar/month` - Get bookings for a month

## 🎯 Main Features

### Hall Management
- ✅ View all halls with capacity and facilities
- ✅ Create new halls with custom facilities
- ✅ Edit hall information
- ✅ Delete halls (with validation to prevent deletion if bookings exist)
- ✅ Facility management (add/remove)

### Booking Management
- ✅ Create bookings with automatic conflict detection
- ✅ View all bookings with details
- ✅ Filter bookings by status (Confirmed, Pending, Cancelled)
- ✅ Update booking status
- ✅ Delete bookings (only if not confirmed)
- ✅ Customer information tracking (name, phone)
- ✅ Event purpose tracking

### Calendar Views
- ✅ **Day View** - See all bookings for a specific day
- ✅ **Week View** - 7-day calendar with booking overview
- ✅ **Month View** - Monthly calendar with booking indicators
- ✅ Easy date navigation
- ✅ Booking status indicators

### Dashboard
- ✅ Quick statistics (total halls, bookings, confirmed, pending)
- ✅ Recent bookings display
- ✅ Quick action buttons
- ✅ Visual indicators for booking statuses

## 🔒 Data Validation

### Hall Creation/Update
- Hall name: 1-200 characters, unique
- Capacity: Greater than 0
- Facilities: Optional array of strings

### Booking Creation
- Hall must exist
- Customer name: 1-200 characters
- Customer phone: 10-15 digits
- Event purpose: Optional, max 500 characters
- Booking dates: Cannot be in the past
- Time range: End time must be after start time
- Date range: End date must be on or after start date
- Conflict detection: No overlapping bookings for same hall/time

### Booking Status Transitions
- PENDING → CONFIRMED ✅
- PENDING → CANCELLED ✅
- CONFIRMED → CANCELLED ✅
- CANCELLED: No further changes allowed

## 🛠️ Development

### Adding New Features

1. **Backend Changes:**
   - Add database models in `db_models/models.py`
   - Create API schemas in `api_schema/schemas.py`
   - Add routes in `routers/`
   - Include in `main.py`

2. **Frontend Changes:**
   - Add types in `types.ts`
   - Add API methods in `api.ts`
   - Create components in `components/`
   - Create pages in `pages/`

### Testing the API

Backend API documentation available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
npm start
```

**Backend:**
```bash
cd backend
# Use a production server like Gunicorn
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
```

## 🔧 Configuration

### Environment Variables

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

**Backend:**
- Database: SQLite (configurable in `db_init/database.py`)
- CORS: Configured for all origins (update in `main.py` for production)

## 📊 Database Schema

### Halls Table
- id (Integer, Primary Key)
- name (String, Unique, Indexed)
- capacity (Integer)
- facilities (JSON)
- created_at (DateTime)
- updated_at (DateTime)

### Bookings Table
- id (Integer, Primary Key)
- hall_id (Integer, Foreign Key)
- customer_name (String)
- customer_phone (String)
- event_purpose (String, Optional)
- booking_start_date (DateTime, Indexed)
- booking_end_date (DateTime, Indexed)
- start_time (String, HH:MM format)
- end_time (String, HH:MM format)
- status (Enum: pending, confirmed, cancelled)
- created_at (DateTime)
- updated_at (DateTime)

## 🐛 Troubleshooting

### Frontend can't connect to backend
- Ensure backend is running on `http://localhost:8000`
- Check `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
- Verify CORS is enabled in backend

### Database errors
- Check database file exists in backend directory
- Ensure write permissions in project directory
- Clear database and reinitialize if needed

### Port already in use
- Backend: Change port in `main.py`
- Frontend: Use `npm run dev -- -p 3001`

## 📝 API Usage Examples

### Create a Hall
```bash
curl -X POST http://localhost:8000/halls \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Grand Ballroom",
    "capacity": 500,
    "facilities": ["AC", "WiFi", "Projector", "Sound System"]
  }'
```

### Create a Booking
```bash
curl -X POST http://localhost:8000/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "hall_id": 1,
    "customer_name": "John Doe",
    "customer_phone": "9876543210",
    "event_purpose": "Wedding Reception",
    "booking_start_date": "2024-12-25",
    "booking_end_date": "2024-12-25",
    "start_time": "18:00",
    "end_time": "23:00"
  }'
```

### Get Calendar Data
```bash
curl -X POST http://localhost:8000/calendar/month \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2024,
    "month": 12
  }'
```

## 📄 License

ISC

## 🤝 Support

For issues or questions:
1. Check the README files in backend and frontend directories
2. Review API documentation at `/docs` endpoint
3. Check console logs for error details

---

**Happy Booking! 🎉**
