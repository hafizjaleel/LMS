import { z } from "@hono/zod-openapi";

// Mentor schema with details
const mentorDetailsSchema = z.object({
  id: z.string().uuid().openapi({
    description: "Course mentor record ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
  mentorId: z.string().uuid().openapi({
    description: "Mentor user ID",
    example: "987e6543-e21b-34d5-b678-123456789abc",
  }),
  name: z.string().openapi({
    description: "Mentor name",
    example: "John Doe",
  }),
  avatar: z.string().nullable().openapi({
    description: "Mentor avatar URL",
    example: "https://example.com/avatars/john-doe.png",
  }),
});

// Create course request schema
export const createCourseSchema = z.object({
  title: z.string().min(1).max(255).openapi({
    description: "Course title",
    example: "Introduction to Web Development",
  }),
  description: z.string().optional().openapi({
    description: "Course description",
    example: "Learn the fundamentals of web development",
  }),
  isFree: z.boolean().default(false).openapi({
    description: "Whether the course is free",
    example: false,
  }),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/).optional().openapi({
    description: "Course price (required if isFree is false)",
    example: "49.99",
  }),
  thumbnailFileId: z.string().uuid().optional().openapi({
    description: "UUID of the thumbnail file after upload. upload id will get from upload api",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
  level: z.enum(["beginner", "intermediate", "advanced"]).openapi({
    description: "Course difficulty level",
    example: "beginner",
  }),
  language: z.string().default("en").openapi({
    description: "Course language code",
    example: "en",
  }),
  status: z.enum(["published", "on_hold", "draft"]).default("draft").openapi({
    description: "Course status",
    example: "draft",
  }),
  mentorIds: z.array(z.string().uuid()).min(1).openapi({
    description: "Array of mentor user IDs to be assigned to the course",
    example: ["123e4567-e89b-12d3-a456-426614174000", "987e6543-e21b-34d5-b678-123456789abc"],
  }),
});

// Create course response schema
export const createCourseResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Indicates if the operation was successful",
    example: true,
  }),
  data: z.object({
    id: z.string().uuid().openapi({
      description: "Course ID",
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
    title: z.string().openapi({
      description: "Course title",
      example: "Introduction to Web Development",
    }),
    slug: z.string().openapi({
      description: "Course slug",
      example: "introduction-to-web-development",
    }),
    description: z.string().nullable().openapi({
      description: "Course description",
      example: "Learn the fundamentals of web development",
    }),
    isFree: z.boolean().openapi({
      description: "Whether the course is free",
      example: false,
    }),
    price: z.string().nullable().openapi({
      description: "Course price",
      example: "49.99",
    }),
    thumbnail: z.string().nullable().openapi({
      description: "Thumbnail URL",
      example: "https://example.com/thumbnails/course-image.png",
    }),
    level: z.enum(["beginner", "intermediate", "advanced"]).openapi({
      description: "Course level",
      example: "beginner",
    }),
    language: z.string().openapi({
      description: "Course language",
      example: "en",
    }),
    status: z.enum(["published", "on_hold", "draft"]).openapi({
      description: "Course status",
      example: "draft",
    }),
    createdAt: z.string().datetime().openapi({
      description: "Creation timestamp",
      example: "2024-12-02T12:00:00Z",
    }),
    updatedAt: z.string().datetime().openapi({
      description: "Last update timestamp",
      example: "2024-12-02T12:00:00Z",
    }),
    mentors: z.array(z.object({
      id: z.string().uuid().openapi({
        description: "Course mentor record ID",
        example: "123e4567-e89b-12d3-a456-426614174000",
      }),
      mentorId: z.string().uuid().openapi({
        description: "Mentor user ID",
        example: "987e6543-e21b-34d5-b678-123456789abc",
      }),
      courseId: z.string().uuid().openapi({
        description: "Course ID",
        example: "123e4567-e89b-12d3-a456-426614174000",
      }),
    })).openapi({
      description: "List of course mentors",
    }),
  }),
  message: z.string().openapi({
    description: "Success message",
    example: "Course created successfully",
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
    example: "Invalid input data",
  }),
});

// Update course request schema
export const updateCourseSchema = z.object({
  title: z.string().min(1).max(255).optional().openapi({
    description: "Course title",
    example: "Introduction to Web Development",
  }),
  description: z.string().optional().openapi({
    description: "Course description",
    example: "Learn the fundamentals of web development",
  }),
  isFree: z.boolean().optional().openapi({
    description: "Whether the course is free",
    example: false,
  }),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/).optional().openapi({
    description: "Course price (required if isFree is false)",
    example: "49.99",
  }),
  thumbnailFileId: z.string().uuid().optional().openapi({
    description: "UUID of the thumbnail file after upload",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
  level: z.enum(["beginner", "intermediate", "advanced"]).optional().openapi({
    description: "Course difficulty level",
    example: "beginner",
  }),
  language: z.string().optional().openapi({
    description: "Course language code",
    example: "en",
  }),
  status: z.enum(["published", "on_hold", "draft"]).optional().openapi({
    description: "Course status",
    example: "draft",
  }),
  mentorIds: z.array(z.string().uuid()).optional().openapi({
    description: "Array of mentor user IDs to be assigned to the course",
    example: ["123e4567-e89b-12d3-a456-426614174000"],
  }),
});

// Course ID param schema
export const courseIdParamSchema = z.object({
  id: z.string().uuid().openapi({
    description: "Course ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
    param: {
      name: "id",
      in: "path",
    },
  }),
});

// Update course response schema (same as create)
export const updateCourseResponseSchema = createCourseResponseSchema;

// Get single course response for admin (with full details including modules, lessons, quizzes)
export const getCourseAdminResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Indicates if the operation was successful",
    example: true,
  }),
  data: z.object({
    id: z.string().uuid().openapi({
      description: "Course ID",
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
    title: z.string().openapi({
      description: "Course title",
      example: "Introduction to Web Development",
    }),
    slug: z.string().openapi({
      description: "Course slug",
      example: "introduction-to-web-development",
    }),
    description: z.string().nullable().openapi({
      description: "Course description",
      example: "Learn the fundamentals of web development",
    }),
    isFree: z.boolean().openapi({
      description: "Whether the course is free",
      example: false,
    }),
    price: z.string().nullable().openapi({
      description: "Course price",
      example: "49.99",
    }),
    thumbnail: z.string().nullable().openapi({
      description: "Thumbnail URL",
      example: "https://example.com/thumbnails/course-image.png",
    }),
    level: z.enum(["beginner", "intermediate", "advanced"]).openapi({
      description: "Course level",
      example: "beginner",
    }),
    language: z.string().openapi({
      description: "Course language",
      example: "en",
    }),
    status: z.enum(["published", "on_hold", "draft"]).openapi({
      description: "Course status",
      example: "draft",
    }),
    createdAt: z.string().datetime().openapi({
      description: "Creation timestamp",
      example: "2024-12-02T12:00:00Z",
    }),
    updatedAt: z.string().datetime().openapi({
      description: "Last update timestamp",
      example: "2024-12-02T12:00:00Z",
    }),
    enrolledCount: z.number().openapi({
      description: "Number of users enrolled in the course",
      example: 150,
    }),
    mentors: z.array(mentorDetailsSchema).openapi({
      description: "List of course mentors with details",
    }),
    modules: z.array(z.object({
      id: z.string().uuid().openapi({
        description: "Module ID",
        example: "abc12345-e89b-12d3-a456-426614174000",
      }),
      title: z.string().openapi({
        description: "Module title",
        example: "Getting Started with HTML",
      }),
      moduleOrder: z.number().openapi({
        description: "Module order in the course",
        example: 1,
      }),
      lessons: z.array(z.object({
        id: z.string().uuid().openapi({
          description: "Lesson ID",
          example: "def67890-e89b-12d3-a456-426614174000",
        }),
        title: z.string().openapi({
          description: "Lesson title",
          example: "Introduction to HTML Tags",
        }),
        lessonType: z.enum(["video", "pdf", "file", "audio", "text", "quiz"]).openapi({
          description: "Type of lesson",
          example: "video",
        }),
        lessonOrder: z.number().openapi({
          description: "Lesson order in the module",
          example: 1,
        }),
        files: z.array(z.object({
          id: z.string().uuid().openapi({
            description: "File ID",
            example: "file1234-e89b-12d3-a456-426614174000",
          }),
          key: z.string().openapi({
            description: "File storage key",
            example: "userId-123/lessons/video.mp4",
          }),
          originalFilename: z.string().openapi({
            description: "Original filename",
            example: "intro-video.mp4",
          }),
          fileSize: z.number().openapi({
            description: "File size in bytes",
            example: 5242880,
          }),
          mimeType: z.string().openapi({
            description: "MIME type",
            example: "video/mp4",
          }),
        })).openapi({
          description: "Files associated with the lesson",
        }),
      })).openapi({
        description: "Lessons in the module",
      }),
      quizzes: z.array(z.object({
        id: z.string().uuid().openapi({
          description: "Quiz ID",
          example: "quiz5678-e89b-12d3-a456-426614174000",
        }),
        title: z.string().openapi({
          description: "Quiz title",
          example: "HTML Basics Quiz",
        }),
        instructions: z.string().nullable().openapi({
          description: "Quiz instructions",
          example: "Answer all questions to complete this module",
        }),
        questions: z.array(z.object({
          id: z.string().uuid().openapi({
            description: "Question ID",
            example: "q1234567-e89b-12d3-a456-426614174000",
          }),
          questionText: z.string().openapi({
            description: "Question text",
            example: "What does HTML stand for?",
          }),
          questionOrder: z.number().openapi({
            description: "Question order in the quiz",
            example: 1,
          }),
          options: z.array(z.object({
            id: z.string().uuid().openapi({
              description: "Option ID",
              example: "opt12345-e89b-12d3-a456-426614174000",
            }),
            optionText: z.string().openapi({
              description: "Option text",
              example: "HyperText Markup Language",
            }),
            isCorrect: z.boolean().openapi({
              description: "Whether this option is correct",
              example: true,
            }),
          })).openapi({
            description: "Answer options",
          }),
        })).openapi({
          description: "Quiz questions",
        }),
      })).openapi({
        description: "Quizzes in the module",
      }),
    })).openapi({
      description: "Course modules with lessons and quizzes",
    }),
  }),
  message: z.string().openapi({
    description: "Success message",
    example: "Course retrieved successfully",
  }),
});

