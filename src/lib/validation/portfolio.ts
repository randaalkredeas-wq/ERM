import { z } from "zod";

import { PaginationQuerySchema } from "@/lib/validation/common";

export const ExposureListQuerySchema = PaginationQuerySchema.extend({
  segment: z.string().trim().optional(),
  sector: z.string().trim().optional(),
  eclStage: z.enum(["stage-1", "stage-2", "stage-3"]).optional(),
  collectionStatus: z
    .enum([
      "current",
      "in-collections",
      "restructured",
      "legal",
      "written-off",
      "recovered",
    ])
    .optional(),
});
