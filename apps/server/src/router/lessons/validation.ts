import { z } from "@hono/zod-openapi";

// Error response schema
export const errorResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Indicates if the operation was successful",
    example: false,
  }),
  error: z.string().openapi({
    description: "Error message",
    example: "Invalid input data",
  }),
});

// Create lesson request schema
export const createLessonSchema = z.object({
  moduleId: z.string().uuid().openapi({
    description: "Module ID to which the lesson belongs",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
  userId: z.string().uuid().openapi({
    description: "ID of the user creating the lesson",
    example: "user123-e89b-12d3-a456-426614174000",
  }),
  title: z.string().min(1).max(255).openapi({
    description: "Lesson title",
    example: "Introduction to Variables",
  }),
  description: z.string().min(1).openapi({
    description: "Lesson description",
    example: "Learn about variables and data types in programming",
  }),
  lessonType: z.enum(["video", "pdf", "file", "audio", "text"]).openapi({
    description: "Type of lesson content",
    example: "video",
  }),
  lessonOrder: z.number().int().positive().openapi({
    description: "Order of the lesson in the module",
    example: 1,
  }),
  fileIds: z.array(z.string().uuid()).optional().openapi({
    description: "Array of file IDs to attach to the lesson",
    example: ["456e7890-e89b-12d3-a456-426614174001"],
  }),
   muxUploadId: z.string().optional().openapi({
    description: "Mux upload ID (required for video lessons)",
    example: "upload_abc123",
  }),
});

// Update lesson request schema
export const updateLessonSchema = z.object({
  title: z.string().min(1).max(255).optional().openapi({
    description: "Lesson title",
    example: "Introduction to Variables",
  }),
  description: z.string().min(1).optional().openapi({
    description: "Lesson description",
    example: "Learn about variables and data types in programming",
  }),
  lessonType: z.enum(["video", "pdf", "file", "audio", "text"]).optional().openapi({
    description: "Type of lesson content",
    example: "video",
  }),
  lessonOrder: z.number().int().positive().optional().openapi({
    description: "Order of the lesson in the module",
    example: 1,
  }),
  fileIds: z.array(z.string().uuid()).optional().openapi({
    description: "Array of file IDs to attach to the lesson (replaces existing files)",
    example: ["456e7890-e89b-12d3-a456-426614174001"],
  }),
  muxUploadId: z.string().optional().openapi({
    description: "Mux upload ID (required for video lessons)",
    example: "upload_abc123",
  }),
});

// Lesson ID param schema
export const lessonIdParamSchema = z.object({
  id: z.string().uuid().openapi({
    description: "Lesson ID",
    example: "abc12345-e89b-12d3-a456-426614174000",
    param: {
      name: "id",
      in: "path",
    },
  }),
});

// Lesson file response schema
export const lessonFileResponseSchema = z.object({
  id: z.string().uuid().openapi({
    description: "Lesson file ID",
    example: "def45678-e89b-12d3-a456-426614174000",
  }),
  lessonId: z.string().uuid().openapi({
    description: "Lesson ID",
    example: "abc12345-e89b-12d3-a456-426614174000",
  }),
  fileId: z.string().uuid().openapi({
    description: "File ID",
    example: "456e7890-e89b-12d3-a456-426614174001",
  }),
  createdAt: z.string().datetime().openapi({
    description: "Creation timestamp",
    example: "2024-12-03T12:00:00Z",
  }),
});

// Lesson response schema
export const lessonResponseSchema = z.object({
  id: z.string().uuid().openapi({
    description: "Lesson ID",
    example: "abc12345-e89b-12d3-a456-426614174000",
  }),
  moduleId: z.string().uuid().openapi({
    description: "Module ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
  title: z.string().openapi({
    description: "Lesson title",
    example: "Introduction to Variables",
  }),
  description: z.string().openapi({
    description: "Lesson description",
    example: "Learn about variables and data types in programming",
  }),
  lessonType: z.enum(["video", "pdf", "file", "audio", "text"]).openapi({
    description: "Type of lesson content",
    example: "video",
  }),
  uploadedBy: z.string().uuid().openapi({
    description: "ID of the user who uploaded the lesson",
    example: "user123-e89b-12d3-a456-426614174000",
  }),
  lessonOrder: z.number().openapi({
    description: "Order of the lesson in the module",
    example: 1,
  }),
  muxAssetId: z.string().nullable().optional(),
  muxPlaybackId: z.string().nullable().optional(),
  videoStatus: z.string().nullable().optional(),
  videoDuration: z.number().nullable().optional(),
  createdAt: z.string().datetime().openapi({
    description: "Creation timestamp",
    example: "2024-12-03T12:00:00Z",
  }),
  updatedAt: z.string().datetime().openapi({
    description: "Last update timestamp",
    example: "2024-12-03T12:00:00Z",
  }),
});

// Create lesson response schema
export const createLessonResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Indicates if the operation was successful",
    example: true,
  }),
  data: lessonResponseSchema,
  message: z.string().openapi({
    description: "Success message",
    example: "Lesson created successfully",
  }),
});

