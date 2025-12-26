import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const SurveyQuestions = ({ socket }) => {
  const [surveyQuestions, setSurveyQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    question: '',
    maxResponses: '',
    questionType: 'text'
  });
  const [editingQuestion, setEditingQuestion] = useState(null);

  useEffect(() => {
    fetchSurveyQuestions();

    if (socket) {
      socket.on('survey-question-created', () => fetchSurveyQuestions());
      socket.on('survey-question-updated', () => fetchSurveyQuestions());
      socket.on('survey-question-deleted', () => fetchSurveyQuestions());
      socket.on('survey-response-update', () => fetchSurveyQuestions());
    }

    return () => {
      if (socket) {
        socket.off('survey-question-created');
        socket.off('survey-question-updated');
        socket.off('survey-question-deleted');
        socket.off('survey-response-update');
      }
    };
  }, [socket]);

  const fetchSurveyQuestions = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/survey-questions`);
      setSurveyQuestions(response.data);
    } catch (error) {
      toast.error('Failed to fetch survey questions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingQuestion) {
        await axios.put(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/survey-questions/${editingQuestion._id}`,
          formData
        );
        toast.success('Survey question updated successfully');
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/survey-questions`,
          formData
        );
        toast.success('Survey question created successfully');
      }
      setShowModal(false);
      setFormData({ question: '', maxResponses: '', questionType: 'text' });
      setEditingQuestion(null);
      fetchSurveyQuestions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save survey question');
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setFormData({
      question: question.question,
      maxResponses: question.maxResponses.toString(),
      questionType: question.questionType
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this survey question?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/survey-questions/${id}`);
        toast.success('Survey question deleted successfully');
        fetchSurveyQuestions();
      } catch (error) {
        toast.error('Failed to delete survey question');
      }
    }
  };

  const toggleActive = async (question) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/survey-questions/${question._id}`,
        { isActive: !question.isActive }
      );
      toast.success(`Survey question ${!question.isActive ? 'activated' : 'deactivated'}`);
      fetchSurveyQuestions();
    } catch (error) {
      toast.error('Failed to update survey question');
    }
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Survey & Consent Questions</h2>
        <button className="btn btn-primary" onClick={() => {
          setShowModal(true);
          setEditingQuestion(null);
          setFormData({ question: '', maxResponses: '', questionType: 'text' });
        }}>
          + Create Survey Question
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingQuestion ? 'Edit Survey Question' : 'Create Survey Question'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Question</label>
                <textarea
                  className="form-textarea"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="e.g., Are you interested in offline assessment?"
                  required
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Question Type</label>
                <select
                  className="form-input"
                  value={formData.questionType}
                  onChange={(e) => setFormData({ ...formData, questionType: e.target.value })}
                  required
                >
                  <option value="text">Text Response</option>
                  <option value="yesno">Yes/No</option>
                  <option value="consent">Consent (Yes/No)</option>
                </select>
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
        {surveyQuestions.map(question => (
          <div key={question._id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
              <div style={{ flex: 1 }}>
                <h3 className="pastel-heading-h3" style={{ marginBottom: '10px' }}>{question.question}</h3>
                <div style={{ marginBottom: '10px' }}>
                  <span className={`badge ${question.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {question.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="badge badge-info" style={{ marginLeft: '10px' }}>
                    {question.questionType}
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
                    <li key={idx} style={{ marginBottom: '5px', color: '#212121' }}>
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

      {surveyQuestions.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: '#212121' }}>
          No survey questions created yet. Create your first survey question!
        </div>
      )}
    </div>
  );
};

export default SurveyQuestions;

