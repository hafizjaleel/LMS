import { drizzle } from "drizzle-orm/neon-http";
import { neon, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { env } from "../config/env";
import { logger } from "../lib/logger";
import {
  user,
  account,
  accountRelations,
  session,
  sessionRelations,
  userRelations,
  verification,
  pushSubscriptions,
} from "./schema/auth";
import {
  courseCertificates,
  courses,
  courseCertificatesRelations,
  courseLevelEnum,
  courseWatchedLessonsRelations,
  courseMentors,
  courseMentorsRelations,
  courseProgress,
  courseProgressRelations,
  courseStatusEnum,
  courseWatchedLessons,
  reviews,
  coursesRelations,
  reviewsRelations,

} from "./schema/course";

import { enrollments, enrollmentsRelations } from "./schema/enrollment";
import {
  lessonComments,
  lessonCommentsRelations,
  lessonTypeEnum,
  lessons,
  lessonsRelations,
  lessonFiles, lessonFilesRelations,
} from "./schema/lessons";
import { modules, modulesRelations } from "./schema/modules";
import {
  quizAnswers,
  quizAnswersRelations,
  quizAttempts,
  quizAttemptsRelations,
  quizOptions,
  quizOptionsRelations,
  quizQuestions,
  quizQuestionsRelations,
  quizzes,
  quizzesRelations,
} from "./schema/quiz";
import { files, filesRelations } from "./schema/files"
import { webinars } from "./schema/webinar";

const schema = {
  user,
  account,
  accountRelations,
  session,
  sessionRelations,
  userRelations,
  verification,
  courseCertificates,
  courses,
  courseCertificatesRelations,
  courseLevelEnum,
  courseWatchedLessonsRelations,
  courseMentors,
  courseMentorsRelations,
  courseProgress,
  courseProgressRelations,
  courseStatusEnum,
  courseWatchedLessons,
  reviews,
  coursesRelations,
  reviewsRelations,
  enrollments,
  enrollmentsRelations,
  lessonComments,
  lessonCommentsRelations,
  lessonTypeEnum,
  lessons,
  lessonsRelations,
  modules,
  modulesRelations,
  quizAnswers,
  quizAnswersRelations,
  quizAttempts,
  quizAttemptsRelations,
  quizOptions,
  quizOptionsRelations,
  quizQuestions,
  quizQuestionsRelations,
  quizzes,
  quizzesRelations,
  lessonFiles,
  lessonFilesRelations,
  files,
  filesRelations,
  pushSubscriptions,
  webinars
};

neonConfig.webSocketConstructor = ws;

neonConfig.poolQueryViaFetch = true;
const sql = neon(env.DATABASE_URL);
export const db = drizzle(sql, {
  schema,
  logger: env.NODE_ENV === "development",
});
export async function testDatabaseConnection() {
  try {
    await sql`SELECT 1`;
    logger.info("Database connected successfully");
    return true;
  } catch (error) {
    logger.error({ error }, "Database connection failed");
    throw error;
  }
}