// Get single course response for user (with enrollment/progress)
export const getCourseUserResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Indicates if the operation was successful",
    example: true,
  }),
  data: z.object({
    id: z.string().uuid().openapi({
      description: "Course ID",
      example: "123e4567-e89b-12d3-a456-426614174000",
    }),
    title: z.string().openapi({
      description: "Course title",
      example: "Introduction to Web Development",
    }),
    slug: z.string().openapi({
      description: "Course slug",
      example: "introduction-to-web-development",
    }),
    description: z.string().nullable().openapi({
      description: "Course description",
      example: "Learn the fundamentals of web development",
    }),
    isFree: z.boolean().openapi({
      description: "Whether the course is free",
      example: false,
    }),
    price: z.string().nullable().openapi({
      description: "Course price",
      example: "49.99",
    }),
    thumbnail: z.string().nullable().openapi({
      description: "Thumbnail URL",
      example: "https://example.com/thumbnails/course-image.png",
    }),
    level: z.enum(["beginner", "intermediate", "advanced"]).openapi({
      description: "Course level",
      example: "beginner",
    }),
    language: z.string().openapi({
      description: "Course language",
      example: "en",
    }),
    status: z.enum(["published", "on_hold", "draft"]).openapi({
      description: "Course status",
      example: "published",
    }),
    createdAt: z.string().datetime().openapi({
      description: "Creation timestamp",
      example: "2024-12-02T12:00:00Z",
    }),
    updatedAt: z.string().datetime().openapi({
      description: "Last update timestamp",
      example: "2024-12-02T12:00:00Z",
    }),
    mentors: z.array(mentorDetailsSchema).openapi({
      description: "List of course mentors with details",
    }),
    enrollment: z.object({
      id: z.string().uuid().openapi({
        description: "Enrollment ID",
        example: "456e7890-e12b-34c5-d678-987654321fed",
      }),
      enrolledAt: z.string().datetime().openapi({
        description: "Enrollment timestamp",
        example: "2024-11-15T10:00:00Z",
      }),
      progress: z.object({
        progressPercent: z.number().openapi({
          description: "Course completion percentage",
          example: 45,
        }),
        lastWatchedSeconds: z.number().openapi({
          description: "Last watched position in seconds",
          example: 1200,
        }),
        isCompleted: z.boolean().openapi({
          description: "Whether the course is completed",
          example: false,
        }),
        completedAt: z.string().datetime().nullable().openapi({
          description: "Completion timestamp",
        }),
      }).nullable().openapi({
        description: "Course progress information",
      }),
    }).nullable().openapi({
      description: "Enrollment and progress information (null if not enrolled)",
    }),
  }),
  message: z.string().openapi({
    description: "Success message",
    example: "Course retrieved successfully",
  }),
});

