import { pgTable, text, serial, timestamp, integer, numeric, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const wasteRiskEnum = pgEnum("waste_risk", ["low", "medium", "high"]);
export const trendEnum = pgEnum("trend", ["up", "down", "stable"]);

export const predictionsTable = pgTable("predictions", {
  id: serial("id").primaryKey(),
  itemName: text("item_name").notNull(),
  predictedQuantity: integer("predicted_quantity").notNull(),
  confidence: numeric("confidence", { precision: 5, scale: 2 }).notNull(),
  wasteRisk: wasteRiskEnum("waste_risk").notNull().default("low"),
  yesterdaySold: integer("yesterday_sold").notNull(),
  trend: trendEnum("trend").notNull().default("stable"),
  date: text("date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPredictionSchema = createInsertSchema(predictionsTable).omit({ id: true, createdAt: true });
export type InsertPrediction = z.infer<typeof insertPredictionSchema>;
export type Prediction = typeof predictionsTable.$inferSelect;
