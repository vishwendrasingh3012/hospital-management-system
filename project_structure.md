# Hospital Management System - Project Structure

## Client Directory Structure

```
client/
├── public/                 # Static files
│   ├── index.html         # Main HTML file
│   ├── favicon.ico        # Website favicon
│   └── images/            # Image assets
│
├── src/                   # Source code
│   ├── components/        # React components
│   │   ├── Admin/        # Admin-specific components
│   │   │   ├── AdminDashboard.js
│   │   │   ├── AdminLogin.js
│   │   │   ├── ManageAppointments.js
│   │   │   ├── ManageDoctors.js
│   │   │   ├── ManagePatients.js
│   │   │   └── ViewStatistics.js
│   │   │
│   │   ├── Doctor/       # Doctor-specific components
│   │   │   ├── DoctorDashboard.js
│   │   │   ├── DoctorLogin.js
│   │   │   ├── TodayAppointments.js
│   │   │   ├── ViewAppointments.js
│   │   │   └── DoctorPatients.js
│   │   │
│   │   ├── Patient/      # Patient-specific components
│   │   │   ├── PatientDashboard.js
│   │   │   ├── PatientLogin.js
│   │   │   ├── BookAppointment.js
│   │   │   ├── PatientAppointments.js
│   │   │   ├── MedicalHistory.js
│   │   │   ├── ProvideFeedback.js
│   │   │   └── PatientBills.js
│   │   │
│   │   ├── Common/       # Shared components
│   │   │   ├── NavBar.js
│   │   │   ├── PrivateRoute.js
│   │   │   └── LoadingSpinner.js
│   │   │
│   │   └── Auth/         # Authentication components
│   │       ├── Login.js
│   │       └── Signup.js
│   │
│   ├── services/         # API services
│   │   ├── authService.js
│   │   ├── appointmentService.js
│   │   └── userService.js
│   │
│   ├── utils/           # Utility functions
│   │   ├── axios.js     # Axios configuration
│   │   └── helpers.js   # Helper functions
│   │
│   ├── styles/          # CSS files
│   │   ├── components/  # Component-specific styles
│   │   └── global.css   # Global styles
│   │
│   ├── App.js           # Main App component
│   ├── index.js         # Entry point
│   └── routes.js        # Route definitions
│
├── .env                 # Environment variables
├── package.json         # Dependencies and scripts
└── README.md           # Project documentation
```

## Server Directory Structure

```
server/
├── config/             # Configuration files
│   ├── database.js     # Database configuration
│   └── config.js       # General configuration
│
├── models/             # Database models
│   ├── User.js         # User model
│   ├── Appointment.js  # Appointment model
│   ├── MedicalRecord.js # Medical record model
│   └── Bill.js         # Bill model
│
├── routes/             # API routes
│   ├── admin.js        # Admin routes
│   ├── doctor.js       # Doctor routes
│   ├── patient.js      # Patient routes
│   ├── auth.js         # Authentication routes
│   └── appointments.js # Appointment routes
│
├── middlewares/        # Custom middleware
│   ├── auth.js         # Authentication middleware
│   ├── error.js        # Error handling middleware
│   └── validation.js   # Request validation middleware
│
├── utils/              # Utility functions
│   ├── logger.js       # Logging utility
│   └── helpers.js      # Helper functions
│
├── seeders/            # Database seeders
│   └── initialData.js  # Initial data seeding
│
├── app.js              # Express application setup
├── .env                # Environment variables
└── package.json        # Dependencies and scripts
```

## Key Features of Each Directory

### Client (Frontend)
- **components/**: Contains all React components organized by user role
- **services/**: Handles API communication and data fetching
- **utils/**: Contains reusable utility functions and configurations
- **styles/**: Manages CSS and styling for components
- **public/**: Stores static assets and the main HTML file

### Server (Backend)
- **config/**: Manages application configuration and database settings
- **models/**: Defines database schemas and relationships
- **routes/**: Handles API endpoints and request routing
- **middlewares/**: Contains custom middleware for request processing
- **utils/**: Provides utility functions for the backend
- **seeders/**: Manages initial data population for the database

## Technology Stack

### Frontend
- React.js
- Material-UI
- Axios for API calls
- React Router for navigation
- Context API for state management

### Backend
- Node.js
- Express.js
- MySQL with Sequelize ORM
- JWT for authentication
- bcrypt for password hashing 