// Pagination query schema
export const paginationQuerySchema = z.object({
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
    description: "Search term for filtering courses by title",
    example: "web development",
    param: {
      name: "search",
      in: "query",
    },
  }),
  level: z.enum(["beginner", "intermediate", "advanced"]).optional().openapi({
    description: "Filter by course level",
    example: "beginner",
    param: {
      name: "level",
      in: "query",
    },
  }),
  status: z.enum(["published", "on_hold", "draft"]).optional().openapi({
    description: "Filter by course status",
    example: "published",
    param: {
      name: "status",
      in: "query",
    },
  }),
  isFree: z.string().optional().transform((val) => val === "true" ? true : val === "false" ? false : undefined).openapi({
    description: "Filter by free or paid courses",
    example: "true",
    param: {
      name: "isFree",
      in: "query",
    },
  }),
});

// Admin list courses response schema
export const listCoursesAdminResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Indicates if the operation was successful",
    example: true,
  }),
  data: z.object({
    courses: z.array(z.object({
      id: z.string().uuid().openapi({
        description: "Course ID",
        example: "123e4567-e89b-12d3-a456-426614174000",
      }),
      title: z.string().openapi({
        description: "Course title",
        example: "Introduction to Web Development",
      }),
      slug: z.string().openapi({
        description: "Course slug",
        example: "introduction-to-web-development",
      }),
      description: z.string().nullable().openapi({
        description: "Course description",
      }),
      isFree: z.boolean().openapi({
        description: "Whether the course is free",
        example: false,
      }),
      price: z.string().nullable().openapi({
        description: "Course price",
        example: "49.99",
      }),
      thumbnail: z.string().nullable().openapi({
        description: "Thumbnail URL",
        example: "https://example.com/thumbnails/course-image.png",
      }),
      level: z.enum(["beginner", "intermediate", "advanced"]).openapi({
        description: "Course level",
        example: "beginner",
      }),
      language: z.string().openapi({
        description: "Course language",
        example: "en",
      }),
      status: z.enum(["published", "on_hold", "draft"]).openapi({
        description: "Course status",
        example: "published",
      }),
      createdAt: z.string().datetime().openapi({
        description: "Creation timestamp",
      }),
      updatedAt: z.string().datetime().openapi({
        description: "Last update timestamp",
      }),
      enrolledCount: z.number().openapi({
        description: "Number of users enrolled in the course",
        example: 150,
      }),
      totalRating: z.string().openapi({
        description: "Average rating of the course",
        example: "4.5",
      }),
      mentors: z.array(z.object({
        id: z.string().uuid().openapi({
          description: "Course mentor record ID",
          example: "123e4567-e89b-12d3-a456-426614174000",
        }),
        mentorId: z.string().uuid().openapi({
          description: "Mentor user ID",
          example: "987e6543-e21b-34d5-b678-123456789abc",
        }),
        name: z.string().openapi({
          description: "Mentor name",
          example: "John Doe",
        }),
        avatar: z.string().nullable().openapi({
          description: "Mentor avatar URL",
          example: "https://example.com/avatars/john-doe.png",
        }),
      })).openapi({
        description: "List of course mentors with details",
      }),
    })),
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
        description: "Total number of courses",
        example: 50,
      }),
      totalPages: z.number().openapi({
        description: "Total number of pages",
        example: 5,
      }),
    }),
  }),
});

