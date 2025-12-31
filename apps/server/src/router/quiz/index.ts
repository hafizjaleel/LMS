import { OpenAPIHono } from "@hono/zod-openapi";
import { 
  createQuizRoute,
  addQuestionToQuizRoute,
  updateQuizRoute,
  updateQuestionRoute,
  listQuizzesAdminRoute, 
  listQuizzesUserRoute, 
  getQuizByIdAdminRoute, 
  getQuizByIdUserRoute, 
  deleteQuizRoute,
  deleteQuestionRoute,
  submitQuizAnswerRoute
} from "./route";
import { 
  createQuizController,
  addQuestionToQuizController,
  updateQuizController,
  updateQuestionController,
  listQuizzesAdminController, 
  listQuizzesUserController, 
  getQuizByIdAdminController, 
  getQuizByIdUserController, 
  deleteQuizController,
  deleteQuestionController,
  submitQuizAnswerController
} from "./controller";
import { authMiddleware, adminMiddleware } from "../../middleware/auth.middleware";

const quizRouter = new OpenAPIHono();

// Apply authentication to all routes
// quizRouter.use("*", authMiddleware);
// Admin routes (require admin role - includes correct answers)
// quizRouter.use("/admin", adminMiddleware);
quizRouter.openapi(listQuizzesAdminRoute, listQuizzesAdminController);
quizRouter.openapi(getQuizByIdAdminRoute, getQuizByIdAdminController);
quizRouter.openapi(createQuizRoute, createQuizController);
quizRouter.openapi(addQuestionToQuizRoute, addQuestionToQuizController);
quizRouter.openapi(updateQuizRoute, updateQuizController);
quizRouter.openapi(updateQuestionRoute, updateQuestionController);
// quizRouter.use("/:id", adminMiddleware);
quizRouter.openapi(deleteQuizRoute, deleteQuizController);
quizRouter.openapi(deleteQuestionRoute, deleteQuestionController);

// User routes (authenticated users - no correct answers exposed)
quizRouter.openapi(listQuizzesUserRoute, listQuizzesUserController);
quizRouter.openapi(getQuizByIdUserRoute, getQuizByIdUserController);
quizRouter.openapi(submitQuizAnswerRoute, submitQuizAnswerController);


export default quizRouter;
