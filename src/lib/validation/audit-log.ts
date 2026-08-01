import { z } from "zod";

import { PaginationQuerySchema } from "@/lib/validation/common";

export const AuditLogQuerySchema = PaginationQuerySchema.extend({
  module: z.string().trim().optional(),
  userId: z.string().trim().optional(),
  dateFrom: z.string().trim().optional(),
  dateTo: z.string().trim().optional(),
});
