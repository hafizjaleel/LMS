import { createRoute, z } from "@hono/zod-openapi";
import {
  createCourseSchema,
  createCourseResponseSchema,
  updateCourseSchema,
  updateCourseResponseSchema,
  courseIdParamSchema,
  getCourseAdminResponseSchema,
  getCourseUserResponseSchema,
  paginationQuerySchema,
  listCoursesAdminResponseSchema,
  listCoursesUserResponseSchema,
  enrollCourseSchema,
  enrollCourseResponseSchema,
  enrollmentQuerySchema,
  listEnrollmentsResponseSchema,
  errorResponseSchema,
  markCourseCompletedSchema,
  markCourseCompletedResponseSchema,
} from "./validation";

export const createCourseRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Courses - Admin"],
  security: [{ Bearer: [] }, { cookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createCourseSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: createCourseResponseSchema,
        },
      },
      description: "Course created successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Bad request - invalid input",
    },
    401: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Unauthorized - authentication required",
    },
    409: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Conflict - course slug already exists",
    },
    500: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Internal server error",
    },
  },
});

export const updateCourseRoute = createRoute({
  method: "put",
  path: "/{id}",
  tags: ["Courses - Admin"],
  security: [{ Bearer: [] }, { cookieAuth: [] }],
  request: {
    params: courseIdParamSchema,
    body: {
      content: {
        "application/json": {
          schema: updateCourseSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: updateCourseResponseSchema,
        },
      },
      description: "Course updated successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Bad request - invalid input",
    },
    401: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Unauthorized - authentication required",
    },
    404: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Course not found",
    },
    409: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Conflict - course slug already exists",
    },
    500: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Internal server error",
    },
  },
});

export const deleteCourseRoute = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["Courses - Admin"],
  security: [{ Bearer: [] }, { cookieAuth: [] }],
  request: {
    params: courseIdParamSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean().openapi({
              description: "Indicates if the operation was successful",
              example: true,
            }),
            message: z.string().openapi({
              description: "Success message",
              example: "Course deleted successfully",
            }),
          }),
        },
      },
      description: "Course deleted successfully",
    },
    401: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Unauthorized - authentication required",
    },
    404: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Course not found",
    },
    500: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Internal server error",
    },
  },
});

export const getCourseAdminRoute = createRoute({
  method: "get",
  path: "/admin/{id}",
  tags: ["Courses - Admin"],
  security: [{ Bearer: [] }, { cookieAuth: [] }],
  request: {
    params: courseIdParamSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: getCourseAdminResponseSchema,
        },
      },
      description: "Course retrieved successfully (Admin view)",
    },
    401: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Unauthorized - authentication required",
    },
    404: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Course not found",
    },
    500: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Internal server error",
    },
  },
});

export const getCourseUserRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Courses"],
  security: [{ Bearer: [] }, { cookieAuth: [] }],
  request: {
    params: courseIdParamSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: getCourseUserResponseSchema,
        },
      },
      description: "Course retrieved successfully with enrollment and progress information",
    },
    401: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Unauthorized - authentication required",
    },
    404: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Course not found",
    },
    500: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Internal server error",
    },
  },
});

export const listCoursesAdminRoute = createRoute({
  method: "get",
  path: "/admin",
  tags: ["Courses - Admin"],
  security: [{ Bearer: [] }, { cookieAuth: [] }],
  request: {
    query: paginationQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: listCoursesAdminResponseSchema,
        },
      },
      description: "Courses retrieved successfully (Admin view)",
    },
    401: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Unauthorized - authentication required",
    },
    500: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Internal server error",
    },
  },
});

export const listCoursesUserRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Courses"],
  security: [{ Bearer: [] }, { cookieAuth: [] }],
  request: {
    query: paginationQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: listCoursesUserResponseSchema,
        },
      },
      description: "Courses retrieved successfully with enrollment and progress information",
    },
    401: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Unauthorized - authentication required",
    },
    500: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Internal server error",
    },
  },
});

export const enrollCourseRoute = createRoute({
  method: "post",
  path: "/enroll",
  tags: ["Courses"],
  security: [{ Bearer: [] }, { cookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: enrollCourseSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: enrollCourseResponseSchema,
        },
      },
      description: "Successfully enrolled in the course",
    },
    400: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Bad request - course is not free or invalid course ID",
    },
    401: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Unauthorized - authentication required",
    },
    404: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Course not found",
    },
    409: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Conflict - already enrolled in this course",
    },
    500: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Internal server error",
    },
  },
});

export const listEnrollmentsRoute = createRoute({
  method: "get",
  path: "/enrollments",
  tags: ["Courses"],
  security: [{ Bearer: [] }, { cookieAuth: [] }],
  request: {
    query: enrollmentQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: listEnrollmentsResponseSchema,
        },
      },
      description: "Enrollments retrieved successfully. Admin users see all enrollments with user details. Regular users see only their own enrollments.",
    },
    401: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Unauthorized - authentication required",
    },
    500: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Internal server error",
    },
  },
});

export const courseCompleteRoute = createRoute({
  method: "post",
  path: "/complete",
  tags: ["Courses"],
  security: [{ Bearer: [] }, { cookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: markCourseCompletedSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: markCourseCompletedResponseSchema,
        },
      },
      description: "Course completed successfully",
    },
    401: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Unauthorized - authentication required",
    },
    500: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Internal server error",
    },  
  }
});