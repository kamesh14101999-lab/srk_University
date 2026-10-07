const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['academic', 'sports', 'cultural', 'technical', 'club', 'other'],
      required: true,
    },
    date: { type: Date },
    sourceType: { type: String, default: '' },
    sourceId: { type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Achievement', achievementSchema);
