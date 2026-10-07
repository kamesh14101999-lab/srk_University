const mongoose = require('mongoose');

const calendarEntrySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: [
        'semester_start',
        'semester_end',
        'holiday',
        'internal_exam',
        'semester_exam',
        'results',
        'event',
        'workshop',
        'fest',
        'other',
      ],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CalendarEntry', calendarEntrySchema);
