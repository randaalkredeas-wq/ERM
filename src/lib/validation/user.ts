import { z } from "zod";

import { PaginationQuerySchema } from "@/lib/validation/common";

const RoleSchema = z.enum([
  "SYSTEM_ADMIN",
  "CRO",
  "DEPARTMENT_MANAGER",
  "RISK_OWNER",
  "EMPLOYEE",
  "AUDITOR",
  "READONLY_EXECUTIVE",
]);

export const UserListQuerySchema = PaginationQuerySchema.extend({
  role: RoleSchema.optional(),
  status: z.enum(["active", "inactive", "invited"]).optional(),
});

export const UserCreateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email(),
  password: z.string().min(8).max(200),
  role: RoleSchema,
  jobTitle: z.string().trim().max(200).optional(),
  department: z.string().trim().max(200).optional(),
});

export const UserUpdateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  role: RoleSchema.optional(),
  jobTitle: z.string().trim().max(200).optional(),
  department: z.string().trim().max(200).optional(),
  status: z.enum(["active", "inactive", "invited"]).optional(),
});
