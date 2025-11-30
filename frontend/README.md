# HallBook - Frontend

A modern, feature-rich Next.js frontend for the Hall Booking Management System.

## Features

✨ **Hall Management**
- View all halls with details and facilities
- Create new halls with capacity and facilities management
- Edit existing hall information
- Delete halls (with safety checks)

📅 **Booking Management**
- Create new bookings with comprehensive details
- View all bookings with filtering options
- Filter bookings by status (Confirmed, Pending, Cancelled)
- Update booking status (Confirm, Cancel, Delete)
- Real-time booking conflict detection

📊 **Calendar Views**
- **Day View**: See all bookings for a specific day
- **Week View**: View bookings in a 7-day calendar
- **Month View**: Overview of all bookings in a month
- Easy navigation between dates

🎨 **Rich UI**
- Modern, clean interface with Tailwind CSS
- Responsive design for all devices
- Intuitive navigation with sidebar menu
- Status badges with visual indicators
- Loading states and error handling

## Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:8000`

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file with API configuration:
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Building for Production

Build the application:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## Project Structure

```
frontend/
├── pages/              # Next.js pages
│   ├── index.tsx      # Dashboard
│   ├── halls/         # Halls management
│   │   ├── index.tsx
│   │   ├── create.tsx
│   │   └── [id]/edit.tsx
│   ├── bookings/      # Bookings management
│   │   ├── index.tsx
│   │   └── create.tsx
│   └── calendar.tsx   # Calendar views
├── components/        # React components
│   ├── Layout.tsx     # Main layout with navigation
│   ├── HallForm.tsx   # Hall form for create/edit
│   └── BookingForm.tsx # Booking form
├── styles/           # Global styles
│   └── globals.css
├── api.ts           # API client service
├── types.ts         # TypeScript types
└── public/          # Static files
```

## API Integration

The frontend communicates with the FastAPI backend through the `api.ts` service:

### Halls API
- `GET /halls` - Get all halls
- `GET /halls/{id}` - Get specific hall
- `POST /halls` - Create hall
- `PUT /halls/{id}` - Update hall
- `DELETE /halls/{id}` - Delete hall

### Bookings API
- `GET /bookings` - Get all bookings (with filters)
- `GET /bookings/{id}` - Get specific booking
- `POST /bookings` - Create booking
- `PATCH /bookings/{id}` - Update booking status
- `DELETE /bookings/{id}` - Delete booking

### Calendar API
- `POST /calendar/day` - Get day view
- `POST /calendar/week` - Get week view
- `POST /calendar/month` - Get month view

## Technologies Used

- **Next.js 16** - React framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **date-fns** - Date manipulation
- **Lucide React** - Icon library

## Key Components

### Layout
Sidebar navigation with links to Dashboard, Halls, Bookings, and Calendar views.

### Dashboard
Quick overview with stats cards showing:
- Total halls
- Total bookings
- Confirmed bookings
- Pending bookings
- Recent bookings list

### Halls Management
- List view with card layout
- Create/Edit form with facilities management
- Delete functionality with confirmation

### Bookings Management
- Table view with comprehensive booking information
- Status filtering
- Quick status updates (Confirm, Cancel)
- Delete functionality

### Calendar
- Day, Week, and Month view options
- Visual representation of bookings
- Easy date navigation
- Booking details on hover

## Form Validation

All forms include client-side validation:
- Required field checks
- Phone number format validation (10-15 digits)
- Date range validation
- Time range validation
- Capacity validation (> 0)

## Error Handling

The application includes comprehensive error handling:
- API error messages displayed to users
- Loading states during async operations
- Confirmation dialogs for destructive actions
- Graceful fallbacks for missing data

## Contributing

When contributing to the frontend:
1. Maintain TypeScript strict mode
2. Follow the existing code structure
3. Use Tailwind CSS for styling
4. Add proper error handling
5. Test on different screen sizes

## License

ISC
