const mongoose = require('mongoose');

const slotPreferenceSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  slots: [{
    label: {
      type: String,
      required: true
    },
    maxCount: {
      type: Number,
      required: true,
      min: 1
    },
    currentCount: {
      type: Number,
      default: 0
    },
    registeredStudents: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
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

slotPreferenceSchema.methods.isSlotFull = function(slotIndex) {
  const slot = this.slots[slotIndex];
  return slot && slot.currentCount >= slot.maxCount;
};

module.exports = mongoose.model('SlotPreference', slotPreferenceSchema);

