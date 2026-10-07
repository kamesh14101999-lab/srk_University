const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['internal', 'midterm', 'assignment', 'practical', 'semester', 'supplementary'],
      required: true,
    },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    semester: { type: Number, required: true },
    academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    date: { type: Date },
    maxMarks: { type: Number, required: true, min: 1 },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

examSchema.index({ course: 1, semester: 1, academicYear: 1 });

module.exports = mongoose.model('Exam', examSchema);
