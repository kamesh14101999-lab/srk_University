const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: [
        'library',
        'hostel',
        'lab',
        'transport',
        'cafeteria',
        'medical',
        'sports',
        'auditorium',
        'computer_lab',
      ],
      required: true,
    },
    description: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Facility', facilitySchema);
