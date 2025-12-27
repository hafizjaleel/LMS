import cron from "node-cron";
import { and, eq, gt, isNull } from "drizzle-orm";
import { webinarRegistrations, webinars } from "../src/db/schema/webinar";
import { db } from "../src/db";
import { sendNotification } from "../src/router/notification/service";
import { logger } from "../src/lib/logger";

const ONE_MIN = 60 * 1000;
const ONE_HOUR = 60 * ONE_MIN;
const ONE_DAY = 24 * ONE_HOUR;


/**
 * Starts a cron job to send reminders for upcoming webinars.
 *
 * The job queries the database every minute to find webinars that are
 * scheduled to start within the next day, hour, or minute. It then sends
 * notifications to the registered users with the corresponding reminder type.
 *
 * @returns {Promise<void>} - Resolves when the job is started.
 */
export function startWebinarReminderCron() {
  cron.schedule("* * * * *", async () => {
    logger.info("Running webinar reminder job...")
    const now = new Date();

   const upcoming = await db
      .select()
      .from(webinars)
      .where(
        and(
          isNull(webinars.deletedAt),
          gt(webinars.scheduledAt, now)
        )
      );

    for (const webinar of upcoming) {
      const scheduled = new Date(webinar.scheduledAt);
      const diff = scheduled.getTime() - now.getTime();

      let reminderType: "day" | "hour" | "minute" | null = null;

      if (Math.abs(diff - ONE_DAY) <= ONE_MIN) reminderType = "day";
      else if (Math.abs(diff - ONE_HOUR) <= ONE_MIN) reminderType = "hour";
      else if (Math.abs(diff - ONE_MIN) <= ONE_MIN) reminderType = "minute";

      if (!reminderType) continue;

        const regs = await db
        .select()
        .from(webinarRegistrations)
        .where(eq(webinarRegistrations.webinarId, webinar.id));

      for await (const reg of regs) {
              await sendNotification({
          userId: reg.userId,
          notificationType: "live_session_starting",
          priority: reminderType === "minute" ? "urgent" : "medium",
          firstMessage:
            reminderType === "day"
              ? "Webinar starts tomorrow"
              : reminderType === "hour"
              ? "Webinar starts in 1 hour"
              : "Webinar is starting now",
          secondMessage: webinar.title,
          link: `/webinars/${webinar.id}`,
          metadata: {
            sessionName: webinar.title,
            startTime: webinar.scheduledAt
          }
        });
        }
    }
  });
}
