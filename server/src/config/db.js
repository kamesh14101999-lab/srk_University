const mongoose = require('mongoose');
const { mongoUri } = require('./env');

async function connectDB() {
  if (!mongoUri) {
    throw new Error('MONGO_URI is not set. Add it to server/.env');
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri);
  // eslint-disable-next-line no-console
  console.log(`[db] Connected to MongoDB: ${mongoose.connection.name}`);
}

module.exports = connectDB;
