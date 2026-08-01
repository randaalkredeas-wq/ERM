import { NextResponse, type NextRequest } from "next/server";

import { Prisma } from "@/generated/prisma/client";
import {
  BadRequestError,
  handleApiError,
  logAudit,
  requireApiUser,
} from "@/lib/api-utils";
import { hashPassword } from "@/lib/auth";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { serializeUser } from "@/lib/serializers/user";
import { toUpperSnake } from "@/lib/serializers/risk";
import { paginate } from "@/lib/validation/common";
import { UserCreateSchema, UserListQuerySchema } from "@/lib/validation/user";

export async function GET(request: NextRequest) {
  try {
    const user = await requireApiUser();
    requirePermission(user.role, "users", "view");

    const query = UserListQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams),
    );

    const where: Prisma.UserWhereInput = {
      ...(query.role ? { role: query.role } : {}),
      ...(query.status ? { status: toUpperSnake(query.status) as never } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: "insensitive" } },
              { email: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [total, rows] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { name: "asc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
    ]);

    return NextResponse.json({
      data: rows.map(serializeUser),
      pagination: paginate(query.page, query.pageSize, total),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await requireApiUser();
    requirePermission(actor.role, "users", "create");

    const body = UserCreateSchema.parse(await request.json());
    const email = body.email.trim().toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new BadRequestError("A user with that email already exists.");

    const passwordHash = await hashPassword(body.password);
    const created = await prisma.user.create({
      data: {
        name: body.name,
        email,
        passwordHash,
        role: body.role,
        jobTitle: body.jobTitle,
        department: body.department,
      },
    });

    await logAudit({
      userId: actor.id,
      action: "Created user",
      module: "Users",
      details: `${created.name} (${created.email})`,
    });

    return NextResponse.json({ data: serializeUser(created) }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
