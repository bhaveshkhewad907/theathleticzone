import cron from "node-cron";
import { logger } from "../utils/logger";

export const initCronJobs = () => {
  // 🚀 Runs every night at midnight (server time)
  cron.schedule("0 0 * * *", async () => {
    const startTime = performance.now();
    logger.info("Initializing Daily Background Sweep", {
      event: "CRON_START",
      service: "CronHub",
    });

    try {
      // TODO (Phase 9): Add logic here to check if 6-week courses have ended
      // to automatically flip athlete statuses back to "NEEDS_ASSESSMENT"

      const executionTimeMs = Math.round(performance.now() - startTime);

      logger.info("Daily Background Sweep Completed", {
        event: "CRON_SUCCESS",
        service: "CronHub",
        executionTimeMs,
        status: "Engine ready for Phase 9 progression loops.",
      });
    } catch (error: any) {
      logger.error("Background Sweep Failed", {
        event: "CRON_FAILURE",
        service: "CronHub",
        error: error.message,
        stack: error.stack,
      });
    }
  });
};
