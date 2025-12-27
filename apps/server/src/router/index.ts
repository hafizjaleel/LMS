import { OpenAPIHono } from "@hono/zod-openapi";
import authRouter from "./auth";
import userRouter from "./user";
import courseRouter from "./course";
import moduleRouter from "./module";
import lessonRouter from "./lessons";
import quizRouter from "./quiz";
import appRouter from "./app";
import reviewRouter from "./review";
import webinarRouter from "./webinar";
import pushRouter from "./push";

const router = new OpenAPIHono();

router.route("/auth", authRouter);
// version 1 routes
router.route("/v1/user", userRouter);
router.route("/v1/app",appRouter)
router.route("/v1/course",courseRouter)
router.route("/v1/module",moduleRouter)
router.route("/v1/lesson",lessonRouter)
router.route("/v1/quiz",quizRouter)
router.route("/v1/review",reviewRouter)
router.route("/v1/webinar",webinarRouter)
router.route("/v1/api/push", pushRouter);



export default router;
