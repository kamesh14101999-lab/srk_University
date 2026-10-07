const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sport: { type: mongoose.Schema.Types.ObjectId, ref: 'Sport', required: true },
    startDate: { type: Date },
    endDate: { type: Date },
    venue: { type: String, default: '' },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed'],
      default: 'upcoming',
    },
    winnerTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Tournament', tournamentSchema);
