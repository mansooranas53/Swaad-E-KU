import { Router, type IRouter } from "express";
import { eq, and, desc, sql } from "drizzle-orm";
import { db, ordersTable, orderItemsTable, menuItemsTable, profilesTable } from "@workspace/db";
import {
  CreateOrderBody,
  UpdateOrderStatusBody,
  UpdateOrderStatusParams,
  GetOrderParams,
  CancelOrderParams,
  ListOrdersQueryParams,
} from "@workspace/api-zod";
import { requireAuth, requireRole } from "../middlewares/authMiddleware";

const router: IRouter = Router();

function serializeOrder(order: typeof ordersTable.$inferSelect, user?: typeof profilesTable.$inferSelect | null) {
  return {
    ...order,
    totalAmount: parseFloat(order.totalAmount as unknown as string),
    createdAt: order.createdAt.toISOString(),
    userFullName: user?.fullName,
    userEmail: user?.email,
  };
}

router.get("/orders", requireAuth, async (req, res): Promise<void> => {
  const params = ListOrdersQueryParams.safeParse(req.query);
  const conditions: ReturnType<typeof eq>[] = [];

  if (req.userRole === "student") {
    conditions.push(eq(ordersTable.userId, req.userId!));
  }
  if (params.success && params.data.status) {
    conditions.push(eq(ordersTable.status, params.data.status as typeof ordersTable.$inferSelect["status"]));
  }

  const orders = await db
    .select({
      order: ordersTable,
      user: profilesTable,
    })
    .from(ordersTable)
    .leftJoin(profilesTable, eq(ordersTable.userId, profilesTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(ordersTable.createdAt));

  res.json(orders.map(({ order, user }) => serializeOrder(order, user)));
});

router.post("/orders", requireAuth, requireRole("student"), async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { pickupTime, items } = parsed.data;

  // Calculate total and validate items
  let totalAmount = 0;
  const itemDetails: Array<{ menuItem: typeof menuItemsTable.$inferSelect; quantity: number }> = [];
  for (const item of items) {
    const [menuItem] = await db.select().from(menuItemsTable).where(eq(menuItemsTable.id, item.menuItemId));
    if (!menuItem || !menuItem.available) {
      res.status(400).json({ error: `Menu item ${item.menuItemId} not available` });
      return;
    }
    totalAmount += parseFloat(menuItem.price as unknown as string) * item.quantity;
    itemDetails.push({ menuItem, quantity: item.quantity });
  }

  // Generate token number (today's orders count + 1)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(ordersTable)
    .where(sql`${ordersTable.createdAt} >= ${todayStart}`);
  const tokenNumber = (Number(countResult?.count ?? 0)) + 1;

  const [order] = await db.insert(ordersTable).values({
    userId: req.userId!,
    tokenNumber,
    pickupTime,
    status: "pending",
    totalAmount: String(totalAmount),
  }).returning();

  // Insert order items
  for (const { menuItem, quantity } of itemDetails) {
    await db.insert(orderItemsTable).values({
      orderId: order.id,
      menuItemId: menuItem.id,
      quantity,
      price: menuItem.price,
    });
  }

  const [user] = await db.select().from(profilesTable).where(eq(profilesTable.id, req.userId!));
  res.status(201).json(serializeOrder(order, user));
});

router.get("/orders/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [orderRow] = await db
    .select({ order: ordersTable, user: profilesTable })
    .from(ordersTable)
    .leftJoin(profilesTable, eq(ordersTable.userId, profilesTable.id))
    .where(
      req.userRole === "student"
        ? and(eq(ordersTable.id, params.data.id), eq(ordersTable.userId, req.userId!))
        : eq(ordersTable.id, params.data.id)
    );

  if (!orderRow) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const orderItems = await db
    .select({ item: orderItemsTable, menuItem: menuItemsTable })
    .from(orderItemsTable)
    .leftJoin(menuItemsTable, eq(orderItemsTable.menuItemId, menuItemsTable.id))
    .where(eq(orderItemsTable.orderId, orderRow.order.id));

  res.json({
    ...serializeOrder(orderRow.order, orderRow.user),
    items: orderItems.map(({ item, menuItem }) => ({
      id: item.id,
      orderId: item.orderId,
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      price: parseFloat(item.price as unknown as string),
      menuItemName: menuItem?.name,
    })),
  });
});

router.patch("/orders/:id", requireAuth, requireRole("staff", "admin"), async (req, res): Promise<void> => {
  const params = UpdateOrderStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [order] = await db
    .update(ordersTable)
    .set({ status: parsed.data.status as typeof ordersTable.$inferSelect["status"] })
    .where(eq(ordersTable.id, params.data.id))
    .returning();
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  const [user] = await db.select().from(profilesTable).where(eq(profilesTable.id, order.userId));
  res.json(serializeOrder(order, user));
});

router.post("/orders/:id/cancel", requireAuth, async (req, res): Promise<void> => {
  const params = CancelOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const condition = req.userRole === "student"
    ? and(eq(ordersTable.id, params.data.id), eq(ordersTable.userId, req.userId!))
    : eq(ordersTable.id, params.data.id);
  const [existing] = await db.select().from(ordersTable).where(condition);
  if (!existing) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  if (existing.status !== "pending") {
    res.status(400).json({ error: "Only pending orders can be cancelled" });
    return;
  }
  const [order] = await db.update(ordersTable).set({ status: "cancelled" }).where(eq(ordersTable.id, params.data.id)).returning();
  const [user] = await db.select().from(profilesTable).where(eq(profilesTable.id, order.userId));
  res.json(serializeOrder(order, user));
});

export default router;
