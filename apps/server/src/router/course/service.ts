import { db } from "../../db";
import { courses, courseMentors, courseProgress, courseWatchedLessons, courseCertificates, reviews } from "../../db/schema/course";
import { enrollments } from "../../db/schema/enrollment";
import { modules } from "../../db/schema/modules";
import {  lessonComments, lessonFiles, lessons } from "../../db/schema/lessons";
import { quizzes, quizQuestions, quizOptions, quizAnswers, quizAttempts } from "../../db/schema/quiz";
import { files } from "../../db/schema/files";
import { user } from "../../db/schema/auth";
import { eq, count, and, like, isNull } from "drizzle-orm";
import { generateSlug, generateUniqueSlug } from "../../utils/slug";
import { documentStorage } from "../../config/upload";
import type { ListCoursesParams } from "../../types/courses";
import type z from "zod";
import type { createCourseSchema, updateCourseSchema } from "./validation";
import { generateCertificateHTML, generateCertificateId, generatePDF } from "../../lib/certificate-generater";


/**
 * Creates a course with the given data.
 *
 * The function generates a unique slug from the title and checks for existing slugs.
 * If a slug already exists, it generates a new unique slug.
 *
 * It then inserts the course data into the database and returns the created course object.
 *
 * The function also inserts the mentor IDs into the courseMentors table and returns the created mentor objects.
 *
 * @param {z.infer<typeof createCourseSchema>} data - The course data to be created.
 * @returns {Promise<Course>} - The created course object.
 */
export const createCourseService = async (data: z.infer<typeof createCourseSchema>) => {

    const {
      title,
      description,
      isFree,
      price,
      thumbnailFileId,
      level,
      language,
      status,
      mentorIds,
    } = data;

    if (!isFree && !price) {
      throw new Error("Price is required if isFree is false");
    }

    // Generate slug from title
    const baseSlug = generateSlug(title);

    // Check for existing slugs
    const existingCourses = await db
      .select({ slug: courses.slug })
      .from(courses)
      .where(like(courses.slug, `${baseSlug}%`));


    const existingSlugs = existingCourses.map((c) => c.slug);
    const slug = generateUniqueSlug(baseSlug, existingSlugs);

    const [course] = await db
      .insert(courses)
      .values({
        title,
        slug,
        description: description || null,
        isFree,
        price: isFree ? null : (price || null),
        thumbnailFileId: thumbnailFileId || null,
        level,
        language,
        status,
      })
      .returning();
    console.log("Created course:", course);
    const mentorsData = mentorIds.map((mentorId) => ({
      courseId: course.id,
      mentorId,
    }));

    const insertedMentors = await db
      .insert(courseMentors)
      .values(mentorsData)
      .returning();

    console.log("Inserted mentors:", insertedMentors);
    let thumbnailUrl: string | null = null;
    if (course.thumbnailFileId) {
      const [thumbnailFile] = await db
        .select()
        .from(files)
        .where(eq(files.id, course.thumbnailFileId))
        .limit(1);
      console.log("Thumbnail file record:", thumbnailFile);
      if (thumbnailFile && !thumbnailFile.deletedAt) {
        thumbnailUrl = await documentStorage.getSignedUrl(thumbnailFile.key);
      }

    }

    return {
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      isFree: course.isFree,
      price: course.price,
      thumbnail: thumbnailUrl,
      level: course.level,
      language: course.language,
      status: course.status,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
      enrolledCount: 0,
      mentors: insertedMentors.map((mentor) => ({
        id: mentor.id,
        mentorId: mentor.mentorId,
        courseId: mentor.courseId,
      })),
    };
};

/**
 * Updates a course with the given data.
 *
 * The function checks if the course exists, and if the title is being updated,
 * it generates a new unique slug. It then updates the course data in the database.
 *
 * If mentorIds are provided, it deletes existing course-mentor relationships
 * and inserts new ones.
 *
 * @param {string} id - The ID of the course to update.
 * @param {z.infer<typeof updateCourseSchema>} data - The course data to update.
 * @returns {Promise<Course | null>} - The updated course object or null if not found.
 */
