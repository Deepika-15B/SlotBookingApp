const express = require('express');
const { body, validationResult } = require('express-validator');
const TestSlot = require('../models/TestSlot');
const Event = require('../models/Event');
const SlotPreference = require('../models/SlotPreference');
const SurveyQuestion = require('../models/SurveyQuestion');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get All Active Test Slots
router.get('/test-slots', auth, async (req, res) => {
  try {
    const testSlots = await TestSlot.find({ isActive: true })
      .select('-registeredStudents')
      .sort({ testDate: 1 });
    res.json(testSlots);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Register for Test Slot
router.post('/test-slots/:id/register', auth, async (req, res) => {
  try {
    const testSlot = await TestSlot.findById(req.params.id);
    
    if (!testSlot) {
      return res.status(404).json({ message: 'Test slot not found' });
    }

    if (!testSlot.isActive) {
      return res.status(400).json({ message: 'This test slot is no longer active' });
    }

    if (testSlot.isFull()) {
      return res.status(400).json({ 
        message: 'Registration limit reached! This slot is full. Registration is no longer available.' 
      });
    }

    // Check if user already registered
    if (testSlot.registeredStudents.includes(req.user._id)) {
      return res.status(400).json({ message: 'You are already registered for this slot' });
    }

    // Register user
    testSlot.registeredStudents.push(req.user._id);
    testSlot.registeredCount += 1;
    await testSlot.save();

    // Update user's registered slots
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { registeredSlots: testSlot._id }
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('registration-update', {
      slotId: testSlot._id,
      registeredCount: testSlot.registeredCount,
      isFull: testSlot.isFull()
    });

    res.json({ 
      message: 'Successfully registered for the test slot',
      testSlot: {
        id: testSlot._id,
        testDate: testSlot.testDate,
        registeredCount: testSlot.registeredCount,
        registrationLimit: testSlot.registrationLimit
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get User's Registered Slots
router.get('/my-registrations', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('registeredSlots');
    res.json(user.registeredSlots);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== EVENTS ====================

// Get All Active Events
router.get('/events', auth, async (req, res) => {
  try {
    const events = await Event.find({ isActive: true })
      .select('-registeredStudents')
      .sort({ eventDate: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Register for Event
router.post('/events/:id/register', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (!event.isActive) {
      return res.status(400).json({ message: 'This event is no longer active' });
    }

    if (event.isFull()) {
      return res.status(400).json({ 
        message: 'Registration limit reached! This event is full. Registration is no longer available.' 
      });
    }

    // Check if user already registered
    if (event.registeredStudents.includes(req.user._id)) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }

    // Register user
    event.registeredStudents.push(req.user._id);
    event.registeredCount += 1;
    await event.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('event-registration-update', {
      eventId: event._id,
      registeredCount: event.registeredCount,
      isFull: event.isFull()
    });

    res.json({ 
      message: 'Successfully registered for the event',
      event: {
        id: event._id,
        title: event.title,
        registeredCount: event.registeredCount,
        registrationLimit: event.registrationLimit
      }
    });
  } catch (error) {
    console.error('Event registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== SLOT PREFERENCES ====================

// Get All Active Slot Preferences
router.get('/slot-preferences', auth, async (req, res) => {
  try {
    const slotPreferences = await SlotPreference.find({ isActive: true })
      .select('-slots.registeredStudents')
      .sort({ createdAt: -1 });
    res.json(slotPreferences);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Register for Slot Preference
router.post('/slot-preferences/:id/register', auth, [
  body('slotIndex').isInt({ min: 0 }).withMessage('Slot index is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const slotPreference = await SlotPreference.findById(req.params.id);
    
    if (!slotPreference) {
      return res.status(404).json({ message: 'Slot preference not found' });
    }

    if (!slotPreference.isActive) {
      return res.status(400).json({ message: 'This slot preference is no longer active' });
    }

    const slotIndex = req.body.slotIndex;
    const slot = slotPreference.slots[slotIndex];

    if (!slot) {
      return res.status(400).json({ message: 'Invalid slot selected' });
    }

    if (slot.currentCount >= slot.maxCount) {
      return res.status(400).json({ 
        message: `Maximum limit reached for "${slot.label}". No more registrations can be accepted.` 
      });
    }

    // Check if user already registered for any slot in this preference
    const alreadyRegistered = slotPreference.slots.some(s => 
      s.registeredStudents.includes(req.user._id)
    );

    if (alreadyRegistered) {
      return res.status(400).json({ message: 'You have already registered for a slot in this preference' });
    }

    // Register user for the selected slot
    slot.registeredStudents.push(req.user._id);
    slot.currentCount += 1;
    await slotPreference.save();

    // Update user's responses
    const user = await User.findById(req.user._id);
    const existingResponseIndex = user.responses.findIndex(
      r => r.question && r.question.toString() === slotPreference._id.toString() && r.questionType === 'SlotPreference'
    );
    
    const responseData = {
      question: slotPreference._id,
      questionType: 'SlotPreference',
      answer: slot.label,
      submittedAt: new Date()
    };
    
    if (existingResponseIndex >= 0) {
      // Update existing response
      user.responses[existingResponseIndex] = responseData;
    } else {
      // Add new response
      user.responses.push(responseData);
    }
    
    await user.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('slot-preference-update', {
      slotPreferenceId: slotPreference._id,
      slotIndex,
      currentCount: slot.currentCount,
      maxCount: slot.maxCount
    });

    res.json({ 
      message: `Successfully registered for "${slot.label}"`,
      slot: {
        label: slot.label,
        currentCount: slot.currentCount,
        maxCount: slot.maxCount
      }
    });
  } catch (error) {
    console.error('Slot preference registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== SURVEY QUESTIONS ====================

// Get All Active Survey Questions
router.get('/survey-questions', auth, async (req, res) => {
  try {
    const surveyQuestions = await SurveyQuestion.find({ isActive: true })
      .select('-responses')
      .sort({ createdAt: -1 });
    res.json(surveyQuestions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Single Survey Question
router.get('/survey-questions/:id', auth, async (req, res) => {
  try {
    const surveyQuestion = await SurveyQuestion.findById(req.params.id)
      .populate('responses.user', 'name email studentId');
    
    if (!surveyQuestion) {
      return res.status(404).json({ message: 'Survey question not found' });
    }
    
    res.json(surveyQuestion);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit Response to Survey Question
router.post('/survey-questions/:id/respond', auth, [
  body('answer').trim().notEmpty().withMessage('Answer is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const surveyQuestion = await SurveyQuestion.findById(req.params.id);
    
    if (!surveyQuestion) {
      return res.status(404).json({ message: 'Survey question not found' });
    }

    if (!surveyQuestion.isActive) {
      return res.status(400).json({ message: 'This survey question is no longer active' });
    }

    if (surveyQuestion.isFull()) {
      return res.status(400).json({ 
        message: 'Maximum response limit reached! No more responses can be accepted.' 
      });
    }

    // Check if user already responded
    const alreadyResponded = surveyQuestion.responses.some(
      response => response.user.toString() === req.user._id.toString()
    );

    if (alreadyResponded) {
      return res.status(400).json({ message: 'You have already submitted a response to this question' });
    }

    // Validate answer based on question type
    let answer = req.body.answer;
    if (surveyQuestion.questionType === 'yesno' || surveyQuestion.questionType === 'consent') {
      answer = answer.toLowerCase();
      if (!['yes', 'no', 'y', 'n'].includes(answer)) {
        return res.status(400).json({ message: 'Please answer with Yes or No' });
      }
      answer = answer.startsWith('y') ? 'Yes' : 'No';
    }

    // Add response
    surveyQuestion.responses.push({
      user: req.user._id,
      answer: answer
    });
    surveyQuestion.currentResponses += 1;
    await surveyQuestion.save();

    // Update user's responses - check if already exists first
    const user = await User.findById(req.user._id);
    const existingResponseIndex = user.responses.findIndex(
      r => r.question && r.question.toString() === surveyQuestion._id.toString()
    );
    
    const responseData = {
      question: surveyQuestion._id,
      questionType: 'SurveyQuestion',
      answer: answer,
      submittedAt: new Date()
    };
    
    if (existingResponseIndex >= 0) {
      // Update existing response
      user.responses[existingResponseIndex] = responseData;
    } else {
      // Add new response
      user.responses.push(responseData);
    }
    
    await user.save();
    
    console.log('Response saved to user:', {
      userId: req.user._id,
      questionId: surveyQuestion._id,
      answer: answer,
      totalResponses: user.responses.length
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('survey-response-update', {
      surveyQuestionId: surveyQuestion._id,
      currentResponses: surveyQuestion.currentResponses,
      isFull: surveyQuestion.isFull()
    });

    res.json({ 
      message: 'Response submitted successfully',
      surveyQuestion: {
        id: surveyQuestion._id,
        currentResponses: surveyQuestion.currentResponses,
        maxResponses: surveyQuestion.maxResponses
      }
    });
  } catch (error) {
    console.error('Survey response submission error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get User's Responses
router.get('/my-responses', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user || !user.responses || user.responses.length === 0) {
      return res.json([]);
    }
    
    // Populate responses based on questionType
    const populatedResponses = await Promise.all(
      user.responses.map(async (response) => {
        try {
          let question = null;
          
          // Handle old responses without questionType (backward compatibility)
          if (!response.questionType) {
            // Try SurveyQuestion first
            const SurveyQuestion = require('../models/SurveyQuestion');
            question = await SurveyQuestion.findById(response.question);
            
            // If not found, try old Question model (for backward compatibility)
            if (!question) {
              try {
                const Question = require('../models/Question');
                question = await Question.findById(response.question);
              } catch (err) {
                // Question model might not exist, that's okay
              }
            }
          } else if (response.questionType === 'SurveyQuestion') {
            const SurveyQuestion = require('../models/SurveyQuestion');
            question = await SurveyQuestion.findById(response.question);
          } else if (response.questionType === 'SlotPreference') {
            const SlotPreference = require('../models/SlotPreference');
            question = await SlotPreference.findById(response.question);
          }
          
          return {
            _id: response._id,
            question: question,
            questionType: response.questionType || 'SurveyQuestion',
            answer: response.answer,
            submittedAt: response.submittedAt || response.createdAt || new Date()
          };
        } catch (err) {
          console.error('Error populating response:', err);
          // Return response even if question not found
          return {
            _id: response._id,
            question: null,
            questionType: response.questionType || 'SurveyQuestion',
            answer: response.answer,
            submittedAt: response.submittedAt || response.createdAt || new Date()
          };
        }
      })
    );
    
    // Filter out null responses and sort by submittedAt (newest first)
    const validResponses = populatedResponses
      .filter(r => r !== null)
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    
    res.json(validResponses);
  } catch (error) {
    console.error('Get responses error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

