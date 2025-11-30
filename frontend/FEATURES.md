# HallBook Frontend - Features Guide

## 🏠 Dashboard
The main landing page with quick overview and statistics.

### Features:
- **Statistics Cards**: Display total halls, bookings, confirmed, and pending counts
- **Recent Bookings**: Shows the 5 most recent bookings
- **Quick Actions**: One-click access to frequently used features
- **Real-time Updates**: All stats updated on page load

### Access:
- Navigate to `/` or click "Dashboard" in sidebar

---

## 🏛️ Halls Management

### List All Halls (`/halls`)
View all halls in a beautiful card-based layout with:
- Hall name and capacity
- Available facilities (as badges)
- Creation date
- Edit and Delete buttons

### Create Hall (`/halls/create`)
Form to add a new hall with:
- **Hall Name**: Text input (1-200 chars, must be unique)
- **Capacity**: Number input (must be > 0)
- **Facilities**: Add/remove facilities dynamically
  - Type facility name and press Enter or click Add
  - Remove with X button
  - Visual feedback with colored badges

### Edit Hall (`/halls/[id]/edit`)
Update existing hall information:
- Pre-fills all current hall data
- Modify any field
- Manage facilities
- Validation on save

### Delete Hall
- Confirmation dialog to prevent accidental deletion
- Cannot delete halls with existing bookings
- Error message if deletion fails

---

## 📅 Bookings Management

### List All Bookings (`/bookings`)
Comprehensive table view showing:
- Customer name and phone
- Hall name
- Event purpose
- Booking dates and times
- Current status (with visual icons and badges)
- Action buttons

#### Status Filtering
Filter bookings by status:
- **All Bookings**: Default view
- **Confirmed**: Successfully confirmed bookings
- **Pending**: Awaiting confirmation
- **Cancelled**: Cancelled bookings

#### Status Management
From the bookings list:
- **Confirm**: Change pending → confirmed
- **Cancel**: Cancel any non-cancelled booking
- **Delete**: Remove pending/cancelled bookings only
  - Cannot delete confirmed bookings (must cancel first)

### Create Booking (`/bookings/create`)
Form with comprehensive validation:
- **Hall Selection**: Dropdown with capacity info
- **Customer Name**: Text input
- **Customer Phone**: Validates 10-15 digits
- **Event Purpose**: Optional description
- **Booking Dates**: Select start and end dates
  - Cannot be in the past
  - End date must be ≥ start date
- **Time Range**: Select start and end times
  - End time must be after start time
  - Formatted as HH:MM

#### Features:
- **Conflict Detection**: API validates no overlapping bookings
- **Client-side Validation**: Immediate feedback before submission
- **Error Handling**: Clear error messages for conflicts
- **Success Navigation**: Redirects to bookings list on success

---

## 📊 Calendar Views

Access at `/calendar` with three viewing modes:

### Month View (Default)
- **Layout**: Full calendar grid for the month
- **Display**: Hall names for each booking day
- **Hover**: Shows booking count if multiple bookings
- **Navigation**: Previous/Next buttons for months

#### Features:
- Current month highlighted
- Other month days grayed out
- Clickable navigation
- Today button for quick return

### Week View
- **Layout**: 7-column grid (Sun-Sat)
- **Display**: All bookings for each day
- **Details**: Shows time and hall name
- **Interaction**: Easy to scan the week

#### Features:
- Shows full week with dates
- Time ranges for each booking
- Visual separation by day
- Easy date navigation

### Day View
- **Layout**: Detailed list for single day
- **Display**: All bookings with full details
  - Hall name
  - Customer name
  - Time range
  - Event purpose
  - Status badge
- **Formatting**: Color-coded by status

#### Navigation Features:
All views support:
- **Previous/Next**: Move between periods
- **Today Button**: Jump to current date
- **View Toggle**: Switch between day/week/month without losing date context

---

## 🎨 UI Components & Design

