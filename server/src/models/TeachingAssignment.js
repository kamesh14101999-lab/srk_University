const mongoose = require('mongoose');

const teachingAssignmentSchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true, index: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    semester: { type: Number, required: true },
    section: { type: String, required: true },
    academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
  },
  { timestamps: true }
);

teachingAssignmentSchema.index(
  { subject: 1, course: 1, semester: 1, section: 1, academicYear: 1 },
  { unique: true }
);

module.exports = mongoose.model('TeachingAssignment', teachingAssignmentSchema);
