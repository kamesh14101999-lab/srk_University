const mongoose = require('mongoose');

const clusterActivitySchema = new mongoose.Schema(
  {
    clusterName: { type: String, required: true, trim: true },
    activityName: { type: String, required: true, trim: true },
    activityType: { type: String, default: '' },
    date: { type: Date },
    venue: { type: String, default: '' },
    organizer: { type: String, default: '' },
    departments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    winners: [
      {
        position: { type: String },
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
      },
    ],
    results: { type: String, default: '' },
    certificateUrls: [{ type: String }],
    photoUrls: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('ClusterActivity', clusterActivitySchema);
