import { z } from "zod";

import { PaginationQuerySchema } from "@/lib/validation/common";

export const KriListQuerySchema = PaginationQuerySchema.extend({
  status: z.enum(["on-track", "at-risk", "breached"]).optional(),
  category: z.string().trim().optional(),
});
