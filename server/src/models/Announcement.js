const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    category: {
      type: String,
      enum: ['general', 'exam', 'result', 'holiday', 'event', 'academic', 'alert'],
      default: 'general',
    },
    audience: { type: String, enum: ['all', 'teachers', 'students', 'assignment'], required: true },
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'TeachingAssignment' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Announcement', announcementSchema);
