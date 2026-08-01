import { z } from "zod";

import { PaginationQuerySchema } from "@/lib/validation/common";

export const IncidentCreateSchema = z.object({
  title: z.string().trim().min(1).max(300),
  category: z.string().trim().min(1),
  severity: z.enum(["low", "medium", "high", "critical"]),
  status: z.enum(["open", "in-progress", "resolved"]).default("open"),
});

export const IncidentListQuerySchema = PaginationQuerySchema.extend({
  status: z.enum(["open", "in-progress", "resolved"]).optional(),
  severity: z.enum(["low", "medium", "high", "critical"]).optional(),
  category: z.string().trim().optional(),
});
