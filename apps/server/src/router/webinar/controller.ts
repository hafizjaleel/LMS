import { type Context } from "hono";
import { ZodError } from "zod";
import { createWebinarSchema, updateWebinarSchema } from "./validation";
import { createWebinarService, updateWebinarService, deleteWebinarService, getWebinarService, listWebinarsService } from "./service";

/**
 * Handles an HTTP request to create a webinar.
 *
 * The request body must contain the following properties:
 * - title: The webinar title.
 * - description: The webinar description (optional).
 * - isFree: Whether the webinar is free.
 * - price: The webinar price (required if isFree is false).
 * - thumbnailFileId: The UUID of the thumbnail file after upload (optional).
 * - liveLink: The live webinar link (optional).
 * - scheduledAt: The scheduled date and time for the webinar.
 * - duration: Duration in minutes.
 * - status: The webinar status.
 * - instructorIds: An array of instructor user IDs to be assigned to the webinar.
 *
 * The response will contain the following properties:
 * - success: A boolean indicating if the operation was successful.
 * - data: The created webinar object.
 * - message: A string indicating the result of the operation.
 *
 * If the request body is invalid, a 400 response will be returned with an error message.
 * If an error occurs during the creation process, a 500 response will be returned with an error message.
 */
export const createWebinarController = async (c: Context) => {
  try {
    const body = await c.req.json();
    const validatedData = createWebinarSchema.parse(body);

    const webinar = await createWebinarService(validatedData);

    return c.json(
      {
        success: true,
        data: webinar,
        message: "Webinar created successfully",
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
 * Updates a webinar with the given ID.
 *
 * The request body must contain the webinar fields to be updated.
 * The request body will be validated against the updateWebinarSchema.
 *
 * If the webinar is not found, a 404 response will be returned with an error message.
 * If the request body is invalid, a 400 response will be returned with an error message.
 * If an error occurs during the update process, a 500 response will be returned with an error message.
 *
 * @returns A JSON response with the following format:
 * {
 *   success: boolean,
 *   data: Webinar,
 *   message: string
 * }
 */
export const updateWebinarController = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    const validatedData = updateWebinarSchema.parse(body);

    const webinar = await updateWebinarService(id, validatedData);

    if (!webinar) {
      return c.json(
        {
          success: false,
          error: "Webinar not found",
        },
        404
      );
    }

    return c.json(
      {
        success: true,
        data: webinar,
        message: "Webinar updated successfully",
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
 * Deletes a webinar (soft delete) by setting the deletedAt timestamp.
 *
 * If the webinar is not found, a 404 response will be returned with an error message.
 * If an error occurs during the deletion process, a 500 response will be returned with an error message.
 *
 * @returns A JSON response with the following format:
 * {
 *   success: boolean,
 *   message: string
 * }
 */
export const deleteWebinarController = async (c: Context) => {
  try {
    const { id } = c.req.param();

    const deleted = await deleteWebinarService(id);

    if (!deleted) {
      return c.json(
        {
          success: false,
          error: "Webinar not found",
        },
        404
      );
    }

    return c.json(
      {
        success: true,
        message: "Webinar deleted successfully",
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
 * Retrieves a webinar by ID with instructors and thumbnail URL.
 *
 * If the webinar is not found, a 404 response will be returned with an error message.
 * If an error occurs during retrieval, a 500 response will be returned with an error message.
 *
 * @returns A JSON response with the following format:
 * {
 *   success: boolean,
 *   data: Webinar with instructors and thumbnailUrl
 * }
 */
export const getWebinarController = async (c: Context) => {
  try {
    const { id } = c.req.param();

    const webinar = await getWebinarService(id);

    return c.json(
      {
        success: true,
        data: webinar,
      },
      200
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Webinar not found") {
      return c.json(
        {
          success: false,
          error: "Webinar not found",
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

export const listWebinarsController = async (c: Context) => {
  try {
    const q = c.req.query();
    const page = Number(q.page) || 1;
    const limit = Number(q.limit) || 10;
    const search = q.search;
    const status = q.status;

    const result = await listWebinarsService({ page, limit, search, status });

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
