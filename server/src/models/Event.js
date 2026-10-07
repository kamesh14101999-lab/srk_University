const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: [
        'cultural',
        'technical',
        'workshop',
        'seminar',
        'conference',
        'guest_lecture',
        'student_activity',
        'competition',
      ],
      required: true,
    },
    description: { type: String, default: '' },
    date: { type: Date, required: true },
    startTime: { type: String },
    endTime: { type: String },
    venue: { type: String, default: '' },
    organizer: { type: String, default: '' },
    coordinator: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    registrationRequired: { type: Boolean, default: false },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    imageUrls: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
