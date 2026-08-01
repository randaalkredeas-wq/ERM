import { z } from "zod";

const score = z.number().int().min(1).max(5);

export const RiskFormSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(4000),
  department: z.string().trim().min(1),
  category: z.string().trim().min(1),
  subcategory: z.string().trim().min(1),
  riskSource: z.string().trim().min(1),
  riskType: z.string().trim().min(1),
  strategicObjective: z.string().trim().min(1),
  rootCause: z.string().trim().min(1).max(4000),
  consequences: z.string().trim().min(1).max(4000),
  existingControls: z.string().trim().min(1).max(4000),
  controlEffectiveness: z.enum([
    "ineffective",
    "partially-effective",
    "effective",
    "highly-effective",
  ]),
  inherentLikelihood: score,
  inherentImpact: score,
  likelihood: score,
  impact: score,
  targetLikelihood: score,
  targetImpact: score,
  riskTreatment: z.enum(["accept", "mitigate", "transfer", "avoid"]),
  reviewFrequency: z.enum(["monthly", "quarterly", "semi-annual", "annual"]),
  nextReviewDate: z.string().min(1),
  owner: z.string().trim().min(1),
  status: z.enum(["open", "mitigating", "closed"]),
  dueDate: z.string().min(1),
});

export type RiskFormPayload = z.infer<typeof RiskFormSchema>;

export const RiskListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(25),
  search: z.string().trim().optional(),
  department: z.string().trim().optional(),
  category: z.string().trim().optional(),
  status: z.enum(["open", "mitigating", "closed"]).optional(),
  workflowStatus: z
    .enum(["draft", "under-review", "approved", "rejected", "closed"])
    .optional(),
  ownerId: z.string().trim().optional(),
  archived: z.coerce.boolean().optional(),
});

export const CommentSchema = z.object({
  message: z.string().trim().min(1).max(2000),
});

export const WorkflowTransitionSchema = z.object({
  toStatus: z.enum(["draft", "under-review", "approved", "rejected", "closed"]),
  comment: z.string().trim().max(2000).optional(),
});

export const ArchiveSchema = z.object({
  archived: z.boolean(),
});

export const TreatmentActionSchema = z.object({
  title: z.string().trim().min(1).max(300),
  owner: z.string().trim().min(1),
  dueDate: z.string().min(1),
  status: z.enum(["not-started", "in-progress", "completed"]),
  progress: z.number().int().min(0).max(100),
});

export const TreatmentActionPatchSchema = TreatmentActionSchema.partial();
