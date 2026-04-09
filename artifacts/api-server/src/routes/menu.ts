import { Router, type IRouter } from "express";
import { eq, and, ilike, sql } from "drizzle-orm";
import { db, menuItemsTable } from "@workspace/db";
import {
  CreateMenuItemBody,
  UpdateMenuItemBody,
  GetMenuItemParams,
  UpdateMenuItemParams,
  DeleteMenuItemParams,
  ListMenuItemsQueryParams,
} from "@workspace/api-zod";
import { requireAuth, requireRole } from "../middlewares/authMiddleware";

const router: IRouter = Router();

function serializeItem(item: typeof menuItemsTable.$inferSelect) {
  return {
    ...item,
    price: parseFloat(item.price as unknown as string),
    imageUrl: item.imageUrl ?? undefined,
    createdAt: item.createdAt.toISOString(),
  };
}

router.get("/menu", async (req, res): Promise<void> => {
  const params = ListMenuItemsQueryParams.safeParse(req.query);
  const conditions = [];
  if (params.success) {
    if (params.data.category) conditions.push(eq(menuItemsTable.category, params.data.category));
    if (params.data.available !== undefined) conditions.push(eq(menuItemsTable.available, params.data.available));
    if (params.data.search) conditions.push(ilike(menuItemsTable.name, `%${params.data.search}%`));
  }
  const items = await db.select().from(menuItemsTable).where(conditions.length > 0 ? and(...conditions) : undefined).orderBy(menuItemsTable.name);
  res.json(items.map(serializeItem));
});

router.post("/menu", requireAuth, requireRole("admin"), async (req, res): Promise<void> => {
  const parsed = CreateMenuItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db.insert(menuItemsTable).values({
    ...parsed.data,
    price: String(parsed.data.price),
    imageUrl: parsed.data.imageUrl ?? null,
  }).returning();
  res.status(201).json(serializeItem(item));
});

router.get("/menu/:id", async (req, res): Promise<void> => {
  const params = GetMenuItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [item] = await db.select().from(menuItemsTable).where(eq(menuItemsTable.id, params.data.id));
  if (!item) {
    res.status(404).json({ error: "Menu item not found" });
    return;
  }
  res.json(serializeItem(item));
});

router.put("/menu/:id", requireAuth, requireRole("admin"), async (req, res): Promise<void> => {
  const params = UpdateMenuItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateMenuItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.price !== undefined) updateData.price = String(parsed.data.price);
  if (parsed.data.imageUrl !== undefined) updateData.imageUrl = parsed.data.imageUrl ?? null;
  const [item] = await db.update(menuItemsTable).set(updateData).where(eq(menuItemsTable.id, params.data.id)).returning();
  if (!item) {
    res.status(404).json({ error: "Menu item not found" });
    return;
  }
  res.json(serializeItem(item));
});

router.delete("/menu/:id", requireAuth, requireRole("admin"), async (req, res): Promise<void> => {
  const params = DeleteMenuItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [item] = await db.delete(menuItemsTable).where(eq(menuItemsTable.id, params.data.id)).returning();
  if (!item) {
    res.status(404).json({ error: "Menu item not found" });
    return;
  }
  res.json({ message: "Deleted successfully" });
});

export default router;
