const env = require('./config/env');
const connectDB = require('./config/db');
const app = require('./app');

(async () => {
  try {
    await connectDB();
    const server = app.listen(env.port, () => {
      console.log(`API listening on :${env.port} (${env.nodeEnv})`); // eslint-disable-line no-console
    });
    const shutdown = () => server.close(() => process.exit(0));
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    console.error('Failed to start server:', err.message); // eslint-disable-line no-console
    process.exit(1);
  }
})();