export const updateCourseService = async (id: string, data: z.infer<typeof updateCourseSchema>) => {
  const [existingCourse] = await db
    .select()
    .from(courses)
    .where(eq(courses.id, id))
    .limit(1);

  if (!existingCourse) {
    return null;
  }

  const updateData: Partial<typeof courses.$inferInsert> = {};

  if (data.title && data.title !== existingCourse.title) {
    const baseSlug = generateSlug(data.title);


    const existingCourses = await db
      .select({ slug: courses.slug })
      .from(courses);

    const existingSlugs = existingCourses
      .filter((c) => c.slug !== existingCourse.slug)
      .map((c) => c.slug);

    const slug = generateUniqueSlug(baseSlug, existingSlugs);

    updateData.title = data.title;
    updateData.slug = slug;
  }


  if (data.description !== undefined) updateData.description = data.description || null;
  if (data.isFree !== undefined) updateData.isFree = data.isFree;
  if (data.price !== undefined) updateData.price = data.price || null;
  if (data.thumbnailFileId !== undefined) updateData.thumbnailFileId = data.thumbnailFileId || null;
  if (data.level !== undefined) updateData.level = data.level;
  if (data.language !== undefined) updateData.language = data.language;
  if (data.status !== undefined) updateData.status = data.status;

  const [updatedCourse] = await db
    .update(courses)
    .set(updateData)
    .where(eq(courses.id, id))
    .returning();

  let updatedMentors: typeof courseMentors.$inferSelect[] = [];
  if (data.mentorIds) {
    await db.delete(courseMentors).where(eq(courseMentors.courseId, id));

    if (data.mentorIds.length > 0) {
      const mentorsData = data.mentorIds.map((mentorId) => ({
        courseId: id,
        mentorId,
      }));

      updatedMentors = await db
        .insert(courseMentors)
        .values(mentorsData)
        .returning();
    }
  } else {
    updatedMentors = await db
      .select()
      .from(courseMentors)
      .where(eq(courseMentors.courseId, id));
  }

  const [enrollmentCount] = await db
    .select({ count: count() })
    .from(enrollments)
    .where(eq(enrollments.courseId, id));

  const enrolledCount = enrollmentCount?.count || 0;

  let thumbnailUrl: string | null = null;
  if (updatedCourse.thumbnailFileId) {
    const [thumbnailFile] = await db
      .select()
      .from(files)
      .where(eq(files.id, updatedCourse.thumbnailFileId))
      .limit(1);

    if (thumbnailFile && !thumbnailFile.deletedAt) {
      thumbnailUrl = await documentStorage.getSignedUrl(thumbnailFile.key);
    }
  }

  return {
    id: updatedCourse.id,
    title: updatedCourse.title,
    slug: updatedCourse.slug,
    description: updatedCourse.description,
    isFree: updatedCourse.isFree,
    price: updatedCourse.price,
    thumbnail: thumbnailUrl,
    level: updatedCourse.level,
    language: updatedCourse.language,
    status: updatedCourse.status,
    createdAt: updatedCourse.createdAt.toISOString(),
    updatedAt: updatedCourse.updatedAt.toISOString(),
    enrolledCount,
    mentors: updatedMentors.map((mentor) => ({
      id: mentor.id,
      mentorId: mentor.mentorId,
      courseId: mentor.courseId,
    })),
  };
};

/**
 * Soft deletes a course and all its related data by setting the deletedAt timestamp.
 * Also deletes the thumbnail file from cloud storage if it exists.
 *
 * @param {string} id - The ID of the course to delete.
 * @returns {Promise<boolean>} - Returns true if the course was deleted, false if not found.
 */
export const deleteCourseService = async (id: string) => {
  const [existingCourse] = await db
    .select()
    .from(courses)
    .where(eq(courses.id, id))
    .limit(1);

  if (!existingCourse) {
    return false;
  }

  const deletedAt = new Date();


  const courseModules = await db
    .select()
    .from(modules)
    .where(eq(modules.courseId, id));


  for (const module of courseModules) {

    const moduleLessons = await db
      .select()
      .from(lessons)
      .where(eq(lessons.moduleId, module.id));

    for (const lesson of moduleLessons) {

      const lessonFilesData = await db
        .select()
        .from(lessonFiles)
        .where(eq(lessonFiles.lessonId, lesson.id));


      for (const lessonFile of lessonFilesData) {
        const [fileRecord] = await db
          .select()
          .from(files)
          .where(eq(files.id, lessonFile.fileId))
          .limit(1);

        if (fileRecord) {
          try {
            await documentStorage.deleteDocument(fileRecord.key);

            await db
              .update(files)
              .set({ deletedAt })
              .where(eq(files.id, fileRecord.id));
          } catch (error) {
            throw new Error(`Failed to delete lesson file from cloud storage:` + error);

          }
        }
      }


      await db
        .update(lessonFiles)
        .set({ deletedAt })
        .where(eq(lessonFiles.lessonId, lesson.id));


      await db
        .update(lessonComments)
        .set({ deletedAt })
        .where(eq(lessonComments.lessonId, lesson.id));
    }


    await db
      .update(lessons)
      .set({ deletedAt })
      .where(eq(lessons.moduleId, module.id));


    const moduleQuizzes = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.moduleId, module.id));

    for (const quiz of moduleQuizzes) {

      const quizQuestionsData = await db
        .select()
        .from(quizQuestions)
        .where(eq(quizQuestions.quizId, quiz.id));

      for (const question of quizQuestionsData) {

        await db
          .update(quizOptions)
          .set({ deletedAt })
          .where(eq(quizOptions.questionId, question.id));
      }


      await db
        .update(quizQuestions)
        .set({ deletedAt })
        .where(eq(quizQuestions.quizId, quiz.id));
    }


    await db
      .update(quizzes)
      .set({ deletedAt })
      .where(eq(quizzes.moduleId, module.id));

    await db
      .update(modules)
      .set({ deletedAt })
      .where(eq(modules.courseId, id));
  }


  await db
    .update(courseWatchedLessons)
    .set({ deletedAt })
    .where(eq(courseWatchedLessons.courseId, id));

  await db
    .update(courseCertificates)
    .set({ deletedAt })
    .where(eq(courseCertificates.enrollmentId, id));

  await db
    .update(reviews)
    .set({ deletedAt })
    .where(eq(reviews.courseId, id));

  if (existingCourse.thumbnailFileId) {
    const [thumbnailFile] = await db
      .select()
      .from(files)
      .where(eq(files.id, existingCourse.thumbnailFileId))
      .limit(1);

    if (thumbnailFile) {
      try {
        await documentStorage.deleteDocument(thumbnailFile.key);
        await db
          .update(files)
          .set({ deletedAt })
          .where(eq(files.id, existingCourse.thumbnailFileId));
      } catch (error) {
        throw new Error("Failed to delete thumbnail from cloud storage:" + error);
      }
    }
  }

  await db
    .update(courses)
    .set({ deletedAt })
    .where(eq(courses.id, id));

  return true;
};

