import { type Context } from "hono";
import { ZodError } from "zod";
import {
  createCourseSchema,
  enrollCourseSchema,
  markCourseCompletedSchema,
  updateCourseSchema,
} from "./validation";
import { 
  createCourseService, 
  deleteCourseService, 
  enrollCourseService, 
  getCourseAdminService, 
  getCourseUserService, 
  listCoursesAdminService, 
  listCoursesUserService,
  listEnrollmentsService,
  markCourseCompletedService,
  updateCourseService 
} from "./service";
import { logger } from "../../lib/logger";

/**
 * Handles an HTTP request to create a course.
 *
 * The request body must contain the following properties:
 * - title: The course title.
 * - description: The course description.
 * - isFree: Whether the course is free.
 * - price: The course price (required if isFree is false).
 * - thumbnailFileId: The UUID of the thumbnail file after upload.
 * - level: The course level.
 * - language: The course language.
 * - status: The course status.
 * - mentorIds: An array of mentor user IDs to be assigned to the course.
 *
 * The response will contain the following properties:
 * - success: A boolean indicating if the operation was successful.
 * - data: The created course object.
 * - message: A string indicating the result of the operation.
 *
 * If the request body is invalid, a 400 response will be returned with an error message.
 * If an error occurs during the creation process, a 500 response will be returned with an error message.
 */
export const createCourseController = async (c: Context) => {
  try {
    const body = await c.req.json();
    const validatedData = createCourseSchema.parse(body);

    const course = await createCourseService(validatedData);

    return c.json(
      {
        success: true,
        data: course,
        message: "Course created successfully",
      },
      201
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return c.json(
        {
          success: false,
          error: error.issues[0]?.message ?? "Validation Error",
        },
        400
      );
    }
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      500
    );
  }
};

/**
 * Updates a course with the given ID.
 *
 * The request body must contain the course fields to be updated.
 * The request body will be validated against the updateCourseSchema.
 *
 * If the course is not found, a 404 response will be returned with an error message.
 * If the request body is invalid, a 400 response will be returned with an error message.
 * If an error occurs during the update process, a 500 response will be returned with an error message.
 *
 * @returns A JSON response with the following format:
 * {
 *   success: boolean,
 *   data: Course,
 *   message: string
 * }
 */
export const updateCourseController = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    const validatedData = updateCourseSchema.parse(body);

    const course = await updateCourseService(id, validatedData);

    if (!course) {
      return c.json(
        {
          success: false,
          error: "Course not found",
        },
        404
      );
    }

    return c.json(
      {
        success: true,
        data: course,
        message: "Course updated successfully",
      },
      200
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return c.json(
        {
          success: false,
          error: error.issues[0]?.message ?? "Validation Error",
        },
        400
      );
    }
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      500
    );
  }
};

/**
 * Handles an HTTP request to delete a course.
 *
 * The request must contain the course ID in the path parameter.
 *
 * The response will contain the following properties:
 * - success: A boolean indicating if the operation was successful.
 * - message: A string indicating the result of the operation.
 *
 * If the course is not found, a 404 response will be returned with an error message.
 * If an error occurs during the deletion process, a 500 response will be returned with an error message.
 */
export const deleteCourseController = async (c: Context) => {
  try {
    const { id } = c.req.param();

    const deleted = await deleteCourseService(id);

    if (!deleted) {
      return c.json(
        {
          success: false,
          error: "Course not found",
        },
        404
      );
    }

    return c.json(
      {
        success: true,
        message: "Course deleted successfully",
      },
      200
    );
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      500
    );
  }
};

/**
 * Handles an HTTP request to retrieve a course with full details (including modules, lessons, quizzes)
 *
 * The request body must contain the following properties:
 * - id: The course ID.
 *
 * The response will contain the following properties:
 * - success: A boolean indicating if the operation was successful.
 * - data: The retrieved course object.
 * - message: A string indicating the result of the operation.
 *
 * If the course is not found, a 404 response will be returned with an error message.
 * If an error occurs during the retrieval process, a 500 response will be returned with an error message.
 */
