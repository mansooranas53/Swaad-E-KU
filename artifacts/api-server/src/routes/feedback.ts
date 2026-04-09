import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, feedbackTable, profilesTable } from "@workspace/db";
import { SubmitFeedbackBody } from "@workspace/api-zod";
import { requireAuth, requireRole } from "../middlewares/authMiddleware";

const router: IRouter = Router();

router.get("/feedback", requireAuth, requireRole("admin"), async (req, res): Promise<void> => {
  const rows = await db
    .select({ feedback: feedbackTable, user: profilesTable })
    .from(feedbackTable)
    .leftJoin(profilesTable, eq(feedbackTable.userId, profilesTable.id))
    .orderBy(desc(feedbackTable.createdAt));

  res.json(rows.map(({ feedback, user }) => ({
    id: feedback.id,
    userId: feedback.userId,
    rating: feedback.rating,
    message: feedback.message,
    createdAt: feedback.createdAt.toISOString(),
    userFullName: user?.fullName,
  })));
});

router.post("/feedback", requireAuth, async (req, res): Promise<void> => {
  const parsed = SubmitFeedbackBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [feedback] = await db.insert(feedbackTable).values({
    userId: req.userId!,
    rating: parsed.data.rating,
    message: parsed.data.message,
  }).returning();
  const [user] = await db.select().from(profilesTable).where(eq(profilesTable.id, req.userId!));
  res.status(201).json({
    id: feedback.id,
    userId: feedback.userId,
    rating: feedback.rating,
    message: feedback.message,
    createdAt: feedback.createdAt.toISOString(),
    userFullName: user?.fullName,
  });
});

export default router;
