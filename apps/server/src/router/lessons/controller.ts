import { type Context } from "hono";
import { ZodError } from "zod";
import { createLessonSchema, updateLessonSchema, lessonPaginationQuerySchema, lessonIdParamSchema, markLessonCompletedSchema, createLessonCommentSchema, updateLessonCommentSchema, commentIdParamSchema, listLessonCommentsQuerySchema, requestVideoUploadSchema } from "./validation";
import { createLessonService, updateLessonService, listLessonsService, getLessonByIdService, deleteLessonService, markLessonCompletedService, createLessonCommentService, listLessonCommentsService, getLessonCommentService, updateLessonCommentService, deleteLessonCommentService, requestVideoUploadService, handleAssetReady, handleAssetError, handleUploadCompleted, handleUploadCancelled, handleUploadErrored } from "./service";
import { mux } from "../../lib/mux-config";


/**
 * Handles an HTTP request to create a lesson.
 *
 * The request body must contain the following properties:
 * - moduleId: The UUID of the module to which the lesson belongs.
 * - title: The lesson title.
 * - description: The lesson description.
 * - lessonType: The type of lesson (video, pdf, file, audio, text).
 * - lessonOrder: The order of the lesson in the module.
 * - fileIds: (Optional) Array of file IDs to attach to the lesson.
 *
 * The response will contain the following properties:
 * - success: A boolean indicating if the operation was successful.
 * - data: The created lesson object.
 * - message: A string indicating the result of the operation.
 *
 * If the request body is invalid, a 400 response will be returned with an error message.
 * If the module doesn't exist, a 404 response will be returned with an error message.
 * If an error occurs during the creation process, a 500 response will be returned with an error message.
 */
