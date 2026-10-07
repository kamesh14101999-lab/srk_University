require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { port } = require('./src/config/env');

async function start() {
  await connectDB();
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] Listening on port ${port}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[server] Failed to start:', err.message);
  process.exit(1);
});
