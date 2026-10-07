const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sport: { type: mongoose.Schema.Types.ObjectId, ref: 'Sport', required: true },
    tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    captain: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    coach: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Team', teamSchema);
