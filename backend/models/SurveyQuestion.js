const mongoose = require('mongoose');

const surveyQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  questionType: {
    type: String,
    enum: ['yesno', 'text', 'consent'],
    default: 'text'
  },
  maxResponses: {
    type: Number,
    required: true,
    min: 1
  },
  currentResponses: {
    type: Number,
    default: 0
  },
  responses: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    answer: String,
    submittedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

surveyQuestionSchema.methods.isFull = function() {
  return this.currentResponses >= this.maxResponses;
};

surveyQuestionSchema.methods.canRespond = function() {
  return this.isActive && !this.isFull();
};

module.exports = mongoose.model('SurveyQuestion', surveyQuestionSchema);

