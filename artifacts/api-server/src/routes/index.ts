import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import menuRouter from "./menu";
import ordersRouter from "./orders";
import predictionsRouter from "./predictions";
import feedbackRouter from "./feedback";
import supportRouter from "./support";
import usersRouter from "./users";
import analyticsRouter from "./analytics";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(menuRouter);
router.use(ordersRouter);
router.use(predictionsRouter);
router.use(feedbackRouter);
router.use(supportRouter);
router.use(usersRouter);
router.use(analyticsRouter);

export default router;
