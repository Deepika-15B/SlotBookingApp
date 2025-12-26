import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const UserHome = ({ socket }) => {
  const [slots, setSlots] = useState([]);
  const [events, setEvents] = useState([]);
  const [slotPreferences, setSlotPreferences] = useState([]);
  const [surveyQuestions, setSurveyQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('slots');

  useEffect(() => {
    fetchAll();

    if (socket) {
      socket.on('registration-update', () => fetchSlots());
      socket.on('event-registration-update', () => fetchEvents());
      socket.on('slot-preference-update', () => fetchSlotPreferences());
      socket.on('survey-response-update', () => fetchSurveyQuestions());
    }

    return () => {
      if (socket) {
        socket.off('registration-update');
        socket.off('event-registration-update');
        socket.off('slot-preference-update');
        socket.off('survey-response-update');
      }
    };
  }, [socket]);

  const fetchAll = async () => {
    await Promise.all([fetchSlots(), fetchEvents(), fetchSlotPreferences(), fetchSurveyQuestions()]);
    setLoading(false);
  };

  const fetchSlots = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/user/test-slots`);
      setSlots(response.data);
    } catch (error) {
      console.error('Failed to fetch test slots:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/user/events`);
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const fetchSlotPreferences = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/user/slot-preferences`);
      setSlotPreferences(response.data);
    } catch (error) {
      console.error('Failed to fetch slot preferences:', error);
    }
  };

  const fetchSurveyQuestions = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/user/survey-questions`);
      setSurveyQuestions(response.data);
    } catch (error) {
      console.error('Failed to fetch survey questions:', error);
    }
  };

  const handleRegisterSlot = async (slotId) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/user/test-slots/${slotId}/register`
      );
      toast.success(response.data.message || 'Successfully registered!');
      fetchSlots();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register');
    }
  };

  const handleRegisterEvent = async (eventId) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/user/events/${eventId}/register`
      );
      toast.success(response.data.message || 'Successfully registered!');
      fetchEvents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register');
    }
  };

  const handleRegisterSlotPreference = async (preferenceId, slotIndex) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/user/slot-preferences/${preferenceId}/register`,
        { slotIndex }
      );
      toast.success(response.data.message || 'Successfully registered!');
      fetchSlotPreferences();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register');
    }
  };

  const handleSurveyResponse = async (questionId, answer) => {
    if (!answer.trim()) {
      toast.error('Please enter an answer');
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/user/survey-questions/${questionId}/respond`,
        { answer }
      );
      toast.success(response.data.message || 'Response submitted successfully!');
      fetchSurveyQuestions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit response');
    }
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: '30px' }}>
        <h1 className="pastel-heading" style={{ marginBottom: '10px' }}>Welcome to Smart Slot Booking</h1>
        <p style={{ color: '#212121' }}>Register for assessments, events, slot preferences, and surveys</p>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
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

      {activeTab === 'slots' && (
        <div>
          <h2 style={{ marginBottom: '20px', color: '#1a237e' }}>Available Test Slots</h2>
          <div className="grid grid-2">
            {slots.map(slot => (
              <SlotCard key={slot._id} slot={slot} onRegister={handleRegisterSlot} />
            ))}
          </div>
          {slots.length === 0 && (
            <div className="card" style={{ textAlign: 'center', color: '#212121' }}>
              No test slots available at the moment.
            </div>
          )}
        </div>
      )}

      {activeTab === 'events' && (
        <div>
          <h2 style={{ marginBottom: '20px', color: '#1a237e' }}>Available Events & Workshops</h2>
          <div className="grid grid-2">
            {events.map(event => (
              <EventCard key={event._id} event={event} onRegister={handleRegisterEvent} />
            ))}
          </div>
          {events.length === 0 && (
            <div className="card" style={{ textAlign: 'center', color: '#212121' }}>
              No events available at the moment.
            </div>
          )}
        </div>
      )}

      {activeTab === 'slot-preferences' && (
        <div>
          <h2 style={{ marginBottom: '20px', color: '#1a237e' }}>Slot Preference Questions</h2>
          <div className="grid grid-2">
            {slotPreferences.map(preference => (
              <SlotPreferenceCard 
                key={preference._id} 
                preference={preference} 
                onRegister={handleRegisterSlotPreference} 
              />
            ))}
          </div>
          {slotPreferences.length === 0 && (
            <div className="card" style={{ textAlign: 'center', color: '#212121' }}>
              No slot preferences available at the moment.
            </div>
          )}
        </div>
      )}

      {activeTab === 'surveys' && (
        <div>
          <h2 style={{ marginBottom: '20px', color: '#1a237e' }}>Survey & Consent Questions</h2>
          <div className="grid grid-2">
            {surveyQuestions.map(question => (
              <SurveyCard 
                key={question._id} 
                question={question} 
                onRespond={handleSurveyResponse} 
              />
            ))}
          </div>
          {surveyQuestions.length === 0 && (
            <div className="card" style={{ textAlign: 'center', color: '#212121' }}>
              No survey questions available at the moment.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SlotCard = ({ slot, onRegister }) => {
  const isFull = slot.registeredCount >= slot.registrationLimit;
  return (
    <div className="card">
      <h3 className="pastel-heading-h3" style={{ marginBottom: '15px' }}>
        {format(new Date(slot.testDate), 'PPpp')}
      </h3>
      {slot.description && (
        <p style={{ color: '#212121', marginBottom: '15px' }}>{slot.description}</p>
      )}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span>Registrations:</span>
          <strong>{slot.registeredCount} / {slot.registrationLimit}</strong>
        </div>
        <div style={{ width: '100%', height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{
            width: `${(slot.registeredCount / slot.registrationLimit) * 100}%`,
            height: '100%',
            background: isFull ? '#dc3545' : '#28a745',
            transition: 'width 0.3s ease'
          }}></div>
        </div>
      </div>
      {isFull ? (
        <div style={{ padding: '15px', background: '#f8d7da', color: '#c62828', borderRadius: '8px', textAlign: 'center', fontWeight: '600' }}>
          Registration Limit Reached! Registration is no longer available.
        </div>
      ) : (
        <button className="btn btn-primary" onClick={() => onRegister(slot._id)}>
          Register Now
        </button>
      )}
    </div>
  );
};

const EventCard = ({ event, onRegister }) => {
  const isFull = event.registeredCount >= event.registrationLimit;
  return (
    <div className="card">
      <h3 className="pastel-heading-h3" style={{ marginBottom: '15px' }}>{event.title}</h3>
      <div style={{ marginBottom: '10px' }}>
        <span className="badge badge-info">{event.eventType}</span>
      </div>
      {event.description && (
        <p style={{ color: '#212121', marginBottom: '15px' }}>{event.description}</p>
      )}
      <p style={{ color: '#212121', marginBottom: '15px' }}>
        <strong>Date:</strong> {format(new Date(event.eventDate), 'PPpp')}
      </p>
      <div style={{ marginBottom: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span>Registrations:</span>
          <strong>{event.registeredCount} / {event.registrationLimit}</strong>
        </div>
        <div style={{ width: '100%', height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{
            width: `${(event.registeredCount / event.registrationLimit) * 100}%`,
            height: '100%',
            background: isFull ? '#dc3545' : '#28a745',
            transition: 'width 0.3s ease'
          }}></div>
        </div>
      </div>
      {isFull ? (
        <div style={{ padding: '15px', background: '#f8d7da', color: '#c62828', borderRadius: '8px', textAlign: 'center', fontWeight: '600' }}>
          Registration Limit Reached! Registration is no longer available.
        </div>
      ) : (
        <button className="btn btn-primary" onClick={() => onRegister(event._id)}>
          Register Now
        </button>
      )}
    </div>
  );
};

const SlotPreferenceCard = ({ preference, onRegister }) => {
  return (
    <div className="card">
      <h3 className="pastel-heading-h3" style={{ marginBottom: '15px' }}>{preference.question}</h3>
      <div style={{ marginBottom: '15px' }}>
        {preference.slots.map((slot, index) => {
          const isFull = slot.currentCount >= slot.maxCount;
          return (
            <div key={index} style={{ marginBottom: '10px', padding: '10px', background: '#f8f9fa', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <strong>{slot.label}</strong>
                <span>{slot.currentCount} / {slot.maxCount}</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: '#e0e0e0', borderRadius: '3px', overflow: 'hidden', marginBottom: '5px' }}>
                <div style={{
                  width: `${(slot.currentCount / slot.maxCount) * 100}%`,
                  height: '100%',
                  background: isFull ? '#dc3545' : '#28a745',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
              {isFull ? (
                <div style={{ fontSize: '12px', color: '#c62828', fontWeight: '600' }}>Full</div>
              ) : (
                <button 
                  className="btn btn-primary" 
                  onClick={() => onRegister(preference._id, index)}
                  style={{ fontSize: '14px' }}
                >
                  Select This Slot
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SurveyCard = ({ question, onRespond }) => {
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const isFull = question.currentResponses >= question.maxResponses;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onRespond(question._id, answer);
    setAnswer('');
    setSubmitting(false);
  };

  return (
    <div className="card">
      <h3 className="pastel-heading-h3" style={{ marginBottom: '15px' }}>{question.question}</h3>
      <div style={{ marginBottom: '10px' }}>
        <span className="badge badge-info">{question.questionType}</span>
      </div>
      <div style={{ marginBottom: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span>Responses:</span>
          <strong>{question.currentResponses} / {question.maxResponses}</strong>
        </div>
        <div style={{ width: '100%', height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{
            width: `${(question.currentResponses / question.maxResponses) * 100}%`,
            height: '100%',
            background: isFull ? '#dc3545' : '#28a745',
            transition: 'width 0.3s ease'
          }}></div>
        </div>
      </div>
      {isFull ? (
        <div style={{ padding: '15px', background: '#f8d7da', color: '#c62828', borderRadius: '8px', textAlign: 'center', fontWeight: '600' }}>
          Maximum Response Limit Reached! No more responses can be accepted.
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {question.questionType === 'yesno' || question.questionType === 'consent' ? (
            <div className="form-group">
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className={`btn ${answer.toLowerCase() === 'yes' ? 'btn-success' : 'btn-secondary'}`}
                  onClick={() => setAnswer('Yes')}
                  style={{ flex: 1 }}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={`btn ${answer.toLowerCase() === 'no' ? 'btn-danger' : 'btn-secondary'}`}
                  onClick={() => setAnswer('No')}
                  style={{ flex: 1 }}
                >
                  No
                </button>
              </div>
            </div>
          ) : (
            <div className="form-group">
              <textarea
                className="form-textarea"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter your answer..."
                required
                rows="4"
              />
            </div>
          )}
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={submitting || !answer.trim()}
          >
            {submitting ? 'Submitting...' : 'Submit Response'}
          </button>
        </form>
      )}
    </div>
  );
};

export default UserHome;
