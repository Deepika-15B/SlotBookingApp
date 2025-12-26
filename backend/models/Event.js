const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  eventDate: {
    type: Date,
    required: true
  },
  registrationLimit: {
    type: Number,
    required: true,
    min: 1
  },
  registeredCount: {
    type: Number,
    default: 0
  },
  registeredStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  eventType: {
    type: String,
    enum: ['workshop', 'seminar', 'training', 'other'],
    default: 'workshop'
  },
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

eventSchema.methods.isFull = function() {
  return this.registeredCount >= this.registrationLimit;
};

eventSchema.methods.canRegister = function() {
  return this.isActive && !this.isFull();
};

module.exports = mongoose.model('Event', eventSchema);

