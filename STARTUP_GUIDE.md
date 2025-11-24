# HR SARTHI - Quick Startup Guide

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (running on localhost:27017)
- Git

## Quick Start (Automated)

### Option 1: Use the startup scripts
1. **Start Backend**: Double-click `start-backend.bat`
2. **Start Frontend**: Double-click `start-frontend.bat` (in a new terminal)

### Option 2: Manual setup

#### 1. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

#### 2. Start MongoDB
Make sure MongoDB is running on your system:
- Windows: Start MongoDB service or run `mongod`
- Mac: `brew services start mongodb-community`
- Linux: `sudo systemctl start mongod`

#### 3. Seed Database
```bash
cd backend
node utils/seedData.js
cd ..
```

#### 4. Start Backend Server
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

#### 5. Start Frontend (in new terminal)
```bash
npm run dev
# App runs on http://localhost:5173
```

## Demo Login Credentials

After seeding the database, use these credentials:

- **Admin**: `admin@hrsarthi.com` / `admin123`
- **HR Manager**: `hr@hrsarthi.com` / `hr123`
- **Employee**: `sarah.j@hrsarthi.com` / `password123`

## Troubleshooting

### Backend Connection Issues
- **Error**: `ERR_CONNECTION_REFUSED`
- **Solution**: Make sure the backend server is running on port 5000

### MongoDB Connection Issues
- **Error**: `MongoDB connection error`
- **Solution**: Ensure MongoDB is running and accessible at `mongodb://localhost:27017/hr-sarthi`

### Port Already in Use
- **Error**: `Port 5000 is already in use`
- **Solution**: Kill the process using port 5000 or change the port in `.env`

### Missing Dependencies
- **Error**: Module not found errors
- **Solution**: Run `npm install` in both root and backend directories

## Environment Configuration

The backend uses these environment variables (already configured in `.env`):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hr-sarthi
JWT_SECRET=9ccd831dfe5ff37b20147743e1586ee1
JWT_EXPIRE=7d
NODE_ENV=development
```

## Features Available

✅ **Authentication & Authorization**
✅ **Employee Management**
✅ **Real-time Chat System**
✅ **HR Helpdesk**
✅ **Wellness Programs**
✅ **AI-Powered Features**
✅ **Analytics & Reporting**
✅ **Settings & Configuration**

## API Endpoints

- Backend API: `http://localhost:5000/api`
- Health Check: `http://localhost:5000/api/health`
- Frontend: `http://localhost:5173`

## Next Steps

1. Start both servers using the provided scripts
2. Open `http://localhost:5173` in your browser
3. Login with the demo credentials
4. Explore the HR SARTHI features!

---

**Need Help?** Check the main README.md for detailed documentation.