/**
 * Gets full course details for admin view including all modules, lessons, files, and quizzes.
 * 
 * @param {string} id - The ID of the course to retrieve.
 * @returns {Promise<Course | null>} - The course object with all nested data or null if not found.
 */
export const getCourseAdminService = async (id: string) => {
  const [course] = await db
    .select()
    .from(courses)
    .where(eq(courses.id, id))
    .limit(1);

  if (!course || course.deletedAt) {
    return null;
  }

  const [enrollmentCount] = await db
    .select({ count: count() })
    .from(enrollments)
    .where(eq(enrollments.courseId, id));

  const enrolledCount = enrollmentCount?.count || 0;

  // Fetch mentors with details
  const mentorsList = await db
    .select({
      id: courseMentors.id,
      mentorId: courseMentors.mentorId,
      mentorName: user.name,
      mentorAvatar: user.image,
      avatarFileId: user.avatarFileId,
    })
    .from(courseMentors)
    .innerJoin(user, eq(courseMentors.mentorId, user.id))
    .where(eq(courseMentors.courseId, id));

  const mentorsWithAvatars = await Promise.all(
    mentorsList.map(async (mentor) => {
      let avatarUrl: string | null = mentor.mentorAvatar;
      if (mentor.avatarFileId) {
        const [avatarFile] = await db
          .select()
          .from(files)
          .where(eq(files.id, mentor.avatarFileId))
          .limit(1);

        if (avatarFile && !avatarFile.deletedAt) {
          avatarUrl = await documentStorage.getSignedUrl(avatarFile.key);
        }
      }

      return {
        id: mentor.id,
        mentorId: mentor.mentorId,
        name: mentor.mentorName,
        avatar: avatarUrl,
      };
    })
  );

  let thumbnailUrl: string | null = null;
  if (course.thumbnailFileId) {
    const [thumbnailFile] = await db
      .select()
      .from(files)
      .where(eq(files.id, course.thumbnailFileId))
      .limit(1);

    if (thumbnailFile && !thumbnailFile.deletedAt) {
      thumbnailUrl = await documentStorage.getSignedUrl(thumbnailFile.key);
    }
  }

  const courseModules = await db
    .select()
    .from(modules)
    .where(eq(modules.courseId, id));

  const modulesData = await Promise.all(
    courseModules
      .filter(module => !module.deletedAt)
      .map(async (module) => {
        const moduleLessons = await db
          .select()
          .from(lessons)
          .where(eq(lessons.moduleId, module.id));

        const lessonsData = await Promise.all(
          moduleLessons
            .filter(lesson => !lesson.deletedAt)
            .map(async (lesson) => {
              const lessonFilesData = await db
                .select()
                .from(lessonFiles)
                .where(eq(lessonFiles.lessonId, lesson.id));

              const filesData = await Promise.all(
                lessonFilesData
                  .filter(lf => !lf.deletedAt)
                  .map(async (lessonFile) => {
                    const [fileRecord] = await db
                      .select()
                      .from(files)
                      .where(eq(files.id, lessonFile.fileId))
                      .limit(1);

                    if (fileRecord && !fileRecord.deletedAt) {
                      const fileUrl = await documentStorage.getSignedUrl(fileRecord.key);
                      return {
                        id: fileRecord.id,
                        url: fileUrl,
                        key: fileRecord.key,
                        originalFilename: fileRecord.originalFilename,
                        fileSize: fileRecord.fileSize,
                        mimeType: fileRecord.mimeType,
                      };
                    }
                    return null;
                  })
              );

              return {
                id: lesson.id,
                title: lesson.title,
                lessonType: lesson.lessonType,
                lessonOrder: lesson.lessonOrder,
                files: filesData.filter(f => f !== null),
              };
            })
        );
        const moduleQuizzes = await db
          .select()
          .from(quizzes)
          .where(eq(quizzes.moduleId, module.id));

        const quizzesData = await Promise.all(
          moduleQuizzes
            .filter(quiz => !quiz.deletedAt)
            .map(async (quiz) => {
              const quizQuestionsData = await db
                .select()
                .from(quizQuestions)
                .where(eq(quizQuestions.quizId, quiz.id));

              const questionsData = await Promise.all(
                quizQuestionsData
                  .filter(q => !q.deletedAt)
                  .map(async (question) => {
                    const questionOptions = await db
                      .select()
                      .from(quizOptions)
                      .where(eq(quizOptions.questionId, question.id));

                    const optionsData = questionOptions
                      .filter(opt => !opt.deletedAt)
                      .map((option) => ({
                        id: option.id,
                        optionText: option.optionText,
                        isCorrect: option.isCorrect,
                      }));

                    return {
                      id: question.id,
                      questionText: question.questionText,
                      questionOrder: question.questionOrder,
                      options: optionsData,
                    };
                  })
              );

              return {
                id: quiz.id,
                title: quiz.title,
                instructions: quiz.instructions,
                questions: questionsData,
              };
            })
        );

        return {
          id: module.id,
          title: module.title,
          moduleOrder: module.moduleOrder,
          lessons: lessonsData,
          quizzes: quizzesData,
        };
      })
  );

  return {
    id: course.id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    isFree: course.isFree,
    price: course.price,
    thumbnail: thumbnailUrl,
    level: course.level,
    language: course.language,
    status: course.status,
    createdAt: course.createdAt.toISOString(),
    updatedAt: course.updatedAt.toISOString(),
    enrolledCount,
    mentors: mentorsWithAvatars,
    modules: modulesData,
  };
};