// User list courses response schema (with progress)
export const listCoursesUserResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Indicates if the operation was successful",
    example: true,
  }),
  data: z.object({
    courses: z.array(z.object({
      id: z.string().uuid().openapi({
        description: "Course ID",
        example: "123e4567-e89b-12d3-a456-426614174000",
      }),
      title: z.string().openapi({
        description: "Course title",
        example: "Introduction to Web Development",
      }),
      slug: z.string().openapi({
        description: "Course slug",
        example: "introduction-to-web-development",
      }),
      description: z.string().nullable().openapi({
        description: "Course description",
      }),
      isFree: z.boolean().openapi({
        description: "Whether the course is free",
        example: false,
      }),
      price: z.string().nullable().openapi({
        description: "Course price",
        example: "49.99",
      }),
      thumbnail: z.string().nullable().openapi({
        description: "Thumbnail URL",
        example: "https://example.com/thumbnails/course-image.png",
      }),
      level: z.enum(["beginner", "intermediate", "advanced"]).openapi({
        description: "Course level",
        example: "beginner",
      }),
      language: z.string().openapi({
        description: "Course language",
        example: "en",
      }),
      totalRating: z.string().openapi({
        description: "Average rating of the course",
        example: "4.5",
      }),
      enrollment: z.object({
        id: z.string().uuid().openapi({
          description: "Enrollment ID",
          example: "456e7890-e12b-34c5-d678-987654321fed",
        }),
        enrolledAt: z.string().datetime().openapi({
          description: "Enrollment timestamp",
          example: "2024-11-15T10:00:00Z",
        }),
        progress: z.object({
          progressPercent: z.number().openapi({
            description: "Course completion percentage",
            example: 45,
          }),
          lastWatchedSeconds: z.number().openapi({
            description: "Last watched position in seconds",
            example: 1200,
          }),
          isCompleted: z.boolean().openapi({
            description: "Whether the course is completed",
            example: false,
          }),
          completedAt: z.string().datetime().nullable().openapi({
            description: "Completion timestamp",
          }),
        }).nullable().openapi({
          description: "Course progress information",
        }),
      }).nullable().openapi({
        description: "Enrollment and progress information (null if not enrolled)",
      }),
    })),
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
        description: "Total number of courses",
        example: 50,
      }),
      totalPages: z.number().openapi({
        description: "Total number of pages",
        example: 5,
      }),
    }),
  }),
});

