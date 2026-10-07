const mongoose = require('mongoose');

const universityInfoSchema = new mongoose.Schema(
  {
    overview: { type: String, default: '' },
    history: { type: String, default: '' },
    vision: { type: String, default: '' },
    mission: { type: String, default: '' },
    objectives: { type: String, default: '' },
    leadership: [
      {
        name: { type: String },
        designation: { type: String },
        message: { type: String },
        photoUrl: { type: String, default: '' },
      },
    ],
    address: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    mapEmbedUrl: { type: String, default: '' },
    accreditation: { type: String, default: '' },
    affiliation: { type: String, default: '' },
    approvals: { type: String, default: '' },
    placementInfo: { type: String, default: '' },
    studentSupport: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('UniversityInfo', universityInfoSchema);