/**
 * Gets course details for user view including enrollment and progress information.
 * 
 * @param {string} id - The ID of the course to retrieve.
 * @param {string} userId - The ID of the user viewing the course (optional).
 * @returns {Promise<Course | null>} - The course object with enrollment data or null if not found.
 */
export const getCourseUserService = async (id: string, userId?: string) => {
  const [course] = await db
    .select()
    .from(courses)
    .where(eq(courses.id, id))
    .limit(1);

  if (!course || course.deletedAt) {
    return null;
  }

  // Fetch mentors with details
  const mentorsList = await db
    .select({
      id: courseMentors.id,
      mentorId: courseMentors.mentorId,
      mentorName: user.name,
      mentorAvatar: user.image,
      avatarFileId: user.avatarFileId,
    })
    .from(courseMentors)
    .innerJoin(user, eq(courseMentors.mentorId, user.id))
    .where(eq(courseMentors.courseId, id));

  const mentorsWithAvatars = await Promise.all(
    mentorsList.map(async (mentor) => {
      let avatarUrl: string | null = mentor.mentorAvatar;
      if (mentor.avatarFileId) {
        const [avatarFile] = await db
          .select()
          .from(files)
          .where(eq(files.id, mentor.avatarFileId))
          .limit(1);

        if (avatarFile && !avatarFile.deletedAt) {
          avatarUrl = await documentStorage.getSignedUrl(avatarFile.key);
        }
      }

      return {
        id: mentor.id,
        mentorId: mentor.mentorId,
        name: mentor.mentorName,
        avatar: avatarUrl,
      };
    })
  );

  let thumbnailUrl: string | null = null;
  if (course.thumbnailFileId) {
    const [thumbnailFile] = await db
      .select()
      .from(files)
      .where(eq(files.id, course.thumbnailFileId))
      .limit(1);

    if (thumbnailFile && !thumbnailFile.deletedAt) {
      thumbnailUrl = await documentStorage.getSignedUrl(thumbnailFile.key);
    }
  }

  let enrollmentData = null;
  if (userId) {
    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(and(
        eq(enrollments.courseId, id),
        eq(enrollments.userId, userId)
      ))
      .limit(1);

    if (enrollment) {
      const [progress] = await db
        .select()
        .from(courseProgress)
        .where(eq(courseProgress.enrollmentId, enrollment.id))
        .limit(1);

      enrollmentData = {
        id: enrollment.id,
        enrolledAt: enrollment.enrolledAt.toISOString(),
        progress: progress ? {
          progressPercent: progress.progressPercent,
          isCompleted: progress.isCompleted,
          completedAt: progress.completedAt ? progress.completedAt.toISOString() : null,
        } : null,
      };
    }
  }

  return {
    id: course.id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    isFree: course.isFree,
    price: course.price,
    thumbnail: thumbnailUrl,
    level: course.level,
    language: course.language,
    status: course.status,
    createdAt: course.createdAt.toISOString(),
    updatedAt: course.updatedAt.toISOString(),
    mentors: mentorsWithAvatars,
    enrollment: enrollmentData,
  };
};

