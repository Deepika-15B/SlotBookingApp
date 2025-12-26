import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const Events = ({ socket }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    eventDate: '',
    registrationLimit: '',
    eventType: 'workshop',
    description: ''
  });
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    fetchEvents();

    if (socket) {
      socket.on('event-created', () => fetchEvents());
      socket.on('event-updated', () => fetchEvents());
      socket.on('event-deleted', () => fetchEvents());
      socket.on('event-registration-update', () => fetchEvents());
    }

    return () => {
      if (socket) {
        socket.off('event-created');
        socket.off('event-updated');
        socket.off('event-deleted');
        socket.off('event-registration-update');
      }
    };
  }, [socket]);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/events`);
      setEvents(response.data);
    } catch (error) {
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await axios.put(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/events/${editingEvent._id}`,
          formData
        );
        toast.success('Event updated successfully');
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/events`,
          formData
        );
        toast.success('Event created successfully');
      }
      setShowModal(false);
      setFormData({ title: '', eventDate: '', registrationLimit: '', eventType: 'workshop', description: '' });
      setEditingEvent(null);
      fetchEvents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save event');
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      eventDate: format(new Date(event.eventDate), "yyyy-MM-dd'T'HH:mm"),
      registrationLimit: event.registrationLimit.toString(),
      eventType: event.eventType,
      description: event.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/events/${id}`);
        toast.success('Event deleted successfully');
        fetchEvents();
      } catch (error) {
        toast.error('Failed to delete event');
      }
    }
  };

  const toggleActive = async (event) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/events/${event._id}`,
        { isActive: !event.isActive }
      );
      toast.success(`Event ${!event.isActive ? 'activated' : 'deactivated'}`);
      fetchEvents();
    } catch (error) {
      toast.error('Failed to update event');
    }
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Events & Workshops Management</h2>
        <button className="btn btn-primary" onClick={() => {
          setShowModal(true);
          setEditingEvent(null);
          setFormData({ title: '', eventDate: '', registrationLimit: '', eventType: 'workshop', description: '' });
        }}>
          + Create Event
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingEvent ? 'Edit Event' : 'Create Event'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Event Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., React Workshop Registration"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Event Type</label>
                <select
                  className="form-input"
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                  required
                >
                  <option value="workshop">Workshop</option>
                  <option value="seminar">Seminar</option>
                  <option value="training">Training</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Event Date & Time</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Registration Limit</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.registrationLimit}
                  onChange={(e) => setFormData({ ...formData, registrationLimit: e.target.value })}
                  min="1"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <textarea
                  className="form-textarea"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter event description..."
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingEvent ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-2">
        {events.map(event => (
          <div key={event._id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
              <div>
                <h3 className="pastel-heading-h3" style={{ marginBottom: '10px' }}>{event.title}</h3>
                <div style={{ marginBottom: '10px' }}>
                  <span className={`badge ${event.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {event.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="badge badge-info" style={{ marginLeft: '10px' }}>
                    {event.eventType}
                  </span>
                  {event.registeredCount >= event.registrationLimit && (
                    <span className="badge badge-warning" style={{ marginLeft: '10px' }}>
                      Full
                    </span>
                  )}
                </div>
              </div>
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
              <div style={{ 
                width: '100%', 
                height: '8px', 
                background: '#e0e0e0', 
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${(event.registeredCount / event.registrationLimit) * 100}%`,
                  height: '100%',
                  background: event.registeredCount >= event.registrationLimit ? '#dc3545' : '#28a745',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => handleEdit(event)}>
                Edit
              </button>
              <button 
                className={`btn ${event.isActive ? 'btn-secondary' : 'btn-success'}`}
                onClick={() => toggleActive(event)}
              >
                {event.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button className="btn btn-danger" onClick={() => handleDelete(event._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: '#212121' }}>
          No events created yet. Create your first event!
        </div>
      )}
    </div>
  );
};

export default Events;

