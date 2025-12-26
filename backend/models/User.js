const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  studentId: {
    type: String,
    unique: true,
    sparse: true
  },
  registeredSlots: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestSlot'
  }],
  responses: [{
    question: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'responses.questionType'
    },
    questionType: {
      type: String,
      enum: ['SurveyQuestion', 'SlotPreference'],
      default: 'SurveyQuestion'
    },
    answer: String,
    submittedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

