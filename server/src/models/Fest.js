const mongoose = require('mongoose');

const festSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    year: { type: Number, required: true, index: true },
    description: { type: String, default: '' },
    startDate: { type: Date },
    endDate: { type: Date },
    venue: { type: String, default: '' },
    programs: [
      {
        title: { type: String, required: true },
        category: { type: String, enum: ['cultural', 'technical', 'sports'] },
        date: { type: Date },
        venue: { type: String },
      },
    ],
    registrationOpen: { type: Boolean, default: false },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    winners: [
      {
        program: { type: String },
        position: { type: String },
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
        teamName: { type: String },
      },
    ],
    galleryUrls: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Fest', festSchema);
