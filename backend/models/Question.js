const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
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

questionSchema.methods.isFull = function() {
  return this.currentResponses >= this.maxResponses;
};

questionSchema.methods.canRespond = function() {
  return this.isActive && !this.isFull();
};

module.exports = mongoose.model('Question', questionSchema);

