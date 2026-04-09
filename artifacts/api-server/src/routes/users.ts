import { Router, type IRouter } from "express";
import { db, profilesTable } from "@workspace/db";
import { requireAuth, requireRole } from "../middlewares/authMiddleware";
import { desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/users", requireAuth, requireRole("admin"), async (req, res): Promise<void> => {
  const users = await db.select({
    id: profilesTable.id,
    fullName: profilesTable.fullName,
    email: profilesTable.email,
    role: profilesTable.role,
    createdAt: profilesTable.createdAt,
  }).from(profilesTable).orderBy(desc(profilesTable.createdAt));

  res.json(users.map(u => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
  })));
});

export default router;