export const getCourseAdminController = async (c: Context) => {
  try {
    const { id } = c.req.param();

    const course = await getCourseAdminService(id);

    if (!course) {
      return c.json(
        {
          success: false,
          error: "Course not found",
        },
        404
      );
    }

    return c.json(
      {
        success: true,
        data: course,
        message: "Course retrieved successfully",
      },
      200
    );
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      500
    );
  }
};

/**
 * Handles an HTTP request to retrieve a course by its ID.
 *
 * The request must contain the course ID in the path parameter.
 *
 * The response will contain the following properties:
 * - success: A boolean indicating if the operation was successful.
 * - data: The retrieved course object.
 * - message: A string indicating the result of the operation.
 *
 * If the course is not found, a 404 response will be returned with an error message.
 * If an error occurs during the retrieval process, a 500 response will be returned with an error message.
 */
export const getCourseUserController = async (c: Context) => {
  try {
    const { id } = c.req.param();
    // Get user ID from authentication context
    const userId = c.get("user")?.id; // Adjust based on your auth implementation

    const course = await getCourseUserService(id, userId);

    if (!course) {
      return c.json(
        {
          success: false,
          error: "Course not found",
        },
        404
      );
    }

    return c.json(
      {
        success: true,
        data: course,
        message: "Course retrieved successfully",
      },
      200
    );
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      500
    );
  }
};

/**
 * Retrieves a list of courses for the admin view.
 * The list can be filtered by search term, course level, and course status.
 * The response will include pagination information (page, limit, total pages, total items)
 * and a list of courses with their details (id, title, description, price, level, status, modules, lessons, quizzes)
 * If an error occurs during the retrieval process, a 500 response will be returned with an error message.
 */

export const listCoursesAdminController = async (c: Context) => {
  try {
    console.warn("Hitting<<<<<<<<<<<<<<<<")
    const query = c.req.query();
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const search = query.search;
    const level = query.level as "beginner" | "intermediate" | "advanced" | undefined;
    const status = query.status as "published" | "on_hold" | "draft" | undefined;
    const isFree = query.isFree === "true" ? true : query.isFree === "false" ? false : undefined;

    
    const result = await listCoursesAdminService({
      page,
      limit,
      search,
      level,
      status,
      isFree,
    });

    return c.json(
      {
        success: true,
        data: result,
      },
      200
    );
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      500
    );
  }
};

/**
 * Retrieves a list of courses for a user with pagination and filtering options.
 *
 * The response will include pagination information (page, limit, total pages, total items)
 * and a list of courses with their details (id, title, description, price, level, status, modules, lessons, quizzes)
 * If an error occurs during the retrieval process, a 500 response will be returned with an error message.
 *
 * @param {Context} c - The Hono context object
 * @returns {Promise<void>} - A promise that resolves to a JSON response
 */
export const listCoursesUserController = async (c: Context) => {
  try {
    const query = c.req.query();
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const search = query.search;
    const level = query.level as "beginner" | "intermediate" | "advanced" | undefined;
    const status = query.status as "published" | "on_hold" | "draft" | undefined;
    const isFree = query.isFree === "true" ? true : query.isFree === "false" ? false : undefined;
    
    // Get user ID from authentication context
    const userId = c.get("user")?.id;

    const result = await listCoursesUserService({
      page,
      limit,
      search,
      level,
      status,
      isFree,
      userId,
    });
    
    return c.json(
      {
        success: true,
        data: result,
      },
      200
    );
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      500
    );
  }
};

