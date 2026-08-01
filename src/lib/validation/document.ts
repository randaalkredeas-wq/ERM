import { z } from "zod";

import { PaginationQuerySchema } from "@/lib/validation/common";

export const DocumentListQuerySchema = PaginationQuerySchema.extend({
  category: z.string().trim().optional(),
});
