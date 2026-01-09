import { z } from "@hono/zod-openapi";

// Enums
export const webinarStatusEnum = z.enum(["upcoming", "live", "completed"]);
export const paymentStatusEnum = z.enum(["pending", "success", "failed"]);

// Create webinar request schema
export const createWebinarSchema = z.object({
  title: z.string().min(1).max(255).openapi({
    description: "Webinar title",
    example: "Introduction to AI and Machine Learning",
  }),
  description: z.string().optional().openapi({
    description: "Webinar description",
    example: "Learn the fundamentals of AI and ML",
  }),
  isFree: z.boolean().default(false).openapi({
    description: "Whether the webinar is free",
    example: false,
  }),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/).optional().openapi({
    description: "Webinar price (required if isFree is false)",
    example: "49.99",
  }),
  thumbnailFileId: z.string().uuid().optional().openapi({
    description: "UUID of the thumbnail file after upload",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
  liveLink: z.string().url().optional().openapi({
    description: "Live webinar link (e.g., Zoom, Google Meet)",
    example: "https://zoom.us/j/123456789",
  }),
  scheduledAt: z.string().datetime().openapi({
    description: "Scheduled date and time for the webinar",
    example: "2025-12-15T10:00:00Z",
  }),
  duration: z.number().int().positive().openapi({
    description: "Duration in minutes",
    example: 90,
  }),
  status: webinarStatusEnum.default("upcoming").openapi({
    description: "Webinar status",
    example: "upcoming",
  }),
  instructorIds: z.array(z.string().uuid()).min(1).openapi({
    description: "Array of instructor user IDs",
    example: ["123e4567-e89b-12d3-a456-426614174000", "987e6543-e21b-34d5-b678-123456789abc"],
  }),
});

// Create webinar response schema
export const createWebinarResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Indicates if the operation was successful",
    example: true,
  }),
  data: z.object({
    id: z.string().uuid().openapi({
      description: "Webinar ID",
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
    title: z.string().openapi({
      description: "Webinar title",
      example: "Introduction to AI and Machine Learning",
    }),
    slug: z.string().openapi({
      description: "Webinar slug",
      example: "introduction-to-ai-and-machine-learning",
    }),
    description: z.string().nullable().openapi({
      description: "Webinar description",
      example: "Learn the fundamentals of AI and ML",
    }),
    isFree: z.boolean().openapi({
      description: "Whether the webinar is free",
      example: false,
    }),
    price: z.string().nullable().openapi({
      description: "Webinar price",
      example: "49.99",
    }),
    thumbnailFileId: z.string().uuid().nullable().openapi({
      description: "Thumbnail file ID",
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
    liveLink: z.string().nullable().openapi({
      description: "Live webinar link",
      example: "https://zoom.us/j/123456789",
    }),
    scheduledAt: z.string().openapi({
      description: "Scheduled date and time",
      example: "2025-12-15T10:00:00.000Z",
    }),
    duration: z.number().openapi({
      description: "Duration in minutes",
      example: 90,
    }),
    status: webinarStatusEnum.openapi({
      description: "Webinar status",
      example: "upcoming",
    }),
    createdAt: z.string().openapi({
      description: "Creation timestamp",
      example: "2025-12-11T08:00:00.000Z",
    }),
    updatedAt: z.string().openapi({
      description: "Last update timestamp",
      example: "2025-12-11T08:00:00.000Z",
    }),
  }),
  message: z.string().openapi({
    description: "Success message",
    example: "Webinar created successfully",
  }),
});

// Update webinar request schema (partial of create schema)
export const updateWebinarSchema = createWebinarSchema.partial();

// Webinar ID param schema
export const webinarIdParamSchema = z.object({
  id: z.string().uuid().openapi({
    param: { name: "id", in: "path" },
    description: "Webinar ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
});

// Update webinar response schema
export const updateWebinarResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Indicates if the operation was successful",
    example: true,
  }),
  data: z.object({
    id: z.string().uuid().openapi({
      description: "Webinar ID",
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
    title: z.string().openapi({
      description: "Webinar title",
      example: "Introduction to AI and Machine Learning",
    }),
    slug: z.string().openapi({
      description: "Webinar slug",
      example: "introduction-to-ai-and-machine-learning",
    }),
    description: z.string().nullable().openapi({
      description: "Webinar description",
      example: "Learn the fundamentals of AI and ML",
    }),
    isFree: z.boolean().openapi({
      description: "Whether the webinar is free",
      example: false,
    }),
    price: z.string().nullable().openapi({
      description: "Webinar price",
      example: "49.99",
    }),
    thumbnailFileId: z.string().uuid().nullable().openapi({
      description: "Thumbnail file ID",
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
    liveLink: z.string().nullable().openapi({
      description: "Live webinar link",
      example: "https://zoom.us/j/123456789",
    }),
    scheduledAt: z.string().openapi({
      description: "Scheduled date and time",
      example: "2025-12-15T10:00:00.000Z",
    }),
    duration: z.number().openapi({
      description: "Duration in minutes",
      example: 90,
    }),
    status: webinarStatusEnum.openapi({
      description: "Webinar status",
      example: "upcoming",
    }),
    createdAt: z.string().openapi({
      description: "Creation timestamp",
      example: "2025-12-11T08:00:00.000Z",
    }),
    updatedAt: z.string().openapi({
      description: "Last update timestamp",
      example: "2025-12-11T08:00:00.000Z",
    }),
  }),
  message: z.string().openapi({
    description: "Success message",
    example: "Webinar updated successfully",
  }),
});

// Delete webinar response schema
export const deleteWebinarResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Indicates if the operation was successful",
    example: true,
  }),
  message: z.string().openapi({
    description: "Success message",
    example: "Webinar deleted successfully",
  }),
});

