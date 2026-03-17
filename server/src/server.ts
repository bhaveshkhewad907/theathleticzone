import dotenv from "dotenv";
dotenv.config(); // MUST be first

import app from "./app";
import connectDB from "./config/db";
import seedAdmin from "./config/seedAdmin";

import { seedPricing } from "./config/seedPricing";
import { initCronJobs } from "./jobs/cron";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  initCronJobs();
  await seedPricing();
  await seedAdmin();

  app.listen(Number(PORT), () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();
