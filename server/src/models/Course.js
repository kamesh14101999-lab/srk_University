const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
    degreeType: { type: String, enum: ['UG', 'PG', 'Diploma', 'Certificate'], required: true },
    durationYears: { type: Number, required: true },
    totalSemesters: { type: Number, required: true },
    eligibility: { type: String, default: '' },
    description: { type: String, default: '' },
    intake: { type: Number },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);
