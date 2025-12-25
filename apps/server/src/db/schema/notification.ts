import { boolean, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { relations } from "drizzle-orm";

export const notificationTypeEnum = pgEnum('notification_type', [
  'course_enrollment',
  'assignment_due',
  'assignment_graded',
  'course_update',
  'new_announcement',
  'comment',
  'certificate_issued',
  'deadline_reminder',
  'review',
  'live_session_starting',
  'course_completed'
]);

export const notificationPriorityEnum = pgEnum('notification_priority', [
  'low',
  'medium',
  'high',
  'urgent'
]);

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  notificationType: notificationTypeEnum('notification_type').notNull(),
  firstMessage: text('message').notNull(),
  secondMessage: text('secondary_message'),
  link: text('link'),
  priority: notificationPriorityEnum('priority').notNull(),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(user, {
    fields: [notifications.userId],
    references: [user.id],
  }),
}));