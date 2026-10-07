const { TimetableEntry, TeachingAssignment } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');
const ApiError = require('../utils/ApiError');
const { findClash } = require('../services/timetable');

const populateFields = {
  path: 'assignment',
  select: 'teacher subject course semester section',
  populate: [
    { path: 'teacher', select: 'user', populate: { path: 'user', select: 'name' } },
    { path: 'subject', select: 'name code' },
    { path: 'course', select: 'name code' },
  ],
};

const list = asyncHandler(async (req, res) => {
  const { course, semester, section } = req.query;
  let assignmentFilter = {};
  if (course) assignmentFilter.course = course;
  if (semester) assignmentFilter.semester = semester;
  if (section) assignmentFilter.section = section;

  if (req.user.role === 'teacher') {
    assignmentFilter.teacher = req.teacherProfile._id;
  }

  const assignments = await TeachingAssignment.find(assignmentFilter).select('_id');
  const entries = await TimetableEntry.find({ assignment: { $in: assignments.map((a) => a._id) } })
    .populate(populateFields)
    .sort({ day: 1, startTime: 1 });

  res.json(entries);
});

const me = asyncHandler(async (req, res) => {
  let assignmentFilter = {};

  if (req.user.role === 'teacher') {
    assignmentFilter.teacher = req.teacherProfile._id;
  } else if (req.user.role === 'student') {
    const sp = req.studentProfile;
    assignmentFilter = { course: sp.course, semester: sp.semester, section: sp.section };
  } else {
    throw ApiError.badRequest('Use /timetable with filters as admin');
  }

  const assignments = await TeachingAssignment.find(assignmentFilter).select('_id');
  const entries = await TimetableEntry.find({ assignment: { $in: assignments.map((a) => a._id) } })
    .populate(populateFields)
    .sort({ day: 1, startTime: 1 });

  res.json(entries);
});

const create = asyncHandler(async (req, res) => {
  const { assignment, day, startTime, endTime, room } = req.body;
  if (!assignment || !day || !startTime || !endTime) {
    throw ApiError.badRequest('assignment, day, startTime, and endTime are required');
  }
  if (toMinutesSafe(endTime) <= toMinutesSafe(startTime)) {
    throw ApiError.badRequest('endTime must be after startTime');
  }

  const clash = await findClash({ assignment, day, startTime, endTime, room });
  if (clash) throw conflictWithClash(clash);

  const entry = await TimetableEntry.create({ assignment, day, startTime, endTime, room });
  const populated = await entry.populate(populateFields);
  res.status(201).json(populated);
});

const update = asyncHandler(async (req, res) => {
  const entry = await TimetableEntry.findById(req.params.id);
  if (!entry) throw ApiError.notFound('Timetable entry not found');

  const merged = { ...entry.toObject(), ...req.body };
  if (toMinutesSafe(merged.endTime) <= toMinutesSafe(merged.startTime)) {
    throw ApiError.badRequest('endTime must be after startTime');
  }

  const clash = await findClash({
    assignment: merged.assignment,
    day: merged.day,
    startTime: merged.startTime,
    endTime: merged.endTime,
    room: merged.room,
    excludeId: entry._id,
  });
  if (clash) throw conflictWithClash(clash);

  Object.assign(entry, req.body);
  await entry.save();
  const populated = await entry.populate(populateFields);
  res.json(populated);
});

const remove = asyncHandler(async (req, res) => {
  const entry = await TimetableEntry.findById(req.params.id);
  if (!entry) throw ApiError.notFound('Timetable entry not found');
  await entry.deleteOne();
  res.json({ message: 'Deleted' });
});

function toMinutesSafe(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function conflictWithClash(clash) {
  const err = ApiError.conflict('Timetable clash detected');
  err.errors = [{ field: 'timetable', message: 'Clashes with an existing entry', clash }];
  return err;
}

module.exports = { list, me, create, update, remove };
