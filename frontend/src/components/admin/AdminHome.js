import React, { useState, useEffect } from 'react';
import DashboardStats from './DashboardStats';
import TestSlots from './TestSlots';
import Events from './Events';
import SlotPreferences from './SlotPreferences';
import SurveyQuestions from './SurveyQuestions';

const AdminHome = ({ socket }) => {
  const [activeTab, setActiveTab] = useState('stats');

  return (
    <div>
      <div className="card" style={{ marginBottom: '30px' }}>
        <h1 style={{ 
          background: 'linear-gradient(135deg, #FFB6C1 0%, #DDA0DD 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '10px',
          fontWeight: '700'
        }}>Admin Dashboard</h1>
        <p style={{ color: '#212121' }}>Manage assessments, events, slot preferences, and surveys</p>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        <button
          className={`btn ${activeTab === 'stats' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('stats')}
        >
          Statistics
        </button>
        <button
          className={`btn ${activeTab === 'slots' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('slots')}
        >
          Test Slots
        </button>
        <button
          className={`btn ${activeTab === 'events' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('events')}
        >
          Events
        </button>
        <button
          className={`btn ${activeTab === 'slot-preferences' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('slot-preferences')}
        >
          Slot Preferences
        </button>
        <button
          className={`btn ${activeTab === 'surveys' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('surveys')}
        >
          Surveys
        </button>
      </div>

      {activeTab === 'stats' && <DashboardStats />}
      {activeTab === 'slots' && <TestSlots socket={socket} />}
      {activeTab === 'events' && <Events socket={socket} />}
      {activeTab === 'slot-preferences' && <SlotPreferences socket={socket} />}
      {activeTab === 'surveys' && <SurveyQuestions socket={socket} />}
    </div>
  );
};

export default AdminHome;

