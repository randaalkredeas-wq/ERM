import { z } from "zod";

import { PaginationQuerySchema } from "@/lib/validation/common";

export const ApprovalListQuerySchema = PaginationQuerySchema.extend({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
});

export const ApprovalDecisionSchema = z.object({
  status: z.enum(["approved", "rejected"]),
});