/**
 * Lists all courses for admin view with pagination and filters.
 * 
 * @param {ListCoursesParams} params - Pagination and filter parameters.
 * @returns {Promise<{courses: Course[], pagination: object}>} - List of courses with pagination metadata.
 */
export const listCoursesAdminService = async (params: ListCoursesParams) => {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const offset = (page - 1) * limit;

  const conditions = [isNull(courses.deletedAt)];

  if (params.search) {
    conditions.push(like(courses.title, `%${params.search}%`));
  }

  if (params.level) {
    conditions.push(eq(courses.level, params.level));
  }

  if (params.status) {
    conditions.push(eq(courses.status, params.status));
  }

  if (params.isFree !== undefined) {
    conditions.push(eq(courses.isFree, params.isFree));
  }

  const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

  const [totalCount] = await db
    .select({ count: count() })
    .from(courses)
    .where(whereClause);

  const total = totalCount?.count || 0;
  const totalPages = Math.ceil(total / limit);

  const coursesList = await db
    .select()
    .from(courses)
    .where(whereClause)
    .limit(limit)
    .offset(offset)
    .orderBy(courses.createdAt);

  console.log("Admin Service - Raw coursesList:", JSON.stringify(coursesList, null, 2));

  const coursesData = await Promise.all(
    coursesList.map(async (course) => {
      const [enrollmentCount] = await db
        .select({ count: count() })
        .from(enrollments)
        .where(eq(enrollments.courseId, course.id));

      const enrolledCount = enrollmentCount?.count || 0;

      let thumbnailUrl: string | null = null;
      if (course.thumbnailFileId) {
        const [thumbnailFile] = await db
          .select()
          .from(files)
          .where(eq(files.id, course.thumbnailFileId))
          .limit(1);

        if (thumbnailFile && !thumbnailFile.deletedAt) {
          thumbnailUrl = await documentStorage.getSignedUrl(thumbnailFile.key);
        }
      }

      // Fetch mentors with details
      const mentorsList = await db
        .select({
          id: courseMentors.id,
          mentorId: courseMentors.mentorId,
          mentorName: user.name,
          mentorAvatar: user.image,
          avatarFileId: user.avatarFileId,
        })
        .from(courseMentors)
        .innerJoin(user, eq(courseMentors.mentorId, user.id))
        .where(eq(courseMentors.courseId, course.id));

      const mentorsWithAvatars = await Promise.all(
        mentorsList.map(async (mentor) => {
          let avatarUrl: string | null = mentor.mentorAvatar;
          if (mentor.avatarFileId) {
            const [avatarFile] = await db
              .select()
              .from(files)
              .where(eq(files.id, mentor.avatarFileId))
              .limit(1);

            if (avatarFile && !avatarFile.deletedAt) {
              avatarUrl = await documentStorage.getSignedUrl(avatarFile.key);
            }
          }

          return {
            id: mentor.id,
            mentorId: mentor.mentorId,
            name: mentor.mentorName,
            avatar: avatarUrl,
          };
        })
      );

      const courseData = {
        id: course.id,
        title: course.title,
        slug: course.slug,
        description: course.description,
        isFree: course.isFree,
        price: course.price,
        thumbnail: thumbnailUrl,
        level: course.level,
        language: course.language,
        status: course.status,
        createdAt: course.createdAt.toISOString(),
        updatedAt: course.updatedAt.toISOString(),
        enrolledCount,
        totalRating: course.totalRating || "0",
        mentors: mentorsWithAvatars,
      };

      console.log("Admin Service - Single course data:", JSON.stringify(courseData, null, 2));
      return courseData;
    })
  );

  console.log("Admin Service - Final coursesData:", JSON.stringify(coursesData, null, 2));

  const result = {
    courses: coursesData,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };

  console.log("Admin Service - Final result:", JSON.stringify(result, null, 2));

  return result;
};

