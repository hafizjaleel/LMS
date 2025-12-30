import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import {
  createLessonSchema,
  createLessonResponseSchema,
  updateLessonSchema,
  updateLessonResponseSchema,
  lessonIdParamSchema,
  errorResponseSchema,
  lessonPaginationQuerySchema,
  listLessonsResponseSchema,
  getLessonResponseSchema,
  deleteLessonResponseSchema,
  markLessonCompletedSchema,
  markLessonCompletedResponseSchema,
  createLessonCommentSchema,
  createLessonCommentResponseSchema,
  listLessonCommentsQuerySchema,
  listLessonCommentsResponseSchema,
  commentIdParamSchema,
  lessonCommentResponseSchema,
  updateLessonCommentSchema,
  updateLessonCommentResponseSchema,
  deleteLessonCommentResponseSchema,
  videoUploadResponseSchema,
  requestVideoUploadSchema,
} from "./validation";

export const createLessonRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Lessons - Admin"],
  security: [{ Bearer: [] }, { cookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createLessonSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: createLessonResponseSchema,
        },
      },
      description: "Lesson created successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Bad request - invalid input or files not found",
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
      description: "Module not found",
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

export const updateLessonRoute = createRoute({
  method: "put",
  path: "/{id}",
  tags: ["Lessons - Admin"],
  security: [{ Bearer: [] }, { cookieAuth: [] }],
  request: {
    params: lessonIdParamSchema,
    body: {
      content: {
        "application/json": {
          schema: updateLessonSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: updateLessonResponseSchema,
        },
      },
      description: "Lesson updated successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Bad request - invalid input or files not found",
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
      description: "Lesson not found",
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

export const listLessonsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Lessons"],
  security: [{ Bearer: [] }, { cookieAuth: [] }],
  request: {
    query: lessonPaginationQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: listLessonsResponseSchema,
        },
      },
      description: "Lessons retrieved successfully with pagination",
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
      description: "Module not found",
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

export const getLessonByIdRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Lessons"],
  security: [{ Bearer: [] }, { cookieAuth: [] }],
  request: {
    params: lessonIdParamSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: getLessonResponseSchema,
        },
      },
      description: "Lesson retrieved successfully with files",
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
      description: "Lesson not found",
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

export const deleteLessonRoute = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["Lessons - Admin"],
  security: [{ Bearer: [] }, { cookieAuth: [] }],
  request: {
    params: lessonIdParamSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: deleteLessonResponseSchema,
        },
      },
      description: "Lesson and associated files soft deleted successfully",
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
      description: "Lesson not found",
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

export const markLessonCompletedRoute = createRoute({
  method: "post",
  path: "/completed",
  tags: ["Lessons"],
  security: [{ Bearer: [] }, { cookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: markLessonCompletedSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: markLessonCompletedResponseSchema,
        },
      },
      description: "Lesson marked as completed successfully",
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
      description: "Lesson not found",
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
export const createLessonCommentRoute = createRoute({
  method: "post",
  path: "/comments",
  tags: ["Lesson Comments"],
  security: [{ Bearer: [] }, { cookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createLessonCommentSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: createLessonCommentResponseSchema,
        },
      },
      description: "Comment created successfully",
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
      description: "Lesson not found",
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

export const listLessonCommentsRoute = createRoute({
  method: "get",
  path: "/comments",
  tags: ["Lesson Comments"],
  security: [{ Bearer: [] }, { cookieAuth: [] }],
  request: {
    query: listLessonCommentsQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: listLessonCommentsResponseSchema,
        },
      },
      description: "Comments retrieved successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Bad request - invalid query parameters",
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
      description: "Lesson not found",
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

export const getLessonCommentRoute = createRoute({
  method: "get",
  path: "/comments/{id}",
  tags: ["Lesson Comments"],
  security: [{ Bearer: [] }, { cookieAuth: [] }],
  request: {
    params: commentIdParamSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: lessonCommentResponseSchema,
            message: z.string(),
          }),
        },
      },
      description: "Comment retrieved successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Bad request - invalid ID",
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
      description: "Comment not found",
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

export const updateLessonCommentRoute = createRoute({
  method: "put",
  path: "/comments/{id}",
  tags: ["Lesson Comments"],
  security: [{ Bearer: [] }, { cookieAuth: [] }],
  request: {
    params: commentIdParamSchema,
    body: {
      content: {
        "application/json": {
          schema: updateLessonCommentSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: updateLessonCommentResponseSchema,
        },
      },
      description: "Comment updated successfully",
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
    403: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Forbidden - you don't have permission to update this comment",
    },
    404: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Comment not found",
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

export const deleteLessonCommentRoute = createRoute({
  method: "delete",
  path: "/comments/{id}",
  tags: ["Lesson Comments"],
  security: [{ Bearer: [] }, { cookieAuth: [] }],
  request: {
    params: commentIdParamSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: deleteLessonCommentResponseSchema,
        },
      },
      description: "Comment deleted successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Bad request - invalid ID",
    },
    401: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Unauthorized - authentication required",
    },
    403: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Forbidden - you don't have permission to delete this comment",
    },
    404: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Comment not found",
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

export const requestVideoUploadRoute = createRoute({
  method: "post",
  path: "/video/upload-url",
  tags: ["Lessons - Admin"],
  security: [{ Bearer: [] }, { cookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: requestVideoUploadSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: videoUploadResponseSchema,
        },
      },
      description: "Video upload URL created successfully",
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

// Mux webhook route (no auth required)
export const muxWebhookRoute = createRoute({
  method: "post",
  path: "/webhooks/mux",
  tags: ["Webhooks"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            type: z.string().openapi({
              description: "Webhook event type",
              example: "video.asset.ready",
            }),
            data: z.any().openapi({
              description: "Webhook event data",
            }),
          }),
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean().openapi({
              description: "Indicates if webhook was processed successfully",
              example: true,
            }),
          }),
        },
      },
      description: "Webhook processed successfully",
    },
    500: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean().openapi({
              example: false,
            }),
          }),
        },
      },
      description: "Webhook processing failed",
    },
  },
});