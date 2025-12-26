import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const TestSlots = ({ socket }) => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    testDate: '',
    registrationLimit: '',
    description: ''
  });
  const [editingSlot, setEditingSlot] = useState(null);

  useEffect(() => {
    fetchSlots();

    if (socket) {
      socket.on('test-slot-created', (newSlot) => {
        fetchSlots();
      });
      socket.on('test-slot-updated', () => {
        fetchSlots();
      });
      socket.on('test-slot-deleted', () => {
        fetchSlots();
      });
      socket.on('registration-update', () => {
        fetchSlots();
      });
    }

    return () => {
      if (socket) {
        socket.off('test-slot-created');
        socket.off('test-slot-updated');
        socket.off('test-slot-deleted');
        socket.off('registration-update');
      }
    };
  }, [socket]);

  const fetchSlots = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/test-slots`);
      setSlots(response.data);
    } catch (error) {
      toast.error('Failed to fetch test slots');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSlot) {
        await axios.put(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/test-slots/${editingSlot._id}`,
          formData
        );
        toast.success('Test slot updated successfully');
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/test-slots`,
          formData
        );
        toast.success('Test slot created successfully');
      }
      setShowModal(false);
      setFormData({ testDate: '', registrationLimit: '', description: '' });
      setEditingSlot(null);
      fetchSlots();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save test slot');
    }
  };

  const handleEdit = (slot) => {
    setEditingSlot(slot);
    setFormData({
      testDate: format(new Date(slot.testDate), "yyyy-MM-dd'T'HH:mm"),
      registrationLimit: slot.registrationLimit.toString(),
      description: slot.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this test slot?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/test-slots/${id}`);
        toast.success('Test slot deleted successfully');
        fetchSlots();
      } catch (error) {
        toast.error('Failed to delete test slot');
      }
    }
  };

  const toggleActive = async (slot) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/test-slots/${slot._id}`,
        { isActive: !slot.isActive }
      );
      toast.success(`Test slot ${!slot.isActive ? 'activated' : 'deactivated'}`);
      fetchSlots();
    } catch (error) {
      toast.error('Failed to update test slot');
    }
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Test Slots Management</h2>
        <button className="btn btn-primary" onClick={() => {
          setShowModal(true);
          setEditingSlot(null);
          setFormData({ testDate: '', registrationLimit: '', description: '' });
        }}>
          + Create Test Slot
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingSlot ? 'Edit Test Slot' : 'Create Test Slot'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Test Date & Time</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={formData.testDate}
                  onChange={(e) => setFormData({ ...formData, testDate: e.target.value })}
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
                  placeholder="Enter description..."
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingSlot ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-2">
        {slots.map(slot => (
          <div key={slot._id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
              <div>
                <h3 className="pastel-heading-h3" style={{ marginBottom: '10px' }}>
                  {format(new Date(slot.testDate), 'PPpp')}
                </h3>
                <div style={{ marginBottom: '10px' }}>
                  <span className={`badge ${slot.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {slot.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {slot.registeredCount >= slot.registrationLimit && (
                    <span className="badge badge-warning" style={{ marginLeft: '10px' }}>
                      Full
                    </span>
                  )}
                </div>
              </div>
            </div>
            {slot.description && (
              <p style={{ color: '#212121', marginBottom: '15px' }}>{slot.description}</p>
            )}
            <div style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span>Registrations:</span>
                <strong>{slot.registeredCount} / {slot.registrationLimit}</strong>
              </div>
              <div style={{ 
                width: '100%', 
                height: '8px', 
                background: '#e0e0e0', 
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${(slot.registeredCount / slot.registrationLimit) * 100}%`,
                  height: '100%',
                  background: slot.registeredCount >= slot.registrationLimit ? '#dc3545' : '#28a745',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => handleEdit(slot)}>
                Edit
              </button>
              <button 
                className={`btn ${slot.isActive ? 'btn-secondary' : 'btn-success'}`}
                onClick={() => toggleActive(slot)}
              >
                {slot.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button className="btn btn-danger" onClick={() => handleDelete(slot._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {slots.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: '#212121' }}>
          No test slots created yet. Create your first test slot!
        </div>
      )}
    </div>
  );
};

export default TestSlots;