// Update lesson response schema
export const updateLessonResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Indicates if the operation was successful",
    example: true,
  }),
  data: lessonResponseSchema,
  message: z.string().openapi({
    description: "Success message",
    example: "Lesson updated successfully",
  }),
});

// Module ID query param schema with pagination and search
export const lessonPaginationQuerySchema = z.object({
  moduleId: z.string().uuid().openapi({
    description: "Module ID to filter lessons",
    example: "123e4567-e89b-12d3-a456-426614174000",
    param: {
      name: "moduleId",
      in: "query",
    },
  }),
  page: z.string().optional().default("1").transform(Number).openapi({
    description: "Page number",
    example: "1",
    param: {
      name: "page",
      in: "query",
    },
  }),
  limit: z.string().optional().default("10").transform(Number).openapi({
    description: "Items per page",
    example: "10",
    param: {
      name: "limit",
      in: "query",
    },
  }),
  search: z.string().optional().openapi({
    description: "Search term for filtering lessons by title",
    example: "Variables",
    param: {
      name: "search",
      in: "query",
    },
  }),
});

// Lesson with files schema for list response
export const lessonWithFilesSchema = lessonResponseSchema.extend({
  lessonFiles: z.array(
    z.object({
      id: z.string().uuid().openapi({
        description: "Lesson file ID",
        example: "def45678-e89b-12d3-a456-426614174000",
      }),
      fileId: z.string().uuid().openapi({
        description: "File ID",
        example: "456e7890-e89b-12d3-a456-426614174001",
      }),
      file: z.object({
        id: z.string().uuid(),
        fileName: z.string(),
        fileUrl: z.string(),
        fileType: z.string(),
        fileSize: z.number(),
      }).openapi({
        description: "File details",
      }),
    })
  ).openapi({
    description: "Files attached to the lesson",
  }),
});

// List lessons response schema
export const listLessonsResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Indicates if the operation was successful",
    example: true,
  }),
  data: z.object({
    lessons: z.array(lessonWithFilesSchema),
    pagination: z.object({
      page: z.number().openapi({
        description: "Current page number",
        example: 1,
      }),
      limit: z.number().openapi({
        description: "Items per page",
        example: 10,
      }),
      total: z.number().openapi({
        description: "Total number of lessons",
        example: 25,
      }),
      totalPages: z.number().openapi({
        description: "Total number of pages",
        example: 3,
      }),
    }),
  }),
  message: z.string().openapi({
    description: "Success message",
    example: "Lessons retrieved successfully",
  }),
});

// Get lesson by ID response schema
export const getLessonResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Indicates if the operation was successful",
    example: true,
  }),
  data: lessonWithFilesSchema,
  message: z.string().openapi({
    description: "Success message",
    example: "Lesson retrieved successfully",
  }),
});

// Delete lesson response schema
export const deleteLessonResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Indicates if the operation was successful",
    example: true,
  }),
  message: z.string().openapi({
    description: "Success message",
    example: "Lesson and associated files deleted successfully",
  }),
});

// Mark lesson completed request schema
export const markLessonCompletedSchema = z.object({
  lessonId: z.string().uuid().openapi({
    description: "Lesson ID to mark as completed",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
  userId: z.string().uuid().openapi({
    description: "User ID who completed the lesson",
    example: "user123-e89b-12d3-a456-426614174000",
  }),
  courseId: z.string().uuid().openapi({
    description: "Course ID to which the lesson belongs",
    example: "course123-e89b-12d3-a456-426614174000",
  }),
  moduleId: z.string().uuid().openapi({
    description: "Module ID to which the lesson belongs",
    example: "module123-e89b-12d3-a456-426614174000",
  }),
  lastWatchedSeconds: z.number().int().nonnegative().optional().openapi({
    description: "Last watched seconds of the lesson if it's video/audio",
    example: 120,
  }),
});

// Mark lesson completed response schema
export const markLessonCompletedResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Indicates if the operation was successful",
    example: true,
  }),
  message: z.string().openapi({
    description: "Success message",
    example: "Lesson marked as completed",
  }),
});

// Lesson comment schemas

