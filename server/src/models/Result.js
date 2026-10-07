const mongoose = require('mongoose');

const resultSubjectSchema = new mongoose.Schema(
  {
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    maxMarks: { type: Number, required: true },
    obtained: { type: Number, required: true },
    percent: { type: Number, required: true },
    grade: { type: String, required: true },
    gradePoint: { type: Number, required: true },
    credits: { type: Number, required: true },
    status: { type: String, enum: ['pass', 'fail'], required: true },
  },
  { _id: false }
);

const resultSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    semester: { type: Number, required: true },
    academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    subjects: [resultSubjectSchema],
    totalMax: { type: Number, required: true },
    totalObtained: { type: Number, required: true },
    percentage: { type: Number, required: true },
    sgpa: { type: Number, required: true },
    cgpa: { type: Number, required: true },
    status: { type: String, enum: ['pass', 'fail'], required: true },
    backlogs: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

resultSchema.index({ student: 1, semester: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('Result', resultSchema);
