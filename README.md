# Smart Slot Booking Application

A real-time slot booking and question response system built with React, Node.js, and MongoDB Atlas. This application allows administrators to create test slots with registration limits and questions with response limits, while students can register for slots and answer questions on a first-come-first-serve basis.

## Features

### Core Features
- **Test Slot Management**: Create test slots with date/time and registration limits
- **Registration System**: Students can register until the limit is reached
- **Question Management**: Create questions with maximum response limits
- **Real-time Updates**: Live updates using Socket.io for registration and response counts
- **Role-based Access**: Separate admin and user dashboards
- **Authentication**: Secure JWT-based authentication system

### Extra Features
- Dashboard statistics for admins
- Visual progress bars for registrations and responses
- Responsive design for mobile and desktop
- Beautiful and modern UI with gradient backgrounds
- Toast notifications for user feedback
- View registered slots and submitted responses

## Tech Stack

- **Frontend**: React 18, React Router, Socket.io Client, Axios, React Toastify
- **Backend**: Node.js, Express.js, Socket.io, MongoDB (Mongoose), JWT, Bcrypt
- **Database**: MongoDB Atlas

## Project Structure

```
Smart Slot Booking App/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── TestSlot.js
│   │   └── Question.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── admin.js
│   │   └── user.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   └── user/
│   │   ├── pages/
│   │   ├── context/
│   │   └── App.js
│   ├── package.json
│   └── .env.example
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Step 1: Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string_here
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

4. Start the backend server:
```bash
npm run dev
```

The backend server will run on `http://localhost:5000`

### Step 2: Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

4. Start the frontend development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

### Step 3: MongoDB Atlas Setup

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string and replace `your_mongodb_atlas_connection_string_here` in the backend `.env` file

## Usage

### Admin Features

1. **Register/Login as Admin**
   - Register with role "admin"
   - Login to access admin dashboard

2. **Create Test Slots**
   - Navigate to "Test Slots" section
   - Click "Create Test Slot"
   - Enter test date/time, registration limit, and optional description
   - Once limit is reached, registration automatically stops

3. **Create Questions**
   - Navigate to "Questions" section
   - Click "Create Question"
   - Enter question and maximum response limit
   - Once limit is reached, no more responses can be accepted

4. **View Statistics**
   - Dashboard shows total slots, questions, registrations, and users
   - Real-time updates for all metrics

### User Features

1. **Register/Login as User**
   - Register with role "user" and provide student ID
   - Login to access user dashboard

2. **Register for Test Slots**
   - View available test slots
   - Click "Register Now" to register
   - See real-time registration count
   - If limit reached, see "Registration Limit Reached" message

3. **Answer Questions**
   - View available questions
   - Submit answers to questions
   - See real-time response count
   - If limit reached, see "Maximum Response Limit Reached" message

4. **View My Registrations**
   - See all slots you've registered for

5. **View My Responses**
   - See all questions you've answered

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Admin Routes (Protected)
- `POST /api/admin/test-slots` - Create test slot
- `GET /api/admin/test-slots` - Get all test slots
- `GET /api/admin/test-slots/:id` - Get single test slot
- `PUT /api/admin/test-slots/:id` - Update test slot
- `DELETE /api/admin/test-slots/:id` - Delete test slot
- `POST /api/admin/questions` - Create question
- `GET /api/admin/questions` - Get all questions
- `GET /api/admin/questions/:id` - Get single question
- `PUT /api/admin/questions/:id` - Update question
- `DELETE /api/admin/questions/:id` - Delete question
- `GET /api/admin/dashboard/stats` - Get dashboard statistics

### User Routes (Protected)
- `GET /api/user/test-slots` - Get active test slots
- `POST /api/user/test-slots/:id/register` - Register for test slot
- `GET /api/user/my-registrations` - Get user's registrations
- `GET /api/user/questions` - Get active questions
- `GET /api/user/questions/:id` - Get single question
- `POST /api/user/questions/:id/respond` - Submit response to question
- `GET /api/user/my-responses` - Get user's responses

## Real-time Events

### Socket.io Events

**Client → Server:**
- `join-room` - Join a room for updates

**Server → Client:**
- `test-slot-created` - New test slot created
- `test-slot-updated` - Test slot updated
- `test-slot-deleted` - Test slot deleted
- `registration-update` - Registration count updated
- `question-created` - New question created
- `question-updated` - Question updated
- `question-deleted` - Question deleted
- `response-update` - Response count updated

## Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- CORS configuration
- Protected routes

## Development

### Running in Development Mode

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm start
```

### Building for Production

Frontend:
```bash
cd frontend
npm run build
```

Backend:
```bash
cd backend
npm start
```

## Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend URL for CORS

### Frontend (.env)
- `REACT_APP_API_URL` - Backend API URL
- `REACT_APP_SOCKET_URL` - Socket.io server URL

## Troubleshooting

1. **MongoDB Connection Error**
   - Verify your MongoDB Atlas connection string
   - Check if your IP is whitelisted
   - Ensure database user credentials are correct

2. **CORS Errors**
   - Verify FRONTEND_URL in backend .env matches your frontend URL
   - Check if both servers are running

3. **Socket.io Connection Issues**
   - Ensure REACT_APP_SOCKET_URL matches backend URL
   - Check if Socket.io server is running

4. **Authentication Errors**
   - Clear localStorage and try logging in again
   - Verify JWT_SECRET is set in backend .env

## License

This project is created for educational purposes.

## Support

For issues or questions, please check the code comments or create an issue in the repository.

