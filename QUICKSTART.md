# HallBook - Quick Start Guide

Get the Hall Booking Management System up and running in 5 minutes! 🚀

## Prerequisites Check

Before you start, ensure you have:
- Python 3.9+ installed
- Node.js 18+ installed
- npm installed

Check your versions:
```bash
python --version
node --version
npm --version
```

## 🔧 Step 1: Backend Setup (2 minutes)

### 1.1 Navigate to backend directory
```bash
cd backend
```

### 1.2 Create virtual environment
```bash
# macOS/Linux
python -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

### 1.3 Install dependencies
```bash
pip install -r requirements.txt
```

### 1.4 Start the backend
```bash
python main.py
```

✅ Backend is running at `http://localhost:8000`

**Keep this terminal open!** Open a new terminal for the frontend.

## 🎨 Step 2: Frontend Setup (2 minutes)

### 2.1 Navigate to frontend directory
```bash
cd frontend
```

### 2.2 Install dependencies
```bash
npm install
```

### 2.3 Create environment file
Create a file called `.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### 2.4 Start the frontend
```bash
npm run dev
```

✅ Frontend is running at `http://localhost:3000`

## 🎉 Step 3: Access the Application

Open your browser and visit:
**http://localhost:3000**

You should see the HallBook Dashboard!

## ✨ Quick Features to Try

1. **Create a Hall** (Takes 1 minute)
   - Click "Add New Hall" on dashboard
   - Enter: Name, Capacity, Facilities (optional)
   - Click "Create Hall"

2. **Make a Booking** (Takes 2 minutes)
   - Click "New Booking"
   - Select a hall
   - Enter customer details
   - Set dates and times
   - Click "Create Booking"

3. **View Calendar** (Takes 1 minute)
   - Click "Calendar" in sidebar
   - Switch between Day/Week/Month views
   - Navigate using Previous/Next buttons

4. **Manage Bookings** (Takes 1 minute)
   - Click "Bookings" to see all
   - Use Filter to narrow down
   - Confirm, Cancel, or Delete bookings

## 🧪 Test the API

The backend provides interactive API documentation:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

Try some API calls directly in the Swagger UI!

## 🛑 Stopping the Application

- **Backend**: Press `Ctrl+C` in backend terminal
- **Frontend**: Press `Ctrl+C` in frontend terminal

## 📖 Next Steps

1. **Explore the features** - Try all the different views and operations
2. **Read the detailed docs**:
   - Backend: `backend/README.md`
   - Frontend: `frontend/README.md`
   - Full setup: `SETUP.md`
   - Feature guide: `frontend/FEATURES.md`

3. **Make changes**:
   - Edit backend files and restart server
   - Edit frontend files and it auto-reloads

## 🐛 Troubleshooting

### "Connection refused" error?
- Make sure backend is running on port 8000
- Check that `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000` is in `.env.local`

### "Port already in use"?
```bash
# Backend (change port in main.py)
# Or stop the process using port 8000

# Frontend on different port
npm run dev -- -p 3001
```

### "Module not found" errors?
```bash
# Backend
pip install -r requirements.txt

# Frontend
rm -rf node_modules package-lock.json
npm install
```

### Database errors?
- Backend will create database automatically on first run
- If issues persist, delete `.db` file and restart

## 💡 Tips

- **Browser DevTools**: Open F12 to see network requests and logs
- **Backend Docs**: Visit http://localhost:8000/docs for full API
- **Hot Reload**: Frontend auto-reloads on file changes
- **Debug Mode**: Check console for detailed error messages

## 📱 Mobile Testing

The application is fully responsive:
- Open frontend on mobile device using your computer's IP
- Or use browser DevTools device emulation (F12 → Toggle device toolbar)

## 🎓 Learning Resources

### Understanding the Flow

1. **Dashboard** → Overview of halls and bookings
2. **Halls** → Manage your available venues
3. **Bookings** → Track customer reservations
4. **Calendar** → Visual booking schedule

### API Flow

```
User Action (Frontend)
    ↓
API Request (Next.js)
    ↓
Backend Processing (FastAPI)
    ↓
Database Update (SQLite)
    ↓
Response Back to User
```

## 🚀 Production Ready?

To prepare for production:

1. **Backend**:
   - Set up PostgreSQL/MySQL instead of SQLite
   - Enable authentication
   - Configure proper CORS
   - Use production server (Gunicorn)

2. **Frontend**:
   - Build: `npm run build`
   - Deploy to Vercel, Netlify, etc.
   - Update `NEXT_PUBLIC_API_BASE_URL` for production

See `SETUP.md` for detailed production setup.

## 📞 Need Help?

1. Check the README files
2. Look at the code comments
3. Try the interactive API docs
4. Check browser console for errors

## 🎯 What's Next?

- Customize the styling in `frontend/styles/globals.css`
- Add more features in backend routers
- Extend the database schema
- Add user authentication
- Deploy to cloud

---

**Congratulations! You're all set! 🎉**

Enjoy managing your hall bookings!
