# Step-by-Step Setup Guide

Follow these steps to set up and run the Smart Slot Booking Application.

## Prerequisites Checklist

- [ ] Node.js installed (v14 or higher)
- [ ] npm or yarn installed
- [ ] MongoDB Atlas account created
- [ ] Code editor (VS Code recommended)

## Step 1: MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for a free account

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose "FREE" (M0) tier
   - Select a cloud provider and region
   - Click "Create Cluster"

3. **Create Database User**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create a username and password (save these!)
   - Set user privileges to "Atlas admin" or "Read and write to any database"
   - Click "Add User"

4. **Whitelist IP Address**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - For development, click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" in the left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `slotbooking` (or your preferred database name)

## Step 2: Backend Setup

1. **Navigate to Backend Directory**
   ```bash
   cd backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```
   This will install:
   - express
   - mongoose
   - bcryptjs
   - jsonwebtoken
   - cors
   - dotenv
   - socket.io
   - express-validator
   - nodemon (dev dependency)

3. **Create Environment File**
   - Copy `.env.example` to `.env`
   - Open `.env` file
   - Fill in the values:
     ```env
     PORT=5000
     MONGODB_URI=your_mongodb_atlas_connection_string_here
     JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
     NODE_ENV=development
     FRONTEND_URL=http://localhost:3000
     ```
   - Replace `your_mongodb_atlas_connection_string_here` with your MongoDB connection string from Step 1
   - Replace `your_super_secret_jwt_key_here_make_it_long_and_random` with a random secret string (e.g., use a password generator)

4. **Start Backend Server**
   ```bash
   npm run dev
   ```
   You should see:
   - "MongoDB Connected"
   - "Server running on port 5000"

   **Keep this terminal window open!**

## Step 3: Frontend Setup

1. **Open a New Terminal Window**
   - Keep the backend server running in the first terminal

2. **Navigate to Frontend Directory**
   ```bash
   cd frontend
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```
   This will install:
   - react
   - react-dom
   - react-router-dom
   - axios
   - socket.io-client
   - react-toastify
   - date-fns
   - react-scripts

4. **Create Environment File**
   - Copy `.env.example` to `.env`
   - Open `.env` file
   - Ensure it contains:
     ```env
     REACT_APP_API_URL=http://localhost:5000/api
     REACT_APP_SOCKET_URL=http://localhost:5000
     ```

5. **Start Frontend Server**
   ```bash
   npm start
   ```
   The browser should automatically open to `http://localhost:3000`

## Step 4: Create Your First Admin Account

1. **Register as Admin**
   - On the login page, click "Register here"
   - Fill in the form:
     - Name: Your name
     - Email: Your email
     - Role: Select "Admin"
     - Password: Choose a secure password (min 6 characters)
     - Confirm Password: Re-enter password
   - Click "Register"
   - You'll be redirected to the admin dashboard

2. **Verify Admin Dashboard**
   - You should see the admin dashboard with:
     - Navigation bar with "Dashboard", "Test Slots", "Questions"
     - Welcome message with your name

## Step 5: Create Your First Test Slot

1. **Navigate to Test Slots**
   - Click "Test Slots" in the navigation or dashboard

2. **Create a Test Slot**
   - Click "+ Create Test Slot"
   - Fill in the form:
     - Test Date & Time: Select a future date/time
     - Registration Limit: Enter a number (e.g., 100)
     - Description: Optional description
   - Click "Create"
   - You should see the new test slot appear

## Step 6: Create Your First Question

1. **Navigate to Questions**
   - Click "Questions" in the navigation or dashboard

2. **Create a Question**
   - Click "+ Create Question"
   - Fill in the form:
     - Question: Enter your question text
     - Maximum Responses Allowed: Enter a number (e.g., 50)
   - Click "Create"
   - You should see the new question appear

## Step 7: Test User Registration

1. **Logout as Admin**
   - Click "Logout" in the top right

2. **Register as User**
   - Click "Register here"
   - Fill in the form:
     - Name: Student name
     - Email: Different email from admin
     - Role: Select "User"
     - Student ID: Enter a student ID (optional)
     - Password: Choose a password
     - Confirm Password: Re-enter password
   - Click "Register"
   - You'll be redirected to the user dashboard

3. **Register for Test Slot**
   - You should see the test slot you created
   - Click "Register Now"
   - You should see a success message
   - The registration count should update in real-time

4. **Answer a Question**
   - Click "Available Questions" tab
   - You should see the question you created
   - Enter an answer in the textarea
   - Click "Submit Response"
   - You should see a success message
   - The response count should update in real-time

## Step 8: Test Limit Reached Messages

1. **As Admin, Create a Test Slot with Limit 1**
   - Create a new test slot with registration limit of 1
   - Logout

2. **As User, Register for the Slot**
   - Login as user
   - Register for the slot with limit 1
   - You should see "Registration Limit Reached" message
   - The "Register Now" button should be replaced with the limit message

3. **Test Question Limit**
   - As admin, create a question with max responses of 1
   - As user, submit a response
   - Try to submit another response (you should see "Maximum Response Limit Reached")

## Troubleshooting

### Backend won't start
- Check if port 5000 is already in use
- Verify MongoDB connection string is correct
- Check if all dependencies are installed (`npm install`)

### Frontend won't start
- Check if port 3000 is already in use
- Verify all dependencies are installed (`npm install`)
- Check if backend is running

### MongoDB Connection Error
- Verify your IP is whitelisted in MongoDB Atlas
- Check if database user password is correct
- Ensure connection string format is correct

### CORS Errors
- Verify FRONTEND_URL in backend `.env` matches `http://localhost:3000`
- Ensure both servers are running

### Authentication Issues
- Clear browser localStorage
- Check if JWT_SECRET is set in backend `.env`
- Try logging out and logging back in

## Next Steps

- Explore the admin dashboard features
- Create multiple test slots and questions
- Test real-time updates by opening multiple browser windows
- Customize the UI colors and styling
- Add more features as needed

## Production Deployment

For production deployment:

1. **Backend**
   - Set `NODE_ENV=production`
   - Use a strong JWT_SECRET
   - Update FRONTEND_URL to your production frontend URL
   - Deploy to services like Heroku, Railway, or AWS

2. **Frontend**
   - Update `.env` with production API URL
   - Run `npm run build`
   - Deploy the `build` folder to services like Netlify, Vercel, or AWS S3

3. **MongoDB Atlas**
   - Use a production cluster (not free tier)
   - Set up proper IP whitelisting
   - Enable backup and monitoring

## Support

If you encounter any issues:
1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Check MongoDB Atlas connection status

