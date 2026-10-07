const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    studentId: { type: String, required: true, unique: true, trim: true },
    rollNumber: { type: String, required: true, unique: true, trim: true },
    photoUrl: { type: String, default: '' },
    dob: { type: Date, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    guardianName: { type: String, default: '' },
    guardianPhone: { type: String, default: '' },
    emergencyContact: { type: String, default: '' },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
      default: '',
    },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    year: { type: Number, required: true },
    semester: { type: Number, required: true },
    section: { type: String, required: true, index: true },
    admissionYear: { type: Number },
    batch: { type: String, default: '' },
    academicStatus: {
      type: String,
      enum: ['active', 'detained', 'graduated', 'dropped'],
      default: 'active',
    },
    remarks: [
      {
        teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
        text: { type: String },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

studentSchema.index({ department: 1, course: 1, year: 1, semester: 1, section: 1 });

module.exports = mongoose.model('Student', studentSchema);
