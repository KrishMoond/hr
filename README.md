# HR SARTHI - Intelligent Human Resource Management System

A comprehensive, AI-powered HR dashboard built with React, TypeScript, Node.js, and MongoDB. HR SARTHI combines traditional HR management with cutting-edge features like AI upskilling, predictive analytics, and ancient wisdom guidance.

## 🚀 Features

### Core HR Management
- **Dashboard** - Interactive overview with real-time metrics and dual-series charts
- **Employee Management** - Complete employee profiles, search, and analytics
- **Power BI Analytics** - Advanced workforce insights and predictive analytics
- **Wellness Programs** - Health tracking and wellness initiatives
- **Settings** - Comprehensive system configuration

### AI-Powered Features
- **AI Upskilling** - Personalized learning recommendations based on role and trends
- **Early Alerts** - Predictive system to prevent employee issues before they occur
- **Smart Analytics** - Machine learning insights for workforce optimization

### Engagement & Communication
- **My Journey** - Visual career path tracking with achievements and milestones
- **Leaderboard** - Gamified performance system with rewards and recognition
- **Team Chat** - Real-time messaging with file sharing and status indicators
- **Chanakya Chat** - Unique motivational guidance using ancient wisdom
- **Task Updates** - Smart project notifications and deadline management
- **HR Helpdesk** - FAQ system, live chat, and ticket management

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Chart.js, React Chart.js 2
- **Icons**: Lucide React
- **State Management**: React Hooks
- **Build Tool**: Vite
- **Real-time**: Socket.IO Client

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.IO
- **File Upload**: Multer
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator

## 📦 Quick Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Git

### Automated Setup (Windows)
```bash
# Clone the repository
git clone <repository-url>
cd project

# Run automated setup
setup.bat
```

### Manual Setup

1. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Configure Environment**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your MongoDB URI and other settings
   ```

4. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running
   mongod
   ```

5. **Seed Sample Data**
   ```bash
   cd backend
   node utils/seedData.js
   ```

6. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   # Server runs on http://localhost:5000
   ```

7. **Start Frontend Development Server**
   ```bash
   # In project root
   npm run dev
   # App runs on http://localhost:5173
   ```

## 🔐 Demo Login Credentials

After seeding the database, use these credentials:

- **Admin**: `admin@hrsarthi.com` / `admin123`
- **HR Manager**: `hr@hrsarthi.com` / `hr123`
- **Employee**: `sarah.j@hrsarthi.com` / `password123`

## 🎯 Key Features Implemented

### ✅ Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin, HR, Employee)
- Secure password hashing
- Session management

### ✅ Employee Management
- Complete CRUD operations
- Advanced search and filtering
- Performance tracking
- Skills management
- Department analytics

### ✅ Real-time Chat System
- Individual and group chats
- File sharing capabilities
- Message read receipts
- Online status indicators
- Socket.IO powered real-time updates

### ✅ HR Helpdesk
- Ticket management system
- FAQ database
- Comment system
- Priority and status tracking
- Category-based organization

### ✅ Wellness Programs
- Program creation and management
- Goal tracking and progress monitoring
- User enrollment system
- Analytics and reporting

### ✅ AI-Powered Features
- Intelligent course recommendations
- Early alert system for employee issues
- Chanakya wisdom chat bot
- Performance predictions
- Risk factor analysis

### ✅ Analytics & Reporting
- Dashboard overview with real-time metrics
- Performance analytics
- Workforce insights
- Engagement tracking
- Productivity measurements

### ✅ Settings & Configuration
- User profile management
- Notification preferences
- Appearance settings
- System configuration (Admin)
- Password management

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Employees
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get employee by ID
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Chat
- `GET /api/chat` - Get user's chats
- `POST /api/chat` - Create new chat
- `POST /api/chat/:chatId/messages` - Send message

### Helpdesk
- `GET /api/helpdesk/tickets` - Get tickets
- `POST /api/helpdesk/tickets` - Create ticket
- `GET /api/helpdesk/faq` - Get FAQ items

### Wellness
- `GET /api/wellness/programs` - Get programs
- `POST /api/wellness/programs` - Create program
- `POST /api/wellness/programs/:id/join` - Join program

### AI Features
- `GET /api/ai/upskilling` - Get recommendations
- `GET /api/ai/alerts` - Get early alerts
- `POST /api/ai/chanakya` - Chat with Chanakya

## 🔄 Real-time Features

- **Live Chat**: Instant messaging with Socket.IO
- **Status Updates**: Real-time user online/offline status
- **Notifications**: Live system notifications
- **Dashboard Updates**: Real-time metrics refresh

## 🛡️ Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet security headers
- Input validation and sanitization
- File upload restrictions
- Role-based access control

## 📱 Responsive Design

- **Desktop**: Full-featured dashboard experience
- **Tablet**: Optimized layout for medium screens
- **Mobile**: Touch-friendly interface for smartphones

## 🚀 Production Deployment

### Backend Deployment
1. Set environment variables
2. Use MongoDB Atlas for database
3. Deploy to services like Heroku, AWS, or DigitalOcean
4. Configure reverse proxy (nginx)
5. Set up SSL certificates

### Frontend Deployment
1. Build production bundle: `npm run build`
2. Deploy to Netlify, Vercel, or AWS S3
3. Configure environment variables
4. Set up custom domain

## 📈 Performance Optimizations

- Database indexing for faster queries
- Pagination for large datasets
- Image optimization and compression
- Lazy loading for components
- Efficient API caching
- Connection pooling

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Use the built-in HR Helpdesk feature
- Contact the development team

## 🎯 Future Enhancements

- **Mobile App** - Native iOS/Android applications
- **Advanced AI** - Machine learning model integration
- **API Integration** - Connect with existing HR systems
- **Multi-language** - Support for multiple languages
- **Advanced Reporting** - Custom report generation
- **Video Calling** - Integrated video conferencing
- **Calendar Integration** - Meeting and event management

---

**HR SARTHI** - Transforming Human Resource Management with Intelligence and Wisdom 🎯

Built with ❤️ using React, Node.js, and MongoDB