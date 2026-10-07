const mongoose = require('mongoose');

const timetableEntrySchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TeachingAssignment',
      required: true,
      index: true,
    },
    day: { type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    room: { type: String, default: '' },
  },
  { timestamps: true }
);

timetableEntrySchema.index({ day: 1 });

module.exports = mongoose.model('TimetableEntry', timetableEntrySchema);
