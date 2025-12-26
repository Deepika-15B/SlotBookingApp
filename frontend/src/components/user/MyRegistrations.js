import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/user/my-registrations`);
      setRegistrations(response.data);
    } catch (error) {
      console.error('Failed to fetch registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div>
      <h2 style={{ marginBottom: '20px', color: '#1a237e' }}>My Registrations</h2>
      <div className="grid grid-2">
        {registrations.map(slot => (
          <div key={slot._id} className="card">
            <h3 className="pastel-heading-h3" style={{ marginBottom: '15px' }}>
              {format(new Date(slot.testDate), 'PPpp')}
            </h3>
            {slot.description && (
              <p style={{ color: '#212121', marginBottom: '15px' }}>{slot.description}</p>
            )}
            <div style={{ marginBottom: '15px' }}>
              <span className={`badge ${slot.isActive ? 'badge-success' : 'badge-danger'}`}>
                {slot.isActive ? 'Active' : 'Inactive'}
              </span>
              {slot.registeredCount >= slot.registrationLimit && (
                <span className="badge badge-warning" style={{ marginLeft: '10px' }}>
                  Full
                </span>
              )}
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span>Total Registrations:</span>
                <strong>{slot.registeredCount} / {slot.registrationLimit}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
      {registrations.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: '#212121' }}>
          You haven't registered for any test slots yet.
        </div>
      )}
    </div>
  );
};

export default MyRegistrations;

