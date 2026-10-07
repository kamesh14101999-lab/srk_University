const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '' },
    facultyCoordinator: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    studentCoordinator: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    activities: [
      {
        title: { type: String, required: true },
        date: { type: Date },
        description: { type: String, default: '' },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Club', clubSchema);
