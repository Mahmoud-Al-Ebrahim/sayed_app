import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { seedAdminAndDefaults } from './bootstrap/seedAdmin.js';
import { startOrderStatusCheckJob } from './services/orderStatusCheck.service.js';

async function start() {
  await connectDB();
  await seedAdminAndDefaults();

  // Start the background job to check order statuses
  startOrderStatusCheckJob();

  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port} [${env.nodeEnv}]`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
