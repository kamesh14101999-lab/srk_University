const mongoose = require('mongoose');

const markSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true, index: true },
    obtained: { type: Number, required: true, min: 0 },
    isAbsent: { type: Boolean, default: false },
    enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

markSchema.index({ student: 1, exam: 1 }, { unique: true });

module.exports = mongoose.model('Mark', markSchema);
