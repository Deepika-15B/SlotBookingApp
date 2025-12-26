import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import io from 'socket.io-client';
import AdminHome from '../components/admin/AdminHome';
import TestSlots from '../components/admin/TestSlots';
import Events from '../components/admin/Events';
import SlotPreferences from '../components/admin/SlotPreferences';
import SurveyQuestions from '../components/admin/SurveyQuestions';
import DashboardStats from '../components/admin/DashboardStats';
import './Dashboard.css';

const AdminDashboard = () => {
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
          <span className="role-badge">Admin</span>
        </div>
        <div className="nav-links">
          <Link to="/admin" className="nav-link">Dashboard</Link>
          <Link to="/admin/test-slots" className="nav-link">Test Slots</Link>
          <Link to="/admin/events" className="nav-link">Events</Link>
          <Link to="/admin/slot-preferences" className="nav-link">Slot Preferences</Link>
          <Link to="/admin/survey-questions" className="nav-link">Surveys</Link>
        </div>
        <div className="nav-user">
          <span>Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
        </div>
      </nav>
      <main className="dashboard-content">
        <Routes>
          <Route path="/" element={<AdminHome socket={socket} />} />
          <Route path="/test-slots" element={<TestSlots socket={socket} />} />
          <Route path="/events" element={<Events socket={socket} />} />
          <Route path="/slot-preferences" element={<SlotPreferences socket={socket} />} />
          <Route path="/survey-questions" element={<SurveyQuestions socket={socket} />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;

