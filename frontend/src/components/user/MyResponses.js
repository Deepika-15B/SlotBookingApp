import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const MyResponses = () => {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResponses();
  }, []);

  const fetchResponses = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/user/my-responses`);
      setResponses(response.data);
    } catch (error) {
      console.error('Failed to fetch responses:', error);
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
        {responses.map((response, idx) => (
          <div key={idx} className="card">
            <h3 className="pastel-heading-h3" style={{ marginBottom: '15px' }}>
              {response.question?.question || 'Question not available'}
            </h3>
            <div style={{ marginBottom: '15px' }}>
              <strong>Your Answer:</strong>
              <p style={{ color: '#212121', marginTop: '10px', padding: '10px', background: '#f8f9fa', borderRadius: '6px' }}>
                {response.answer}
              </p>
            </div>
            <div style={{ color: '#999', fontSize: '14px' }}>
              Submitted: {format(new Date(response.submittedAt), 'PPpp')}
            </div>
          </div>
        ))}
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

