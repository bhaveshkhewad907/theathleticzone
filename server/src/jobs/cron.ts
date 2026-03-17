import cron from "node-cron";
import { processSessionLifecycle } from "./sessionCompletion.job";
import { processSubscriptionExpirations } from "../modules/liveSubscription/liveSubscription.service";
import { logger } from "../utils/logger";

export const initCronJobs = () => {
  cron.schedule("*/5 * * * *", async () => {
    const startTime = performance.now();
    logger.info("Initializing Background Sweep", {
      event: "CRON_START",
      service: "CronHub",
    });

    try {
      const sessionReport = await processSessionLifecycle();
      const subReport = await processSubscriptionExpirations();

      const executionTimeMs = Math.round(performance.now() - startTime);

      logger.info("Background Sweep Completed", {
        event: "CRON_SUCCESS",
        service: "CronHub",
        executionTimeMs,
        sessionTransitions: sessionReport,
        subscriptionsExpired: subReport.modifiedCount,
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
