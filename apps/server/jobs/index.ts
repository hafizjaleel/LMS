import { logger } from "../src/lib/logger";
import { startWebinarReminderCron } from "./webinar-reminder";

/**
 * Initializes all cron jobs. Currently, only the webinar reminder job is initialized.
 */
export const initJobs = () => {
    logger.info('Initializing cron jobs...')
    startWebinarReminderCron()
    logger.info('Cron jobs initialized')
}