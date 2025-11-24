# HR SARTHI Backend

Robust backend API for the HR SARTHI - Intelligent Human Resource Management System.

## 🚀 Features

- **Authentication & Authorization** - JWT-based auth with role-based access control
- **Employee Management** - Complete CRUD operations with search and filtering
- **Real-time Chat** - Socket.IO powered messaging system
- **Wellness Programs** - Goal tracking and progress monitoring
- **HR Helpdesk** - Ticket management and FAQ system
- **AI Features** - Intelligent recommendations and predictive analytics
- **File Upload** - Secure file handling with validation
- **Analytics** - Comprehensive reporting and insights

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.IO
- **File Upload**: Multer
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator

## 📦 Installation

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running on your system
   mongod
   ```

5. **Seed sample data**
   ```bash
   node utils/seedData.js
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

## 🔧 Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hr-sarthi
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Employees
- `GET /api/employees` - Get all employees (with search/filter)
- `GET /api/employees/:id` - Get employee by ID
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee
- `GET /api/employees/analytics/overview` - Employee analytics

### Chat
- `GET /api/chat` - Get user's chats
- `POST /api/chat` - Create new chat
- `GET /api/chat/:chatId/messages` - Get chat messages
- `POST /api/chat/:chatId/messages` - Send message
- `PUT /api/chat/:chatId/read` - Mark messages as read

### Helpdesk
- `GET /api/helpdesk/tickets` - Get tickets
- `POST /api/helpdesk/tickets` - Create ticket
- `GET /api/helpdesk/tickets/:id` - Get ticket by ID
- `PUT /api/helpdesk/tickets/:id` - Update ticket
- `POST /api/helpdesk/tickets/:id/comments` - Add comment
- `GET /api/helpdesk/faq` - Get FAQ items

### Wellness
- `GET /api/wellness/programs` - Get wellness programs
- `POST /api/wellness/programs` - Create program (HR/Admin)
- `POST /api/wellness/programs/:id/join` - Join program
- `PUT /api/wellness/programs/:id/progress` - Update progress
- `GET /api/wellness/goals` - Get user's goals
- `GET /api/wellness/analytics` - Wellness analytics

### AI Features
- `GET /api/ai/upskilling` - Get AI course recommendations
- `GET /api/ai/alerts` - Get early alert predictions (HR/Admin)
- `POST /api/ai/chanakya` - Chanakya wisdom chat
- `GET /api/ai/performance-prediction/:employeeId` - Performance prediction

### Analytics
- `GET /api/analytics/dashboard` - Dashboard overview
- `GET /api/analytics/performance` - Performance analytics (HR/Admin)
- `GET /api/analytics/workforce` - Workforce analytics (HR/Admin)
- `GET /api/analytics/engagement` - Engagement analytics (HR/Admin)
- `GET /api/analytics/productivity` - Productivity insights (HR/Admin)

### Settings
- `GET /api/settings/profile` - Get user profile
- `PUT /api/settings/profile` - Update profile
- `PUT /api/settings/password` - Change password
- `PUT /api/settings/notifications` - Update notification preferences
- `PUT /api/settings/appearance` - Update appearance settings
- `GET /api/settings/system` - Get system settings (Admin)
- `PUT /api/settings/system` - Update system settings (Admin)

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## 👥 User Roles

- **Admin**: Full system access
- **HR**: Employee management, analytics, helpdesk
- **Employee**: Personal data, chat, wellness programs

## 🔄 Real-time Features

Socket.IO events:
- `join-chat` - Join a chat room
- `send-message` - Send message to chat
- `new-message` - Receive new message
- `user-online` - User status updates

## 📊 Sample Data

Run the seed script to populate with sample data:
```bash
node utils/seedData.js
```

**Sample Login Credentials:**
- Admin: `admin@hrsarthi.com` / `admin123`
- HR: `hr@hrsarthi.com` / `hr123`
- Employee: `sarah.j@hrsarthi.com` / `password123`

## 🛡️ Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation and sanitization
- File upload restrictions

## 📈 Performance

- Database indexing for optimized queries
- Pagination for large datasets
- Compression middleware
- Efficient aggregation pipelines
- Connection pooling

## 🧪 Testing

```bash
npm test
```

## 🚀 Production Deployment

1. Set `NODE_ENV=production`
2. Use environment variables for sensitive data
3. Set up MongoDB Atlas or production database
4. Configure reverse proxy (nginx)
5. Use PM2 for process management
6. Set up SSL certificates

## 📝 API Documentation

Detailed API documentation available at `/api/docs` when server is running.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📞 Support

For technical support, create an issue in the repository or contact the development team.