export const createLessonController = async (c: Context) => {
  try {
    const body = await c.req.json();
    const validatedData = createLessonSchema.parse(body);


    const lesson = await createLessonService(validatedData, validatedData.userId);

    return c.json(
      {
        success: true,
        data: lesson,
        message: "Lesson created successfully",
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

   if (error instanceof Error) {
      if (error.message === "Module not found") {
        return c.json({ success: false, error: error.message }, 404);
      }
      if (error.message.includes("Mux upload") || error.message.includes("Video")) {
        return c.json({ success: false, error: error.message }, 400);
      }
      if (error.message.startsWith("Files not found")) {
        return c.json({ success: false, error: error.message }, 400);
      }
    }

    if (error instanceof Error && error.message.startsWith("Files not found")) {
      return c.json(
        {
          success: false,
          error: error.message,
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
 * Updates an existing lesson.
 *
 * The request body can contain the following optional properties:
 * - title: The lesson title.
 * - description: The lesson description.
 * - lessonType: The type of lesson (video, pdf, file, audio, text).
 * - lessonOrder: The order of the lesson in the module.
 * - fileIds: Array of file IDs to attach to the lesson (replaces existing files).
 *
 * The response will contain the following properties:
 * - success: A boolean indicating if the operation was successful.
 * - data: The updated lesson object.
 * - message: A string indicating the result of the operation.
 *
 * If the request body is invalid, a 400 response will be returned with an error message.
 * If the lesson doesn't exist, a 404 response will be returned with an error message.
 * If an error occurs during the update process, a 500 response will be returned with an error message.
 */
export const updateLessonController = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    const validatedData = updateLessonSchema.parse(body);

    const lesson = await updateLessonService(id, validatedData);

    return c.json(
      {
        success: true,
        data: lesson,
        message: "Lesson updated successfully",
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

    if (error instanceof Error && error.message === "Lesson not found") {
      return c.json(
        {
          success: false,
          error: error.message,
        },
        400
      );
    }

    if (error instanceof Error && error.message.startsWith("Files not found")) {
      return c.json(
        {
          success: false,
          error: error.message,
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
 * Lists lessons for a module with pagination and search.
 *
 * The request query must contain:
 * - moduleId: UUID of the module
 *
 * Optional query parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10)
 * - search: Search term for lesson title
 *
 * The response will contain:
 * - success: A boolean indicating if the operation was successful.
 * - data: Object with lessons array and pagination info.
 * - message: A string indicating the result of the operation.
 *
 * If the module doesn't exist, a 404 response will be returned with an error message.
 * If an error occurs during the retrieval process, a 500 response will be returned with an error message.
 */
export const listLessonsController = async (c: Context) => {
  try {
    const query = c.req.query();
    const { moduleId, page, limit, search } = lessonPaginationQuerySchema.parse(query);

    const result = await listLessonsService(moduleId, page, limit, search);

    return c.json(
      {
        success: true,
        data: result,
        message: "Lessons retrieved successfully",
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

    if (error instanceof Error && error.message === "Module not found") {
      return c.json(
        {
          success: false,
          error: error.message,
        },
        404
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
 * Gets a single lesson by ID with files.
 *
 * The request params must contain:
 * - id: UUID of the lesson
 *
 * The response will contain:
 * - success: A boolean indicating if the operation was successful.
 * - data: The lesson object with files.
 * - message: A string indicating the result of the operation.
 *
 * If the lesson doesn't exist, a 404 response will be returned with an error message.
 * If an error occurs during the retrieval process, a 500 response will be returned with an error message.
 */
export const getLessonByIdController = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const validatedData = lessonIdParamSchema.parse({ id });

    const lesson = await getLessonByIdService(validatedData.id);

    return c.json(
      {
        success: true,
        data: lesson,
        message: "Lesson retrieved successfully",
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

    if (error instanceof Error && error.message === "Lesson not found") {
      return c.json(
        {
          success: false,
          error: error.message,
        },
        404
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
 * Handles an HTTP request to delete a lesson.
 *
 * The request params must contain:
 * - id: The lesson ID.
 *
 * The response will contain the following properties:
 * - success: A boolean indicating if the operation was successful.
 * - data: The deleted lesson object.
 * - message: A string indicating the result of the operation.
 *
 * If the lesson is not found, a 404 response will be returned with an error message.
 * If an error occurs during the deletion process, a 500 response will be returned with an error message.
 */
export const deleteLessonController = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const validatedData = lessonIdParamSchema.parse({ id });

    const lesson = await deleteLessonService(validatedData.id);

    return c.json(
      {
        success: true,
        data: lesson,
        message: "Lesson deleted successfully",
      },
      200
    );
    
  } catch (error) {
    if(error instanceof ZodError){
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
}

/**
 * Handles an HTTP request to mark a lesson as completed.
 *
 * The request body must contain:
 * - lessonId: The UUID of the lesson to mark as completed.
 * - userId: The UUID of the user who completed the lesson.
 *
 * The response will contain:
 * - success: A boolean indicating if the operation was successful.
 * - message: A string indicating the result of the operation.
 *
 * If the request body is invalid, a 400 response will be returned.
 * If the lesson doesn't exist, a 404 response will be returned.
 * If an error occurs, a 500 response will be returned.
 */
export const markLessonCompletedController = async (c: Context) => {
  try {
    const body = await c.req.json();
    const validatedData = markLessonCompletedSchema.parse(body);

    await markLessonCompletedService(validatedData);

    return c.json(
      {
        success: true,
        message: "Lesson marked as completed",
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

    if (error instanceof Error && error.message === "Lesson not found") {
      return c.json(
        {
          success: false,
          error: error.message,
        },
        404
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

// ===================== LESSON COMMENT CONTROLLERS =====================

/**
 * Handles an HTTP request to create a lesson comment.
 *
 * The request body must contain:
 * - lessonId: The UUID of the lesson to comment on.
 * - userId: The UUID of the user creating the comment.
 * - commentText: The comment text.
 *
 * The response will contain:
 * - success: A boolean indicating if the operation was successful.
 * - data: The created comment object.
 * - message: A string indicating the result of the operation.
 *
 * If the request body is invalid, a 400 response will be returned.
 * If the lesson doesn't exist, a 404 response will be returned.
 * If an error occurs, a 500 response will be returned.
 */
export const createLessonCommentController = async (c: Context) => {
  try {
    const body = await c.req.json();
    const validatedData = createLessonCommentSchema.parse(body);

    const comment = await createLessonCommentService(validatedData);

    return c.json(
      {
        success: true,
        data: comment,
        message: "Comment created successfully",
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

    if (error instanceof Error && error.message === "Lesson not found") {
      return c.json(
        {
          success: false,
          error: error.message,
        },
        404
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
 * Handles an HTTP request to list lesson comments with pagination.
 *
 * The query parameters must contain:
 * - lessonId: The UUID of the lesson to get comments for.
 * - page: (Optional) The page number (default: 1).
 * - limit: (Optional) The number of items per page (default: 10, max: 100).
 *
 * The response will contain:
 * - success: A boolean indicating if the operation was successful.
 * - data: An object containing comments array and pagination info.
 * - message: A string indicating the result of the operation.
 *
 * If the query parameters are invalid, a 400 response will be returned.
 * If the lesson doesn't exist, a 404 response will be returned.
 * If an error occurs, a 500 response will be returned.
 */
export const listLessonCommentsController = async (c: Context) => {
  try {
    const query = c.req.query();
    const validatedQuery = listLessonCommentsQuerySchema.parse(query);

    // Ensure limit doesn't exceed 100
    const limit = Math.min(validatedQuery.limit, 100);

    const result = await listLessonCommentsService({
      lessonId: validatedQuery.lessonId,
      page: validatedQuery.page,
      limit,
    });

    return c.json(
      {
        success: true,
        data: result,
        message: "Comments retrieved successfully",
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

    if (error instanceof Error && error.message === "Lesson not found") {
      return c.json(
        {
          success: false,
          error: error.message,
        },
        404
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
 * Handles an HTTP request to get a single lesson comment by ID.
 *
 * The request params must contain:
 * - id: The UUID of the comment.
 *
 * The response will contain:
 * - success: A boolean indicating if the operation was successful.
 * - data: The comment object with user details.
 * - message: A string indicating the result of the operation.
 *
 * If the comment doesn't exist, a 404 response will be returned.
 * If an error occurs, a 500 response will be returned.
 */
export const getLessonCommentController = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const validatedData = commentIdParamSchema.parse({ id });

    const comment = await getLessonCommentService(validatedData.id);

    return c.json(
      {
        success: true,
        data: comment,
        message: "Comment retrieved successfully",
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

    if (error instanceof Error && error.message === "Comment not found") {
      return c.json(
        {
          success: false,
          error: error.message,
        },
        404
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
 * Handles an HTTP request to update a lesson comment.
 *
 * The request params must contain:
 * - id: The UUID of the comment.
 *
 * The request body must contain:
 * - commentText: The updated comment text.
 *
 * Users can only update their own comments.
 *
 * The response will contain:
 * - success: A boolean indicating if the operation was successful.
 * - data: The updated comment object.
 * - message: A string indicating the result of the operation.
 *
 * If the request body is invalid, a 400 response will be returned.
 * If the comment doesn't exist or user doesn't have permission, a 404 response will be returned.
 * If an error occurs, a 500 response will be returned.
 */
export const updateLessonCommentController = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    
    const validatedId = commentIdParamSchema.parse({ id });
    const validatedData = updateLessonCommentSchema.parse(body);

    // Get userId from request context (set by auth middleware)
    const userId = body.userId;

    if (!userId) {
      return c.json(
        {
          success: false,
          error: "User ID is required",
        },
        400
      );
    }

    const comment = await updateLessonCommentService(validatedId.id, userId, validatedData);

    return c.json(
      {
        success: true,
        data: comment,
        message: "Comment updated successfully",
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

    if (error instanceof Error && error.message.includes("permission")) {
      return c.json(
        {
          success: false,
          error: error.message,
        },
        403
      );
    }

    if (error instanceof Error && error.message === "Comment not found or you don't have permission to update it") {
      return c.json(
        {
          success: false,
          error: error.message,
        },
        404
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
 * Handles an HTTP request to delete a lesson comment.
 *
 * The request params must contain:
 * - id: The UUID of the comment.
 *
 * Users can only delete their own comments.
 *
 * The response will contain:
 * - success: A boolean indicating if the operation was successful.
 * - message: A string indicating the result of the operation.
 *
 * If the comment doesn't exist or user doesn't have permission, a 404 response will be returned.
 * If an error occurs, a 500 response will be returned.
 */
export const deleteLessonCommentController = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    
    const validatedId = commentIdParamSchema.parse({ id });

    const userId = body.userId;

    if (!userId) {
      return c.json(
        {
          success: false,
          error: "User ID is required",
        },
        400
      );
    }

    await deleteLessonCommentService(validatedId.id, userId);

    return c.json(
      {
        success: true,
        message: "Comment deleted successfully",
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

    if (error instanceof Error && error.message.includes("permission")) {
      return c.json(
        {
          success: false,
          error: error.message,
        },
        403
      );
    }

    if (error instanceof Error && error.message === "Comment not found or you don't have permission to delete it") {
      return c.json(
        {
          success: false,
          error: error.message,
        },
        404
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
 * Handles an HTTP request to create a video upload URL.
 *
 * The request body must contain:
 * - corsOrigin: The origin of the request.
 *
 * The response will contain:
 * - success: A boolean indicating if the operation was successful.
 * - data: An object containing the upload URL and other metadata.
 * - message: A string indicating the result of the operation.
 *
 * If the request body is invalid, a 400 response will be returned.
 * If an error occurs, a 500 response will be returned.
 */
export const requestVideoUploadController = async (c: Context) => {
  try {
    const body = await c.req.json();
    const validatedData = requestVideoUploadSchema.parse(body);

    const uploadData = await requestVideoUploadService(validatedData.corsOrigin);

    return c.json(
      {
        success: true,
        data: uploadData,
        message: "Video upload URL created successfully",
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
 * Handles an HTTP request from a Mux webhook.
 *
 * The request body must contain a Mux webhook event.
 *
 * The response will contain a JSON object with a single property "success".
 * If the webhook is processed successfully, the value of "success" will be true.
 * If an error occurs during webhook processing, the value of "success" will be false and an additional "error" property will be present with an error message.
 *
 * The following webhook events are handled:
 * - "video.asset.ready": Triggers when a video asset is ready for use.
 * - "video.asset.errored": Triggers when a video asset fails to process.
 * - "video.upload.asset_created": Triggers when a video upload is completed.
 * - "video.upload.cancelled": Triggers when a video upload is cancelled.
 * - "video.upload.errored": Triggers when a video upload fails.
 *
 * If an unhandled webhook event is received, an error will be thrown with a message indicating the unhandled event type.
 */
export const muxWebhookController = async (c: Context) => {
  try {
   const body = await c.req.text(); 
    const headersList = c.req.header();
    
    // Verify and unwrap the webhook
    const event = mux.webhooks.unwrap(body, headersList);
    
    const { type, data } = event;

     switch (type) {
      case "video.asset.ready":
        await handleAssetReady(data.id);
        break;
      
      case "video.asset.errored":
        await handleAssetError(data.id, data.errors);
        break;
      
      case "video.upload.asset_created":
        await handleUploadCompleted(data.id, data.asset_id as string);
        break;
      
      case "video.upload.cancelled":
        await handleUploadCancelled(data.id);
        break;
      
      case "video.upload.errored":
        await handleUploadErrored(data.id);
        break;
      
      default:
        throw new Error(`Unhandled webhook type: ${type}`);
    }

    return c.json({ success: true }, 200);
  } catch (error) {

    return c.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Webhook processing failed" 
      },
      500
    );
  
  }
};