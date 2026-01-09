import { createRoute } from "@hono/zod-openapi";
import {
  createWebinarSchema,
  createWebinarResponseSchema,
  updateWebinarSchema,
  updateWebinarResponseSchema,
  deleteWebinarResponseSchema,
  getWebinarResponseSchema,
  webinarIdParamSchema,
  webinarPaginationQuerySchema,
  listWebinarsResponseSchema,
  errorResponseSchema,
} from "./validation";

export const createWebinarRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Webinars - Admin"],
  security: [{ Bearer: [] }, { cookieAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createWebinarSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: createWebinarResponseSchema,
        },
      },
      description: "Webinar created successfully",
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

export const updateWebinarRoute = createRoute({
  method: "put",
  path: "/{id}",
  tags: ["Webinars - Admin"],
  security: [{ Bearer: [] }, { cookieAuth: [] }],
  request: {
    params: webinarIdParamSchema,
    body: {
      content: {
        "application/json": {
          schema: updateWebinarSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: updateWebinarResponseSchema,
        },
      },
      description: "Webinar updated successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Bad request - invalid input",
    },
    404: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Webinar not found",
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

export const deleteWebinarRoute = createRoute({
  method: "delete",
  path: "/{id}",
  tags: ["Webinars - Admin"],
  security: [{ Bearer: [] }, { cookieAuth: [] }],
  request: {
    params: webinarIdParamSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: deleteWebinarResponseSchema,
        },
      },
      description: "Webinar deleted successfully",
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
      description: "Webinar not found",
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

export const listWebinarsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Webinars"],
  request: {
    query: webinarPaginationQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: listWebinarsResponseSchema,
        },
      },
      description: "Webinars retrieved successfully",
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

export const getWebinarRoute = createRoute({
  method: "get",
  path: "/{id}",
  tags: ["Webinars"],
  request: {
    params: webinarIdParamSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: getWebinarResponseSchema,
        },
      },
      description: "Webinar retrieved successfully",
    },
    404: {
      content: {
        "application/json": {
          schema: errorResponseSchema,
        },
      },
      description: "Webinar not found",
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
