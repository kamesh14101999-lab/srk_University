const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    semester: { type: Number, required: true },
    credits: { type: Number, required: true },
    type: { type: String, enum: ['theory', 'lab', 'elective'], default: 'theory' },
  },
  { timestamps: true }
);

subjectSchema.index({ course: 1, semester: 1 });

module.exports = mongoose.model('Subject', subjectSchema);
