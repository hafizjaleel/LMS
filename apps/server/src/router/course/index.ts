import { OpenAPIHono } from "@hono/zod-openapi";
import {
  createCourseRoute,
  updateCourseRoute,
  deleteCourseRoute,
  getCourseAdminRoute,
  getCourseUserRoute,
  listCoursesAdminRoute,
  listCoursesUserRoute,
  enrollCourseRoute,
  listEnrollmentsRoute,
  courseCompleteRoute,
} from "./route";
import { 
  createCourseController, 
  deleteCourseController, 
  enrollCourseController, 
  getCourseAdminController, 
  getCourseUserController, 
  listCoursesAdminController, 
  listCoursesUserController,
  listEnrollmentsController,
  markCourseCompletedController,
  updateCourseController 
} from "./controller";
import { authMiddleware, adminMiddleware } from "../../middleware/auth.middleware";


const courseRouter = new OpenAPIHono();

// Apply authentication to all routes
courseRouter.use("*", authMiddleware);

// Admin-only routes (require admin role)
// courseRouter.use("/", adminMiddleware);
courseRouter.openapi(createCourseRoute, createCourseController);
// courseRouter.use("/:id", adminMiddleware);
courseRouter.openapi(updateCourseRoute, updateCourseController);
courseRouter.openapi(deleteCourseRoute, deleteCourseController);
// courseRouter.use("/admin/*", adminMiddleware);
courseRouter.openapi(listCoursesAdminRoute, listCoursesAdminController);
courseRouter.openapi(getCourseAdminRoute, getCourseAdminController);

// User routes (already authenticated via global middleware)
courseRouter.openapi(enrollCourseRoute, enrollCourseController);
courseRouter.openapi(listEnrollmentsRoute, listEnrollmentsController);
courseRouter.openapi(listCoursesUserRoute, listCoursesUserController);
courseRouter.openapi(getCourseUserRoute, getCourseUserController);

courseRouter.openapi(courseCompleteRoute,markCourseCompletedController)

export default courseRouter;