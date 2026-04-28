# Amount Manager - Backend API

A robust Node.js/Express backend API for the Amount Manager project management system. Built with Sequelize ORM, MySQL database, and advanced features like authentication, role-based access control, file uploads, and automated payment reminders.

## 🎯 Project Overview

Amount Manager is a comprehensive project management and staff management system that allows organizations to:
- Manage projects and stages
- Handle staff and customer information
- Process and track payments
- Control user permissions and roles
- Upload and manage project documents
- Receive automated payment reminders via email

## 📋 Prerequisites

- **Node.js**: v14+ (v16+ recommended)
- **MySQL**: v5.7+
- **npm**: v6+

## 🚀 Quick Start

### 1. Installation

```bash
cd Backend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the Backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=amount_manager
DB_DIALECT=mysql

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Email Configuration (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM_EMAIL=your_email@gmail.com

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

### 3. Database Setup

Create MySQL database:

```sql
CREATE DATABASE amount_manager;
```

Run seeders to initialize roles:

```bash
npm run seed
```

### 4. Start Development Server

```bash
npm run dev
```

Server will start on `http://localhost:5000`

## 📁 Project Structure

```
Backend/
├── config/
│   └── db.js                 # Database configuration & connection
├── controllers/
│   ├── authControllers.js    # Authentication logic
│   ├── customerController.js # Customer management
│   ├── paymentController.js  # Payment processing
│   ├── projectController.js  # Project management
│   ├── staffController.js    # Staff management
│   ├── stageController.js    # Stage management
│   └── permissionController.js # Permission/role management
├── middleware/
│   ├── protect.js            # JWT authentication middleware
│   └── upload.js             # File upload handling
├── models/
│   ├── User.js               # User model
│   ├── Staff.js              # Staff model
│   ├── Project.js            # Project model
│   ├── Stage.js              # Stage model
│   ├── Payment.js            # Payment model
│   ├── Customer.js           # Customer model
│   ├── RolePermission.js     # Role/Permission model
│   └── index.js              # Model exports
├── routes/
│   ├── authRoutes.js         # Authentication endpoints
│   ├── customerRoutes.js     # Customer endpoints
│   ├── paymentRoutes.js      # Payment endpoints
│   ├── projectRoutes.js      # Project endpoints
│   ├── staffRoutes.js        # Staff endpoints
│   ├── stageRoutes.js        # Stage endpoints
│   └── permissionRoutes.js   # Permission endpoints
├── seeders/
│   └── roleSeeders.js        # Initial role data
├── uploads/                  # File storage directory
├── server.js                 # Express server entry point
└── package.json
```

## 🔑 Key Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- User login/signup with encrypted passwords
- Protected routes middleware

### Project Management
- Create, read, update, delete projects
- Organize projects into stages
- Assign staff to projects
- Track project progress

### Staff Management
- Manage staff profiles
- Assign roles and permissions
- Track staff activities
- Department organization

### Payment Processing
- Record and track payments
- Automated payment reminders via email
- Scheduled cron jobs for notifications
- Payment history and reporting

### File Management
- Secure file upload handling
- Project document storage
- File size validation
- Organized upload directories

### Customer Management
- Maintain customer database
- Customer-project associations
- Contact information management

## 🔗 API Endpoints

### Authentication
```
POST   /api/auth/signup              # User registration
POST   /api/auth/login               # User login
POST   /api/auth/logout              # User logout
POST   /api/auth/forgot-password     # Password reset request
```

### Projects
```
GET    /api/projects                 # Get all projects
GET    /api/projects/:id             # Get project details
POST   /api/projects                 # Create new project
PATCH  /api/projects/:id             # Update project
DELETE /api/projects/:id             # Delete project
```

### Staff
```
GET    /api/staff                    # Get all staff
GET    /api/staff/:id                # Get staff details
POST   /api/staff                    # Add new staff
PATCH  /api/staff/:id                # Update staff
DELETE /api/staff/:id                # Delete staff
```