// Enroll in course request schema
export const enrollCourseSchema = z.object({
  courseId: z.string().uuid().openapi({
    description: "Course ID to enroll in",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
  userId: z.string().uuid().openapi({
    description: "User ID enrolling in the course",
    example: "789e0123-e45f-67g8-h901-234567890abc",
  }),
});

// Enroll in course response schema
export const enrollCourseResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Indicates if the operation was successful",
    example: true,
  }),
  data: z.object({
    enrollment: z.object({
      id: z.string().uuid().openapi({
        description: "Enrollment ID",
        example: "456e7890-e12b-34c5-d678-987654321fed",
      }),
      userId: z.string().uuid().openapi({
        description: "User ID",
        example: "789e0123-e45f-67g8-h901-234567890abc",
      }),
      courseId: z.string().uuid().openapi({
        description: "Course ID",
        example: "123e4567-e89b-12d3-a456-426614174000",
      }),
      enrolledAt: z.string().datetime().openapi({
        description: "Enrollment timestamp",
        example: "2024-12-03T10:00:00Z",
      }),
    }),
    progress: z.object({
      id: z.string().uuid().openapi({
        description: "Progress record ID",
        example: "abc12345-e89b-12d3-a456-426614174000",
      }),
      progressPercent: z.number().openapi({
        description: "Course completion percentage",
        example: 0,
      }),
      isCompleted: z.boolean().openapi({
        description: "Whether the course is completed",
        example: false,
      }),
    }),
  }),
  message: z.string().openapi({
    description: "Success message",
    example: "Successfully enrolled in the course",
  }),
});