/**
 * Lists all courses for user view with pagination, filters, and enrollment/progress data.
 * 
 * @param {ListCoursesParams & {userId?: string}} params - Pagination, filter parameters, and userId.
 * @returns {Promise<{courses: Course[], pagination: object}>} - List of courses with enrollment data and pagination metadata.
 */
export const listCoursesUserService = async (params: ListCoursesParams & { userId?: string }) => {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const offset = (page - 1) * limit;

  const conditions = [
    isNull(courses.deletedAt),
    eq(courses.status, "published"),
  ];

  if (params.search) {
    conditions.push(like(courses.title, `%${params.search}%`));
  }

  if (params.level) {
    conditions.push(eq(courses.level, params.level));
  }

  if (params.isFree !== undefined) {
    conditions.push(eq(courses.isFree, params.isFree));
  }

  const whereClause = and(...conditions);
  console.log("whereClause", params)
  const [totalCount] = await db
    .select({ count: count() })
    .from(courses)
    .where(whereClause);

  const total = totalCount?.count || 0;
  const totalPages = Math.ceil(total / limit);

  const coursesList = await db
    .select()
    .from(courses)
    .where(whereClause)
    .limit(limit)
    .offset(offset)
    .orderBy(courses.createdAt);

  console.log("coursesList", coursesList)
  const coursesData = await Promise.all(
    coursesList.map(async (course) => {
      let thumbnailUrl: string | null = null;
      if (course.thumbnailFileId) {
        const [thumbnailFile] = await db
          .select()
          .from(files)
          .where(eq(files.id, course.thumbnailFileId))
          .limit(1);

        if (thumbnailFile && !thumbnailFile.deletedAt) {
          thumbnailUrl = await documentStorage.getSignedUrl(thumbnailFile.key);
        }
      }

      let enrollmentData = null;
      if (params.userId) {
        const [enrollment] = await db
          .select()
          .from(enrollments)
          .where(and(
            eq(enrollments.courseId, course.id),
            eq(enrollments.userId, params.userId)
          ))
          .limit(1);

        if (enrollment) {
          const [progress] = await db
            .select()
            .from(courseProgress)
            .where(eq(courseProgress.enrollmentId, enrollment.id))
            .limit(1);

          enrollmentData = {
            id: enrollment.id,
            enrolledAt: enrollment.enrolledAt.toISOString(),
            progress: progress ? {
              progressPercent: progress.progressPercent,
              isCompleted: progress.isCompleted,
              completedAt: progress.completedAt ? progress.completedAt.toISOString() : null,
            } : null,
          };
        }
      }

      return {
        id: course.id,
        title: course.title,
        slug: course.slug,
        description: course.description,
        isFree: course.isFree,
        price: course.price,
        thumbnail: thumbnailUrl,
        level: course.level,
        language: course.language,
        totalRating: course.totalRating || "0",
        enrollment: enrollmentData,
      };
    })
  );

  return {
    courses: coursesData,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

/**
 * Enrolls a user in a free course and creates initial progress record.
 * 
 * @param {string} userId - The ID of the user enrolling.
 * @param {string} courseId - The ID of the course to enroll in.
 * @returns {Promise<{enrollment, progress}>} - The enrollment and progress records.
 * @throws {Error} - If the course is not free, not found, or user is already enrolled.
 */
export const enrollCourseService = async (userId: string, courseId: string) => {
  // Check if course exists and is free
  const [course] = await db
    .select()
    .from(courses)
    .where(and(
      eq(courses.id, courseId),
      isNull(courses.deletedAt)
    ))
    .limit(1);

  if (!course) {
    throw new Error("Course not found");
  }

  if (!course.isFree) {
    throw new Error("This course is not free. Payment is required.");
  }

  // Check if user is already enrolled
  const [existingEnrollment] = await db
    .select()
    .from(enrollments)
    .where(and(
      eq(enrollments.userId, userId),
      eq(enrollments.courseId, courseId)
    ))
    .limit(1);

  if (existingEnrollment) {
    throw new Error("You are already enrolled in this course");
  }

  // Create enrollment
  const [enrollment] = await db
    .insert(enrollments)
    .values({
      userId,
      courseId,
    })
    .returning();

  // Create course progress record with 0% progress
  const [progress] = await db
    .insert(courseProgress)
    .values({
      enrollmentId: enrollment.id,
      courseId,
      progressPercent: 0,
      isCompleted: false,
    })
    .returning();

  return {
    enrollment: {
      id: enrollment.id,
      userId: enrollment.userId,
      courseId: enrollment.courseId,
      enrolledAt: enrollment.enrolledAt.toISOString(),
    },
    progress: {
      id: progress.id,
      progressPercent: progress.progressPercent,
      isCompleted: progress.isCompleted,
    },
  };
};

/**
 * Lists enrollments based on user role.
 * Admin users see all enrollments with user details.
 * Regular users see only their own enrollments.
 * 
 * @param {object} params - Pagination, filter parameters, userId, and role.
 * @returns {Promise<{enrollments: array, pagination: object}>} - List of enrollments with pagination.
 */
export const listEnrollmentsService = async (params: {
  page: number;
  limit: number;
  isFree?: boolean;
  isCompleted?: boolean;
  userId?: string;
  requestingUserId: string;
  userRole: string;
}) => {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const offset = (page - 1) * limit;
  const isAdmin = params.userRole === "admin";

  const conditions = [];


  if (!isAdmin) {
    conditions.push(eq(enrollments.userId, params.requestingUserId));
  } else if (params.userId) {
    conditions.push(eq(enrollments.userId, params.userId));
  }

  if (params.isFree !== undefined) {
    conditions.push(eq(courses.isFree, params.isFree));
  }

  if (params.isCompleted !== undefined) {
    conditions.push(eq(courseProgress.isCompleted, params.isCompleted));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;


  const [totalCount] = await db
    .select({ count: count() })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .leftJoin(courseProgress, eq(courseProgress.enrollmentId, enrollments.id))
    .where(whereClause);

  const total = totalCount?.count || 0;
  const totalPages = Math.ceil(total / limit);

  const enrollmentsList = await db
    .select({
      enrollmentId: enrollments.id,
      enrolledAt: enrollments.enrolledAt,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userAvatar: user.image,
      userAvatarFileId: user.avatarFileId,
      courseId: courses.id,
      courseTitle: courses.title,
      courseSlug: courses.slug,
      courseIsFree: courses.isFree,
      coursePrice: courses.price,
      courseThumbnailFileId: courses.thumbnailFileId,
      courseLevel: courses.level,
      courseLanguage: courses.language,
      progressPercent: courseProgress.progressPercent,
      progressIsCompleted: courseProgress.isCompleted,
      progressCompletedAt: courseProgress.completedAt,
    })
    .from(enrollments)
    .innerJoin(user, eq(enrollments.userId, user.id))
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .leftJoin(courseProgress, eq(courseProgress.enrollmentId, enrollments.id))
    .where(whereClause)
    .limit(limit)
    .offset(offset)
    .orderBy(enrollments.enrolledAt);

  const enrollmentsData = await Promise.all(
    enrollmentsList.map(async (enrollment) => {

      let userAvatarUrl: string | null = enrollment.userAvatar;
      if (enrollment.userAvatarFileId) {
        const [avatarFile] = await db
          .select()
          .from(files)
          .where(eq(files.id, enrollment.userAvatarFileId))
          .limit(1);

        if (avatarFile && !avatarFile.deletedAt) {
          userAvatarUrl = await documentStorage.getSignedUrl(avatarFile.key);
        }
      }


      let thumbnailUrl: string | null = null;
      if (enrollment.courseThumbnailFileId) {
        const [thumbnailFile] = await db
          .select()
          .from(files)
          .where(eq(files.id, enrollment.courseThumbnailFileId))
          .limit(1);

        if (thumbnailFile && !thumbnailFile.deletedAt) {
          thumbnailUrl = await documentStorage.getSignedUrl(thumbnailFile.key);
        }
      }

      const enrollmentData: any = {
        id: enrollment.enrollmentId,
        enrolledAt: enrollment.enrolledAt.toISOString(),
        course: {
          id: enrollment.courseId,
          title: enrollment.courseTitle,
          slug: enrollment.courseSlug,
          isFree: enrollment.courseIsFree,
          price: enrollment.coursePrice,
          thumbnail: thumbnailUrl,
          level: enrollment.courseLevel,
          language: enrollment.courseLanguage,
        },
        progress: enrollment.progressPercent !== null ? {
          progressPercent: enrollment.progressPercent,
          isCompleted: enrollment.progressIsCompleted || false,
          completedAt: enrollment.progressCompletedAt ? enrollment.progressCompletedAt.toISOString() : null,
        } : null,
      };

      if (isAdmin) {
        enrollmentData.user = {
          id: enrollment.userId,
          name: enrollment.userName,
          email: enrollment.userEmail,
          avatar: userAvatarUrl,
        };
      }

      return enrollmentData;
    })
  );

  return {
    enrollments: enrollmentsData,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};


/**
 * Marks a course as completed and generates a certificate for the user.
 * 
 * @param {string} userId - The ID of the user marking the course as completed.
 * @param {string} courseId - The ID of the course to mark as completed.
 * @returns {Promise<{success: boolean, data: {courseProgress: CourseProgress, certificate: CourseCertificate}, message: string}>}
 * - The response object containing the success status, course progress and certificate data, and a message.
 * @throws {Error} - If the course or user is not found, or if the course is already completed.
 */
export const markCourseCompletedService = async (userId: string, courseId: string) => {
  // Fetch course data
  const [course] = await db
    .select()
    .from(courses)
    .where(and(eq(courses.id, courseId), isNull(courses.deletedAt)))
    .limit(1);

  // Fetch user data
  const [userData] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!course) {
    throw new Error("Course not found");
  }

  if (!userData) {
    throw new Error("User not found");
  }

  // Fetch enrollment
  const [enrollment] = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)))
    .limit(1);

  if (!enrollment) {
    throw new Error("Enrollment not found");
  }

  // Check if certificate already exists
  const [existingCertificate] = await db
    .select()
    .from(courseCertificates)
    .where(and(
      eq(courseCertificates.enrollmentId, enrollment.id),
      isNull(courseCertificates.deletedAt)
    ))
    .limit(1);

  if (existingCertificate) {
    throw new Error("Certificate already issued for this course");
  }

  // Fetch all lessons for the course
  const lessonsData = await db
    .select({ id: lessons.id })
    .from(lessons)
    .innerJoin(modules, eq(lessons.moduleId, modules.id))
    .where(and(
      eq(modules.courseId, courseId),
      isNull(lessons.deletedAt),
      isNull(modules.deletedAt)
    ));

  // Check if all lessons are completed
  let isCompleted = true;
  for (const lesn of lessonsData) {
    const [existingRecord] = await db
      .select()
      .from(courseWatchedLessons)
      .where(and(
        eq(courseWatchedLessons.lessonId, lesn.id),
        eq(courseWatchedLessons.userId, userId),
        isNull(courseWatchedLessons.deletedAt)
      ))
      .limit(1);

    if (!existingRecord) {
      isCompleted = false;
      break;
    }
  }

  if (!isCompleted) {
    throw new Error("All lessons must be completed before generating certificate");
  }

  // Update course progress
  const [courseProgressData] = await db
    .update(courseProgress)
    .set({
      progressPercent: 100,
      isCompleted: true,
      completedAt: new Date()
    })
    .where(eq(courseProgress.enrollmentId, enrollment.id))
    .returning();

  // Generate unique certificate ID
  const certificateId = generateCertificateId(courseId, userId);

  // Generate certificate HTML
  const html = generateCertificateHTML({
    courseName: course.title,
    userName: userData.name,
    completedAt: courseProgressData?.completedAt ?? new Date(),
    certificateId: certificateId
  });

// Generate PDF
const pdfBuffer = await generatePDF(html);

 // Create a proper ArrayBuffer copy
  const arrayBuffer = new ArrayBuffer(pdfBuffer.length);
  const view = new Uint8Array(arrayBuffer);
  view.set(pdfBuffer);
  
  // Create File object for upload
  const fileName = `certificate-${certificateId}.pdf`;
  const pdfFile = new globalThis.File([arrayBuffer], fileName, { 
    type: 'application/pdf',
    lastModified: Date.now()
  });
// Upload to R2
const uploadResult = await documentStorage.uploadDocument(pdfFile, {
  userId: userId,
  documentType: 'certificate',
  version: 1
});
  // Save file record to database
  const [fileRecord] = await db
    .insert(files)
    .values({
      key: uploadResult.key,
      originalFilename: uploadResult.originalFilename,
      storedFilename: uploadResult.storedFilename,
      filePath: uploadResult.filePath,
      fileSize: uploadResult.fileSize,
      mimeType: uploadResult.mimeType,
      checksum: uploadResult.checksum,
      documentType: 'certificate',
      userId: userId,
    })
    .returning();

  // Save certificate record
  const [certificate] = await db
    .insert(courseCertificates)
    .values({
      enrollmentId: enrollment.id,
      certificateNumber: certificateId,
      certificateFileId: fileRecord.id,
      createdBy: userId,
      issuedAt: new Date(),
    })
    .returning();

  // Generate signed URL for immediate access
  const certificateUrl = await documentStorage.getSignedUrl(uploadResult.key, 3600);

  // Return response matching the schema
  return {
      courseProgress: {
        id: courseProgressData.id,
        enrollmentId: courseProgressData.enrollmentId,
        courseId: courseId,
        progressPercent: courseProgressData.progressPercent,
        isCompleted: courseProgressData.isCompleted,
        completedAt: courseProgressData.completedAt?.toISOString() ?? new Date().toISOString(),
      },
      certificate: {
        id: certificate.id,
        certificateNumber: certificate.certificateNumber,
        certificateFileId: certificate.certificateFileId,
        certificateUrl: certificateUrl,
        issuedAt: certificate.issuedAt.toISOString(),
      },
    };
};