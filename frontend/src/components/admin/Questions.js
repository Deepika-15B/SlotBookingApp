import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const Questions = ({ socket }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    question: '',
    maxResponses: ''
  });
  const [editingQuestion, setEditingQuestion] = useState(null);

  useEffect(() => {
    fetchQuestions();

    if (socket) {
      socket.on('question-created', () => {
        fetchQuestions();
      });
      socket.on('question-updated', () => {
        fetchQuestions();
      });
      socket.on('question-deleted', () => {
        fetchQuestions();
      });
      socket.on('response-update', () => {
        fetchQuestions();
      });
    }

    return () => {
      if (socket) {
        socket.off('question-created');
        socket.off('question-updated');
        socket.off('question-deleted');
        socket.off('response-update');
      }
    };
  }, [socket]);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/questions`);
      setQuestions(response.data);
    } catch (error) {
      toast.error('Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingQuestion) {
        await axios.put(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/questions/${editingQuestion._id}`,
          formData
        );
        toast.success('Question updated successfully');
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/questions`,
          formData
        );
        toast.success('Question created successfully');
      }
      setShowModal(false);
      setFormData({ question: '', maxResponses: '' });
      setEditingQuestion(null);
      fetchQuestions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save question');
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setFormData({
      question: question.question,
      maxResponses: question.maxResponses.toString()
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/questions/${id}`);
        toast.success('Question deleted successfully');
        fetchQuestions();
      } catch (error) {
        toast.error('Failed to delete question');
      }
    }
  };

  const toggleActive = async (question) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/questions/${question._id}`,
        { isActive: !question.isActive }
      );
      toast.success(`Question ${!question.isActive ? 'activated' : 'deactivated'}`);
      fetchQuestions();
    } catch (error) {
      toast.error('Failed to update question');
    }
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Questions Management</h2>
        <button className="btn btn-primary" onClick={() => {
          setShowModal(true);
          setEditingQuestion(null);
          setFormData({ question: '', maxResponses: '' });
        }}>
          + Create Question
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingQuestion ? 'Edit Question' : 'Create Question'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Question</label>
                <textarea
                  className="form-textarea"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="Enter your question..."
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Maximum Responses Allowed</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.maxResponses}
                  onChange={(e) => setFormData({ ...formData, maxResponses: e.target.value })}
                  min="1"
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingQuestion ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-2">
        {questions.map(question => (
          <div key={question._id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ color: '#667eea', marginBottom: '10px' }}>{question.question}</h3>
                <div style={{ marginBottom: '10px' }}>
                  <span className={`badge ${question.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {question.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {question.currentResponses >= question.maxResponses && (
                    <span className="badge badge-warning" style={{ marginLeft: '10px' }}>
                      Limit Reached
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span>Responses:</span>
                <strong>{question.currentResponses} / {question.maxResponses}</strong>
              </div>
              <div style={{ 
                width: '100%', 
                height: '8px', 
                background: '#e0e0e0', 
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${(question.currentResponses / question.maxResponses) * 100}%`,
                  height: '100%',
                  background: question.currentResponses >= question.maxResponses ? '#dc3545' : '#28a745',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
            </div>
            {question.responses && question.responses.length > 0 && (
              <div style={{ marginBottom: '15px', padding: '10px', background: '#f8f9fa', borderRadius: '6px' }}>
                <strong>Recent Responses:</strong>
                <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                  {question.responses.slice(0, 3).map((response, idx) => (
                    <li key={idx} style={{ marginBottom: '5px', color: '#666' }}>
                      {response.user?.name || 'Anonymous'}: {response.answer.substring(0, 50)}...
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => handleEdit(question)}>
                Edit
              </button>
              <button 
                className={`btn ${question.isActive ? 'btn-secondary' : 'btn-success'}`}
                onClick={() => toggleActive(question)}
              >
                {question.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button className="btn btn-danger" onClick={() => handleDelete(question._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {questions.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: '#666' }}>
          No questions created yet. Create your first question!
        </div>
      )}
    </div>
  );
};

export default Questions;

