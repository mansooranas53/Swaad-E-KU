import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, predictionsTable } from "@workspace/db";
import { ListPredictionsQueryParams } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/authMiddleware";

const router: IRouter = Router();

function serializePrediction(p: typeof predictionsTable.$inferSelect) {
  return {
    ...p,
    confidence: parseFloat(p.confidence as unknown as string),
    createdAt: p.createdAt.toISOString(),
  };
}

router.get("/predictions", requireAuth, async (req, res): Promise<void> => {
  const params = ListPredictionsQueryParams.safeParse(req.query);
  const date = params.success && params.data.date ? params.data.date : undefined;

  const predictions = date
    ? await db.select().from(predictionsTable).where(eq(predictionsTable.date, date))
    : await db.select().from(predictionsTable).orderBy(predictionsTable.date);

  res.json(predictions.map(serializePrediction));
});

export default router;