// Create lesson comment schema
export const createLessonCommentSchema = z.object({
  lessonId: z.string().uuid().openapi({
    description: "Lesson ID to comment on",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
  userId: z.string().uuid().openapi({
    description: "User ID creating the comment",
    example: "user123-e89b-12d3-a456-426614174000",
  }),
  commentText: z.string().min(1).max(1000).openapi({
    description: "Comment text",
    example: "Great lesson! Very informative.",
  }),
});

// Update lesson comment schema
export const updateLessonCommentSchema = z.object({
  commentText: z.string().min(1).max(1000).openapi({
    description: "Updated comment text",
    example: "Updated comment text.",
  }),
});

// Lesson comment ID param schema
export const commentIdParamSchema = z.object({
  id: z.string().uuid().openapi({
    description: "Comment ID",
    example: "comment123-e89b-12d3-a456-426614174000",
    param: {
      name: "id",
      in: "path",
    },
  }),
});

// Lesson comment response schema
export const lessonCommentResponseSchema = z.object({
  id: z.string().uuid().openapi({
    description: "Comment ID",
    example: "comment123-e89b-12d3-a456-426614174000",
  }),
  lessonId: z.string().uuid().openapi({
    description: "Lesson ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
  userId: z.string().uuid().openapi({
    description: "User ID who created the comment",
    example: "user123-e89b-12d3-a456-426614174000",
  }),
  commentText: z.string().openapi({
    description: "Comment text",
    example: "Great lesson!",
  }),
  userName: z.string().optional().openapi({
    description: "Name of the user who created the comment",
    example: "John Doe",
  }),
  userAvatar: z.string().nullable().optional().openapi({
    description: "Avatar URL of the user",
    example: "https://example.com/avatars/john-doe.png",
  }),
  createdAt: z.string().datetime().openapi({
    description: "Comment creation timestamp",
    example: "2024-12-03T12:00:00Z",
  }),
  updatedAt: z.string().datetime().openapi({
    description: "Comment last update timestamp",
    example: "2024-12-03T12:00:00Z",
  }),
});

// List lesson comments query schema
export const listLessonCommentsQuerySchema = z.object({
  lessonId: z.string().uuid().openapi({
    description: "Lesson ID to fetch comments for",
    example: "123e4567-e89b-12d3-a456-426614174000",
    param: {
      name: "lessonId",
      in: "query",
    },
  }),
  page: z.string().optional().default("1").transform(Number).openapi({
    description: "Page number",
    example: "1",
    param: {
      name: "page",
      in: "query",
    },
  }),
  limit: z.string().optional().default("10").transform(Number).openapi({
    description: "Items per page (max 100)",
    example: "10",
    param: {
      name: "limit",
      in: "query",
    },
  }),
});

// List lesson comments response schema
export const listLessonCommentsResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Indicates if the operation was successful",
    example: true,
  }),
  data: z.object({
    comments: z.array(lessonCommentResponseSchema),
    pagination: z.object({
      page: z.number().openapi({
        description: "Current page number",
        example: 1,
      }),
      limit: z.number().openapi({
        description: "Number of items per page",
        example: 10,
      }),
      totalPages: z.number().openapi({
        description: "Total number of pages",
        example: 5,
      }),
      totalItems: z.number().openapi({
        description: "Total number of comments",
        example: 50,
      }),
    }),
  }),
  message: z.string().openapi({
    description: "Success message",
    example: "Comments retrieved successfully",
  }),
});

// Create lesson comment response schema
export const createLessonCommentResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Indicates if the operation was successful",
    example: true,
  }),
  data: lessonCommentResponseSchema,
  message: z.string().openapi({
    description: "Success message",
    example: "Comment created successfully",
  }),
});

// Update lesson comment response schema
export const updateLessonCommentResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Indicates if the operation was successful",
    example: true,
  }),
  data: lessonCommentResponseSchema,
  message: z.string().openapi({
    description: "Success message",
    example: "Comment updated successfully",
  }),
});

// Delete lesson comment response schema
export const deleteLessonCommentResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Indicates if the operation was successful",
    example: true,
  }),
  message: z.string().openapi({
    description: "Success message",
    example: "Comment deleted successfully",
  }),
});

export const requestVideoUploadSchema = z.object({
  corsOrigin: z.string().url().optional().openapi({
    description: "CORS origin for video upload (defaults to *)",
    example: "https://yourdomain.com",
  }),
});

export const videoUploadResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Indicates if the operation was successful",
    example: true,
  }),
  data: z.object({
    uploadId: z.string().openapi({
      description: "Mux upload ID",
      example: "upload_abc123",
    }),
    uploadUrl: z.string().url().openapi({
      description: "Direct upload URL for video",
      example: "https://storage.googleapis.com/video-storage-us-east1.mux.com/...",
    }),
  }),
  message: z.string().openapi({
    description: "Success message",
    example: "Video upload URL created successfully",
  }),
});