### Color Scheme
- **Primary**: Blue (Actions, selected items)
- **Success**: Green (Confirmed status)
- **Warning**: Yellow (Pending status)
- **Danger**: Red (Cancelled/Delete)
- **Neutral**: Gray (Backgrounds, disabled)

### Responsive Design
- Mobile-first approach
- Breakpoints:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px

### Accessibility
- Semantic HTML
- Proper heading hierarchy
- ARIA labels where needed
- Keyboard navigable
- High contrast text

---

## 🔔 Status Indicators

### Booking Status Badges
- **Confirmed** ✓: Green background with checkmark
- **Pending** ⏱: Yellow background with clock
- **Cancelled** ✗: Red background with X

### Visual Feedback
- Loading spinners during async operations
- Disabled buttons during loading
- Success/error messages
- Confirmation dialogs for destructive actions

---

## 📋 Forms & Validation

### Client-side Validation
All forms validate before submission:
- Required fields
- Format validation (phone, time, date)
- Range validation (capacity, phone length)
- Business logic validation (date ranges, time ranges)

### Server-side Validation
Backend validation includes:
- Booking conflict detection
- Date/time format validation
- Hall existence checks
- Status transition rules

### Error Handling
- Clear error messages displayed
- API error details shown to user
- Graceful fallbacks
- No data loss on error

---

## 🔐 Data Safety

### Confirmation Dialogs
- Hall deletion requires confirmation
- Booking deletion requires confirmation
- Prevents accidental data loss

### Status Transitions
- Cannot modify cancelled bookings
- Can only cancel non-cancelled bookings
- Can only delete pending/cancelled bookings
- Controlled state changes

### Validation
- Phone number format validation
- Date range validation
- Time range validation
- Capacity validation (> 0)
- Unique hall name enforcement

---

## ⌨️ Keyboard Shortcuts

### Forms
- **Enter**: Add facility / Submit form
- **Escape**: Cancel form

### Navigation
- **Sidebar**: Click any menu item to navigate
- **Breadcrumbs**: Available on detail pages

---

## 📱 Mobile Friendly

### Responsive Layout
- Sidebar becomes collapsible on mobile
- Tables scroll horizontally on small screens
- Grid layouts adapt to screen size
- Touch-friendly button sizes

### Mobile Optimizations
- Simplified forms
- Touch-optimized controls
- Readable font sizes
- Proper spacing for touch targets

---

## 🎯 Key Workflows

### Create a Booking
1. Navigate to Bookings → New Booking
2. Select hall from dropdown
3. Enter customer details
4. Set booking date range
5. Set time range
6. Add event purpose (optional)
7. Click Create Booking
8. Redirected to bookings list on success

### Manage Hall
1. Navigate to Halls
2. View all halls in cards
3. Click Edit to modify
4. Click Delete for removal
5. Confirm deletion
6. Return to halls list

### View Calendar
1. Navigate to Calendar
2. Choose view: Day/Week/Month
3. Use Previous/Next to navigate
4. Click Today to return to current
5. View all bookings for period

---

## 🚀 Performance Features

- **Pagination**: List views support pagination (default 100 items)
- **Lazy Loading**: Calendar data fetched on demand
- **Client-side Caching**: Recent data reused when possible
- **Optimized Renders**: React hooks prevent unnecessary re-renders

---

## 🐛 Error Recovery

- **Connection Errors**: Retry capability with error message
- **Validation Errors**: Form remains populated for correction
- **Server Errors**: User-friendly error messages
- **Conflict Detection**: Clear message on booking conflicts

---

## 📈 Future Enhancement Ideas

- User authentication & authorization
- Multi-language support
- Advanced filtering & search
- Booking notifications
- Payment integration
- Analytics dashboard
- Export reports (PDF/Excel)
- Bulk operations
- Email confirmations
- SMS reminders

---

For more details, see the main README.md file.
