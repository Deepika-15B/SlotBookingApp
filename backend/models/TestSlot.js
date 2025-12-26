const mongoose = require('mongoose');

const testSlotSchema = new mongoose.Schema({
  testDate: {
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
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

testSlotSchema.methods.isFull = function() {
  return this.registeredCount >= this.registrationLimit;
};

testSlotSchema.methods.canRegister = function() {
  return this.isActive && !this.isFull();
};

module.exports = mongoose.model('TestSlot', testSlotSchema);

