const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    employeeId: { type: String, required: true, unique: true, trim: true },
    photoUrl: { type: String, default: '' },
    phone: { type: String, default: '' },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
    designation: {
      type: String,
      enum: ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Lab Instructor'],
      required: true,
    },
    qualification: { type: String, default: '' },
    specialization: { type: String, default: '' },
    experienceYears: { type: Number, default: 0 },
    joiningDate: { type: Date },
    status: { type: String, enum: ['active', 'on_leave', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Teacher', teacherSchema);
