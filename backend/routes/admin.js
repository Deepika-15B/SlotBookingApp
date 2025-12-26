const express = require('express');
const { body, validationResult } = require('express-validator');
const TestSlot = require('../models/TestSlot');
const Event = require('../models/Event');
const SlotPreference = require('../models/SlotPreference');
const SurveyQuestion = require('../models/SurveyQuestion');
const User = require('../models/User');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Create Test Slot
router.post('/test-slots', adminAuth, [
  body('testDate').notEmpty().withMessage('Test date is required'),
  body('registrationLimit').isInt({ min: 1 }).withMessage('Registration limit must be at least 1'),
  body('description').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { testDate, registrationLimit, description } = req.body;

    const testSlot = new TestSlot({
      testDate: new Date(testDate),
      registrationLimit,
      description: description || '',
      createdBy: req.user._id
    });

    await testSlot.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('test-slot-created', testSlot);

    res.status(201).json(testSlot);
  } catch (error) {
    console.error('Create test slot error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get All Test Slots
router.get('/test-slots', adminAuth, async (req, res) => {
  try {
    const testSlots = await TestSlot.find()
      .populate('createdBy', 'name email')
      .populate('registeredStudents', 'name email studentId')
      .sort({ createdAt: -1 });
    res.json(testSlots);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Single Test Slot
router.get('/test-slots/:id', adminAuth, async (req, res) => {
  try {
    const testSlot = await TestSlot.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('registeredStudents', 'name email studentId');
    
    if (!testSlot) {
      return res.status(404).json({ message: 'Test slot not found' });
    }
    
    res.json(testSlot);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Test Slot
router.put('/test-slots/:id', adminAuth, [
  body('testDate').optional().notEmpty(),
  body('registrationLimit').optional().isInt({ min: 1 }),
  body('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    const testSlot = await TestSlot.findById(req.params.id);
    if (!testSlot) {
      return res.status(404).json({ message: 'Test slot not found' });
    }

    const { testDate, registrationLimit, isActive, description } = req.body;
    
    if (testDate) testSlot.testDate = new Date(testDate);
    if (registrationLimit !== undefined) testSlot.registrationLimit = registrationLimit;
    if (isActive !== undefined) testSlot.isActive = isActive;
    if (description !== undefined) testSlot.description = description;

    await testSlot.save();

    const io = req.app.get('io');
    io.emit('test-slot-updated', testSlot);

    res.json(testSlot);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete Test Slot
router.delete('/test-slots/:id', adminAuth, async (req, res) => {
  try {
    const testSlot = await TestSlot.findByIdAndDelete(req.params.id);
    if (!testSlot) {
      return res.status(404).json({ message: 'Test slot not found' });
    }

    const io = req.app.get('io');
    io.emit('test-slot-deleted', { id: req.params.id });

    res.json({ message: 'Test slot deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== EVENTS (Workshop/Seminar/Training) ====================

// Create Event
router.post('/events', adminAuth, [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('eventDate').notEmpty().withMessage('Event date is required'),
  body('registrationLimit').isInt({ min: 1 }).withMessage('Registration limit must be at least 1'),
  body('eventType').optional().isIn(['workshop', 'seminar', 'training', 'other']),
  body('description').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, eventDate, registrationLimit, eventType, description } = req.body;

    const event = new Event({
      title,
      eventDate: new Date(eventDate),
      registrationLimit,
      eventType: eventType || 'workshop',
      description: description || '',
      createdBy: req.user._id
    });

    await event.save();

    const io = req.app.get('io');
    io.emit('event-created', event);

    res.status(201).json(event);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get All Events
router.get('/events', adminAuth, async (req, res) => {
  try {
    const events = await Event.find()
      .populate('createdBy', 'name email')
      .populate('registeredStudents', 'name email studentId')
      .sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Single Event
router.get('/events/:id', adminAuth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('registeredStudents', 'name email studentId');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Event
router.put('/events/:id', adminAuth, [
  body('title').optional().trim().notEmpty(),
  body('eventDate').optional().notEmpty(),
  body('registrationLimit').optional().isInt({ min: 1 }),
  body('eventType').optional().isIn(['workshop', 'seminar', 'training', 'other']),
  body('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const { title, eventDate, registrationLimit, eventType, isActive, description } = req.body;
    
    if (title) event.title = title;
    if (eventDate) event.eventDate = new Date(eventDate);
    if (registrationLimit !== undefined) event.registrationLimit = registrationLimit;
    if (eventType) event.eventType = eventType;
    if (isActive !== undefined) event.isActive = isActive;
    if (description !== undefined) event.description = description;

    await event.save();

    const io = req.app.get('io');
    io.emit('event-updated', event);

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete Event
router.delete('/events/:id', adminAuth, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const io = req.app.get('io');
    io.emit('event-deleted', { id: req.params.id });

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== SLOT PREFERENCES ====================

// Create Slot Preference
router.post('/slot-preferences', adminAuth, [
  body('question').trim().notEmpty().withMessage('Question is required'),
  body('slots').isArray({ min: 1 }).withMessage('At least one slot is required'),
  body('slots.*.label').trim().notEmpty().withMessage('Slot label is required'),
  body('slots.*.maxCount').isInt({ min: 1 }).withMessage('Max count must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { question, slots } = req.body;

    const slotPreference = new SlotPreference({
      question,
      slots: slots.map(slot => ({
        label: slot.label,
        maxCount: slot.maxCount,
        currentCount: 0,
        registeredStudents: []
      })),
      createdBy: req.user._id
    });

    await slotPreference.save();

    const io = req.app.get('io');
    io.emit('slot-preference-created', slotPreference);

    res.status(201).json(slotPreference);
  } catch (error) {
    console.error('Create slot preference error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get All Slot Preferences
router.get('/slot-preferences', adminAuth, async (req, res) => {
  try {
    const slotPreferences = await SlotPreference.find()
      .populate('createdBy', 'name email')
      .populate('slots.registeredStudents', 'name email studentId')
      .sort({ createdAt: -1 });
    res.json(slotPreferences);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Single Slot Preference
router.get('/slot-preferences/:id', adminAuth, async (req, res) => {
  try {
    const slotPreference = await SlotPreference.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('slots.registeredStudents', 'name email studentId');
    
    if (!slotPreference) {
      return res.status(404).json({ message: 'Slot preference not found' });
    }
    
    res.json(slotPreference);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Slot Preference
router.put('/slot-preferences/:id', adminAuth, [
  body('question').optional().trim().notEmpty(),
  body('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    const slotPreference = await SlotPreference.findById(req.params.id);
    if (!slotPreference) {
      return res.status(404).json({ message: 'Slot preference not found' });
    }

    const { question, isActive } = req.body;
    
    if (question) slotPreference.question = question;
    if (isActive !== undefined) slotPreference.isActive = isActive;

    await slotPreference.save();

    const io = req.app.get('io');
    io.emit('slot-preference-updated', slotPreference);

    res.json(slotPreference);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete Slot Preference
router.delete('/slot-preferences/:id', adminAuth, async (req, res) => {
  try {
    const slotPreference = await SlotPreference.findByIdAndDelete(req.params.id);
    if (!slotPreference) {
      return res.status(404).json({ message: 'Slot preference not found' });
    }

    const io = req.app.get('io');
    io.emit('slot-preference-deleted', { id: req.params.id });

    res.json({ message: 'Slot preference deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== SURVEY QUESTIONS ====================

// Create Survey Question
router.post('/survey-questions', adminAuth, [
  body('question').trim().notEmpty().withMessage('Question is required'),
  body('maxResponses').isInt({ min: 1 }).withMessage('Max responses must be at least 1'),
  body('questionType').optional().isIn(['yesno', 'text', 'consent'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { question, maxResponses, questionType } = req.body;

    const surveyQuestion = new SurveyQuestion({
      question,
      maxResponses,
      questionType: questionType || 'text',
      createdBy: req.user._id
    });

    await surveyQuestion.save();

    const io = req.app.get('io');
    io.emit('survey-question-created', surveyQuestion);

    res.status(201).json(surveyQuestion);
  } catch (error) {
    console.error('Create survey question error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get All Survey Questions
router.get('/survey-questions', adminAuth, async (req, res) => {
  try {
    const surveyQuestions = await SurveyQuestion.find()
      .populate('createdBy', 'name email')
      .populate('responses.user', 'name email studentId')
      .sort({ createdAt: -1 });
    res.json(surveyQuestions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Single Survey Question
router.get('/survey-questions/:id', adminAuth, async (req, res) => {
  try {
    const surveyQuestion = await SurveyQuestion.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('responses.user', 'name email studentId');
    
    if (!surveyQuestion) {
      return res.status(404).json({ message: 'Survey question not found' });
    }
    
    res.json(surveyQuestion);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Survey Question
router.put('/survey-questions/:id', adminAuth, [
  body('question').optional().trim().notEmpty(),
  body('maxResponses').optional().isInt({ min: 1 }),
  body('questionType').optional().isIn(['yesno', 'text', 'consent']),
  body('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    const surveyQuestion = await SurveyQuestion.findById(req.params.id);
    if (!surveyQuestion) {
      return res.status(404).json({ message: 'Survey question not found' });
    }

    const { question, maxResponses, questionType, isActive } = req.body;
    
    if (question) surveyQuestion.question = question;
    if (maxResponses !== undefined) surveyQuestion.maxResponses = maxResponses;
    if (questionType) surveyQuestion.questionType = questionType;
    if (isActive !== undefined) surveyQuestion.isActive = isActive;

    await surveyQuestion.save();

    const io = req.app.get('io');
    io.emit('survey-question-updated', surveyQuestion);

    res.json(surveyQuestion);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete Survey Question
router.delete('/survey-questions/:id', adminAuth, async (req, res) => {
  try {
    const surveyQuestion = await SurveyQuestion.findByIdAndDelete(req.params.id);
    if (!surveyQuestion) {
      return res.status(404).json({ message: 'Survey question not found' });
    }

    const io = req.app.get('io');
    io.emit('survey-question-deleted', { id: req.params.id });

    res.json({ message: 'Survey question deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Dashboard Stats
router.get('/dashboard/stats', adminAuth, async (req, res) => {
  try {
    const totalSlots = await TestSlot.countDocuments();
    const activeSlots = await TestSlot.countDocuments({ isActive: true });
    const totalRegistrations = await TestSlot.aggregate([
      { $group: { _id: null, total: { $sum: '$registeredCount' } } }
    ]);
    
    const totalEvents = await Event.countDocuments();
    const activeEvents = await Event.countDocuments({ isActive: true });
    const totalEventRegistrations = await Event.aggregate([
      { $group: { _id: null, total: { $sum: '$registeredCount' } } }
    ]);

    const totalSlotPreferences = await SlotPreference.countDocuments();
    const activeSlotPreferences = await SlotPreference.countDocuments({ isActive: true });

    const totalSurveyQuestions = await SurveyQuestion.countDocuments();
    const activeSurveyQuestions = await SurveyQuestion.countDocuments({ isActive: true });
    const totalSurveyResponses = await SurveyQuestion.aggregate([
      { $group: { _id: null, total: { $sum: '$currentResponses' } } }
    ]);

    const totalUsers = await User.countDocuments({ role: 'user' });

    res.json({
      testSlots: {
        total: totalSlots,
        active: activeSlots,
        totalRegistrations: totalRegistrations[0]?.total || 0
      },
      events: {
        total: totalEvents,
        active: activeEvents,
        totalRegistrations: totalEventRegistrations[0]?.total || 0
      },
      slotPreferences: {
        total: totalSlotPreferences,
        active: activeSlotPreferences
      },
      surveyQuestions: {
        total: totalSurveyQuestions,
        active: activeSurveyQuestions,
        totalResponses: totalSurveyResponses[0]?.total || 0
      },
      users: {
        total: totalUsers
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

