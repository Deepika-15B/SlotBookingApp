import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const SlotPreferences = ({ socket }) => {
  const [slotPreferences, setSlotPreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    question: '',
    slots: [{ label: '', maxCount: '' }]
  });
  const [editingPreference, setEditingPreference] = useState(null);

  useEffect(() => {
    fetchSlotPreferences();

    if (socket) {
      socket.on('slot-preference-created', () => fetchSlotPreferences());
      socket.on('slot-preference-updated', () => fetchSlotPreferences());
      socket.on('slot-preference-deleted', () => fetchSlotPreferences());
      socket.on('slot-preference-update', () => fetchSlotPreferences());
    }

    return () => {
      if (socket) {
        socket.off('slot-preference-created');
        socket.off('slot-preference-updated');
        socket.off('slot-preference-deleted');
        socket.off('slot-preference-update');
      }
    };
  }, [socket]);

  const fetchSlotPreferences = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/slot-preferences`);
      setSlotPreferences(response.data);
    } catch (error) {
      toast.error('Failed to fetch slot preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = () => {
    setFormData({
      ...formData,
      slots: [...formData.slots, { label: '', maxCount: '' }]
    });
  };

  const handleRemoveSlot = (index) => {
    if (formData.slots.length > 1) {
      setFormData({
        ...formData,
        slots: formData.slots.filter((_, i) => i !== index)
      });
    }
  };

  const handleSlotChange = (index, field, value) => {
    const newSlots = [...formData.slots];
    newSlots[index][field] = value;
    setFormData({ ...formData, slots: newSlots });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const slotsData = formData.slots.map(slot => ({
        label: slot.label,
        maxCount: parseInt(slot.maxCount)
      }));

      if (editingPreference) {
        await axios.put(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/slot-preferences/${editingPreference._id}`,
          { question: formData.question }
        );
        toast.success('Slot preference updated successfully');
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/slot-preferences`,
          { question: formData.question, slots: slotsData }
        );
        toast.success('Slot preference created successfully');
      }
      setShowModal(false);
      setFormData({ question: '', slots: [{ label: '', maxCount: '' }] });
      setEditingPreference(null);
      fetchSlotPreferences();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save slot preference');
    }
  };

  const handleEdit = (preference) => {
    setEditingPreference(preference);
    setFormData({
      question: preference.question,
      slots: preference.slots.map(slot => ({
        label: slot.label,
        maxCount: slot.maxCount.toString()
      }))
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this slot preference?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/slot-preferences/${id}`);
        toast.success('Slot preference deleted successfully');
        fetchSlotPreferences();
      } catch (error) {
        toast.error('Failed to delete slot preference');
      }
    }
  };

  const toggleActive = async (preference) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/slot-preferences/${preference._id}`,
        { isActive: !preference.isActive }
      );
      toast.success(`Slot preference ${!preference.isActive ? 'activated' : 'deactivated'}`);
      fetchSlotPreferences();
    } catch (error) {
      toast.error('Failed to update slot preference');
    }
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Slot Preference Questions</h2>
        <button className="btn btn-primary" onClick={() => {
          setShowModal(true);
          setEditingPreference(null);
          setFormData({ question: '', slots: [{ label: '', maxCount: '' }] });
        }}>
          + Create Slot Preference
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <h3>{editingPreference ? 'Edit Slot Preference' : 'Create Slot Preference'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Question</label>
                <textarea
                  className="form-textarea"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="e.g., Select your preferred assessment slot"
                  required
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Slots</label>
                {formData.slots.map((slot, index) => (
                  <div key={index} style={{ marginBottom: '15px', padding: '15px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                      <input
                        type="text"
                        className="form-input"
                        value={slot.label}
                        onChange={(e) => handleSlotChange(index, 'label', e.target.value)}
                        placeholder="Slot label (e.g., Slot A - 9-11 AM)"
                        required
                        style={{ flex: 2 }}
                      />
                      <input
                        type="number"
                        className="form-input"
                        value={slot.maxCount}
                        onChange={(e) => handleSlotChange(index, 'maxCount', e.target.value)}
                        placeholder="Max count"
                        min="1"
                        required
                        style={{ flex: 1 }}
                      />
                      {formData.slots.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => handleRemoveSlot(index)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleAddSlot}
                  style={{ marginTop: '10px' }}
                >
                  + Add Slot
                </button>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingPreference ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-2">
        {slotPreferences.map(preference => (
          <div key={preference._id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
              <div style={{ flex: 1 }}>
                <h3 className="pastel-heading-h3" style={{ marginBottom: '10px' }}>{preference.question}</h3>
                <div style={{ marginBottom: '10px' }}>
                  <span className={`badge ${preference.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {preference.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ marginBottom: '15px' }}>
              {preference.slots.map((slot, index) => (
                <div key={index} style={{ marginBottom: '10px', padding: '10px', background: '#f8f9fa', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <strong>{slot.label}</strong>
                    <span>{slot.currentCount} / {slot.maxCount}</span>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '6px', 
                    background: '#e0e0e0', 
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${(slot.currentCount / slot.maxCount) * 100}%`,
                      height: '100%',
                      background: slot.currentCount >= slot.maxCount ? '#dc3545' : '#28a745',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => handleEdit(preference)}>
                Edit
              </button>
              <button 
                className={`btn ${preference.isActive ? 'btn-secondary' : 'btn-success'}`}
                onClick={() => toggleActive(preference)}
              >
                {preference.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button className="btn btn-danger" onClick={() => handleDelete(preference._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {slotPreferences.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: '#212121' }}>
          No slot preferences created yet. Create your first slot preference question!
        </div>
      )}
    </div>
  );
};

export default SlotPreferences;

