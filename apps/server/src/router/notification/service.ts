import { eq, and, isNull } from 'drizzle-orm';
import { user } from '../../db/schema/auth';
import { db } from '../../db';
import { logger } from '../../lib/logger';
import { notificationPriorityEnum, notifications, notificationTypeEnum } from '../../db/schema/notification';
import { generateEmailTemplate, sendNotificationEmail } from '../../lib/email';

export interface SendNotificationParams {
  userId: string;
  notificationType: typeof notificationTypeEnum.enumValues[number];
  firstMessage: string;
  secondMessage?: string;
  link?: string;
  priority: typeof notificationPriorityEnum.enumValues[number];
  // Email-specific data (optional)
 metadata?: Record<string, string | number | boolean | Date>;

}

function generateEmailMetadata(
  notificationType: string,
  firstMessage: string,
  secondMessage: string | undefined,
  link: string | undefined,
  priority: string,
  metadata?: Record<string, any>
) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const fullLink = link ? `${baseUrl}${link}` : baseUrl;

  // Map notification type to email template configuration
  const emailConfigs: Record<string, {
    subject: string;
    title: string;
    message: string;
    highlightText?: string;
    highlightSubtext?: string;
    buttonText: string;
    alertType: 'info' | 'warning' | 'success' | 'error';
    alertMessage?: string;
    footerMessage?: string;
  }> = {
    course_enrollment: {
      subject: metadata?.courseName ? `Welcome to ${metadata.courseName}` : 'Course Enrollment Successful',
      title: 'Course Enrollment Successful',
      message: firstMessage,
      highlightText: metadata?.courseName ? `Course: ${metadata.courseName}` : undefined,
      buttonText: 'Go to Course',
      alertType: 'success',
      footerMessage: 'Happy learning! If you have any questions, feel free to reach out.',
    },
    assignment_due: {
      subject: metadata?.assignmentName ? `Assignment Due: ${metadata.assignmentName}` : 'Assignment Due Soon',
      title: 'Assignment Due Soon',
      message: firstMessage,
      highlightText: metadata?.dueDate ? `Due: ${new Date(metadata.dueDate).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}` : secondMessage,
      buttonText: 'View Assignment',
      alertType: 'warning',
      alertMessage: 'Make sure to submit your work before the deadline to avoid late penalties.',
    },
    assignment_graded: {
      subject: metadata?.assignmentName ? `Assignment Graded: ${metadata.assignmentName}` : 'Assignment Graded',
      title: 'Assignment Graded',
      message: firstMessage,
      highlightText: metadata?.grade ? `Grade: ${metadata.grade}` : secondMessage,
      highlightSubtext: metadata?.feedback || undefined,
      buttonText: 'View Details',
      alertType: 'success',
      footerMessage: 'Keep up the great work!',
    },
    course_update: {
      subject: metadata?.courseName ? `Update: ${metadata.courseName}` : 'Course Update',
      title: 'Course Update',
      message: firstMessage,
      highlightText: metadata?.courseName ? `Course: ${metadata.courseName}` : undefined,
      buttonText: 'View Course',
      alertType: 'info',
    },
    new_announcement: {
      subject: metadata?.title ? `New Announcement: ${metadata.title}` : 'New Announcement',
      title: 'New Announcement',
      message: metadata?.content || firstMessage,
      highlightText: metadata?.title || firstMessage,
      buttonText: 'View Full Announcement',
      alertType: 'info',
    },
    comment: {
      subject: 'New Comment',
      title: 'New Comment',
      message: firstMessage,
      highlightText: metadata?.commentAuthor ? `From: ${metadata.commentAuthor}` : undefined,
      highlightSubtext: secondMessage,
      buttonText: 'View Comment',
      alertType: 'info',
    },
    certificate_issued: {
      subject: metadata?.courseName ? `Certificate Issued: ${metadata.courseName}` : 'Certificate Issued',
      title: 'Certificate Issued',
      message: firstMessage,
      highlightText: 'Certificate of Completion',
      highlightSubtext: metadata?.courseName || undefined,
      buttonText: 'Download Certificate',
      alertType: 'success',
      footerMessage: 'Share your achievement with your network!',
    },
    deadline_reminder: {
      subject: metadata?.itemName ? `Reminder: ${metadata.itemName}` : 'Deadline Reminder',
      title: 'Deadline Reminder',
      message: firstMessage,
      highlightText: metadata?.deadline ? `Deadline: ${new Date(metadata.deadline).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}` : secondMessage,
      buttonText: 'View Details',
      alertType: 'warning',
      alertMessage: priority === 'urgent' ? 'This is an urgent reminder. Please take action immediately.' : undefined,
    },
    review: {
      subject: 'Review Request',
      title: 'Review Request',
      message: firstMessage,
      highlightText: metadata?.itemName || undefined,
      buttonText: 'Leave a Review',
      alertType: 'info',
    },
    live_session_starting: {
      subject: metadata?.sessionName ? `Live Session Starting: ${metadata.sessionName}` : 'Live Session Starting Soon',
      title: 'Live Session Starting Soon',
      message: firstMessage,
      highlightText: metadata?.startTime ? `Starting: ${new Date(metadata.startTime).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}` : secondMessage,
      buttonText: 'Join Session',
      alertType: 'warning',
      alertMessage: 'The session will begin in a few minutes. Make sure you have a stable internet connection.',
    },
    course_completed: {
      subject: metadata?.courseName ? `Congratulations! You completed ${metadata.courseName}` : 'Course Completed',
      title: 'Course Completed',
      message: firstMessage,
      highlightText: 'Course Completed Successfully',
      highlightSubtext: metadata?.courseName || undefined,
      buttonText: 'View Course',
      alertType: 'success',
      footerMessage: 'Continue exploring more courses to expand your knowledge!',
    },
  };

  // Get config for notification type or use default
  const config = emailConfigs[notificationType] || {
    subject: firstMessage,
    title: firstMessage,
    message: secondMessage || firstMessage,
    buttonText: 'View Details',
    alertType: 'info' as const,
  };

  return {
    subject: config.subject,
    title: config.title,
    message: config.message,
    highlightText: config.highlightText,
    highlightSubtext: config.highlightSubtext,
    buttonText: config.buttonText,
    buttonLink: fullLink,
    alertType: config.alertType,
    alertMessage: config.alertMessage,
    footerMessage: config.footerMessage,
  };
}