/**
 * Handles an HTTP request to enroll a user in a free course.
 *
 * The request body must contain:
 * - courseId: The ID of the course to enroll in.
 *
 * The response will contain:
 * - success: A boolean indicating if the operation was successful.
 * - data: The enrollment and progress records.
 * - message: A string indicating the result of the operation.
 *
 * If the course is not free, a 400 response will be returned.
 * If the course is not found, a 404 response will be returned.
 * If the user is already enrolled, a 409 response will be returned.
 * If an error occurs during enrollment, a 500 response will be returned.
 */
export const enrollCourseController = async (c: Context) => {
  try {
    const body = await c.req.json();
    const validatedData = enrollCourseSchema.parse(body);

    const result = await enrollCourseService(validatedData.userId, validatedData.courseId);

    return c.json(
      {
        success: true,
        data: result,
        message: "Successfully enrolled in the course",
      },
      201
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Course not found") {
        return c.json(
          {
            success: false,
            error: error.message,
          },
          404
        );
      }
      if (error.message === "This course is not free. Payment is required.") {
        return c.json(
          {
            success: false,
            error: error.message,
          },
          400
        );
      }
      if (error.message === "You are already enrolled in this course") {
        return c.json(
          {
            success: false,
            error: error.message,
          },
          409
        );
      }
    }
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      500
    );
  }
};

/**
 * Lists enrollments based on user role.
 * Admin users see all enrollments with user details and can filter by userId.
 * Regular users see only their own enrollments.
 * Supports pagination and filters for free/paid courses and completion status.
 */
export const listEnrollmentsController = async (c: Context) => {
  try {
    const query = c.req.query();
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const isFree = query.isFree === "true" ? true : query.isFree === "false" ? false : undefined;
    const isCompleted = query.isCompleted === "true" ? true : query.isCompleted === "false" ? false : undefined;
    const filterUserId = query.userId; // Admin can filter by specific userId

    // Get user from authentication context
    const authUser = c.get("user");
    
    if (!authUser?.id) {
      return c.json(
        {
          success: false,
          error: "User not authenticated",
        },
        401
      );
    }

    const result = await listEnrollmentsService({
      page,
      limit,
      isFree,
      isCompleted,
      userId: filterUserId,
      requestingUserId: authUser?.id,
      userRole: authUser?.role || "user",
    });

    return c.json(
      {
        success: true,
        data: result,
      },
      200
    );
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      500
    );
  }
};

/**
 * Handles an HTTP request to mark a course as completed.
 *
 * The request body must contain:
 * - userId: The ID of the user completing the course
 * - courseId: The ID of the course to mark as completed
 *
 * The response will contain:
 * - success: A boolean indicating if the operation was successful
 * - data: The course progress and certificate information
 * - message: A string indicating the result of the operation
 *
 * If the request body is invalid, a 400 response will be returned with an error message.
 * If the user is not enrolled or has not completed all lessons, a 400 response will be returned.
 * If the course is already completed, a 409 response will be returned.
 * If an error occurs during the process, a 500 response will be returned with an error message.
 */
export const markCourseCompletedController = async (c: Context) => {
  try {
    const body = await c.req.json();
    const validatedData = markCourseCompletedSchema.parse(body);
    const { userId, courseId } = validatedData;

    const result = await markCourseCompletedService(userId, courseId);

    return c.json(
      {
        success: true,
        data: result,
        message: "Course marked as completed and certificate generated successfully",
      },
      200
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return c.json(
        {
          success: false,
          error: error.issues[0]?.message ?? "Validation Error",
        },
        400
      );
    }

    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    
    // Handle specific error cases
    if (errorMessage.includes("not enrolled")) {
      return c.json(
        {
          success: false,
          error: errorMessage,
        },
        404
      );
    }
    
    if (errorMessage.includes("already completed")) {
      return c.json(
        {
          success: false,
          error: errorMessage,
        },
        409
      );
    }
    
    if (errorMessage.includes("not completed all lessons")) {
      return c.json(
        {
          success: false,
          error: errorMessage,
        },
        400
      );
    }

    return c.json(
      {
        success: false,
        error: errorMessage,
      },
      500
    );
  }
};
