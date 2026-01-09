import { OpenAPIHono } from "@hono/zod-openapi";
import { createLessonRoute, updateLessonRoute, listLessonsRoute, getLessonByIdRoute, deleteLessonRoute, markLessonCompletedRoute, createLessonCommentRoute, listLessonCommentsRoute, getLessonCommentRoute, updateLessonCommentRoute, deleteLessonCommentRoute, requestVideoUploadRoute, muxWebhookRoute } from "./routes";
import { createLessonController, updateLessonController, listLessonsController, getLessonByIdController, deleteLessonController, markLessonCompletedController, createLessonCommentController, listLessonCommentsController, getLessonCommentController, updateLessonCommentController, deleteLessonCommentController, requestVideoUploadController, muxWebhookController } from "./controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const lessonRouter = new OpenAPIHono();

// Apply authentication to all routes
// lessonRouter.use("*", async (c, next) => {
//   // Skip auth for webhook endpoint
//   if (c.req.path.includes("/webhooks/mux")) {
//     return next();
//   }
//   return authMiddleware(c, next);
// });

// ===================== VIDEO UPLOAD ROUTES =====================

// Request video upload URL (authenticated users)
lessonRouter.openapi(requestVideoUploadRoute, requestVideoUploadController);

// Mux webhook (no auth required)
lessonRouter.openapi(muxWebhookRoute, muxWebhookController);


// Create lesson route (authenticated users)
lessonRouter.openapi(createLessonRoute, createLessonController);

// Update lesson route (authenticated users)
lessonRouter.openapi(updateLessonRoute, updateLessonController);

// List lessons route (authenticated users)
lessonRouter.openapi(listLessonsRoute, listLessonsController);

// ===================== LESSON COMMENT ROUTES =====================

// Create lesson comment route (authenticated users)
lessonRouter.openapi(createLessonCommentRoute, createLessonCommentController);

// List lesson comments route (authenticated users)
lessonRouter.openapi(listLessonCommentsRoute, listLessonCommentsController);

// Get lesson comment by ID route (authenticated users)
lessonRouter.openapi(getLessonCommentRoute, getLessonCommentController);

// Update lesson comment route (authenticated users)
lessonRouter.openapi(updateLessonCommentRoute, updateLessonCommentController);

// Delete lesson comment route (authenticated users)
lessonRouter.openapi(deleteLessonCommentRoute, deleteLessonCommentController);

// Get lesson by ID route (authenticated users)
lessonRouter.openapi(getLessonByIdRoute, getLessonByIdController);

// Delete lesson route (authenticated users)
lessonRouter.openapi(deleteLessonRoute, deleteLessonController);

// Mark lesson as completed route (authenticated users)
lessonRouter.openapi(markLessonCompletedRoute, markLessonCompletedController);

export default lessonRouter;