// Enrollment query schema
export const enrollmentQuerySchema = z.object({
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
  isFree: z.string().optional().transform((val) => val === "true" ? true : val === "false" ? false : undefined).openapi({
    description: "Filter by free or paid courses",
    example: "true",
    param: {
      name: "isFree",
      in: "query",
    },
  }),
  isCompleted: z.string().optional().transform((val) => val === "true" ? true : val === "false" ? false : undefined).openapi({
    description: "Filter by completed or in-progress enrollments",
    example: "false",
    param: {
      name: "isCompleted",
      in: "query",
    },
  }),
  userId: z.string().uuid().optional().openapi({
    description: "Filter by specific user ID (admin only)",
    example: "789e0123-e45f-67g8-h901-234567890abc",
    param: {
      name: "userId",
      in: "query",
    },
  }),
});

// Enrollment list response schema (unified for both admin and user)
export const listEnrollmentsResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Indicates if the operation was successful",
    example: true,
  }),
  data: z.object({
    enrollments: z.array(z.object({
      id: z.string().uuid().openapi({
        description: "Enrollment ID",
        example: "456e7890-e12b-34c5-d678-987654321fed",
      }),
      enrolledAt: z.string().datetime().openapi({
        description: "Enrollment timestamp",
        example: "2024-11-15T10:00:00Z",
      }),
      user: z.object({
        id: z.string().uuid().openapi({
          description: "User ID",
          example: "789e0123-e45f-67g8-h901-234567890abc",
        }),
        name: z.string().openapi({
          description: "User name",
          example: "John Doe",
        }),
        email: z.string().email().openapi({
          description: "User email",
          example: "john@example.com",
        }),
        avatar: z.string().nullable().openapi({
          description: "User avatar URL",
          example: "https://example.com/avatars/john.png",
        }),
      }).optional().openapi({
        description: "User details (only for admin role)",
      }),
      course: z.object({
        id: z.string().uuid().openapi({
          description: "Course ID",
          example: "123e4567-e89b-12d3-a456-426614174000",
        }),
        title: z.string().openapi({
          description: "Course title",
          example: "Introduction to Web Development",
        }),
        slug: z.string().openapi({
          description: "Course slug",
          example: "introduction-to-web-development",
        }),
        isFree: z.boolean().openapi({
          description: "Whether the course is free",
          example: true,
        }),
        price: z.string().nullable().openapi({
          description: "Course price",
          example: "49.99",
        }),
        thumbnail: z.string().nullable().openapi({
          description: "Course thumbnail URL",
          example: "https://example.com/thumbnails/course.png",
        }),
        level: z.enum(["beginner", "intermediate", "advanced"]).openapi({
          description: "Course level",
          example: "beginner",
        }),
        language: z.string().optional().openapi({
          description: "Course language",
          example: "en",
        }),
      }),
      progress: z.object({
        progressPercent: z.number().openapi({
          description: "Course completion percentage",
          example: 45,
        }),
        lastWatchedSeconds: z.number().optional().openapi({
          description: "Last watched position in seconds",
          example: 1200,
        }),
        isCompleted: z.boolean().openapi({
          description: "Whether the course is completed",
          example: false,
        }),
        completedAt: z.string().datetime().nullable().openapi({
          description: "Completion timestamp",
          example: null,
        }),
      }).nullable(),
    })),
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
        description: "Total number of enrollments",
        example: 50,
      }),
      totalPages: z.number().openapi({
        description: "Total number of pages",
        example: 5,
      }),
    }),
  }),
});

