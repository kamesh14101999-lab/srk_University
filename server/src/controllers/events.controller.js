const { Event } = require('../models');
const { crudFactory } = require('../utils/crudFactory');
const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');

const base = crudFactory(Event, {
  populate: { path: 'coordinator', select: 'user', populate: { path: 'user', select: 'name' } },
  searchFields: ['name', 'venue', 'organizer'],
  filterFields: ['type', 'status'],
});

const register = asyncHandler(async (req, res) => {
  if (req.user.role !== 'student') throw ApiError.forbidden('Only students can register');
  const event = await Event.findById(req.params.id);
  if (!event) throw ApiError.notFound('Event not found');
  if (!event.registrationRequired) throw ApiError.badRequest('Registration is not required for this event');
  if (event.status !== 'upcoming') throw ApiError.badRequest('Registration is closed for this event');

  const studentId = req.studentProfile._id.toString();
  if (event.participants.some((p) => p.toString() === studentId)) {
    throw ApiError.conflict('Already registered');
  }

  event.participants.push(req.studentProfile._id);
  await event.save();
  res.json({ message: 'Registered', event });
});

module.exports = { ...base, register };
