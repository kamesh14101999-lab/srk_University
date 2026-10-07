const mongoose = require('mongoose');

const clubMemberSchema = new mongoose.Schema(
  {
    club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true, index: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    role: { type: String, enum: ['member', 'coordinator'], default: 'member' },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

clubMemberSchema.index({ club: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('ClubMember', clubMemberSchema);