// Legacy alias for backward compatibility
export const listEnrollmentsUserResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Indicates if the operation was successful",
    example: true,
  }),
  data: z.object({
    enrollments: z.array(z.object({
      id: z.string().uuid().openapi({
        description: "Enrollment ID",
        example: "456e7890-e12b-34c5-d678-987654321fed",
      }),
      enrolledAt: z.string().datetime().openapi({
        description: "Enrollment timestamp",
        example: "2024-11-15T10:00:00Z",
      }),
      course: z.object({
        id: z.string().uuid().openapi({
          description: "Course ID",
          example: "123e4567-e89b-12d3-a456-426614174000",
        }),
        title: z.string().openapi({
          description: "Course title",
          example: "Introduction to Web Development",
        }),
        slug: z.string().openapi({
          description: "Course slug",
          example: "introduction-to-web-development",
        }),
        isFree: z.boolean().openapi({
          description: "Whether the course is free",
          example: true,
        }),
        price: z.string().nullable().openapi({
          description: "Course price",
          example: "49.99",
        }),
        thumbnail: z.string().nullable().openapi({
          description: "Course thumbnail URL",
          example: "https://example.com/thumbnails/course.png",
        }),
        level: z.enum(["beginner", "intermediate", "advanced"]).openapi({
          description: "Course level",
          example: "beginner",
        }),
        language: z.string().openapi({
          description: "Course language",
          example: "en",
        }),
      }),
      progress: z.object({
        progressPercent: z.number().openapi({
          description: "Course completion percentage",
          example: 45,
        }),
        lastWatchedSeconds: z.number().openapi({
          description: "Last watched position in seconds",
          example: 1200,
        }),
        isCompleted: z.boolean().openapi({
          description: "Whether the course is completed",
          example: false,
        }),
        completedAt: z.string().datetime().nullable().openapi({
          description: "Completion timestamp",
          example: null,
        }),
      }).nullable(),
    })),
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
        description: "Total number of enrollments",
        example: 50,
      }),
      totalPages: z.number().openapi({
        description: "Total number of pages",
        example: 5,
      }),
    }),
  }),
});

// Mark course as completed request schema
export const markCourseCompletedSchema = z.object({
  userId: z.string().uuid().openapi({
    description: "User ID who completed the course",
    example: "123e4567-e89b-12d3-a456-426614174000",
  }),
  courseId: z.string().uuid().openapi({
    description: "Course ID to mark as completed",
    example: "987e6543-e21b-34d5-b678-123456789abc",
  }),
});

// Mark course as completed response schema
export const markCourseCompletedResponseSchema = z.object({
  success: z.boolean().openapi({
    description: "Indicates if the operation was successful",
    example: true,
  }),
  data: z.object({
    courseProgress: z.object({
      id: z.string().uuid().openapi({
        description: "Course progress ID",
        example: "123e4567-e89b-12d3-a456-426614174000",
      }),
      enrollmentId: z.string().uuid().openapi({
        description: "Enrollment ID",
        example: "987e6543-e21b-34d5-b678-123456789abc",
      }),
      courseId: z.string().uuid().openapi({
        description: "Course ID",
        example: "abc12345-e21b-34d5-b678-123456789abc",
      }),
      progressPercent: z.number().openapi({
        description: "Progress percentage",
        example: 100,
      }),
      isCompleted: z.boolean().openapi({
        description: "Whether the course is completed",
        example: true,
      }),
      completedAt: z.string().datetime().openapi({
        description: "Completion timestamp",
        example: "2024-12-07T12:00:00Z",
      }),
    }),
    certificate: z.object({
      id: z.string().uuid().openapi({
        description: "Certificate ID",
        example: "def45678-e21b-34d5-b678-123456789def",
      }),
      certificateNumber: z.string().openapi({
        description: "Unique certificate number",
        example: "CERT-LX8K9P2-A4B3C2",
      }),
      certificateFileId: z.string().uuid().openapi({
        description: "File ID of the generated certificate PDF",
        example: "ghi78901-e21b-34d5-b678-123456789ghi",
      }),
      certificateUrl: z.string().url().openapi({
        description: "URL to download the certificate",
        example: "https://cdn.example.com/certificates/cert-123.pdf",
      }),
      issuedAt: z.string().datetime().openapi({
        description: "Certificate issue timestamp",
        example: "2024-12-07T12:00:00Z",
      }),
    }),
  }),
  message: z.string().openapi({
    description: "Success message",
    example: "Course marked as completed and certificate generated successfully",
  }),
});