### Payments
```
GET    /api/payments                 # Get all payments
GET    /api/payments/:id             # Get payment details
POST   /api/payments                 # Record payment
PATCH  /api/payments/:id             # Update payment
DELETE /api/payments/:id             # Delete payment
```

### Stages
```
GET    /api/stages                   # Get all stages
GET    /api/stages/:id               # Get stage details
POST   /api/stages                   # Create new stage
PATCH  /api/stages/:id               # Update stage
DELETE /api/stages/:id               # Delete stage
```

### Customers
```
GET    /api/customers                # Get all customers
GET    /api/customers/:id            # Get customer details
POST   /api/customers                # Add new customer
PATCH  /api/customers/:id            # Update customer
DELETE /api/customers/:id            # Delete customer
```

### Permissions
```
GET    /api/permissions              # Get all permissions
POST   /api/permissions              # Assign permission
DELETE /api/permissions/:id          # Remove permission
```

## 🛠️ Technologies Used

| Technology | Purpose |
|-----------|---------|
| **Express.js** | Web framework |
| **Sequelize** | ORM for database |
| **MySQL** | Relational database |
| **JWT** | Authentication |
| **Bcryptjs** | Password encryption |
| **Nodemailer** | Email notifications |
| **Node-cron** | Scheduled tasks |
| **Multer** | File upload handling |
| **CORS** | Cross-origin requests |

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development/production |
| `DB_HOST` | MySQL host | localhost |
| `DB_USER` | MySQL user | root |
| `DB_PASSWORD` | MySQL password | password |
| `DB_NAME` | Database name | amount_manager |
| `JWT_SECRET` | JWT secret key | your-secret-key |
| `JWT_EXPIRE` | Token expiration | 7d |
| `SMTP_HOST` | Email SMTP host | smtp.gmail.com |
| `SMTP_USER` | Email account | your@email.com |
| `SMTP_PASSWORD` | Email password | app-password |

## 🔐 Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Protected API routes with middleware
- CORS configuration
- Input validation on all endpoints
- Secure file upload handling with size limits

## 📅 Automated Tasks

The backend includes scheduled tasks via node-cron:
- **Payment Reminders**: Automatic email reminders for upcoming/overdue payments
- **Database Maintenance**: Regular cleanup and optimization
- **Notification Queue**: Process pending notifications

Configure cron jobs in `server.js`

## 📦 Dependencies

```json
{
  "express": "^5.2.1",
  "sequelize": "^6.37.8",
  "mysql2": "^3.22.1",
  "jsonwebtoken": "^9.0.3",
  "bcryptjs": "^3.0.3",
  "nodemailer": "^8.0.5",
  "multer": "^2.1.1",
  "node-cron": "^4.2.1",
  "cors": "^2.8.6",
  "dotenv": "^17.4.2"
}
```

## 🧪 Testing

Run tests:

```bash
npm test
```

Test files are located alongside their source files.

## 📊 Database Schema

Key tables:
- **users** - User accounts and authentication
- **staff** - Staff profiles and assignments
- **projects** - Project information
- **stages** - Project stages/phases
- **payments** - Payment records
- **customers** - Customer information
- **role_permissions** - Role and permission mappings

## 🚨 Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## 📈 Performance Optimization

- Database connection pooling via Sequelize
- Query optimization with indexes
- Pagination for large datasets
- Caching strategies for frequently accessed data
- Efficient file upload handling

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📞 Support & Troubleshooting

### Database Connection Issues
- Verify MySQL is running
- Check credentials in `.env`
- Ensure database exists

### Authentication Errors
- Verify JWT_SECRET is set
- Check token expiration
- Confirm middleware is applied

### Email Issues
- Enable "Less secure app access" for Gmail
- Generate app-specific password
- Check SMTP configuration

## 📄 License

ISC

## 👥 Author

Amount Manager Development Team

---

**Last Updated**: April 2026
