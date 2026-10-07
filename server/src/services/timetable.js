const { TimetableEntry, TeachingAssignment } = require('../models');

function toMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  return toMinutes(aStart) < toMinutes(bEnd) && toMinutes(bStart) < toMinutes(aEnd);
}

// Finds a clashing entry for the same teacher, same course+semester+section, or same room,
// on the same day with an overlapping time range. Excludes `excludeId` (used on update).
async function findClash({ assignment, day, startTime, endTime, room, excludeId }) {
  const candidates = await TimetableEntry.find({
    day,
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  }).populate('assignment');

  const current = await TeachingAssignment.findById(assignment);

  for (const entry of candidates) {
    if (!overlaps(startTime, endTime, entry.startTime, entry.endTime)) continue;

    const other = entry.assignment;
    if (!other) continue;

    const sameTeacher = other.teacher.toString() === current.teacher.toString();
    const sameClass =
      other.course.toString() === current.course.toString() &&
      other.semester === current.semester &&
      other.section === current.section;
    const sameRoom = room && entry.room && room === entry.room;

    if (sameTeacher || sameClass || sameRoom) {
      return entry;
    }
  }

  return null;
}

module.exports = { findClash };