// Get webinar response schema
export const getWebinarResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Indicates if the operation was successful",
    example: true,
  }),
  data: z.object({
    id: z.string().uuid().openapi({
      description: "Webinar ID",
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
    title: z.string().openapi({
      description: "Webinar title",
      example: "Introduction to AI and Machine Learning",
    }),
    slug: z.string().openapi({
      description: "Webinar slug",
      example: "introduction-to-ai-and-machine-learning",
    }),
    description: z.string().nullable().openapi({
      description: "Webinar description",
      example: "Learn the fundamentals of AI and ML",
    }),
    isFree: z.boolean().openapi({
      description: "Whether the webinar is free",
      example: false,
    }),
    price: z.string().nullable().openapi({
      description: "Webinar price",
      example: "49.99",
    }),
    thumbnailFileId: z.string().uuid().nullable().openapi({
      description: "Thumbnail file ID",
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
    thumbnailUrl: z.string().nullable().openapi({
      description: "Signed URL for thumbnail",
      example: "https://storage.example.com/thumbnails/webinar-thumb.jpg",
    }),
    liveLink: z.string().nullable().openapi({
      description: "Live webinar link",
      example: "https://zoom.us/j/123456789",
    }),
    scheduledAt: z.string().openapi({
      description: "Scheduled date and time",
      example: "2025-12-15T10:00:00.000Z",
    }),
    duration: z.number().openapi({
      description: "Duration in minutes",
      example: 90,
    }),
    status: webinarStatusEnum.openapi({
      description: "Webinar status",
      example: "upcoming",
    }),
    instructors: z.array(z.object({
      id: z.string().uuid().openapi({
        description: "Instructor ID",
        example: "123e4567-e89b-12d3-a456-426614174000",
      }),
      name: z.string().openapi({
        description: "Instructor name",
        example: "John Doe",
      }),
      email: z.string().email().openapi({
        description: "Instructor email",
        example: "john.doe@example.com",
      }),
    })).openapi({
      description: "List of instructors",
    }),
    createdAt: z.string().openapi({
      description: "Creation timestamp",
      example: "2025-12-11T08:00:00.000Z",
    }),
    updatedAt: z.string().openapi({
      description: "Last update timestamp",
      example: "2025-12-11T08:00:00.000Z",
    }),
  }),
});

/**
 * Query schema for listing webinars with pagination and filters.
 */
export const webinarPaginationQuerySchema = z.object({
  page: z.string().optional().default("1").transform(Number).openapi({
    description: "Page number",
    example: "1",
    param: { name: "page", in: "query" },
  }),
  limit: z.string().optional().default("10").transform(Number).openapi({
    description: "Items per page",
    example: "10",
    param: { name: "limit", in: "query" },
  }),
  search: z.string().optional().openapi({
    description: "Search term for webinar title",
    example: "AI",
    param: { name: "search", in: "query" },
  }),
  status: webinarStatusEnum.optional().openapi({
    description: "Filter by webinar status",
    example: "upcoming",
    param: { name: "status", in: "query" },
  }),
});

/**
 * Response schema for listing webinars with pagination.
 */
export const listWebinarsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    webinars: z.array(z.object({
      id: z.string().uuid(),
      title: z.string(),
      slug: z.string(),
      description: z.string().nullable(),
      isFree: z.boolean(),
      price: z.string().nullable(),
      thumbnailFileId: z.string().uuid().nullable(),
      thumbnailUrl: z.string().nullable(),
      liveLink: z.string().nullable(),
      scheduledAt: z.string(),
      duration: z.number(),
      status: webinarStatusEnum,
      instructors: z.array(z.object({
        id: z.string().uuid(),
        name: z.string(),
        email: z.string().email(),
      })),
      createdAt: z.string(),
      updatedAt: z.string(),
    })),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }),
  }),
});

// Error response schema
export const errorResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Indicates if the operation was successful",
    example: false,
  }),
  error: z.string().openapi({
    description: "Error message",
    example: "An error occurred",
  }),
});

