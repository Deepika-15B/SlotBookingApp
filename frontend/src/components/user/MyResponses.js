import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import io from 'socket.io-client';

const MyResponses = () => {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    fetchResponses();
    
    // Set up socket connection for real-time updates
    const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('survey-response-update', () => {
      console.log('Survey response update received, refreshing...');
      fetchResponses();
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const fetchResponses = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/user/my-responses`);
      console.log('Fetched responses:', response.data);
      setResponses(response.data || []);
    } catch (error) {
      console.error('Failed to fetch responses:', error);
      setResponses([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div>
      <h2 style={{ marginBottom: '20px', color: '#1a237e' }}>My Responses</h2>
      <div className="grid grid-2">
        {responses.map((response, idx) => {
          const questionText = response.question?.question || 
                              (response.questionType === 'SlotPreference' ? 'Slot Preference Selection' : 'Question not available');
          
          return (
            <div key={idx} className="card">
              <h3 className="pastel-heading-h3" style={{ marginBottom: '15px' }}>
                {questionText}
              </h3>
              {response.questionType === 'SlotPreference' && (
                <div style={{ marginBottom: '10px' }}>
                  <span className="badge badge-info">Slot Preference</span>
                </div>
              )}
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ color: '#1a237e' }}>Your {response.questionType === 'SlotPreference' ? 'Selection' : 'Answer'}:</strong>
                <p style={{ color: '#212121', marginTop: '10px', padding: '10px', background: '#f8f9fa', borderRadius: '6px' }}>
                  {response.answer}
                </p>
              </div>
              {response.submittedAt && (
                <div style={{ color: '#1565c0', fontSize: '14px' }}>
                  Submitted: {format(new Date(response.submittedAt), 'PPpp')}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {responses.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: '#212121' }}>
          You haven't submitted any responses yet.
        </div>
      )}
    </div>
  );
};

export default MyResponses;