/**
 * Main notification function - handles in-app and email notifications based on user preferences
 */
export async function sendNotification(params: SendNotificationParams) {
  const {
    userId,
    notificationType,
    firstMessage,
    secondMessage,
    link,
    priority,
    metadata
  } = params;

  try {
    // Fetch user preferences
    const userRecord = await db.query.user.findFirst({
      where: eq(user.id, userId),
      columns: {
        email: true,
        name: true,
        inAppNotificationsEnabled: true,
        emailNotificationsEnabled: true,
        pushNotificationsEnabled: true,
      },
    });

    if (!userRecord) {
      logger.error({ userId }, 'User not found for notification');
      throw new Error(`User with ID ${userId} not found`);
    }

    const results = {
      inApp: false,
      email: false,
      push: false, 
      errors: [] as string[],
    };

    // Save in-app notification if enabled
    if (userRecord.inAppNotificationsEnabled) {
      try {
        await db.insert(notifications).values({
          userId,
          notificationType,
          firstMessage,
          secondMessage,
          link,
          priority,
          isRead: false,
        });
        results.inApp = true;
        logger.info({ userId, notificationType }, 'In-app notification saved');
      } catch (error) {
        const errorMsg = `In-app notification failed: ${error}`;
        results.errors.push(errorMsg);
        logger.error({ error, userId }, 'Failed to save in-app notification');
      }
    }

if (userRecord.emailNotificationsEnabled) {
      try {
        // Auto-generate email metadata from notification data
        const emailData = generateEmailMetadata(
          notificationType,
          firstMessage,
          secondMessage,
          link,
          priority,
          metadata
        );

        // Generate email HTML using the single template
        const { html, text } = generateEmailTemplate({
          userName: userRecord.name,
          ...emailData,
        });

        await sendNotificationEmail({
          to: userRecord.email,
          name: userRecord.name,
          subject: emailData.subject,
          html,
          text,
        });
        
        results.email = true;
        logger.info({ userId, email: userRecord.email }, 'Email notification sent');
      } catch (error) {
        const errorMsg = `Email notification failed: ${error}`;
        results.errors.push(errorMsg);
        logger.error({ error, userId }, 'Failed to send email notification');
      }
    }
     // Push notifications - TODO: Implement push notification logic
    // if (userRecord.pushNotificationsEnabled && pushData) {
    //   try {
    //     await sendPushNotification(userId, pushData);
    //     results.push = true;
    //   } catch (error) {
    //     results.errors.push(`Push notification failed: ${error}`);
    //   }
    // }

    return results;
  } catch (error) {
    logger.error({ error, userId }, 'Notification service error');
    throw error;
  }

}
   


/**
 * Send bulk notifications to multiple users
 */
export async function sendBulkNotifications(
  userIds: string[],
  params: Omit<SendNotificationParams, 'userId'>
) {
  const promises = userIds.map((userId) =>
    sendNotification({ ...params, userId }).catch((error) => ({
      userId,
      error: error.message,
      status: 'rejected',
    }))
  );

  return await Promise.allSettled(promises);
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string, userId: string) {
  await db
    .update(notifications)
    .set({
      isRead: true,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      )
    );
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string) {
  await db
    .update(notifications)
    .set({
      isRead: true,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false),
        isNull(notifications.deletedAt)
      )
    );
}

/**
 * Soft delete notification
 */
export async function deleteNotification(notificationId: string, userId: string) {
  await db
    .update(notifications)
    .set({
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      )
    );
}

