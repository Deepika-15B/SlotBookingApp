import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const DashboardStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/dashboard/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  if (!stats) {
    return <div className="card">Failed to load statistics</div>;
  }

  return (
    <div>
      <div className="grid grid-3" style={{ marginBottom: '20px' }}>
        <div className="card">
          <h3 className="pastel-heading-h3" style={{ marginBottom: '15px' }}>Test Slots</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a237e', marginBottom: '10px' }}>
            {stats.testSlots?.total || 0}
          </div>
          <div style={{ color: '#212121' }}>
            <div>Active: {stats.testSlots?.active || 0}</div>
            <div>Total Registrations: {stats.testSlots?.totalRegistrations || 0}</div>
          </div>
        </div>

        <div className="card">
          <h3 className="pastel-heading-h3" style={{ marginBottom: '15px' }}>Events</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a237e', marginBottom: '10px' }}>
            {stats.events?.total || 0}
          </div>
          <div style={{ color: '#212121' }}>
            <div>Active: {stats.events?.active || 0}</div>
            <div>Total Registrations: {stats.events?.totalRegistrations || 0}</div>
          </div>
        </div>

        <div className="card">
          <h3 className="pastel-heading-h3" style={{ marginBottom: '15px' }}>Users</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a237e', marginBottom: '10px' }}>
            {stats.users?.total || 0}
          </div>
          <div style={{ color: '#212121' }}>Registered Students</div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3 className="pastel-heading-h3" style={{ marginBottom: '15px' }}>Slot Preferences</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a237e', marginBottom: '10px' }}>
            {stats.slotPreferences?.total || 0}
          </div>
          <div style={{ color: '#212121' }}>
            <div>Active: {stats.slotPreferences?.active || 0}</div>
          </div>
        </div>

        <div className="card">
          <h3 className="pastel-heading-h3" style={{ marginBottom: '15px' }}>Surveys</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a237e', marginBottom: '10px' }}>
            {stats.surveyQuestions?.total || 0}
          </div>
          <div style={{ color: '#212121' }}>
            <div>Active: {stats.surveyQuestions?.active || 0}</div>
            <div>Total Responses: {stats.surveyQuestions?.totalResponses || 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;

