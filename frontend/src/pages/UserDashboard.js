import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import io from 'socket.io-client';
import UserHome from '../components/user/UserHome';
import MyRegistrations from '../components/user/MyRegistrations';
import MyResponses from '../components/user/MyResponses';
import './Dashboard.css';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    return () => newSocket.close();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <div 
      className="dashboard"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/images/dashboard-background.jpg)`,
      }}
    >
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <h2>Smart Slot Booking</h2>
          <span className="role-badge user">User</span>
        </div>
        <div className="nav-links">
          <Link to="/user" className="nav-link">Available Slots</Link>
          <Link to="/user/my-registrations" className="nav-link">My Registrations</Link>
          <Link to="/user/my-responses" className="nav-link">My Responses</Link>
        </div>
        <div className="nav-user">
          <span>Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
        </div>
      </nav>
      <main className="dashboard-content">
        <Routes>
          <Route path="/" element={<UserHome socket={socket} />} />
          <Route path="/my-registrations" element={<MyRegistrations />} />
          <Route path="/my-responses" element={<MyResponses />} />
        </Routes>
      </main>
    </div>
  );
};

export default UserDashboard;

