import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, supportTicketsTable, profilesTable } from "@workspace/db";
import { CreateSupportTicketBody } from "@workspace/api-zod";
import { requireAuth, requireRole } from "../middlewares/authMiddleware";

const router: IRouter = Router();

function serializeTicket(ticket: typeof supportTicketsTable.$inferSelect, user?: typeof profilesTable.$inferSelect | null) {
  return {
    id: ticket.id,
    userId: ticket.userId,
    issueType: ticket.issueType,
    message: ticket.message,
    status: ticket.status,
    createdAt: ticket.createdAt.toISOString(),
    userFullName: user?.fullName,
  };
}

router.get("/support", requireAuth, async (req, res): Promise<void> => {
  if (req.userRole === "admin") {
    const rows = await db
      .select({ ticket: supportTicketsTable, user: profilesTable })
      .from(supportTicketsTable)
      .leftJoin(profilesTable, eq(supportTicketsTable.userId, profilesTable.id))
      .orderBy(desc(supportTicketsTable.createdAt));
    res.json(rows.map(({ ticket, user }) => serializeTicket(ticket, user)));
  } else {
    const rows = await db
      .select({ ticket: supportTicketsTable, user: profilesTable })
      .from(supportTicketsTable)
      .leftJoin(profilesTable, eq(supportTicketsTable.userId, profilesTable.id))
      .where(eq(supportTicketsTable.userId, req.userId!))
      .orderBy(desc(supportTicketsTable.createdAt));
    res.json(rows.map(({ ticket, user }) => serializeTicket(ticket, user)));
  }
});

router.post("/support", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateSupportTicketBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [ticket] = await db.insert(supportTicketsTable).values({
    userId: req.userId!,
    issueType: parsed.data.issueType,
    message: parsed.data.message,
    status: "open",
  }).returning();
  const [user] = await db.select().from(profilesTable).where(eq(profilesTable.id, req.userId!));
  res.status(201).json(serializeTicket(ticket, user));
});

export default router;
